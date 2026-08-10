-- Slice 6: appointments for online Sheet bookings (import-first).
-- DEPENDENCY: clients, visits, services_catalog, is_staff()
-- Design: separate appointments table (not visit stubs).
-- Visits remain money tickets (completed/voided). Online bookers land here
-- with source='online' and external_id = Sheets Booking ID (FBS-…).
-- Complete visit converts to a full POS ticket via create_visit; never
-- dual-writes money back to Google Sheets.

CREATE TABLE IF NOT EXISTS public.appointments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id         text NOT NULL,
  client_id           uuid NOT NULL REFERENCES public.clients (id),
  scheduled_at        timestamptz NOT NULL,
  service_name        text NOT NULL,
  category            text,
  duration_min        integer CHECK (duration_min IS NULL OR duration_min > 0),
  status              text NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  source              text NOT NULL DEFAULT 'online'
                        CHECK (source IN ('online', 'walk_in', 'phone')),
  sheet_status        text,
  notes               text,
  catalog_service_id  integer REFERENCES public.services_catalog (id),
  visit_id            uuid REFERENCES public.visits (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_external_id_unique UNIQUE (external_id),
  CONSTRAINT appointments_service_name_nonempty CHECK (length(trim(service_name)) > 0),
  CONSTRAINT appointments_external_id_nonempty CHECK (length(trim(external_id)) > 0),
  CONSTRAINT appointments_visit_when_completed CHECK (
    status <> 'completed' OR visit_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS appointments_scheduled_at_idx
  ON public.appointments (scheduled_at);
CREATE INDEX IF NOT EXISTS appointments_status_scheduled_idx
  ON public.appointments (status, scheduled_at);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx
  ON public.appointments (client_id);
CREATE INDEX IF NOT EXISTS appointments_source_idx
  ON public.appointments (source);

COMMENT ON TABLE public.appointments IS
  'Scheduled bookings (online Sheet import + future walk-in/phone). Not POS money; link visit_id when completed at the desk.';
COMMENT ON COLUMN public.appointments.external_id IS
  'Idempotency key from Google Sheets Booking ID, e.g. FBS-…';
COMMENT ON COLUMN public.appointments.source IS
  'online = imported from Sheets; walk_in/phone reserved for desk-created holds.';
COMMENT ON COLUMN public.appointments.visit_id IS
  'Set when front desk Completes visit → create_visit. Never write money back to Sheets.';

CREATE OR REPLACE FUNCTION public.appointments_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE PROCEDURE public.appointments_set_updated_at();

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointments_staff_all ON public.appointments;

DO $$
DECLARE
  staff_pred text;
BEGIN
  IF to_regprocedure('public.is_staff()') IS NOT NULL THEN
    staff_pred := 'public.is_staff()';
  ELSE
    RAISE NOTICE
      'public.is_staff() missing — appointments RLS stubbed to deny-all';
    staff_pred := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY appointments_staff_all ON public.appointments FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
    staff_pred, staff_pred
  );
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
REVOKE ALL ON public.appointments FROM anon;
