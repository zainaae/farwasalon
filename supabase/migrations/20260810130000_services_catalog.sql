-- Slice 1: POS service catalog bridged from src/data.js (site menu ids/prices).
--
-- DEPENDENCY (Foundation / Slice 0):
--   Staff RLS uses public.is_staff() from 20260810120000_staff_profiles.sql.
--   This file sorts after that migration. Prefer applying Foundation first.
--   If is_staff() is missing, policies install as deny-all stubs (NOTICE).
--   Sync script uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).

CREATE TABLE IF NOT EXISTS public.services_catalog (
  id                integer PRIMARY KEY,
  name              text NOT NULL,
  category          text NOT NULL,
  price_pkr         integer NOT NULL CHECK (price_pkr >= 0),
  duration_minutes  integer CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  from_price        boolean NOT NULL DEFAULT false,
  active            boolean NOT NULL DEFAULT true,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_catalog_active_category_idx
  ON public.services_catalog (active, category, name);

COMMENT ON TABLE public.services_catalog IS
  'POS menu mirror of src/data.js ALL_SERVICES. Tickets snapshot these fields; sync via scripts/sync-pos-catalog.mjs.';
COMMENT ON COLUMN public.services_catalog.from_price IS
  'Mirrors site fromPrice — true for Hair, Hair Treatments, Bridal (floor, not invoice).';

ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_catalog_staff_select ON public.services_catalog;
DROP POLICY IF EXISTS services_catalog_staff_insert ON public.services_catalog;
DROP POLICY IF EXISTS services_catalog_staff_update ON public.services_catalog;
DROP POLICY IF EXISTS services_catalog_staff_delete ON public.services_catalog;

DO $$
DECLARE
  staff_pred text;
BEGIN
  IF to_regprocedure('public.is_staff()') IS NOT NULL THEN
    staff_pred := 'public.is_staff()';
  ELSE
    -- Stub: deny all authenticated until Foundation defines is_staff().
    RAISE NOTICE
      'public.is_staff() missing — services_catalog RLS stubbed to deny-all; apply Foundation staff_profiles then recreate policies with is_staff()';
    staff_pred := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY services_catalog_staff_select ON public.services_catalog FOR SELECT TO authenticated USING (%s)',
    staff_pred
  );
  EXECUTE format(
    'CREATE POLICY services_catalog_staff_insert ON public.services_catalog FOR INSERT TO authenticated WITH CHECK (%s)',
    staff_pred
  );
  EXECUTE format(
    'CREATE POLICY services_catalog_staff_update ON public.services_catalog FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
  EXECUTE format(
    'CREATE POLICY services_catalog_staff_delete ON public.services_catalog FOR DELETE TO authenticated USING (%s)',
    staff_pred
  );
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services_catalog TO authenticated;
GRANT ALL ON public.services_catalog TO service_role;
REVOKE ALL ON public.services_catalog FROM anon;
