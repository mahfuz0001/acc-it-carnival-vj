-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#F7374F',
  secondary_color VARCHAR(7) DEFAULT '#B267FF',
  accent_color VARCHAR(7) DEFAULT '#6ba348',
  background_color VARCHAR(7) DEFAULT '#0a0612',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  custom_css TEXT,
  custom_domain VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  plan_type VARCHAR(20) DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_customizations table for flexible content
CREATE TABLE IF NOT EXISTS tenant_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- 'hero', 'about', 'footer', etc.
  key VARCHAR(100) NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, section, key)
);

-- Add tenant_id to existing tables
ALTER TABLE events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_customizations_tenant_id ON tenant_customizations(tenant_id);

-- Insert default tenant for existing data
INSERT INTO tenants (
  subdomain, 
  name, 
  description,
  primary_color,
  secondary_color,
  accent_color
) VALUES (
  'acc-it-carnival',
  'ACC IT Carnival 4.0',
  'The biggest IT event of the year',
  '#F7374F',
  '#B267FF',
  '#6ba348'
) ON CONFLICT (subdomain) DO NOTHING;

-- Update existing events to belong to default tenant
UPDATE events 
SET tenant_id = (SELECT id FROM tenants WHERE subdomain = 'acc-it-carnival' LIMIT 1)
WHERE tenant_id IS NULL;
