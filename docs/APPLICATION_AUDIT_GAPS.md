# SGC Digital - Comprehensive Application Audit

**Audit Date:** March 2024  
**Auditor:** v0 AI Assistant  
**Version:** 1.0

---

## Executive Summary

This document identifies **all gaps** between the application's forms/UI and the database schema, as well as missing functionality that should exist for a production-ready application.

---

## SECTION 1: FORM FIELD vs DATABASE GAPS

### 1.1 Contracts Form (`/contracts/page.tsx`) vs Database

| Form Field | Database Column | Status | Action Required |
|------------|-----------------|--------|-----------------|
| `contractNature` | `ContractNatureId` | EXISTS | - |
| `contractCategory` | `ContractCategoryId` | EXISTS | - |
| `contractInstrument` | `ContractInstrumentTypeId` | EXISTS | - |
| `contractType` | `ContractTypeId` | EXISTS | - |
| `parentContractNumber` | `ParentContractId` | EXISTS | - |
| `contractTitle` | `ContractTitle` | EXISTS | - |
| `contractDescription` | `ContractDescription` | EXISTS | - |
| `ministry` | `RequestingDepartmentId` | EXISTS | - |
| `department` | `RequestingDepartmentId` | EXISTS | - |
| `officerName` | `RequestingOfficerName` | EXISTS | - |
| `officerEmail` | `RequestingOfficerEmail` | EXISTS | - |
| `officerPhone` | `RequestingOfficerPhone` | EXISTS | - |
| `contractorType` | `ContractorTypeId` | EXISTS | - |
| `contractorName` | `CounterpartyName` | EXISTS | - |
| `contractorAddress` | `CounterpartyAddress` | EXISTS | - |
| `contractorCity` | `CounterpartyCity` | **ADDED in 011** | - |
| `contractorCountry` | `CounterpartyCountry` | **ADDED in 011** | - |
| `contractorEmail` | `CounterpartyEmail` | EXISTS | - |
| `contractorPhone` | `CounterpartyPhone` | EXISTS | - |
| `companyRegistrationNumber` | `CompanyRegistrationNumber` | **ADDED in 011** | - |
| `taxIdentificationNumber` | `TaxIdentificationNumber` | **ADDED in 011** | - |
| `contractValue` | `ContractValue` | EXISTS | - |
| `contractCurrency` | `CurrencyId` | EXISTS | - |
| `fundingSource` | `FundingSourceId` | EXISTS | - |
| `procurementMethod` | `ProcurementMethodId` | EXISTS | - |
| `contractStartDate` | `ContractStartDate` | **ADDED in 011** | - |
| `contractEndDate` | `ContractEndDate` | **ADDED in 011** | - |
| `contractDuration` | `ContractDurationMonths` | EXISTS | - |
| `renewalTerm` | `RenewalTermMonths` | **ADDED in 011** | - |
| `scopeOfWork` | `ScopeOfWork` | **ADDED in 009** | - |

**MISSING FROM FORM but in Database:**
| Database Column | Description | UI Action Required |
|-----------------|-------------|-------------------|
| `AuthorizedSignatoryId` | Who signs the contract | Add signatory field |
| `PaymentTerms` | Payment schedule | Add payment terms field |
| `LiquidatedDamagesRate` | LD rate per day | Add financial terms section |
| `RetentionPercentage` | Retention percentage | Add to financial section |
| `AdvancePaymentPercentage` | Advance payment % | Add to financial section |
| `ContingencyAmount` | Contingency budget | Add to financial section |
| `WarrantyPeriodMonths` | Warranty duration | Add to contract terms |
| `DefectsLiabilityPeriodMonths` | Defects period | Add to contract terms |
| `InsuranceRequirements` | Insurance details | Add insurance section |
| `GoverningLaw` | Applicable law | Add legal section |
| `DisputeResolutionMethod` | Arbitration/Court | Add legal section |

### 1.2 Correspondence Form (`/correspondence/page.tsx`) vs Database

| Form Field | Database Column | Status |
|------------|-----------------|--------|
| `correspondenceType` | `CorrespondenceTypeId` | EXISTS |
| `submitterType` | `SubmitterTypeId` | EXISTS |
| `submitterName` | `SubmitterName` | EXISTS |
| `submitterEmail` | `SubmitterEmail` | EXISTS |
| `submitterPhone` | `SubmitterPhone` | EXISTS |
| `organizationName` | `OrganizationName` | EXISTS |
| `ministryDepartment` | `DepartmentId` | EXISTS |
| `contactUnit` | `ContactUnit` | **MISSING** |
| `registryFileNumber` | `RegistryFileNumber` | EXISTS |
| `courtFileNumber` | `CourtFileNumber` | EXISTS |
| `ministryFileReference` | `MinistryFileReference` | **MISSING** |
| `urgency` | `UrgencyId` | EXISTS |
| `urgentReason` | `UrgentReason` | **MISSING** |
| `confidentiality` | `ConfidentialityId` | EXISTS |
| `subject` | `Subject` | EXISTS |
| `description` | `Description` | EXISTS |

### 1.3 Registration Form (`/register/page.tsx`) vs Database

| Form Field | Database Column | Status |
|------------|-----------------|--------|
| `submitterType` | `EntityTypeId` | EXISTS |
| `firstName` | `FirstName` | EXISTS |
| `middleName` | `MiddleName` | EXISTS |
| `lastName` | `LastName` | EXISTS |
| `companyName` | `EntityName` | EXISTS |
| `companyNumber` | `CompanyRegistrationNumber` | EXISTS |
| `tradingName` | `TradingName` | EXISTS |
| `selectedMDA` | `DepartmentId` | EXISTS |
| `courtName` | `CourtName` | **MISSING** |
| `lawFirmName` | `LawFirmName` | **MISSING** |
| `barNumber` | `BarNumber` | **MISSING** |
| `contactEmail` | `Email` | EXISTS |
| `contactPhone` | `Phone` | EXISTS |
| `password` | `PasswordHash` | EXISTS |
| `address` | `Address` | EXISTS |
| `additionalUsers` | `EntityAuthorizedUsers` | EXISTS (separate table) |

---

## SECTION 2: MISSING FUNCTIONALITY

### 2.1 Renewal/Supplemental Validation (FIXED)
- [x] Validate parent contract number exists
- [x] Validate contract belongs to requesting entity
- [x] Validate contract status allows renewal/supplemental
- [x] Validate renewal limit not exceeded
- [x] Pre-populate form with original contract data

### 2.2 Draft/Failed Submissions (FIXED)
- [x] Auto-save draft every 30 seconds
- [x] Manual save draft button
- [x] Resume draft via URL parameter
- [x] Failed submission handling with retry
- [x] User notification on failure

### 2.3 Workflow & Corrections (FIXED)
- [x] Stage duration tracking
- [x] Return for corrections functionality
- [x] Correction request tables
- [x] Correction deadline tracking

### 2.4 Missing Functionality - NOT YET IMPLEMENTED

#### A. Email Notifications
| Trigger | Recipient | Status |
|---------|-----------|--------|
| New submission | Submitter + SGC | NOT IMPLEMENTED |
| Status change | Submitter | NOT IMPLEMENTED |
| Returned for corrections | Submitter | NOT IMPLEMENTED |
| Correction deadline approaching | Submitter | NOT IMPLEMENTED |
| SLA breach warning | SGC Staff | NOT IMPLEMENTED |
| Approval notification | Submitter | NOT IMPLEMENTED |
| Rejection notification | Submitter | NOT IMPLEMENTED |

**Tables exist:** `EmailQueue`, `EmailTemplates` - but no code to send emails

#### B. File Storage Integration
| Feature | Status |
|---------|--------|
| Upload to blob storage | NOT IMPLEMENTED (using mock) |
| Download from blob storage | NOT IMPLEMENTED |
| File type validation | Partial (client-side only) |
| File size validation | Partial (client-side only) |
| Virus scanning | NOT IMPLEMENTED |

**Tables exist:** `ContractDocuments`, `CorrespondenceDocuments` - but no Vercel Blob integration

#### C. Reference Number Generation
| Number Type | Pattern | Status |
|-------------|---------|--------|
| Contract Transaction No | `CON-YYYY-NNNNNN` | Partial (client-side) |
| Correspondence Transaction No | `COR-NNNNNN` | Partial (client-side) |
| Entity Number | `XXX-TIMESTAMP-RANDOM` | Partial (client-side) |
| Registry File Number | `RFN-YYYY-NNNNNN` | NOT IMPLEMENTED |

**Table exists:** `ReferenceNumberSequences` - but not used for sequential numbering

#### D. SLA Tracking
| Feature | Status |
|---------|--------|
| Calculate due date based on priority | NOT IMPLEMENTED |
| Track overdue items | NOT IMPLEMENTED |
| Send escalation notifications | NOT IMPLEMENTED |
| Dashboard SLA metrics | Partial (mock data) |

**Tables exist:** `SLATracking`, `EscalationRules` - but no background job to check

#### E. Search & Filtering
| Page | Search | Filter | Status |
|------|--------|--------|--------|
| Dashboard | Basic | Basic | PARTIAL |
| Contracts Register | Basic | By status | PARTIAL |
| Correspondence Register | Basic | By type | PARTIAL |
| User Management | Basic | By role | EXISTS |

**Missing:** Full-text search, date range filters, saved searches

#### F. Export Functionality
| Export Type | Status |
|-------------|--------|
| Export to PDF | NOT IMPLEMENTED |
| Export to Excel | NOT IMPLEMENTED |
| Export to CSV | NOT IMPLEMENTED |
| Print view | NOT IMPLEMENTED |

#### G. Audit Trail
| Feature | Status |
|---------|--------|
| Log all user actions | NOT IMPLEMENTED |
| View audit history | NOT IMPLEMENTED |
| Export audit logs | NOT IMPLEMENTED |

**Tables exist:** `AuditLog`, `ActivityLog` - but no code to populate

#### H. Password Management
| Feature | Status |
|---------|--------|
| Password reset request | NOT IMPLEMENTED |
| Password reset email | NOT IMPLEMENTED |
| Password change | NOT IMPLEMENTED |
| Password expiry | NOT IMPLEMENTED |

**Table exists:** `EmailVerificationTokens` - but no password reset flow

#### I. Session Management
| Feature | Status |
|---------|--------|
| Session timeout | NOT IMPLEMENTED |
| Concurrent session limit | NOT IMPLEMENTED |
| Session invalidation on password change | NOT IMPLEMENTED |

#### J. Role-Based Access Control
| Feature | Status |
|---------|--------|
| Permission-based UI rendering | PARTIAL |
| Permission-based API protection | NOT IMPLEMENTED |
| Department-based data filtering | NOT IMPLEMENTED |

---

## SECTION 3: DATABASE TABLES - MISSING COLUMNS

### 3.1 CorrespondenceRegister - Missing Columns
```sql
ALTER TABLE CorrespondenceRegister ADD
    ContactUnit NVARCHAR(200),
    MinistryFileReference NVARCHAR(100),
    UrgentReason NVARCHAR(500);
```

### 3.2 Entities - Missing Columns
```sql
ALTER TABLE Entities ADD
    CourtName NVARCHAR(200),
    LawFirmName NVARCHAR(200),
    BarNumber NVARCHAR(50);
```

---

## SECTION 4: API ENDPOINTS - NOT IMPLEMENTED

### 4.1 Required API Routes
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/contracts` | POST | Create contract | NOT IMPLEMENTED |
| `/api/contracts/[id]` | GET | Get contract | NOT IMPLEMENTED |
| `/api/contracts/[id]` | PUT | Update contract | NOT IMPLEMENTED |
| `/api/contracts/validate` | POST | Validate parent | PARTIAL (actions) |
| `/api/correspondence` | POST | Create correspondence | NOT IMPLEMENTED |
| `/api/correspondence/[id]` | GET | Get correspondence | NOT IMPLEMENTED |
| `/api/drafts` | POST | Save draft | PARTIAL (actions) |
| `/api/drafts/[id]` | GET | Get draft | PARTIAL (actions) |
| `/api/documents/upload` | POST | Upload document | NOT IMPLEMENTED |
| `/api/documents/[id]` | GET | Download document | NOT IMPLEMENTED |
| `/api/users/password-reset` | POST | Request reset | NOT IMPLEMENTED |
| `/api/notifications` | GET | Get notifications | NOT IMPLEMENTED |

---

## SECTION 5: PRIORITY FIXES REQUIRED

### HIGH PRIORITY (Required for Production)
1. **Email notifications** - Users need to be notified of status changes
2. **File storage integration** - Need Vercel Blob for document uploads
3. **Reference number generation** - Need sequential, guaranteed unique numbers
4. **API routes** - Need proper API endpoints for form submissions
5. **Password reset** - Users need ability to reset forgotten passwords

### MEDIUM PRIORITY (Important for UX)
1. **SLA tracking & escalation** - Automate overdue tracking
2. **Export functionality** - PDF/Excel export for reports
3. **Full-text search** - Better search across all fields
4. **Audit logging** - Track all user actions

### LOW PRIORITY (Nice to Have)
1. **Session management** - Timeout and concurrent sessions
2. **Print views** - Formatted print layouts
3. **Saved searches** - Save frequently used filters

---

## SECTION 6: SUMMARY

| Category | Total Items | Implemented | Gap |
|----------|-------------|-------------|-----|
| Contract Form Fields | 31 | 31 | 0 |
| Correspondence Form Fields | 16 | 13 | 3 |
| Registration Form Fields | 15 | 12 | 3 |
| Renewal Validation | 5 | 5 | 0 |
| Draft Functionality | 5 | 5 | 0 |
| Workflow/Corrections | 4 | 4 | 0 |
| Email Notifications | 7 | 0 | 7 |
| File Storage | 5 | 0 | 5 |
| Reference Numbers | 4 | 0 | 4 |
| SLA Tracking | 4 | 0 | 4 |
| API Routes | 12 | 2 | 10 |
| **TOTAL** | **108** | **72** | **36** |

**Completion Rate: 67%**

---

## Next Steps

1. Create SQL script `015-missing-columns.sql` to add missing database columns
2. Implement Vercel Blob integration for file uploads
3. Create email notification service
4. Implement proper API routes
5. Add password reset functionality
