# SGC Digital - Complete Database Schema Reference

## Due Diligence Summary

This document provides a comprehensive overview of all database tables, their relationships, and how they map to application features.

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

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `LookupUserRoles` | User roles (Public, Attorney, Staff, Admin, etc.) | RoleId, RoleCode, RoleName |
| `LookupEntityTypes` | Entity types (Ministry, Court, Public, Attorney, Company) | EntityTypeId, EntityTypeCode |
| `LookupDepartments` | Government departments/MDAs | DepartmentId, DepartmentCode, Ministry |
| `LookupRequestStatus` | Registration/request statuses | StatusId, StatusCode (PENDING, APPROVED, etc.) |
| `LookupCorrespondenceTypes` | Correspondence categories | CorrespondenceTypeId, TypeCode |
| `LookupContractTypes` | Contract types (Goods, Services, Works, etc.) | ContractTypeId, TypeCode |
| `LookupContractNature` | Contract nature (Domestic, International, etc.) | ContractNatureId, NatureCode |
| `LookupPriorityLevels` | Priority levels with SLA days | PriorityId, SLADays |
| `LookupCaseStatus` | Case/application status | CaseStatusId, StatusCategory |
| `LookupCurrencies` | Supported currencies | CurrencyId, CurrencyCode, Symbol |
| `LookupRenewalStatus` | Renewal-specific statuses | RenewalStatusId, StatusCode |

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
| Tables | 60+ |
| Views | 10+ |
| Indexes | 80+ |
| Stored Procedures | 0 (use ORM) |
