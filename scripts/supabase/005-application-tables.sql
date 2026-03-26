-- ============================================
-- SGC Digital - Application Tables
-- Correspondence, Contracts, and Supporting Data
-- ============================================

-- ============================================
-- ADDITIONAL ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'pending_information',
    'approved',
    'rejected',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE correspondence_category AS ENUM (
    'legal_opinion',
    'legal_advice',
    'litigation',
    'legislation_review',
    'contract_review',
    'general_inquiry',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contract_category AS ENUM (
    'goods_services',
    'construction',
    'consultancy',
    'lease_agreement',
    'memorandum_of_understanding',
    'grant_agreement',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- REFERENCE TABLES
-- ============================================

-- Departments/MDAs
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.departments(id),
  head_name TEXT,
  head_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "departments_read_all" ON public.departments;
CREATE POLICY "departments_read_all" ON public.departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "departments_manage_admin" ON public.departments;
CREATE POLICY "departments_manage_admin" ON public.departments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin'))
);

-- Correspondence types
CREATE TABLE IF NOT EXISTS public.correspondence_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category correspondence_category NOT NULL,
  description TEXT,
  sla_days INTEGER DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.correspondence_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "correspondence_types_read_all" ON public.correspondence_types;
CREATE POLICY "correspondence_types_read_all" ON public.correspondence_types FOR SELECT USING (true);

-- Contract types
CREATE TABLE IF NOT EXISTS public.contract_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category contract_category NOT NULL,
  description TEXT,
  sla_days INTEGER DEFAULT 21,
  requires_cabinet_approval BOOLEAN DEFAULT false,
  threshold_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contract_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contract_types_read_all" ON public.contract_types;
CREATE POLICY "contract_types_read_all" ON public.contract_types FOR SELECT USING (true);

-- ============================================
-- CORRESPONDENCE SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.correspondence_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE,
  
  -- Submitter info
  submitted_by UUID REFERENCES auth.users(id),
  entity_number TEXT,
  
  -- Correspondence details
  correspondence_type_id UUID REFERENCES public.correspondence_types(id),
  subject TEXT NOT NULL,
  description TEXT,
  priority priority_level DEFAULT 'medium',
  
  -- Applicant info (for public submissions)
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_phone TEXT,
  applicant_organization TEXT,
  applicant_address TEXT,
  
  -- Assignment & tracking
  status submission_status DEFAULT 'draft',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_department UUID REFERENCES public.departments(id),
  
  -- Dates
  submitted_at TIMESTAMPTZ,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Additional info
  is_confidential BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.correspondence_submissions ENABLE ROW LEVEL SECURITY;

-- User can see their own submissions
DROP POLICY IF EXISTS "correspondence_select_own" ON public.correspondence_submissions;
CREATE POLICY "correspondence_select_own" ON public.correspondence_submissions 
  FOR SELECT USING (submitted_by = auth.uid());

-- User can insert their own
DROP POLICY IF EXISTS "correspondence_insert_own" ON public.correspondence_submissions;
CREATE POLICY "correspondence_insert_own" ON public.correspondence_submissions 
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- User can update own drafts
DROP POLICY IF EXISTS "correspondence_update_own" ON public.correspondence_submissions;
CREATE POLICY "correspondence_update_own" ON public.correspondence_submissions 
  FOR UPDATE USING (submitted_by = auth.uid() AND status = 'draft');

-- Staff can see and manage all
DROP POLICY IF EXISTS "correspondence_staff_select" ON public.correspondence_submissions;
CREATE POLICY "correspondence_staff_select" ON public.correspondence_submissions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

DROP POLICY IF EXISTS "correspondence_staff_update" ON public.correspondence_submissions;
CREATE POLICY "correspondence_staff_update" ON public.correspondence_submissions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

-- Generate reference number trigger
CREATE OR REPLACE FUNCTION public.generate_correspondence_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL AND NEW.status != 'draft' THEN
    NEW.reference_number := 'COR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(
      (SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM 10) AS INT)), 0) + 1 
       FROM public.correspondence_submissions 
       WHERE reference_number LIKE 'COR-' || TO_CHAR(NOW(), 'YYYY') || '-%')::TEXT, 
      6, '0'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS correspondence_generate_ref ON public.correspondence_submissions;
CREATE TRIGGER correspondence_generate_ref
  BEFORE INSERT OR UPDATE ON public.correspondence_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_correspondence_ref();

-- Updated_at trigger
DROP TRIGGER IF EXISTS correspondence_updated_at ON public.correspondence_submissions;
CREATE TRIGGER correspondence_updated_at
  BEFORE UPDATE ON public.correspondence_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_correspondence_ref ON public.correspondence_submissions(reference_number);
CREATE INDEX IF NOT EXISTS idx_correspondence_status ON public.correspondence_submissions(status);
CREATE INDEX IF NOT EXISTS idx_correspondence_submitted_by ON public.correspondence_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_correspondence_assigned_to ON public.correspondence_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_correspondence_created ON public.correspondence_submissions(created_at);

-- ============================================
-- CONTRACT SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE,
  
  -- Submitter info
  submitted_by UUID REFERENCES auth.users(id),
  entity_number TEXT,
  
  -- Contract details
  contract_type_id UUID REFERENCES public.contract_types(id),
  title TEXT NOT NULL,
  description TEXT,
  priority priority_level DEFAULT 'medium',
  
  -- Parties
  contracting_party_name TEXT,
  contracting_party_address TEXT,
  contracting_party_contact TEXT,
  contracting_party_email TEXT,
  
  -- Financial
  contract_value DECIMAL(15,2),
  currency TEXT DEFAULT 'BBD',
  payment_terms TEXT,
  
  -- Contract dates
  proposed_start_date DATE,
  proposed_end_date DATE,
  contract_duration_months INTEGER,
  
  -- Assignment & tracking
  status submission_status DEFAULT 'draft',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_department UUID REFERENCES public.departments(id),
  
  -- Cabinet approval
  requires_cabinet_approval BOOLEAN DEFAULT false,
  cabinet_submission_date DATE,
  cabinet_decision TEXT,
  cabinet_decision_date DATE,
  
  -- Dates
  submitted_at TIMESTAMPTZ,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Additional info
  is_confidential BOOLEAN DEFAULT false,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contract_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for contracts (similar to correspondence)
DROP POLICY IF EXISTS "contract_select_own" ON public.contract_submissions;
CREATE POLICY "contract_select_own" ON public.contract_submissions 
  FOR SELECT USING (submitted_by = auth.uid());

DROP POLICY IF EXISTS "contract_insert_own" ON public.contract_submissions;
CREATE POLICY "contract_insert_own" ON public.contract_submissions 
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "contract_update_own" ON public.contract_submissions;
CREATE POLICY "contract_update_own" ON public.contract_submissions 
  FOR UPDATE USING (submitted_by = auth.uid() AND status = 'draft');

DROP POLICY IF EXISTS "contract_staff_select" ON public.contract_submissions;
CREATE POLICY "contract_staff_select" ON public.contract_submissions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

DROP POLICY IF EXISTS "contract_staff_update" ON public.contract_submissions;
CREATE POLICY "contract_staff_update" ON public.contract_submissions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

-- Generate reference number
CREATE OR REPLACE FUNCTION public.generate_contract_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL AND NEW.status != 'draft' THEN
    NEW.reference_number := 'CON-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(
      (SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM 10) AS INT)), 0) + 1 
       FROM public.contract_submissions 
       WHERE reference_number LIKE 'CON-' || TO_CHAR(NOW(), 'YYYY') || '-%')::TEXT, 
      6, '0'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contract_generate_ref ON public.contract_submissions;
CREATE TRIGGER contract_generate_ref
  BEFORE INSERT OR UPDATE ON public.contract_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_contract_ref();

DROP TRIGGER IF EXISTS contract_updated_at ON public.contract_submissions;
CREATE TRIGGER contract_updated_at
  BEFORE UPDATE ON public.contract_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contract_ref ON public.contract_submissions(reference_number);
CREATE INDEX IF NOT EXISTS idx_contract_status ON public.contract_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contract_submitted_by ON public.contract_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_contract_assigned_to ON public.contract_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contract_created ON public.contract_submissions(created_at);

-- ============================================
-- STATUS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('correspondence', 'contract')),
  submission_id UUID NOT NULL,
  previous_status submission_status,
  new_status submission_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_history_read" ON public.status_history;
CREATE POLICY "status_history_read" ON public.status_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "status_history_insert_staff" ON public.status_history;
CREATE POLICY "status_history_insert_staff" ON public.status_history 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

CREATE INDEX IF NOT EXISTS idx_status_history_submission ON public.status_history(submission_type, submission_id);

-- ============================================
-- DOCUMENT ATTACHMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.document_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('correspondence', 'contract', 'staff_request')),
  submission_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.document_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_read" ON public.document_attachments;
CREATE POLICY "attachments_read" ON public.document_attachments FOR SELECT USING (true);

DROP POLICY IF EXISTS "attachments_insert" ON public.document_attachments;
CREATE POLICY "attachments_insert" ON public.document_attachments 
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "attachments_delete_own" ON public.document_attachments;
CREATE POLICY "attachments_delete_own" ON public.document_attachments 
  FOR DELETE USING (uploaded_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_attachments_submission ON public.document_attachments(submission_type, submission_id);

-- ============================================
-- COMMENTS/NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('correspondence', 'contract')),
  submission_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.submission_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;

-- Public comments visible to all, internal only to staff
DROP POLICY IF EXISTS "comments_read" ON public.submission_comments;
CREATE POLICY "comments_read" ON public.submission_comments 
  FOR SELECT USING (
    NOT is_internal OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

DROP POLICY IF EXISTS "comments_insert" ON public.submission_comments;
CREATE POLICY "comments_insert" ON public.submission_comments 
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "comments_update_own" ON public.submission_comments;
CREATE POLICY "comments_update_own" ON public.submission_comments 
  FOR UPDATE USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS comments_updated_at ON public.submission_comments;
CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.submission_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_comments_submission ON public.submission_comments(submission_type, submission_id);

-- ============================================
-- WORKFLOW ASSIGNMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.workflow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('correspondence', 'contract')),
  submission_id UUID NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  role TEXT, -- 'reviewer', 'approver', 'drafter'
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.workflow_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_staff_all" ON public.workflow_assignments;
CREATE POLICY "workflow_staff_all" ON public.workflow_assignments 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_staff = true)
  );

CREATE INDEX IF NOT EXISTS idx_workflow_submission ON public.workflow_assignments(submission_type, submission_id);
CREATE INDEX IF NOT EXISTS idx_workflow_assigned_to ON public.workflow_assignments(assigned_to);

-- ============================================
-- SEED DATA
-- ============================================

-- Departments
INSERT INTO public.departments (code, name) VALUES
  ('SGC', 'Solicitor General''s Chambers'),
  ('MOF', 'Ministry of Finance'),
  ('MOH', 'Ministry of Health'),
  ('MOE', 'Ministry of Education'),
  ('MOJ', 'Ministry of Justice'),
  ('MFA', 'Ministry of Foreign Affairs'),
  ('MOT', 'Ministry of Tourism'),
  ('MOA', 'Ministry of Agriculture'),
  ('MOW', 'Ministry of Public Works'),
  ('PMO', 'Prime Minister''s Office'),
  ('AGC', 'Attorney General''s Chambers'),
  ('MOL', 'Ministry of Labour'),
  ('MIC', 'Ministry of Industry and Commerce'),
  ('MOY', 'Ministry of Youth'),
  ('MOS', 'Ministry of Sports')
ON CONFLICT (code) DO NOTHING;

-- Correspondence types
INSERT INTO public.correspondence_types (code, name, category, description, sla_days) VALUES
  ('LO', 'Legal Opinion', 'legal_opinion', 'Request for formal legal opinion on a matter', 14),
  ('LA', 'Legal Advice', 'legal_advice', 'Request for legal advice or guidance', 7),
  ('LIT', 'Litigation Matter', 'litigation', 'Litigation-related correspondence', 21),
  ('LEG', 'Legislation Review', 'legislation_review', 'Review of proposed legislation or regulations', 30),
  ('CR', 'Contract Review', 'contract_review', 'Review of contract terms and conditions', 14),
  ('GI', 'General Inquiry', 'general_inquiry', 'General legal inquiry', 7),
  ('COMP', 'Complaint', 'other', 'Formal complaint or grievance', 10),
  ('REQ', 'Information Request', 'general_inquiry', 'Request for information', 5),
  ('OTH', 'Other', 'other', 'Other correspondence types', 14)
ON CONFLICT (code) DO NOTHING;

-- Contract types
INSERT INTO public.contract_types (code, name, category, description, sla_days, requires_cabinet_approval, threshold_amount) VALUES
  ('GS', 'Goods & Services', 'goods_services', 'Procurement of goods and services', 21, false, 100000),
  ('CON', 'Construction', 'construction', 'Construction and infrastructure projects', 30, true, 500000),
  ('CONS', 'Consultancy', 'consultancy', 'Professional consultancy services', 21, false, 250000),
  ('LEA', 'Lease Agreement', 'lease_agreement', 'Property and equipment lease agreements', 14, false, 100000),
  ('MOU', 'Memorandum of Understanding', 'memorandum_of_understanding', 'MOUs with other parties', 21, false, NULL),
  ('GRA', 'Grant Agreement', 'grant_agreement', 'Grant funding agreements', 21, true, 100000),
  ('EMP', 'Employment Contract', 'other', 'Employment and service contracts', 14, false, NULL),
  ('LIC', 'License Agreement', 'other', 'Software and intellectual property licenses', 14, false, 50000),
  ('OTH', 'Other Contract', 'other', 'Other contract types', 21, false, NULL)
ON CONFLICT (code) DO NOTHING;
