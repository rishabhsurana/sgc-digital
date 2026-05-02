/*
  Add entity_id to contract_register and correspondence_register (denormalized from parent submissions).
  Backfill from contracts.entity_id / correspondences.entity_id.

  Idempotent: skips columns / indexes that already exist.
*/

SET NOCOUNT ON;

IF COL_LENGTH('dbo.contract_register', 'entity_id') IS NULL
BEGIN
  ALTER TABLE dbo.contract_register ADD entity_id UNIQUEIDENTIFIER NULL;
END;

IF COL_LENGTH('dbo.correspondence_register', 'entity_id') IS NULL
BEGIN
  ALTER TABLE dbo.correspondence_register ADD entity_id UNIQUEIDENTIFIER NULL;
END;

UPDATE cr
SET cr.entity_id = c.entity_id
FROM dbo.contract_register cr
INNER JOIN dbo.contracts c ON c.id = cr.contract_id
WHERE cr.entity_id IS NULL AND c.entity_id IS NOT NULL;

UPDATE reg
SET reg.entity_id = corr.entity_id
FROM dbo.correspondence_register reg
INNER JOIN dbo.correspondences corr ON corr.id = reg.correspondence_id
WHERE reg.entity_id IS NULL AND corr.entity_id IS NOT NULL;

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = N'IX_contract_register_entity_id' AND object_id = OBJECT_ID(N'dbo.contract_register')
)
BEGIN
  CREATE NONCLUSTERED INDEX IX_contract_register_entity_id ON dbo.contract_register (entity_id);
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes WHERE name = N'IX_correspondence_register_entity_id' AND object_id = OBJECT_ID(N'dbo.correspondence_register')
)
BEGIN
  CREATE NONCLUSTERED INDEX IX_correspondence_register_entity_id ON dbo.correspondence_register (entity_id);
END;
