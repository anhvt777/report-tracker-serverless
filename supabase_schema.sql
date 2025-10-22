-- Enable uuid extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- Create reports table to hold report assignments
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  due_date timestamptz not null,
  assignees jsonb not null,
  lead_email text not null,
  created_at timestamptz not null default now(),
  completed boolean not null default false,
  completion_date timestamptz,
  extension_reason text,
  reminder_sent boolean not null default false
);

-- Indexes for efficient querying on due_date and reminder_sent
create index if not exists reports_due_date_idx on reports (due_date);
create index if not exists reports_reminder_idx on reports (reminder_sent);
