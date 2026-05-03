-- Adds a free-text "notes" column to projects.
-- Used by /dashboard/project/[id] (notes editor) and injected into the
-- PROJECT MEMORY block in /api/flash so each new pack is aware of the
-- long-running project context (client, deal size, contacts, do's and don'ts).
alter table public.projects add column if not exists notes text;
