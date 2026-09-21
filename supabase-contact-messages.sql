-- ============================================================================
-- APEXFIT / GYM MANAGEMENT SYSTEM - CONTACT MESSAGES MIGRATION
-- Table: public.contact_messages
-- 
-- Description:
-- Stores visitor contact submissions, demo requests, membership inquiries,
-- and free trial leads from the Public Landing Page.
-- 
-- Security:
-- - Row Level Security (RLS) is ENABLED.
-- - Public / Anon visitors can INSERT only.
-- - Public / Anon visitors CANNOT SELECT, UPDATE, or DELETE messages.
-- - Authenticated Staff (Admin, Manager, Receptionist) can SELECT and UPDATE status.
-- - Managers/Admins can DELETE spam/test entries.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL DEFAULT 'Website Inquiry',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'New',
  notes text,
  form_type text NOT NULL DEFAULT 'Contact Us',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Public Insertion: Visitors can submit messages
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_messages;
CREATE POLICY "Public can submit contact form"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Staff View: Only authenticated staff can view messages
DROP POLICY IF EXISTS "Staff can read contact messages" ON public.contact_messages;
CREATE POLICY "Staff can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE (user_profiles.auth_user_id = auth.uid() OR user_profiles.id = auth.uid())
      AND user_profiles.role::text IN ('Admin', 'Manager', 'Receptionist')
    )
    OR auth.role() = 'service_role'
  );

-- 3. Staff Update: Only authenticated staff can update message status/notes
DROP POLICY IF EXISTS "Staff can update contact messages" ON public.contact_messages;
CREATE POLICY "Staff can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE (user_profiles.auth_user_id = auth.uid() OR user_profiles.id = auth.uid())
      AND user_profiles.role::text IN ('Admin', 'Manager', 'Receptionist')
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE (user_profiles.auth_user_id = auth.uid() OR user_profiles.id = auth.uid())
      AND user_profiles.role::text IN ('Admin', 'Manager', 'Receptionist')
    )
    OR auth.role() = 'service_role'
  );

-- 4. Manager Delete: Only Managers/Admins can delete messages
DROP POLICY IF EXISTS "Staff can delete contact messages" ON public.contact_messages;
CREATE POLICY "Staff can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE (user_profiles.auth_user_id = auth.uid() OR user_profiles.id = auth.uid())
      AND user_profiles.role::text IN ('Admin', 'Manager')
    )
    OR auth.role() = 'service_role'
  );
