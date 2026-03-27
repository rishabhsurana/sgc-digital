-- =============================================
-- SGC Digital - Appendix C Document Requirements Matrix
-- MS SQL Server Schema
-- 
-- This script implements the complete Supporting Documents Matrix
-- from Appendix C of the SGC Portal Use Case document (02 Mar 2026)
-- 
-- Covers: Nature -> Category -> Instrument -> Required Documents
-- =============================================

-- =============================================
-- PART 1: ADD MISSING DOCUMENT TYPES
-- These document codes are from Appendix C
-- =============================================

-- First, ensure we have all document type codes from Appendix C
-- Check if table exists and insert missing records

-- Contract Document Types from Appendix C
MERGE INTO dbo.LookupContractDocumentTypes AS target
USING (VALUES 
    -- Form Documents
    ('FORM_ACCEPT', 'Acceptance of Award', 'Acceptance of award/engagement by contractor', 'goods,consultancy,works', 1),
    ('FORM_DRAFT', 'Draft Contract', 'Draft contract may be supplied; SGC will generate authoritative draft', 'goods,consultancy,works', 0),
    ('FORM_LOA', 'Letter of Award', 'Letter of award issued by Ministry/Department', 'goods,consultancy,works', 1),
    ('FORM_LOE', 'Letter of Engagement', 'Used where engagement is by letter of engagement', 'consultancy', 0),
    ('FORM_PAY_SCHED', 'Payment Schedule', 'Payment schedule detailing payment terms', 'goods,consultancy,works', 1),
    ('FORM_SCHED_DELIV', 'Schedule of Deliverables', 'Schedule of deliverables for consultancy/services', 'consultancy', 1),
    ('FORM_SCHED_WORKS', 'Schedule of Works/Completion Schedule', 'Schedule of works/completion schedule for works contracts', 'works', 1),
    
    -- Procurement Documents
    ('PROC_SPECS', 'Specifications', 'Specifications of goods - detailed description and quantity', 'goods', 1),
    ('PROC_TENDER', 'Tender Documents', 'Tender/quotation documents or equivalent', 'goods,consultancy,works', 1),
    ('PROC_TOR', 'Terms of Reference', 'Terms of reference required for consultancy/services', 'consultancy', 1),
    ('PROC_PROP', 'Proposal', 'Proposal submission as part of award package', 'consultancy,works', 1),
    ('PROC_SCOPE', 'Scope of Works', 'Scope of works required for works contract', 'works', 1),
    ('PROC_BOQ', 'Bill of Quantities', 'Bill of quantities for works contracts', 'works', 1),
    ('PROC_DRAWINGS', 'Technical Drawings', 'Technical/architectural drawings for works', 'works', 1),
    
    -- Cabinet Documents
    ('PROC_CAB_PAPER', 'Cabinet Paper', 'Cabinet paper requesting approval (where required)', 'goods,consultancy,works', 0),
    ('PROC_CAB_APPR', 'Cabinet Approval', 'Cabinet decision/approval (where required)', 'goods,consultancy,works', 0),
    
    -- Single Source Procurement
    ('PROC_SSP_REQ', 'Single Source Procurement Request', 'Required only when Single Source Procurement used', 'goods,consultancy,works', 0),
    ('PROC_SSP_APPR', 'Single Source Approval', 'Approval for Single Source Procurement where used', 'goods,consultancy,works', 0),
    
    -- Due Diligence Documents
    ('DUE_BUS_REG', 'Business Registration', 'Proof of registration of business (as applicable)', 'consultancy,works', 0),
    ('DUE_GS', 'Certificate of Good Standing', 'Certificate of good standing (companies only)', 'consultancy,works', 0),
    ('DUE_INCORP', 'Company Incorporation Documents', 'Company incorporation documents (companies only)', 'consultancy,works', 0),
    
    -- Financial Documents
    ('FIN_BOND', 'Performance Bond', 'Performance bond/security where required', 'consultancy,works', 0),
    ('FIN_SURETY', 'Proof of Surety', 'Surety documentation where required', 'consultancy,works', 0)
) AS source (DocumentTypeCode, DocumentTypeName, Description, ApplicableNatures, IsRequired)
ON target.DocumentTypeCode = source.DocumentTypeCode
WHEN MATCHED THEN
    UPDATE SET 
        DocumentTypeName = source.DocumentTypeName,
        Description = source.Description,
        ApplicableNatures = source.ApplicableNatures,
        IsRequired = source.IsRequired
WHEN NOT MATCHED THEN
    INSERT (DocumentTypeCode, DocumentTypeName, Description, ApplicableNatures, IsRequired, IsActive, DisplayOrder)
    VALUES (source.DocumentTypeCode, source.DocumentTypeName, source.Description, source.ApplicableNatures, source.IsRequired, 1, 0);

-- =============================================
-- PART 2: ADD/UPDATE CONTRACT CATEGORIES (From Appendix A & C)
-- =============================================

MERGE INTO dbo.LookupContractCategories AS target
USING (VALUES 
    ('CAT_PROC', 'Procurement of Goods & Services', 'General procurement category', 'goods,consultancy,works', 0, 1),
    ('CAT_CONS', 'Consultancy / Professional Services', 'Professional and consultancy services', 'consultancy', 0, 2),
    ('CAT_CONST', 'Construction / Public Works', 'Construction and infrastructure works', 'works', 0, 3),
    ('CAT_LEASE', 'Lease / Property', 'Equipment lease and property agreements', 'goods', 0, 4),
    ('CAT_INTER', 'Inter-Agency / MOU', 'Inter-agency agreements and MOUs', 'goods,consultancy,works', 0, 5),
    ('CAT_EMP', 'Employment / Personnel', 'Employment and personnel contracts', 'consultancy', 0, 6),
    ('CAT_OTHER', 'Other', 'Other category (Works only - requires justification)', 'works', 1, 99)
) AS source (CategoryCode, CategoryName, Description, ApplicableNatures, RequiresJustification, DisplayOrder)
ON target.CategoryCode = source.CategoryCode
WHEN MATCHED THEN
    UPDATE SET 
        CategoryName = source.CategoryName,
        Description = source.Description,
        ApplicableNatures = source.ApplicableNatures,
        RequiresJustification = source.RequiresJustification,
        DisplayOrder = source.DisplayOrder
WHEN NOT MATCHED THEN
    INSERT (CategoryCode, CategoryName, Description, ApplicableNatures, RequiresJustification, IsActive, DisplayOrder)
    VALUES (source.CategoryCode, source.CategoryName, source.Description, source.ApplicableNatures, source.RequiresJustification, 1, source.DisplayOrder);

-- =============================================
-- PART 3: ADD/UPDATE CONTRACT INSTRUMENTS (From Appendix A & C)
-- =============================================

MERGE INTO dbo.LookupContractInstruments AS target
USING (VALUES 
    -- Goods Instruments
    ('GDS', 'Goods', 'Standard goods supply contract', 'goods', 1),
    ('UNI', 'Uniforms', 'Uniforms supply contract', 'goods', 2),
    
    -- Consultancy/Services Instruments
    ('CLEAN', 'Cleaning Services', 'Cleaning services contract', 'consultancy', 10),
    ('CONS_CO', 'Consultancy - Company', 'Consultancy contract with company', 'consultancy', 11),
    ('CONS_IND', 'Consultant/Independent Contractor', 'Independent contractor agreement', 'consultancy', 12),
    ('IC', 'Individual Consultant', 'Individual consultant contract', 'consultancy', 13),
    ('IC_IDB', 'Individual Consultant (IDB-funded)', 'IDB-funded individual consultant contract', 'consultancy', 14),
    ('SVC', 'Services', 'General services contract', 'consultancy', 15),
    
    -- Works Instruments
    ('WKS', 'Works', 'Standard works/construction contract', 'works', 20),
    
    -- Other (all natures)
    ('OTHER', 'Other', 'Other instrument type (requires ContractSubType)', 'goods,consultancy,works', 99)
) AS source (InstrumentCode, InstrumentName, Description, ApplicableNatures, DisplayOrder)
ON target.InstrumentCode = source.InstrumentCode
WHEN MATCHED THEN
    UPDATE SET 
        InstrumentName = source.InstrumentName,
        Description = source.Description,
        ApplicableNatures = source.ApplicableNatures,
        DisplayOrder = source.DisplayOrder
WHEN NOT MATCHED THEN
    INSERT (InstrumentCode, InstrumentName, Description, ApplicableNatures, IsActive, DisplayOrder)
    VALUES (source.InstrumentCode, source.InstrumentName, source.Description, source.ApplicableNatures, 1, source.DisplayOrder);

-- =============================================
-- PART 4: CLEAR AND REBUILD DOCUMENT REQUIREMENTS MATRIX
-- This implements the complete matrix from Appendix C
-- =============================================

-- First, delete existing records to rebuild fresh
DELETE FROM dbo.ContractDocumentRequirements;

-- =============================================
-- GOODS - CAT_PROC - GDS (Goods)
-- =============================================
INSERT INTO dbo.ContractDocumentRequirements 
    (DocumentTypeId, ContractNatureId, ContractCategoryId, ContractInstrumentId, IsRequired, IsConditional, ConditionDescription, DisplayOrder, HelpText)
SELECT 
    dt.DocumentTypeId,
    cn.ContractNatureId,
    cc.CategoryId,
    ci.InstrumentId,
    CASE WHEN dt.DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_SPECS', 'PROC_TENDER') THEN 1 ELSE 0 END,
    CASE WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 1 ELSE 0 END,
    CASE 
        WHEN dt.DocumentTypeCode = 'FORM_DRAFT' THEN 'If applicable - Draft contract may be supplied; SGC will generate authoritative draft'
        WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 'Required when using Single Source Procurement'
        ELSE NULL 
    END,
    dt.DisplayOrder,
    CASE 
        WHEN dt.DocumentTypeCode = 'FORM_ACCEPT' THEN 'Acceptance of award'
        WHEN dt.DocumentTypeCode = 'FORM_LOA' THEN 'Letter of award'
        WHEN dt.DocumentTypeCode = 'FORM_PAY_SCHED' THEN 'Payment schedule'
        WHEN dt.DocumentTypeCode = 'PROC_SPECS' THEN 'Specifications of goods - detailed description and quantity'
        WHEN dt.DocumentTypeCode = 'PROC_TENDER' THEN 'Tender/quotation documents'
        ELSE dt.Description
    END
FROM dbo.LookupContractDocumentTypes dt
CROSS JOIN dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cn.NatureCode = 'GOODS'
  AND cc.CategoryCode = 'CAT_PROC'
  AND ci.InstrumentCode = 'GDS'
  AND dt.DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_DRAFT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_SPECS', 'PROC_SSP_REQ', 'PROC_SSP_APPR', 'PROC_TENDER');

-- =============================================
-- GOODS - CAT_PROC - UNI (Uniforms)
-- Same documents as GDS
-- =============================================
INSERT INTO dbo.ContractDocumentRequirements 
    (DocumentTypeId, ContractNatureId, ContractCategoryId, ContractInstrumentId, IsRequired, IsConditional, ConditionDescription, DisplayOrder, HelpText)
SELECT 
    dt.DocumentTypeId,
    cn.ContractNatureId,
    cc.CategoryId,
    ci.InstrumentId,
    CASE WHEN dt.DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_SPECS', 'PROC_TENDER') THEN 1 ELSE 0 END,
    CASE WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 1 ELSE 0 END,
    CASE 
        WHEN dt.DocumentTypeCode = 'FORM_DRAFT' THEN 'If applicable'
        WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 'Required when using Single Source Procurement'
        ELSE NULL 
    END,
    dt.DisplayOrder,
    dt.Description
FROM dbo.LookupContractDocumentTypes dt
CROSS JOIN dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cn.NatureCode = 'GOODS'
  AND cc.CategoryCode = 'CAT_PROC'
  AND ci.InstrumentCode = 'UNI'
  AND dt.DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_DRAFT', 'FORM_LOA', 'FORM_PAY_SCHED', 'PROC_SPECS', 'PROC_SSP_REQ', 'PROC_SSP_APPR', 'PROC_TENDER');

-- =============================================
-- CONSULTANCY/SERVICES - Full Document Set
-- Applies to: CLEAN, SVC, CONS_CO, CONS_IND, IC, IC_IDB
-- =============================================

-- Create a temp table with all consultancy instruments
DECLARE @ConsultancyInstruments TABLE (InstrumentCode NVARCHAR(50));
INSERT INTO @ConsultancyInstruments VALUES ('CLEAN'), ('SVC'), ('CONS_CO'), ('CONS_IND'), ('IC'), ('IC_IDB');

-- Insert for each consultancy instrument
INSERT INTO dbo.ContractDocumentRequirements 
    (DocumentTypeId, ContractNatureId, ContractCategoryId, ContractInstrumentId, IsRequired, IsConditional, ConditionDescription, RequiredForSingleSource, DisplayOrder, HelpText)
SELECT 
    dt.DocumentTypeId,
    cn.ContractNatureId,
    cc.CategoryId,
    ci.InstrumentId,
    -- Always Required
    CASE WHEN dt.DocumentTypeCode IN ('FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'FORM_SCHED_DELIV', 'PROC_PROP', 'PROC_TENDER', 'PROC_TOR') THEN 1 ELSE 0 END,
    -- Conditional
    CASE WHEN dt.DocumentTypeCode IN ('PROC_CAB_PAPER', 'PROC_CAB_APPR', 'DUE_BUS_REG', 'DUE_GS', 'DUE_INCORP', 'FIN_BOND', 'FIN_SURETY', 'FORM_DRAFT', 'FORM_LOE') THEN 1 ELSE 0 END,
    -- Condition Description
    CASE 
        WHEN dt.DocumentTypeCode IN ('DUE_BUS_REG') THEN 'Business registration (as applicable)'
        WHEN dt.DocumentTypeCode IN ('DUE_GS', 'DUE_INCORP') THEN 'Required for companies only'
        WHEN dt.DocumentTypeCode IN ('FIN_BOND', 'FIN_SURETY') THEN 'Where required by contract terms'
        WHEN dt.DocumentTypeCode IN ('PROC_CAB_PAPER', 'PROC_CAB_APPR') THEN 'Required when contract value exceeds Cabinet threshold'
        WHEN dt.DocumentTypeCode = 'FORM_DRAFT' THEN 'Draft contract may be supplied; SGC will generate authoritative draft'
        WHEN dt.DocumentTypeCode = 'FORM_LOE' THEN 'Used where engagement is by letter of engagement'
        ELSE NULL 
    END,
    -- Required for Single Source
    CASE WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 1 ELSE 0 END,
    dt.DisplayOrder,
    dt.Description
FROM dbo.LookupContractDocumentTypes dt
CROSS JOIN dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cn.NatureCode = 'CONSULTANCY'
  AND cc.CategoryCode IN ('CAT_PROC', 'CAT_CONS')
  AND ci.InstrumentCode IN (SELECT InstrumentCode FROM @ConsultancyInstruments)
  AND dt.DocumentTypeCode IN (
    'DUE_BUS_REG', 'DUE_GS', 'DUE_INCORP', 'FIN_BOND', 'FIN_SURETY',
    'FORM_ACCEPT', 'FORM_DRAFT', 'FORM_LOA', 'FORM_LOE', 'FORM_PAY_SCHED', 'FORM_SCHED_DELIV',
    'PROC_CAB_APPR', 'PROC_CAB_PAPER', 'PROC_PROP', 'PROC_SSP_APPR', 'PROC_SSP_REQ', 'PROC_TENDER', 'PROC_TOR'
  );

-- =============================================
-- WORKS - CAT_CONST - WKS (Works)
-- =============================================
INSERT INTO dbo.ContractDocumentRequirements 
    (DocumentTypeId, ContractNatureId, ContractCategoryId, ContractInstrumentId, IsRequired, IsConditional, ConditionDescription, RequiredForSingleSource, DisplayOrder, HelpText)
SELECT 
    dt.DocumentTypeId,
    cn.ContractNatureId,
    cc.CategoryId,
    ci.InstrumentId,
    -- Always Required for Works (per Appendix C)
    CASE WHEN dt.DocumentTypeCode IN ('DUE_BUS_REG', 'DUE_GS', 'DUE_INCORP', 'FORM_ACCEPT', 'FORM_LOA', 'FORM_PAY_SCHED', 'FORM_SCHED_WORKS', 'PROC_PROP', 'PROC_SCOPE', 'PROC_TENDER') THEN 1 ELSE 0 END,
    -- Conditional
    CASE WHEN dt.DocumentTypeCode IN ('FIN_BOND', 'FIN_SURETY', 'FORM_DRAFT', 'PROC_CAB_PAPER', 'PROC_CAB_APPR') THEN 1 ELSE 0 END,
    -- Condition Description
    CASE 
        WHEN dt.DocumentTypeCode IN ('FIN_BOND', 'FIN_SURETY') THEN 'Where required by contract terms'
        WHEN dt.DocumentTypeCode IN ('PROC_CAB_PAPER', 'PROC_CAB_APPR') THEN 'Required when contract value exceeds Cabinet threshold'
        WHEN dt.DocumentTypeCode = 'FORM_DRAFT' THEN 'Draft contract may be supplied by Ministry; SGC will generate authoritative draft'
        ELSE NULL 
    END,
    -- Required for Single Source
    CASE WHEN dt.DocumentTypeCode IN ('PROC_SSP_REQ', 'PROC_SSP_APPR') THEN 1 ELSE 0 END,
    dt.DisplayOrder,
    CASE 
        WHEN dt.DocumentTypeCode = 'DUE_BUS_REG' THEN 'Proof of registration of business'
        WHEN dt.DocumentTypeCode = 'DUE_GS' THEN 'Certificate of good standing'
        WHEN dt.DocumentTypeCode = 'DUE_INCORP' THEN 'Company incorporation documents'
        WHEN dt.DocumentTypeCode = 'FORM_ACCEPT' THEN 'Acceptance of award by contractor'
        WHEN dt.DocumentTypeCode = 'FORM_LOA' THEN 'Letter of award issued by Ministry/Department'
        WHEN dt.DocumentTypeCode = 'FORM_PAY_SCHED' THEN 'Payment schedule'
        WHEN dt.DocumentTypeCode = 'FORM_SCHED_WORKS' THEN 'Schedule of works/completion schedule'
        WHEN dt.DocumentTypeCode = 'PROC_PROP' THEN 'Tender/proposal submission as part of award package'
        WHEN dt.DocumentTypeCode = 'PROC_SCOPE' THEN 'Scope of works required for works contract'
        WHEN dt.DocumentTypeCode = 'PROC_TENDER' THEN 'Award package should include tender documents (or equivalent)'
        ELSE dt.Description
    END
FROM dbo.LookupContractDocumentTypes dt
CROSS JOIN dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cn.NatureCode = 'WORKS'
  AND cc.CategoryCode = 'CAT_CONST'
  AND ci.InstrumentCode = 'WKS'
  AND dt.DocumentTypeCode IN (
    'DUE_BUS_REG', 'DUE_GS', 'DUE_INCORP', 'FIN_BOND', 'FIN_SURETY',
    'FORM_ACCEPT', 'FORM_DRAFT', 'FORM_LOA', 'FORM_PAY_SCHED', 'FORM_SCHED_WORKS',
    'PROC_CAB_APPR', 'PROC_CAB_PAPER', 'PROC_PROP', 'PROC_SCOPE', 'PROC_SSP_APPR', 'PROC_SSP_REQ', 'PROC_TENDER'
  );

-- =============================================
-- PART 5: NATURE -> CATEGORY VALIDATION TABLE
-- Implements validation rules from Appendix A
-- =============================================

-- Drop if exists and recreate
IF OBJECT_ID('dbo.NatureCategoryValidation', 'U') IS NOT NULL DROP TABLE dbo.NatureCategoryValidation;

CREATE TABLE dbo.NatureCategoryValidation (
    ValidationId INT IDENTITY(1,1) PRIMARY KEY,
    ContractNatureId INT NOT NULL,
    ContractCategoryId INT NOT NULL,
    IsAllowed BIT NOT NULL DEFAULT 1,
    Notes NVARCHAR(500) NULL,
    
    CONSTRAINT FK_NatCatVal_Nature FOREIGN KEY (ContractNatureId) REFERENCES dbo.LookupContractNature(ContractNatureId),
    CONSTRAINT FK_NatCatVal_Category FOREIGN KEY (ContractCategoryId) REFERENCES dbo.LookupContractCategories(CategoryId),
    CONSTRAINT UQ_NatureCategoryValidation UNIQUE (ContractNatureId, ContractCategoryId)
);

-- Populate validation rules from Appendix A
-- GOODS allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 1, 'Allowed for Goods'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'GOODS'
  AND cc.CategoryCode IN ('CAT_PROC', 'CAT_LEASE', 'CAT_INTER');

-- GOODS not allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 0, 'Not allowed for Goods contracts'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'GOODS'
  AND cc.CategoryCode IN ('CAT_CONS', 'CAT_CONST', 'CAT_EMP', 'CAT_OTHER');

-- CONSULTANCY allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 1, 'Allowed for Consultancy/Services'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'CONSULTANCY'
  AND cc.CategoryCode IN ('CAT_CONS', 'CAT_PROC', 'CAT_EMP', 'CAT_INTER');

-- CONSULTANCY not allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 0, 'Not allowed for Consultancy - prefer classify as Works if truly hybrid'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'CONSULTANCY'
  AND cc.CategoryCode IN ('CAT_CONST', 'CAT_LEASE', 'CAT_OTHER');

-- WORKS allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 1, 'Allowed for Works'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'WORKS'
  AND cc.CategoryCode IN ('CAT_CONST', 'CAT_PROC', 'CAT_INTER', 'CAT_OTHER');

-- WORKS not allowed categories
INSERT INTO dbo.NatureCategoryValidation (ContractNatureId, ContractCategoryId, IsAllowed, Notes)
SELECT cn.ContractNatureId, cc.CategoryId, 0, 'Not allowed for Works contracts'
FROM dbo.LookupContractNature cn
CROSS JOIN dbo.LookupContractCategories cc
WHERE cn.NatureCode = 'WORKS'
  AND cc.CategoryCode IN ('CAT_CONS', 'CAT_EMP', 'CAT_LEASE');

-- =============================================
-- PART 6: CATEGORY -> INSTRUMENT VALIDATION TABLE
-- =============================================

IF OBJECT_ID('dbo.CategoryInstrumentValidation', 'U') IS NOT NULL DROP TABLE dbo.CategoryInstrumentValidation;

CREATE TABLE dbo.CategoryInstrumentValidation (
    ValidationId INT IDENTITY(1,1) PRIMARY KEY,
    ContractCategoryId INT NOT NULL,
    ContractInstrumentId INT NOT NULL,
    IsAllowed BIT NOT NULL DEFAULT 1,
    Notes NVARCHAR(500) NULL,
    
    CONSTRAINT FK_CatInstVal_Category FOREIGN KEY (ContractCategoryId) REFERENCES dbo.LookupContractCategories(CategoryId),
    CONSTRAINT FK_CatInstVal_Instrument FOREIGN KEY (ContractInstrumentId) REFERENCES dbo.LookupContractInstruments(InstrumentId),
    CONSTRAINT UQ_CategoryInstrumentValidation UNIQUE (ContractCategoryId, ContractInstrumentId)
);

-- Populate: CAT_PROC can use GDS, UNI, CLEAN, SVC
INSERT INTO dbo.CategoryInstrumentValidation (ContractCategoryId, ContractInstrumentId, IsAllowed, Notes)
SELECT cc.CategoryId, ci.InstrumentId, 1, 'Allowed for Procurement category'
FROM dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cc.CategoryCode = 'CAT_PROC'
  AND ci.InstrumentCode IN ('GDS', 'UNI', 'CLEAN', 'SVC', 'OTHER');

-- Populate: CAT_CONS can use consultancy instruments
INSERT INTO dbo.CategoryInstrumentValidation (ContractCategoryId, ContractInstrumentId, IsAllowed, Notes)
SELECT cc.CategoryId, ci.InstrumentId, 1, 'Allowed for Consultancy category'
FROM dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cc.CategoryCode = 'CAT_CONS'
  AND ci.InstrumentCode IN ('CONS_CO', 'CONS_IND', 'IC', 'IC_IDB', 'OTHER');

-- Populate: CAT_CONST can use works instruments
INSERT INTO dbo.CategoryInstrumentValidation (ContractCategoryId, ContractInstrumentId, IsAllowed, Notes)
SELECT cc.CategoryId, ci.InstrumentId, 1, 'Allowed for Construction category'
FROM dbo.LookupContractCategories cc
CROSS JOIN dbo.LookupContractInstruments ci
WHERE cc.CategoryCode = 'CAT_CONST'
  AND ci.InstrumentCode IN ('WKS', 'OTHER');

-- =============================================
-- PART 7: STORED PROCEDURE FOR VALIDATING SELECTIONS
-- =============================================

IF OBJECT_ID('dbo.sp_ValidateContractClassification', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_ValidateContractClassification;
GO

CREATE PROCEDURE dbo.sp_ValidateContractClassification
    @NatureCode NVARCHAR(50),
    @CategoryCode NVARCHAR(50),
    @InstrumentCode NVARCHAR(50) = NULL,
    @IsValid BIT OUTPUT,
    @ValidationMessage NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NatureId INT, @CategoryId INT, @InstrumentId INT;
    DECLARE @NatureCategoryAllowed BIT, @CategoryInstrumentAllowed BIT;
    
    -- Get IDs
    SELECT @NatureId = ContractNatureId FROM dbo.LookupContractNature WHERE NatureCode = @NatureCode;
    SELECT @CategoryId = CategoryId FROM dbo.LookupContractCategories WHERE CategoryCode = @CategoryCode;
    SELECT @InstrumentId = InstrumentId FROM dbo.LookupContractInstruments WHERE InstrumentCode = @InstrumentCode;
    
    -- Check Nature -> Category
    SELECT @NatureCategoryAllowed = IsAllowed 
    FROM dbo.NatureCategoryValidation 
    WHERE ContractNatureId = @NatureId AND ContractCategoryId = @CategoryId;
    
    IF @NatureCategoryAllowed IS NULL OR @NatureCategoryAllowed = 0
    BEGIN
        SET @IsValid = 0;
        SET @ValidationMessage = 'Category "' + @CategoryCode + '" is not allowed for Nature "' + @NatureCode + '"';
        RETURN;
    END
    
    -- Check Category -> Instrument (if provided)
    IF @InstrumentCode IS NOT NULL
    BEGIN
        SELECT @CategoryInstrumentAllowed = IsAllowed 
        FROM dbo.CategoryInstrumentValidation 
        WHERE ContractCategoryId = @CategoryId AND ContractInstrumentId = @InstrumentId;
        
        IF @CategoryInstrumentAllowed IS NULL OR @CategoryInstrumentAllowed = 0
        BEGIN
            SET @IsValid = 0;
            SET @ValidationMessage = 'Instrument "' + @InstrumentCode + '" is not allowed for Category "' + @CategoryCode + '"';
            RETURN;
        END
    END
    
    SET @IsValid = 1;
    SET @ValidationMessage = 'Valid classification';
END;
GO

-- =============================================
-- PART 8: VIEW FOR DOCUMENT CHECKLIST
-- =============================================

IF OBJECT_ID('dbo.vw_ContractDocumentChecklist', 'V') IS NOT NULL DROP VIEW dbo.vw_ContractDocumentChecklist;
GO

CREATE VIEW dbo.vw_ContractDocumentChecklist AS
SELECT 
    cdr.RequirementId,
    cn.NatureCode,
    cn.NatureName,
    cc.CategoryCode,
    cc.CategoryName,
    ci.InstrumentCode,
    ci.InstrumentName,
    dt.DocumentTypeCode,
    dt.DocumentTypeName,
    CASE 
        WHEN cdr.IsRequired = 1 THEN 'Required'
        WHEN cdr.RequiredForSingleSource = 1 THEN 'Required for Single Source'
        WHEN cdr.IsConditional = 1 THEN 'Conditional'
        ELSE 'Optional'
    END AS RequirementLevel,
    cdr.IsRequired,
    cdr.IsConditional,
    cdr.RequiredForSingleSource,
    cdr.ConditionDescription,
    cdr.HelpText,
    cdr.DisplayOrder
FROM dbo.ContractDocumentRequirements cdr
    INNER JOIN dbo.LookupContractDocumentTypes dt ON cdr.DocumentTypeId = dt.DocumentTypeId
    INNER JOIN dbo.LookupContractNature cn ON cdr.ContractNatureId = cn.ContractNatureId
    INNER JOIN dbo.LookupContractCategories cc ON cdr.ContractCategoryId = cc.CategoryId
    INNER JOIN dbo.LookupContractInstruments ci ON cdr.ContractInstrumentId = ci.InstrumentId
WHERE cdr.IsActive = 1
    AND dt.IsActive = 1;
GO

-- =============================================
-- PART 9: SUMMARY VIEW FOR REQUIREMENTS BY COMBINATION
-- =============================================

IF OBJECT_ID('dbo.vw_DocumentRequirementsSummary', 'V') IS NOT NULL DROP VIEW dbo.vw_DocumentRequirementsSummary;
GO

CREATE VIEW dbo.vw_DocumentRequirementsSummary AS
SELECT 
    cn.NatureCode,
    cc.CategoryCode,
    ci.InstrumentCode,
    COUNT(*) AS TotalDocuments,
    SUM(CASE WHEN cdr.IsRequired = 1 THEN 1 ELSE 0 END) AS RequiredCount,
    SUM(CASE WHEN cdr.IsConditional = 1 THEN 1 ELSE 0 END) AS ConditionalCount,
    SUM(CASE WHEN cdr.RequiredForSingleSource = 1 THEN 1 ELSE 0 END) AS SingleSourceCount,
    SUM(CASE WHEN cdr.IsRequired = 0 AND cdr.IsConditional = 0 AND cdr.RequiredForSingleSource = 0 THEN 1 ELSE 0 END) AS OptionalCount
FROM dbo.ContractDocumentRequirements cdr
    INNER JOIN dbo.LookupContractNature cn ON cdr.ContractNatureId = cn.ContractNatureId
    INNER JOIN dbo.LookupContractCategories cc ON cdr.ContractCategoryId = cc.CategoryId
    INNER JOIN dbo.LookupContractInstruments ci ON cdr.ContractInstrumentId = ci.InstrumentId
WHERE cdr.IsActive = 1
GROUP BY cn.NatureCode, cc.CategoryCode, ci.InstrumentCode;
GO

PRINT 'Appendix C Document Requirements Matrix created successfully';
PRINT 'Total Nature-Category-Instrument combinations configured';
