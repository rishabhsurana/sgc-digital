-- ============================================
-- SGC Digital Complete Database Schema
-- ============================================

-- Drop existing types if they exist (for clean setup)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('public', 'staff', 'admin', 'super_admin');
CREATE TYPE entity_type AS ENUM ('ministry', 'court', 'statutory_body', 'public', 'attorney', 'company');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  organization TEXT,
  entity_type entity_type DEFAULT 'public',
  entity_number TEXT UNIQUE,
  role user_role DEFAULT 'public',
  department TEXT,
  position TEXT,
  employee_id TEXT,
  is_staff BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_staff" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

CREATE POLICY "profiles_update_admin" ON public.profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Generate entity number function
CREATE OR REPLACE FUNCTION public.generate_entity_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  seq_num INT;
BEGIN
  IF NEW.entity_number IS NULL THEN
    prefix := CASE NEW.entity_type
      WHEN 'ministry' THEN 'MDA'
      WHEN 'court' THEN 'CRT'
      WHEN 'statutory_body' THEN 'STB'
      WHEN 'public' THEN 'PUB'
      WHEN 'attorney' THEN 'ATT'
      WHEN 'company' THEN 'COM'
      ELSE 'USR'
    END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(entity_number FROM 5) AS INT)), 0) + 1
    INTO seq_num
    FROM public.profiles
    WHERE entity_number LIKE prefix || '-%';
    
    NEW.entity_number := prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_generate_entity_number ON public.profiles;
CREATE TRIGGER profiles_generate_entity_number
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_entity_number();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, organization, entity_type, role, is_staff)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'organization', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'entity_type')::entity_type, 'public'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'public'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_staff')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_entity_type ON public.profiles(entity_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON public.profiles(is_staff);

-- ============================================
-- STAFF REGISTRATION REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.staff_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  employee_id TEXT,
  supervisor_name TEXT NOT NULL,
  supervisor_email TEXT NOT NULL,
  justification TEXT,
  requested_role user_role DEFAULT 'staff',
  status request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  request_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_registration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff requests
DROP POLICY IF EXISTS "staff_requests_select_staff" ON public.staff_registration_requests;
DROP POLICY IF EXISTS "staff_requests_update_admin" ON public.staff_registration_requests;
DROP POLICY IF EXISTS "staff_requests_insert_any" ON public.staff_registration_requests;

CREATE POLICY "staff_requests_select_staff" ON public.staff_registration_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

CREATE POLICY "staff_requests_update_admin" ON public.staff_registration_requests 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "staff_requests_insert_any" ON public.staff_registration_requests 
  FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS staff_requests_updated_at ON public.staff_registration_requests;
CREATE TRIGGER staff_requests_updated_at
  BEFORE UPDATE ON public.staff_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Generate request reference
CREATE OR REPLACE FUNCTION public.generate_request_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_reference := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_requests_generate_ref ON public.staff_registration_requests;
CREATE TRIGGER staff_requests_generate_ref
  BEFORE INSERT ON public.staff_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_request_reference();

-- Indexes for staff requests
CREATE INDEX IF NOT EXISTS idx_staff_requests_status ON public.staff_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_requests_email ON public.staff_registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_staff_requests_department ON public.staff_registration_requests(department);

-- ============================================
-- AUTHORIZED USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(primary_user_id, email)
);

-- Enable RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authorized users
DROP POLICY IF EXISTS "authorized_users_select_own" ON public.authorized_users;
DROP POLICY IF EXISTS "authorized_users_insert_own" ON public.authorized_users;
DROP POLICY IF EXISTS "authorized_users_update_own" ON public.authorized_users;
DROP POLICY IF EXISTS "authorized_users_delete_own" ON public.authorized_users;
DROP POLICY IF EXISTS "authorized_users_select_staff" ON public.authorized_users;

CREATE POLICY "authorized_users_select_own" ON public.authorized_users 
  FOR SELECT USING (auth.uid() = primary_user_id OR auth.uid() = user_id);

CREATE POLICY "authorized_users_insert_own" ON public.authorized_users 
  FOR INSERT WITH CHECK (auth.uid() = primary_user_id);

CREATE POLICY "authorized_users_update_own" ON public.authorized_users 
  FOR UPDATE USING (auth.uid() = primary_user_id);

CREATE POLICY "authorized_users_delete_own" ON public.authorized_users 
  FOR DELETE USING (auth.uid() = primary_user_id);

CREATE POLICY "authorized_users_select_staff" ON public.authorized_users 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS authorized_users_updated_at ON public.authorized_users;
CREATE TRIGGER authorized_users_updated_at
  BEFORE UPDATE ON public.authorized_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for authorized users
CREATE INDEX IF NOT EXISTS idx_authorized_users_primary ON public.authorized_users(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON public.authorized_users(email);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit log
DROP POLICY IF EXISTS "audit_log_insert_authenticated" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_select_staff" ON public.audit_log;

CREATE POLICY "audit_log_insert_authenticated" ON public.audit_log 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "audit_log_select_staff" ON public.audit_log 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at);

-- ============================================
-- FUNCTION: Log Audit Entry
-- ============================================

CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
