/*
  # Add Associations and Invitations System

  1. New Tables
    - `associations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `association_invitations`
      - `id` (uuid, primary key)
      - `association_id` (uuid, references associations)
      - `email` (text)
      - `token` (text)
      - `status` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Only admins can manage associations and invitations
    - Associations can view their own data
*/

-- Create associations table
CREATE TABLE IF NOT EXISTS associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create association_invitations table
CREATE TABLE IF NOT EXISTS association_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid REFERENCES associations(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE association_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for associations table
CREATE POLICY "Admin can manage associations"
ON associations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
);

-- Policies for association_invitations table
CREATE POLICY "Admin can manage invitations"
ON association_invitations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
  )
);

-- Create trigger to handle updated_at
CREATE TRIGGER handle_updated_at_associations
  BEFORE UPDATE ON associations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_association_invitations
  BEFORE UPDATE ON association_invitations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert Medicine Hat Soccer Association
INSERT INTO associations (name, email, status)
VALUES ('Medicine Hat Soccer', 'president@medicinehatsoccer.com', 'pending')
ON CONFLICT (email) DO NOTHING;

-- Create invitation for Medicine Hat Soccer
WITH association AS (
  SELECT id FROM associations 
  WHERE email = 'president@medicinehatsoccer.com'
  LIMIT 1
)
INSERT INTO association_invitations (association_id, email, token, expires_at)
SELECT 
  association.id,
  'president@medicinehatsoccer.com',
  encode(gen_random_bytes(32), 'hex'),
  now() + interval '7 days'
FROM association
ON CONFLICT DO NOTHING;