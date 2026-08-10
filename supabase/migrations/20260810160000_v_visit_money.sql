-- Slice 3: reconcile-friendly visit money view (Karachi calendar helpers).
--
-- DEPENDENCY: public.visits from 20260810140000_clients_visits.sql
-- Apply after clients/visits (and after payments if both present — view is independent).
-- Revenue columns map ticket finals — never printed menu floors.
-- security_invoker so staff RLS on visits still applies.

CREATE OR REPLACE VIEW public.v_visit_money
WITH (security_invoker = true)
AS
SELECT
  v.id,
  v.txn_ref,
  v.client_id,
  v.visit_at,
  v.status,
  v.subtotal_pkr AS gross_pkr,
  v.discount_pkr,
  v.net_pkr,
  v.amount_paid_pkr AS collected_pkr,
  v.due_pkr,
  v.payment_mode,
  (v.visit_at AT TIME ZONE 'Asia/Karachi')::date AS visit_date_khi,
  to_char(v.visit_at AT TIME ZONE 'Asia/Karachi', 'YYYY-MM') AS visit_month_khi
FROM public.visits v;

COMMENT ON VIEW public.v_visit_money IS
  'POS money stack per visit. gross_pkr = subtotal (line finals); exclude status=voided for revenue.';

GRANT SELECT ON public.v_visit_money TO authenticated;
