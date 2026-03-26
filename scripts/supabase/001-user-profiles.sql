-- User Profiles Table
-- Links to Supabase auth.users and stores extended user information

-- Create enum types
CREATE TYPE user_role AS ENUM ('public_user', 'mda_user', 'staff', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE entity_type AS ENUM ('ministry', 'court', 'statutory_body', 'public', 'attorney', 'company');

-- Main user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  organization TEXT,
  position TEXT,
  entity_type entity_type DEFAULT 'public',
  entity_number TEXT UNIQUE,
  role user_role DEFAULT 'public_user',
  status user_status DEFAULT 'pending',
  is_staff BOOLEAN DEFAULT FALSE,
  department TEXT,
  supervisor_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Staff/Admin can view all profiles
CREATE POLICY "profiles_select_staff" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- Admin can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Insert policy for new users (via trigger)
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_type entity_type;
  v_entity_prefix TEXT;
  v_entity_number TEXT;
BEGIN
  -- Determine entity type from metadata
  v_entity_type := COALESCE(
    (NEW.raw_user_meta_data->>'entity_type')::entity_type,
    'public'
  );
  
  -- Generate entity number based on type
  v_entity_prefix := CASE v_entity_type
    WHEN 'ministry' THEN 'MDA'
    WHEN 'court' THEN 'CRT'
    WHEN 'statutory_body' THEN 'STB'
    WHEN 'public' THEN 'PUB'
    WHEN 'attorney' THEN 'ATY'
    WHEN 'company' THEN 'COM'
    ELSE 'USR'
  END;
  
  v_entity_number := v_entity_prefix || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    organization,
    position,
    entity_type,
    entity_number,
    role,
    status,
    is_staff
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'organization', NULL),
    COALESCE(NEW.raw_user_meta_data->>'position', NULL),
    v_entity_type,
    v_entity_number,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'is_staff', 'false')::BOOLEAN THEN 'staff'::user_role
      ELSE 'public_user'::user_role
    END,
    'pending'::user_status,
    COALESCE(NEW.raw_user_meta_data->>'is_staff', 'false')::BOOLEAN
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_entity_number ON public.profiles(entity_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON public.profiles(is_staff);
