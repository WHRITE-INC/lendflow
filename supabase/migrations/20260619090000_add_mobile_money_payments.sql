CREATE TABLE public.mobile_money_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.loan_tiers(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mtn_momo',
  reference_id uuid NOT NULL UNIQUE,
  external_id text NOT NULL UNIQUE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ZMW',
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_status text,
  reason text,
  raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mobile_money_payments_status_check
    CHECK (status IN ('pending', 'successful', 'failed')),
  CONSTRAINT mobile_money_payments_provider_check
    CHECK (provider IN ('mtn_momo')),
  CONSTRAINT mobile_money_payments_amount_positive CHECK (amount > 0)
);

GRANT SELECT ON public.mobile_money_payments TO authenticated;
GRANT ALL ON public.mobile_money_payments TO service_role;

ALTER TABLE public.mobile_money_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Borrowers view own mobile money payments"
  ON public.mobile_money_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all mobile money payments"
  ON public.mobile_money_payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mobile_money_payments_set_updated_at
  BEFORE UPDATE ON public.mobile_money_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX mobile_money_payments_user_created_idx
  ON public.mobile_money_payments(user_id, created_at DESC);

CREATE INDEX mobile_money_payments_status_idx
  ON public.mobile_money_payments(status);
