# SGC Digital - Complete Database Table List

**Version:** 2.2.0  
**Last Updated:** March 2026  
**Total Tables:** 150+  
**Total Views:** 45+  
**Stored Procedures:** 20+  
**SQL Scripts:** 19

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Lookup Tables (Core) | 8 |
| Lookup Tables (Contracts) | 9 |
| Lookup Tables (Correspondence) | 5 |
| Lookup Tables (Submissions) | 1 |
| Lookup Tables (Workflow & Corrections) | 2 |
| Lookup Tables (Validation) | 2 |
| **Lookup Tables (Document Types - Appendix C)** | **1** |
| User & Entity Tables | 8 |
| Correspondence Tables | 4 |
| Contract Tables | 13 |
| Contract Renewals Tables | 3 |
| Document Requirements Tables | 4 |
| Draft & Failed Submissions Tables | 6 |
| Workflow, Corrections & Stage Duration Tables | 7 |
| Correction Response Tracking Tables | 5 |
| Renewal/Supplemental Validation Tables | 2 |
| Tracking & Notifications Tables | 5 |
| **Email Notification Templates** | **5** |
| **Management Portal Tables** | **12** |
| Audit & Activity Tables | 3 |
| Reporting & Analytics Tables | 8 |
| Ask Rex AI Tables | 9 |
| System Configuration Tables | 4 |
| **TOTAL TABLES** | **~130** |

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

**Contract Type Values:**
| Code | Name |
|------|------|
| NEW | New Contract |
| RENEWAL | Contract Renewal |
| SUPPLEMENTAL | Supplemental Agreement |

**Contract Nature Values:**
| Code | Name | Categories | Instruments |
|------|------|------------|-------------|
| GOODS | Goods | Procurement, Services, Emergency, Other | GDS, UNI |
| CONSULTANCY | Consultancy | Consultancy, Emergency, Other | CLEAN, CONS_CO, CONS_IND, IC, IC_IDB, SVC |
| WORKS | Works | Construction, Services, Emergency, Other | WKS |

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

## MODULE 3C: LOOKUP TABLES - Workflow & Corrections (2 Tables)

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

---

## MODULE 3D: LOOKUP TABLES - Document Types (Appendix C) (1 Table)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupDocumentTypes` | All 24 document types from Appendix C | DocumentTypeId, DocumentTypeCode, DocumentTypeName, DocumentCategory, ApplicableNatures |

**Document Types (24 Total):**

| Code | Document Name | Category | Applicable To |
|------|--------------|----------|---------------|
| `FORM_ACCEPT` | Acceptance of Award | Form Documents | Goods, Consultancy, Works |
| `FORM_DRAFT` | Draft Contract | Form Documents | Goods, Consultancy, Works |
| `FORM_LOA` | Letter of Award | Form Documents | Goods, Consultancy, Works |
| `FORM_LOE` | Letter of Engagement | Form Documents | Consultancy |
| `FORM_PAY_SCHED` | Payment Schedule | Form Documents | Goods, Consultancy, Works |
| `FORM_SCHED_DELIV` | Schedule of Deliverables | Form Documents | Consultancy |
| `FORM_SCHED_WORKS` | Schedule of Works | Form Documents | Works |
| `PROC_SPECS` | Specifications | Procurement | Goods |
| `PROC_TENDER` | Tender Documents | Procurement | Goods, Consultancy, Works |
| `PROC_TOR` | Terms of Reference | Procurement | Consultancy |
| `PROC_PROP` | Proposal | Procurement | Consultancy, Works |
| `PROC_SCOPE` | Scope of Works | Procurement | Works |
| `PROC_BOQ` | Bill of Quantities | Procurement | Works |
| `PROC_DRAWINGS` | Technical Drawings | Procurement | Works |
| `PROC_CAB_PAPER` | Cabinet Paper | Cabinet Approval | All (Conditional) |
| `PROC_CAB_APPR` | Cabinet Approval | Cabinet Approval | All (Conditional) |
| `PROC_SSP_REQ` | Single Source Request | Single Source | All (Conditional) |
| `PROC_SSP_APPR` | Single Source Approval | Single Source | All (Conditional) |
| `DUE_BUS_REG` | Business Registration | Due Diligence | Consultancy, Works |
| `DUE_GS` | Certificate of Good Standing | Due Diligence | Consultancy, Works |
| `DUE_INCORP` | Company Incorporation | Due Diligence | Consultancy, Works |
| `FIN_BOND` | Performance Bond | Financial | Consultancy, Works |
| `FIN_SURETY` | Proof of Surety | Financial | Consultancy, Works |
| `OTHER` | Other Supporting Document | Other | All |

---

## MODULE 4: USER & ENTITY MANAGEMENT (8 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `Entities` | Master entity/organization | EntityId, EntityNumber, EntityName, EntityTypeId, CourtName, LawFirmName, BarNumber |
| 2 | `UserProfiles` | All user accounts | UserId, Email, RoleId, EntityId, StatusId |
| 3 | `EntityAuthorizedUsers` | Additional users per entity | AuthorizedUserId, EntityId, Permissions |
| 4 | `UserSessions` | Active sessions | SessionId, UserId, Token, ExpiresAt, IPAddress |
| 5 | `PasswordResetTokens` | Password reset tokens | TokenId, UserId, Token, ExpiresAt, IsUsed |
| 6 | `StaffRegistrationRequests` | Staff access requests | RequestId, UserId, ApprovalStatus |
| 7 | `StaffApprovalHistory` | Approval audit trail | HistoryId, RequestId, Action, ActionBy |
| 8 | `EntityDocuments` | Entity verification docs | DocumentId, EntityId, DocumentType |

---

## MODULE 5: CORRESPONDENCE MANAGEMENT (4 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `CorrespondenceRegister` | Main submissions | CorrespondenceId, ReferenceNumber, Subject, SubmitterTypeId, UrgencyId, ConfidentialityId, ContactUnit, MinistryFileReference, UrgentReason |
| 2 | `CorrespondenceStatusHistory` | Status audit trail | HistoryId, CorrespondenceId, FromStatus, ToStatus, StageId, StageDurationMinutes |
| 3 | `CorrespondenceDocuments` | Attached files | DocumentId, CorrespondenceId, FileName, DocumentTypeId |
| 4 | `CorrespondenceComments` | Notes/comments | CommentId, CorrespondenceId, CommentText, IsInternal |

---

## MODULE 6: CONTRACT MANAGEMENT (13 Tables)

### Main Contract Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractsRegister` | **Main contract register (70+ columns)** | See full column list below |
| 2 | `ContractStatusHistory` | Status audit trail | HistoryId, ContractId, FromStatus, ToStatus, StageId, StageDurationMinutes |
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

## MODULE 8: DOCUMENT REQUIREMENTS (4 Tables) - Appendix C

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractDocumentRequirements` | Documents by nature/category/instrument | RequirementId, DocumentTypeId, ContractNatureId, ContractCategoryId, InstrumentId, IsRequired, IsConditional, ConditionType |
| 2 | `CorrespondenceDocumentRequirements` | Documents by type/submitter | RequirementId, DocumentTypeId, CorrespondenceTypeId |
| 3 | `NatureCategoryValidation` | Valid category-nature combinations | ValidationId, ContractNatureId, ContractCategoryId, IsValid |
| 4 | `CategoryInstrumentValidation` | Valid instrument-category combinations | ValidationId, ContractCategoryId, InstrumentId, IsValid |

### Document Requirements Matrix (Appendix C)

**GOODS - Procurement Category:**
| Document | Required | Conditional |
|----------|----------|-------------|
| Acceptance of Award | Yes | - |
| Letter of Award | Yes | - |
| Payment Schedule | Yes | - |
| Specifications | Yes | - |
| Tender Documents | Yes | - |
| Draft Contract | Optional | - |
| Cabinet Paper | - | If value > threshold |
| Cabinet Approval | - | If value > threshold |
| Single Source Request | - | If single source |
| Single Source Approval | - | If single source |

**CONSULTANCY - All Instruments:**
| Document | Required | Conditional |
|----------|----------|-------------|
| Acceptance of Award | Yes | - |
| Letter of Award | Yes | - |
| Payment Schedule | Yes | - |
| Schedule of Deliverables | Yes | - |
| Proposal | Yes | - |
| Tender Documents | Yes | - |
| Terms of Reference | Yes | - |
| Letter of Engagement | Optional | - |
| Draft Contract | Optional | - |
| Business Registration | Optional | - |
| Good Standing | Optional | - |
| Incorporation | Optional | - |
| Performance Bond | Optional | - |
| Proof of Surety | Optional | - |
| Cabinet Paper | - | If value > threshold |
| Cabinet Approval | - | If value > threshold |
| Single Source Request | - | If single source |
| Single Source Approval | - | If single source |

**WORKS - Construction Category:**
| Document | Required | Conditional |
|----------|----------|-------------|
| Acceptance of Award | Yes | - |
| Letter of Award | Yes | - |
| Payment Schedule | Yes | - |
| Schedule of Works | Yes | - |
| Proposal | Yes | - |
| Scope of Works | Yes | - |
| Tender Documents | Yes | - |
| Bill of Quantities | Optional | - |
| Technical Drawings | Optional | - |
| Business Registration | Yes | - |
| Good Standing | Yes | - |
| Incorporation | Yes | - |
| Draft Contract | Optional | - |
| Performance Bond | Optional | - |
| Proof of Surety | Optional | - |
| Cabinet Paper | - | If value > threshold |
| Cabinet Approval | - | If value > threshold |
| Single Source Request | - | If single source |
| Single Source Approval | - | If single source |

---

## MODULE 8B: DRAFT & FAILED SUBMISSIONS (6 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractDrafts` | **Saved contract drafts** | DraftId, UserId, FormData (JSON), SubmissionStatusId, CurrentStep, ProgressPercentage, SubmissionAttempts, LastSubmissionError, ExpiresAt |
| 2 | `CorrespondenceDrafts` | **Saved correspondence drafts** | DraftId, UserId, FormData (JSON), SubmissionStatusId, CurrentStep, ProgressPercentage, SubmissionAttempts, LastSubmissionError, ExpiresAt |
| 3 | `DraftDocuments` | **Documents uploaded to drafts** | DocumentId, ContractDraftId, CorrespondenceDraftId, FileName, FilePath |
| 4 | `SubmissionAttempts` | **History of all submission attempts** | AttemptId, ContractDraftId, CorrespondenceDraftId, AttemptNumber, WasSuccessful, ErrorType, ErrorMessage |
| 5 | `FailedSubmissionNotifications` | **Notifications for failed submissions** | NotificationId, UserId, ContractDraftId, Title, Message, RetryUrl, IsRead |

---

## MODULE 8C: WORKFLOW, CORRECTIONS & STAGE DURATION (7 Tables)

### Correction Request Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractCorrectionRequests` | Correction requests for contracts | CorrectionRequestId, ContractId, CorrectionCycleNumber, PrimaryCorrectionReasonId, CorrectionInstructions, DeadlineDate, Status |
| 2 | `CorrespondenceCorrectionRequests` | Correction requests for correspondence | CorrectionRequestId, CorrespondenceId, CorrectionCycleNumber, PrimaryCorrectionReasonId, CorrectionInstructions, DeadlineDate, Status |
| 3 | `CorrectionDocuments` | Documents submitted as corrections | DocumentId, ContractCorrectionRequestId, CorrespondenceCorrectionRequestId, ReplacesDocumentId, FileName |

### Stage Duration Tracking Tables

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 4 | `ContractStageDurations` | Time tracking per stage for contracts | StageDurationId, ContractId, StageId, EnteredAt, ExitedAt, DurationMinutes, DurationBusinessDays, WasOverdue, DaysOverdue |
| 5 | `CorrespondenceStageDurations` | Time tracking per stage for correspondence | StageDurationId, CorrespondenceId, StageId, EnteredAt, ExitedAt, DurationMinutes, DurationBusinessDays, WasOverdue |

---

## MODULE 8D: CORRECTION RESPONSE TRACKING (5 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `ContractCorrectionDataChanges` | Tracks field changes during correction | ChangeId, CorrectionRequestId, FieldName, OldValue, NewValue, ChangedBy, IsVerified |
| 2 | `CorrespondenceCorrectionDataChanges` | Tracks field changes for correspondence | ChangeId, CorrectionRequestId, FieldName, OldValue, NewValue, ChangedBy, IsVerified |
| 3 | `ContractCorrectionResponseDrafts` | Auto-save correction response progress | DraftId, CorrectionRequestId, FormData (JSON), CurrentStep |
| 4 | `CorrespondenceCorrectionResponseDrafts` | Auto-save for correspondence corrections | DraftId, CorrectionRequestId, FormData (JSON), CurrentStep |
| 5 | `ContractFieldVersionHistory` | Complete version history of all field changes | VersionId, ContractId, FieldName, FieldValue, Version, CorrectionCycleNumber |

---

## MODULE 8E: RENEWAL/SUPPLEMENTAL VALIDATION (2 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupContractRenewalLimits` | Max renewals by contract nature | LimitId, ContractNatureId, MaxRenewals, RenewalWindowDays |
| 2 | `ContractValidationLog` | Audit trail of validation attempts | LogId, ContractNumber, EntityId, ValidationType, WasValid, ValidationErrors |

---

## MODULE 9: TRACKING & NOTIFICATIONS (5 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `SLATracking` | Deadline monitoring | TrackingId, EntityType, EntityId, DueDate, IsOverdue, EscalationLevel |
| 2 | `EscalationRules` | Auto-escalation config | RuleId, TriggerCondition, EscalateTo |
| 3 | `Notifications` | User notifications | NotificationId, UserId, Message, IsRead, NotificationType |
| 4 | `EmailQueue` | Email sending queue | EmailId, ToAddress, Status, SentAt |
| 5 | `EmailTemplates` | Email templates | TemplateId, TemplateName, Subject, Body |

---

## MODULE 10: AUDIT & ACTIVITY (3 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `AuditLog` | System-wide audit trail | LogId, TableName, RecordId, Action, OldValues, NewValues, ChangedBy, IPAddress |
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

## ContractsRegister - COMPLETE Column List (70+ Columns)

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

### Entity Ownership (for validation)
| Column | Type | Description |
|--------|------|-------------|
| `OwnerEntityId` | UNIQUEIDENTIFIER FK | Entity that owns this contract |
| `OwnerEntityNumber` | NVARCHAR(50) | Entity reference number |
| `RenewalCount` | INT | Number of renewals made |
| `MaxRenewals` | INT | Maximum allowed renewals |

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
| `CounterpartyName` | NVARCHAR(200) | Contractor/vendor name |
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
| `ContractValue` | DECIMAL(18,2) | Main contract amount |
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
| `ContractStartDate` | DATE | Contract start date |
| `ContractEndDate` | DATE | Contract end date |
| `ContractDuration` | NVARCHAR(100) | Duration text |
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
| `GoverningLaw` | NVARCHAR(100) | Governing law |
| `ExecutionLocation` | NVARCHAR(200) | Place of execution |
| `DisputeResolutionMethodId` | INT FK | Dispute resolution method |

### Workflow & Stage Tracking
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

## Views (40+)

| View | Purpose |
|------|---------|
| `vw_ContractCurrentStage` | Current stage status for all contracts with SLA tracking |
| `vw_CorrespondenceCurrentStage` | Current stage status for all correspondence |
| `vw_PendingCorrections` | All pending correction requests (combined) |
| `vw_StageDurationAnalytics` | Stage duration statistics and overdue percentages |
| `vw_ApplicantPendingCorrections` | Pending corrections for applicant dashboard |
| `vw_CorrectionChangeSummary` | Summary of changes per correction cycle |
| `vw_ContractDocumentChecklist` | Full document checklist by Nature/Category/Instrument |
| `vw_DocumentRequirementsSummary` | Summary counts of required/conditional/optional documents |
| `vw_ContractsWithParties` | Contracts with counterparty details |
| `vw_ContractsWithMilestones` | Contracts with milestone summary |
| `vw_OverdueContracts` | Contracts past SLA |
| `vw_OverdueCorrespondence` | Correspondence past SLA |
| `vw_DashboardMetrics` | Dashboard KPIs |
| `vw_StaffWorkload` | Staff workload summary |
| `vw_DepartmentPerformance` | Department performance metrics |
| `vw_EmailNotificationTypes` | All active email notification types with category |
| `vw_EmailNotificationSummary` | Email notification summary by category |

---

## MODULE 14: EMAIL NOTIFICATION TEMPLATES (5 Tables)

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `LookupEmailCategories` | Email notification categories | CategoryCode, CategoryName |
| 2 | `LookupEmailNotificationTypes` | Master list of all email notifications | NotificationTypeId, NotificationCode, DefaultSubject, DefaultBodyTemplate, RecipientType |
| 3 | `UserEmailPreferences` | User opt-in/opt-out preferences | UserId, NotificationTypeId, IsEnabled |
| 4 | `EmailSendLog` | Log of all sent emails | LogId, ToEmail, NotificationTypeId, Status, SentAt |
| 5 | `EmailQueue` | Queue for outgoing emails | EmailId, ToEmail, Subject, BodyHtml, Status |

**Email Notification Types (24 Total):**

| Code | Category | Description | Recipient |
|------|----------|-------------|-----------|
| `REG_SUCCESS` | Registration | Registration successful | Applicant |
| `REG_VERIFY_EMAIL` | Registration | Email verification required | Applicant |
| `REG_PASSWORD_RESET` | Registration | Password reset request | Applicant |
| `REG_PASSWORD_CHANGED` | Registration | Password changed confirmation | Applicant |
| `CONTRACT_SUBMITTED` | Contract | Contract submitted by applicant | Applicant |
| `CONTRACT_RECEIVED_SGC` | Contract | New contract received (to SGC) | Reviewer |
| `CONTRACT_ASSIGNED` | Contract | Contract assigned to reviewer | Reviewer |
| `CONTRACT_APPROVED` | Contract | Contract approved | Applicant |
| `CONTRACT_REJECTED` | Contract | Contract rejected | Applicant |
| `CORR_SUBMITTED` | Correspondence | Correspondence submitted | Applicant |
| `CORR_RECEIVED_SGC` | Correspondence | Correspondence received (to SGC) | Reviewer |
| `CORR_RESPONSE_READY` | Correspondence | Response ready for applicant | Applicant |
| `CORR_COMPLETED` | Correspondence | Correspondence completed | Applicant |
| `WF_STAGE_CHANGED` | Workflow | Workflow stage changed | Applicant |
| `WF_PENDING_APPROVAL` | Workflow | Approval required | Approver |
| `CORR_REQ_CLARIFICATION` | Corrections | Clarification required | Applicant |
| `CORR_CLARIFICATION_RECEIVED` | Corrections | Clarification response received | Reviewer |
| `CORR_CORRECTION_REQ` | Corrections | Corrections required | Applicant |
| `CORR_CORRECTION_SUBMITTED` | Corrections | Corrections submitted | Reviewer |
| `SLA_WARNING_REVIEWER` | SLA | SLA warning for reviewer | Reviewer |
| `SLA_BREACH` | SLA | SLA breach notification | Admin |
| `SLA_WARNING_APPLICANT` | SLA | Response deadline approaching | Applicant |
| `SYS_MAINTENANCE` | System | Scheduled maintenance | Applicant |
| `SYS_ACCOUNT_LOCKED` | System | Account locked | Applicant |

---

## MODULE 15: MANAGEMENT PORTAL TABLES (12 Tables)

**Supporting Management Portal Pages:**
- `/management/landing` - Landing page
- `/management/login` - Staff login (uses UserProfiles, UserSessions)
- `/management/register` - Staff registration requests
- `/management/users` - User management
- `/management/mda` - MDA management
- `/management/contracts-register` - Contracts register view
- `/management/contracts-history` - Contracts history view
- `/management/correspondence-register` - Correspondence register view
- `/management/correspondence-history` - Correspondence history view
- `/management/reports` - Reports & analytics
- `/management/activity` - Activity monitoring
- `/management/settings` - System settings
- `/management/status` - Status overview
- `/management/registers` - Combined registers view

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `MDAs` | Ministries, Departments, Agencies master | MDACode, MDAName, MDAType, CanSubmitContracts, RequiresSGApproval |
| 2 | `MDAContacts` | Authorized contacts per MDA | MDAId, UserId, ContactRole, CanSubmit, CanApprove |
| 3 | `MDAStatistics` | Pre-aggregated MDA statistics | MDAId, StatDate, TotalCorrespondence, TotalContracts, TotalContractValue |
| 4 | `SystemSettings` | Key-value system configuration | SettingCategory, SettingKey, SettingValue, SettingType |
| 5 | `SystemAnnouncements` | Portal announcements | Title, Message, AnnouncementType, TargetAudience, IsPinned |
| 6 | `UserNotificationPreferences` | User notification opt-in/out | UserId, NotificationTypeCode, EmailEnabled, SMSEnabled |
| 7 | `SavedReports` | Saved report configurations | ReportName, ReportType, FilterCriteria, ColumnSelection |
| 8 | `ReportExecutionLog` | Report execution history | ReportId, ExecutedBy, RecordsReturned, ExportFormat |
| 9 | `DailyStatisticsSnapshot` | Pre-aggregated daily stats for dashboards | TotalCorrespondence, TotalContracts, SLAComplianceRate |
| 10 | `PendingActionsQueue` | Items requiring attention | ActionType, CaseType, CaseId, PriorityLevel, DueDate, IsOverdue |
| 11 | `LookupRejectionReasons` | Standard rejection reasons | ReasonCode, ReasonName, ReasonCategory, RequiresComment |
| 12 | `StaffRequestStatusHistory` | Staff registration request audit | RequestId, PreviousStatus, NewStatus, ChangeReason |

**System Settings Categories:**
| Category | Settings |
|----------|----------|
| `general` | organization_name, organization_abbr, organization_address, organization_phone, organization_email, timezone |
| `sla` | correspondence_default_sla_days, contracts_default_sla_days, correction_response_days, sla_warning_threshold_percent |
| `security` | session_timeout_minutes, max_login_attempts, lockout_duration_minutes, password_min_length, require_2fa |
| `notifications` | email_notifications_enabled, sms_notifications_enabled, send_submission_confirmation, send_status_updates, send_sla_warnings |
| `system` | maintenance_mode, allow_public_registration, allow_staff_registration_requests, max_file_upload_size_mb, allowed_file_types |

**Rejection Reason Values:**
| Code | Name | Category |
|------|------|----------|
| INCOMPLETE_DOCS | Incomplete documentation | documentation |
| INVALID_FORMAT | Invalid document format | documentation |
| MISSING_SIGNATURES | Missing required signatures | documentation |
| EXPIRED_DOCUMENTS | Expired supporting documents | documentation |
| MISSING_APPROVAL | Missing required approval | compliance |
| UNAUTHORIZED_SUBMITTER | Unauthorized submitter | compliance |
| INCORRECT_CLASSIFICATION | Incorrect classification | content |
| INSUFFICIENT_DETAIL | Insufficient detail provided | content |
| DUPLICATE_SUBMISSION | Duplicate submission | process |
| CONTRACT_VALUE_MISMATCH | Contract value does not match documents | content |
| OUTSIDE_SCOPE | Outside SGC scope | process |
| OTHER | Other (specify in comments) | other |

---

## Stored Procedures (20+)

| Procedure | Purpose |
|-----------|---------|
| `sp_RequestContractCorrections` | Create correction request, set deadline, update status |
| `sp_SubmitContractCorrections` | Mark corrections as submitted, move to re-review |
| `sp_ChangeContractStage` | Change stage with automatic duration tracking |
| `sp_ValidateContractForRenewalSupplemental` | Validate contract for renewal/supplemental |
| `sp_ValidateContractClassification` | Validate Nature->Category->Instrument selection |
| `sp_CalculateSLADates` | Calculate SLA due dates |
| `sp_UpdateOverdueStatus` | Update overdue flags for all records |
| `sp_LogAuditEntry` | Log audit entries |
| `sp_GenerateReferenceNumber` | Generate next reference number |
| `sp_QueueEmailNotification` | Queue email notification by code with template data |
| `sp_UpdateDailyStatistics` | **Update daily statistics snapshot for dashboards** |
| `sp_GetSystemSetting` | **Get system setting value with default** |
| `sp_UpdateSystemSetting` | **Update system setting value** |
| `sp_RefreshMDAStatistics` | **Refresh MDA statistics aggregation** |

**Management Portal Views:**
| View | Purpose |
|------|---------|
| `vw_MDASummary` | MDA list with statistics |
| `vw_PendingActionsSummary` | Pending actions grouped by type/priority |
| `vw_TodayStatistics` | Today's dashboard statistics |
| `vw_RecentActivityFeed` | Recent activity for activity monitor |

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
| 13 | `013-workflow-corrections-stages.sql` | Workflow, corrections & stage duration tracking |
| 14 | `014-renewal-supplemental-validation.sql` | Renewal/supplemental validation & entity ownership |
| 15 | `015-missing-columns-audit-fix.sql` | Audit fix: missing form fields, SLA, sessions, audit log |
| 16 | `016-correction-response-tracking.sql` | Correction response: data changes, drafts, documents, field history |
| 17 | `017-appendix-c-document-requirements.sql` | Appendix C: Complete document requirements matrix |
| 18 | `018-email-notification-templates.sql` | Email notification types, templates & preferences |
| 19 | `019-management-portal-tables.sql` | **Management portal: MDAs, settings, reports, activity, statistics** |

**OR use `CONSOLIDATED_SCHEMA.sql` for single-file deployment.**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial schema |
| 1.1 | 2024 | Added Entity master, Ask Rex, Reports |
| 1.2 | 2024 | Added complete contract fields |
| 1.3 | 2024 | Added draft/failed submission handling |
| 1.4 | 2024 | Added workflow, corrections & stage duration tracking |
| 1.5 | 2024 | Added renewal/supplemental validation |
| 1.6 | 2024 | Comprehensive audit fix |
| 1.7 | 2024 | Correction response tracking |
| 1.8 | 2024 | Appendix C Document Requirements Matrix |
| 2.0 | Mar 2026 | Complete consolidation and documentation update |
| 2.1 | Mar 2026 | Email Notification Templates |
| 2.2 | Mar 2026 | **Management Portal Tables: MDAs, MDAContacts, MDAStatistics, SystemSettings, SystemAnnouncements, UserNotificationPreferences, SavedReports, ReportExecutionLog, DailyStatisticsSnapshot, PendingActionsQueue, LookupRejectionReasons, StaffRequestStatusHistory; sp_UpdateDailyStatistics, sp_GetSystemSetting, sp_UpdateSystemSetting, sp_RefreshMDAStatistics; vw_MDASummary, vw_PendingActionsSummary, vw_TodayStatistics, vw_RecentActivityFeed** |
