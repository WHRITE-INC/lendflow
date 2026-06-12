
-- 1. Extend loan_tiers with constraint columns
ALTER TABLE public.loan_tiers
  ADD COLUMN IF NOT EXISTS max_active_loans int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_outstanding_principal numeric,
  ADD COLUMN IF NOT EXISTS min_repayment_frequency_days int NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS max_repayment_frequency_days int NOT NULL DEFAULT 31,
  ADD COLUMN IF NOT EXISTS min_age int NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS required_kyc_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS required_activation_status text NOT NULL DEFAULT 'active';

-- 2. Loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES public.loan_tiers(id) ON DELETE RESTRICT,
  principal numeric NOT NULL CHECK (principal > 0),
  term_months int NOT NULL CHECK (term_months > 0),
  repayment_frequency_days int NOT NULL CHECK (repayment_frequency_days > 0),
  interest_rate numeric NOT NULL,
  outstanding_principal numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','closed','defaulted','rejected')),
  disbursed_at timestamptz,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Borrowers view own loans" ON public.loans
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all loans" ON public.loans
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS loans_user_status_idx ON public.loans(user_id, status);

-- 3. Eligibility evaluator
CREATE OR REPLACE FUNCTION public.evaluate_tier_eligibility(_user_id uuid)
RETURNS TABLE (
  tier_id uuid,
  tier_name text,
  eligible boolean,
  reasons text[],
  active_loan_count int,
  outstanding_principal numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof record;
  age_years int;
BEGIN
  SELECT p.kyc_status, p.activation_status, p.date_of_birth
    INTO prof FROM public.profiles p WHERE p.id = _user_id;

  age_years := CASE WHEN prof.date_of_birth IS NULL THEN NULL
    ELSE EXTRACT(YEAR FROM age(prof.date_of_birth))::int END;

  RETURN QUERY
  SELECT
    t.id,
    t.name,
    -- eligible if no reasons
    (
      (prof.kyc_status = t.required_kyc_status)
      AND (prof.activation_status = t.required_activation_status)
      AND (age_years IS NOT NULL AND age_years >= t.min_age)
      AND (COALESCE(lc.cnt, 0) < t.max_active_loans)
      AND (t.max_outstanding_principal IS NULL OR COALESCE(lc.outstanding, 0) < t.max_outstanding_principal)
    ),
    ARRAY(
      SELECT r FROM (VALUES
        (CASE WHEN prof.kyc_status <> t.required_kyc_status
          THEN format('KYC status is %s, requires %s', prof.kyc_status, t.required_kyc_status) END),
        (CASE WHEN prof.activation_status <> t.required_activation_status
          THEN format('Account is %s, requires %s', prof.activation_status, t.required_activation_status) END),
        (CASE WHEN age_years IS NULL THEN 'Date of birth not provided'
              WHEN age_years < t.min_age THEN format('Age %s, minimum %s', age_years, t.min_age) END),
        (CASE WHEN COALESCE(lc.cnt, 0) >= t.max_active_loans
          THEN format('Has %s active loans, max %s', lc.cnt, t.max_active_loans) END),
        (CASE WHEN t.max_outstanding_principal IS NOT NULL
                AND COALESCE(lc.outstanding, 0) >= t.max_outstanding_principal
          THEN format('Outstanding K%s, cap K%s', lc.outstanding, t.max_outstanding_principal) END)
      ) AS x(r) WHERE r IS NOT NULL
    ),
    COALESCE(lc.cnt, 0)::int,
    COALESCE(lc.outstanding, 0)::numeric
  FROM public.loan_tiers t
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS cnt, COALESCE(SUM(outstanding_principal),0) AS outstanding
    FROM public.loans l
    WHERE l.user_id = _user_id AND l.status IN ('pending','active')
  ) lc ON true
  WHERE t.is_active = true
  ORDER BY t.sort_order, t.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_tier_eligibility(uuid) TO authenticated;
