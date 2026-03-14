-- SGC Digital Seed Data
-- Run this script after creating the schema to populate initial data

-- =============================================
-- Insert MDAs (Ministries, Departments, Agencies)
-- =============================================
INSERT INTO MDAs (id, code, name, description, is_active) VALUES
(NEWID(), 'sgc', 'Solicitor General''s Chambers', 'Office of the Solicitor General of Barbados', 1),
(NEWID(), 'air-nav', 'Air Navigation Services Department', NULL, 1),
(NEWID(), 'analytical', 'Analytical Services', NULL, 1),
(NEWID(), 'bbsa', 'Barbados Building Standards Authority', NULL, 1),
(NEWID(), 'drug-service', 'Barbados Drug Service', NULL, 1),
(NEWID(), 'bgis', 'Barbados Government Information Service', NULL, 1),
(NEWID(), 'prison', 'Barbados Prison Service', NULL, 1),
(NEWID(), 'gender-affairs', 'Bureau of Gender Affairs', NULL, 1),
(NEWID(), 'central-purchasing', 'Central Purchasing Department', NULL, 1),
(NEWID(), 'children-dev', 'Children''s Development Centre', NULL, 1),
(NEWID(), 'cooperatives', 'Co-operatives Department', NULL, 1),
(NEWID(), 'czmu', 'Coastal Zone Management Unit', NULL, 1),
(NEWID(), 'community-dev', 'Community Development Department', NULL, 1),
(NEWID(), 'consular', 'Consular and Diaspora Division', NULL, 1),
(NEWID(), 'caipo', 'Corporate Affairs and Intellectual Property Office', NULL, 1),
(NEWID(), 'cjrpu', 'Criminal Justice Research and Planning Unit', NULL, 1),
(NEWID(), 'customs', 'Customs and Excise Department', NULL, 1),
(NEWID(), 'archives', 'Department of Archives', NULL, 1),
(NEWID(), 'commerce', 'Department of Commerce and Consumer Affairs', NULL, 1),
(NEWID(), 'constituency', 'Department of Constituency Empowerment', NULL, 1),
(NEWID(), 'dem', 'Department of Emergency Management', NULL, 1),
(NEWID(), 'youth-affairs', 'Division of Youth Affairs', NULL, 1),
(NEWID(), 'ebc', 'Electoral & Boundaries Commission', NULL, 1),
(NEWID(), 'epd', 'Environmental Protection Department', NULL, 1),
(NEWID(), 'fire-service', 'Fire Service Department', NULL, 1),
(NEWID(), 'fisheries', 'Fisheries Division', NULL, 1),
(NEWID(), 'forensic', 'Forensic Sciences Centre', NULL, 1),
(NEWID(), 'geed', 'Government Electrical Engineering Department', NULL, 1),
(NEWID(), 'gis', 'Government Industrial School', NULL, 1),
(NEWID(), 'gpd', 'Government Printing Department', NULL, 1),
(NEWID(), 'immigration', 'Immigration Department', NULL, 1),
(NEWID(), 'ibfs', 'International Business & Financial Services Unit', NULL, 1),
(NEWID(), 'labour', 'Labour Department', NULL, 1),
(NEWID(), 'land-registration', 'Land Registration Department', NULL, 1),
(NEWID(), 'lands-surveys', 'Lands and Surveys Department', NULL, 1),
(NEWID(), 'licensing', 'Licensing Authority', NULL, 1),
(NEWID(), 'media-resource', 'Media Resource Department', NULL, 1),
(NEWID(), 'met-office', 'Meteorological Office', NULL, 1),
(NEWID(), 'disabilities', 'National Disabilities Unit', NULL, 1),
(NEWID(), 'hiv-aids', 'National HIV/AIDS Commission', NULL, 1),
(NEWID(), 'nis', 'National Insurance Department', NULL, 1),
(NEWID(), 'library', 'National Library Service', NULL, 1),
(NEWID(), 'nutrition', 'National Nutrition Centre', NULL, 1),
(NEWID(), 'natural-heritage', 'Natural Heritage Department', NULL, 1),
(NEWID(), 'opsr', 'Office of Public Sector Reform', NULL, 1),
(NEWID(), 'auditor-general', 'Office of the Auditor General', NULL, 1),
(NEWID(), 'ombudsman', 'Office of the Ombudsman', NULL, 1),
(NEWID(), 'post-office', 'Post Office', NULL, 1),
(NEWID(), 'probation', 'Probation Department', NULL, 1),
(NEWID(), 'psychiatric', 'Psychiatric Hospital', NULL, 1),
(NEWID(), 'registration', 'Registration Department', NULL, 1),
(NEWID(), 'statistics', 'Statistical Services Department', NULL, 1),
(NEWID(), 'sports-council', 'The National Sports Council', NULL, 1),
(NEWID(), 'police', 'The Police Department', NULL, 1),
(NEWID(), 'public-markets', 'The Public Markets', NULL, 1),
(NEWID(), 'sjpi', 'The Samuel Jackman Prescod Institute of Technology', NULL, 1),
(NEWID(), 'school-meals', 'The School Meals Department', NULL, 1),
(NEWID(), 'treasury', 'Treasury Department', NULL, 1),
(NEWID(), 'welfare', 'Welfare Department', NULL, 1);
GO

-- =============================================
-- Insert Default Admin User
-- Password: Admin@123 (hashed with bcrypt)
-- You should change this password after first login
-- =============================================
DECLARE @sgc_id NVARCHAR(36);
SELECT @sgc_id = id FROM MDAs WHERE code = 'sgc';

INSERT INTO Users (id, email, password_hash, name, role, status, mda_id)
VALUES (
    NEWID(),
    'admin@sgc.gov.bb',
    -- This is a bcrypt hash of 'Admin@123' - change in production!
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.1qqHXEXvjyOXXq',
    'System Administrator',
    'super_admin',
    'active',
    @sgc_id
);
GO

PRINT 'Seed data inserted successfully!';
PRINT 'Default admin user: admin@sgc.gov.bb / Admin@123';
PRINT 'IMPORTANT: Change the admin password after first login!';
GO
