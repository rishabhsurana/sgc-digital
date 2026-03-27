-- =============================================
-- SGC Digital Portal
-- Email Notification Templates & Types
-- Script: 018-email-notification-templates.sql
-- =============================================
-- This script creates lookup tables for all email
-- notification types required by the system
-- =============================================

-- =============================================
-- Lookup: Email Notification Categories
-- =============================================

CREATE TABLE dbo.LookupEmailCategories (
    CategoryCode NVARCHAR(50) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO dbo.LookupEmailCategories (CategoryCode, CategoryName, Description, SortOrder) VALUES
('REGISTRATION', 'Registration & Account', 'User registration, verification, and account management', 1),
('CONTRACT', 'Contract Submissions', 'Contract submission lifecycle notifications', 2),
('CORRESPONDENCE', 'Correspondence Submissions', 'Correspondence submission lifecycle notifications', 3),
('WORKFLOW', 'Workflow & Approvals', 'Workflow stage changes and approvals', 4),
('CORRECTIONS', 'Corrections & Clarifications', 'Requests for corrections and responses', 5),
('SLA', 'SLA & Deadlines', 'SLA warnings and deadline notifications', 6),
('SYSTEM', 'System Notifications', 'System alerts and administrative notifications', 7);

-- =============================================
-- Lookup: Email Notification Types (Master List)
-- =============================================

CREATE TABLE dbo.LookupEmailNotificationTypes (
    NotificationTypeId INT IDENTITY(1,1) PRIMARY KEY,
    NotificationCode NVARCHAR(100) NOT NULL UNIQUE,
    CategoryCode NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.LookupEmailCategories(CategoryCode),
    NotificationName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    
    -- Recipients
    RecipientType NVARCHAR(50) NOT NULL, -- 'APPLICANT', 'REVIEWER', 'APPROVER', 'ADMIN', 'ENTITY'
    
    -- Template
    DefaultSubject NVARCHAR(500) NOT NULL,
    DefaultBodyTemplate NVARCHAR(MAX) NOT NULL,
    
    -- Variables available for this template
    AvailableVariables NVARCHAR(MAX) NULL, -- JSON array of variable names
    
    -- Settings
    Priority INT NOT NULL DEFAULT 5, -- 1=Urgent, 5=Normal, 10=Low
    IsMandatory BIT NOT NULL DEFAULT 1, -- Cannot be disabled by user
    AllowUserOptOut BIT NOT NULL DEFAULT 0, -- User can unsubscribe
    
    -- Timing
    SendImmediately BIT NOT NULL DEFAULT 1,
    DelayMinutes INT NULL, -- If not immediate, delay in minutes
    
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- REGISTRATION & ACCOUNT NOTIFICATIONS
-- =============================================

INSERT INTO dbo.LookupEmailNotificationTypes 
(NotificationCode, CategoryCode, NotificationName, Description, RecipientType, DefaultSubject, DefaultBodyTemplate, AvailableVariables, Priority, IsMandatory) 
VALUES

-- Registration
('REG_SUCCESS', 'REGISTRATION', 'Registration Successful', 
 'Sent when a user successfully registers on the portal',
 'APPLICANT',
 'Welcome to SGC Digital - Registration Successful',
 '<h2>Welcome to SGC Digital Portal</h2>
<p>Dear {{firstName}} {{lastName}},</p>
<p>Your registration on the SGC Digital Portal has been successful.</p>
<p><strong>Account Details:</strong></p>
<ul>
  <li>Email: {{email}}</li>
  <li>Entity Type: {{entityTypeName}}</li>
  <li>Registration Date: {{registrationDate}}</li>
</ul>
<p>You can now log in to submit contracts and correspondence to the Solicitor General''s Chambers.</p>
<p><a href="{{loginUrl}}">Click here to log in</a></p>
<p>Thank you,<br>SGC Digital Portal</p>',
 '["firstName", "lastName", "email", "entityTypeName", "registrationDate", "loginUrl"]',
 1, 1),

('REG_VERIFY_EMAIL', 'REGISTRATION', 'Email Verification Required',
 'Sent when email verification is required',
 'APPLICANT',
 'SGC Digital - Please Verify Your Email Address',
 '<h2>Email Verification Required</h2>
<p>Dear {{firstName}},</p>
<p>Please verify your email address to complete your registration.</p>
<p><a href="{{verificationUrl}}">Click here to verify your email</a></p>
<p>This link will expire in {{expiryHours}} hours.</p>
<p>If you did not create this account, please ignore this email.</p>',
 '["firstName", "verificationUrl", "expiryHours"]',
 1, 1),

('REG_PASSWORD_RESET', 'REGISTRATION', 'Password Reset Request',
 'Sent when user requests a password reset',
 'APPLICANT',
 'SGC Digital - Password Reset Request',
 '<h2>Password Reset Request</h2>
<p>Dear {{firstName}},</p>
<p>We received a request to reset your password.</p>
<p><a href="{{resetUrl}}">Click here to reset your password</a></p>
<p>This link will expire in {{expiryMinutes}} minutes.</p>
<p>If you did not request this, please ignore this email or contact support.</p>',
 '["firstName", "resetUrl", "expiryMinutes"]',
 1, 1),

('REG_PASSWORD_CHANGED', 'REGISTRATION', 'Password Changed Successfully',
 'Sent when user password has been changed',
 'APPLICANT',
 'SGC Digital - Your Password Has Been Changed',
 '<h2>Password Changed</h2>
<p>Dear {{firstName}},</p>
<p>Your password was successfully changed on {{changeDate}}.</p>
<p>If you did not make this change, please contact support immediately.</p>',
 '["firstName", "changeDate"]',
 1, 1),

-- =============================================
-- CONTRACT SUBMISSION NOTIFICATIONS
-- =============================================

('CONTRACT_SUBMITTED', 'CONTRACT', 'Contract Submitted Successfully',
 'Sent when applicant submits a new contract',
 'APPLICANT',
 'SGC Digital - Contract Submitted: {{transactionNumber}}',
 '<h2>Contract Submitted Successfully</h2>
<p>Dear {{firstName}},</p>
<p>Your contract has been submitted successfully.</p>
<p><strong>Submission Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Contract Title: {{contractTitle}}</li>
  <li>Nature: {{contractNature}}</li>
  <li>Category: {{contractCategory}}</li>
  <li>Submission Date: {{submissionDate}}</li>
</ul>
<p>Your submission is now in the review queue. You will be notified of any updates.</p>
<p><a href="{{trackingUrl}}">Track your submission</a></p>',
 '["firstName", "transactionNumber", "contractTitle", "contractNature", "contractCategory", "submissionDate", "trackingUrl"]',
 2, 1),

('CONTRACT_RECEIVED_SGC', 'CONTRACT', 'New Contract Received (SGC)',
 'Sent to SGC staff when a new contract is received',
 'REVIEWER',
 'New Contract Received: {{transactionNumber}}',
 '<h2>New Contract Submission</h2>
<p>A new contract has been submitted for review.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Contract Title: {{contractTitle}}</li>
  <li>Submitting Entity: {{entityName}}</li>
  <li>Ministry/Department: {{departmentName}}</li>
  <li>Nature: {{contractNature}}</li>
  <li>Contract Value: {{contractValue}}</li>
</ul>
<p><a href="{{reviewUrl}}">Review this contract</a></p>',
 '["transactionNumber", "contractTitle", "entityName", "departmentName", "contractNature", "contractValue", "reviewUrl"]',
 3, 1),

('CONTRACT_ASSIGNED', 'CONTRACT', 'Contract Assigned to You',
 'Sent when contract is assigned to a reviewer',
 'REVIEWER',
 'Contract Assigned: {{transactionNumber}}',
 '<h2>Contract Assigned to You</h2>
<p>Dear {{reviewerName}},</p>
<p>A contract has been assigned to you for review.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Contract Title: {{contractTitle}}</li>
  <li>Due Date: {{dueDate}}</li>
</ul>
<p><a href="{{reviewUrl}}">Start review</a></p>',
 '["reviewerName", "transactionNumber", "contractTitle", "dueDate", "reviewUrl"]',
 2, 1),

('CONTRACT_APPROVED', 'CONTRACT', 'Contract Approved',
 'Sent when contract receives final approval',
 'APPLICANT',
 'SGC Digital - Contract Approved: {{transactionNumber}}',
 '<h2>Contract Approved</h2>
<p>Dear {{firstName}},</p>
<p>We are pleased to inform you that your contract has been approved.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Contract Title: {{contractTitle}}</li>
  <li>Approval Date: {{approvalDate}}</li>
  <li>Approved By: {{approverName}}</li>
</ul>
<p>The approved contract documents are now available for download.</p>
<p><a href="{{downloadUrl}}">Download approved documents</a></p>',
 '["firstName", "transactionNumber", "contractTitle", "approvalDate", "approverName", "downloadUrl"]',
 1, 1),

('CONTRACT_REJECTED', 'CONTRACT', 'Contract Rejected',
 'Sent when contract is rejected',
 'APPLICANT',
 'SGC Digital - Contract Not Approved: {{transactionNumber}}',
 '<h2>Contract Not Approved</h2>
<p>Dear {{firstName}},</p>
<p>We regret to inform you that your contract submission has not been approved.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Contract Title: {{contractTitle}}</li>
  <li>Decision Date: {{decisionDate}}</li>
</ul>
<p><strong>Reason:</strong></p>
<p>{{rejectionReason}}</p>
<p>If you have questions, please contact the Solicitor General''s Chambers.</p>',
 '["firstName", "transactionNumber", "contractTitle", "decisionDate", "rejectionReason"]',
 1, 1),

-- =============================================
-- CORRESPONDENCE NOTIFICATIONS
-- =============================================

('CORR_SUBMITTED', 'CORRESPONDENCE', 'Correspondence Submitted',
 'Sent when applicant submits correspondence',
 'APPLICANT',
 'SGC Digital - Correspondence Submitted: {{transactionNumber}}',
 '<h2>Correspondence Submitted</h2>
<p>Dear {{firstName}},</p>
<p>Your correspondence has been submitted successfully.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Subject: {{subject}}</li>
  <li>Type: {{correspondenceType}}</li>
  <li>Submission Date: {{submissionDate}}</li>
</ul>
<p><a href="{{trackingUrl}}">Track your submission</a></p>',
 '["firstName", "transactionNumber", "subject", "correspondenceType", "submissionDate", "trackingUrl"]',
 2, 1),

('CORR_RECEIVED_SGC', 'CORRESPONDENCE', 'New Correspondence Received (SGC)',
 'Sent to SGC staff when correspondence is received',
 'REVIEWER',
 'New Correspondence: {{transactionNumber}}',
 '<h2>New Correspondence Received</h2>
<p>New correspondence has been submitted.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Subject: {{subject}}</li>
  <li>From: {{entityName}}</li>
  <li>Type: {{correspondenceType}}</li>
  <li>Priority: {{priority}}</li>
</ul>
<p><a href="{{reviewUrl}}">View correspondence</a></p>',
 '["transactionNumber", "subject", "entityName", "correspondenceType", "priority", "reviewUrl"]',
 3, 1),

('CORR_RESPONSE_READY', 'CORRESPONDENCE', 'Correspondence Response Ready',
 'Sent when SGC has responded to correspondence',
 'APPLICANT',
 'SGC Digital - Response Ready: {{transactionNumber}}',
 '<h2>Response to Your Correspondence</h2>
<p>Dear {{firstName}},</p>
<p>A response to your correspondence is now available.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Subject: {{subject}}</li>
  <li>Response Date: {{responseDate}}</li>
</ul>
<p><a href="{{downloadUrl}}">View and download the response</a></p>',
 '["firstName", "transactionNumber", "subject", "responseDate", "downloadUrl"]',
 1, 1),

('CORR_COMPLETED', 'CORRESPONDENCE', 'Correspondence Completed',
 'Sent when correspondence is marked as completed',
 'APPLICANT',
 'SGC Digital - Correspondence Completed: {{transactionNumber}}',
 '<h2>Correspondence Completed</h2>
<p>Dear {{firstName}},</p>
<p>Your correspondence has been completed.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Subject: {{subject}}</li>
  <li>Completion Date: {{completionDate}}</li>
</ul>
<p>All documents are available in your dashboard.</p>',
 '["firstName", "transactionNumber", "subject", "completionDate"]',
 3, 1),

-- =============================================
-- WORKFLOW & APPROVAL NOTIFICATIONS
-- =============================================

('WF_STAGE_CHANGED', 'WORKFLOW', 'Workflow Stage Changed',
 'Sent when submission moves to a new workflow stage',
 'APPLICANT',
 'SGC Digital - Status Update: {{transactionNumber}}',
 '<h2>Status Update</h2>
<p>Dear {{firstName}},</p>
<p>Your submission has moved to a new stage.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Previous Stage: {{previousStage}}</li>
  <li>Current Stage: {{currentStage}}</li>
  <li>Updated: {{updateDate}}</li>
</ul>
<p><a href="{{trackingUrl}}">View full status</a></p>',
 '["firstName", "transactionNumber", "title", "previousStage", "currentStage", "updateDate", "trackingUrl"]',
 4, 0),

('WF_PENDING_APPROVAL', 'WORKFLOW', 'Approval Required',
 'Sent to approvers when approval is needed',
 'APPROVER',
 'Approval Required: {{transactionNumber}}',
 '<h2>Approval Required</h2>
<p>Dear {{approverName}},</p>
<p>A submission requires your approval.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Submitted By: {{submittedBy}}</li>
  <li>Stage: {{currentStage}}</li>
</ul>
<p><a href="{{approvalUrl}}">Review and approve</a></p>',
 '["approverName", "transactionNumber", "title", "submittedBy", "currentStage", "approvalUrl"]',
 2, 1),

-- =============================================
-- CORRECTION & CLARIFICATION NOTIFICATIONS
-- =============================================

('CORR_REQ_CLARIFICATION', 'CORRECTIONS', 'Clarification Required',
 'Sent when SGC requests clarification from applicant',
 'APPLICANT',
 'SGC Digital - Clarification Required: {{transactionNumber}}',
 '<h2>Clarification Required</h2>
<p>Dear {{firstName}},</p>
<p>The Solicitor General''s Chambers requires clarification on your submission.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Requested By: {{requestedBy}}</li>
  <li>Due Date: {{dueDate}}</li>
</ul>
<p><strong>Issues to Address:</strong></p>
{{issuesList}}
<p><a href="{{responseUrl}}">Respond to this request</a></p>',
 '["firstName", "transactionNumber", "title", "requestedBy", "dueDate", "issuesList", "responseUrl"]',
 1, 1),

('CORR_CLARIFICATION_RECEIVED', 'CORRECTIONS', 'Clarification Response Received',
 'Sent to SGC when applicant responds to clarification request',
 'REVIEWER',
 'Clarification Received: {{transactionNumber}}',
 '<h2>Clarification Response Received</h2>
<p>The applicant has responded to the clarification request.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Response Date: {{responseDate}}</li>
</ul>
<p><a href="{{reviewUrl}}">Review response</a></p>',
 '["transactionNumber", "title", "responseDate", "reviewUrl"]',
 2, 1),

('CORR_CORRECTION_REQ', 'CORRECTIONS', 'Corrections Required',
 'Sent when corrections are required on a submission',
 'APPLICANT',
 'SGC Digital - Corrections Required: {{transactionNumber}}',
 '<h2>Corrections Required</h2>
<p>Dear {{firstName}},</p>
<p>Your submission requires corrections before it can proceed.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Review Stage: {{reviewStage}}</li>
  <li>Due Date: {{dueDate}}</li>
</ul>
<p><strong>Required Corrections:</strong></p>
{{correctionsList}}
<p><a href="{{correctionUrl}}">Submit corrections</a></p>',
 '["firstName", "transactionNumber", "title", "reviewStage", "dueDate", "correctionsList", "correctionUrl"]',
 1, 1),

('CORR_CORRECTION_SUBMITTED', 'CORRECTIONS', 'Corrections Submitted',
 'Sent when applicant submits corrections',
 'REVIEWER',
 'Corrections Submitted: {{transactionNumber}}',
 '<h2>Corrections Submitted</h2>
<p>The applicant has submitted corrections.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Fields Changed: {{fieldsChanged}}</li>
  <li>Documents Added: {{documentsAdded}}</li>
</ul>
<p><a href="{{reviewUrl}}">Review corrections</a></p>',
 '["transactionNumber", "title", "fieldsChanged", "documentsAdded", "reviewUrl"]',
 2, 1),

-- =============================================
-- SLA & DEADLINE NOTIFICATIONS
-- =============================================

('SLA_WARNING_REVIEWER', 'SLA', 'SLA Warning - Action Required',
 'Sent to reviewer when SLA deadline is approaching',
 'REVIEWER',
 'SLA Warning: {{transactionNumber}} - {{hoursRemaining}} hours remaining',
 '<h2>SLA Warning</h2>
<p>Dear {{reviewerName}},</p>
<p>The following submission is approaching its SLA deadline.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Current Stage: {{currentStage}}</li>
  <li>SLA Deadline: {{slaDeadline}}</li>
  <li>Time Remaining: {{hoursRemaining}} hours</li>
</ul>
<p><a href="{{actionUrl}}">Take action now</a></p>',
 '["reviewerName", "transactionNumber", "title", "currentStage", "slaDeadline", "hoursRemaining", "actionUrl"]',
 1, 1),

('SLA_BREACH', 'SLA', 'SLA Breach Notification',
 'Sent when SLA has been breached',
 'ADMIN',
 'SLA BREACH: {{transactionNumber}}',
 '<h2>SLA Breach Alert</h2>
<p>An SLA breach has occurred.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Title: {{title}}</li>
  <li>Stage: {{currentStage}}</li>
  <li>Assigned To: {{assignedTo}}</li>
  <li>SLA Deadline: {{slaDeadline}}</li>
  <li>Time Overdue: {{hoursOverdue}} hours</li>
</ul>',
 '["transactionNumber", "title", "currentStage", "assignedTo", "slaDeadline", "hoursOverdue"]',
 1, 1),

('SLA_WARNING_APPLICANT', 'SLA', 'Response Deadline Approaching',
 'Sent to applicant when their response deadline is approaching',
 'APPLICANT',
 'SGC Digital - Response Deadline Approaching: {{transactionNumber}}',
 '<h2>Response Deadline Approaching</h2>
<p>Dear {{firstName}},</p>
<p>Your response to the clarification request is due soon.</p>
<p><strong>Details:</strong></p>
<ul>
  <li>Transaction Number: {{transactionNumber}}</li>
  <li>Deadline: {{deadline}}</li>
  <li>Time Remaining: {{hoursRemaining}} hours</li>
</ul>
<p><a href="{{responseUrl}}">Submit your response</a></p>',
 '["firstName", "transactionNumber", "deadline", "hoursRemaining", "responseUrl"]',
 1, 1),

-- =============================================
-- SYSTEM NOTIFICATIONS
-- =============================================

('SYS_MAINTENANCE', 'SYSTEM', 'Scheduled Maintenance',
 'Sent before scheduled system maintenance',
 'APPLICANT',
 'SGC Digital - Scheduled Maintenance Notice',
 '<h2>Scheduled Maintenance</h2>
<p>Dear User,</p>
<p>Please be advised that the SGC Digital Portal will undergo scheduled maintenance.</p>
<p><strong>Maintenance Window:</strong></p>
<ul>
  <li>Start: {{startTime}}</li>
  <li>End: {{endTime}}</li>
</ul>
<p>During this time, the portal may be unavailable. We apologize for any inconvenience.</p>',
 '["startTime", "endTime"]',
 3, 0),

('SYS_ACCOUNT_LOCKED', 'SYSTEM', 'Account Locked',
 'Sent when account is locked due to failed login attempts',
 'APPLICANT',
 'SGC Digital - Account Security Alert',
 '<h2>Account Locked</h2>
<p>Dear {{firstName}},</p>
<p>Your account has been temporarily locked due to multiple failed login attempts.</p>
<p>The account will be automatically unlocked after {{lockoutMinutes}} minutes.</p>
<p>If you did not attempt to log in, please contact support immediately.</p>',
 '["firstName", "lockoutMinutes"]',
 1, 1);

-- =============================================
-- User Email Preferences Table
-- =============================================

CREATE TABLE dbo.UserEmailPreferences (
    PreferenceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId),
    NotificationTypeId INT NOT NULL FOREIGN KEY REFERENCES dbo.LookupEmailNotificationTypes(NotificationTypeId),
    IsEnabled BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_UserEmailPref UNIQUE (UserId, NotificationTypeId)
);

-- =============================================
-- Email Send Log (for tracking sent emails)
-- =============================================

CREATE TABLE dbo.EmailSendLog (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmailQueueId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES dbo.EmailQueue(EmailId),
    NotificationTypeId INT NULL FOREIGN KEY REFERENCES dbo.LookupEmailNotificationTypes(NotificationTypeId),
    
    -- Recipient
    ToEmail NVARCHAR(255) NOT NULL,
    UserId UNIQUEIDENTIFIER NULL,
    
    -- Reference
    EntityType NVARCHAR(50) NULL, -- 'CONTRACT', 'CORRESPONDENCE'
    EntityId UNIQUEIDENTIFIER NULL,
    TransactionNumber NVARCHAR(50) NULL,
    
    -- Result
    Status NVARCHAR(50) NOT NULL, -- 'sent', 'failed', 'bounced', 'opened', 'clicked'
    SentAt DATETIME2 NULL,
    OpenedAt DATETIME2 NULL,
    ClickedAt DATETIME2 NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    
    -- Metadata
    EmailServiceId NVARCHAR(255) NULL, -- ID from email service (Resend, SendGrid, etc.)
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Views
-- =============================================

GO

-- View: All active email notification types with category
CREATE OR ALTER VIEW dbo.vw_EmailNotificationTypes AS
SELECT 
    ent.NotificationTypeId,
    ent.NotificationCode,
    ent.CategoryCode,
    ec.CategoryName,
    ent.NotificationName,
    ent.Description,
    ent.RecipientType,
    ent.DefaultSubject,
    ent.Priority,
    ent.IsMandatory,
    ent.AllowUserOptOut,
    ent.SendImmediately,
    ent.DelayMinutes,
    ent.IsActive
FROM dbo.LookupEmailNotificationTypes ent
JOIN dbo.LookupEmailCategories ec ON ent.CategoryCode = ec.CategoryCode
WHERE ent.IsActive = 1 AND ec.IsActive = 1;

GO

-- View: Email notification summary by category
CREATE OR ALTER VIEW dbo.vw_EmailNotificationSummary AS
SELECT 
    ec.CategoryCode,
    ec.CategoryName,
    COUNT(*) as TotalNotifications,
    SUM(CASE WHEN ent.IsMandatory = 1 THEN 1 ELSE 0 END) as MandatoryCount,
    SUM(CASE WHEN ent.AllowUserOptOut = 1 THEN 1 ELSE 0 END) as OptionalCount
FROM dbo.LookupEmailCategories ec
LEFT JOIN dbo.LookupEmailNotificationTypes ent ON ec.CategoryCode = ent.CategoryCode AND ent.IsActive = 1
WHERE ec.IsActive = 1
GROUP BY ec.CategoryCode, ec.CategoryName;

GO

-- =============================================
-- Stored Procedure: Queue Email Notification
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_QueueEmailNotification
    @NotificationCode NVARCHAR(100),
    @ToEmail NVARCHAR(255),
    @ToName NVARCHAR(200) = NULL,
    @TemplateData NVARCHAR(MAX), -- JSON with template variables
    @EntityType NVARCHAR(50) = NULL,
    @EntityId UNIQUEIDENTIFIER = NULL,
    @TransactionNumber NVARCHAR(50) = NULL,
    @ScheduledFor DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NotificationTypeId INT;
    DECLARE @Subject NVARCHAR(500);
    DECLARE @BodyTemplate NVARCHAR(MAX);
    DECLARE @Priority INT;
    DECLARE @SendImmediately BIT;
    DECLARE @DelayMinutes INT;
    DECLARE @EmailId UNIQUEIDENTIFIER = NEWID();
    
    -- Get notification type details
    SELECT 
        @NotificationTypeId = NotificationTypeId,
        @Subject = DefaultSubject,
        @BodyTemplate = DefaultBodyTemplate,
        @Priority = Priority,
        @SendImmediately = SendImmediately,
        @DelayMinutes = DelayMinutes
    FROM dbo.LookupEmailNotificationTypes
    WHERE NotificationCode = @NotificationCode AND IsActive = 1;
    
    IF @NotificationTypeId IS NULL
    BEGIN
        RAISERROR('Invalid notification code: %s', 16, 1, @NotificationCode);
        RETURN;
    END
    
    -- Calculate scheduled time if not immediate
    IF @ScheduledFor IS NULL AND @SendImmediately = 0 AND @DelayMinutes IS NOT NULL
    BEGIN
        SET @ScheduledFor = DATEADD(MINUTE, @DelayMinutes, GETUTCDATE());
    END
    
    -- Insert into email queue
    INSERT INTO dbo.EmailQueue (
        EmailId, ToEmail, ToName, Subject, BodyHtml, 
        TemplateName, TemplateData, Priority, ScheduledFor
    )
    VALUES (
        @EmailId, @ToEmail, @ToName, @Subject, @BodyTemplate,
        @NotificationCode, @TemplateData, @Priority, @ScheduledFor
    );
    
    -- Return the queued email ID
    SELECT @EmailId as EmailId, @NotificationCode as NotificationCode;
END;

GO

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IX_EmailNotificationTypes_Category ON dbo.LookupEmailNotificationTypes(CategoryCode);
CREATE INDEX IX_EmailNotificationTypes_Code ON dbo.LookupEmailNotificationTypes(NotificationCode);
CREATE INDEX IX_UserEmailPreferences_User ON dbo.UserEmailPreferences(UserId);
CREATE INDEX IX_EmailSendLog_Email ON dbo.EmailSendLog(ToEmail);
CREATE INDEX IX_EmailSendLog_Entity ON dbo.EmailSendLog(EntityType, EntityId);
CREATE INDEX IX_EmailSendLog_Transaction ON dbo.EmailSendLog(TransactionNumber);
CREATE INDEX IX_EmailSendLog_Status ON dbo.EmailSendLog(Status);

-- =============================================
-- Summary of Email Notification Types
-- =============================================
-- 
-- REGISTRATION (4 types):
--   REG_SUCCESS - Registration successful
--   REG_VERIFY_EMAIL - Email verification required
--   REG_PASSWORD_RESET - Password reset request
--   REG_PASSWORD_CHANGED - Password changed confirmation
--
-- CONTRACT (5 types):
--   CONTRACT_SUBMITTED - Contract submitted by applicant
--   CONTRACT_RECEIVED_SGC - New contract received (to SGC)
--   CONTRACT_ASSIGNED - Contract assigned to reviewer
--   CONTRACT_APPROVED - Contract approved
--   CONTRACT_REJECTED - Contract rejected
--
-- CORRESPONDENCE (4 types):
--   CORR_SUBMITTED - Correspondence submitted
--   CORR_RECEIVED_SGC - Correspondence received (to SGC)
--   CORR_RESPONSE_READY - Response ready for applicant
--   CORR_COMPLETED - Correspondence completed
--
-- WORKFLOW (2 types):
--   WF_STAGE_CHANGED - Workflow stage changed
--   WF_PENDING_APPROVAL - Approval required
--
-- CORRECTIONS (4 types):
--   CORR_REQ_CLARIFICATION - Clarification required
--   CORR_CLARIFICATION_RECEIVED - Clarification response received
--   CORR_CORRECTION_REQ - Corrections required
--   CORR_CORRECTION_SUBMITTED - Corrections submitted
--
-- SLA (3 types):
--   SLA_WARNING_REVIEWER - SLA warning for reviewer
--   SLA_BREACH - SLA breach notification
--   SLA_WARNING_APPLICANT - Response deadline approaching
--
-- SYSTEM (2 types):
--   SYS_MAINTENANCE - Scheduled maintenance
--   SYS_ACCOUNT_LOCKED - Account locked
--
-- TOTAL: 24 Email Notification Types
-- =============================================
