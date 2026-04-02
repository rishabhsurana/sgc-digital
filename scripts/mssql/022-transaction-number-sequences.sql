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
