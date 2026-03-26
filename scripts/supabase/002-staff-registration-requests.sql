-- Staff Registration Requests Table
-- Stores pending registration requests from staff members requiring approval

CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

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

-- RLS Policies
-- Staff/Admin can view all requests
CREATE POLICY "staff_requests_select_staff" ON public.staff_registration_requests 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_staff = true
    )
  );

-- Admin can update requests (approve/reject)
CREATE POLICY "staff_requests_update_admin" ON public.staff_registration_requests 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Anyone can insert a request (for registration)
CREATE POLICY "staff_requests_insert_any" ON public.staff_registration_requests 
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER staff_requests_updated_at
  BEFORE UPDATE ON public.staff_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Generate request reference on insert
CREATE OR REPLACE FUNCTION public.generate_request_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_reference := 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_requests_generate_ref
  BEFORE INSERT ON public.staff_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_request_reference();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_requests_status ON public.staff_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_requests_email ON public.staff_registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_staff_requests_department ON public.staff_registration_requests(department);
