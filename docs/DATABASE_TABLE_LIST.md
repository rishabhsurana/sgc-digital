# SGC Digital - Complete Database Table List

**Version:** 1.4.0  
**Last Updated:** 2024  
**Total Tables:** 115+  
**Total Views:** 30+  
**SQL Scripts:** 13

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Lookup Tables (Core) | 8 |
| Lookup Tables (Contracts) | 9 |
| Lookup Tables (Correspondence) | 5 |
| Lookup Tables (Submissions) | 1 |
| **Lookup Tables (Workflow & Corrections)** | **2** |
| User & Entity Tables | 8 |
| Correspondence Tables | 4 |
| Contract Tables | 13 |
| Contract Renewals Tables | 3 |
| Document Requirements Tables | 2 |
| Draft & Failed Submissions Tables | 6 |
| **Workflow, Corrections & Stage Duration Tables** | **7** |
| Tracking & Notifications Tables | 5 |
| Audit & Activity Tables | 3 |
| Reporting & Analytics Tables | 8 |
| Ask Rex AI Tables | 9 |
| System Configuration Tables | 4 |
| **TOTAL TABLES** | **~115** |

---

## MODULE 1: LOOKUP TABLES - Core (8 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupUserRoles` | User role definitions | RoleId, RoleCode, RoleName, CanAccessManagement |
| 2 | `LookupEntityTypes` | Entity/organization types | EntityTypeId, EntityTypeCode, EntityTypeName |
| 3 | `LookupDepartments` | Government MDAs | DepartmentId, DepartmentCode, DepartmentName, Ministry |
| 4 | `LookupRequestStatus` | Registration statuses | StatusId, StatusCode, StatusName |
| 5 | `LookupPriorityLevels` | Priority with SLA | PriorityId, PriorityName, SLADays |
| 6 | `LookupCaseStatus` | Workflow statuses | CaseStatusId, StatusName, StatusCategory |
| 7 | `LookupCurrencies` | Currency codes | CurrencyId, CurrencyCode, Symbol |
| 8 | `LookupCountries` | Countries list | CountryId, CountryCode, CountryName, IsCaribbean |

---

## MODULE 2: LOOKUP TABLES - Contracts (9 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupContractTypes` | Contract types | ContractTypeId, TypeCode, TypeName |
| 2 | `LookupContractNature` | Nature (Goods/Consultancy/Works) | ContractNatureId, NatureCode, NatureName |
| 3 | `LookupContractCategories` | Categories by nature | CategoryId, CategoryCode, ApplicableNatures |
| 4 | `LookupContractInstruments` | Instruments by nature | InstrumentId, InstrumentCode, ApplicableNatures |
| 5 | `LookupContractorTypes` | Contractor types | ContractorTypeId, TypeCode, TypeName |
| 6 | `LookupFundingSources` | Funding sources | FundingSourceId, SourceCode, SourceName |
| 7 | `LookupProcurementMethods` | Procurement methods | ProcurementMethodId, MethodCode, RequiresSingleSourceApproval |
| 8 | `LookupContractDocumentTypes` | Document types | DocumentTypeId, DocumentTypeCode, IsRequired |
| 9 | `LookupRenewalStatus` | Renewal statuses | RenewalStatusId, StatusCode |

---

## MODULE 3: LOOKUP TABLES - Correspondence (5 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupCorrespondenceTypes` | Correspondence types | CorrespondenceTypeId, TypeCode, EstimatedDays |
| 2 | `LookupSubmitterTypes` | Submitter types | SubmitterTypeId, TypeCode, RequiresOrganization |
| 3 | `LookupUrgencyLevels` | Urgency levels | UrgencyId, UrgencyCode, SLAMultiplier |
| 4 | `LookupConfidentialityLevels` | Confidentiality | ConfidentialityId, AccessRestrictions |
| 5 | `LookupCorrespondenceDocumentTypes` | Document types | DocumentTypeId, DocumentTypeName |

---

## MODULE 3B: LOOKUP TABLES - Submission Status (1 Table)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupSubmissionStatus` | Draft/submission statuses | SubmissionStatusId, StatusCode, AllowsRetry, ShowInDashboard |

**Submission Status Values:**
| Status | Description | Allows Retry |
|--------|-------------|--------------|
| `DRAFT` | Saved as draft - user can continue | Yes |
| `IN_PROGRESS` | User actively working | Yes |
| `VALIDATION_FAILED` | Form validation failed | Yes |
| `SUBMISSION_FAILED` | Technical error - can retry | Yes |
| `PENDING_DOCUMENTS` | Awaiting document upload | Yes |
| `SUBMITTED` | Successfully submitted | No |
| `EXPIRED` | Draft expired | No |
| `ABANDONED` | User abandoned | No |

---

## MODULE 4: USER & ENTITY MANAGEMENT (8 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `Entities` | Master entity/organization | EntityId, EntityNumber, EntityName, EntityTypeId |
| 2 | `UserProfiles` | All user accounts | UserId, Email, RoleId, EntityId, StatusId |
| 3 | `EntityAuthorizedUsers` | Additional users per entity | AuthorizedUserId, EntityId, Permissions |
| 4 | `UserSessions` | Active sessions | SessionId, UserId, Token, ExpiresAt |
| 5 | `StaffRegistrationRequests` | Staff access requests | RequestId, UserId, ApprovalStatus |
| 6 | `StaffApprovalHistory` | Approval audit trail | HistoryId, RequestId, Action, ActionBy |
| 7 | `EntityDocuments` | Entity verification docs | DocumentId, EntityId, DocumentType |
| 8 | `EmailVerificationTokens` | Email/password tokens | TokenId, UserId, Token, ExpiresAt |

---

## MODULE 5: CORRESPONDENCE MANAGEMENT (4 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `CorrespondenceRegister` | Main submissions | CorrespondenceId, ReferenceNumber, Subject, SubmitterTypeId, UrgencyId, ConfidentialityId |
| 2 | `CorrespondenceStatusHistory` | Status audit trail | HistoryId, CorrespondenceId, FromStatus, ToStatus |
| 3 | `CorrespondenceDocuments` | Attached files | DocumentId, CorrespondenceId, FileName, DocumentTypeId |
| 4 | `CorrespondenceComments` | Notes/comments | CommentId, CorrespondenceId, CommentText, IsInternal |

---

## MODULE 6: CONTRACT MANAGEMENT (13 Tables)

### Main Contract Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractsRegister` | **Main contract register** | See full column list below |
| 2 | `ContractStatusHistory` | Status audit trail | HistoryId, ContractId, FromStatus, ToStatus |
| 3 | `ContractDocuments` | Attached files | DocumentId, ContractId, FileName, DocumentTypeId |
| 4 | `ContractComments` | Notes/comments | CommentId, ContractId, CommentText, IsInternal |
| 5 | `ContractAmendments` | Contract modifications | AmendmentId, ContractId, AmendmentNumber, NewValue |

### Contract Parties & Related Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 6 | `ContractCounterparties` | **Multiple parties per contract** | CounterpartyId, ContractId, PartyRole, PartyName, CompanyRegistrationNumber, TaxIdentificationNumber |
| 7 | `ContractMilestones` | **Payment/delivery milestones** | MilestoneId, ContractId, MilestoneName, PaymentAmount, PlannedEndDate |
| 8 | `ContractValueBreakdown` | **Value line items** | BreakdownId, ContractId, ItemDescription, Amount |
| 9 | `ContractGuarantees` | **Bonds/guarantees** | GuaranteeId, ContractId, GuaranteeType, GuaranteeAmount |
| 10 | `ContractSignatories` | **Contract signers** | SignatoryId, ContractId, SignatoryName, SignedDate |
| 11 | `ContractTerms` | **Terms & conditions** | TermId, ContractId, TermType, TermDescription |

---

## MODULE 7: CONTRACT RENEWALS (3 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractRenewals` | Renewal requests | RenewalId, OriginalContractId, RenewalNumber, NewValue |
| 2 | `ContractRenewalStatusHistory` | Status audit trail | HistoryId, RenewalId, FromStatus, ToStatus |
| 3 | `ContractRenewalDocuments` | Renewal documents | DocumentId, RenewalId, FileName |

---

## MODULE 8: DOCUMENT REQUIREMENTS (2 Junction Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractDocumentRequirements` | Documents by nature/category | RequirementId, DocumentTypeId, ContractNatureId, IsRequired |
| 2 | `CorrespondenceDocumentRequirements` | Documents by type/submitter | RequirementId, DocumentTypeId, CorrespondenceTypeId |

---

## MODULE 8B: DRAFT & FAILED SUBMISSIONS (6 Tables)

This module handles **saving drafts**, **failed submissions**, and **retry functionality**.

### Draft Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractDrafts` | **Saved contract drafts** | DraftId, UserId, FormData (JSON), SubmissionStatusId, CurrentStep, ProgressPercentage, SubmissionAttempts, LastSubmissionError, ExpiresAt |
| 2 | `CorrespondenceDrafts` | **Saved correspondence drafts** | DraftId, UserId, FormData (JSON), SubmissionStatusId, CurrentStep, ProgressPercentage, SubmissionAttempts, LastSubmissionError, ExpiresAt |
| 3 | `DraftDocuments` | **Documents uploaded to drafts** | DocumentId, ContractDraftId, CorrespondenceDraftId, FileName, FilePath |

### Submission Tracking Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 4 | `SubmissionAttempts` | **History of all submission attempts** | AttemptId, ContractDraftId, CorrespondenceDraftId, AttemptNumber, WasSuccessful, ErrorType, ErrorMessage |
| 5 | `FailedSubmissionNotifications` | **Notifications for failed submissions** | NotificationId, UserId, ContractDraftId, Title, Message, RetryUrl, IsRead |

### Key Features

**Draft Auto-Save:**
- Forms auto-save to `ContractDrafts` or `CorrespondenceDrafts` as JSON
- Tracks current step and progress percentage
- Expires after 30 days

**Failed Submission Handling:**
- Each attempt logged in `SubmissionAttempts`
- Error type categorized (VALIDATION, NETWORK, SERVER, TIMEOUT)
- User receives notification with direct retry link
- Dashboard shows failed submissions with "Resume" button

**Retry URL Format:**
- `/contracts?draft={DraftId}` - Resume contract submission
- `/correspondence?draft={DraftId}` - Resume correspondence submission

---

## MODULE 8C: WORKFLOW, CORRECTIONS & STAGE DURATION (9 Tables)

This module handles **status updates**, **return for corrections**, and **stage duration tracking**.

### Lookup Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupCorrectionReasons` | Reasons for returning applications | CorrectionReasonId, ReasonCode, ReasonName, DefaultDeadlineDays, AppliesTo |
| 2 | `LookupWorkflowStages` | All workflow stages | StageId, StageCode, StageName, StageOrder, ExpectedDurationDays, SLADays, AllowsCorrections, IsTerminal |

**Correction Reason Values:**
| Reason | Description | Default Deadline |
|--------|-------------|------------------|
| `MISSING_DOCS` | Required documents missing | 7 days |
| `INVALID_DOCS` | Documents invalid/expired | 7 days |
| `INCOMPLETE_INFO` | Form fields incomplete | 5 days |
| `INCORRECT_INFO` | Information contains errors | 5 days |
| `SIGNATURE_REQUIRED` | Missing signatures | 5 days |
| `VALUE_DISCREPANCY` | Contract values don't match | 5 days |
| `SCOPE_UNCLEAR` | Scope needs clarification | 7 days |
| `LEGAL_ISSUES` | Legal concerns to address | 10 days |
| `COMPLIANCE_ISSUES` | Policy/regulatory issues | 10 days |
| `PROCUREMENT_ISSUES` | Procurement docs incomplete | 7 days |

**Workflow Stage Values:**
| Stage | Description | SLA Days | Allows Corrections |
|-------|-------------|----------|-------------------|
| `DRAFT` | Application being prepared | - | No |
| `SUBMITTED` | Awaiting initial review | 2 | No |
| `INITIAL_REVIEW` | Document/completeness check | 3 | Yes |
| `AWAITING_CORRECTIONS` | Returned to applicant | - | No |
| `CORRECTIONS_SUBMITTED` | Corrections awaiting re-review | 2 | No |
| `LEGAL_REVIEW` | Under legal review | 10 | Yes |
| `NEGOTIATION` | Terms being negotiated | 15 | No |
| `FINAL_REVIEW` | Final review before approval | 3 | Yes |
| `PENDING_APPROVAL` | Awaiting final approval | 3 | No |
| `APPROVED` | Application approved | 1 | No |
| `EXECUTION` | Contract being signed | 5 | No |
| `COMPLETED` | Process complete (Terminal) | - | No |
| `REJECTED` | Application rejected (Terminal) | - | No |
| `WITHDRAWN` | Withdrawn by applicant (Terminal) | - | No |

### Correction Request Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 3 | `ContractCorrectionRequests` | **Correction requests for contracts** | CorrectionRequestId, ContractId, CorrectionCycleNumber, PrimaryCorrectionReasonId, CorrectionInstructions, DeadlineDate, Status, ResponseSubmittedAt, WereCorrectionsAccepted |
| 4 | `CorrespondenceCorrectionRequests` | **Correction requests for correspondence** | CorrectionRequestId, CorrespondenceId, CorrectionCycleNumber, PrimaryCorrectionReasonId, CorrectionInstructions, DeadlineDate, Status |
| 5 | `CorrectionDocuments` | **Documents submitted as corrections** | DocumentId, ContractCorrectionRequestId, CorrespondenceCorrectionRequestId, ReplacesDocumentId, FileName |

### Stage Duration Tracking Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 6 | `ContractStageDurations` | **Time tracking per stage for contracts** | StageDurationId, ContractId, StageId, EnteredAt, ExitedAt, DurationMinutes, DurationBusinessDays, WasOverdue, DaysOverdue, ExitReason |
| 7 | `CorrespondenceStageDurations` | **Time tracking per stage for correspondence** | StageDurationId, CorrespondenceId, StageId, EnteredAt, ExitedAt, DurationMinutes, DurationBusinessDays, WasOverdue |

### New Columns Added to Main Tables

**ContractsRegister - New Columns:**
| Column | Type | Description |
|--------|------|-------------|
| `CurrentStageId` | INT FK | Current workflow stage |
| `StageEnteredAt` | DATETIME2 | When current stage started |
| `TotalCorrectionCycles` | INT | Number of correction cycles |
| `IsAwaitingCorrections` | BIT | Currently awaiting corrections? |
| `CorrectionDeadline` | DATETIME2 | Deadline for corrections |
| `LastCorrectionRequestId` | UNIQUEIDENTIFIER FK | Last correction request |
| `TotalProcessingDays` | INT | Total days in processing |
| `TotalBusinessDays` | DECIMAL(5,2) | Total business days |

**CorrespondenceRegister - Same columns added**

**StatusHistory Tables - New Columns:**
| Column | Type | Description |
|--------|------|-------------|
| `StageId` | INT FK | New stage entered |
| `PreviousStageId` | INT FK | Previous stage exited |
| `StageDurationMinutes` | INT | Time spent in previous stage |
| `StageDurationBusinessDays` | DECIMAL(5,2) | Business days in stage |
| `WasOverdue` | BIT | Was stage overdue? |
| `DaysOverdue` | INT | Days over SLA |
| `IsCorrection` | BIT | Is this a correction cycle? |
| `CorrectionCycleNumber` | INT | Which correction cycle |

### Views for Workflow Reporting

| View | Purpose |
|------|---------|
| `vw_ContractCurrentStage` | Current stage status for all contracts with SLA tracking |
| `vw_CorrespondenceCurrentStage` | Current stage status for all correspondence |
| `vw_PendingCorrections` | All pending correction requests (combined) |
| `vw_StageDurationAnalytics` | Stage duration statistics and overdue percentages |

### Stored Procedures

| Procedure | Purpose |
|-----------|---------|
| `sp_RequestContractCorrections` | Create correction request, set deadline, update status |
| `sp_SubmitContractCorrections` | Mark corrections as submitted, move to re-review |
| `sp_ChangeContractStage` | Change stage with automatic duration tracking |

---

## MODULE 9: TRACKING & NOTIFICATIONS (5 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `SLATracking` | Deadline monitoring | TrackingId, EntityType, EntityId, DueDate |
| 2 | `EscalationRules` | Auto-escalation config | RuleId, TriggerCondition, EscalateTo |
| 3 | `Notifications` | User notifications | NotificationId, UserId, Message, IsRead |
| 4 | `EmailQueue` | Email sending queue | EmailId, ToAddress, Status, SentAt |
| 5 | `EmailTemplates` | Email templates | TemplateId, TemplateName, Subject, Body |

---

## MODULE 10: AUDIT & ACTIVITY (3 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `AuditLog` | System-wide audit trail | LogId, TableName, Action, OldValues, NewValues |
| 2 | `ActivityLog` | User activity tracking | ActivityId, UserId, ActivityType, Description |
| 3 | `EntityRegistrationHistory` | Registration audit | HistoryId, EntityId, Action, IPAddress |

---

## MODULE 11: REPORTING & ANALYTICS (8 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ReportDefinitions` | Report templates | ReportId, ReportName, ReportType, Query |
| 2 | `ReportExecutionLog` | Report generation history | ExecutionId, ReportId, ExecutedBy, ExecutedAt |
| 3 | `ScheduledReports` | Automated schedules | ScheduleId, ReportId, Frequency, NextRunAt |
| 4 | `DailyMetrics` | Daily KPIs | MetricId, MetricDate, NewCorrespondence, NewContracts |
| 5 | `DepartmentMetrics` | Department performance | MetricId, DepartmentId, Period, AverageProcessingDays |
| 6 | `StaffMetrics` | Staff performance | MetricId, UserId, Period, CasesAssigned, CasesCompleted |
| 7 | `ContractValueSummary` | Financial summaries | SummaryId, Period, TotalValue, TotalCount |
| 8 | `UserRegistrationMetrics` | Registration analytics | MetricId, Period, NewUsers, ByEntityType |

---

## MODULE 12: ASK REX AI ASSISTANT (9 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `AskRexSessions` | Conversation sessions | SessionId, UserId, StartedAt, Context |
| 2 | `AskRexMessages` | Chat messages | MessageId, SessionId, Role, Content |
| 3 | `AskRexMessageFiles` | Files in responses | FileId, MessageId, FileName, FilePath |
| 4 | `AskRexSearchQueries` | Search analytics | QueryId, SessionId, Query, ResultCount |
| 5 | `AskRexGeneratedReports` | AI-generated reports | ReportId, SessionId, ReportType, Content |
| 6 | `AskRexFeedback` | User feedback | FeedbackId, MessageId, Rating, Comment |
| 7 | `AskRexSavedPrompts` | Saved prompts | PromptId, UserId, PromptText, IsDefault |
| 8 | `AskRexKnowledgeBase` | Custom knowledge | EntryId, Title, Content, Category |
| 9 | `AskRexDailyAnalytics` | Daily AI metrics | AnalyticsId, Date, TotalSessions, TotalQueries |

---

## MODULE 13: SYSTEM CONFIGURATION (4 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `SystemSettings` | Application settings | SettingId, SettingKey, SettingValue |
| 2 | `FeatureFlags` | Feature toggles | FlagId, FlagName, IsEnabled |
| 3 | `ReferenceNumberSequences` | Auto-numbering | SequenceId, Prefix, CurrentValue |
| 4 | `HolidayCalendar` | Public holidays | HolidayId, HolidayDate, HolidayName |

---

## ContractsRegister - COMPLETE Column List

The main `ContractsRegister` table contains **ALL fields** from the contract submission form:

### Primary Keys & Reference
| Column | Type | Description |
|--------|------|-------------|
| `ContractId` | UNIQUEIDENTIFIER | Primary Key |
| `ReferenceNumber` | NVARCHAR(50) | System reference (CON-2024-0001) |
| `FinalContractNumber` | NVARCHAR(100) | Final registered contract number |

### Contract Classification
| Column | Type | Description |
|--------|------|-------------|
| `ContractTypeId` | INT FK | Type (New, Renewal, Supplemental) |
| `ContractNatureId` | INT FK | Nature (Goods, Consultancy, Works) |
| `ContractCategoryId` | INT FK | Category by nature |
| `ContractInstrumentId` | INT FK | Instrument by nature |
| `ContractInstrumentOther` | NVARCHAR(200) | Custom instrument if "Other" |
| `CategoryOtherJustification` | NVARCHAR(MAX) | Justification for "Other" category |
| `IsRenewal` | BIT | Is this a renewal? |
| `IsSupplemental` | BIT | Is this supplemental? |
| `ParentContractId` | UNIQUEIDENTIFIER FK | Original contract for renewals |
| `ParentContractNumber` | NVARCHAR(100) | Original contract reference |

### Requesting Entity
| Column | Type | Description |
|--------|------|-------------|
| `RequestingUserId` | UNIQUEIDENTIFIER FK | Submitting user |
| `RequestingDepartmentId` | INT FK | Ministry/Department |
| `RequestingOfficerName` | NVARCHAR(200) | Contact name |
| `RequestingOfficerEmail` | NVARCHAR(255) | Contact email |
| `RequestingOfficerPhone` | NVARCHAR(50) | Contact phone |
| `MinistryFileReference` | NVARCHAR(100) | Ministry's internal file ref |

### Contract Details
| Column | Type | Description |
|--------|------|-------------|
| `ContractTitle` | NVARCHAR(500) | Contract title |
| `ContractDescription` | NVARCHAR(MAX) | Full description |
| `ScopeOfWork` | NVARCHAR(MAX) | Detailed scope |
| `KeyDeliverables` | NVARCHAR(MAX) | Key deliverables list |

### Contractor/Counterparty (Primary)
| Column | Type | Description |
|--------|------|-------------|
| `CounterpartyName` | NVARCHAR(200) | **Contractor/vendor name** |
| `CounterpartyAddress` | NVARCHAR(500) | Address |
| `CounterpartyContact` | NVARCHAR(200) | Contact person |
| `CounterpartyEmail` | NVARCHAR(255) | Email |
| `CounterpartyPhone` | NVARCHAR(50) | Phone |
| `ContractorTypeId` | INT FK | Type (Company, Individual, JV, etc.) |
| `ContractorCity` | NVARCHAR(100) | City |
| `ContractorCountryId` | INT FK | Country |
| `CompanyRegistrationNumber` | NVARCHAR(100) | Company reg number |
| `TaxIdentificationNumber` | NVARCHAR(100) | Tax ID / TIN |

### Financial - Contract Value
| Column | Type | Description |
|--------|------|-------------|
| `ContractValue` | DECIMAL(18,2) | **Main contract amount** |
| `ContractValueExclTax` | DECIMAL(18,2) | Value excluding tax |
| `TaxAmount` | DECIMAL(18,2) | Tax amount |
| `ContractValueInclTax` | DECIMAL(18,2) | Value including tax |
| `CurrencyId` | INT FK | Currency (BBD, USD, etc.) |
| `PaymentTerms` | NVARCHAR(MAX) | Payment terms |

### Financial - Funding & Procurement
| Column | Type | Description |
|--------|------|-------------|
| `FundingSourceId` | INT FK | Funding source |
| `ProcurementMethodId` | INT FK | Procurement method |
| `IsSingleSource` | BIT | Single source procurement? |
| `SingleSourceJustification` | NVARCHAR(MAX) | Justification for single source |
| `AwardDate` | DATE | Date of award |

### Financial - Contingency & Retention
| Column | Type | Description |
|--------|------|-------------|
| `ContingencyAmount` | DECIMAL(18,2) | Contingency amount |
| `ContingencyPercentage` | DECIMAL(5,2) | Contingency % |
| `RetentionPercentage` | DECIMAL(5,2) | Retention % |
| `RetentionAmount` | DECIMAL(18,2) | Retention amount |
| `RetentionReleaseConditions` | NVARCHAR(MAX) | Release conditions |
| `AdvancePaymentPercentage` | DECIMAL(5,2) | Advance payment % |
| `AdvancePaymentAmount` | DECIMAL(18,2) | Advance payment amount |
| `AdvancePaymentConditions` | NVARCHAR(MAX) | Advance conditions |

### Contract Period - Dates
| Column | Type | Description |
|--------|------|-------------|
| `ContractStartDate` | DATE | **Contract start date** |
| `ContractEndDate` | DATE | **Contract end date** |
| `ContractDuration` | NVARCHAR(100) | Duration text (e.g., "2 years, 3 months") |
| `ContractDurationMonths` | INT | Duration in months |
| `ProposedStartDate` | DATE | Originally proposed start |
| `ProposedEndDate` | DATE | Originally proposed end |
| `ExecutedDate` | DATE | Date contract was executed |
| `ExpiryDate` | DATE | Expiry/end date |
| `RenewalTermMonths` | INT | Renewal term in months |
| `RenewalTermDescription` | NVARCHAR(200) | Renewal term description |

### Warranty & Liability
| Column | Type | Description |
|--------|------|-------------|
| `WarrantyPeriodMonths` | INT | Warranty period |
| `WarrantyTerms` | NVARCHAR(MAX) | Warranty terms |
| `DefectsLiabilityPeriodMonths` | INT | Defects liability period |
| `LiquidatedDamagesRate` | DECIMAL(18,2) | LD rate per day |
| `LiquidatedDamagesMax` | DECIMAL(18,2) | LD maximum |
| `LiquidatedDamagesTerms` | NVARCHAR(MAX) | LD terms |

### Insurance
| Column | Type | Description |
|--------|------|-------------|
| `InsuranceRequired` | BIT | Insurance required? |
| `InsuranceTypes` | NVARCHAR(500) | Types of insurance |
| `MinimumInsuranceCoverage` | DECIMAL(18,2) | Minimum coverage |

### Price Variation
| Column | Type | Description |
|--------|------|-------------|
| `PriceVariationAllowed` | BIT | Price variation allowed? |
| `PriceVariationFormula` | NVARCHAR(MAX) | Variation formula |
| `PriceVariationCap` | DECIMAL(5,2) | Maximum variation % |

### Legal
| Column | Type | Description |
|--------|------|-------------|
| `GoverningLaw` | NVARCHAR(100) | Governing law (default: Laws of Barbados) |
| `ExecutionLocation` | NVARCHAR(200) | Place of execution |
| `DisputeResolutionMethod` | NVARCHAR(100) | Dispute resolution method |

### Status & Assignment
| Column | Type | Description |
|--------|------|-------------|
| `PriorityId` | INT FK | Priority level |
| `CaseStatusId` | INT FK | Current status |
| `AssignedToUserId` | UNIQUEIDENTIFIER FK | Assigned staff |
| `AssignedAt` | DATETIME2 | Assignment date |

### Review & Approval
| Column | Type | Description |
|--------|------|-------------|
| `LegalReviewNotes` | NVARCHAR(MAX) | Legal review notes |
| `RecommendedChanges` | NVARCHAR(MAX) | Recommended changes |
| `ApprovalNotes` | NVARCHAR(MAX) | Approval notes |
| `MissingDocumentReason` | NVARCHAR(MAX) | Reason for missing docs |

### Audit Fields
| Column | Type | Description |
|--------|------|-------------|
| `SubmittedAt` | DATETIME2 | Submission date |
| `DueDate` | DATETIME2 | SLA due date |
| `CompletedAt` | DATETIME2 | Completion date |
| `CreatedAt` | DATETIME2 | Created timestamp |
| `UpdatedAt` | DATETIME2 | Last updated |
| `CreatedBy` | UNIQUEIDENTIFIER FK | Created by user |
| `UpdatedBy` | UNIQUEIDENTIFIER FK | Updated by user |

---

## ContractCounterparties - Multiple Parties

For contracts with multiple parties (joint ventures, subcontractors):

| Column | Type | Description |
|--------|------|-------------|
| `CounterpartyId` | UNIQUEIDENTIFIER PK | Primary key |
| `ContractId` | UNIQUEIDENTIFIER FK | Parent contract |
| `PartyRole` | NVARCHAR(50) | Role (CONTRACTOR, JOINT_VENTURE_PARTNER, SUBCONTRACTOR, GUARANTOR) |
| `IsPrimaryParty` | BIT | Is primary party? |
| `ContractorTypeId` | INT FK | Party type |
| `PartyName` | NVARCHAR(300) | Party name |
| `TradingName` | NVARCHAR(300) | Trading name |
| `AddressLine1` | NVARCHAR(200) | Address line 1 |
| `AddressLine2` | NVARCHAR(200) | Address line 2 |
| `City` | NVARCHAR(100) | City |
| `StateProvince` | NVARCHAR(100) | State/Province |
| `PostalCode` | NVARCHAR(20) | Postal code |
| `CountryId` | INT FK | Country |
| `ContactPerson` | NVARCHAR(200) | Contact person |
| `ContactEmail` | NVARCHAR(255) | Email |
| `ContactPhone` | NVARCHAR(50) | Phone |
| `CompanyRegistrationNumber` | NVARCHAR(100) | Company reg |
| `TaxIdentificationNumber` | NVARCHAR(100) | Tax ID |
| `VATNumber` | NVARCHAR(100) | VAT number |
| `BankName` | NVARCHAR(200) | Bank name |
| `BankAccountNumber` | NVARCHAR(100) | Account number |
| `SharePercentage` | DECIMAL(5,2) | Share % (for JVs) |

---

## ContractMilestones - Payment Schedule

| Column | Type | Description |
|--------|------|-------------|
| `MilestoneId` | UNIQUEIDENTIFIER PK | Primary key |
| `ContractId` | UNIQUEIDENTIFIER FK | Parent contract |
| `MilestoneNumber` | INT | Milestone sequence |
| `MilestoneName` | NVARCHAR(200) | Milestone name |
| `Description` | NVARCHAR(MAX) | Description |
| `PlannedStartDate` | DATE | Planned start |
| `PlannedEndDate` | DATE | Planned end |
| `ActualStartDate` | DATE | Actual start |
| `ActualEndDate` | DATE | Actual end |
| `Deliverables` | NVARCHAR(MAX) | Deliverables |
| `AcceptanceCriteria` | NVARCHAR(MAX) | Acceptance criteria |
| `PaymentAmount` | DECIMAL(18,2) | Payment amount |
| `PaymentPercentage` | DECIMAL(5,2) | Payment % |
| `PaymentDueDate` | DATE | Payment due date |
| `PaymentPaidDate` | DATE | Date paid |
| `Status` | NVARCHAR(50) | Status (PENDING, IN_PROGRESS, COMPLETED) |

---

## SQL Script Execution Order

| # | Script | Purpose |
|---|--------|---------|
| 1 | `001-user-management.sql` | Base user and lookup tables |
| 2 | `002-correspondence.sql` | Correspondence tables |
| 3 | `003-contracts.sql` | Base contract tables |
| 4 | `004-audit-activity.sql` | Audit logging |
| 5 | `005-views-reports.sql` | Views |
| 6 | `006-renewals-and-tracking.sql` | Renewals and SLA tracking |
| 7 | `007-entities-reports-comprehensive.sql` | Entities and reporting |
| 8 | `008-ask-rex-ai-assistant.sql` | Ask Rex AI tables |
| 9 | `009-missing-fields-comprehensive.sql` | Categories, instruments, funding |
| 10 | `010-document-requirements-junction.sql` | Document requirements by category |
| 11 | `011-contracts-complete-fields.sql` | Complete contract fields (70+ columns) |
| 12 | `012-drafts-failed-submissions.sql` | Draft & failed submission handling |
| 13 | `013-workflow-corrections-stages.sql` | **Workflow, corrections & stage duration tracking** |

**OR use `CONSOLIDATED_SCHEMA.sql` for single-file deployment.**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial schema |
| 1.1 | 2024 | Added Entity master, Ask Rex, Reports |
| 1.2 | 2024 | Added complete contract fields: ContractValue, ContractStartDate, ContractEndDate, ContractCounterparties, ContractMilestones |
| 1.3 | 2024 | Added draft/failed submission handling with retry functionality |
| 1.4 | 2024 | **Added workflow, corrections & stage duration tracking: LookupCorrectionReasons, LookupWorkflowStages, ContractCorrectionRequests, CorrespondenceCorrectionRequests, CorrectionDocuments, ContractStageDurations, CorrespondenceStageDurations** |
