
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF auth.uid() <> _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT p.kyc_status, p.activation_status, p.date_of_birth
    INTO prof FROM public.profiles p WHERE p.id = _user_id;

  age_years := CASE WHEN prof.date_of_birth IS NULL THEN NULL
    ELSE EXTRACT(YEAR FROM age(prof.date_of_birth))::int END;

  RETURN QUERY
  SELECT
    t.id,
    t.name,
    (
      (prof.kyc_status = t.required_kyc_status)
      AND (prof.activation_status = t.required_activation_status)
      AND (age_years IS NOT NULL AND age_years >= t.min_age)
      AND (COALESCE(lc.cnt, 0) < t.max_active_loans)
      AND (t.max_outstanding_principal IS NULL OR COALESCE(lc.outstanding, 0) < t.max_outstanding_principal)
    ),
    ARRAY(
      SELECT r FROM (VALUES
        (CASE WHEN prof.kyc_status IS DISTINCT FROM t.required_kyc_status
          THEN format('KYC status is %s, requires %s', COALESCE(prof.kyc_status,'unknown'), t.required_kyc_status) END),
        (CASE WHEN prof.activation_status IS DISTINCT FROM t.required_activation_status
          THEN format('Account is %s, requires %s', COALESCE(prof.activation_status,'unknown'), t.required_activation_status) END),
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
