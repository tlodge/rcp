-- Seed data for multi-tenant portal

-- Insert tenants
INSERT INTO "Tenant" ("id", "slug", "name", "supportEmail", "supportPhone", "paymentGatewayKey", "bankDetails", "theme")
VALUES
    ('tenant_mgmt', 'rcpmanagement', 'RCP Management', 'support@rcpmanagement.com', '020 7123 4567', 'pk_test_mgmt', 'Sort: 12-34-56, Account: 12345678', '{"primaryColor": "#2563eb", "secondaryColor": "#1e40af"}'),
    ('tenant_group', 'rcpgroup', 'RCP Group', 'support@rcpgroup.com', '020 7123 4568', 'pk_test_group', 'Sort: 12-34-56, Account: 87654321', '{"primaryColor": "#059669", "secondaryColor": "#047857"}'),
    ('tenant_prop', 'rcpproperty', 'RCP Property', 'support@rcpproperty.com', '020 7123 4569', 'pk_test_prop', 'Sort: 12-34-56, Account: 11223344', '{"primaryColor": "#dc2626", "secondaryColor": "#b91c1c"}'),
    ('tenant_ground', 'rcpgroundrent', 'RCP Ground Rent', 'support@rcpgroundrent.com', '020 7123 4570', 'pk_test_ground', 'Sort: 12-34-56, Account: 44332211', '{"primaryColor": "#7c3aed", "secondaryColor": "#6d28d9"}')
ON CONFLICT ("id") DO NOTHING;

-- Insert admin user
INSERT INTO "User" ("id", "email", "name", "defaultTenantSlug", "role")
VALUES
    ('user_admin', 'admin@example.com', 'Admin User', 'rcpmanagement', 'ADMIN')
ON CONFLICT ("email") DO NOTHING;

-- Insert demo user
INSERT INTO "User" ("id", "email", "name", "defaultTenantSlug", "role")
VALUES
    ('user_demo', 'demo@example.com', 'Demo User', 'rcpmanagement', 'USER')
ON CONFLICT ("email") DO NOTHING;

-- Insert user account links for demo user
INSERT INTO "UserAccountLink" ("id", "userId", "tenantSlug", "horizonAccountNumber", "propertyAddress")
VALUES
    ('link_1', 'user_demo', 'rcpmanagement', 'ACC001', '123 Main Street, London, SW1A 1AA'),
    ('link_2', 'user_demo', 'rcpproperty', 'ACC002', '456 Park Avenue, London, W1K 1AA')
ON CONFLICT ("id") DO NOTHING;

-- Insert form definitions
INSERT INTO "FormDefinition" ("id", "tenantSlug", "title", "description", "fields", "isActive")
VALUES
    ('form_pet', 'rcpmanagement', 'Pet Licence Application', 'Apply for permission to keep a pet in your property', '[
        {"key": "petType", "label": "Type of Pet", "type": "select", "required": true, "options": ["Dog", "Cat", "Bird", "Other"]},
        {"key": "petName", "label": "Pet Name", "type": "text", "required": true},
        {"key": "petBreed", "label": "Breed", "type": "text", "required": false},
        {"key": "reason", "label": "Reason for Request", "type": "textarea", "required": true}
    ]'::jsonb, true),
    ('form_alter', NULL, 'Request to Alter Property', 'Request permission to make alterations to your property', '[
        {"key": "alterationType", "label": "Type of Alteration", "type": "select", "required": true, "options": ["Structural", "Cosmetic", "Electrical", "Plumbing", "Other"]},
        {"key": "description", "label": "Description of Work", "type": "textarea", "required": true},
        {"key": "contractor", "label": "Contractor Name", "type": "text", "required": false},
        {"key": "startDate", "label": "Proposed Start Date", "type": "date", "required": true}
    ]'::jsonb, true)
ON CONFLICT ("id") DO NOTHING;

-- Insert tenant messages
INSERT INTO "TenantMessage" ("id", "tenantSlug", "content", "isActive")
VALUES
    ('msg_mgmt', 'rcpmanagement', 'Debit card payments are subject to limits: minimum £25, maximum £2,500 per transaction.', true),
    ('msg_group', 'rcpgroup', 'Debit card payments are subject to limits: minimum £25, maximum £2,500 per transaction.', true),
    ('msg_prop', 'rcpproperty', 'Debit card payments are subject to limits: minimum £25, maximum £2,500 per transaction.', true),
    ('msg_ground', 'rcpgroundrent', 'Debit card payments are subject to limits: minimum £25, maximum £2,500 per transaction.', true)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample balance snapshot for demo user
INSERT INTO "BalanceSnapshot" ("id", "userId", "tenantSlug", "horizonAccountNumber", "amountPence", "takenAt")
VALUES
    ('snap_1', 'user_demo', 'rcpmanagement', 'ACC001', 125000, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
