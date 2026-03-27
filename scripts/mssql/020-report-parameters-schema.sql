-- =============================================
-- SGC Digital - Report Parameters Schema
-- MS SQL Server Schema
-- Provides parameter lookup data for all reports
-- =============================================

-- =============================================
-- PART 1: REPORT PARAMETER DEFINITIONS
-- Defines what parameters each report accepts
-- =============================================

CREATE TABLE dbo.ReportParameters (
    ParameterId INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL REFERENCES dbo.ReportDefinitions(ReportId),
    
    ParameterCode NVARCHAR(50) NOT NULL, -- 'DATE_RANGE', 'MDA', 'STATUS', 'NATURE', etc.
    ParameterName NVARCHAR(100) NOT NULL, -- Display name
    ParameterDescription NVARCHAR(255) NULL,
    
    -- Parameter Type
    ParameterType NVARCHAR(50) NOT NULL, -- 'DROPDOWN', 'DATE', 'DATE_RANGE', 'TEXT', 'NUMBER', 'MULTI_SELECT', 'CHECKBOX'
    
    -- Data Source for dropdown/multi-select
    DataSourceType NVARCHAR(50) NULL, -- 'LOOKUP_TABLE', 'VIEW', 'STATIC', 'QUERY'
    DataSourceName NVARCHAR(200) NULL, -- Table/View name or static values list
    ValueColumn NVARCHAR(100) NULL, -- Column to use as value
    DisplayColumn NVARCHAR(100) NULL, -- Column to use for display
    
    -- Default Value
    DefaultValue NVARCHAR(255) NULL,
    
    -- Validation
    IsRequired BIT NOT NULL DEFAULT 0,
    MinValue NVARCHAR(100) NULL,
    MaxValue NVARCHAR(100) NULL,
    
    -- Display
    DisplayOrder INT NOT NULL DEFAULT 0,
    GroupName NVARCHAR(100) NULL, -- For grouping related parameters
    
    IsActive BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT UQ_ReportParameters_Code UNIQUE (ReportId, ParameterCode)
);
GO

-- =============================================
-- PART 2: STATIC PARAMETER OPTIONS
-- For parameters with fixed/static values
-- =============================================

CREATE TABLE dbo.ReportParameterOptions (
    OptionId INT IDENTITY(1,1) PRIMARY KEY,
    ParameterId INT NOT NULL REFERENCES dbo.ReportParameters(ParameterId),
    
    OptionValue NVARCHAR(100) NOT NULL,
    OptionLabel NVARCHAR(200) NOT NULL,
    OptionDescription NVARCHAR(500) NULL,
    
    -- For conditional display
    ParentParameterId INT NULL REFERENCES dbo.ReportParameters(ParameterId),
    ParentOptionValue NVARCHAR(100) NULL, -- Only show if parent has this value
    
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- =============================================
-- PART 3: LOOKUP TABLE: DATE RANGE OPTIONS
-- Standard date range options for all reports
-- =============================================

CREATE TABLE dbo.LookupDateRangeOptions (
    DateRangeId INT IDENTITY(1,1) PRIMARY KEY,
    DateRangeCode NVARCHAR(50) NOT NULL UNIQUE,
    DateRangeName NVARCHAR(100) NOT NULL,
    DateRangeDescription NVARCHAR(255) NULL,
    
    -- How to calculate the range
    CalculationType NVARCHAR(50) NOT NULL, -- 'RELATIVE', 'FIXED', 'FISCAL', 'CUSTOM'
    DaysBack INT NULL, -- For relative: how many days to go back
    MonthsBack INT NULL, -- For relative: how many months
    YearsBack INT NULL, -- For relative: how many years
    
    -- For fiscal periods
    FiscalPeriodType NVARCHAR(50) NULL, -- 'QUARTER', 'HALF', 'YEAR'
    FiscalPeriodNumber INT NULL,
    
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

-- Insert standard date range options
INSERT INTO dbo.LookupDateRangeOptions (DateRangeCode, DateRangeName, DateRangeDescription, CalculationType, DaysBack, MonthsBack, DisplayOrder) VALUES
('TODAY', 'Today', 'Current day only', 'RELATIVE', 0, NULL, 1),
('YESTERDAY', 'Yesterday', 'Previous day only', 'RELATIVE', 1, NULL, 2),
('LAST_7', 'Last 7 Days', 'Past 7 days including today', 'RELATIVE', 7, NULL, 3),
('LAST_14', 'Last 14 Days', 'Past 14 days including today', 'RELATIVE', 14, NULL, 4),
('LAST_30', 'Last 30 Days', 'Past 30 days including today', 'RELATIVE', 30, NULL, 5),
('LAST_60', 'Last 60 Days', 'Past 60 days including today', 'RELATIVE', 60, NULL, 6),
('LAST_90', 'Last 90 Days', 'Past 90 days including today', 'RELATIVE', 90, NULL, 7),
('THIS_MONTH', 'This Month', 'Current calendar month', 'RELATIVE', NULL, 0, 8),
('LAST_MONTH', 'Last Month', 'Previous calendar month', 'RELATIVE', NULL, 1, 9),
('THIS_QUARTER', 'This Quarter', 'Current fiscal quarter', 'FISCAL', NULL, NULL, 10),
('LAST_QUARTER', 'Last Quarter', 'Previous fiscal quarter', 'FISCAL', NULL, NULL, 11),
('THIS_YEAR', 'This Year', 'Current calendar year', 'RELATIVE', NULL, NULL, 12),
('LAST_YEAR', 'Last Year', 'Previous calendar year', 'RELATIVE', NULL, NULL, 13),
('YTD', 'Year to Date', 'January 1 to today', 'FISCAL', NULL, NULL, 14),
('ALL_TIME', 'All Time', 'All available data', 'FIXED', NULL, NULL, 15),
('CUSTOM', 'Custom Range', 'Specify start and end dates', 'CUSTOM', NULL, NULL, 16);
GO

-- =============================================
-- PART 4: LOOKUP TABLE: REPORT GROUPINGS
-- For grouping data in reports (by period, by type, etc.)
-- =============================================

CREATE TABLE dbo.LookupReportGroupings (
    GroupingId INT IDENTITY(1,1) PRIMARY KEY,
    GroupingCode NVARCHAR(50) NOT NULL UNIQUE,
    GroupingName NVARCHAR(100) NOT NULL,
    GroupingDescription NVARCHAR(255) NULL,
    
    -- SQL fragment for GROUP BY
    SqlGroupByFragment NVARCHAR(500) NULL,
    SqlSelectFragment NVARCHAR(500) NULL,
    
    ApplicableTo NVARCHAR(200) NULL, -- 'ALL', 'CORRESPONDENCE', 'CONTRACTS', 'USERS'
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

INSERT INTO dbo.LookupReportGroupings (GroupingCode, GroupingName, GroupingDescription, SqlGroupByFragment, SqlSelectFragment, ApplicableTo, DisplayOrder) VALUES
('NONE', 'No Grouping', 'Show all records individually', NULL, NULL, 'ALL', 0),
('BY_DAY', 'By Day', 'Group by calendar day', 'CAST(SubmittedAt AS DATE)', 'CAST(SubmittedAt AS DATE) AS GroupDate', 'ALL', 1),
('BY_WEEK', 'By Week', 'Group by calendar week', 'DATEPART(YEAR, SubmittedAt), DATEPART(WEEK, SubmittedAt)', 'DATEPART(YEAR, SubmittedAt) AS GroupYear, DATEPART(WEEK, SubmittedAt) AS GroupWeek', 'ALL', 2),
('BY_MONTH', 'By Month', 'Group by calendar month', 'DATEPART(YEAR, SubmittedAt), DATEPART(MONTH, SubmittedAt)', 'DATEPART(YEAR, SubmittedAt) AS GroupYear, DATEPART(MONTH, SubmittedAt) AS GroupMonth', 'ALL', 3),
('BY_QUARTER', 'By Quarter', 'Group by fiscal quarter', 'DATEPART(YEAR, SubmittedAt), DATEPART(QUARTER, SubmittedAt)', 'DATEPART(YEAR, SubmittedAt) AS GroupYear, DATEPART(QUARTER, SubmittedAt) AS GroupQuarter', 'ALL', 4),
('BY_YEAR', 'By Year', 'Group by calendar year', 'DATEPART(YEAR, SubmittedAt)', 'DATEPART(YEAR, SubmittedAt) AS GroupYear', 'ALL', 5),
('BY_MDA', 'By Ministry/MDA', 'Group by ministry or department', 'DepartmentId', 'DepartmentId, DepartmentName', 'ALL', 6),
('BY_TYPE', 'By Type', 'Group by correspondence/contract type', 'TypeId', 'TypeId, TypeName', 'ALL', 7),
('BY_STATUS', 'By Status', 'Group by current status', 'CaseStatusId', 'CaseStatusId, StatusName', 'ALL', 8),
('BY_PRIORITY', 'By Priority', 'Group by priority level', 'PriorityId', 'PriorityId, PriorityName', 'ALL', 9),
('BY_NATURE', 'By Contract Nature', 'Group by nature of contract', 'ContractNatureId', 'ContractNatureId, NatureName', 'CONTRACTS', 10),
('BY_CATEGORY', 'By Contract Category', 'Group by contract category', 'ContractCategoryId', 'ContractCategoryId, CategoryName', 'CONTRACTS', 11),
('BY_ASSIGNEE', 'By Assignee', 'Group by assigned staff member', 'AssignedToUserId', 'AssignedToUserId, AssignedToName', 'ALL', 12);
GO

-- =============================================
-- PART 5: REPORT DEFINITIONS - POPULATE STANDARD REPORTS
-- =============================================

-- Clear existing and insert fresh
DELETE FROM dbo.ReportDefinitions;
GO

SET IDENTITY_INSERT dbo.ReportDefinitions ON;

INSERT INTO dbo.ReportDefinitions (ReportId, ReportCode, ReportName, ReportDescription, ReportCategory, RequiredRoleLevel, DefaultDateRange, DataSource, DisplayOrder)
VALUES
-- Correspondence Reports
(1, 'CORR_SUMMARY', 'Correspondence Summary', 'Summary statistics of all correspondence by type and status', 'CORRESPONDENCE', 5, 'LAST_30', 'vw_CorrespondenceSummary', 1),
(2, 'CORR_BY_MDA', 'Correspondence by Ministry', 'Breakdown of correspondence submissions by MDA', 'CORRESPONDENCE', 5, 'LAST_30', 'vw_CorrespondenceByMDA', 2),
(3, 'CORR_BY_TYPE', 'Correspondence by Type', 'Analysis of correspondence by type (General, Litigation, etc.)', 'CORRESPONDENCE', 5, 'LAST_30', 'vw_CorrespondenceByType', 3),
(4, 'CORR_TRENDS', 'Correspondence Trends', 'Monthly/quarterly trend analysis of correspondence volume', 'CORRESPONDENCE', 5, 'LAST_90', 'vw_CorrespondenceTrends', 4),
(5, 'CORR_AGING', 'Correspondence Aging Report', 'Analysis of open correspondence by age/days pending', 'CORRESPONDENCE', 5, 'ALL_TIME', 'vw_CorrespondenceAging', 5),
(6, 'CORR_SLA', 'Correspondence SLA Performance', 'SLA compliance metrics for correspondence processing', 'CORRESPONDENCE', 6, 'LAST_30', 'vw_CorrespondenceSLA', 6),

-- Contract Reports
(10, 'CONT_SUMMARY', 'Contracts Summary', 'Summary statistics of all contracts by nature and status', 'CONTRACTS', 5, 'LAST_30', 'vw_ContractsSummary', 10),
(11, 'CONT_BY_MDA', 'Contracts by Ministry', 'Breakdown of contract submissions by MDA', 'CONTRACTS', 5, 'LAST_30', 'vw_ContractsByMDA', 11),
(12, 'CONT_BY_NATURE', 'Contracts by Nature', 'Analysis of contracts by nature (Goods, Services, Works)', 'CONTRACTS', 5, 'LAST_30', 'vw_ContractsByNature', 12),
(13, 'CONT_BY_VALUE', 'Contracts by Value Range', 'Distribution of contracts by value bands', 'CONTRACTS', 5, 'LAST_90', 'vw_ContractsByValue', 13),
(14, 'CONT_TRENDS', 'Contract Trends', 'Monthly/quarterly trend analysis of contract volume and value', 'CONTRACTS', 5, 'LAST_90', 'vw_ContractTrends', 14),
(15, 'CONT_RENEWALS', 'Contract Renewals Report', 'Contracts due for renewal or expiring soon', 'CONTRACTS', 5, 'LAST_90', 'vw_ContractRenewals', 15),
(16, 'CONT_PIPELINE', 'Contract Pipeline', 'Contracts in progress by stage', 'CONTRACTS', 5, 'ALL_TIME', 'vw_ContractPipeline', 16),

-- Financial Reports
(20, 'FIN_CONTRACT_VALUE', 'Contract Value Summary', 'Total contract values by period and MDA', 'FINANCIAL', 6, 'THIS_YEAR', 'vw_ContractValueSummary', 20),
(21, 'FIN_BY_FUNDING', 'Contracts by Funding Source', 'Contract values by funding source', 'FINANCIAL', 6, 'THIS_YEAR', 'vw_ContractsByFunding', 21),
(22, 'FIN_MONTHLY', 'Monthly Financial Summary', 'Monthly summary of contract values', 'FINANCIAL', 6, 'LAST_YEAR', 'vw_MonthlyFinancialSummary', 22),

-- Performance Reports
(30, 'PERF_SLA_OVERALL', 'SLA Performance Overview', 'Overall SLA compliance metrics', 'PERFORMANCE', 6, 'LAST_30', 'vw_SLAPerformance', 30),
(31, 'PERF_PROCESSING_TIME', 'Processing Time Analysis', 'Average processing times by type and stage', 'PERFORMANCE', 6, 'LAST_30', 'vw_ProcessingTimeAnalysis', 31),
(32, 'PERF_BY_STAFF', 'Staff Performance', 'Workload and performance metrics by staff member', 'PERFORMANCE', 7, 'LAST_30', 'vw_StaffPerformance', 32),
(33, 'PERF_BY_DEPT', 'Department Performance', 'Performance metrics by SGC department/unit', 'PERFORMANCE', 7, 'LAST_30', 'vw_DepartmentPerformance', 33),

-- User/Entity Reports
(40, 'USER_REGISTRATIONS', 'User Registration Report', 'New user registrations by period and type', 'USERS', 6, 'LAST_30', 'vw_UserRegistrations', 40),
(41, 'USER_ACTIVITY', 'User Activity Report', 'User login and submission activity', 'USERS', 7, 'LAST_30', 'vw_UserActivity', 41),
(42, 'MDA_ACTIVITY', 'MDA Activity Report', 'Submission activity by MDA', 'USERS', 6, 'LAST_30', 'vw_MDAActivity', 42),

-- Combined/Executive Reports
(50, 'EXEC_DASHBOARD', 'Executive Dashboard', 'High-level summary for leadership', 'EXECUTIVE', 7, 'THIS_MONTH', 'vw_ExecutiveDashboard', 50),
(51, 'EXEC_WEEKLY', 'Weekly Summary Report', 'Weekly activity summary', 'EXECUTIVE', 6, 'LAST_7', 'vw_WeeklySummary', 51),
(52, 'EXEC_MONTHLY', 'Monthly Summary Report', 'Monthly activity and performance summary', 'EXECUTIVE', 6, 'LAST_MONTH', 'vw_MonthlySummary', 52);

SET IDENTITY_INSERT dbo.ReportDefinitions OFF;
GO

-- =============================================
-- PART 6: POPULATE REPORT PARAMETERS
-- =============================================

-- Parameters for all reports that support them
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'DATE_RANGE',
    'Date Range',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupDateRangeOptions',
    'DateRangeCode',
    'DateRangeName',
    1,
    1
FROM dbo.ReportDefinitions r
WHERE r.IsActive = 1;
GO

-- MDA parameter for relevant reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'MDA',
    'Ministry/Department',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupDepartments',
    'DepartmentId',
    'DepartmentName',
    'ALL',
    0,
    2
FROM dbo.ReportDefinitions r
WHERE r.ReportCategory IN ('CORRESPONDENCE', 'CONTRACTS', 'FINANCIAL', 'USERS', 'EXECUTIVE');
GO

-- Status parameter for correspondence reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'STATUS',
    'Status',
    'MULTI_SELECT',
    'LOOKUP_TABLE',
    'LookupCaseStatus',
    'CaseStatusId',
    'StatusName',
    'ALL',
    0,
    3
FROM dbo.ReportDefinitions r
WHERE r.ReportCategory = 'CORRESPONDENCE';
GO

-- Nature parameter for contract reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'NATURE',
    'Contract Nature',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupContractNature',
    'ContractNatureId',
    'NatureName',
    'ALL',
    0,
    3
FROM dbo.ReportDefinitions r
WHERE r.ReportCategory = 'CONTRACTS';
GO

-- Grouping parameter for trend reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'GROUP_BY',
    'Group By',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupReportGroupings',
    'GroupingCode',
    'GroupingName',
    'BY_MONTH',
    0,
    4
FROM dbo.ReportDefinitions r
WHERE r.ReportCode IN ('CORR_TRENDS', 'CONT_TRENDS', 'FIN_MONTHLY');
GO

-- Category parameter for contract reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'CATEGORY',
    'Contract Category',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupContractCategories',
    'CategoryId',
    'CategoryName',
    'ALL',
    0,
    4
FROM dbo.ReportDefinitions r
WHERE r.ReportCode IN ('CONT_BY_NATURE', 'CONT_SUMMARY', 'CONT_PIPELINE');
GO

-- Correspondence type parameter
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'CORR_TYPE',
    'Correspondence Type',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupCorrespondenceTypes',
    'CorrespondenceTypeId',
    'TypeName',
    'ALL',
    0,
    4
FROM dbo.ReportDefinitions r
WHERE r.ReportCode IN ('CORR_BY_TYPE', 'CORR_SUMMARY', 'CORR_AGING');
GO

-- Export format parameter for all reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DefaultValue, IsRequired, DisplayOrder, GroupName)
SELECT 
    r.ReportId,
    'EXPORT_FORMAT',
    'Export Format',
    'DROPDOWN',
    'STATIC',
    'PDF',
    0,
    99,
    'Export Options'
FROM dbo.ReportDefinitions r
WHERE r.SupportsExport = 1;
GO

-- Add static options for export format
INSERT INTO dbo.ReportParameterOptions (ParameterId, OptionValue, OptionLabel, DisplayOrder, IsDefault)
SELECT 
    p.ParameterId,
    'PDF',
    'PDF Document',
    1,
    1
FROM dbo.ReportParameters p
WHERE p.ParameterCode = 'EXPORT_FORMAT';

INSERT INTO dbo.ReportParameterOptions (ParameterId, OptionValue, OptionLabel, DisplayOrder)
SELECT 
    p.ParameterId,
    'EXCEL',
    'Excel Spreadsheet',
    2
FROM dbo.ReportParameters p
WHERE p.ParameterCode = 'EXPORT_FORMAT';

INSERT INTO dbo.ReportParameterOptions (ParameterId, OptionValue, OptionLabel, DisplayOrder)
SELECT 
    p.ParameterId,
    'CSV',
    'CSV File',
    3
FROM dbo.ReportParameters p
WHERE p.ParameterCode = 'EXPORT_FORMAT';
GO

-- =============================================
-- PART 7: VALUE RANGE LOOKUPS (For filtering by amounts)
-- =============================================

CREATE TABLE dbo.LookupValueRanges (
    RangeId INT IDENTITY(1,1) PRIMARY KEY,
    RangeCode NVARCHAR(50) NOT NULL UNIQUE,
    RangeName NVARCHAR(100) NOT NULL,
    
    MinValue DECIMAL(18,2) NULL,
    MaxValue DECIMAL(18,2) NULL,
    
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

INSERT INTO dbo.LookupValueRanges (RangeCode, RangeName, MinValue, MaxValue, DisplayOrder) VALUES
('UNDER_50K', 'Under $50,000', 0, 49999.99, 1),
('50K_100K', '$50,000 - $100,000', 50000, 100000, 2),
('100K_250K', '$100,000 - $250,000', 100000.01, 250000, 3),
('250K_500K', '$250,000 - $500,000', 250000.01, 500000, 4),
('500K_1M', '$500,000 - $1,000,000', 500000.01, 1000000, 5),
('1M_5M', '$1,000,000 - $5,000,000', 1000000.01, 5000000, 6),
('5M_10M', '$5,000,000 - $10,000,000', 5000000.01, 10000000, 7),
('OVER_10M', 'Over $10,000,000', 10000000.01, NULL, 8);
GO

-- Add value range parameter to financial reports
INSERT INTO dbo.ReportParameters (ReportId, ParameterCode, ParameterName, ParameterType, DataSourceType, DataSourceName, ValueColumn, DisplayColumn, DefaultValue, IsRequired, DisplayOrder)
SELECT 
    r.ReportId,
    'VALUE_RANGE',
    'Contract Value Range',
    'DROPDOWN',
    'LOOKUP_TABLE',
    'LookupValueRanges',
    'RangeCode',
    'RangeName',
    'ALL',
    0,
    5
FROM dbo.ReportDefinitions r
WHERE r.ReportCode IN ('CONT_BY_VALUE', 'FIN_CONTRACT_VALUE');
GO

-- =============================================
-- PART 8: STORED PROCEDURE TO GET REPORT PARAMETERS
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_GetReportParameters
    @ReportCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get report info
    SELECT 
        r.ReportId,
        r.ReportCode,
        r.ReportName,
        r.ReportDescription,
        r.ReportCategory,
        r.DefaultDateRange,
        r.SupportsExport,
        r.ExportFormats
    FROM dbo.ReportDefinitions r
    WHERE r.ReportCode = @ReportCode AND r.IsActive = 1;
    
    -- Get parameters
    SELECT 
        p.ParameterId,
        p.ParameterCode,
        p.ParameterName,
        p.ParameterDescription,
        p.ParameterType,
        p.DataSourceType,
        p.DataSourceName,
        p.ValueColumn,
        p.DisplayColumn,
        p.DefaultValue,
        p.IsRequired,
        p.DisplayOrder,
        p.GroupName
    FROM dbo.ReportParameters p
    INNER JOIN dbo.ReportDefinitions r ON p.ReportId = r.ReportId
    WHERE r.ReportCode = @ReportCode AND p.IsActive = 1
    ORDER BY p.DisplayOrder;
END
GO

-- =============================================
-- PART 9: STORED PROCEDURE TO GET PARAMETER OPTIONS
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_GetParameterOptions
    @ParameterId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DataSourceType NVARCHAR(50);
    DECLARE @DataSourceName NVARCHAR(200);
    DECLARE @ValueColumn NVARCHAR(100);
    DECLARE @DisplayColumn NVARCHAR(100);
    DECLARE @Sql NVARCHAR(MAX);
    
    SELECT 
        @DataSourceType = DataSourceType,
        @DataSourceName = DataSourceName,
        @ValueColumn = ValueColumn,
        @DisplayColumn = DisplayColumn
    FROM dbo.ReportParameters
    WHERE ParameterId = @ParameterId;
    
    IF @DataSourceType = 'STATIC'
    BEGIN
        -- Return from ReportParameterOptions
        SELECT 
            OptionValue AS Value,
            OptionLabel AS Label,
            OptionDescription AS Description,
            IsDefault
        FROM dbo.ReportParameterOptions
        WHERE ParameterId = @ParameterId AND IsActive = 1
        ORDER BY DisplayOrder;
    END
    ELSE IF @DataSourceType = 'LOOKUP_TABLE' AND @DataSourceName IS NOT NULL
    BEGIN
        -- Dynamic query from lookup table
        SET @Sql = N'SELECT ' + QUOTENAME(@ValueColumn) + N' AS Value, ' + 
                   QUOTENAME(@DisplayColumn) + N' AS Label FROM dbo.' + 
                   QUOTENAME(@DataSourceName) + N' WHERE IsActive = 1 ORDER BY DisplayOrder';
        EXEC sp_executesql @Sql;
    END
END
GO

-- =============================================
-- PART 10: VIEW FOR AVAILABLE REPORTS
-- =============================================

CREATE OR ALTER VIEW dbo.vw_AvailableReports
AS
SELECT 
    r.ReportId,
    r.ReportCode,
    r.ReportName,
    r.ReportDescription,
    r.ReportCategory,
    r.RequiredRoleLevel,
    r.DefaultDateRange,
    r.SupportsExport,
    r.ExportFormats,
    r.DisplayOrder,
    (SELECT COUNT(*) FROM dbo.ReportParameters p WHERE p.ReportId = r.ReportId AND p.IsActive = 1) AS ParameterCount
FROM dbo.ReportDefinitions r
WHERE r.IsActive = 1;
GO

PRINT 'Report Parameters Schema created successfully';
PRINT 'Tables: ReportParameters, ReportParameterOptions, LookupDateRangeOptions, LookupReportGroupings, LookupValueRanges';
PRINT 'Stored Procedures: sp_GetReportParameters, sp_GetParameterOptions';
PRINT 'Views: vw_AvailableReports';
GO
