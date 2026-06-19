CREATE TABLE public.promotion_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  headline text NOT NULL,
  badge text,
  accent text NOT NULL DEFAULT 'emerald',
  description text,
  qualification_amount numeric(12,2) NOT NULL,
  fee_amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ZMW',
  original_qualification_amount numeric(12,2),
  original_fee_amount numeric(12,2),
  original_currency text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotion_packages_amounts_positive
    CHECK (qualification_amount > 0 AND fee_amount > 0)
);

GRANT SELECT ON public.promotion_packages TO authenticated;
GRANT ALL ON public.promotion_packages TO service_role;

ALTER TABLE public.promotion_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view active promotion packages"
  ON public.promotion_packages FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER promotion_packages_set_updated_at
  BEFORE UPDATE ON public.promotion_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.promotion_packages
  (name, headline, badge, accent, description, qualification_amount, fee_amount, original_qualification_amount, original_fee_amount, original_currency, sort_order)
VALUES
  ('Starter Spark', 'Qualification of K 6,300', 'Entry pick', 'emerald', 'A light first package for freshly verified borrowers.', 6300.00, 88.20, 35000.00, 490.00, 'KES', 1),
  ('Copper Lift', 'Qualification of K 8,460', 'Popular', 'amber', 'A balanced package for everyday mobile money needs.', 8460.00, 124.20, 47000.00, 690.00, 'KES', 2),
  ('Market Plus', 'Qualification of K 9,900', 'Fast lane', 'sky', 'Extra room for stock, school fees, and urgent bills.', 9900.00, 160.20, 55000.00, 890.00, 'KES', 3),
  ('Growth Flex', 'Qualification of K 11,700', 'Flexible', 'violet', 'More qualification headroom after KYC approval.', 11700.00, 178.20, 65000.00, 990.00, 'KES', 4),
  ('Premier 100', 'Qualification of K 18,000', 'High value', 'rose', 'A larger package for serious short-term plans.', 18000.00, 540.00, 100000.00, 3000.00, 'KES', 5),
  ('Executive 150', 'Qualification of K 27,000', 'Priority', 'indigo', 'Priority-level qualification for stronger borrowing needs.', 27000.00, 1062.00, 150000.00, 5900.00, 'KES', 6),
  ('Summit 200', 'Qualification of K 36,000', 'Top tier', 'slate', 'The highest promotion package currently available.', 36000.00, 1438.20, 200000.00, 7990.00, 'KES', 7);

CREATE TABLE public.mobile_money_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.promotion_packages(id) ON DELETE SET NULL,
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
    CHECK (provider IN ('mtn_momo', 'airtel_money')),
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
