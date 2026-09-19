-- ============================================================================
-- GYM MANAGEMENT SYSTEM - FINAL PRODUCTION-READY DATABASE MIGRATION
-- Run this single complete script in the Supabase SQL Editor.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & ROLE ENUM
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_app_role') THEN
    CREATE TYPE public.user_app_role AS ENUM (
      'Admin',
      'Manager',
      'Receptionist',
      'Trainer',
      'Member',
      'Maintenance',
      'Cleaner'
    );
  ELSE
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Admin';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Manager';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Receptionist';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Trainer';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Member';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Maintenance';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Cleaner';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. PERMANENT ADMIN SINGLETON CONFIGURATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_config (
  id integer PRIMARY KEY DEFAULT 1,
  owner_email text,
  is_locked boolean NOT NULL DEFAULT false,
  bootstrapped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_owner_row CHECK (id = 1)
);

INSERT INTO public.admin_config (id, owner_email, is_locked)
VALUES (1, NULL, false)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. CORE APPLICATION TABLES & CONSTRAINTS (ALL 21 TABLES PRESERVED)
-- ----------------------------------------------------------------------------

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role public.user_app_role NOT NULL DEFAULT 'Member'::public.user_app_role,
  phone text,
  status text NOT NULL DEFAULT 'Active',
  profile_photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_photo text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: members
CREATE TABLE IF NOT EXISTS public.members (
  id text PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  guardian_name text,
  email text,
  phone text,
  dob text,
  gender text DEFAULT 'Male',
  address text,
  notes text,
  join_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Active',
  profile_photo text,
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS guardian_name text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS emergency_contact_relation text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS profile_photo text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: trainers
CREATE TABLE IF NOT EXISTS public.trainers (
  id text PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  photo text,
  specialization text DEFAULT 'General Fitness',
  bio text,
  experience_years numeric DEFAULT 1,
  salary numeric(12, 2) DEFAULT 0,
  salary_type text DEFAULT 'Fixed Salary',
  commission_percentage numeric(5, 2) DEFAULT 50.0 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  commission_basis text DEFAULT 'Assigned Member Fees',
  commission_revenue_treatment text DEFAULT 'Paid amount',
  hourly_rate numeric(12, 2) DEFAULT 0 CHECK (hourly_rate >= 0),
  daily_rate numeric(12, 2) DEFAULT 0 CHECK (daily_rate >= 0),
  working_days_per_month integer DEFAULT 26 CHECK (working_days_per_month >= 1 AND working_days_per_month <= 31),
  bank_name text,
  account_title text,
  account_number text,
  iban_or_routing text,
  status text DEFAULT 'Active',
  joining_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS salary_type text DEFAULT 'Fixed Salary';
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS commission_percentage numeric(5, 2) DEFAULT 50.0;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS commission_basis text DEFAULT 'Assigned Member Fees';
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS commission_revenue_treatment text DEFAULT 'Paid amount';
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS hourly_rate numeric(12, 2) DEFAULT 0;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS daily_rate numeric(12, 2) DEFAULT 0;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS working_days_per_month integer DEFAULT 26;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS account_title text;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS iban_or_routing text;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS joining_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: trainer_assignments (Strictly ONE active trainer assignment per member)
CREATE TABLE IF NOT EXISTS public.trainer_assignments (
  id text PRIMARY KEY,
  trainer_id text NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  assigned_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled', 'Inactive')),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_active_trainer_per_member
  ON public.trainer_assignments (member_id)
  WHERE status = 'Active';

-- Table: membership_plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration_months integer NOT NULL DEFAULT 1 CHECK (duration_months >= 1),
  features jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- Table: memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id text REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  custom_plan_name text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  total_amount numeric(12, 2) DEFAULT 0 CHECK (total_amount >= 0),
  paid numeric(12, 2) DEFAULT 0 CHECK (paid >= 0),
  remaining numeric(12, 2) DEFAULT 0 CHECK (remaining >= 0),
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS custom_plan_name text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS total_amount numeric(12, 2) DEFAULT 0;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS paid numeric(12, 2) DEFAULT 0;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS remaining numeric(12, 2) DEFAULT 0;

-- Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  receipt_number text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  membership_id text REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  payment_method text DEFAULT 'Cash',
  payment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Paid' CHECK (status IN ('Paid', 'Completed', 'Pending', 'Failed', 'Cancelled', 'Refunded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: attendance (Fully compatible with existing frontend time formats)
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id text NOT NULL,
  person_type text NOT NULL DEFAULT 'Member' CHECK (person_type IN ('Member', 'Trainer', 'Staff')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time text NOT NULL,
  check_out_time text,
  status text DEFAULT 'Present',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.attendance ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS person_type text DEFAULT 'Member';
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: workout_plans
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id text REFERENCES public.trainers(id) ON DELETE SET NULL,
  title text NOT NULL,
  goal text,
  difficulty_level text DEFAULT 'Intermediate',
  duration_weeks integer DEFAULT 4,
  schedule jsonb DEFAULT '[]'::jsonb,
  exercises jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.workout_plans ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'Intermediate';
ALTER TABLE public.workout_plans ADD COLUMN IF NOT EXISTS duration_weeks integer DEFAULT 4;
ALTER TABLE public.workout_plans ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.workout_plans ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: diet_plans
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id text REFERENCES public.trainers(id) ON DELETE SET NULL,
  title text NOT NULL,
  goal text,
  calories integer DEFAULT 2000,
  daily_calories integer DEFAULT 2000,
  protein_g integer DEFAULT 150,
  carbs_g integer DEFAULT 200,
  fats_g integer DEFAULT 60,
  meals jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS calories integer DEFAULT 2000;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS daily_calories integer DEFAULT 2000;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS protein_g integer DEFAULT 150;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS carbs_g integer DEFAULT 200;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS fats_g integer DEFAULT 60;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS meals jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: staff
CREATE TABLE IF NOT EXISTS public.staff (
  id text PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  role text DEFAULT 'Staff',
  designation text,
  department text,
  salary numeric(12, 2) DEFAULT 0 CHECK (salary >= 0),
  salary_type text DEFAULT 'Fixed Salary',
  hourly_rate numeric(12, 2) DEFAULT 0 CHECK (hourly_rate >= 0),
  daily_rate numeric(12, 2) DEFAULT 0 CHECK (daily_rate >= 0),
  working_days_per_month integer DEFAULT 26 CHECK (working_days_per_month >= 1 AND working_days_per_month <= 31),
  shift text DEFAULT 'Morning',
  bank_name text,
  account_title text,
  account_number text,
  iban_or_routing text,
  status text DEFAULT 'Active',
  joining_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS designation text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS salary_type text DEFAULT 'Fixed Salary';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS hourly_rate numeric(12, 2) DEFAULT 0;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS daily_rate numeric(12, 2) DEFAULT 0;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS working_days_per_month integer DEFAULT 26;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS shift text DEFAULT 'Morning';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS account_title text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS iban_or_routing text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS joining_date date DEFAULT CURRENT_DATE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Table: employee_salary_config (Admin-Only Single Source of Truth)
CREATE TABLE IF NOT EXISTS public.employee_salary_config (
  id text PRIMARY KEY,
  employee_id text NOT NULL UNIQUE,
  employee_name text,
  employee_role text NOT NULL,
  salary_type text NOT NULL DEFAULT 'Fixed Salary',
  base_salary numeric(12, 2) NOT NULL DEFAULT 0 CHECK (base_salary >= 0),
  commission_percentage numeric(5, 2) NOT NULL DEFAULT 0 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  commission_basis text NOT NULL DEFAULT 'Assigned Member Fees',
  commission_revenue_treatment text NOT NULL DEFAULT 'Paid amount',
  hourly_rate numeric(12, 2) NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
  daily_rate numeric(12, 2) NOT NULL DEFAULT 0 CHECK (daily_rate >= 0),
  working_days_per_month integer NOT NULL DEFAULT 26 CHECK (working_days_per_month >= 1 AND working_days_per_month <= 31),
  bank_name text,
  account_title text,
  account_number text,
  iban_or_routing text,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: trainer_commission_ledger (Audited record of earned commissions)
CREATE TABLE IF NOT EXISTS public.trainer_commission_ledger (
  id text PRIMARY KEY DEFAULT ('COM-' || floor(100000 + random() * 900000)::text),
  payment_id text NOT NULL,
  trainer_id text NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  member_id text REFERENCES public.members(id) ON DELETE SET NULL,
  revenue_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (revenue_amount >= 0),
  commission_percentage numeric(5, 2) NOT NULL DEFAULT 0,
  commission_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  commission_basis text NOT NULL DEFAULT 'Assigned Member Fees',
  payroll_month text NOT NULL,
  status text NOT NULL DEFAULT 'Approved',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_trainer_payment UNIQUE (payment_id, trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_commission_trainer_month ON public.trainer_commission_ledger (trainer_id, payroll_month);

-- Table: payroll_records
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id text PRIMARY KEY,
  employee_id text NOT NULL,
  employee_name text,
  employee_role text,
  payroll_month text NOT NULL,
  base_salary numeric(12, 2) DEFAULT 0 CHECK (base_salary >= 0),
  basic_salary numeric(12, 2) DEFAULT 0 CHECK (basic_salary >= 0),
  commission_amount numeric(12, 2) DEFAULT 0 CHECK (commission_amount >= 0),
  bonus_amount numeric(12, 2) DEFAULT 0 CHECK (bonus_amount >= 0),
  deduction_amount numeric(12, 2) DEFAULT 0 CHECK (deduction_amount >= 0),
  advance_deduction numeric(12, 2) DEFAULT 0 CHECK (advance_deduction >= 0),
  tax_amount numeric(12, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  net_salary numeric(12, 2) DEFAULT 0 CHECK (net_salary >= 0),
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Cancelled')),
  paid_date date,
  approved_by text,
  approved_date date,
  payment_method text DEFAULT 'Bank Transfer',
  transaction_reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_payroll_employee_month UNIQUE (employee_id, payroll_month)
);

ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS basic_salary numeric(12, 2) DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS deduction_amount numeric(12, 2) DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS tax_amount numeric(12, 2) DEFAULT 0;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS employee_name text;
ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS employee_role text;

-- Table: salary_advances
CREATE TABLE IF NOT EXISTS public.salary_advances (
  id text PRIMARY KEY,
  employee_id text NOT NULL,
  employee_name text,
  amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  request_date date DEFAULT CURRENT_DATE,
  reason text,
  repayment_months integer DEFAULT 3 CHECK (repayment_months >= 1),
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Recovered')),
  approved_by text,
  remaining_amount numeric(12, 2) DEFAULT 0 CHECK (remaining_amount >= 0),
  recovered_amount numeric(12, 2) DEFAULT 0 CHECK (recovered_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.salary_advances ADD COLUMN IF NOT EXISTS employee_name text;
ALTER TABLE public.salary_advances ADD COLUMN IF NOT EXISTS repayment_months integer DEFAULT 3;

-- Table: salary_advance_deductions (Guarantees no double deduction in same payroll month)
CREATE TABLE IF NOT EXISTS public.salary_advance_deductions (
  id text PRIMARY KEY DEFAULT ('DED-' || floor(100000 + random() * 900000)::text),
  advance_id text NOT NULL REFERENCES public.salary_advances(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  payroll_month text NOT NULL,
  amount_deducted numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount_deducted >= 0),
  deducted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_advance_payroll_month UNIQUE (advance_id, payroll_month)
);

-- Tables: payroll_bonuses & deductions
CREATE TABLE IF NOT EXISTS public.payroll_bonuses (
  id text PRIMARY KEY,
  employee_id text NOT NULL,
  payroll_month text NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payroll_deductions (
  id text PRIMARY KEY,
  employee_id text NOT NULL,
  payroll_month text NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Table: expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text DEFAULT 'Operations',
  amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  expense_date date DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'Cash',
  vendor text,
  description text,
  receipt_url text,
  recorded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS vendor text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS recorded_by text;

-- Table: equipment
CREATE TABLE IF NOT EXISTS public.equipment (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text DEFAULT 'Strength',
  brand text,
  model text,
  serial_number text,
  purchase_date date DEFAULT CURRENT_DATE,
  purchase_price numeric(12, 2) DEFAULT 0 CHECK (purchase_price >= 0),
  warranty_expiry date,
  condition text DEFAULT 'Good',
  status text DEFAULT 'Operational',
  last_maintenance_date date,
  next_maintenance_date date,
  location text DEFAULT 'Main Gym Floor',
  notes text,
  maintenance_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS warranty_expiry date;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS last_maintenance_date date;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS next_maintenance_date date;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS location text DEFAULT 'Main Gym Floor';
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS maintenance_history jsonb DEFAULT '[]'::jsonb;

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  link text,
  priority text DEFAULT 'Medium',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium';

-- Table: gym_settings
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id text PRIMARY KEY DEFAULT 'primary_gym_config',
  gym_name text DEFAULT 'Apex Fitness Club',
  tagline text DEFAULT 'Train Hard. Stay Humble.',
  phone text DEFAULT '+1 (555) 234-5678',
  email text DEFAULT 'contact@apexfitness.com',
  address text DEFAULT '124 Muscle Boulevard, Metro City',
  website text DEFAULT 'https://apexfitness.com',
  currency text DEFAULT 'PKR',
  tax_id text DEFAULT 'NTN-7891234',
  tax_rate numeric(5, 2) DEFAULT 0,
  logo_url text DEFAULT '',
  receipt_prefix text DEFAULT 'REC-',
  receipt_footer text DEFAULT 'Thank you for choosing Apex Fitness Club!',
  terms_and_conditions text DEFAULT 'All memberships are subject to facility rules.',
  general_settings jsonb DEFAULT '{}'::jsonb,
  receipt_settings jsonb DEFAULT '{}'::jsonb,
  payroll_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.gym_settings (id, gym_name, currency, tax_rate)
VALUES ('primary_gym_config', 'Apex Fitness Club', 'PKR', 0)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. RECURSION-FREE SECURITY DEFINER HELPERS
-- ----------------------------------------------------------------------------

-- Helper: Fetch current role with row_security = off to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_app_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_role public.user_app_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'Member'::public.user_app_role;
  END IF;

  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN COALESCE(v_role, 'Member'::public.user_app_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN (public.get_my_role() = 'Admin'::public.user_app_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN (public.get_my_role() IN ('Admin'::public.user_app_role, 'Manager'::public.user_app_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.is_receptionist()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN (public.get_my_role() IN (
    'Admin'::public.user_app_role,
    'Manager'::public.user_app_role,
    'Receptionist'::public.user_app_role
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN (public.get_my_role() = 'Trainer'::public.user_app_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN (public.get_my_role() IN (
    'Admin'::public.user_app_role,
    'Manager'::public.user_app_role,
    'Receptionist'::public.user_app_role,
    'Trainer'::public.user_app_role
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_trainer_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_trainer_id text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_trainer_id
  FROM public.trainers
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN v_trainer_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_member_id text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_member_id
  FROM public.members
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN v_member_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_trainer_assigned_to_member(
  p_trainer_id text,
  p_member_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF p_trainer_id IS NULL OR p_member_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.trainer_assignments
    WHERE trainer_id = p_trainer_id
      AND member_id = p_member_id
      AND status = 'Active'
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. AUTH SIGNUP TRIGGER (SAFE MEMBER DEFAULT, PRESERVES EXISTING ROLES)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_name text;
  v_phone text;
BEGIN
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1),
    'Member'
  );
  v_phone := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''), '');

  -- STRICT: Hardcode role as 'Member'. Discard any user metadata role.
  -- Wrapped in safe block so auth.users insertion NEVER aborts if public.user_profiles has constraint issues
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      auth_user_id,
      email,
      full_name,
      phone,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      v_phone,
      'Member'::public.user_app_role,
      'Active',
      now(),
      now()
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.user_profiles.full_name),
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.user_profiles.phone),
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    -- Prevent transaction rollback on auth.users if user_profiles table is temporarily locked or constrained
    RAISE WARNING 'handle_new_user exception: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. SECURE ADMIN BOOTSTRAP & PERMANENT OWNER PROTECTION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bootstrap_admin(admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_trimmed_email text;
  v_is_locked boolean;
  v_existing_admin_count integer;
  v_target_user record;
BEGIN
  v_trimmed_email := lower(TRIM(admin_email));
  IF v_trimmed_email IS NULL OR v_trimmed_email = '' THEN
    RAISE EXCEPTION 'Email parameter is required to bootstrap the Administrator.';
  END IF;

  SELECT is_locked INTO v_is_locked FROM public.admin_config WHERE id = 1;
  SELECT count(*) INTO v_existing_admin_count
  FROM public.user_profiles
  WHERE role = 'Admin'::public.user_app_role;

  -- Block if already locked or an admin already exists
  IF (v_is_locked IS TRUE) OR (v_existing_admin_count >= 1) THEN
    RAISE EXCEPTION 'Security Policy Violation: System is permanently locked. Only 1 permanent Admin is permitted.';
  END IF;

  SELECT * INTO v_target_user
  FROM public.user_profiles
  WHERE lower(email) = v_trimmed_email
  LIMIT 1;

  IF v_target_user.id IS NULL THEN
    RAISE EXCEPTION 'User profile not found for email "%". User must sign up first.', v_trimmed_email;
  END IF;

  UPDATE public.user_profiles
  SET role = 'Admin'::public.user_app_role,
      status = 'Active',
      updated_at = now()
  WHERE id = v_target_user.id;

  UPDATE public.admin_config
  SET owner_email = v_trimmed_email,
      is_locked = true,
      bootstrapped_at = now(),
      updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User ' || v_trimmed_email || ' is now the permanent Admin. System permanently locked.'
  );
END;
$$;

-- Revoke execute from PUBLIC, anon, and authenticated
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin(text) TO postgres, service_role;

-- Account Protection Trigger: Prevents deleting, demoting, or duplicating the Admin
CREATE OR REPLACE FUNCTION public.protect_admin_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'Admin'::public.user_app_role THEN
      RAISE EXCEPTION 'Security Policy Violation: The permanent Admin account cannot be deleted.';
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Admin cannot be demoted
    IF OLD.role = 'Admin'::public.user_app_role AND NEW.role <> 'Admin'::public.user_app_role THEN
      RAISE EXCEPTION 'Security Policy Violation: The permanent Admin account cannot be demoted.';
    END IF;

    -- Only 1 Admin is ever permitted
    IF OLD.role <> 'Admin'::public.user_app_role AND NEW.role = 'Admin'::public.user_app_role THEN
      IF (SELECT count(*) FROM public.user_profiles WHERE role = 'Admin'::public.user_app_role AND id <> OLD.id) >= 1 THEN
        RAISE EXCEPTION 'Security Policy Violation: Only one permanent Admin is permitted in this system.';
      END IF;
      IF NOT public.is_admin() AND current_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'Access Denied: Only the Administrator can assign roles.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_admin_account ON public.user_profiles;
CREATE TRIGGER trg_protect_admin_account
  BEFORE UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_account();

-- ----------------------------------------------------------------------------
-- 7. ATTENDANCE INTEGRITY ENGINE (VALIDATION & DUPLICATE PREVENTION)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_attendance_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  -- 1. Validate person_type
  IF NEW.person_type NOT IN ('Member', 'Trainer', 'Staff') THEN
    RAISE EXCEPTION 'Invalid person_type: %. Must be Member, Trainer, or Staff.', NEW.person_type;
  END IF;

  -- 2. Foreign-key validation against the respective entity table
  IF NEW.person_type = 'Member' THEN
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE id = NEW.person_id) THEN
      RAISE EXCEPTION 'Attendance Validation Error: Member ID % does not exist.', NEW.person_id;
    END IF;
  ELSIF NEW.person_type = 'Trainer' THEN
    IF NOT EXISTS (SELECT 1 FROM public.trainers WHERE id = NEW.person_id) THEN
      RAISE EXCEPTION 'Attendance Validation Error: Trainer ID % does not exist.', NEW.person_id;
    END IF;
  ELSIF NEW.person_type = 'Staff' THEN
    IF NOT EXISTS (SELECT 1 FROM public.staff WHERE id = NEW.person_id) THEN
      RAISE EXCEPTION 'Attendance Validation Error: Staff ID % does not exist.', NEW.person_id;
    END IF;
  END IF;

  -- 3. Prevent duplicate active check-ins on the same day
  IF NEW.check_out_time IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.attendance
      WHERE person_id = NEW.person_id
        AND date = NEW.date
        AND check_out_time IS NULL
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Duplicate Attendance: An open check-in already exists for % on %.', NEW.person_id, NEW.date;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_attendance ON public.attendance;
CREATE TRIGGER trg_validate_attendance
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_attendance_record();

-- ----------------------------------------------------------------------------
-- 8. MEMBERSHIP PAYMENT FINANCIAL SYNCHRONIZATION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_membership_payment_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_mem_id text;
  v_total_paid numeric(12, 2);
  v_membership_total numeric(12, 2);
  v_end_date date;
BEGIN
  v_mem_id := COALESCE(NEW.membership_id, OLD.membership_id);
  IF v_mem_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Sum ONLY Paid and Completed payments
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.payments
  WHERE membership_id = v_mem_id
    AND status IN ('Paid', 'Completed');

  SELECT total_amount, end_date INTO v_membership_total, v_end_date
  FROM public.memberships
  WHERE id = v_mem_id;

  IF v_membership_total IS NOT NULL THEN
    UPDATE public.memberships
    SET paid = v_total_paid,
        remaining = GREATEST(0, v_membership_total - v_total_paid),
        status = CASE
                   WHEN v_end_date IS NOT NULL AND v_end_date < CURRENT_DATE THEN 'Expired'
                   WHEN v_total_paid >= v_membership_total THEN 'Active'
                   ELSE status
                 END
    WHERE id = v_mem_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_membership_payments ON public.payments;
CREATE TRIGGER trg_sync_membership_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_membership_payment_totals();

-- ----------------------------------------------------------------------------
-- 9. TRAINER COMMISSION ENGINE (PAID ONLY, NO DOUBLE COUNTING)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_payment_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_trainer_id text;
  v_commission_pct numeric(5, 2);
  v_commission_basis text;
  v_commission_amount numeric(12, 2);
  v_month text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.trainer_commission_ledger WHERE payment_id = OLD.receipt_number;
    RETURN OLD;
  END IF;

  -- Only Paid/Completed positive payments generate commission
  IF NEW.status NOT IN ('Paid', 'Completed') OR NEW.amount <= 0 THEN
    DELETE FROM public.trainer_commission_ledger WHERE payment_id = NEW.receipt_number;
    RETURN NEW;
  END IF;

  -- Exactly ONE active trainer exists per member (enforced by partial unique index)
  SELECT ta.trainer_id, COALESCE(t.commission_percentage, 50.0), COALESCE(t.commission_basis, 'Assigned Member Fees')
  INTO v_trainer_id, v_commission_pct, v_commission_basis
  FROM public.trainer_assignments ta
  JOIN public.trainers t ON t.id = ta.trainer_id
  WHERE ta.member_id = NEW.member_id
    AND ta.status = 'Active';

  IF v_trainer_id IS NULL THEN
    DELETE FROM public.trainer_commission_ledger WHERE payment_id = NEW.receipt_number;
    RETURN NEW;
  END IF;

  v_commission_amount := ROUND((NEW.amount * v_commission_pct / 100.0), 2);
  v_month := TO_CHAR(COALESCE(NEW.payment_date, CURRENT_DATE)::date, 'YYYY-MM');

  -- Upsert: prevents double counting by updating existing record for payment/trainer
  INSERT INTO public.trainer_commission_ledger (
    id,
    payment_id,
    trainer_id,
    member_id,
    revenue_amount,
    commission_percentage,
    commission_amount,
    commission_basis,
    payroll_month,
    status,
    calculated_at,
    updated_at
  )
  VALUES (
    'COM-' || floor(100000 + random() * 900000)::text,
    NEW.receipt_number,
    v_trainer_id,
    NEW.member_id,
    NEW.amount,
    v_commission_pct,
    v_commission_amount,
    v_commission_basis,
    v_month,
    'Approved',
    now(),
    now()
  )
  ON CONFLICT (payment_id, trainer_id) DO UPDATE SET
    revenue_amount = EXCLUDED.revenue_amount,
    commission_percentage = EXCLUDED.commission_percentage,
    commission_amount = EXCLUDED.commission_amount,
    commission_basis = EXCLUDED.commission_basis,
    payroll_month = EXCLUDED.payroll_month,
    status = 'Approved',
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_commission ON public.payments;
CREATE TRIGGER trg_payment_commission
  AFTER INSERT OR UPDATE OF amount, status, member_id, payment_date OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_payment_commission();

-- ----------------------------------------------------------------------------
-- 10. SALARY CONFIGURATION SYNCHRONIZATION & SECURED PAYROLL RPC
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_trainer_to_salary_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  INSERT INTO public.employee_salary_config (
    id,
    employee_id,
    employee_name,
    employee_role,
    salary_type,
    base_salary,
    commission_percentage,
    commission_basis,
    commission_revenue_treatment,
    hourly_rate,
    daily_rate,
    working_days_per_month,
    bank_name,
    account_title,
    account_number,
    iban_or_routing,
    status,
    updated_at
  )
  VALUES (
    'CFG-' || NEW.id,
    NEW.id,
    NEW.name,
    'Trainer',
    COALESCE(NEW.salary_type, 'Fixed Salary'),
    COALESCE(NEW.salary, 0),
    COALESCE(NEW.commission_percentage, 50.0),
    COALESCE(NEW.commission_basis, 'Assigned Member Fees'),
    COALESCE(NEW.commission_revenue_treatment, 'Paid amount'),
    COALESCE(NEW.hourly_rate, 0),
    COALESCE(NEW.daily_rate, 0),
    COALESCE(NEW.working_days_per_month, 26),
    NEW.bank_name,
    NEW.account_title,
    NEW.account_number,
    NEW.iban_or_routing,
    COALESCE(NEW.status, 'Active'),
    now()
  )
  ON CONFLICT (employee_id) DO UPDATE SET
    employee_name = EXCLUDED.employee_name,
    salary_type = EXCLUDED.salary_type,
    base_salary = EXCLUDED.base_salary,
    commission_percentage = EXCLUDED.commission_percentage,
    commission_basis = EXCLUDED.commission_basis,
    commission_revenue_treatment = EXCLUDED.commission_revenue_treatment,
    hourly_rate = EXCLUDED.hourly_rate,
    daily_rate = EXCLUDED.daily_rate,
    working_days_per_month = EXCLUDED.working_days_per_month,
    bank_name = EXCLUDED.bank_name,
    account_title = EXCLUDED.account_title,
    account_number = EXCLUDED.account_number,
    iban_or_routing = EXCLUDED.iban_or_routing,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_trainer_salary ON public.trainers;
CREATE TRIGGER trg_sync_trainer_salary
  AFTER INSERT OR UPDATE ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_trainer_to_salary_config();

CREATE OR REPLACE FUNCTION public.sync_staff_to_salary_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  INSERT INTO public.employee_salary_config (
    id,
    employee_id,
    employee_name,
    employee_role,
    salary_type,
    base_salary,
    commission_percentage,
    commission_basis,
    commission_revenue_treatment,
    hourly_rate,
    daily_rate,
    working_days_per_month,
    bank_name,
    account_title,
    account_number,
    iban_or_routing,
    status,
    updated_at
  )
  VALUES (
    'CFG-' || NEW.id,
    NEW.id,
    NEW.name,
    COALESCE(NEW.role, 'Staff'),
    COALESCE(NEW.salary_type, 'Fixed Salary'),
    COALESCE(NEW.salary, 0),
    0,
    'None',
    'Paid amount',
    COALESCE(NEW.hourly_rate, 0),
    COALESCE(NEW.daily_rate, 0),
    COALESCE(NEW.working_days_per_month, 26),
    NEW.bank_name,
    NEW.account_title,
    NEW.account_number,
    NEW.iban_or_routing,
    COALESCE(NEW.status, 'Active'),
    now()
  )
  ON CONFLICT (employee_id) DO UPDATE SET
    employee_name = EXCLUDED.employee_name,
    employee_role = EXCLUDED.employee_role,
    salary_type = EXCLUDED.salary_type,
    base_salary = EXCLUDED.base_salary,
    hourly_rate = EXCLUDED.hourly_rate,
    daily_rate = EXCLUDED.daily_rate,
    working_days_per_month = EXCLUDED.working_days_per_month,
    bank_name = EXCLUDED.bank_name,
    account_title = EXCLUDED.account_title,
    account_number = EXCLUDED.account_number,
    iban_or_routing = EXCLUDED.iban_or_routing,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_staff_salary ON public.staff;
CREATE TRIGGER trg_sync_staff_salary
  AFTER INSERT OR UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_staff_to_salary_config();

-- Payroll Calculation: Role-restricted execution
CREATE OR REPLACE FUNCTION public.calculate_monthly_payroll(
  p_employee_id text,
  p_month text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_emp record;
  v_base_salary numeric(12, 2) := 0;
  v_commissions numeric(12, 2) := 0;
  v_bonuses numeric(12, 2) := 0;
  v_deductions numeric(12, 2) := 0;
  v_advance_deduction numeric(12, 2) := 0;
  v_tax numeric(12, 2) := 0;
  v_net numeric(12, 2) := 0;
BEGIN
  -- Strict Authorization: Only Admin/Manager or the specific employee themselves
  IF NOT (public.is_manager() OR current_user IN ('postgres', 'service_role')) THEN
    IF NOT (
      (auth.uid() IS NOT NULL AND p_employee_id = public.get_current_trainer_id()) OR
      (auth.uid() IS NOT NULL AND p_employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
    ) THEN
      RAISE EXCEPTION 'Access Denied: You do not have permission to view or calculate payroll for this employee.';
    END IF;
  END IF;

  SELECT * INTO v_emp
  FROM public.employee_salary_config
  WHERE employee_id = p_employee_id;

  IF v_emp.employee_id IS NULL THEN
    SELECT id, name AS employee_name, 'Trainer' AS employee_role, salary AS base_salary
    INTO v_emp FROM public.trainers WHERE id = p_employee_id;
  END IF;

  IF v_emp.employee_id IS NULL THEN
    SELECT id, name AS employee_name, role AS employee_role, salary AS base_salary
    INTO v_emp FROM public.staff WHERE id = p_employee_id;
  END IF;

  v_base_salary := COALESCE(v_emp.base_salary, 0);

  SELECT COALESCE(SUM(commission_amount), 0) INTO v_commissions
  FROM public.trainer_commission_ledger
  WHERE trainer_id = p_employee_id
    AND payroll_month = p_month
    AND status = 'Approved';

  SELECT COALESCE(SUM(amount), 0) INTO v_bonuses
  FROM public.payroll_bonuses
  WHERE employee_id = p_employee_id
    AND payroll_month = p_month;

  SELECT COALESCE(SUM(amount), 0) INTO v_deductions
  FROM public.payroll_deductions
  WHERE employee_id = p_employee_id
    AND payroll_month = p_month;

  -- Advance deduction: check recorded deductions first to prevent double deduction
  SELECT COALESCE(SUM(amount_deducted), 0) INTO v_advance_deduction
  FROM public.salary_advance_deductions
  WHERE employee_id = p_employee_id
    AND payroll_month = p_month;

  IF v_advance_deduction = 0 THEN
    SELECT COALESCE(SUM(
      LEAST(remaining_amount, ROUND(amount / NULLIF(repayment_months, 0), 2))
    ), 0) INTO v_advance_deduction
    FROM public.salary_advances
    WHERE employee_id = p_employee_id
      AND status = 'Approved'
      AND remaining_amount > 0;
  END IF;

  v_net := v_base_salary + v_commissions + v_bonuses - v_deductions - v_advance_deduction - v_tax;
  IF v_net < 0 THEN
    v_net := 0;
  END IF;

  RETURN jsonb_build_object(
    'employee_id', p_employee_id,
    'employee_name', COALESCE(v_emp.employee_name, 'Employee'),
    'employee_role', COALESCE(v_emp.employee_role, 'Staff'),
    'payroll_month', p_month,
    'base_salary', v_base_salary,
    'commission_amount', v_commissions,
    'bonus_amount', v_bonuses,
    'deduction_amount', v_deductions,
    'advance_deduction', v_advance_deduction,
    'tax_amount', v_tax,
    'net_salary', v_net
  );
END;
$$;

-- Revoke public execution on payroll calculation
REVOKE EXECUTE ON FUNCTION public.calculate_monthly_payroll(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_monthly_payroll(text, text) TO authenticated, service_role, postgres;

-- ----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advance_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOR t, p IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
  END LOOP;
END $$;

-- 1. admin_config
CREATE POLICY "admin_config_select_admin" ON public.admin_config
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_config_manage_admin" ON public.admin_config
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. user_profiles (ZERO RECURSION using get_my_role(); Normal users cannot alter roles)
CREATE POLICY "profiles_select_policy" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = auth_user_id
    OR public.is_admin()
  );

CREATE POLICY "profiles_update_policy" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = auth_user_id
    OR public.is_admin()
  ) WITH CHECK (
    public.is_admin()
    OR (
      role = public.get_my_role()
      AND status = 'Active'
    )
  );

CREATE POLICY "profiles_insert_admin" ON public.user_profiles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "profiles_delete_admin" ON public.user_profiles
  FOR DELETE USING (public.is_admin());

-- 3. members
CREATE POLICY "members_select_policy" ON public.members
  FOR SELECT USING (
    public.is_staff()
    OR (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  );

CREATE POLICY "members_manage_receptionist" ON public.members
  FOR ALL USING (public.is_receptionist())
  WITH CHECK (public.is_receptionist());

CREATE POLICY "members_update_own" ON public.members
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 4. trainers
CREATE POLICY "trainers_select_all" ON public.trainers
  FOR SELECT USING (true);

CREATE POLICY "trainers_manage_manager" ON public.trainers
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "trainers_update_own" ON public.trainers
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 5. trainer_assignments
CREATE POLICY "trainer_assignments_select" ON public.trainer_assignments
  FOR SELECT USING (
    public.is_staff()
    OR (auth.uid() IS NOT NULL AND member_id = public.get_current_member_id())
    OR (auth.uid() IS NOT NULL AND trainer_id = public.get_current_trainer_id())
  );

CREATE POLICY "trainer_assignments_manage_manager" ON public.trainer_assignments
  FOR ALL USING (public.is_receptionist())
  WITH CHECK (public.is_receptionist());

-- 6. membership_plans
CREATE POLICY "plans_select_all" ON public.membership_plans
  FOR SELECT USING (true);

CREATE POLICY "plans_manage_manager" ON public.membership_plans
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- 7. memberships
CREATE POLICY "memberships_select_policy" ON public.memberships
  FOR SELECT USING (
    public.is_receptionist()
    OR (auth.uid() IS NOT NULL AND member_id = public.get_current_member_id())
  );

CREATE POLICY "memberships_manage_receptionist" ON public.memberships
  FOR ALL USING (public.is_receptionist())
  WITH CHECK (public.is_receptionist());

-- 8. payments (Receptionists insert; Managers modify/delete; Members view own)
CREATE POLICY "payments_select_policy" ON public.payments
  FOR SELECT USING (
    public.is_receptionist()
    OR (auth.uid() IS NOT NULL AND member_id = public.get_current_member_id())
  );

CREATE POLICY "payments_insert_receptionist" ON public.payments
  FOR INSERT WITH CHECK (public.is_receptionist());

CREATE POLICY "payments_modify_manager" ON public.payments
  FOR UPDATE USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "payments_delete_manager" ON public.payments
  FOR DELETE USING (public.is_manager());

-- 9. attendance
CREATE POLICY "attendance_select_policy" ON public.attendance
  FOR SELECT USING (
    public.is_staff()
    OR (auth.uid() IS NOT NULL AND person_id = public.get_current_member_id())
    OR (auth.uid() IS NOT NULL AND person_id = public.get_current_trainer_id())
  );

CREATE POLICY "attendance_manage_receptionist" ON public.attendance
  FOR ALL USING (public.is_receptionist())
  WITH CHECK (public.is_receptionist());

-- 10. workout_plans (Strict: Trainer ONLY accesses members assigned to them)
CREATE POLICY "workout_plans_select" ON public.workout_plans
  FOR SELECT USING (
    public.is_manager()
    OR (public.is_trainer() AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id))
    OR (auth.uid() IS NOT NULL AND member_id = public.get_current_member_id())
  );

CREATE POLICY "workout_plans_insert" ON public.workout_plans
  FOR INSERT WITH CHECK (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

CREATE POLICY "workout_plans_update" ON public.workout_plans
  FOR UPDATE USING (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  ) WITH CHECK (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

CREATE POLICY "workout_plans_delete" ON public.workout_plans
  FOR DELETE USING (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

-- 11. diet_plans (Strict: Trainer ONLY accesses members assigned to them)
CREATE POLICY "diet_plans_select" ON public.diet_plans
  FOR SELECT USING (
    public.is_manager()
    OR (public.is_trainer() AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id))
    OR (auth.uid() IS NOT NULL AND member_id = public.get_current_member_id())
  );

CREATE POLICY "diet_plans_insert" ON public.diet_plans
  FOR INSERT WITH CHECK (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

CREATE POLICY "diet_plans_update" ON public.diet_plans
  FOR UPDATE USING (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  ) WITH CHECK (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

CREATE POLICY "diet_plans_delete" ON public.diet_plans
  FOR DELETE USING (
    public.is_manager()
    OR (
      public.is_trainer()
      AND trainer_id = public.get_current_trainer_id()
      AND public.is_trainer_assigned_to_member(public.get_current_trainer_id(), member_id)
    )
  );

-- 12. staff
CREATE POLICY "staff_select_staff" ON public.staff
  FOR SELECT USING (public.is_staff());

CREATE POLICY "staff_manage_admin" ON public.staff
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "staff_update_own" ON public.staff
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 13. employee_salary_config (ADMIN-ONLY FOR WRITE; Employees view own)
CREATE POLICY "salary_config_select" ON public.employee_salary_config
  FOR SELECT USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "salary_config_admin_insert" ON public.employee_salary_config
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "salary_config_admin_update" ON public.employee_salary_config
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "salary_config_admin_delete" ON public.employee_salary_config
  FOR DELETE USING (public.is_admin());

-- 14. trainer_commission_ledger
CREATE POLICY "commission_manage_manager" ON public.trainer_commission_ledger
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "commission_view_trainer" ON public.trainer_commission_ledger
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND trainer_id = public.get_current_trainer_id())
  );

-- 15. payroll_records
CREATE POLICY "payroll_manage_manager" ON public.payroll_records
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "payroll_view_own" ON public.payroll_records
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

-- 16. salary_advances & advance deductions
CREATE POLICY "advances_manage_manager" ON public.salary_advances
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "advances_request_employee" ON public.salary_advances
  FOR INSERT WITH CHECK (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "advances_view_own" ON public.salary_advances
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "advance_deductions_manage_manager" ON public.salary_advance_deductions
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "advance_deductions_view_own" ON public.salary_advance_deductions
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "bonuses_manage_manager" ON public.payroll_bonuses
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "bonuses_view_own" ON public.payroll_bonuses
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "deductions_manage_manager" ON public.payroll_deductions
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "deductions_view_own" ON public.payroll_deductions
  FOR SELECT USING (
    public.is_manager()
    OR (auth.uid() IS NOT NULL AND employee_id = public.get_current_trainer_id())
    OR (auth.uid() IS NOT NULL AND employee_id IN (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()))
  );

-- 17. expenses (Receptionist forbidden; Manager and Admin only)
CREATE POLICY "expenses_manage_manager" ON public.expenses
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

-- 18. equipment (Staff view; Manager manages)
CREATE POLICY "equipment_manage_manager" ON public.equipment
  FOR ALL USING (public.is_manager())
  WITH CHECK (public.is_manager());

CREATE POLICY "equipment_view_staff" ON public.equipment
  FOR SELECT USING (public.is_staff());

-- 19. notifications
CREATE POLICY "notifications_manage_user" ON public.notifications
  FOR ALL USING (
    public.is_admin()
    OR user_id IS NULL
    OR user_id = 'all'
    OR user_id = auth.uid()::text
  )
  WITH CHECK (
    public.is_admin()
    OR user_id = auth.uid()::text
  );

-- 20. gym_settings (Public view; Admin-only update)
CREATE POLICY "settings_select_all" ON public.gym_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_update_admin" ON public.gym_settings
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 12. STORAGE BUCKETS & AUTHENTICATED STORAGE RLS POLICIES
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('receipts', 'receipts', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Auth users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Auth users can update avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Auth users can delete avatars" ON storage.objects;
  DROP POLICY IF EXISTS "receipts_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "receipts_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "receipts_delete_policy" ON storage.objects;
  DROP POLICY IF EXISTS "documents_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "documents_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "documents_delete_policy" ON storage.objects;

  -- 1. Avatars (Public read, authenticated upload to own folder)
  CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

  CREATE POLICY "Auth users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'avatars'
      AND auth.role() = 'authenticated'
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_receptionist()
      )
    );

  CREATE POLICY "Auth users can update avatars" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'avatars'
      AND auth.role() = 'authenticated'
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_receptionist()
      )
    );

  CREATE POLICY "Auth users can delete avatars" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'avatars'
      AND auth.role() = 'authenticated'
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
      )
    );

  -- 2. Receipts (PRIVATE: Staff & receipt owner only)
  CREATE POLICY "receipts_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'receipts'
      AND (
        public.is_receptionist()
        OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      )
    );

  CREATE POLICY "receipts_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'receipts'
      AND (
        public.is_receptionist()
        OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      )
    );

  CREATE POLICY "receipts_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'receipts'
      AND public.is_manager()
    );

  -- 3. Documents (PRIVATE: Management & document owner only)
  CREATE POLICY "documents_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'documents'
      AND (
        public.is_manager()
        OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      )
    );

  CREATE POLICY "documents_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'documents'
      AND (
        public.is_manager()
        OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
      )
    );

  CREATE POLICY "documents_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'documents'
      AND public.is_manager()
    );
END $$;

COMMIT;
