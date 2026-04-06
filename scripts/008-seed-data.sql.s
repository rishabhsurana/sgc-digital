/* =========================================
   Seed lookup_departments from frontend codes
   ========================================= */
MERGE lookup_departments AS target
USING (VALUES
  ('contracts', 'Contracts Unit', NULL, 1),
  ('litigation', 'Litigation Unit', NULL, 1),
  ('advisory', 'Advisory Unit', NULL, 1),
  ('registry', 'Registry', NULL, 1),
  ('public_trustee', 'Public Trustee', NULL, 1),
  ('executive', 'Executive Office', NULL, 1),
  ('admin', 'Administration', NULL, 1)
) AS src (department_code, department_name, ministry, is_active)
ON LOWER(target.department_code) = LOWER(src.department_code)
WHEN MATCHED THEN
  UPDATE SET
    target.department_name = src.department_name,
    target.ministry = src.ministry,
    target.is_active = src.is_active
WHEN NOT MATCHED THEN
  INSERT (department_code, department_name, ministry, is_active, created_at)
  VALUES (src.department_code, src.department_name, src.ministry, src.is_active, GETDATE());

/* =========================================
   Seed lookup_user_roles from frontend codes
   ========================================= */
MERGE lookup_user_roles AS target
USING (VALUES
  ('SG', 'Solicitor General (SG)', 'Frontend management role', 1),
  ('DSG', 'Deputy Solicitor General (DSG)', 'Frontend management role', 1),
  ('LEGAL_OFFICER', 'Legal Officer', 'Frontend management role', 1),
  ('LEGAL_ASSISTANT', 'Legal Assistant', 'Frontend management role', 1),
  ('REGISTRY_CLERK', 'Registry Clerk', 'Frontend management role', 1),
  ('REGISTRY_SUPERVISOR', 'Registry Supervisor', 'Frontend management role', 1),
  ('SG_SECRETARY', 'SG Secretary', 'Frontend management role', 1),
  ('ADMIN', 'System Administrator', 'Frontend management role', 1)
) AS src (role_code, role_name, description, is_active)
ON UPPER(target.role_code) = UPPER(src.role_code)
WHEN MATCHED THEN
  UPDATE SET
    target.role_name = src.role_name,
    target.description = src.description,
    target.is_active = src.is_active
WHEN NOT MATCHED THEN
  INSERT (role_code, role_name, description, is_active, created_at)
  VALUES (src.role_code, src.role_name, src.description, src.is_active, GETDATE());









  /*
  MSSQL sequences for public transaction numbers (CON-/COR-).
  Run once per database. Safe to run on empty DB (starts at 1).

  Idempotent: creates sequences only if they do not exist.
  Seeds START WITH max(existing numeric suffix) + 1 from contracts/correspondences
  and transaction_details so new values never collide with legacy COUNT-based rows.
*/

SET NOCOUNT ON;

DECLARE @start_contract BIGINT;
DECLARE @start_corr BIGINT;

;WITH contract_nums AS (
  SELECT TRY_CAST(
    RIGHT(transaction_number, CHARINDEX('-', REVERSE(transaction_number)) - 1) AS BIGINT
  ) AS n
  FROM dbo.contracts
  WHERE transaction_number LIKE N'CON-%'
  UNION ALL
  SELECT TRY_CAST(
    RIGHT(transaction_number, CHARINDEX('-', REVERSE(transaction_number)) - 1) AS BIGINT
  )
  FROM dbo.transaction_details
  WHERE submission_type = N'contract' AND transaction_number LIKE N'CON-%'
)
SELECT @start_contract = ISNULL(MAX(n), 0) + 1 FROM contract_nums WHERE n IS NOT NULL AND n >= 0;

;WITH corr_nums AS (
  SELECT TRY_CAST(
    RIGHT(transaction_number, CHARINDEX('-', REVERSE(transaction_number)) - 1) AS BIGINT
  ) AS n
  FROM dbo.correspondences
  WHERE transaction_number LIKE N'COR-%'
  UNION ALL
  SELECT TRY_CAST(
    RIGHT(transaction_number, CHARINDEX('-', REVERSE(transaction_number)) - 1) AS BIGINT
  )
  FROM dbo.transaction_details
  WHERE submission_type = N'correspondence' AND transaction_number LIKE N'COR-%'
)
SELECT @start_corr = ISNULL(MAX(n), 0) + 1 FROM corr_nums WHERE n IS NOT NULL AND n >= 0;

IF @start_contract IS NULL OR @start_contract < 1 SET @start_contract = 1;
IF @start_corr IS NULL OR @start_corr < 1 SET @start_corr = 1;

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE object_id = OBJECT_ID(N'dbo.seq_transaction_contract', N'SO'))
BEGIN
  DECLARE @sql_c NVARCHAR(500) = N'CREATE SEQUENCE [dbo].[seq_transaction_contract] AS BIGINT START WITH ' 
    + CAST(@start_contract AS NVARCHAR(30)) 
    + N' INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 20;';
  EXEC sp_executesql @sql_c;
END;

IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE object_id = OBJECT_ID(N'dbo.seq_transaction_correspondence', N'SO'))
BEGIN
  DECLARE @sql_r NVARCHAR(500) = N'CREATE SEQUENCE [dbo].[seq_transaction_correspondence] AS BIGINT START WITH ' 
    + CAST(@start_corr AS NVARCHAR(30)) 
    + N' INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 20;';
  EXEC sp_executesql @sql_r;
END;
