-- Migration: disable_rls_for_development
-- Description: Temporarily disable RLS policies for development purposes
-- Date: 2024-09-16
--
-- This migration temporarily disables Row Level Security (RLS) on all tables
-- to simplify development and testing. This should NOT be applied in production.
-- For production, create a separate migration to re-enable RLS.

-- Disable RLS on all tables
alter table documents disable row level security;
alter table analyses disable row level security;
alter table analysis_issues disable row level security;
alter table suggestion_interactions disable row level security;

-- Comment: The following policies still exist in the database but are inactive
-- since RLS is disabled on the tables. When re-enabling RLS for production,
-- no additional steps are needed to re-activate these policies.
--
-- This approach allows for easy switching between development mode (RLS disabled)
-- and production mode (RLS enabled) without having to recreate all policies. 