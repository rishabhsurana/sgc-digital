# SGC Digital - Complete Database Schema Reference

## Due Diligence Summary

This document provides a comprehensive overview of all database tables, their relationships, and how they map to application features.

---

## Unified User Authentication Model

**Key Principle:** Staff users do NOT need to register separately on the Public Portal.

### How It Works

1. **Single UserProfiles Table** - All users (staff and public) are stored in one table
2. **Role-Based Access** - The `RoleId` determines which portals a user can access:
   - **Roles 1-4 (Public Users)**: Can only access Public Portal
   - **Roles 5-8 (Staff Users)**: Can access BOTH Public Portal AND Management Portal

### Role Definitions

| RoleId | RoleCode | Access |
|--------|----------|--------|
| 1 | PUBLIC_USER | Public Portal only |
| 2 | ATTORNEY | Public Portal only |
| 3 | COMPANY | Public Portal only |
| 4 | MDA_USER | Public Portal only |
| 5 | STAFF | Both Portals |
| 6 | SUPERVISOR | Both Portals |
| 7 | ADMIN | Both Portals |
| 8 | SUPER_ADMIN | Both Portals |

### Login Flow

1. User enters credentials at `/login` (Public) or `/management/login` (Staff)
2. System authenticates against `UserProfiles` table
3. If user is Staff (RoleId 5-8) logging in via Public Portal, they get access to Management Portal button
4. Session cookie stores role information for portal access control

---

## Schema Files

| File | Purpose |
|------|---------|
| `001-user-management.sql` | User profiles, roles, entity types, staff registration requests |
| `002-correspondence.sql` | Correspondence register, types, status, documents, comments |
| `003-contracts.sql` | Contracts register, types, nature, amendments, documents |
| `004-audit-activity.sql` | Audit logs and activity tracking |
| `005-views-reports.sql` | Views for dashboards and basic reports |
| `006-renewals-and-tracking.sql` | Contract renewals, SLA tracking, notifications, email queue |
| `007-entities-reports-comprehensive.sql` | Entity master table, comprehensive reporting |
| `008-ask-rex-ai-assistant.sql` | Ask Rex AI assistant tables (sessions, messages, search queries, feedback) |
| `009-missing-fields-comprehensive.sql` | All missing fields from application forms (categories, instruments, funding, etc.) |
| `010-document-requirements-junction.sql` | **NEW** - Document requirements mapping by nature/category/instrument |
| **`CONSOLIDATED_SCHEMA.sql`** | **Single file with ALL tables in correct order - USE THIS FOR DEPLOYMENT**

---

## Entity-User Relationship Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTITIES                                 │
│  (Organizations: Companies, MDAs, Law Firms, Courts, etc.)      │
├─────────────────────────────────────────────────────────────────┤
│  EntityId (PK)                                                  │
│  EntityNumber (e.g., MDA-MOF-001, COM-2024-001)                │
│  EntityTypeId → LookupEntityTypes                               │
│  OrganizationName, RegistrationNumber, TaxId                   │
│  DepartmentId → LookupDepartments (for MDAs)                   │
│  BarNumber, LawFirm (for Attorneys)                            │
│  Primary Contact Info                                           │
│  Verification Status                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ One Entity → Many Users
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER_PROFILES                               │
│  (Individual users who can submit on behalf of entity)          │
├─────────────────────────────────────────────────────────────────┤
│  UserId (PK)                                                    │
│  EntityId → Entities (FK) - Links user to their entity          │
│  Email, PasswordHash, FirstName, LastName                       │
│  EntityTypeId, EntityNumber (denormalized for quick lookup)     │
│  RoleId → LookupUserRoles                                       │
│  StatusId → LookupRequestStatus                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                 ENTITY_AUTHORIZED_USERS                          │
│  (Invited users who haven't registered yet)                     │
├─────────────────────────────────────────────────────────────────┤
│  AuthorizedUserId (PK)                                          │
│  EntityId → Entities (FK)                                        │
│  FirstName, LastName, Email, Phone, Position                    │
│  Permission flags (CanSubmit, CanView, CanEdit, etc.)           │
│  InvitedBy, InvitationToken, InvitationExpiry                   │
│  LinkedUserId → UserProfiles (when they register)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Complete Table Inventory

### 1. LOOKUP TABLES (Reference Data)

#### Core Lookups
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `LookupUserRoles` | User roles (Public, Attorney, Staff, Admin, etc.) | RoleId, RoleCode, RoleName |
| `LookupEntityTypes` | Entity types (Ministry, Court, Public, Attorney, Company) | EntityTypeId, EntityTypeCode |
| `LookupDepartments` | Government departments/MDAs | DepartmentId, DepartmentCode, Ministry |
| `LookupRequestStatus` | Registration/request statuses | StatusId, StatusCode (PENDING, APPROVED, etc.) |
| `LookupPriorityLevels` | Priority levels with SLA days | PriorityId, SLADays |
| `LookupCaseStatus` | Case/application status | CaseStatusId, StatusCategory |
| `LookupCurrencies` | Supported currencies | CurrencyId, CurrencyCode, Symbol |
| `LookupCountries` | Countries for contractor addresses | CountryId, CountryCode, IsCaribbean |

#### Contract-Specific Lookups
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `LookupContractTypes` | Contract types (New, Renewal, Supplemental) | ContractTypeId, TypeCode |
| `LookupContractNature` | Contract nature (Goods, Consultancy, Works) | ContractNatureId, NatureCode |
| `LookupContractCategories` | Categories by nature (Procurement, Lease, MOU, etc.) | CategoryId, ApplicableNatures |
| `LookupContractInstruments` | Instruments by nature (Goods, Uniforms, Consultancy-Company, etc.) | InstrumentId, ApplicableNatures |
| `LookupContractorTypes` | Contractor types (Company, Individual, Joint Venture, etc.) | ContractorTypeId, TypeCode |
| `LookupFundingSources` | Funding sources (Budget Recurrent/Capital, Grant, Loan, etc.) | FundingSourceId, SourceCode |
| `LookupProcurementMethods` | Procurement methods (Open Tender, Single Source, etc.) | ProcurementMethodId, RequiresSingleSourceApproval |
| `LookupContractDocumentTypes` | Required/optional document types per nature | DocumentTypeId, ApplicableNatures, IsRequired |
| `LookupRenewalStatus` | Renewal-specific statuses | RenewalStatusId, StatusCode |

#### Correspondence-Specific Lookups
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `LookupCorrespondenceTypes` | Types (General, Litigation, Advisory, Cabinet, etc.) | CorrespondenceTypeId, TypeCode |
| `LookupSubmitterTypes` | Submitter types (Ministry, Court, Public, Attorney, etc.) | SubmitterTypeId, RequiresOrganization |
| `LookupUrgencyLevels` | Urgency levels (Standard, Urgent) | UrgencyId, RequiresJustification, SLAMultiplier |
| `LookupConfidentialityLevels` | Confidentiality (Standard, Confidential, Cabinet) | ConfidentialityId, AccessRestrictions |
| `LookupCorrespondenceDocumentTypes` | Document types for correspondence | DocumentTypeId, DocumentTypeName |

### 2. USER MANAGEMENT TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `Entities` | Master entity/organization table | → EntityTypes, Departments, RequestStatus |
| `UserProfiles` | User accounts | → Entities, EntityTypes, Roles, Departments, Status |
| `EntityAuthorizedUsers` | Invited users per entity | → Entities, UserProfiles |
| `StaffRegistrationRequests` | Staff access requests | → Departments, Roles, Status, UserProfiles |
| `UserSessions` | Active user sessions | → UserProfiles |
| `EntityDocuments` | Entity verification documents | → Entities, UserProfiles |
| `EmailVerificationTokens` | Email/password reset tokens | → UserProfiles |

### 3. CORRESPONDENCE TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `CorrespondenceRegister` | Main correspondence submissions | → UserProfiles, Types, Priority, Status, Departments |
| `CorrespondenceStatusHistory` | Status change audit trail | → CorrespondenceRegister, CaseStatus, UserProfiles |
| `CorrespondenceComments` | Internal/external notes | → CorrespondenceRegister, UserProfiles |
| `CorrespondenceDocuments` | Attached files | → CorrespondenceRegister, UserProfiles |

### 4. CONTRACT TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `ContractsRegister` | Main contract submissions | → UserProfiles, Types, Nature, Priority, Status, Currencies |
| `ContractStatusHistory` | Status change audit trail | → ContractsRegister, CaseStatus, UserProfiles |
| `ContractComments` | Internal/external notes | → ContractsRegister, UserProfiles |
| `ContractDocuments` | Attached files | → ContractsRegister, UserProfiles |
| `ContractAmendments` | Contract modifications | → ContractsRegister, CaseStatus, UserProfiles |

### 5. RENEWAL TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `ContractRenewals` | Contract renewal requests | → ContractsRegister (original & new), RenewalStatus, UserProfiles |
| `ContractRenewalStatusHistory` | Renewal status audit trail | → ContractRenewals, RenewalStatus, UserProfiles |
| `ContractRenewalDocuments` | Renewal supporting documents | → ContractRenewals, UserProfiles |

### 6. TRACKING & NOTIFICATION TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `SLATracking` | Deadline monitoring | References any item type |
| `Notifications` | User notifications | → UserProfiles |
| `EmailQueue` | Email sending queue | References any item type |
| `EntityRegistrationHistory` | Entity registration audit | → EntityTypes, Departments, Status, UserProfiles |

### 7. REPORTING TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `ReportDefinitions` | Available reports | Standalone |
| `ReportExecutionLog` | Report execution audit | → ReportDefinitions, UserProfiles |
| `ScheduledReports` | Automated report schedules | → ReportDefinitions, UserProfiles |
| `DailyMetrics` | Daily aggregated metrics | Standalone |
| `DepartmentMetrics` | Department performance | → Departments |
| `StaffMetrics` | Staff performance | → UserProfiles |
| `ContractValueSummary` | Financial summaries | Standalone |

### 8. AUDIT TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `AuditLog` | System-wide audit trail | → UserProfiles |
| `ActivityLog` | User activity logging | → UserProfiles |

### 9. ASK REX AI ASSISTANT TABLES

| Table | Purpose | Relationships |
|-------|---------|---------------|
| `AskRexSessions` | AI conversation sessions | → UserProfiles |
| `AskRexMessages` | Individual chat messages | → AskRexSessions |
| `AskRexMessageFiles` | File/document results in messages | → AskRexMessages |
| `AskRexSearchQueries` | Search query log and analytics | → AskRexSessions, AskRexMessages, UserProfiles |
| `AskRexGeneratedReports` | Reports generated by Rex | → AskRexSessions, AskRexMessages, UserProfiles |
| `AskRexFeedback` | User feedback on responses | → AskRexMessages, AskRexSessions, UserProfiles |
| `AskRexSavedPrompts` | Saved/suggested prompts | → UserProfiles |
| `AskRexKnowledgeBase` | Custom knowledge entries | → UserProfiles |
| `AskRexDailyAnalytics` | Daily AI assistant metrics | Standalone |

---

## Database Views

### Register Views
| View | Purpose |
|------|---------|
| `vw_CorrespondenceRegister` | Correspondence with joined lookups |
| `vw_ContractsRegister` | Contracts with joined lookups |
| `vw_TransactionHistory` | Combined correspondence + contracts |
| `vw_ContractRenewals` | Renewals with full details |
| `vw_ContractsExpiringForRenewal` | Contracts expiring within 90 days |

### User/Entity Views
| View | Purpose |
|------|---------|
| `vw_UserProfiles` | Users with entity and role info |
| `vw_StaffRegistrationRequests` | Staff requests with review status |
| `vw_Entities` | Entities with user counts |
| `vw_UserRegistrations` | User registration analytics |

### Report Views
| View | Purpose |
|------|---------|
| `vw_CorrespondenceReport` | Correspondence with SLA status |
| `vw_ContractReport` | Contracts with processing metrics |
| `vw_FinancialSummary` | Contract values by period |
| `vw_SLACompliance` | SLA compliance rates |
| `vw_DashboardSummary` | Dashboard KPIs |

---

## Key Relationships Diagram

```
LookupEntityTypes ─────┬───────────────────────────────────────────┐
                       │                                           │
                       ▼                                           │
               ┌───────────────┐                                   │
               │   Entities    │◄──────────────────────────────────┤
               └───────┬───────┘                                   │
                       │                                           │
       ┌───────────────┼───────────────┐                           │
       │               │               │                           │
       ▼               ▼               ▼                           │
┌─────────────┐ ┌─────────────┐ ┌─────────────────┐               │
│UserProfiles │ │EntityAuth   │ │EntityDocuments  │               │
│             │ │orizedUsers  │ │                 │               │
└──────┬──────┘ └─────────────┘ └─────────────────┘               │
       │                                                           │
       │ Submits                                                   │
       │                                                           │
       ├───────────────────────┐                                   │
       │                       │                                   │
       ▼                       ▼                                   │
┌─────────────────┐     ┌─────────────────┐                       │
│Correspondence   │     │Contracts        │                       │
│Register         │     │Register         │                       │
└────────┬────────┘     └────────┬────────┘                       │
         │                       │                                 │
    ┌────┴────┐             ┌────┴────┐                           │
    │         │             │         │                           │
    ▼         ▼             ▼         ▼                           │
┌───────┐ ┌───────┐    ┌───────┐ ┌───────────┐                   │
│Status │ │Docs   │    │Status │ │Renewals   │                   │
│History│ │       │    │History│ │           │                   │
└───────┘ └───────┘    └───────┘ └─────┬─────┘                   │
                                       │                          │
                                       ▼                          │
                               ┌───────────────┐                  │
                               │New Contract   │──────────────────┘
                               │(when executed)│
                               └───────────────┘
```

---

## Feature Coverage Matrix

| Feature | Tables | Status |
|---------|--------|--------|
| **User Registration** | Entities, UserProfiles, EntityAuthorizedUsers, EntityDocuments | COMPLETE |
| **Multi-user per Entity** | Entities, UserProfiles, EntityAuthorizedUsers | COMPLETE |
| **Staff Registration** | StaffRegistrationRequests, UserProfiles | COMPLETE |
| **Correspondence Submission** | CorrespondenceRegister, Documents, Comments | COMPLETE |
| **Contract Submission** | ContractsRegister, Documents, Comments | COMPLETE |
| **Status Tracking** | *StatusHistory tables | COMPLETE |
| **Contract Renewals** | ContractRenewals, RenewalStatusHistory | COMPLETE |
| **Renewal Validation** | ContractRenewals (IsValidRenewal, ValidationNotes) | COMPLETE |
| **SLA Tracking** | SLATracking, DailyMetrics | COMPLETE |
| **Notifications** | Notifications, EmailQueue | COMPLETE |
| **Reporting** | ReportDefinitions, *Metrics tables, vw_* views | COMPLETE |
| **Audit Trail** | AuditLog, ActivityLog, *History tables | COMPLETE |
| **Document Management** | *Documents tables | COMPLETE |
| **Email Verification** | EmailVerificationTokens | COMPLETE |
| **Ask Rex AI Assistant** | AskRex* tables (9 tables) | COMPLETE |
| **AI Conversation History** | AskRexSessions, AskRexMessages | COMPLETE |
| **AI Search Analytics** | AskRexSearchQueries, AskRexFeedback | COMPLETE |
| **AI Generated Reports** | AskRexGeneratedReports | COMPLETE |
| **AI Knowledge Base** | AskRexKnowledgeBase, AskRexSavedPrompts | COMPLETE |
| **Document Requirements by Category** | ContractDocumentRequirements, CorrespondenceDocumentRequirements | COMPLETE |

---

## Document Requirements by Contract Nature/Category

The `010-document-requirements-junction.sql` script creates junction tables that define which documents are required or optional based on contract configuration.

### Contract Document Requirements Table

```
ContractDocumentRequirements
├── DocumentTypeId → LookupContractDocumentTypes
├── ContractNatureId → LookupContractNature (Goods/Consultancy/Works)
├── ContractCategoryId → LookupContractCategories
├── ContractInstrumentId → LookupContractInstruments  
├── ProcurementMethodId → LookupProcurementMethods
├── IsRequired (BIT)
├── IsConditional (BIT) - e.g., "Required if value > threshold"
├── RequiredForSingleSource (BIT)
├── AppliesTo ('ALL', 'NEW', 'RENEWAL', 'SUPPLEMENTAL')
└── HelpText
```

### Document Requirements by Nature

| Nature | Always Required | Optional | Single Source Required |
|--------|----------------|----------|------------------------|
| **Goods** | Acceptance of Award, Letter of Award, Payment Schedule, Specifications, Tender Documents | Draft Contract | Single Source Request, Single Source Approval |
| **Consultancy** | Acceptance of Award, Letter of Award, Payment Schedule, Schedule of Deliverables, Proposal, Tender Documents, Terms of Reference | Business Registration, Certificate of Good Standing, Incorporation Docs, Performance Bond, Surety, Draft Contract, Letter of Engagement, Cabinet Paper*, Cabinet Approval* | Single Source Request, Single Source Approval |
| **Works** | Acceptance of Award, Letter of Award, Payment Schedule, Bill of Quantities, Drawings/Plans, Tender Documents | Performance Bond, Surety, Draft Contract, Cabinet Paper*, Cabinet Approval* | Single Source Request, Single Source Approval |

*Cabinet documents are conditional - required when contract value exceeds Cabinet threshold.

### Stored Procedure for Document Requirements

```sql
EXEC sp_GetContractDocumentRequirements 
    @NatureCode = 'CONSULTANCY',
    @CategoryCode = 'CAT_CONS',
    @InstrumentCode = 'CONS_CO',
    @ProcurementMethodCode = 'SINGLE_SOURCE',
    @ContractType = 'NEW',
    @IsSingleSource = 1;
```

Returns all required/optional documents for the specified contract configuration.

---

## Application Page → Database Mapping

| Page | Primary Tables Used |
|------|---------------------|
| `/register` | Entities, UserProfiles, EntityAuthorizedUsers |
| `/login` | UserProfiles, UserSessions |
| `/dashboard` | vw_DashboardSummary, Correspondence, Contracts |
| `/correspondence` | CorrespondenceRegister, Documents, StatusHistory |
| `/contracts` | ContractsRegister, Documents, StatusHistory, Renewals |
| `/management/users` | UserProfiles, Entities, vw_UserProfiles |
| `/management/mda` | Entities, EntityAuthorizedUsers, vw_Entities |
| `/management/registers` | vw_CorrespondenceRegister, vw_ContractsRegister |
| `/management/reports` | ReportDefinitions, vw_* views, *Metrics tables |
| `/case-management/*` | Correspondence/Contracts + Status, Comments, Docs |

---

## Data Validation Rules

### Renewal Validation
1. Original contract must exist and be in completed/active status
2. No duplicate pending renewals for same contract
3. Proposed start date must be >= original contract expiry
4. Value increases > 25% require additional justification
5. Counterparty changes must be explicitly flagged

### Entity Registration
1. Entity number must be unique
2. Email must be unique per entity type
3. Companies require registration number
4. Attorneys require bar number
5. Government entities require department selection

### User-Entity Association
1. Users must belong to an entity
2. Entity admins can invite additional users
3. Invited users must accept invitation to register
4. Maximum authorized users per entity is configurable

---

## Execution Order

**RECOMMENDED: Use `CONSOLIDATED_SCHEMA.sql` for a single-file deployment.**

Or execute individual scripts in numeric order:
1. `001-user-management.sql` - Creates base lookup and user tables
2. `002-correspondence.sql` - Creates correspondence tables (depends on 001)
3. `003-contracts.sql` - Creates contract tables (depends on 001, 002)
4. `004-audit-activity.sql` - Creates audit tables (depends on 001)
5. `005-views-reports.sql` - Creates views (depends on all above)
6. `006-renewals-and-tracking.sql` - Creates renewal and tracking tables
7. `007-entities-reports-comprehensive.sql` - Creates entity master and report tables
8. `008-ask-rex-ai-assistant.sql` - Creates Ask Rex AI assistant tables
9. `009-missing-fields-comprehensive.sql` - Adds missing form fields (categories, instruments, funding)
10. `010-document-requirements-junction.sql` - Document requirements by nature/category

---

## Download Instructions

To download the database schema:

1. **Download ZIP** - Click the three dots (...) in the top right → "Download ZIP"
2. Schema files are in `/scripts/mssql/`
3. Use `CONSOLIDATED_SCHEMA.sql` for complete deployment

---

## Total Database Objects

| Object Type | Count |
|-------------|-------|
| Tables | 80+ |
| Lookup Tables | 25+ |
| Junction Tables | 2 |
| Views | 17+ |
| Indexes | 110+ |
| Stored Procedures | 1 (sp_GetContractDocumentRequirements) |

---

## New Tables in 009-missing-fields-comprehensive.sql

This script adds all the missing fields that were captured in the application forms but not in the original database schema:

### New Lookup Tables Added

| Table | Purpose | Seed Data |
|-------|---------|-----------|
| `LookupContractCategories` | Categories like Procurement, Lease, MOU, Construction | 7 categories |
| `LookupContractInstruments` | Instruments like Goods, Uniforms, Consultancy-Company, Works | 10 instruments |
| `LookupContractorTypes` | Company, Individual, Joint Venture, Government, NGO | 5 types |
| `LookupFundingSources` | Budget (Recurrent/Capital), Grant, Loan, Mixed | 6 sources |
| `LookupProcurementMethods` | Open Tender, Selective, Single Source, Framework, Direct, Emergency | 6 methods |
| `LookupCountries` | Caribbean and international countries | 14 countries |
| `LookupContractDocumentTypes` | All required/optional documents by contract nature | 22 document types |
| `LookupSubmitterTypes` | Ministry, Court, Statutory, Public, Attorney, Other | 6 types |
| `LookupUrgencyLevels` | Standard, Urgent (with SLA multiplier) | 2 levels |
| `LookupConfidentialityLevels` | Standard, Confidential, Cabinet-Level | 3 levels |
| `LookupCorrespondenceDocumentTypes` | Correspondence, Supporting, Court Doc, Cabinet Paper, etc. | 7 types |

### New Columns Added to ContractsRegister

| Column | Type | Purpose |
|--------|------|---------|
| `ContractCategoryId` | INT FK | Links to LookupContractCategories |
| `ContractInstrumentId` | INT FK | Links to LookupContractInstruments |
| `ContractInstrumentOther` | NVARCHAR(200) | Custom instrument if "Other" selected |
| `CategoryOtherJustification` | NVARCHAR(MAX) | Required justification for "Other" category |
| `IsRenewal` | BIT | Flag for renewal contracts |
| `IsSupplemental` | BIT | Flag for supplemental contracts |
| `ParentContractId` | UNIQUEIDENTIFIER FK | Links to original contract for renewals |
| `ParentContractNumber` | NVARCHAR(100) | Original contract reference number |
| `MinistryFileReference` | NVARCHAR(100) | Ministry's internal file reference |
| `ContractorTypeId` | INT FK | Links to LookupContractorTypes |
| `ContractorCity` | NVARCHAR(100) | Contractor city |
| `ContractorCountryId` | INT FK | Links to LookupCountries |
| `CompanyRegistrationNumber` | NVARCHAR(100) | Company registration number |
| `TaxIdentificationNumber` | NVARCHAR(100) | Tax ID / TIN |
| `ScopeOfWork` | NVARCHAR(MAX) | Detailed scope of work |
| `KeyDeliverables` | NVARCHAR(MAX) | List of key deliverables |
| `FundingSourceId` | INT FK | Links to LookupFundingSources |
| `ProcurementMethodId` | INT FK | Links to LookupProcurementMethods |
| `IsSingleSource` | BIT | Flag for single source procurement |
| `SingleSourceJustification` | NVARCHAR(MAX) | Required justification for single source |
| `AwardDate` | DATE | Date of contract award |
| `RenewalTermMonths` | INT | Renewal term in months |
| `MissingDocumentReason` | NVARCHAR(MAX) | Explanation for missing required documents |

### New Columns Added to CorrespondenceRegister

| Column | Type | Purpose |
|--------|------|---------|
| `SubmitterTypeId` | INT FK | Links to LookupSubmitterTypes |
| `UrgencyId` | INT FK | Links to LookupUrgencyLevels |
| `UrgentReason` | NVARCHAR(MAX) | Required justification for urgent requests |
| `ConfidentialityId` | INT FK | Links to LookupConfidentialityLevels |
| `RegistryFileNumber` | NVARCHAR(100) | SGC Registry file number if known |
| `CourtFileNumber` | NVARCHAR(100) | Court file number for litigation matters |
| `MinistryFileReference` | NVARCHAR(100) | Ministry's internal file reference |
| `ContactUnit` | NVARCHAR(200) | Contact unit/section within organization |
| `RequestingDepartmentId` | INT FK | Links to LookupDepartments for MDA submitters |

### Document Tables Updates

Both `ContractDocuments` and `CorrespondenceDocuments` tables now have a `DocumentTypeId` foreign key linking to their respective document type lookup tables.
