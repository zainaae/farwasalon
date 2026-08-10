-- Slice 5: products + stock_movements (qty only via movements).
--
-- DEPENDENCY: public.is_staff() from 20260810120000_staff_profiles.sql
--             public.visits (optional FK) from 20260810140000_clients_visits.sql
-- Apply AFTER 20260810160000_v_visit_money.sql.
-- Stock on_hand never edits silently — INSERT stock_movements drives qty via trigger.
-- Retail (and all) sales/adjustments that would go negative are rejected in v1.

-- ─── products ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku              text NOT NULL,
  name             text NOT NULL,
  kind             text NOT NULL
                     CHECK (kind IN ('retail', 'consumable')),
  unit             text NOT NULL DEFAULT 'ea',
  qty_on_hand      numeric(12, 3) NOT NULL DEFAULT 0
                     CHECK (qty_on_hand >= 0),
  reorder_level    numeric(12, 3) NOT NULL DEFAULT 0
                     CHECK (reorder_level >= 0),
  sale_price_pkr   integer CHECK (sale_price_pkr IS NULL OR sale_price_pkr >= 0),
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_sku_unique UNIQUE (sku),
  CONSTRAINT products_sku_nonempty CHECK (length(trim(sku)) > 0),
  CONSTRAINT products_name_nonempty CHECK (length(trim(name)) > 0),
  CONSTRAINT products_unit_nonempty CHECK (length(trim(unit)) > 0)
);

CREATE INDEX IF NOT EXISTS products_active_name_idx
  ON public.products (active, lower(name));
CREATE INDEX IF NOT EXISTS products_kind_idx ON public.products (kind);
CREATE INDEX IF NOT EXISTS products_low_stock_idx
  ON public.products (qty_on_hand, reorder_level)
  WHERE active = true;

COMMENT ON TABLE public.products IS
  'Salon shelf SKUs. qty_on_hand is maintained only by stock_movements triggers.';
COMMENT ON COLUMN public.products.kind IS
  'retail = sellable on ticket later; consumable = back-bar use.';
COMMENT ON COLUMN public.products.sale_price_pkr IS
  'Nullable shelf price (PKR integer). Required when selling retail on a visit (Slice 5.1+).';

CREATE OR REPLACE FUNCTION public.products_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE PROCEDURE public.products_set_updated_at();

-- Block silent qty_on_hand edits (movements set app.stock_apply = 1).
CREATE OR REPLACE FUNCTION public.products_forbid_direct_qty()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.qty_on_hand IS DISTINCT FROM OLD.qty_on_hand THEN
    IF current_setting('app.stock_apply', true) IS DISTINCT FROM '1' THEN
      RAISE EXCEPTION 'qty_on_hand only via stock_movements'
        USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_forbid_direct_qty ON public.products;
CREATE TRIGGER products_forbid_direct_qty
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE PROCEDURE public.products_forbid_direct_qty();

-- ─── stock_movements ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES public.products (id),
  delta        numeric(12, 3) NOT NULL
                 CHECK (delta <> 0),
  reason       text NOT NULL
                 CHECK (reason IN ('purchase', 'sale', 'adjust', 'waste')),
  visit_id     uuid REFERENCES public.visits (id),
  created_by   uuid REFERENCES auth.users (id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  notes        text
);

CREATE INDEX IF NOT EXISTS stock_movements_product_id_created_at_idx
  ON public.stock_movements (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS stock_movements_visit_id_idx
  ON public.stock_movements (visit_id)
  WHERE visit_id IS NOT NULL;

COMMENT ON TABLE public.stock_movements IS
  'Append-only stock ledger. Positive delta = in; negative = out.';
COMMENT ON COLUMN public.stock_movements.delta IS
  '+ purchase / adjust-in; − sale / waste / adjust-out.';
COMMENT ON COLUMN public.stock_movements.visit_id IS
  'Set when a retail sale is tied to a POS visit (Slice 5.1+).';

-- Apply delta to products.qty_on_hand; reject resulting negative (v1, all kinds).
CREATE OR REPLACE FUNCTION public.stock_movements_apply_qty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_new_qty numeric(12, 3);
BEGIN
  SELECT * INTO v_product
  FROM public.products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'product not found' USING ERRCODE = 'P0002';
  END IF;

  v_new_qty := v_product.qty_on_hand + NEW.delta;

  IF v_new_qty < 0 THEN
    -- Spec: reject retail sale that would go negative; v1 rejects any underflow.
    RAISE EXCEPTION
      'insufficient stock: % on hand, delta % would make qty %',
      v_product.qty_on_hand, NEW.delta, v_new_qty
      USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('app.stock_apply', '1', true);
  UPDATE public.products
  SET qty_on_hand = v_new_qty
  WHERE id = NEW.product_id;
  PERFORM set_config('app.stock_apply', '0', true);

  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stock_movements_apply_qty ON public.stock_movements;
CREATE TRIGGER stock_movements_apply_qty
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE PROCEDURE public.stock_movements_apply_qty();

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_staff_all ON public.products;
DROP POLICY IF EXISTS stock_movements_staff_select ON public.stock_movements;
DROP POLICY IF EXISTS stock_movements_staff_insert ON public.stock_movements;

DO $$
DECLARE
  staff_pred text;
BEGIN
  IF to_regprocedure('public.is_staff()') IS NOT NULL THEN
    staff_pred := 'public.is_staff()';
  ELSE
    RAISE NOTICE
      'public.is_staff() missing — inventory RLS stubbed to deny-all';
    staff_pred := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY products_staff_all ON public.products FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
  EXECUTE format(
    'CREATE POLICY stock_movements_staff_select ON public.stock_movements FOR SELECT TO authenticated USING (%s)',
    staff_pred
  );
  EXECUTE format(
    'CREATE POLICY stock_movements_staff_insert ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (%s)',
    staff_pred
  );
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.stock_movements TO service_role;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.stock_movements FROM anon;

-- ─── record_stock_movement RPC ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_stock_movement(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff boolean;
  v_product_id uuid;
  v_delta numeric(12, 3);
  v_reason text;
  v_visit_id uuid;
  v_notes text;
  v_movement_id uuid;
  v_qty numeric(12, 3);
BEGIN
  SELECT public.is_staff() INTO v_staff;
  IF NOT COALESCE(v_staff, false) THEN
    RAISE EXCEPTION 'not_staff' USING ERRCODE = '42501';
  END IF;

  v_product_id := (payload->>'product_id')::uuid;
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'product_id required' USING ERRCODE = '22023';
  END IF;

  v_delta := (payload->>'delta')::numeric;
  IF v_delta IS NULL OR v_delta = 0 THEN
    RAISE EXCEPTION 'delta must be a non-zero number' USING ERRCODE = '22023';
  END IF;

  v_reason := payload->>'reason';
  IF v_reason IS NULL OR v_reason NOT IN ('purchase', 'sale', 'adjust', 'waste') THEN
    RAISE EXCEPTION 'reason must be purchase, sale, adjust, or waste'
      USING ERRCODE = '22023';
  END IF;

  -- Direction conventions for desk UI (optional sign enforcement).
  IF v_reason IN ('sale', 'waste') AND v_delta > 0 THEN
    RAISE EXCEPTION 'sale/waste delta must be negative' USING ERRCODE = '22023';
  END IF;
  IF v_reason = 'purchase' AND v_delta < 0 THEN
    RAISE EXCEPTION 'purchase delta must be positive' USING ERRCODE = '22023';
  END IF;

  IF payload->>'visit_id' IS NOT NULL AND NULLIF(trim(payload->>'visit_id'), '') IS NOT NULL THEN
    v_visit_id := (payload->>'visit_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.visits v WHERE v.id = v_visit_id) THEN
      RAISE EXCEPTION 'visit_id invalid' USING ERRCODE = '22023';
    END IF;
  END IF;

  v_notes := NULLIF(trim(COALESCE(payload->>'notes', '')), '');

  INSERT INTO public.stock_movements (
    product_id, delta, reason, visit_id, created_by, notes
  ) VALUES (
    v_product_id, v_delta, v_reason, v_visit_id, auth.uid(), v_notes
  )
  RETURNING id INTO v_movement_id;

  SELECT qty_on_hand INTO v_qty
  FROM public.products
  WHERE id = v_product_id;

  RETURN jsonb_build_object(
    'ok', true,
    'movement_id', v_movement_id,
    'product_id', v_product_id,
    'delta', v_delta,
    'reason', v_reason,
    'qty_on_hand', v_qty
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_stock_movement(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.record_stock_movement(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_stock_movement(jsonb) TO service_role;
