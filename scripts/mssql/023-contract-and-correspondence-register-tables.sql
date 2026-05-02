/*
  Creates register tables expected by Sequelize models:
  - ContractRegister   -> dbo.contract_register
  - CorrespondenceRegister -> dbo.correspondence_register

  Fixes errors such as:
  - Invalid object name 'contract_register'
  - Invalid column name 'register_id' (if an older PascalCase table existed instead)

  Idempotent: only creates a table if it does not exist.
  Requires: dbo.contracts(id), dbo.correspondences(id) as UNIQUEIDENTIFIER PKs.
*/

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.contract_register', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.contract_register (
    register_id           BIGINT         NOT NULL IDENTITY(1, 1) PRIMARY KEY,
    contract_id           UNIQUEIDENTIFIER NOT NULL,
    entity_id               UNIQUEIDENTIFIER NULL,
    contract_number       NVARCHAR(50)   NOT NULL,
    date_received         DATETIME2      NOT NULL,
    date_completed        DATETIME2      NULL,
    current_status_code   NVARCHAR(50)   NOT NULL,
    current_stage_code    NVARCHAR(50)   NULL,
    subject               NVARCHAR(500)  NULL,
    originating_mda       NVARCHAR(255)  NULL,
    nature_of_contract    NVARCHAR(100)  NULL,
    category              NVARCHAR(255)  NULL,
    contract_type         NVARCHAR(50)   NULL,
    contractor_name       NVARCHAR(255)  NULL,
    contract_value        DECIMAL(18, 2) NULL,
    contract_currency     NVARCHAR(10)   NULL,
    submitted_by_name     NVARCHAR(255)  NULL,
    submitted_by_email    NVARCHAR(255)  NULL,
    submitted_by_phone    NVARCHAR(50)   NULL,
    submitted_by_position NVARCHAR(255)  NULL,
    document_count        INT            NULL,
    CONSTRAINT UQ_contract_register_contract_id UNIQUE (contract_id),
    CONSTRAINT UQ_contract_register_contract_number UNIQUE (contract_number),
    CONSTRAINT FK_contract_register_contract
      FOREIGN KEY (contract_id) REFERENCES dbo.contracts (id)
  );
  CREATE NONCLUSTERED INDEX IX_contract_register_contract_id
    ON dbo.contract_register (contract_id);
  CREATE NONCLUSTERED INDEX IX_contract_register_entity_id
    ON dbo.contract_register (entity_id);
END;

IF OBJECT_ID(N'dbo.correspondence_register', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.correspondence_register (
    register_id            BIGINT         NOT NULL IDENTITY(1, 1) PRIMARY KEY,
    correspondence_id      UNIQUEIDENTIFIER NOT NULL,
    entity_id               UNIQUEIDENTIFIER NULL,
    reference_number       NVARCHAR(50)   NOT NULL,
    date_received          DATETIME2      NOT NULL,
    date_completed         DATETIME2      NULL,
    current_status_code    NVARCHAR(50)   NOT NULL,
    current_stage_code     NVARCHAR(50)   NULL,
    correspondence_type    NVARCHAR(100)  NULL,
    subject                NVARCHAR(500)  NULL,
    originating_mda        NVARCHAR(255)  NULL,
    priority_level         NVARCHAR(20)   NULL,
    submitter_name         NVARCHAR(255)  NULL,
    submitter_email        NVARCHAR(255)  NULL,
    submitter_phone        NVARCHAR(50)   NULL,
    document_count         INT            NULL,
    CONSTRAINT UQ_correspondence_register_correspondence_id UNIQUE (correspondence_id),
    CONSTRAINT UQ_correspondence_register_reference_number UNIQUE (reference_number),
    CONSTRAINT FK_correspondence_register_correspondence
      FOREIGN KEY (correspondence_id) REFERENCES dbo.correspondences (id)
  );
  CREATE NONCLUSTERED INDEX IX_correspondence_register_correspondence_id
    ON dbo.correspondence_register (correspondence_id);
  CREATE NONCLUSTERED INDEX IX_correspondence_register_entity_id
    ON dbo.correspondence_register (entity_id);
END;
