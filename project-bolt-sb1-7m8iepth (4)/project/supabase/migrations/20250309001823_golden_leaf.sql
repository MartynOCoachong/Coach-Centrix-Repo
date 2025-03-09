/*
  # Fix Role Policies

  1. Changes
    - Remove recursive policies
    - Implement non-recursive role checks
    - Fix profile policies
    - Add admin role assignment

  2. Security
    - Maintain RLS security
    - Ensure proper access control
    - Fix infinite recursion in role policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin read access on roles" ON roles;
DROP POLICY IF EXISTS "Admin write access on roles" ON roles;
DROP POLICY IF EXISTS "Admin access on permissions" ON permissions;
DROP POLICY IF EXISTS "Admin access on role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;

-- Create new non-recursive policies for roles
CREATE POLICY "Enable read access for authenticated users"
ON roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for admin users"
ON roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
);

-- Policies for permissions table
CREATE POLICY "Enable read access for authenticated users"
ON permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for admin users"
ON permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
);

-- Policies for role_permissions table
CREATE POLICY "Enable read access for authenticated users"
ON role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for admin users"
ON role_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
);

-- Updated profiles policies
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM roles
    WHERE roles.id = profiles.role_id
    AND roles.name = 'admin'
  )
);

CREATE POLICY "Admin can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM roles
    WHERE roles.id = profiles.role_id
    AND roles.name = 'admin'
  )
);

-- Ensure admin role exists and set it for martynocoaching@gmail.com
DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  -- Get or create admin role
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  IF admin_role_id IS NULL THEN
    INSERT INTO roles (name, description)
    VALUES ('admin', 'Super admin with full platform access')
    RETURNING id INTO admin_role_id;
  END IF;

  -- Update martynocoaching@gmail.com profile with admin role
  UPDATE profiles
  SET role_id = admin_role_id
  WHERE email = 'martynocoaching@gmail.com';
END $$;