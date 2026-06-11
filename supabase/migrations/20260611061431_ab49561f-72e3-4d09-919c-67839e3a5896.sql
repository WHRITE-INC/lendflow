
CREATE TABLE public.loan_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  min_amount numeric(12,2) NOT NULL,
  max_amount numeric(12,2) NOT NULL,
  min_term_months int NOT NULL,
  max_term_months int NOT NULL,
  interest_rate numeric(6,3) NOT NULL,
  processing_fee numeric(12,2) NOT NULL DEFAULT 0,
  activation_fee numeric(12,2) NOT NULL DEFAULT 0,
  eligibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT loan_tiers_amount_range CHECK (max_amount >= min_amount),
  CONSTRAINT loan_tiers_term_range CHECK (max_term_months >= min_term_months),
  CONSTRAINT loan_tiers_positive CHECK (min_amount >= 0 AND min_term_months > 0 AND interest_rate >= 0)
);

GRANT SELECT ON public.loan_tiers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.loan_tiers TO authenticated;
GRANT ALL ON public.loan_tiers TO service_role;

ALTER TABLE public.loan_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active tiers"
  ON public.loan_tiers FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert tiers"
  ON public.loan_tiers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update tiers"
  ON public.loan_tiers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete tiers"
  ON public.loan_tiers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER loan_tiers_set_updated_at
  BEFORE UPDATE ON public.loan_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles
  ADD COLUMN tier_id uuid REFERENCES public.loan_tiers(id) ON DELETE SET NULL;

INSERT INTO public.loan_tiers (name, description, min_amount, max_amount, min_term_months, max_term_months, interest_rate, processing_fee, activation_fee, sort_order)
VALUES
  ('Starter',  'Entry-level loans for new verified borrowers.',     500,   5000,  1, 6,  12.5, 50,  25, 1),
  ('Standard', 'Mid-range loans for borrowers with repayment history.', 5000,  20000, 3, 12, 9.5,  150, 50, 2),
  ('Prime',    'Premium loans with the lowest rates.',              20000, 50000, 6, 24, 7.5,  300, 100, 3);
