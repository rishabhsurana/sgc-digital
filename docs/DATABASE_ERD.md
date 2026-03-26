# SGC Digital - Entity Relationship Diagram (ERD)

## Overview

This document provides the complete Entity Relationship Diagram for the SGC Digital Correspondence & Contract Management Portal.

---

## High-Level Domain Model

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|     ENTITIES     |------>|      USERS       |------>|    SESSIONS      |
|  (Organizations) |  1:N  |   (Profiles)     |  1:N  |  (Login/Auth)    |
|                  |       |                  |       |                  |
+------------------+       +------------------+       +------------------+
         |                        |
         |                        |
         v                        v
+------------------+       +------------------+
|                  |       |                  |
|  CORRESPONDENCE  |       |    CONTRACTS     |
|    REGISTER      |       |    REGISTER      |
|                  |       |                  |
+------------------+       +------------------+
         |                        |
         |                        |
         v                        v
+------------------+       +------------------+
|                  |       |                  |
|  STATUS HISTORY  |       |    RENEWALS      |
|  DOCUMENTS       |       |   AMENDMENTS     |
|  COMMENTS        |       |                  |
+------------------+       +------------------+
```

---

## Detailed ERD - Core Tables

### 1. USER & ENTITY MANAGEMENT

```
+------------------------+          +------------------------+
|      UserRoles         |          |     EntityTypes        |
+------------------------+          +------------------------+
| PK RoleId              |          | PK EntityTypeId        |
|    RoleCode            |          |    TypeCode            |
|    RoleName            |          |    TypeName            |
|    PermissionLevel     |          |    RequiresBarNumber   |
|    IsActive            |          |    RequiresCompanyReg  |
+------------------------+          +------------------------+
           |                                   |
           | 1:N                               | 1:N
           v                                   v
+----------------------------------------------------------+
|                        Entities                           |
+----------------------------------------------------------+
| PK EntityId            (UNIQUEIDENTIFIER)                 |
|    EntityNumber        (NVARCHAR) - e.g., MDA-MOF-001    |
| FK EntityTypeId        --> EntityTypes                    |
|    OrganizationName                                       |
|    RegistrationNumber                                     |
|    TaxId                                                  |
|    ContactEmail                                           |
|    ContactPhone                                           |
|    AddressLine1, AddressLine2, City, Parish, Country     |
| FK DepartmentId        --> Departments                    |
|    Ministry            (for MDA entities)                 |
|    BarNumber           (for attorneys)                    |
|    LawFirm             (for attorneys)                    |
|    CompanyType         (for companies)                    |
|    IncorporationDate   (for companies)                    |
| FK RegistrationStatusId --> RequestStatuses               |
|    EmailVerified                                          |
|    DocumentsVerified                                      |
|    CreatedAt, UpdatedAt                                   |
+----------------------------------------------------------+
           |
           | 1:N
           v
+----------------------------------------------------------+
|                      UserProfiles                         |
+----------------------------------------------------------+
| PK UserId              (UNIQUEIDENTIFIER)                 |
| FK EntityId            --> Entities                       |
|    EntityNumber        (legacy, for migration)            |
| FK RoleId              --> UserRoles                      |
| FK DepartmentId        --> Departments                    |
|    FirstName, LastName                                    |
|    Email               (UNIQUE)                           |
|    PasswordHash                                           |
|    Phone, Position, ProfileImageUrl                       |
|    IsActive, IsStaff, IsEmailVerified                    |
|    LastLoginAt, CreatedAt, UpdatedAt                     |
+----------------------------------------------------------+
           |
           | 1:N
           v
+------------------------+          +------------------------+
|    UserSessions        |          | EntityAuthorizedUsers  |
+------------------------+          +------------------------+
| PK SessionId           |          | PK AuthorizedUserId    |
| FK UserId              |          | FK EntityId --> Entities|
|    SessionToken        |          | FK InvitedByUserId     |
|    DeviceInfo          |          |    Email               |
|    IpAddress           |          |    FirstName, LastName |
|    CreatedAt           |          |    PermissionLevel     |
|    ExpiresAt           |          |    CanSubmitCorres     |
|    IsActive            |          |    CanSubmitContracts  |
+------------------------+          |    CanViewReports      |
                                    |    InvitationStatus    |
                                    |    InvitedAt, AcceptedAt|
                                    +------------------------+
```

---

### 2. CORRESPONDENCE MANAGEMENT

```
+------------------------+          +------------------------+
| CorrespondenceTypes    |          |    PriorityLevels      |
+------------------------+          +------------------------+
| PK CorresTypeId        |          | PK PriorityId          |
|    TypeCode            |          |    PriorityCode        |
|    TypeName            |          |    PriorityName        |
|    Description         |          |    SLADays             |
|    DefaultSLADays      |          |    ColorCode           |
+------------------------+          +------------------------+
           |                                   |
           | 1:N                               | 1:N
           v                                   v
+----------------------------------------------------------+
|                  CorrespondenceRegister                   |
+----------------------------------------------------------+
| PK CorrespondenceId    (UNIQUEIDENTIFIER)                 |
|    ReferenceNumber     (NVARCHAR) - e.g., COR-2024-00001 |
| FK CorrespondenceTypeId --> CorrespondenceTypes           |
| FK PriorityId          --> PriorityLevels                 |
| FK CaseStatusId        --> CaseStatuses                   |
|    Subject                                                |
|    Description                                            |
|    --- Requesting Entity Info ---                         |
| FK RequestingUserId    --> UserProfiles                   |
| FK RequestingEntityId  --> Entities                       |
|    RequestingDepartment                                   |
|    RequestingOfficerName, Email, Phone                   |
|    --- Assignment ---                                     |
| FK AssignedToUserId    --> UserProfiles                   |
|    AssignedAt                                             |
|    --- Dates ---                                          |
|    SubmittedAt, DueDate, CompletedAt                     |
|    --- Response ---                                       |
|    ResponseSummary                                        |
| FK RespondedByUserId   --> UserProfiles                   |
|    ResponseDate                                           |
|    --- Audit ---                                          |
|    CreatedAt, UpdatedAt                                   |
| FK CreatedBy           --> UserProfiles                   |
| FK UpdatedBy           --> UserProfiles                   |
+----------------------------------------------------------+
           |
           | 1:N
           v
+------------------------+   +------------------------+   +------------------------+
| CorresStatusHistory    |   | CorrespondenceDocuments|   | CorrespondenceComments |
+------------------------+   +------------------------+   +------------------------+
| PK HistoryId           |   | PK DocumentId          |   | PK CommentId           |
| FK CorrespondenceId    |   | FK CorrespondenceId    |   | FK CorrespondenceId    |
| FK FromStatusId        |   |    DocumentName        |   | FK UserId              |
| FK ToStatusId          |   |    DocumentType        |   |    CommentText         |
|    Comments            |   |    FilePath            |   |    IsInternal          |
| FK ChangedBy           |   |    FileSize            |   |    CreatedAt           |
|    ChangedAt           |   |    UploadedBy          |   +------------------------+
+------------------------+   |    UploadedAt          |
                             +------------------------+
```

---

### 3. CONTRACT MANAGEMENT

```
+------------------------+          +------------------------+
|    ContractTypes       |          |    ContractNatures     |
+------------------------+          +------------------------+
| PK ContractTypeId      |          | PK NatureId            |
|    TypeCode            |          |    NatureCode          |
|    TypeName            |          |    NatureName          |
|    Description         |          |    Description         |
+------------------------+          +------------------------+
           |                                   |
           | 1:N                               | 1:N
           v                                   v
+----------------------------------------------------------+
|                     ContractsRegister                     |
+----------------------------------------------------------+
| PK ContractId          (UNIQUEIDENTIFIER)                 |
|    ReferenceNumber     (NVARCHAR) - e.g., CON-2024-00001 |
| FK ContractTypeId      --> ContractTypes                  |
| FK ContractNatureId    --> ContractNatures                |
| FK PriorityId          --> PriorityLevels                 |
| FK CaseStatusId        --> CaseStatuses                   |
|    ContractTitle                                          |
|    Description                                            |
|    --- Counterparty ---                                   |
|    CounterpartyName                                       |
|    CounterpartyContact, Email, Phone                     |
|    CounterpartyAddress                                    |
|    --- Financial ---                                      |
|    ContractValue                                          |
| FK CurrencyId          --> Currencies                     |
|    PaymentTerms                                           |
|    --- Dates ---                                          |
|    EffectiveDate, ExpiryDate                             |
|    SubmittedAt, DueDate, CompletedAt                     |
|    --- Requesting Entity ---                              |
| FK RequestingUserId    --> UserProfiles                   |
| FK RequestingEntityId  --> Entities                       |
|    RequestingDepartment                                   |
|    RequestingOfficerName, Email, Phone                   |
|    --- Assignment ---                                     |
| FK AssignedToUserId    --> UserProfiles                   |
|    --- Legal Review ---                                   |
|    LegalReviewNotes                                       |
| FK ApprovedBy          --> UserProfiles                   |
|    ApprovalDate, ApprovalNotes                           |
|    --- Renewal Tracking ---                               |
|    IsRenewal                                              |
| FK OriginalContractId  --> ContractsRegister (self-ref)   |
|    RenewalCount                                           |
|    --- Audit ---                                          |
|    CreatedAt, UpdatedAt, CreatedBy, UpdatedBy            |
+----------------------------------------------------------+
           |
           +---------------+---------------+---------------+
           | 1:N           | 1:N           | 1:N           | 1:N
           v               v               v               v
+------------------+ +------------------+ +------------------+ +------------------+
| ContractStatus   | | ContractDocuments| | ContractComments | | ContractAmendments|
|    History       | +------------------+ +------------------+ +------------------+
+------------------+ | PK DocumentId    | | PK CommentId     | | PK AmendmentId   |
| PK HistoryId     | | FK ContractId    | | FK ContractId    | | FK ContractId    |
| FK ContractId    | |    DocumentName  | | FK UserId        | |    AmendmentNo   |
| FK FromStatusId  | |    DocumentType  | |    CommentText   | |    Description   |
| FK ToStatusId    | |    FilePath      | |    IsInternal    | |    ValueChange   |
|    Comments      | |    FileSize      | |    CreatedAt     | |    EffectiveDate |
| FK ChangedBy     | |    UploadedBy    | +------------------+ |    ApprovedBy    |
|    ChangedAt     | |    UploadedAt    |                      |    ApprovedAt    |
+------------------+ +------------------+                      +------------------+
```

---

### 4. CONTRACT RENEWALS

```
+----------------------------------------------------------+
|                    ContractRenewals                       |
+----------------------------------------------------------+
| PK RenewalId           (UNIQUEIDENTIFIER)                 |
|    RenewalReferenceNumber (NVARCHAR) - e.g., REN-2024-001|
| FK OriginalContractId  --> ContractsRegister              |
| FK PreviousRenewalId   --> ContractRenewals (self-ref)    |
|    RenewalSequence     (1st, 2nd, 3rd renewal)            |
|    --- Validation ---                                     |
|    IsValidRenewal      (BIT)                              |
|    ValidationNotes                                        |
| FK ValidatedBy         --> UserProfiles                   |
|    ValidatedAt                                            |
|    --- Original Contract Summary ---                      |
|    OriginalContractNumber                                 |
|    OriginalContractTitle                                  |
|    OriginalStartDate, OriginalEndDate                    |
|    OriginalValue                                          |
|    --- Proposed Terms ---                                 |
|    ProposedStartDate, ProposedEndDate                    |
|    ProposedValue                                          |
|    ValueChange, ValueChangePercent                       |
|    TermsChanged, TermsChangeDescription                  |
|    --- Counterparty ---                                   |
|    CounterpartyName                                       |
|    CounterpartyChanged                                    |
|    --- Status & Assignment ---                            |
| FK RenewalStatusId     --> RenewalStatuses                |
| FK AssignedToUserId    --> UserProfiles                   |
|    --- Approval ---                                       |
| FK ApprovedBy          --> UserProfiles                   |
|    ApprovalNotes, ApprovedAt                             |
| FK RejectedBy          --> UserProfiles                   |
|    RejectionReason, RejectedAt                           |
|    --- Result ---                                         |
| FK NewContractId       --> ContractsRegister              |
|    ExecutedDate                                           |
|    --- Audit ---                                          |
|    SubmittedAt, DueDate, CompletedAt                     |
|    CreatedAt, UpdatedAt, CreatedBy, UpdatedBy            |
+----------------------------------------------------------+
           |
           | 1:N
           v
+------------------------+          +------------------------+
| RenewalStatusHistory   |          |  RenewalDocuments      |
+------------------------+          +------------------------+
| PK HistoryId           |          | PK DocumentId          |
| FK RenewalId           |          | FK RenewalId           |
| FK FromStatusId        |          |    DocumentName        |
| FK ToStatusId          |          |    FilePath, FileSize  |
|    Comments            |          |    UploadedBy          |
| FK ChangedBy           |          |    UploadedAt          |
|    ChangedAt           |          +------------------------+
+------------------------+
```

---

### 5. ASK REX AI ASSISTANT

```
+----------------------------------------------------------+
|                     AskRexSessions                        |
+----------------------------------------------------------+
| PK SessionId           (UNIQUEIDENTIFIER)                 |
| FK UserId              --> UserProfiles                   |
|    SessionTitle                                           |
|    Context             (correspondence/contracts/general) |
|    ContextItemId       (specific item being discussed)    |
|    DeviceType, Browser                                    |
|    StartedAt, LastActivityAt, EndedAt                    |
|    IsActive                                               |
|    MessageCount, SearchCount                             |
+----------------------------------------------------------+
           |
           | 1:N
           v
+----------------------------------------------------------+
|                     AskRexMessages                        |
+----------------------------------------------------------+
| PK MessageId           (UNIQUEIDENTIFIER)                 |
| FK SessionId           --> AskRexSessions                 |
|    MessageType         (user/assistant/system/error)      |
|    Content                                                |
|    Intent              (search/report/status/help/other)  |
|    Confidence          (AI confidence score)              |
|    ProcessingTimeMs                                       |
|    TokensUsed                                             |
|    CreatedAt                                              |
+----------------------------------------------------------+
           |
           +---------------+---------------+
           | 1:N           | 1:N           | 1:N
           v               v               v
+------------------+ +------------------+ +------------------+
| AskRexMessage    | | AskRexSearch     | | AskRexGenerated  |
|    Files         | |    Queries       | |    Reports       |
+------------------+ +------------------+ +------------------+
| PK FileId        | | PK QueryId       | | PK ReportId      |
| FK MessageId     | | FK SessionId     | | FK SessionId     |
|    ItemType      | | FK MessageId     | | FK MessageId     |
|    ItemId        | |    QueryText     | |    ReportType    |
|    ReferenceNo   | |    QueryType     | |    ReportTitle   |
|    Title         | |    FiltersApplied| |    Parameters    |
|    Relevance     | |    ResultsCount  | |    OutputFormat  |
|    Snippet       | |    ExecutionMs   | |    FilePath      |
+------------------+ |    CreatedAt     | |    GeneratedAt   |
                     +------------------+ +------------------+

+------------------------+          +------------------------+
|   AskRexFeedback       |          | AskRexKnowledgeBase    |
+------------------------+          +------------------------+
| PK FeedbackId          |          | PK EntryId             |
| FK MessageId           |          |    Category            |
| FK SessionId           |          |    Question            |
| FK UserId              |          |    Answer              |
|    Rating (1-5)        |          |    Keywords            |
|    FeedbackType        |          |    SourceType          |
|    FeedbackText        |          |    SourceReference     |
|    WasHelpful          |          |    IsActive            |
|    CreatedAt           |          |    UsageCount          |
+------------------------+          |    CreatedBy           |
                                    +------------------------+
```

---

### 6. REPORTING & ANALYTICS

```
+------------------------+          +------------------------+
|   ReportDefinitions    |          |   ScheduledReports     |
+------------------------+          +------------------------+
| PK ReportId            |          | PK ScheduleId          |
|    ReportCode          |          | FK ReportId            |
|    ReportName          |          | FK CreatedByUserId     |
|    Description         |          |    ScheduleType        |
|    Category            |          |    CronExpression      |
|    BaseQuery           |          |    Parameters          |
|    AvailableFilters    |          |    Recipients          |
|    OutputFormats       |          |    OutputFormat        |
|    RequiredRole        |          |    LastRunAt           |
|    IsActive            |          |    NextRunAt           |
+------------------------+          |    IsActive            |
           |                        +------------------------+
           | 1:N
           v
+------------------------+
|  ReportExecutionLog    |
+------------------------+
| PK ExecutionId         |
| FK ReportId            |
| FK ExecutedByUserId    |
|    Parameters          |
|    OutputFormat        |
|    FilePath            |
|    RecordCount         |
|    ExecutionTimeMs     |
|    Status              |
|    ErrorMessage        |
|    ExecutedAt          |
+------------------------+

+------------------------+          +------------------------+
|    DailyMetrics        |          |   DepartmentMetrics    |
+------------------------+          +------------------------+
| PK MetricId            |          | PK MetricId            |
|    MetricDate          |          | FK DepartmentId        |
|    NewCorrespondence   |          |    MetricDate          |
|    ClosedCorrespondence|          |    Submissions         |
|    NewContracts        |          |    Completed           |
|    ClosedContracts     |          |    Pending             |
|    NewRenewals         |          |    AverageProcessDays  |
|    ApprovedRenewals    |          |    SLAComplianceRate   |
|    NewUsers            |          |    TotalContractValue  |
|    ActiveUsers         |          +------------------------+
|    RexQueries          |
|    AvgResponseTime     |
+------------------------+
```

---

### 7. AUDIT & SYSTEM

```
+------------------------+          +------------------------+
|      AuditLog          |          |     ActivityLog        |
+------------------------+          +------------------------+
| PK AuditId             |          | PK ActivityId          |
| FK UserId              |          | FK UserId              |
|    Action              |          |    ActivityType        |
|    TableName           |          |    Description         |
|    RecordId            |          |    ItemType            |
|    OldValues (JSON)    |          |    ItemId              |
|    NewValues (JSON)    |          |    IpAddress           |
|    IpAddress           |          |    UserAgent           |
|    UserAgent           |          |    CreatedAt           |
|    CreatedAt           |          +------------------------+
+------------------------+

+------------------------+          +------------------------+
|    Notifications       |          |     EmailQueue         |
+------------------------+          +------------------------+
| PK NotificationId      |          | PK EmailId             |
| FK UserId              |          |    ToEmail, ToName     |
|    NotificationType    |          |    CcEmails, BccEmails |
|    Title               |          |    Subject             |
|    Message             |          |    BodyHtml, BodyText  |
|    RelatedItemType     |          |    TemplateName        |
|    RelatedItemId       |          |    RelatedItemType     |
|    IsRead              |          |    RelatedItemId       |
|    ReadAt              |          |    Status              |
|    CreatedAt           |          |    SentAt, FailedAt    |
+------------------------+          |    RetryCount          |
                                    +------------------------+

+----------------------------------------------------------+
|                      SLATracking                          |
+----------------------------------------------------------+
| PK SLAId               (UNIQUEIDENTIFIER)                 |
|    ItemType            (correspondence/contract/renewal)  |
|    ItemId                                                 |
|    ReferenceNumber                                        |
|    SLADays                                                |
|    StartDate                                              |
|    DueDate                                                |
|    IsOverdue                                              |
|    DaysOverdue                                            |
|    IsCompleted                                            |
|    CompletedAt                                            |
|    EscalationLevel                                        |
|    LastEscalatedAt                                        |
| FK EscalatedTo         --> UserProfiles                   |
+----------------------------------------------------------+
```

---

## Relationship Summary

### One-to-Many Relationships (1:N)

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| Entities | UserProfiles | EntityId |
| Entities | EntityAuthorizedUsers | EntityId |
| Entities | CorrespondenceRegister | RequestingEntityId |
| Entities | ContractsRegister | RequestingEntityId |
| UserProfiles | UserSessions | UserId |
| UserProfiles | CorrespondenceRegister | RequestingUserId, AssignedToUserId |
| UserProfiles | ContractsRegister | RequestingUserId, AssignedToUserId |
| UserProfiles | ContractRenewals | Various user FKs |
| UserProfiles | AskRexSessions | UserId |
| UserRoles | UserProfiles | RoleId |
| EntityTypes | Entities | EntityTypeId |
| Departments | UserProfiles | DepartmentId |
| Departments | Entities | DepartmentId |
| CorrespondenceTypes | CorrespondenceRegister | CorrespondenceTypeId |
| ContractTypes | ContractsRegister | ContractTypeId |
| PriorityLevels | CorrespondenceRegister | PriorityId |
| PriorityLevels | ContractsRegister | PriorityId |
| CaseStatuses | CorrespondenceRegister | CaseStatusId |
| CaseStatuses | ContractsRegister | CaseStatusId |
| CorrespondenceRegister | CorrespondenceStatusHistory | CorrespondenceId |
| CorrespondenceRegister | CorrespondenceDocuments | CorrespondenceId |
| CorrespondenceRegister | CorrespondenceComments | CorrespondenceId |
| ContractsRegister | ContractStatusHistory | ContractId |
| ContractsRegister | ContractDocuments | ContractId |
| ContractsRegister | ContractComments | ContractId |
| ContractsRegister | ContractAmendments | ContractId |
| ContractsRegister | ContractRenewals | OriginalContractId |
| ContractRenewals | RenewalStatusHistory | RenewalId |
| ContractRenewals | RenewalDocuments | RenewalId |
| AskRexSessions | AskRexMessages | SessionId |
| AskRexMessages | AskRexMessageFiles | MessageId |
| AskRexMessages | AskRexFeedback | MessageId |
| ReportDefinitions | ReportExecutionLog | ReportId |
| ReportDefinitions | ScheduledReports | ReportId |

### Self-Referencing Relationships

| Table | Self-Reference | Purpose |
|-------|----------------|---------|
| ContractsRegister | OriginalContractId | Links renewals to original |
| ContractRenewals | PreviousRenewalId | Chains multiple renewals |
| Departments | ParentDepartmentId | Department hierarchy |

---

## Legend

```
PK = Primary Key
FK = Foreign Key
--> = References (Foreign Key relationship)
1:N = One-to-Many relationship
```
