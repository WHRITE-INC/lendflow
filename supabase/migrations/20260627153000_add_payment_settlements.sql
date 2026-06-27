CREATE TABLE public.payment_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  destination_provider text NOT NULL DEFAULT 'mpesa',
  destination_msisdn text NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_ref text,
  failure_reason text,
  raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_settlements_source_check
    CHECK (source_table IN ('transaction', 'mobile_money_payment')),
  CONSTRAINT payment_settlements_destination_provider_check
    CHECK (destination_provider IN ('mpesa')),
  CONSTRAINT payment_settlements_status_check
    CHECK (status IN ('pending', 'submitted', 'completed', 'failed')),
  CONSTRAINT payment_settlements_amount_positive CHECK (amount > 0),
  CONSTRAINT payment_settlements_source_unique UNIQUE (source_table, source_id)
);

GRANT SELECT ON public.payment_settlements TO authenticated;
GRANT ALL ON public.payment_settlements TO service_role;

ALTER TABLE public.payment_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view payment settlements"
  ON public.payment_settlements FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payment_settlements_set_updated_at
  BEFORE UPDATE ON public.payment_settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX payment_settlements_status_idx
  ON public.payment_settlements(status);
