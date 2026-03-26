-- Authorized Users Table
-- For entities that have multiple authorized users (Companies, MDAs)

CREATE TABLE IF NOT EXISTS public.authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  can_submit BOOLEAN DEFAULT TRUE,
  can_view BOOLEAN DEFAULT TRUE,
  can_approve BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_profile_id, email)
);

-- Enable RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view authorized users for their own profile
CREATE POLICY "auth_users_select_own" ON public.authorized_users 
  FOR SELECT USING (
    parent_profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- Users can insert authorized users for their own profile
CREATE POLICY "auth_users_insert_own" ON public.authorized_users 
  FOR INSERT WITH CHECK (parent_profile_id = auth.uid());

-- Users can update authorized users for their own profile
CREATE POLICY "auth_users_update_own" ON public.authorized_users 
  FOR UPDATE USING (
    parent_profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Users can delete authorized users for their own profile
CREATE POLICY "auth_users_delete_own" ON public.authorized_users 
  FOR DELETE USING (
    parent_profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER auth_users_updated_at
  BEFORE UPDATE ON public.authorized_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_users_parent ON public.authorized_users(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON public.authorized_users(email);
