-- Audit Log Table
-- Tracks all user actions for compliance and debugging

CREATE TYPE audit_action AS ENUM (
  'login', 'logout', 'signup', 'password_reset',
  'profile_update', 'status_change', 'role_change',
  'staff_request_submitted', 'staff_request_approved', 'staff_request_rejected',
  'user_created', 'user_updated', 'user_deleted', 'user_suspended',
  'correspondence_submitted', 'correspondence_updated', 'correspondence_approved',
  'contract_submitted', 'contract_updated', 'contract_approved'
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action audit_action NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only staff/admin can view audit logs
CREATE POLICY "audit_log_select_staff" ON public.audit_log 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- System can insert audit logs (via service role)
CREATE POLICY "audit_log_insert_any" ON public.audit_log 
  FOR INSERT WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- Helper function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action audit_action,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;
