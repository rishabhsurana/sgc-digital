/*
  Support submissions/drafts created by either portal users or management users.
  - Adds submitted_by_actor_type to contracts/correspondences/draft tables.
  - Drops user_id FK constraints so user_id can store IDs from users or management_users.
*/

SET NOCOUNT ON;

IF COL_LENGTH('dbo.contracts', 'submitted_by_actor_type') IS NULL
BEGIN
  ALTER TABLE dbo.contracts
    ADD submitted_by_actor_type NVARCHAR(20) NOT NULL
      CONSTRAINT DF_contracts_submitted_by_actor_type DEFAULT N'user';
END;

IF COL_LENGTH('dbo.correspondences', 'submitted_by_actor_type') IS NULL
BEGIN
  ALTER TABLE dbo.correspondences
    ADD submitted_by_actor_type NVARCHAR(20) NOT NULL
      CONSTRAINT DF_correspondences_submitted_by_actor_type DEFAULT N'user';
END;

IF COL_LENGTH('dbo.contract_drafts', 'submitted_by_actor_type') IS NULL
BEGIN
  ALTER TABLE dbo.contract_drafts
    ADD submitted_by_actor_type NVARCHAR(20) NOT NULL
      CONSTRAINT DF_contract_drafts_submitted_by_actor_type DEFAULT N'user';
END;

IF COL_LENGTH('dbo.correspondence_drafts', 'submitted_by_actor_type') IS NULL
BEGIN
  ALTER TABLE dbo.correspondence_drafts
    ADD submitted_by_actor_type NVARCHAR(20) NOT NULL
      CONSTRAINT DF_correspondence_drafts_submitted_by_actor_type DEFAULT N'user';
END;

DECLARE @sql NVARCHAR(MAX) = N'';

;WITH fk_to_drop AS (
  SELECT fk.name AS fk_name, OBJECT_NAME(fk.parent_object_id) AS table_name
  FROM sys.foreign_keys fk
  WHERE OBJECT_NAME(fk.parent_object_id) IN (
    N'contracts', N'correspondences', N'contract_drafts', N'correspondence_drafts'
  )
    AND EXISTS (
      SELECT 1
      FROM sys.foreign_key_columns fkc
      INNER JOIN sys.columns c
        ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
      WHERE fkc.constraint_object_id = fk.object_id
        AND c.name = N'user_id'
    )
)
SELECT @sql = @sql +
  N'ALTER TABLE dbo.' + QUOTENAME(table_name) +
  N' DROP CONSTRAINT ' + QUOTENAME(fk_name) + N';' + CHAR(10)
FROM fk_to_drop;

IF LEN(@sql) > 0
BEGIN
  EXEC sp_executesql @sql;
END;

