-- =============================================
-- SGC Digital - Document Requirements Junction Tables
-- MS SQL Server Schema
-- 
-- This script creates the junction tables that map
-- required/optional documents to contract nature, category, 
-- instrument, and procurement method combinations
-- =============================================

-- =============================================
-- PART 1: DOCUMENT REQUIREMENT MAPPING TABLE (CONTRACTS)
-- =============================================

-- Junction table: Which documents are required/optional for each nature/category/instrument combination
CREATE TABLE dbo.ContractDocumentRequirements (
    RequirementId INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Document Type (what document)
    DocumentTypeId INT NOT NULL,
    
    -- Applicability (when is this document needed)
    ContractNatureId INT NULL,           -- NULL = applies to all natures
    ContractCategoryId INT NULL,         -- NULL = applies to all categories
    ContractInstrumentId INT NULL,       -- NULL = applies to all instruments
    ProcurementMethodId INT NULL,        -- NULL = applies to all procurement methods
    
    -- Requirement Level
    IsRequired BIT NOT NULL DEFAULT 0,
    IsConditional BIT NOT NULL DEFAULT 0, -- Required only under certain conditions
    ConditionDescription NVARCHAR(500) NULL, -- e.g., "Required if contract value > $100,000"
    
    -- For renewal/supplemental contracts
    AppliesTo NVARCHAR(50) NOT NULL DEFAULT 'ALL', -- 'ALL', 'NEW', 'RENEWAL', 'SUPPLEMENTAL'
    
    -- Single Source specific
    RequiredForSingleSource BIT NOT NULL DEFAULT 0,
    
    -- Display
    DisplayOrder INT NOT NULL DEFAULT 0,
    HelpText NVARCHAR(500) NULL,
    
    -- Audit
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_ContractDocReq_DocType FOREIGN KEY (DocumentTypeId) 
        REFERENCES dbo.LookupContractDocumentTypes(DocumentTypeId),
    CONSTRAINT FK_ContractDocReq_Nature FOREIGN KEY (ContractNatureId) 
        REFERENCES dbo.LookupContractNature(ContractNatureId),
    CONSTRAINT FK_ContractDocReq_Category FOREIGN KEY (ContractCategoryId) 
        REFERENCES dbo.LookupContractCategories(CategoryId),
    CONSTRAINT FK_ContractDocReq_Instrument FOREIGN KEY (ContractInstrumentId) 
        REFERENCES dbo.LookupContractInstruments(InstrumentId),
    CONSTRAINT FK_ContractDocReq_Procurement FOREIGN KEY (ProcurementMethodId) 
        REFERENCES dbo.LookupProcurementMethods(ProcurementMethodId)
);

-- Index for efficient lookups
CREATE INDEX IX_ContractDocReq_Nature ON dbo.ContractDocumentRequirements(ContractNatureId);
CREATE INDEX IX_ContractDocReq_Category ON dbo.ContractDocumentRequirements(ContractCategoryId);
CREATE INDEX IX_ContractDocReq_Instrument ON dbo.ContractDocumentRequirements(ContractInstrumentId);

-- =============================================
-- PART 2: DOCUMENT REQUIREMENT MAPPING TABLE (CORRESPONDENCE)
-- =============================================

CREATE TABLE dbo.CorrespondenceDocumentRequirements (
    RequirementId INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Document Type
    DocumentTypeId INT NOT NULL,
    
    -- Applicability
    CorrespondenceTypeId INT NULL,       -- NULL = applies to all types
    SubmitterTypeId INT NULL,            -- NULL = applies to all submitter types
    ConfidentialityId INT NULL,          -- NULL = applies to all confidentiality levels
    
    -- Requirement Level
    IsRequired BIT NOT NULL DEFAULT 0,
    IsConditional BIT NOT NULL DEFAULT 0,
    ConditionDescription NVARCHAR(500) NULL,
    
    -- Display
    DisplayOrder INT NOT NULL DEFAULT 0,
    HelpText NVARCHAR(500) NULL,
    
    -- Audit
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_CorrDocReq_DocType FOREIGN KEY (DocumentTypeId) 
        REFERENCES dbo.LookupCorrespondenceDocumentTypes(DocumentTypeId),
    CONSTRAINT FK_CorrDocReq_CorrType FOREIGN KEY (CorrespondenceTypeId) 
        REFERENCES dbo.LookupCorrespondenceTypes(CorrespondenceTypeId),
    CONSTRAINT FK_CorrDocReq_SubmitterType FOREIGN KEY (SubmitterTypeId) 
        REFERENCES dbo.LookupSubmitterTypes(SubmitterTypeId),
    CONSTRAINT FK_CorrDocReq_Confidentiality FOREIGN KEY (ConfidentialityId) 
        REFERENCES dbo.LookupConfidentialityLevels(ConfidentialityId)
);

-- Index for efficient lookups
CREATE INDEX IX_CorrDocReq_CorrType ON dbo.CorrespondenceDocumentRequirements(CorrespondenceTypeId);
CREATE INDEX IX_CorrDocReq_SubmitterType ON dbo.CorrespondenceDocumentRequirements(SubmitterTypeId);

-- =============================================
-- PART 3: SEED DATA - GOODS CONTRACT DOCUMENT REQUIREMENTS
-- =============================================

-- First, we need the IDs from the lookup tables
-- Assuming: Goods=1, Consultancy=2, Works=3 for ContractNatureId

-- GOODS - Always Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'GOODS'),
       1, -- IsRequired
       DisplayOrder,
       'Required for all Goods contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_SPECS', 'PROC_TENDER');

-- GOODS - Optional Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'GOODS'),
       0, -- Not Required (Optional)
       DisplayOrder,
       'Optional for Goods contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('FORM_DRAFT');

-- GOODS - Single Source Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, RequiredForSingleSource, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'GOODS'),
       0, -- Not normally required
       1, -- Required for single source
       DisplayOrder,
       'Required when using Single Source Procurement'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR');

-- =============================================
-- PART 4: SEED DATA - CONSULTANCY CONTRACT DOCUMENT REQUIREMENTS
-- =============================================

-- CONSULTANCY - Always Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'CONSULTANCY'),
       1, -- IsRequired
       DisplayOrder,
       'Required for all Consultancy contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'FORM_SCHED_DELIV', 'PROC_PROP', 'PROC_TENDER', 'PROC_TOR');

-- CONSULTANCY - Optional Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'CONSULTANCY'),
       0, -- Not Required (Optional)
       DisplayOrder,
       'Optional for Consultancy contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('DUE_BUS_REG', 'DUE_GS', 'DUE_INCORP', 'FIN_BOND', 'FIN_SURETY', 'FORM_DRAFT', 'FORM_LOE');

-- CONSULTANCY - Cabinet Documents (Conditional)
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, IsConditional, ConditionDescription, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'CONSULTANCY'),
       0, 
       1, -- Conditional
       'Required for contracts exceeding Cabinet threshold',
       DisplayOrder,
       'Required when contract value exceeds Cabinet threshold'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('PROC_CAB_PAPER', 'PROC_CAB_APPR');

-- CONSULTANCY - Single Source Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, RequiredForSingleSource, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'CONSULTANCY'),
       0, 
       1, -- Required for single source
       DisplayOrder,
       'Required when using Single Source Procurement'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR');

-- =============================================
-- PART 5: SEED DATA - WORKS CONTRACT DOCUMENT REQUIREMENTS
-- =============================================

-- WORKS - Always Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'WORKS'),
       1, -- IsRequired
       DisplayOrder,
       'Required for all Works contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_BOQ', 'PROC_DRAWINGS', 'PROC_TENDER');

-- WORKS - Optional Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'WORKS'),
       0, -- Not Required (Optional)
       DisplayOrder,
       'Optional for Works contracts'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('FIN_BOND', 'FIN_SURETY', 'FORM_DRAFT');

-- WORKS - Cabinet Documents (Conditional)
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, IsConditional, ConditionDescription, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'WORKS'),
       0, 
       1, -- Conditional
       'Required for contracts exceeding Cabinet threshold',
       DisplayOrder,
       'Required when contract value exceeds Cabinet threshold'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('PROC_CAB_PAPER', 'PROC_CAB_APPR');

-- WORKS - Single Source Required Documents
INSERT INTO dbo.ContractDocumentRequirements (DocumentTypeId, ContractNatureId, IsRequired, RequiredForSingleSource, DisplayOrder, HelpText)
SELECT DocumentTypeId, 
       (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = 'WORKS'),
       0, 
       1, -- Required for single source
       DisplayOrder,
       'Required when using Single Source Procurement'
FROM dbo.LookupContractDocumentTypes
WHERE DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR');

-- =============================================
-- PART 6: SEED DATA - CORRESPONDENCE DOCUMENT REQUIREMENTS
-- =============================================

-- General Correspondence - Supporting Document Required
INSERT INTO dbo.CorrespondenceDocumentRequirements (DocumentTypeId, CorrespondenceTypeId, IsRequired, DisplayOrder, HelpText)
SELECT dt.DocumentTypeId, 
       ct.CorrespondenceTypeId,
       1, -- IsRequired
       1,
       'Primary correspondence document required'
FROM dbo.LookupCorrespondenceDocumentTypes dt
CROSS JOIN dbo.LookupCorrespondenceTypes ct
WHERE dt.DocumentTypeCode = 'CORRESPONDENCE'
  AND ct.TypeCode IN ('GENERAL', 'ADVISORY', 'COMPENSATION', 'PUBLIC_TRUSTEE', 'INTERNATIONAL_LAW');

-- Litigation - Court Document Required
INSERT INTO dbo.CorrespondenceDocumentRequirements (DocumentTypeId, CorrespondenceTypeId, IsRequired, DisplayOrder, HelpText)
SELECT dt.DocumentTypeId, 
       ct.CorrespondenceTypeId,
       1, -- IsRequired
       1,
       'Court documents are required for litigation matters'
FROM dbo.LookupCorrespondenceDocumentTypes dt
CROSS JOIN dbo.LookupCorrespondenceTypes ct
WHERE dt.DocumentTypeCode = 'COURT_DOC'
  AND ct.TypeCode = 'LITIGATION';

-- Cabinet - Cabinet Paper Required
INSERT INTO dbo.CorrespondenceDocumentRequirements (DocumentTypeId, CorrespondenceTypeId, IsRequired, DisplayOrder, HelpText)
SELECT dt.DocumentTypeId, 
       ct.CorrespondenceTypeId,
       1, -- IsRequired
       1,
       'Cabinet paper required for Cabinet-level correspondence'
FROM dbo.LookupCorrespondenceDocumentTypes dt
CROSS JOIN dbo.LookupCorrespondenceTypes ct
WHERE dt.DocumentTypeCode = 'CABINET_PAPER'
  AND ct.TypeCode = 'CABINET';

-- All Types - Supporting Documents Optional
INSERT INTO dbo.CorrespondenceDocumentRequirements (DocumentTypeId, CorrespondenceTypeId, IsRequired, DisplayOrder, HelpText)
SELECT dt.DocumentTypeId, 
       NULL, -- Applies to all types
       0, -- Not Required (Optional)
       10,
       'Additional supporting documents may be uploaded'
FROM dbo.LookupCorrespondenceDocumentTypes dt
WHERE dt.DocumentTypeCode IN ('SUPPORTING', 'REFERENCE', 'OTHER');

-- =============================================
-- PART 7: VIEW FOR GETTING DOCUMENT REQUIREMENTS
-- =============================================

CREATE VIEW dbo.vw_ContractDocumentRequirementsFull AS
SELECT 
    cdr.RequirementId,
    cdr.DocumentTypeId,
    cdt.DocumentTypeCode,
    cdt.DocumentTypeName,
    cdr.ContractNatureId,
    cn.NatureCode AS ContractNatureCode,
    cn.NatureName AS ContractNatureName,
    cdr.ContractCategoryId,
    cc.CategoryCode AS ContractCategoryCode,
    cc.CategoryName AS ContractCategoryName,
    cdr.ContractInstrumentId,
    ci.InstrumentCode AS ContractInstrumentCode,
    ci.InstrumentName AS ContractInstrumentName,
    cdr.ProcurementMethodId,
    pm.MethodCode AS ProcurementMethodCode,
    pm.MethodName AS ProcurementMethodName,
    cdr.IsRequired,
    cdr.IsConditional,
    cdr.ConditionDescription,
    cdr.AppliesTo,
    cdr.RequiredForSingleSource,
    cdr.DisplayOrder,
    cdr.HelpText,
    cdr.IsActive
FROM dbo.ContractDocumentRequirements cdr
    INNER JOIN dbo.LookupContractDocumentTypes cdt ON cdr.DocumentTypeId = cdt.DocumentTypeId
    LEFT JOIN dbo.LookupContractNature cn ON cdr.ContractNatureId = cn.ContractNatureId
    LEFT JOIN dbo.LookupContractCategories cc ON cdr.ContractCategoryId = cc.CategoryId
    LEFT JOIN dbo.LookupContractInstruments ci ON cdr.ContractInstrumentId = ci.InstrumentId
    LEFT JOIN dbo.LookupProcurementMethods pm ON cdr.ProcurementMethodId = pm.ProcurementMethodId
WHERE cdr.IsActive = 1;

CREATE VIEW dbo.vw_CorrespondenceDocumentRequirementsFull AS
SELECT 
    cdr.RequirementId,
    cdr.DocumentTypeId,
    cdt.DocumentTypeCode,
    cdt.DocumentTypeName,
    cdr.CorrespondenceTypeId,
    ct.TypeCode AS CorrespondenceTypeCode,
    ct.TypeName AS CorrespondenceTypeName,
    cdr.SubmitterTypeId,
    st.TypeCode AS SubmitterTypeCode,
    st.TypeName AS SubmitterTypeName,
    cdr.ConfidentialityId,
    cl.ConfidentialityCode,
    cl.ConfidentialityName,
    cdr.IsRequired,
    cdr.IsConditional,
    cdr.ConditionDescription,
    cdr.DisplayOrder,
    cdr.HelpText,
    cdr.IsActive
FROM dbo.CorrespondenceDocumentRequirements cdr
    INNER JOIN dbo.LookupCorrespondenceDocumentTypes cdt ON cdr.DocumentTypeId = cdt.DocumentTypeId
    LEFT JOIN dbo.LookupCorrespondenceTypes ct ON cdr.CorrespondenceTypeId = ct.CorrespondenceTypeId
    LEFT JOIN dbo.LookupSubmitterTypes st ON cdr.SubmitterTypeId = st.SubmitterTypeId
    LEFT JOIN dbo.LookupConfidentialityLevels cl ON cdr.ConfidentialityId = cl.ConfidentialityId
WHERE cdr.IsActive = 1;

-- =============================================
-- PART 8: STORED PROCEDURE TO GET REQUIRED DOCS
-- =============================================

-- This procedure returns all required/optional documents for a given contract configuration
CREATE PROCEDURE dbo.sp_GetContractDocumentRequirements
    @NatureCode NVARCHAR(50),
    @CategoryCode NVARCHAR(50) = NULL,
    @InstrumentCode NVARCHAR(50) = NULL,
    @ProcurementMethodCode NVARCHAR(50) = NULL,
    @ContractType NVARCHAR(50) = 'NEW', -- 'NEW', 'RENEWAL', 'SUPPLEMENTAL'
    @IsSingleSource BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NatureId INT = (SELECT ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = @NatureCode);
    DECLARE @CategoryId INT = (SELECT CategoryId FROM dbo.LookupContractCategories WHERE CategoryCode = @CategoryCode);
    DECLARE @InstrumentId INT = (SELECT InstrumentId FROM dbo.LookupContractInstruments WHERE InstrumentCode = @InstrumentCode);
    DECLARE @ProcurementId INT = (SELECT ProcurementMethodId FROM dbo.LookupProcurementMethods WHERE MethodCode = @ProcurementMethodCode);
    
    SELECT DISTINCT
        cdt.DocumentTypeCode,
        cdt.DocumentTypeName,
        CASE 
            WHEN cdr.IsRequired = 1 THEN 'Required'
            WHEN @IsSingleSource = 1 AND cdr.RequiredForSingleSource = 1 THEN 'Required (Single Source)'
            WHEN cdr.IsConditional = 1 THEN 'Conditional'
            ELSE 'Optional'
        END AS RequirementLevel,
        CASE 
            WHEN cdr.IsRequired = 1 THEN 1
            WHEN @IsSingleSource = 1 AND cdr.RequiredForSingleSource = 1 THEN 1
            ELSE 0
        END AS IsRequired,
        cdr.ConditionDescription,
        cdr.HelpText,
        cdr.DisplayOrder
    FROM dbo.ContractDocumentRequirements cdr
        INNER JOIN dbo.LookupContractDocumentTypes cdt ON cdr.DocumentTypeId = cdt.DocumentTypeId
    WHERE cdr.IsActive = 1
      AND (cdr.ContractNatureId IS NULL OR cdr.ContractNatureId = @NatureId)
      AND (cdr.ContractCategoryId IS NULL OR cdr.ContractCategoryId = @CategoryId OR @CategoryId IS NULL)
      AND (cdr.ContractInstrumentId IS NULL OR cdr.ContractInstrumentId = @InstrumentId OR @InstrumentId IS NULL)
      AND (cdr.ProcurementMethodId IS NULL OR cdr.ProcurementMethodId = @ProcurementId OR @ProcurementId IS NULL)
      AND (cdr.AppliesTo = 'ALL' OR cdr.AppliesTo = @ContractType)
    ORDER BY 
        CASE 
            WHEN cdr.IsRequired = 1 THEN 0
            WHEN @IsSingleSource = 1 AND cdr.RequiredForSingleSource = 1 THEN 1
            WHEN cdr.IsConditional = 1 THEN 2
            ELSE 3
        END,
        cdr.DisplayOrder;
END;
GO

-- =============================================
-- PART 9: ADDITIONAL DOCUMENT TYPE COLUMNS
-- =============================================

-- Add file format and size restrictions to document types
ALTER TABLE dbo.LookupContractDocumentTypes ADD
    AllowedFileExtensions NVARCHAR(200) NULL DEFAULT '.pdf,.doc,.docx,.xls,.xlsx',
    MaxFileSizeMB INT NOT NULL DEFAULT 10,
    MinFileSizeMB INT NOT NULL DEFAULT 0,
    AllowMultiple BIT NOT NULL DEFAULT 0, -- Can upload multiple files of this type
    TemplateUrl NVARCHAR(500) NULL; -- URL to downloadable template

ALTER TABLE dbo.LookupCorrespondenceDocumentTypes ADD
    AllowedFileExtensions NVARCHAR(200) NULL DEFAULT '.pdf,.doc,.docx',
    MaxFileSizeMB INT NOT NULL DEFAULT 10,
    MinFileSizeMB INT NOT NULL DEFAULT 0,
    AllowMultiple BIT NOT NULL DEFAULT 1,
    TemplateUrl NVARCHAR(500) NULL;

-- Update some document types with specific restrictions
UPDATE dbo.LookupContractDocumentTypes
SET AllowedFileExtensions = '.pdf',
    MaxFileSizeMB = 25,
    AllowMultiple = 0
WHERE DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'PROC_CAB_APPR', 'PROC_SSP_APPR');

UPDATE dbo.LookupContractDocumentTypes
SET AllowedFileExtensions = '.pdf,.dwg,.dxf,.png,.jpg',
    MaxFileSizeMB = 50,
    AllowMultiple = 1
WHERE DocumentTypeCode IN ('PROC_DRAWINGS');

UPDATE dbo.LookupContractDocumentTypes
SET AllowedFileExtensions = '.pdf,.xls,.xlsx',
    MaxFileSizeMB = 10,
    AllowMultiple = 0
WHERE DocumentTypeCode IN ('PROC_BOQ', 'FORM_PAY_SCHED');
