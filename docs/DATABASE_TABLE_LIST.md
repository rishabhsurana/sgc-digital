# SGC Digital - Complete Database Table List

## Application Overview

**Application Name:** SGC Digital - Correspondence & Contract Management Portal  
**Database:** Microsoft SQL Server (On-Premise)  
**Total Tables:** 62  
**Total Views:** 12  

---

## Table Inventory by Module

### MODULE 1: USER & IDENTITY MANAGEMENT (8 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 1 | `UserRoles` | Defines system roles and permissions | RoleId, RoleCode, RoleName, PermissionLevel | Parent to UserProfiles |
| 2 | `EntityTypes` | Types of registering organizations | EntityTypeId, TypeCode, TypeName, RequiresBarNumber | Parent to Entities |
| 3 | `Departments` | Government departments/ministries | DepartmentId, DepartmentCode, DepartmentName, ParentDepartmentId | Self-referencing, Parent to UserProfiles |
| 4 | `RequestStatuses` | Registration/request status lookup | StatusId, StatusCode, StatusName | Parent to multiple tables |
| 5 | `Entities` | Master table for all registered organizations | EntityId, EntityNumber, OrganizationName, EntityTypeId | Parent to UserProfiles, AuthorizedUsers |
| 6 | `UserProfiles` | All system users (public & staff) | UserId, Email, FirstName, LastName, EntityId, RoleId | Child of Entities, Roles; Parent to Sessions |
| 7 | `UserSessions` | Active login sessions | SessionId, UserId, SessionToken, ExpiresAt | Child of UserProfiles |
| 8 | `EntityAuthorizedUsers` | Additional users per entity | AuthorizedUserId, EntityId, Email, PermissionLevel | Child of Entities |

---

### MODULE 2: STAFF MANAGEMENT (2 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 9 | `StaffRegistrationRequests` | Staff access requests pending approval | RequestId, Email, RequestedRole, ApprovalStatus | References UserRoles, Departments |
| 10 | `StaffApprovalHistory` | Audit trail of approval decisions | HistoryId, RequestId, Action, ActionBy | Child of StaffRegistrationRequests |

---

### MODULE 3: CORRESPONDENCE MANAGEMENT (7 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 11 | `CorrespondenceTypes` | Types of legal correspondence | CorresTypeId, TypeCode, TypeName, DefaultSLADays | Parent to CorrespondenceRegister |
| 12 | `PriorityLevels` | Priority/urgency levels | PriorityId, PriorityCode, PriorityName, SLADays | Parent to Correspondence, Contracts |
| 13 | `CaseStatuses` | Workflow status definitions | StatusId, StatusCode, StatusName, StatusCategory | Parent to Correspondence, Contracts |
| 14 | `CorrespondenceRegister` | Main correspondence submissions | CorrespondenceId, ReferenceNumber, Subject, RequestingEntityId | Core transaction table |
| 15 | `CorrespondenceStatusHistory` | Status change audit trail | HistoryId, CorrespondenceId, FromStatusId, ToStatusId | Child of CorrespondenceRegister |
| 16 | `CorrespondenceDocuments` | Attached files/documents | DocumentId, CorrespondenceId, DocumentName, FilePath | Child of CorrespondenceRegister |
| 17 | `CorrespondenceComments` | Internal/external notes | CommentId, CorrespondenceId, CommentText, IsInternal | Child of CorrespondenceRegister |

---

### MODULE 4: CONTRACT MANAGEMENT (10 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 18 | `ContractTypes` | Types of contracts | ContractTypeId, TypeCode, TypeName | Parent to ContractsRegister |
| 19 | `ContractNatures` | Nature/category of contracts | NatureId, NatureCode, NatureName | Parent to ContractsRegister |
| 20 | `Currencies` | Currency lookup | CurrencyId, CurrencyCode, CurrencySymbol, ExchangeRate | Parent to ContractsRegister |
| 21 | `ContractsRegister` | Main contract submissions | ContractId, ReferenceNumber, ContractTitle, ContractValue | Core transaction table |
| 22 | `ContractStatusHistory` | Status change audit trail | HistoryId, ContractId, FromStatusId, ToStatusId | Child of ContractsRegister |
| 23 | `ContractDocuments` | Attached files/documents | DocumentId, ContractId, DocumentName, FilePath | Child of ContractsRegister |
| 24 | `ContractComments` | Internal/external notes | CommentId, ContractId, CommentText, IsInternal | Child of ContractsRegister |
| 25 | `ContractAmendments` | Contract modifications | AmendmentId, ContractId, AmendmentNumber, ValueChange | Child of ContractsRegister |
| 26 | `ContractCounterparties` | Multiple parties per contract | CounterpartyId, ContractId, PartyName, PartyRole | Child of ContractsRegister |
| 27 | `ContractMilestones` | Payment/delivery milestones | MilestoneId, ContractId, Description, DueDate, Amount | Child of ContractsRegister |

---

### MODULE 5: CONTRACT RENEWALS (4 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 28 | `RenewalStatuses` | Renewal workflow statuses | RenewalStatusId, StatusCode, StatusName | Parent to ContractRenewals |
| 29 | `ContractRenewals` | Renewal requests | RenewalId, OriginalContractId, IsValidRenewal, ProposedValue | Links to ContractsRegister |
| 30 | `ContractRenewalStatusHistory` | Renewal status audit trail | HistoryId, RenewalId, FromStatusId, ToStatusId | Child of ContractRenewals |
| 31 | `ContractRenewalDocuments` | Renewal supporting documents | DocumentId, RenewalId, DocumentName, FilePath | Child of ContractRenewals |

---

### MODULE 6: ENTITY REGISTRATION & VERIFICATION (3 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 32 | `EntityRegistrationHistory` | Full registration audit trail | HistoryId, EntityNumber, ActionType, ChangeDescription | Links to Entities |
| 33 | `EmailVerificationTokens` | Email confirmation tokens | TokenId, Email, Token, TokenType, ExpiresAt | Links to UserProfiles |
| 34 | `DocumentVerifications` | Document verification records | VerificationId, EntityId, DocumentType, VerifiedBy | Child of Entities |

---

### MODULE 7: NOTIFICATIONS & COMMUNICATIONS (3 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 35 | `Notifications` | User notifications | NotificationId, UserId, Title, Message, IsRead | Child of UserProfiles |
| 36 | `EmailQueue` | Outbound email queue | EmailId, ToEmail, Subject, Status, SentAt | Standalone |
| 37 | `EmailTemplates` | Email template definitions | TemplateId, TemplateName, Subject, BodyHtml | Standalone |

---

### MODULE 8: SLA & TRACKING (2 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 38 | `SLATracking` | SLA monitoring for all items | SLAId, ItemType, ItemId, DueDate, IsOverdue | Links to Correspondence, Contracts, Renewals |
| 39 | `EscalationRules` | Auto-escalation configuration | RuleId, ItemType, DaysOverdue, EscalateToRole | Configuration table |

---

### MODULE 9: AUDIT & ACTIVITY LOGGING (2 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 40 | `AuditLog` | System-wide audit trail | AuditId, UserId, Action, TableName, OldValues, NewValues | Links to UserProfiles |
| 41 | `ActivityLog` | User activity tracking | ActivityId, UserId, ActivityType, Description, IpAddress | Links to UserProfiles |

---

### MODULE 10: REPORTING & ANALYTICS (8 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 42 | `ReportDefinitions` | Available report templates | ReportId, ReportCode, ReportName, Category, BaseQuery | Configuration table |
| 43 | `ReportExecutionLog` | Report generation history | ExecutionId, ReportId, ExecutedByUserId, Parameters | Child of ReportDefinitions |
| 44 | `ScheduledReports` | Automated report schedules | ScheduleId, ReportId, CronExpression, Recipients | Child of ReportDefinitions |
| 45 | `DailyMetrics` | Daily aggregated KPIs | MetricId, MetricDate, NewCorrespondence, NewContracts | Analytics table |
| 46 | `DepartmentMetrics` | Department performance | MetricId, DepartmentId, MetricDate, SLAComplianceRate | Analytics table |
| 47 | `StaffMetrics` | Staff performance | MetricId, UserId, MetricDate, ItemsCompleted, AvgDays | Analytics table |
| 48 | `ContractValueSummary` | Financial summaries | SummaryId, Period, TotalValue, ByDepartment | Analytics table |
| 49 | `UserRegistrationMetrics` | Registration analytics | MetricId, MetricDate, NewRegistrations, ByEntityType | Analytics table |

---

### MODULE 11: ASK REX AI ASSISTANT (9 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 50 | `AskRexSessions` | AI conversation sessions | SessionId, UserId, Context, StartedAt, MessageCount | Links to UserProfiles |
| 51 | `AskRexMessages` | Individual chat messages | MessageId, SessionId, MessageType, Content, Intent | Child of AskRexSessions |
| 52 | `AskRexMessageFiles` | Files referenced in responses | FileId, MessageId, ItemType, ItemId, ReferenceNumber | Child of AskRexMessages |
| 53 | `AskRexSearchQueries` | Search query analytics | QueryId, SessionId, QueryText, QueryType, ResultsCount | Links to AskRexSessions |
| 54 | `AskRexGeneratedReports` | Reports generated via Rex | ReportId, SessionId, ReportType, OutputFormat, FilePath | Links to AskRexSessions |
| 55 | `AskRexFeedback` | User feedback on responses | FeedbackId, MessageId, Rating, FeedbackText, WasHelpful | Child of AskRexMessages |
| 56 | `AskRexSavedPrompts` | Default & saved prompts | PromptId, PromptText, Category, IsDefault, UsageCount | Configuration table |
| 57 | `AskRexKnowledgeBase` | Custom knowledge entries | EntryId, Category, Question, Answer, Keywords | Knowledge store |
| 58 | `AskRexDailyAnalytics` | Daily AI usage metrics | AnalyticsId, AnalyticsDate, TotalSessions, TotalQueries | Analytics table |

---

### MODULE 12: SYSTEM CONFIGURATION (4 Tables)

| # | Table Name | Description | Key Columns | Relationships |
|---|------------|-------------|-------------|---------------|
| 59 | `SystemSettings` | Application settings | SettingId, SettingKey, SettingValue, Category | Configuration table |
| 60 | `FeatureFlags` | Feature toggles | FlagId, FlagName, IsEnabled, EnabledForRoles | Configuration table |
| 61 | `ReferenceNumberSequences` | Auto-numbering sequences | SequenceId, Prefix, CurrentValue, Year | Numbering control |
| 62 | `HolidayCalendar` | Public holidays for SLA | HolidayId, HolidayDate, HolidayName, IsRecurring | SLA calculation |

---

## Database Views (12 Views)

| # | View Name | Description | Source Tables |
|---|-----------|-------------|---------------|
| 1 | `vw_TransactionHistory` | Combined correspondence & contracts | CorrespondenceRegister, ContractsRegister |
| 2 | `vw_CorrespondenceReport` | Correspondence with all details | CorrespondenceRegister + lookups |
| 3 | `vw_ContractReport` | Contracts with all details | ContractsRegister + lookups |
| 4 | `vw_ContractsExpiringForRenewal` | Contracts due for renewal | ContractsRegister |
| 5 | `vw_SLACompliance` | SLA compliance rates | SLATracking + registers |
| 6 | `vw_FinancialSummary` | Contract values by period | ContractsRegister |
| 7 | `vw_UserRegistrations` | Registration analytics | Entities, UserProfiles |
| 8 | `vw_DepartmentDashboard` | Department KPIs | Multiple tables |
| 9 | `vw_StaffWorkload` | Staff assignment summary | Assignments |
| 10 | `vw_PendingApprovals` | Items awaiting approval | Multiple tables |
| 11 | `vw_OverdueItems` | All overdue items | SLATracking |
| 12 | `vw_AskRexAnalytics` | AI assistant metrics | AskRex* tables |

---

## Key Relationships Summary

### Entity-User Association
```
Entities (1) ──────────────────────> UserProfiles (N)
    │                                      │
    │                                      │
    └──────> EntityAuthorizedUsers (N)     │
                                           │
                                           v
                              CorrespondenceRegister, ContractsRegister
```

### Transaction Hierarchy
```
Entities/Users
      │
      ├──> CorrespondenceRegister ──> StatusHistory, Documents, Comments
      │
      └──> ContractsRegister ──> StatusHistory, Documents, Comments, Amendments
                  │
                  └──> ContractRenewals ──> RenewalStatusHistory, RenewalDocuments
```

### Renewal Validation Chain
```
ContractsRegister (Original)
      │
      └──> ContractRenewals (1st Renewal) ──> IsValidRenewal = TRUE/FALSE
                  │                                    │
                  │                           ValidationNotes, ValidatedBy
                  │
                  └──> ContractRenewals (2nd Renewal via PreviousRenewalId)
                              │
                              └──> NewContractId ──> ContractsRegister (New)
```

---

## Storage Estimates

| Module | Est. Rows/Year | Est. Size |
|--------|----------------|-----------|
| Users & Entities | 5,000 | 50 MB |
| Correspondence | 10,000 | 200 MB |
| Contracts | 3,000 | 150 MB |
| Renewals | 500 | 25 MB |
| Documents (metadata) | 50,000 | 100 MB |
| Status History | 100,000 | 200 MB |
| Audit Logs | 500,000 | 500 MB |
| Ask Rex | 200,000 | 300 MB |
| Reports/Analytics | 10,000 | 50 MB |
| **Total** | **~900,000** | **~1.5 GB/year** |

---

## Deployment Files

| File | Purpose |
|------|---------|
| `CONSOLIDATED_SCHEMA.sql` | **Complete schema in one file (RECOMMENDED)** |
| `001-user-management.sql` | User tables only |
| `002-correspondence.sql` | Correspondence tables only |
| `003-contracts.sql` | Contract tables only |
| `004-audit-activity.sql` | Audit tables only |
| `005-views-reports.sql` | Views only |
| `006-renewals-and-tracking.sql` | Renewals and SLA tables |
| `007-entities-reports-comprehensive.sql` | Entity and reporting tables |
| `008-ask-rex-ai-assistant.sql` | Ask Rex AI tables |

---

## Document Version

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2024 | SGC Digital Team | Initial schema |
| 1.1 | March 2024 | v0 | Added Entity master, Ask Rex, Reports |
