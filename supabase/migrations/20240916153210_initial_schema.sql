-- Migration: initial_schema
-- Description: Create initial schema for GdprMate application
-- Date: 2024-09-16
--
-- This migration creates the complete database schema for GdprMate:
-- - Custom enum types for statuses and categories
-- - Core tables (documents, analyses, analysis_issues, suggestion_interactions)
-- - Appropriate indexes for optimized querying
-- - Row Level Security policies for all tables

-- create custom enum types
create type analysis_status_enum as enum ('pending','in_progress','completed','failed');
create type issue_category_enum as enum ('critical','important','minor');
create type interaction_type_enum as enum ('accepted','rejected');

-- documents table - stores uploaded documents
create table documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    original_filename text not null,
    mime_type text not null,
    size_bytes integer not null check (size_bytes <= 10000000),
    s3_key text not null,
    text_content text not null,
    detected_language char(2) not null,
    created_at timestamptz not null default now()
);

-- analyses table - stores document analysis jobs
create table analyses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    document_id uuid not null references documents(id) on delete cascade,
    status analysis_status_enum not null,
    model_version text not null,
    duration_ms integer,
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    error_message text,
    created_at timestamptz not null default now()
);

-- analysis_issues table - stores issues found during analysis
create table analysis_issues (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    analysis_id uuid not null references analyses(id) on delete cascade,
    category issue_category_enum not null,
    description text not null,
    suggestion text not null,
    created_at timestamptz not null default now()
);

-- suggestion_interactions table - stores user interactions with suggestions
create table suggestion_interactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    issue_id uuid not null references analysis_issues(id) on delete cascade,
    interaction_type interaction_type_enum not null,
    created_at timestamptz not null default now()
);

-- create indexes for performance optimization
-- documents: optimize querying by user_id and created_at
create index idx_documents_user_id_created_at on documents(user_id, created_at);

-- analyses: optimize filtering by user, document and status
create index idx_analyses_user_id_document_id on analyses(user_id, document_id);
create index idx_analyses_status on analyses(status);

-- analysis_issues: optimize filtering by analysis, user and category
create index idx_analysis_issues_analysis_id_user_id_category on analysis_issues(analysis_id, user_id, category);

-- suggestion_interactions: optimize filtering by issue, user and interaction type
create index idx_suggestion_interactions_issue_id_user_id_type on suggestion_interactions(issue_id, user_id, interaction_type);

-- enable row level security (rls) on all tables
alter table documents enable row level security;
alter table analyses enable row level security;
alter table analysis_issues enable row level security;
alter table suggestion_interactions enable row level security;

-- rls policies for documents table
-- select policy for authenticated users
create policy "users can view their own documents"
on documents for select
to authenticated
using (auth.uid() = user_id);

-- select policy for anon users (deny access)
create policy "anon users cannot view documents"
on documents for select
to anon
using (false);

-- insert policy for authenticated users
create policy "users can insert their own documents"
on documents for insert
to authenticated
with check (auth.uid() = user_id);

-- insert policy for anon users (deny access)
create policy "anon users cannot insert documents"
on documents for insert
to anon
with check (false);

-- update policy for authenticated users
create policy "users can update their own documents"
on documents for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- update policy for anon users (deny access)
create policy "anon users cannot update documents"
on documents for update
to anon
using (false);

-- delete policy for authenticated users
create policy "users can delete their own documents"
on documents for delete
to authenticated
using (auth.uid() = user_id);

-- delete policy for anon users (deny access)
create policy "anon users cannot delete documents"
on documents for delete
to anon
using (false);

-- rls policies for analyses table
-- select policy for authenticated users
create policy "users can view their own analyses"
on analyses for select
to authenticated
using (auth.uid() = user_id);

-- select policy for anon users (deny access)
create policy "anon users cannot view analyses"
on analyses for select
to anon
using (false);

-- insert policy for authenticated users
create policy "users can insert their own analyses"
on analyses for insert
to authenticated
with check (auth.uid() = user_id);

-- insert policy for anon users (deny access)
create policy "anon users cannot insert analyses"
on analyses for insert
to anon
with check (false);

-- update policy for authenticated users
create policy "users can update their own analyses"
on analyses for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- update policy for anon users (deny access)
create policy "anon users cannot update analyses"
on analyses for update
to anon
using (false);

-- delete policy for authenticated users
create policy "users can delete their own analyses"
on analyses for delete
to authenticated
using (auth.uid() = user_id);

-- delete policy for anon users (deny access)
create policy "anon users cannot delete analyses"
on analyses for delete
to anon
using (false);

-- rls policies for analysis_issues table
-- select policy for authenticated users
create policy "users can view their own analysis issues"
on analysis_issues for select
to authenticated
using (auth.uid() = user_id);

-- select policy for anon users (deny access)
create policy "anon users cannot view analysis issues"
on analysis_issues for select
to anon
using (false);

-- insert policy for authenticated users
create policy "users can insert their own analysis issues"
on analysis_issues for insert
to authenticated
with check (auth.uid() = user_id);

-- insert policy for anon users (deny access)
create policy "anon users cannot insert analysis issues"
on analysis_issues for insert
to anon
with check (false);

-- update policy for authenticated users
create policy "users can update their own analysis issues"
on analysis_issues for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- update policy for anon users (deny access)
create policy "anon users cannot update analysis issues"
on analysis_issues for update
to anon
using (false);

-- delete policy for authenticated users
create policy "users can delete their own analysis issues"
on analysis_issues for delete
to authenticated
using (auth.uid() = user_id);

-- delete policy for anon users (deny access)
create policy "anon users cannot delete analysis issues"
on analysis_issues for delete
to anon
using (false);

-- rls policies for suggestion_interactions table
-- select policy for authenticated users
create policy "users can view their own suggestion interactions"
on suggestion_interactions for select
to authenticated
using (auth.uid() = user_id);

-- select policy for anon users (deny access)
create policy "anon users cannot view suggestion interactions"
on suggestion_interactions for select
to anon
using (false);

-- insert policy for authenticated users
create policy "users can insert their own suggestion interactions"
on suggestion_interactions for insert
to authenticated
with check (auth.uid() = user_id);

-- insert policy for anon users (deny access)
create policy "anon users cannot insert suggestion interactions"
on suggestion_interactions for insert
to anon
with check (false);

-- update policy for authenticated users
create policy "users can update their own suggestion interactions"
on suggestion_interactions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- update policy for anon users (deny access)
create policy "anon users cannot update suggestion interactions"
on suggestion_interactions for update
to anon
using (false);

-- delete policy for authenticated users
create policy "users can delete their own suggestion interactions"
on suggestion_interactions for delete
to authenticated
using (auth.uid() = user_id);

-- delete policy for anon users (deny access)
create policy "anon users cannot delete suggestion interactions"
on suggestion_interactions for delete
to anon
using (false); 