/*
  # Create users table for Daily Weather Stylist

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `first_name` (text) - User's first name
      - `email` (text, unique) - User's email address (unique constraint)
      - `latitude` (decimal) - Geographic latitude for weather location
      - `longitude` (decimal) - Geographic longitude for weather location
      - `timezone` (text) - User's timezone for scheduling emails
      - `is_active` (boolean) - Whether user wants to receive emails
      - `created_at` (timestamptz) - When user signed up
      - `updated_at` (timestamptz) - Last modification time

  2. Security
    - Enable RLS on `users` table
    - Add policy for public read access to support form submissions
    - Add policy for service role to manage email sending

  3. Indexes
    - Index on email for fast lookups
    - Index on is_active for email sending queries
    - Index on timezone for batch processing
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text UNIQUE NOT NULL,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  timezone text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Create policies for access control
CREATE POLICY "Allow public insert for new signups"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();