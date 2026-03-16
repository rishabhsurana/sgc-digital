// SGC Digital - Classification Taxonomy & Metadata Constants
// Based on: Contracts_Module_Classification_Taxonomy_Metadata_v14_28Feb2026
// Based on: Registry_Module_Classification_Taxonomy_Metadata_v2_25Feb2026

// ============================================
// CONTRACTS MODULE - CONTROLLED VOCABULARIES
// ============================================

export const CONTRACT_TYPES = [
  { code: "NEW", label: "New", description: "New contract case" },
  { code: "SUP", label: "Supplemental", description: "Supplemental (amendment/supplement) contract case" },
  { code: "REN", label: "Renewal", description: "Renewal contract case" }
] as const

export const CONTRACT_NATURE = [
  { code: "NAT_GDS", label: "Goods", description: "Nature of contract = Goods" },
  { code: "NAT_CSV", label: "Consultancy / Services", description: "Nature of contract = Consultancy / Services" },
  { code: "NAT_WKS", label: "Works", description: "Nature of contract = Works" }
] as const

export const CONTRACT_CATEGORIES = [
  { code: "CAT_PROC", label: "Procurement of Goods & Services", description: "Purchase of goods or services" },
  { code: "CAT_CONS", label: "Consultancy / Professional Services", description: "Advisory, consultancy, specialist services" },
  { code: "CAT_EMP", label: "Employment / Personnel", description: "Employment-related contracts" },
  { code: "CAT_CONST", label: "Construction / Public Works", description: "Construction & infrastructure works" },
  { code: "CAT_LEASE", label: "Lease / Property", description: "Leasing of property/assets" },
  { code: "CAT_MOU", label: "Inter-Agency / MOU", description: "MOUs, inter-government agreements" },
  { code: "CAT_OTHER", label: "Other", description: "Exceptional category (use only when none of the standard categories apply)" }
] as const

// Nature -> Category Rules (which categories are allowed for each nature)
export const NATURE_CATEGORY_RULES: Record<string, string[]> = {
  "NAT_GDS": ["CAT_PROC", "CAT_LEASE", "CAT_MOU"], // Goods
  "NAT_CSV": ["CAT_PROC", "CAT_CONS", "CAT_EMP", "CAT_MOU"], // Consultancy/Services
  "NAT_WKS": ["CAT_PROC", "CAT_CONST", "CAT_MOU", "CAT_OTHER"] // Works
}

export const CONTRACT_INSTRUMENT_TYPES = [
  { code: "GDS", label: "Goods", description: "Standard goods contract template", nature: "NAT_GDS" },
  { code: "UNI", label: "Uniforms", description: "Uniforms supply/manufacture contract template", nature: "NAT_GDS" },
  { code: "SVC", label: "Services", description: "Standard services contract template with a company", nature: "NAT_CSV" },
  { code: "CLEAN", label: "Cleaning Services", description: "Cleaning services contract template", nature: "NAT_CSV" },
  { code: "CONS_CO", label: "Consultancy - Company", description: "Consultancy contract template with a company/firm", nature: "NAT_CSV" },
  { code: "CONS_IND", label: "Consultant/Independent Contractor", description: "Consultant/independent contractor template", nature: "NAT_CSV" },
  { code: "IC", label: "Individual Consultant", description: "Individual consultant contract template (standard/local)", nature: "NAT_CSV" },
  { code: "IC_IDB", label: "Individual Consultant (IDB-funded)", description: "IDB-financed individual consulting services contract", nature: "NAT_CSV" },
  { code: "WKS", label: "Works", description: "Standard works contract template", nature: "NAT_WKS" },
  { code: "OTHER", label: "Other", description: "Non-standard template family; bespoke drafting required", nature: null }
] as const

export const CONTRACT_STATUS = [
  { code: "INTAKE", label: "New / Intake Validation", description: "Contract received/created; intake validation in progress" },
  { code: "ASSIGNED", label: "Assigned to Officer", description: "Legal Officer assigned by DSG/Supervisor" },
  { code: "DRAFTING", label: "Drafting", description: "Legal Officer drafting and internal preparation" },
  { code: "SUP_REVIEW", label: "With DSG/Supervisor Review", description: "Submitted for supervisor review/approval" },
  { code: "SENT_MDA", label: "Sent to Ministry", description: "Draft sent to originating Ministry/MDA for review" },
  { code: "RETURNED_MDA", label: "Returned from Ministry", description: "Ministry response/comments received" },
  { code: "FINAL_SIG", label: "Finalization / Signature", description: "Faired contract prepared; parties sign" },
  { code: "EXEC_ADJ", label: "Execution / Adjudication", description: "With Legal Assistant / Supreme Court Registration Dept for adjudication stamp" },
  { code: "ADJ_COMP", label: "Adjudicated/Completed", description: "Stamped/adjudicated contract scanned & uploaded; dispatched to originating Ministry/MDA" },
  { code: "CLOSED", label: "Closed", description: "Case closed; retention begins" },
  { code: "RETURNED_CORR", label: "Returned for Correction", description: "Returned to Legal Officer for corrections" },
  { code: "REJECTED", label: "Rejected", description: "Contract rejected/terminated in workflow" }
] as const

export const FUNDING_SOURCES = [
  { code: "GOB", label: "Government of Barbados", description: "Funded directly by Government of Barbados" },
  { code: "IDB", label: "Inter-American Development Bank (IDB)", description: "IDB-financed or IDB-governed procurement/consulting contract" },
  { code: "OTHER_DONOR", label: "Other Donor/IFIs", description: "Other donor financed" }
] as const

export const PROCUREMENT_METHODS = [
  { code: "TENDER", label: "Open Tender", description: "Open competitive tender process" },
  { code: "RFQ", label: "Limited Tender", description: "Limited tender / RFQ process (restricted quotations)" },
  { code: "DIRECT", label: "Direct Purchase", description: "Direct purchase / direct contracting (where permitted)" },
  { code: "SSP", label: "Single Source", description: "Single source procurement (requires justification/approval)" },
  { code: "OTHER", label: "Other", description: "Other procurement method (specify)" }
] as const

export const CONTRACTING_PARTY_SCOPE = [
  { code: "Local", label: "Local", description: "All parties domiciled/registered in Barbados" },
  { code: "Regional", label: "Regional", description: "At least one party from CARICOM/region" },
  { code: "International", label: "International", description: "At least one party international" }
] as const

export const CURRENCIES = [
  { code: "BBD", label: "Barbados Dollar", symbol: "$" },
  { code: "USD", label: "US Dollar", symbol: "US$" },
  { code: "OTHER", label: "Other", symbol: "" }
] as const

export const RETURN_TO_MDA_REASONS = [
  { code: "Missing Documents", label: "Missing Documents", description: "Required documents missing" },
  { code: "Clarification Required", label: "Clarification Required", description: "Clarification required from Ministry/MDA" },
  { code: "Incorrect Template", label: "Incorrect Template", description: "Incorrect template/contract type used" },
  { code: "Policy Approval Missing", label: "Policy Approval Missing", description: "Policy/Cabinet/CPO approval missing" },
  { code: "Other", label: "Other", description: "Other reason (specify)" }
] as const

export const INTAKE_VALIDATION_STATUS = [
  { code: "Validated", label: "Validated", description: "Intake validated; mandatory docs satisfied" },
  { code: "Missing Documents", label: "Missing Documents", description: "Mandatory docs missing (requires follow-up)" },
  { code: "Returned to MDA", label: "Returned to MDA", description: "Returned to Ministry/MDA for additional information" },
  { code: "Rejected", label: "Rejected", description: "Rejected at intake" }
] as const

export const MANDATORY_DOCS_CHECKLIST_STATUS = [
  { code: "Complete", label: "Complete", description: "All required documents provided" },
  { code: "Incomplete", label: "Incomplete", description: "Required documents missing" },
  { code: "Waived", label: "Waived", description: "Waived by DSG/SG with recorded reason" }
] as const

export const REGISTRY_FILE_ASSOCIATION_STATUS = [
  { code: "Not Started", label: "Not Started", description: "Registry file association task not yet commenced" },
  { code: "In Progress", label: "In Progress", description: "Searching/scanning legacy files" },
  { code: "Linked", label: "Linked", description: "Legacy file(s) linked to contract case" },
  { code: "No File Found", label: "No File Found", description: "No prior file found / new contract" },
  { code: "Completed", label: "Completed", description: "Task completed and verified" }
] as const

export const URGENCY_LEVELS = [
  { code: "Normal", label: "Normal", description: "Standard processing" },
  { code: "Urgent", label: "Urgent", description: "Urgent/priority processing" }
] as const

export const SECURITY_LEVELS = [
  { code: "PUBLIC", label: "Public", description: "May be disclosed publicly" },
  { code: "INTERNAL", label: "Internal", description: "Internal government use; not public" },
  { code: "CONF", label: "Confidential", description: "Confidential; restricted access" },
  { code: "LEGAL_PRIV", label: "Legal Privileged", description: "Attorney-client / litigation privilege; strict access controls" }
] as const

export const SUBMISSION_CHANNELS = [
  { code: "Portal", label: "Portal", description: "Submitted via online portal" },
  { code: "Email", label: "Email", description: "Submitted via email" },
  { code: "Paper", label: "Paper", description: "Paper submission/scanned at intake" }
] as const

export const DISPATCH_MODES = [
  { code: "DIGITAL", label: "Digital (Email/Portal)", description: "Dispatched electronically (email/portal)" },
  { code: "PHYSICAL", label: "Physical (Paper)", description: "Dispatched as paper original/copy (courier/hand-delivery)" },
  { code: "BOTH", label: "Both Digital & Physical", description: "Dispatched both electronically and in paper form" }
] as const

export const DOCUMENT_STATUS = [
  { code: "DRAFT", label: "Draft", description: "Working draft" },
  { code: "FOR_REVIEW", label: "For Review", description: "Submitted for review/comment" },
  { code: "FINAL", label: "Final", description: "Finalised but not necessarily signed" },
  { code: "SIGNED", label: "Signed/Executed", description: "Signed by authorized signatories" },
  { code: "ADJUDICATED", label: "Adjudicated (Stamped)", description: "Stamped 'Adjudicated' by the Supreme Court Registration Department" },
  { code: "SCANNED", label: "Scanned Copy", description: "Digital scan of a physical original document" },
  { code: "SUPERSEDED", label: "Superseded", description: "Replaced by a later version" },
  { code: "CANCELLED", label: "Cancelled/Void", description: "Cancelled or declared void" }
] as const

export const APPROVAL_DECISIONS = [
  { code: "Approved", label: "Approved", description: "Approved by SG/DSG" },
  { code: "Rejected", label: "Rejected", description: "Rejected/terminated" },
  { code: "Returned for Correction", label: "Returned for Correction", description: "Returned to Legal Officer for corrections" },
  { code: "Returned to MDA", label: "Returned to MDA", description: "Returned to Ministry/MDA for additional info" }
] as const

// Contracts Document Types (hierarchical)
export const CONTRACT_DOCUMENT_TYPES = [
  // Award & Contract Formation
  { code: "FORM", label: "Award & Contract Formation", parent: null, level: 1 },
  { code: "FORM_LOA", label: "Letter of Award", parent: "FORM", level: 2 },
  { code: "FORM_LOE", label: "Letter of Engagement", parent: "FORM", level: 2 },
  { code: "FORM_ACCEPT", label: "Acceptance of Award", parent: "FORM", level: 2 },
  { code: "FORM_DRAFT", label: "Draft Contract", parent: "FORM", level: 2 },
  { code: "FORM_EXEC", label: "Executed/Adjudicated Contract", parent: "FORM", level: 2 },
  { code: "FORM_COND", label: "Conditions of Contract", parent: "FORM", level: 2 },
  { code: "FORM_TEMPL", label: "Contract Template", parent: "FORM", level: 2 },
  { code: "FORM_APPEND", label: "Appendices/Attachments", parent: "FORM", level: 2 },
  { code: "FORM_ADJ", label: "Court Registration & Adjudication", parent: "FORM", level: 2 },
  { code: "FORM_ADJ_REC", label: "Supreme Court Registration Receipt", parent: "FORM_ADJ", level: 3 },
  { code: "FORM_ADJ_STAMP", label: "Adjudication Stamp Evidence", parent: "FORM_ADJ", level: 3 },
  { code: "FORM_ADJ_SUB", label: "Adjudication Submission Sheet", parent: "FORM_ADJ", level: 3 },
  
  // Award Package / Source Documents
  { code: "PROC", label: "Award Package / Source Documents", parent: null, level: 1 },
  { code: "PROC_TOR", label: "Terms of Reference", parent: "PROC", level: 2 },
  { code: "PROC_SCOPE", label: "Scope of Works", parent: "PROC", level: 2 },
  { code: "PROC_SPECS", label: "Specifications", parent: "PROC", level: 2 },
  { code: "PROC_TENDER", label: "Tender Documents", parent: "PROC", level: 2 },
  { code: "PROC_PROP", label: "Proposal", parent: "PROC", level: 2 },
  { code: "PROC_PROP_TECH", label: "Technical Proposal", parent: "PROC_PROP", level: 3 },
  { code: "PROC_PROP_FIN", label: "Financial Proposal", parent: "PROC_PROP", level: 3 },
  { code: "PROC_CAB_PAPER", label: "Cabinet Paper", parent: "PROC", level: 2 },
  { code: "PROC_CAB_APPR", label: "Cabinet Approval", parent: "PROC", level: 2 },
  { code: "PROC_SSP_REQ", label: "Single Source Procurement Request", parent: "PROC", level: 2 },
  { code: "PROC_SSP_APPR", label: "Single Source Approval", parent: "PROC", level: 2 },
  
  // Supplier Due Diligence
  { code: "DUE", label: "Supplier Due Diligence", parent: null, level: 1 },
  { code: "DUE_INCORP", label: "Company Incorporation Documents", parent: "DUE", level: 2 },
  { code: "DUE_BUS_REG", label: "Business Registration", parent: "DUE", level: 2 },
  { code: "DUE_GS", label: "Certificate of Good Standing", parent: "DUE", level: 2 },
  { code: "DUE_INS", label: "Insurance Certificates", parent: "DUE", level: 2 },
  { code: "DUE_LIC", label: "Licences/Permits", parent: "DUE", level: 2 },
  
  // Financial & Security
  { code: "FIN", label: "Financial & Security", parent: null, level: 1 },
  { code: "FIN_BOND", label: "Performance Bond", parent: "FIN", level: 2 },
  { code: "FIN_SURETY", label: "Proof of Surety", parent: "FIN", level: 2 },
  { code: "FIN_TREAS", label: "Treasury Receipt/Deposit", parent: "FIN", level: 2 },
  { code: "FIN_INV", label: "Invoice", parent: "FIN", level: 2 },
  { code: "FIN_PAY", label: "Payment Record", parent: "FIN", level: 2 },
  
  // Compliance (IDB)
  { code: "COMP", label: "Compliance", parent: null, level: 1 },
  { code: "COMP_IDB", label: "IDB Documentation", parent: "COMP", level: 2 },
  { code: "COMP_IDB_EIC", label: "Eligibility & Integrity Certificate", parent: "COMP_IDB", level: 3 },
  { code: "COMP_IDB_COI", label: "IDB Conflict of Interest Clause", parent: "COMP_IDB", level: 3 },
  { code: "COMP_IDB_PP", label: "IDB Prohibited Practices Clauses", parent: "COMP_IDB", level: 3 },
  
  // Administration & Correspondence
  { code: "ADMIN", label: "Administration & Correspondence", parent: null, level: 1 },
  { code: "ADMIN_EMAIL", label: "Email Correspondence", parent: "ADMIN", level: 2 },
  { code: "ADMIN_LET", label: "Letter Correspondence", parent: "ADMIN", level: 2 },
  { code: "ADMIN_MIN", label: "Minute / Internal Memorandum", parent: "ADMIN", level: 2 },
  { code: "ADMIN_VAR", label: "Variation/Amendment", parent: "ADMIN", level: 2 },
  { code: "ADMIN_EXT", label: "Extension of Time", parent: "ADMIN", level: 2 },
  { code: "ADMIN_TERM", label: "Termination Notice", parent: "ADMIN", level: 2 },
  { code: "ADMIN_REP", label: "Reports/Deliverables", parent: "ADMIN", level: 2 },
  { code: "ADMIN_DISP", label: "Dispute/Arbitration", parent: "ADMIN", level: 2 },
  { code: "ADMIN_DISPATCH", label: "Dispatch & Distribution", parent: "ADMIN", level: 2 },
  { code: "ADMIN_DISPATCH_NOTE", label: "Cover Letter / Dispatch Note", parent: "ADMIN_DISPATCH", level: 3 },
  { code: "ADMIN_DISPATCH_EMAIL", label: "Email to Ministry (Dispatch)", parent: "ADMIN_DISPATCH", level: 3 },
  { code: "ADMIN_DISPATCH_PROOF", label: "Courier/Hand-delivery Proof", parent: "ADMIN_DISPATCH", level: 3 },
  { code: "ADMIN_DISPATCH_ACK", label: "Ministry Acknowledgement of Receipt", parent: "ADMIN_DISPATCH", level: 3 },
  
  // Closeout
  { code: "CLOSE", label: "Closeout", parent: null, level: 1 },
  { code: "CLOSE_COMP_CERT", label: "Completion Certificate", parent: "CLOSE", level: 2 },
  { code: "CLOSE_FINAL_ACC", label: "Final Acceptance", parent: "CLOSE", level: 2 },
  { code: "CLOSE_AUDIT", label: "Audit/Review", parent: "CLOSE", level: 2 }
] as const

// ============================================
// REGISTRY/CORRESPONDENCE MODULE - CONTROLLED VOCABULARIES
// ============================================

export const CORRESPONDENCE_TYPES = [
  { code: "GENERAL", label: "General Correspondence", description: "General correspondence matters" },
  { code: "LITIGATION", label: "Litigation", description: "Litigation intake only; full litigation workflow out of scope" },
  { code: "COMPENSATION", label: "Compensation", description: "Compensation/injury matters" },
  { code: "PUBLIC_TRUSTEE", label: "Public Trustee", description: "Public Trustee matters" },
  { code: "ADVISORY", label: "Advisory", description: "Legal advisory/opinion matters" },
  { code: "INTERNATIONAL_LAW", label: "International Law", description: "International/foreign matters" },
  { code: "CABINET_CONF", label: "Cabinet / Confidential", description: "High confidentiality; restricted security/queue" }
] as const

export const REGISTRY_FILE_TYPES = [
  { code: "LOCAL", label: "Local Registry File", description: "Digital local file created for every matter" },
  { code: "FOREIGN", label: "Foreign / Ministry File", description: "External ministry file reference (legacy continuity)" },
  { code: "COURT", label: "Court File", description: "Court file reference" },
  { code: "PUBLIC_TRUSTEE", label: "Public Trustee File", description: "Public Trustee file reference" },
  { code: "COMPENSATION", label: "Compensation File", description: "Compensation file reference" },
  { code: "ADVISORY", label: "Advisory File", description: "Advisory file reference" }
] as const

export const SECURITY_PROFILES = [
  { code: "STANDARD", label: "Standard", description: "Normal access per Registry role matrix" },
  { code: "CONFIDENTIAL", label: "Confidential", description: "Restricted access (need-to-know)" },
  { code: "CABINET", label: "Cabinet-Restricted", description: "Highly restricted (SG/Secretary only or equivalent)" }
] as const

export const REGISTRY_CASE_STATUS = [
  { code: "NEW", label: "New", description: "Case created; pending review" },
  { code: "PENDING_REVIEW", label: "Pending SG/DSG Review", description: "In SG/DSG review queue" },
  { code: "ASSIGNED", label: "Assigned / In Progress", description: "Officer assigned and working" },
  { code: "PENDING_EXTERNAL", label: "Pending External", description: "Waiting for external response/feedback" },
  { code: "ON_HOLD", label: "On Hold", description: "Temporarily paused" },
  { code: "CLOSED", label: "Closed", description: "Completed and closed" },
  { code: "CANCELLED", label: "Cancelled", description: "Cancelled/void" }
] as const

export const ORIGINATING_ENTITY_TYPES = [
  { code: "MDA", label: "Ministry / Department / Agency", description: "Government MDA / SOE" },
  { code: "COURT", label: "Court", description: "Court document sender" },
  { code: "ATTORNEY", label: "Attorney / Law Firm", description: "External attorney/law firm" },
  { code: "PUBLIC", label: "Member of the Public", description: "Citizen or business" },
  { code: "OTHER", label: "Other", description: "Other originator type" }
] as const

export const INTERNAL_RECIPIENTS = [
  { code: "SG", label: "Solicitor General", description: "Addressed to SG" },
  { code: "DSG", label: "Deputy Solicitor General", description: "Addressed to DSG" },
  { code: "SECRETARY", label: "SG Secretary", description: "Addressed to SG Secretary" },
  { code: "OTHER", label: "Other", description: "Other internal recipient" }
] as const

export const NOTE_TYPES = [
  { code: "DIRECTIVE", label: "Directive", description: "SG/DSG directive/instruction" },
  { code: "APPROVAL", label: "Approval", description: "Approval record" },
  { code: "COMMENT", label: "Comment", description: "General comment/note" }
] as const

export const SUPPORTING_DOC_TYPES = [
  { code: "REPORT", label: "Report", description: "Supporting report" },
  { code: "ID", label: "ID Copy", description: "Identity document copy" },
  { code: "FORM", label: "Form", description: "Form or application" },
  { code: "EVIDENCE", label: "Evidence / Exhibit", description: "Evidence or exhibit" },
  { code: "OTHER", label: "Other", description: "Other supporting document type" }
] as const

// Registry Document Types
export const REGISTRY_DOCUMENT_TYPES = [
  { code: "INCOMING", label: "Incoming Correspondence", description: "Initiating or incoming correspondence (letter/email/portal PDF)" },
  { code: "OUTGOING", label: "Outgoing Correspondence", description: "Final signed response/official outgoing correspondence" },
  { code: "COURT_DOC", label: "Court Documents", description: "Court documents (litigation intake only)" },
  { code: "MINUTE", label: "Minute Sheet / Internal Note", description: "Internal minute/directive/approval note" },
  { code: "SUPPORTING", label: "Supporting Documents", description: "Attachments and supporting documents" },
  { code: "LEGACY_SCAN", label: "Scanned Legacy Files", description: "Scanned legacy file jacket/pages linked during association" },
  { code: "COVER_SHEET", label: "Registry Cover Sheet", description: "System-generated cover sheet / case summary" },
  { code: "DISPATCH_PROOF", label: "Dispatch Proof", description: "Courier slip / email proof / portal dispatch proof" },
  { code: "ACK", label: "Acknowledgement of Receipt", description: "Acknowledgement received from recipient" }
] as const

// ============================================
// LEGAL OFFICERS (from Contracts taxonomy)
// ============================================

export const LEGAL_OFFICERS = [
  { code: "JSMALL_DSG", label: "Jennifer Small (DSG)", role: "Deputy Solicitor General" },
  { code: "ASTOUTE_SCAG", label: "Ashley Stoute-Straker (SC (Ag))", role: "State Counsel (Acting)" },
  { code: "CFORDE_SSCAG", label: "Cyrilene Forde (SSC (Ag))", role: "Senior State Counsel (Acting)" },
  { code: "SDEANE_PSC", label: "Sharon Deane (PSC)", role: "Principal State Counsel" },
  { code: "SJONES_SCAG", label: "Shoné Jones (SC (Ag))", role: "State Counsel (Acting)" }
] as const

// ============================================
// ORIGINATING MDAs (Government Ministries/Departments/Agencies)
// ============================================

export const ORIGINATING_MDAS = [
  { code: "MOF", label: "Ministry of Finance" },
  { code: "MPW", label: "Ministry of Public Works" },
  { code: "MOH", label: "Ministry of Health" },
  { code: "MOE", label: "Ministry of Education" },
  { code: "MIB", label: "Ministry of International Business" },
  { code: "MLSS", label: "Ministry of Labour and Social Security" },
  { code: "MAF", label: "Ministry of Agriculture and Food" },
  { code: "MTGI", label: "Ministry of Tourism and International Transport" },
  { code: "MESWM", label: "Ministry of Environment and National Beautification" },
  { code: "MHTE", label: "Ministry of Home Affairs" },
  { code: "OPM", label: "Office of the Prime Minister" },
  { code: "AGC", label: "Attorney General's Chambers" },
  { code: "CAB", label: "Cabinet Office" },
  { code: "OTHER", label: "Other MDA" }
] as const

// ============================================
// USER ROLES AND PERMISSIONS
// ============================================

export const USER_ROLES = {
  // Registry/Correspondence roles
  PORTAL_USER: "Portal Applicant / Ministry User",
  REGISTRY_SENIOR_CLERK: "Registry Senior Clerk",
  REGISTRY_FILING_CLERK: "Registry Filing Clerk",
  SG_SECRETARY: "SG Secretary / Legal Admin Assistant",
  LEGAL_OFFICER: "Legal Officer",
  DSG: "Deputy Solicitor General (DSG)",
  SG: "Solicitor General (SG)",
  
  // Contracts-specific roles
  CONTRACTS_INTAKE_OFFICER: "Contracts Intake Officer",
  LEGAL_ASSISTANT: "Legal Assistant (Execution/Adjudication)",
  REGISTRY_FILE_ASSOC_OFFICER: "Registry File Association Officer",
  RECORDS_COMPLIANCE_OFFICER: "Records/Compliance Officer",
  SYSTEM_ADMIN: "System Administrator"
} as const

export const ROLE_PERMISSIONS = {
  // SG can do everything
  SG: {
    canViewAllCases: true,
    canAssignOfficers: true,
    canApprove: true,
    canEditDates: true,
    canClose: true,
    canViewConfidential: true,
    canViewCabinet: true
  },
  DSG: {
    canViewAllCases: true,
    canAssignOfficers: true,
    canApprove: true,
    canEditDates: true,
    canClose: true,
    canViewConfidential: true,
    canViewCabinet: false // Unless explicitly granted
  },
  LEGAL_OFFICER: {
    canViewAllCases: false, // Only assigned cases
    canAssignOfficers: false,
    canApprove: false,
    canEditDates: false,
    canClose: false,
    canViewConfidential: false, // Only if assigned
    canViewCabinet: false
  },
  SG_SECRETARY: {
    canViewAllCases: false,
    canAssignOfficers: false,
    canApprove: false,
    canEditDates: false,
    canClose: false,
    canViewConfidential: true,
    canViewCabinet: true
  },
  REGISTRY_SENIOR_CLERK: {
    canViewAllCases: true,
    canAssignOfficers: false,
    canApprove: false,
    canEditDates: true,
    canClose: true,
    canViewConfidential: false,
    canViewCabinet: false
  }
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCategoriesForNature(natureCode: string): typeof CONTRACT_CATEGORIES[number][] {
  const allowedCodes = NATURE_CATEGORY_RULES[natureCode] || []
  return CONTRACT_CATEGORIES.filter(cat => allowedCodes.includes(cat.code))
}

export function getInstrumentTypesForNature(natureCode: string): typeof CONTRACT_INSTRUMENT_TYPES[number][] {
  return CONTRACT_INSTRUMENT_TYPES.filter(
    inst => inst.nature === natureCode || inst.nature === null
  )
}

export function getRecommendedFileTypes(correspondenceType: string): string[] {
  const recommendations: Record<string, string[]> = {
    LITIGATION: ["LOCAL", "COURT"],
    COMPENSATION: ["LOCAL", "COMPENSATION"],
    PUBLIC_TRUSTEE: ["LOCAL", "PUBLIC_TRUSTEE"],
    ADVISORY: ["LOCAL", "ADVISORY"]
  }
  return recommendations[correspondenceType] || ["LOCAL"]
}

export function getSecurityProfileForCorrespondenceType(
  correspondenceType: string, 
  isConfidential: boolean
): string {
  if (correspondenceType === "CABINET_CONF") return "CABINET"
  if (isConfidential) return "CONFIDENTIAL"
  return "STANDARD"
}
