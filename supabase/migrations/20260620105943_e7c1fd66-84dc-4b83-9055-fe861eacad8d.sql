
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('borrower', 'reviewer', 'admin');
CREATE TYPE public.country_code AS ENUM ('KE', 'UG', 'TZ', 'RW', 'GH', 'NG');
CREATE TYPE public.currency_code AS ENUM ('KES', 'UGX', 'TZS', 'RWF', 'GHS', 'NGN');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE public.kyc_doc_type AS ENUM ('national_id', 'passport', 'utility_bill', 'selfie');
CREATE TYPE public.doc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.application_status AS ENUM ('submitted','under_review','approved','rejected','withdrawn');
CREATE TYPE public.loan_status AS ENUM ('pending_disbursement','active','completed','defaulted','written_off');
CREATE TYPE public.schedule_status AS ENUM ('upcoming','paid','partial','overdue');
CREATE TYPE public.tx_direction AS ENUM ('disbursement','repayment','refund','reversal');
CREATE TYPE public.tx_provider AS ENUM ('mtn','airtel','mpesa','manual');
CREATE TYPE public.tx_status AS ENUM ('pending','success','failed','reversed');
CREATE TYPE public.notification_channel AS ENUM ('email','sms','inapp');

-- =========================================================================
-- UPDATED_AT TRIGGER FN
-- =========================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  country public.country_code,
  phone_e164 TEXT,
  national_id TEXT,
  date_of_birth DATE,
  address TEXT,
  employment TEXT,
  kyc_status public.kyc_status NOT NULL DEFAULT 'pending',
  risk_score INT NOT NULL DEFAULT 500,
  suspended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- USER ROLES (separate table — no roles on profiles)
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role SECURITY DEFINER fn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================================================================
-- KYC DOCUMENTS
-- =========================================================================
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type public.kyc_doc_type NOT NULL,
  storage_path TEXT NOT NULL,
  status public.doc_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kyc_documents TO authenticated;
GRANT ALL ON public.kyc_documents TO service_role;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- LOAN PRODUCTS
-- =========================================================================
CREATE TABLE public.loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  country public.country_code NOT NULL,
  currency public.currency_code NOT NULL,
  min_amount BIGINT NOT NULL,
  max_amount BIGINT NOT NULL,
  interest_rate_pct NUMERIC(5,2) NOT NULL,
  term_days INT NOT NULL,
  eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loan_products TO authenticated;
GRANT ALL ON public.loan_products TO service_role;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.loan_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- LOAN APPLICATIONS
-- =========================================================================
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.loan_products(id),
  requested_amount BIGINT NOT NULL,
  term_days INT NOT NULL,
  purpose TEXT,
  status public.application_status NOT NULL DEFAULT 'submitted',
  decision_notes TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loan_applications TO authenticated;
GRANT ALL ON public.loan_applications TO service_role;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- LOANS
-- =========================================================================
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.loan_applications(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.loan_products(id),
  principal BIGINT NOT NULL,
  interest BIGINT NOT NULL,
  total_payable BIGINT NOT NULL,
  outstanding BIGINT NOT NULL,
  currency public.currency_code NOT NULL,
  disbursed_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  status public.loan_status NOT NULL DEFAULT 'pending_disbursement',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_loans_updated BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- REPAYMENT SCHEDULES
-- =========================================================================
CREATE TABLE public.repayment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_no INT NOT NULL,
  due_date DATE NOT NULL,
  amount_due BIGINT NOT NULL,
  amount_paid BIGINT NOT NULL DEFAULT 0,
  status public.schedule_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(loan_id, installment_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repayment_schedules TO authenticated;
GRANT ALL ON public.repayment_schedules TO service_role;
ALTER TABLE public.repayment_schedules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sched_updated BEFORE UPDATE ON public.repayment_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- TRANSACTIONS
-- =========================================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction public.tx_direction NOT NULL,
  provider public.tx_provider NOT NULL,
  provider_ref TEXT UNIQUE,
  msisdn TEXT,
  amount BIGINT NOT NULL,
  currency public.currency_code NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tx_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel public.notification_channel NOT NULL DEFAULT 'inapp',
  template TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- AUDIT LOGS
-- =========================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- SETTINGS
-- =========================================================================
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- profiles
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- user_roles
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- kyc_documents
CREATE POLICY "kyc_self_select" ON public.kyc_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "kyc_self_insert" ON public.kyc_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kyc_admin_update" ON public.kyc_documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "kyc_self_delete" ON public.kyc_documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- loan_products
CREATE POLICY "products_read_active" ON public.loan_products FOR SELECT TO authenticated
  USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products_admin_write" ON public.loan_products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- loan_applications
CREATE POLICY "apps_self_select" ON public.loan_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "apps_self_insert" ON public.loan_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps_self_update" ON public.loan_applications FOR UPDATE TO authenticated
  USING (
    (auth.uid() = user_id AND status = 'submitted')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'reviewer')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'reviewer')
  );

-- loans
CREATE POLICY "loans_self_select" ON public.loans FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "loans_admin_write" ON public.loans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- repayment_schedules
CREATE POLICY "sched_self_select" ON public.repayment_schedules FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.loans l WHERE l.id = loan_id AND (l.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer')))
  );
CREATE POLICY "sched_admin_write" ON public.repayment_schedules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- transactions
CREATE POLICY "tx_self_select" ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "tx_self_insert" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tx_admin_update" ON public.transactions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "notif_self_select" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "notif_self_update" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- audit_logs
CREATE POLICY "audit_admin_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_insert_self" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id IS NULL OR actor_id = auth.uid());

-- settings
CREATE POLICY "settings_read_all" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- AUTO-CREATE PROFILE + BOOTSTRAP FIRST ADMIN ON SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing_admin_count INT;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (user_id) DO NOTHING;

  -- always borrower
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'borrower')
  ON CONFLICT DO NOTHING;

  -- first ever user → admin too
  SELECT COUNT(*) INTO existing_admin_count FROM public.user_roles WHERE role = 'admin';
  IF existing_admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- SEED LOAN PRODUCTS
-- =========================================================================
INSERT INTO public.loan_products (name, description, country, currency, min_amount, max_amount, interest_rate_pct, term_days, eligibility) VALUES
('Quick Cash KE', 'Fast small loan for Kenyan customers', 'KE', 'KES', 50000, 1000000, 12.5, 30, '{"kyc_required":true,"min_risk":400}'),
('Boda Boost KE', 'Working capital for riders', 'KE', 'KES', 200000, 5000000, 14.0, 60, '{"kyc_required":true,"min_risk":450}'),
('Biz Builder KE', 'Larger business loan', 'KE', 'KES', 500000, 20000000, 16.5, 90, '{"kyc_required":true,"min_risk":500}'),

('Quick Cash UG', 'Fast small loan for Ugandan customers', 'UG', 'UGX', 50000, 2000000, 13.0, 30, '{"kyc_required":true,"min_risk":400}'),
('Boda Boost UG', 'Working capital', 'UG', 'UGX', 200000, 8000000, 14.5, 60, '{"kyc_required":true,"min_risk":450}'),
('Biz Builder UG', 'Business growth loan', 'UG', 'UGX', 500000, 25000000, 17.0, 90, '{"kyc_required":true,"min_risk":500}'),

('Quick Cash TZ', 'Fast small loan', 'TZ', 'TZS', 50000, 2000000, 13.5, 30, '{"kyc_required":true,"min_risk":400}'),
('Biz Builder TZ', 'Business growth loan', 'TZ', 'TZS', 500000, 15000000, 16.0, 90, '{"kyc_required":true,"min_risk":500}'),

('Quick Cash RW', 'Fast small loan', 'RW', 'RWF', 30000, 1500000, 12.0, 30, '{"kyc_required":true,"min_risk":400}'),
('Biz Builder RW', 'Business growth loan', 'RW', 'RWF', 300000, 10000000, 15.5, 90, '{"kyc_required":true,"min_risk":500}'),

('Quick Cash GH', 'Fast small loan', 'GH', 'GHS', 500, 10000, 12.5, 30, '{"kyc_required":true,"min_risk":400}'),
('Biz Builder GH', 'Business growth loan', 'GH', 'GHS', 2000, 100000, 16.0, 90, '{"kyc_required":true,"min_risk":500}'),

('Quick Cash NG', 'Fast small loan', 'NG', 'NGN', 10000, 500000, 13.0, 30, '{"kyc_required":true,"min_risk":400}'),
('Biz Builder NG', 'Business growth loan', 'NG', 'NGN', 50000, 5000000, 16.5, 90, '{"kyc_required":true,"min_risk":500}');
