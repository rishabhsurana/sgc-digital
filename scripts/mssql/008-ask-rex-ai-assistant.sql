-- =============================================
-- SGC Digital - Ask Rex AI Assistant Schema
-- Script: 008-ask-rex-ai-assistant.sql
-- Description: Tables for AI assistant conversations, 
--              search history, generated reports, and analytics
-- =============================================

USE SGCDigital;
GO

-- =============================================
-- 1. AI CONVERSATION SESSIONS
-- =============================================

CREATE TABLE AskRexSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Anonymous sessions allowed for basic queries
    AnonymousSessionToken NVARCHAR(255) NULL,
    SessionStartedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SessionEndedAt DATETIME2 NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    -- Session context
    PortalContext NVARCHAR(50) NOT NULL DEFAULT 'public', -- 'public', 'management', 'dashboard'
    CurrentPage NVARCHAR(255) NULL,
    -- Session stats
    TotalMessages INT NOT NULL DEFAULT 0,
    TotalUserMessages INT NOT NULL DEFAULT 0,
    TotalAssistantMessages INT NOT NULL DEFAULT 0,
    -- Device info
    UserAgent NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSessions_UserId ON AskRexSessions(UserId);
CREATE INDEX IX_AskRexSessions_SessionStartedAt ON AskRexSessions(SessionStartedAt);
CREATE INDEX IX_AskRexSessions_IsActive ON AskRexSessions(IsActive);

-- =============================================
-- 2. CONVERSATION MESSAGES
-- =============================================

CREATE TABLE AskRexMessages (
    MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    -- Message details
    MessageRole NVARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    MessageContent NVARCHAR(MAX) NOT NULL,
    MessageType NVARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'file-result', 'report', 'search-result', 'error'
    -- For user messages - the detected intent
    DetectedIntent NVARCHAR(100) NULL, -- 'file_search', 'document_retrieval', 'report_generation', 'general_query'
    IntentConfidence DECIMAL(5,4) NULL, -- 0.0000 to 1.0000
    -- For assistant responses - metadata
    ResponseSourceType NVARCHAR(50) NULL, -- 'database', 'ai_generated', 'template', 'error'
    ProcessingTimeMs INT NULL,
    TokensUsed INT NULL,
    -- Voice interaction
    WasVoiceInput BIT NOT NULL DEFAULT 0,
    WasVoiceOutput BIT NOT NULL DEFAULT 0,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT CHK_AskRexMessages_Role CHECK (MessageRole IN ('user', 'assistant', 'system'))
);

CREATE INDEX IX_AskRexMessages_SessionId ON AskRexMessages(SessionId);
CREATE INDEX IX_AskRexMessages_CreatedAt ON AskRexMessages(CreatedAt);
CREATE INDEX IX_AskRexMessages_DetectedIntent ON AskRexMessages(DetectedIntent);

-- =============================================
-- 3. MESSAGE FILE ATTACHMENTS/RESULTS
-- =============================================

CREATE TABLE AskRexMessageFiles (
    MessageFileId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    -- File reference
    FileName NVARCHAR(255) NOT NULL,
    FileReference NVARCHAR(100) NOT NULL, -- Reference number
    FileType NVARCHAR(50) NOT NULL, -- 'Contract', 'Correspondence', 'Policy', 'Report', etc.
    -- Source reference
    SourceTable NVARCHAR(100) NULL, -- 'CorrespondenceRegister', 'ContractsRegister', etc.
    SourceId UNIQUEIDENTIFIER NULL,
    -- Display order
    DisplayOrder INT NOT NULL DEFAULT 0,
    -- Was this file accessed/clicked by user
    WasAccessed BIT NOT NULL DEFAULT 0,
    AccessedAt DATETIME2 NULL,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexMessageFiles_MessageId ON AskRexMessageFiles(MessageId);
CREATE INDEX IX_AskRexMessageFiles_SourceId ON AskRexMessageFiles(SourceId);

-- =============================================
-- 4. SEARCH QUERIES LOG
-- =============================================

CREATE TABLE AskRexSearchQueries (
    QueryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Query details
    RawQuery NVARCHAR(MAX) NOT NULL,
    NormalizedQuery NVARCHAR(MAX) NULL,
    QueryType NVARCHAR(50) NOT NULL, -- 'file_search', 'document_search', 'full_text', 'reference_lookup'
    -- Search parameters extracted
    SearchedFileNumber NVARCHAR(100) NULL,
    SearchedSubject NVARCHAR(500) NULL,
    SearchedDateFrom DATE NULL,
    SearchedDateTo DATE NULL,
    SearchedEntityId UNIQUEIDENTIFIER NULL,
    SearchedDepartmentId INT NULL,
    SearchedStatus NVARCHAR(50) NULL,
    -- Results
    TotalResultsFound INT NOT NULL DEFAULT 0,
    ResultsReturned INT NOT NULL DEFAULT 0,
    SearchDurationMs INT NULL,
    -- User feedback
    WasHelpful BIT NULL,
    UserFeedback NVARCHAR(500) NULL,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSearchQueries_SessionId ON AskRexSearchQueries(SessionId);
CREATE INDEX IX_AskRexSearchQueries_UserId ON AskRexSearchQueries(UserId);
CREATE INDEX IX_AskRexSearchQueries_QueryType ON AskRexSearchQueries(QueryType);
CREATE INDEX IX_AskRexSearchQueries_CreatedAt ON AskRexSearchQueries(CreatedAt);

-- =============================================
-- 5. GENERATED REPORTS LOG
-- =============================================

CREATE TABLE AskRexGeneratedReports (
    GeneratedReportId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Report details
    ReportType NVARCHAR(100) NOT NULL, -- 'correspondence_summary', 'contract_status', 'department_activity', etc.
    ReportTitle NVARCHAR(255) NOT NULL,
    ReportSubject NVARCHAR(500) NULL, -- What the report is about
    -- Report parameters used
    ReportParameters NVARCHAR(MAX) NULL, -- JSON of parameters
    DateRangeFrom DATE NULL,
    DateRangeTo DATE NULL,
    DepartmentId INT NULL,
    EntityId UNIQUEIDENTIFIER NULL,
    -- Generated content
    ReportSummary NVARCHAR(MAX) NULL, -- The summary shown in chat
    ReportDataJson NVARCHAR(MAX) NULL, -- Full data in JSON format
    -- Export
    WasExported BIT NOT NULL DEFAULT 0,
    ExportFormat NVARCHAR(20) NULL, -- 'PDF', 'EXCEL', 'CSV'
    ExportedAt DATETIME2 NULL,
    ExportedFilePath NVARCHAR(500) NULL,
    -- Stats from report
    TotalItemsAnalyzed INT NULL,
    ActiveItems INT NULL,
    PendingItems INT NULL,
    CompletedItems INT NULL,
    AverageProcessingDays DECIMAL(10,2) NULL,
    -- Generation stats
    GenerationTimeMs INT NULL,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexGeneratedReports_SessionId ON AskRexGeneratedReports(SessionId);
CREATE INDEX IX_AskRexGeneratedReports_UserId ON AskRexGeneratedReports(UserId);
CREATE INDEX IX_AskRexGeneratedReports_ReportType ON AskRexGeneratedReports(ReportType);
CREATE INDEX IX_AskRexGeneratedReports_CreatedAt ON AskRexGeneratedReports(CreatedAt);

-- =============================================
-- 6. USER FEEDBACK ON RESPONSES
-- =============================================

CREATE TABLE AskRexFeedback (
    FeedbackId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Feedback
    Rating INT NULL, -- 1-5 stars
    WasHelpful BIT NULL,
    FeedbackType NVARCHAR(50) NULL, -- 'thumbs_up', 'thumbs_down', 'rating', 'comment'
    FeedbackComment NVARCHAR(1000) NULL,
    -- Issue reporting
    ReportedIssue NVARCHAR(100) NULL, -- 'incorrect_info', 'not_helpful', 'too_slow', 'wrong_files', etc.
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexFeedback_MessageId ON AskRexFeedback(MessageId);
CREATE INDEX IX_AskRexFeedback_SessionId ON AskRexFeedback(SessionId);
CREATE INDEX IX_AskRexFeedback_Rating ON AskRexFeedback(Rating);

-- =============================================
-- 7. COMMON QUERIES / SAVED PROMPTS
-- =============================================

CREATE TABLE AskRexSavedPrompts (
    PromptId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId), -- NULL = system-wide suggested prompt
    -- Prompt details
    PromptLabel NVARCHAR(100) NOT NULL,
    PromptText NVARCHAR(500) NOT NULL,
    PromptCategory NVARCHAR(50) NOT NULL, -- 'file_search', 'document', 'report', 'general'
    PromptIcon NVARCHAR(50) NULL, -- Icon name for UI
    -- Usage
    UsageCount INT NOT NULL DEFAULT 0,
    LastUsedAt DATETIME2 NULL,
    -- Display
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsSystemPrompt BIT NOT NULL DEFAULT 0, -- System-provided vs user-created
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSavedPrompts_UserId ON AskRexSavedPrompts(UserId);
CREATE INDEX IX_AskRexSavedPrompts_IsSystemPrompt ON AskRexSavedPrompts(IsSystemPrompt);

-- Insert default system prompts
INSERT INTO AskRexSavedPrompts (PromptId, UserId, PromptLabel, PromptText, PromptCategory, PromptIcon, DisplayOrder, IsSystemPrompt)
VALUES
    (NEWID(), NULL, 'Find a file', 'Find me file with FileNumber ', 'file_search', 'Search', 1, 1),
    (NEWID(), NULL, 'Retrieve documents', 'Retrieve all documents on ', 'document', 'FileText', 2, 1),
    (NEWID(), NULL, 'Generate report', 'Generate a report on ', 'report', 'FileBarChart', 3, 1),
    (NEWID(), NULL, 'Pending items', 'Show me all pending items assigned to me', 'general', 'Clock', 4, 1),
    (NEWID(), NULL, 'Overdue items', 'List all overdue correspondence and contracts', 'general', 'AlertTriangle', 5, 1),
    (NEWID(), NULL, 'Department summary', 'Give me a summary of my department activities this month', 'report', 'Building', 6, 1),
    (NEWID(), NULL, 'Contract expiring', 'Show contracts expiring in the next 30 days', 'file_search', 'Calendar', 7, 1),
    (NEWID(), NULL, 'Recent submissions', 'Show the most recent correspondence submissions', 'file_search', 'Inbox', 8, 1);

-- =============================================
-- 8. AI ASSISTANT ANALYTICS
-- =============================================

CREATE TABLE AskRexDailyAnalytics (
    AnalyticsId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AnalyticsDate DATE NOT NULL UNIQUE,
    -- Session metrics
    TotalSessions INT NOT NULL DEFAULT 0,
    UniquUsers INT NOT NULL DEFAULT 0,
    AnonymousSessions INT NOT NULL DEFAULT 0,
    AvgSessionDurationSeconds INT NULL,
    -- Message metrics
    TotalMessages INT NOT NULL DEFAULT 0,
    TotalUserMessages INT NOT NULL DEFAULT 0,
    TotalAssistantMessages INT NOT NULL DEFAULT 0,
    AvgMessagesPerSession DECIMAL(10,2) NULL,
    -- Intent breakdown
    FileSearchQueries INT NOT NULL DEFAULT 0,
    DocumentRetrievalQueries INT NOT NULL DEFAULT 0,
    ReportGenerationQueries INT NOT NULL DEFAULT 0,
    GeneralQueries INT NOT NULL DEFAULT 0,
    -- Voice usage
    VoiceInputCount INT NOT NULL DEFAULT 0,
    VoiceOutputCount INT NOT NULL DEFAULT 0,
    -- Performance
    AvgResponseTimeMs INT NULL,
    TotalTokensUsed INT NOT NULL DEFAULT 0,
    -- Feedback
    TotalFeedbackReceived INT NOT NULL DEFAULT 0,
    PositiveFeedbackCount INT NOT NULL DEFAULT 0,
    NegativeFeedbackCount INT NOT NULL DEFAULT 0,
    AvgRating DECIMAL(3,2) NULL,
    -- Search success
    SuccessfulSearches INT NOT NULL DEFAULT 0,
    FailedSearches INT NOT NULL DEFAULT 0,
    -- Reports
    ReportsGenerated INT NOT NULL DEFAULT 0,
    ReportsExported INT NOT NULL DEFAULT 0,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexDailyAnalytics_AnalyticsDate ON AskRexDailyAnalytics(AnalyticsDate);

-- =============================================
-- 9. AI KNOWLEDGE BASE ENTRIES
-- =============================================
-- For custom knowledge that Rex can reference

CREATE TABLE AskRexKnowledgeBase (
    KnowledgeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    -- Content
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Keywords NVARCHAR(500) NULL, -- Comma-separated keywords for matching
    Category NVARCHAR(100) NOT NULL, -- 'faq', 'policy', 'procedure', 'terminology', 'contact'
    -- Matching
    TriggerPhrases NVARCHAR(MAX) NULL, -- Phrases that trigger this knowledge
    -- Source
    SourceDocument NVARCHAR(255) NULL,
    SourceUrl NVARCHAR(500) NULL,
    -- Management
    IsActive BIT NOT NULL DEFAULT 1,
    Priority INT NOT NULL DEFAULT 0, -- Higher = more likely to be used
    UsageCount INT NOT NULL DEFAULT 0,
    LastUsedAt DATETIME2 NULL,
    -- Audit
    CreatedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    UpdatedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexKnowledgeBase_Category ON AskRexKnowledgeBase(Category);
CREATE INDEX IX_AskRexKnowledgeBase_IsActive ON AskRexKnowledgeBase(IsActive);

-- Insert some default knowledge entries
INSERT INTO AskRexKnowledgeBase (KnowledgeId, Title, Content, Keywords, Category, TriggerPhrases, Priority)
VALUES
    (NEWID(), 'What is SGC Digital?', 'SGC Digital is the Correspondence and Contract Management Portal for the Solicitor General''s Chambers of Barbados. It provides digital services for managing legal correspondence, contracts, and related documents.', 'sgc,digital,about,what is', 'faq', 'what is sgc,about sgc,tell me about,what does sgc do', 100),
    (NEWID(), 'How to submit correspondence', 'To submit correspondence, navigate to the Correspondence section and click "New Submission". Fill in the required details including the type of correspondence, subject, and any relevant documents.', 'submit,correspondence,how to,new', 'procedure', 'how do i submit,submit correspondence,new correspondence,create correspondence', 90),
    (NEWID(), 'Contract submission process', 'To submit a contract for review, go to the Contracts section and select "New Contract Request". Provide contract details, counterparty information, and upload the draft contract document.', 'contract,submit,process,new', 'procedure', 'submit contract,new contract,how to submit contract,contract request', 90),
    (NEWID(), 'Contact Information', 'For assistance, contact the Solicitor General''s Chambers at: Phone: (246) 535-3510/535-3517, Email: sgc@barbados.gov.bb, Address: Marine House, Hastings, Christ Church', 'contact,phone,email,address,help', 'contact', 'contact,phone number,email address,how to reach,support', 80);

-- =============================================
-- 10. VIEWS FOR ASK REX ANALYTICS
-- =============================================

-- Popular queries view
CREATE VIEW vw_AskRexPopularQueries AS
SELECT 
    QueryType,
    NormalizedQuery,
    COUNT(*) AS QueryCount,
    AVG(TotalResultsFound) AS AvgResultsFound,
    AVG(SearchDurationMs) AS AvgSearchTime,
    SUM(CASE WHEN WasHelpful = 1 THEN 1 ELSE 0 END) AS HelpfulCount,
    SUM(CASE WHEN WasHelpful = 0 THEN 1 ELSE 0 END) AS NotHelpfulCount
FROM AskRexSearchQueries
WHERE CreatedAt >= DATEADD(DAY, -30, GETUTCDATE())
GROUP BY QueryType, NormalizedQuery
HAVING COUNT(*) >= 3;
GO

-- User engagement summary view
CREATE VIEW vw_AskRexUserEngagement AS
SELECT 
    u.UserId,
    u.FirstName + ' ' + u.LastName AS UserName,
    u.Email,
    COUNT(DISTINCT s.SessionId) AS TotalSessions,
    COUNT(m.MessageId) AS TotalMessages,
    SUM(CASE WHEN m.MessageRole = 'user' THEN 1 ELSE 0 END) AS UserMessages,
    MAX(s.SessionStartedAt) AS LastSessionDate,
    AVG(CAST(f.Rating AS DECIMAL(3,2))) AS AvgFeedbackRating
FROM UserProfiles u
LEFT JOIN AskRexSessions s ON u.UserId = s.UserId
LEFT JOIN AskRexMessages m ON s.SessionId = m.SessionId
LEFT JOIN AskRexFeedback f ON m.MessageId = f.MessageId
GROUP BY u.UserId, u.FirstName, u.LastName, u.Email;
GO

-- Conversation flow analysis
CREATE VIEW vw_AskRexConversationFlow AS
SELECT 
    s.SessionId,
    s.UserId,
    s.PortalContext,
    s.SessionStartedAt,
    s.TotalMessages,
    DATEDIFF(MINUTE, s.SessionStartedAt, ISNULL(s.SessionEndedAt, GETUTCDATE())) AS SessionDurationMinutes,
    (SELECT COUNT(*) FROM AskRexSearchQueries sq WHERE sq.SessionId = s.SessionId) AS SearchCount,
    (SELECT COUNT(*) FROM AskRexGeneratedReports gr WHERE gr.SessionId = s.SessionId) AS ReportsGenerated,
    (SELECT AVG(CAST(f.Rating AS DECIMAL(3,2))) FROM AskRexFeedback f WHERE f.SessionId = s.SessionId) AS AvgSessionRating
FROM AskRexSessions s
WHERE s.SessionStartedAt >= DATEADD(DAY, -30, GETUTCDATE());
GO

PRINT 'Ask Rex AI Assistant schema created successfully';
GO
