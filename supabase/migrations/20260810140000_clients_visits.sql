-- Slice 2: clients + visits + visit_items + atomic create_visit / void_visit RPCs.
--
-- DEPENDENCY: public.is_staff() from 20260810120000_staff_profiles.sql
--             public.services_catalog from 20260810130000_services_catalog.sql
-- Apply after those migrations. Money math is validated in Next.js via lib/pos
-- before RPC; DB checks enforce non-negative integers and net = subtotal - discount.

-- ─── clients ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clients (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  phone_e164     text NOT NULL,
  phone_display  text NOT NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clients_phone_e164_unique UNIQUE (phone_e164),
  CONSTRAINT clients_phone_e164_format CHECK (phone_e164 ~ '^923[0-9]{9}$'),
  CONSTRAINT clients_name_nonempty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS clients_phone_display_idx ON public.clients (phone_display);
CREATE INDEX IF NOT EXISTS clients_name_idx ON public.clients (lower(name));

COMMENT ON TABLE public.clients IS
  'Salon CRM clients. phone_e164 is canonical 923xxxxxxxxx; phone_display is 03xxxxxxxxx.';

CREATE OR REPLACE FUNCTION public.clients_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clients_updated_at ON public.clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE PROCEDURE public.clients_set_updated_at();

-- ─── visits ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.visits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_ref           text NOT NULL,
  client_id         uuid NOT NULL REFERENCES public.clients (id),
  visit_at          timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'completed'
                      CHECK (status IN ('completed', 'voided')),
  subtotal_pkr      integer NOT NULL CHECK (subtotal_pkr >= 0),
  discount_pkr      integer NOT NULL DEFAULT 0 CHECK (discount_pkr >= 0),
  discount_note     text,
  deal_id           text,
  net_pkr           integer NOT NULL CHECK (net_pkr >= 0),
  payment_mode      text NOT NULL
                      CHECK (payment_mode IN (
                        'Cash', 'JazzCash', 'EasyPaisa', 'Partial', 'Credit'
                      )),
  amount_paid_pkr   integer NOT NULL CHECK (amount_paid_pkr >= 0),
  due_pkr           integer NOT NULL CHECK (due_pkr >= 0),
  notes             text,
  idempotency_key   uuid NOT NULL,
  created_by        uuid REFERENCES auth.users (id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visits_txn_ref_unique UNIQUE (txn_ref),
  CONSTRAINT visits_idempotency_key_unique UNIQUE (idempotency_key),
  CONSTRAINT visits_discount_lte_subtotal CHECK (discount_pkr <= subtotal_pkr),
  CONSTRAINT visits_net_matches CHECK (net_pkr = subtotal_pkr - discount_pkr),
  CONSTRAINT visits_discount_note_required CHECK (
    discount_pkr = 0 OR (discount_note IS NOT NULL AND length(trim(discount_note)) >= 3)
  )
);

CREATE INDEX IF NOT EXISTS visits_visit_at_idx ON public.visits (visit_at DESC);
CREATE INDEX IF NOT EXISTS visits_client_id_idx ON public.visits (client_id);
CREATE INDEX IF NOT EXISTS visits_status_visit_at_idx ON public.visits (status, visit_at DESC);

COMMENT ON TABLE public.visits IS
  'POS tickets. Line snapshots live in visit_items; money fields are locked at save.';
COMMENT ON COLUMN public.visits.txn_ref IS
  'Human ticket id, e.g. 202608-a1b2c3d4 (YYYYMM + short hex).';
COMMENT ON COLUMN public.visits.idempotency_key IS
  'Client-generated UUID; duplicate create returns the existing visit (double-tap safe).';

-- ─── visit_items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.visit_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id             uuid NOT NULL REFERENCES public.visits (id) ON DELETE CASCADE,
  catalog_service_id   integer REFERENCES public.services_catalog (id),
  name_snapshot        text NOT NULL,
  category_snapshot    text,
  unit_price_pkr       integer NOT NULL CHECK (unit_price_pkr >= 0),
  qty                  integer NOT NULL DEFAULT 1 CHECK (qty >= 1),
  is_from_price        boolean NOT NULL DEFAULT false,
  final_price_pkr      integer NOT NULL CHECK (final_price_pkr >= 0),
  CONSTRAINT visit_items_name_nonempty CHECK (length(trim(name_snapshot)) > 0),
  CONSTRAINT visit_items_final_gte_unit CHECK (
    NOT is_from_price OR final_price_pkr >= unit_price_pkr
  )
);

CREATE INDEX IF NOT EXISTS visit_items_visit_id_idx ON public.visit_items (visit_id);

COMMENT ON TABLE public.visit_items IS
  'Immutable line snapshots for a visit. catalog_service_id null = custom line.';

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_staff_all ON public.clients;
DROP POLICY IF EXISTS visits_staff_all ON public.visits;
DROP POLICY IF EXISTS visit_items_staff_all ON public.visit_items;

DO $$
DECLARE
  staff_pred text;
BEGIN
  IF to_regprocedure('public.is_staff()') IS NOT NULL THEN
    staff_pred := 'public.is_staff()';
  ELSE
    RAISE NOTICE
      'public.is_staff() missing — clients/visits RLS stubbed to deny-all';
    staff_pred := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY clients_staff_all ON public.clients FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
  EXECUTE format(
    'CREATE POLICY visits_staff_all ON public.visits FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
  EXECUTE format(
    'CREATE POLICY visit_items_staff_all ON public.visit_items FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visit_items TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.visits TO service_role;
GRANT ALL ON public.visit_items TO service_role;
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.visits FROM anon;
REVOKE ALL ON public.visit_items FROM anon;

-- ─── helpers ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_txn_ref(p_at timestamptz DEFAULT now())
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  ym text;
  suffix text;
BEGIN
  ym := to_char(timezone('Asia/Karachi', p_at), 'YYYYMM');
  suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  RETURN ym || '-' || suffix;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_txn_ref(timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.generate_txn_ref(timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_txn_ref(timestamptz) TO service_role;

-- ─── create_visit (atomic + idempotent) ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_visit(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff boolean;
  v_key uuid;
  v_existing public.visits%ROWTYPE;
  v_client_id uuid;
  v_visit_at timestamptz;
  v_subtotal integer;
  v_discount integer;
  v_discount_note text;
  v_deal_id text;
  v_net integer;
  v_mode text;
  v_paid integer;
  v_due integer;
  v_notes text;
  v_items jsonb;
  v_item jsonb;
  v_visit_id uuid;
  v_txn text;
  v_attempt int;
  v_created_by uuid;
  v_sum_lines integer;
BEGIN
  SELECT public.is_staff() INTO v_staff;
  IF NOT COALESCE(v_staff, false) THEN
    RAISE EXCEPTION 'not_staff' USING ERRCODE = '42501';
  END IF;

  v_created_by := auth.uid();
  v_key := (payload->>'idempotency_key')::uuid;
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'idempotency_key required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_existing
  FROM public.visits
  WHERE idempotency_key = v_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'visit_id', v_existing.id,
      'txn_ref', v_existing.txn_ref
    );
  END IF;

  v_client_id := (payload->>'client_id')::uuid;
  IF v_client_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.clients c WHERE c.id = v_client_id
  ) THEN
    RAISE EXCEPTION 'client_id invalid' USING ERRCODE = '22023';
  END IF;

  v_visit_at := COALESCE((payload->>'visit_at')::timestamptz, now());
  v_subtotal := (payload->>'subtotal_pkr')::integer;
  v_discount := COALESCE((payload->>'discount_pkr')::integer, 0);
  v_discount_note := NULLIF(trim(COALESCE(payload->>'discount_note', '')), '');
  v_deal_id := NULLIF(trim(COALESCE(payload->>'deal_id', '')), '');
  v_net := (payload->>'net_pkr')::integer;
  v_mode := payload->>'payment_mode';
  v_paid := (payload->>'amount_paid_pkr')::integer;
  v_due := (payload->>'due_pkr')::integer;
  v_notes := NULLIF(trim(COALESCE(payload->>'notes', '')), '');
  v_items := COALESCE(payload->'items', '[]'::jsonb);

  IF jsonb_typeof(v_items) <> 'array' OR jsonb_array_length(v_items) < 1 THEN
    RAISE EXCEPTION 'items required' USING ERRCODE = '22023';
  END IF;

  IF v_subtotal IS NULL OR v_net IS NULL OR v_paid IS NULL OR v_due IS NULL THEN
    RAISE EXCEPTION 'money fields required' USING ERRCODE = '22023';
  END IF;

  IF v_net <> v_subtotal - v_discount THEN
    RAISE EXCEPTION 'net_pkr mismatch' USING ERRCODE = '22023';
  END IF;

  IF v_due <> GREATEST(0, v_net - v_paid) THEN
    RAISE EXCEPTION 'due_pkr mismatch' USING ERRCODE = '22023';
  END IF;

  IF v_discount > 0 AND (v_discount_note IS NULL OR length(v_discount_note) < 3) THEN
    RAISE EXCEPTION 'discount_note required' USING ERRCODE = '22023';
  END IF;

  v_sum_lines := 0;
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    IF COALESCE((v_item->>'final_price_pkr')::integer, -1) < 0
       OR COALESCE((v_item->>'qty')::integer, 0) < 1 THEN
      RAISE EXCEPTION 'invalid item money' USING ERRCODE = '22023';
    END IF;
    IF COALESCE((v_item->>'is_from_price')::boolean, false)
       AND (v_item->>'final_price_pkr')::integer < COALESCE((v_item->>'unit_price_pkr')::integer, 0) THEN
      RAISE EXCEPTION 'final below floor' USING ERRCODE = '22023';
    END IF;
    v_sum_lines := v_sum_lines
      + (v_item->>'final_price_pkr')::integer * (v_item->>'qty')::integer;
  END LOOP;

  IF v_sum_lines <> v_subtotal THEN
    RAISE EXCEPTION 'subtotal_pkr mismatch vs items' USING ERRCODE = '22023';
  END IF;

  v_attempt := 0;
  LOOP
    v_attempt := v_attempt + 1;
    v_txn := public.generate_txn_ref(v_visit_at);
    BEGIN
      INSERT INTO public.visits (
        txn_ref, client_id, visit_at, status,
        subtotal_pkr, discount_pkr, discount_note, deal_id,
        net_pkr, payment_mode, amount_paid_pkr, due_pkr,
        notes, idempotency_key, created_by
      ) VALUES (
        v_txn, v_client_id, v_visit_at, 'completed',
        v_subtotal, v_discount, v_discount_note, v_deal_id,
        v_net, v_mode, v_paid, v_due,
        v_notes, v_key, v_created_by
      )
      RETURNING id INTO v_visit_id;
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        SELECT * INTO v_existing
        FROM public.visits
        WHERE idempotency_key = v_key;
        IF FOUND THEN
          RETURN jsonb_build_object(
            'ok', true,
            'idempotent', true,
            'visit_id', v_existing.id,
            'txn_ref', v_existing.txn_ref
          );
        END IF;
        IF v_attempt >= 5 THEN
          RAISE;
        END IF;
    END;
  END LOOP;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    INSERT INTO public.visit_items (
      visit_id,
      catalog_service_id,
      name_snapshot,
      category_snapshot,
      unit_price_pkr,
      qty,
      is_from_price,
      final_price_pkr
    ) VALUES (
      v_visit_id,
      NULLIF(v_item->>'catalog_service_id', '')::integer,
      trim(v_item->>'name_snapshot'),
      NULLIF(trim(COALESCE(v_item->>'category_snapshot', '')), ''),
      COALESCE((v_item->>'unit_price_pkr')::integer, 0),
      COALESCE((v_item->>'qty')::integer, 1),
      COALESCE((v_item->>'is_from_price')::boolean, false),
      (v_item->>'final_price_pkr')::integer
    );
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'visit_id', v_visit_id,
    'txn_ref', v_txn
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_visit(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_visit(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_visit(jsonb) TO service_role;

-- ─── void_visit ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.void_visit(p_visit_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff boolean;
  v_row public.visits%ROWTYPE;
BEGIN
  SELECT public.is_staff() INTO v_staff;
  IF NOT COALESCE(v_staff, false) THEN
    RAISE EXCEPTION 'not_staff' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.visits WHERE id = p_visit_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'visit not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.status = 'voided' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'already_voided', true,
      'visit_id', v_row.id,
      'txn_ref', v_row.txn_ref
    );
  END IF;

  UPDATE public.visits
  SET status = 'voided'
  WHERE id = p_visit_id;

  RETURN jsonb_build_object(
    'ok', true,
    'already_voided', false,
    'visit_id', v_row.id,
    'txn_ref', v_row.txn_ref
  );
END;
$$;

REVOKE ALL ON FUNCTION public.void_visit(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.void_visit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.void_visit(uuid) TO service_role;
