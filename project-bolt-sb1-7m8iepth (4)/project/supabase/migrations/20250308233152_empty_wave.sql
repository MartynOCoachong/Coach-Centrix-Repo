/*
  # Authentication and Role Hierarchy Setup

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique) - role name (admin, association_admin, coach)
      - `description` (text) - role description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique) - permission name
      - `description` (text) - permission description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `role_permissions`
      - `role_id` (uuid, foreign key to roles)
      - `permission_id` (uuid, foreign key to permissions)
      - Primary key is (role_id, permission_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for association admin access
    - Add policies for coach access

  3. Changes
    - Add role column to profiles table
    - Set martynocoaching@gmail.com as admin
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Add role_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES roles(id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_updated_at'
  ) THEN
    CREATE TRIGGER update_roles_updated_at
      BEFORE UPDATE ON roles
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_permissions_updated_at'
  ) THEN
    CREATE TRIGGER update_permissions_updated_at
      BEFORE UPDATE ON permissions
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Super admin with full platform access'),
('association_admin', 'Association administrator with access to manage their association'),
('coach', 'Coach with access to training materials and their teams')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
('manage_platform', 'Full platform management access'),
('manage_associations', 'Create, edit, and delete associations'),
('view_all_data', 'Access to all platform data'),
('manage_association', 'Manage single association'),
('manage_teams', 'Manage teams within association'),
('access_training', 'Access training materials'),
('manage_players', 'Manage player profiles')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
WITH 
  admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
  assoc_admin_role AS (SELECT id FROM roles WHERE name = 'association_admin'),
  coach_role AS (SELECT id FROM roles WHERE name = 'coach'),
  permissions_data AS (
    SELECT id, name FROM permissions
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  admin_role.id,
  permissions_data.id
FROM admin_role, permissions_data
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Association admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  assoc_admin_role.id,
  permissions_data.id
FROM 
  (SELECT id FROM roles WHERE name = 'association_admin') assoc_admin_role,
  (SELECT id FROM permissions WHERE name IN (
    'manage_association',
    'manage_teams',
    'access_training',
    'manage_players'
  )) permissions_data
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Coach permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  coach_role.id,
  permissions_data.id
FROM 
  (SELECT id FROM roles WHERE name = 'coach') coach_role,
  (SELECT id FROM permissions WHERE name IN (
    'access_training',
    'manage_players'
  )) permissions_data
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Set admin role for martynocoaching@gmail.com
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'martynocoaching@gmail.com';

-- RLS Policies

-- Roles table policies
CREATE POLICY "Admin full access on roles"
ON roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

-- Permissions table policies
CREATE POLICY "Admin full access on permissions"
ON permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

-- Role permissions table policies
CREATE POLICY "Admin full access on role_permissions"
ON role_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

-- Profiles policies update
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);

CREATE POLICY "Admin can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin')
  )
);