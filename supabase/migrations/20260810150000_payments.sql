-- Slice 4: payments ledger + atomic record_payment RPC.
--
-- DEPENDENCY: public.clients / public.visits / public.create_visit from
--             20260810140000_clients_visits.sql
--             public.is_staff() from 20260810120000_staff_profiles.sql
-- Apply after clients_visits. Settlement tenders are site modes only
-- (Cash | JazzCash | EasyPaisa). No credit wallet / overpay in v1.

-- ─── payments ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES public.clients (id),
  visit_id          uuid REFERENCES public.visits (id),
  amount_pkr        integer NOT NULL CHECK (amount_pkr > 0),
  mode              text NOT NULL
                      CHECK (mode IN ('Cash', 'JazzCash', 'EasyPaisa')),
  paid_at           timestamptz NOT NULL DEFAULT now(),
  notes             text,
  created_by        uuid REFERENCES auth.users (id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  idempotency_key   uuid NOT NULL,
  CONSTRAINT payments_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS payments_client_id_paid_at_idx
  ON public.payments (client_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS payments_visit_id_idx
  ON public.payments (visit_id)
  WHERE visit_id IS NOT NULL;

COMMENT ON TABLE public.payments IS
  'Staff payment ledger for visit dues / partial tenders. Mode is site tender only.';
COMMENT ON COLUMN public.payments.idempotency_key IS
  'Client-generated UUID; duplicate record_payment returns the existing row.';
COMMENT ON COLUMN public.payments.visit_id IS
  'Nullable for future non-visit credits; Slice 4 always sets visit_id.';

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_staff_all ON public.payments;

DO $$
DECLARE
  staff_pred text;
BEGIN
  IF to_regprocedure('public.is_staff()') IS NOT NULL THEN
    staff_pred := 'public.is_staff()';
  ELSE
    RAISE NOTICE
      'public.is_staff() missing — payments RLS stubbed to deny-all';
    staff_pred := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY payments_staff_all ON public.payments FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
REVOKE ALL ON public.payments FROM anon;

-- ─── create_visit: also seed initial payment for Partial/Credit paid > 0 ───

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
  v_tender text;
  v_pay_notes text;
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

  -- Seed ledger when Partial/Credit collected something at save.
  -- Tender defaults to Cash unless payload.tender_mode is a site tender.
  IF v_paid > 0 AND v_mode IN ('Partial', 'Credit') THEN
    v_tender := NULLIF(trim(COALESCE(payload->>'tender_mode', '')), '');
    IF v_tender IS NULL OR v_tender NOT IN ('Cash', 'JazzCash', 'EasyPaisa') THEN
      v_tender := 'Cash';
    END IF;
    v_pay_notes := 'Initial ' || lower(v_mode) || ' tender on visit create';
    INSERT INTO public.payments (
      client_id, visit_id, amount_pkr, mode, paid_at, notes,
      created_by, idempotency_key
    ) VALUES (
      v_client_id, v_visit_id, v_paid, v_tender, v_visit_at, v_pay_notes,
      v_created_by, v_key
    );
  END IF;

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

-- ─── record_payment (atomic + idempotent; rejects overpay) ─────────────────

CREATE OR REPLACE FUNCTION public.record_payment(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff boolean;
  v_key uuid;
  v_existing public.payments%ROWTYPE;
  v_visit public.visits%ROWTYPE;
  v_amount integer;
  v_mode text;
  v_paid_at timestamptz;
  v_notes text;
  v_payment_id uuid;
  v_new_due integer;
  v_new_paid integer;
BEGIN
  SELECT public.is_staff() INTO v_staff;
  IF NOT COALESCE(v_staff, false) THEN
    RAISE EXCEPTION 'not_staff' USING ERRCODE = '42501';
  END IF;

  v_key := (payload->>'idempotency_key')::uuid;
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'idempotency_key required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_existing
  FROM public.payments
  WHERE idempotency_key = v_key;

  IF FOUND THEN
    SELECT * INTO v_visit FROM public.visits WHERE id = v_existing.visit_id;
    RETURN jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'payment_id', v_existing.id,
      'visit_id', v_existing.visit_id,
      'client_id', v_existing.client_id,
      'amount_pkr', v_existing.amount_pkr,
      'due_pkr', COALESCE(v_visit.due_pkr, 0),
      'amount_paid_pkr', COALESCE(v_visit.amount_paid_pkr, 0)
    );
  END IF;

  v_amount := (payload->>'amount_pkr')::integer;
  IF v_amount IS NULL OR v_amount <= 0 THEN
    RAISE EXCEPTION 'amount_pkr must be a positive integer' USING ERRCODE = '22023';
  END IF;

  v_mode := payload->>'mode';
  IF v_mode IS NULL OR v_mode NOT IN ('Cash', 'JazzCash', 'EasyPaisa') THEN
    RAISE EXCEPTION 'mode must be Cash, JazzCash, or EasyPaisa' USING ERRCODE = '22023';
  END IF;

  v_paid_at := COALESCE((payload->>'paid_at')::timestamptz, now());
  v_notes := NULLIF(trim(COALESCE(payload->>'notes', '')), '');

  IF payload->>'visit_id' IS NULL THEN
    RAISE EXCEPTION 'visit_id required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_visit
  FROM public.visits
  WHERE id = (payload->>'visit_id')::uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'visit not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_visit.status = 'voided' THEN
    RAISE EXCEPTION 'cannot record payment on voided visit' USING ERRCODE = '22023';
  END IF;

  IF v_visit.due_pkr <= 0 THEN
    RAISE EXCEPTION 'visit has no outstanding due' USING ERRCODE = '22023';
  END IF;

  IF v_amount > v_visit.due_pkr THEN
    RAISE EXCEPTION 'overpay rejected: amount exceeds remaining due (% PKR)', v_visit.due_pkr
      USING ERRCODE = '22023';
  END IF;

  IF payload->>'client_id' IS NOT NULL
     AND (payload->>'client_id')::uuid IS DISTINCT FROM v_visit.client_id THEN
    RAISE EXCEPTION 'client_id does not match visit' USING ERRCODE = '22023';
  END IF;

  v_new_paid := v_visit.amount_paid_pkr + v_amount;
  v_new_due := v_visit.due_pkr - v_amount;

  INSERT INTO public.payments (
    client_id, visit_id, amount_pkr, mode, paid_at, notes,
    created_by, idempotency_key
  ) VALUES (
    v_visit.client_id,
    v_visit.id,
    v_amount,
    v_mode,
    v_paid_at,
    v_notes,
    auth.uid(),
    v_key
  )
  RETURNING id INTO v_payment_id;

  UPDATE public.visits
  SET
    amount_paid_pkr = v_new_paid,
    due_pkr = v_new_due
  WHERE id = v_visit.id;

  RETURN jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'payment_id', v_payment_id,
    'visit_id', v_visit.id,
    'client_id', v_visit.client_id,
    'amount_pkr', v_amount,
    'due_pkr', v_new_due,
    'amount_paid_pkr', v_new_paid
  );
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO v_existing
    FROM public.payments
    WHERE idempotency_key = v_key;
    IF FOUND THEN
      SELECT * INTO v_visit FROM public.visits WHERE id = v_existing.visit_id;
      RETURN jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'payment_id', v_existing.id,
        'visit_id', v_existing.visit_id,
        'client_id', v_existing.client_id,
        'amount_pkr', v_existing.amount_pkr,
        'due_pkr', COALESCE(v_visit.due_pkr, 0),
        'amount_paid_pkr', COALESCE(v_visit.amount_paid_pkr, 0)
      );
    END IF;
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_payment(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.record_payment(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment(jsonb) TO service_role;
