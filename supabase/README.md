# St. Mary's English School IT Club — Supabase Database Architecture

## Overview
This directory contains the authoritative, production-grade PostgreSQL database schema and migrations for the St. Mary's English School IT Club full-stack platform.

The schema is architected to be:
- **Persistent & Authoritative:** PostgREST / Supabase PostgreSQL serves as the single source of truth.
- **Strictly Normalized:** Zero redundant state across 33 relational tables.
- **Relational Integrity:** Explicit `ON DELETE` rules (Restrict / Set Null for historical data like certificates and exam results; Cascade for tightly bound child entities like quiz options and member skills).
- **RLS Ready:** Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`) is enabled across all 33 tables.
- **Type-Safe:** Mapped 1:1 with TypeScript database definitions in `/src/types/database.types.ts`.

---

## Table Structure & Domain Mapping

1. **Identity & Profiles**
   - `public.profiles`: Extends `auth.users` with display name, full name, avatar, bio, and account status.
2. **Roles & Permissions (RBAC)**
   - `public.roles`: System roles (`super_admin`, `admin`, `faculty_moderator`, `member`).
   - `public.permissions`: Granular capability codes.
   - `public.role_permissions`: Junction between roles and permissions.
   - `public.user_roles`: User role assignments.
3. **Members & Skills**
   - `public.members`: Official club membership roster with admission class/section and portfolio visibility.
   - `public.skills`: Categorized technical skill registry.
   - `public.member_skills`: Junction between members and technical skills with proficiency levels.
4. **Projects & Collaboration**
   - `public.projects`: Collaborative student software and hardware projects.
   - `public.project_members`: Junction connecting contributors and their roles within projects.
5. **Achievements & Accreditations**
   - `public.achievements`: Competitions, hackathons, and honors won by club members.
6. **Certificates & Verification**
   - `public.certificates`: Cryptographically verifiable digital certificates with unique verification codes.
7. **Events & Participants**
   - `public.events`: Workshops, seminars, coding challenges, and meetings.
   - `public.event_participants`: Event registration and attendance tracking.
8. **Notices & Announcements**
   - `public.notices`: Official club bulletins with priority flags, popup alerts, and expiry dates.
9. **Notifications**
   - `public.notifications`: Cross-device user alerts with read states.
10. **Gallery & Media**
    - `public.gallery_albums`: Photo albums linked to club activities and events.
    - `public.gallery_images`: Individual photos referencing Supabase Storage paths.
11. **Learning Resources**
    - `public.resource_categories`: Subject and topic taxonomies.
    - `public.resources`: Educational tutorials, guides, worksheets, and syllabus modules.
    - `public.resource_files`: Storage file metadata and download telemetry.
12. **Quizzes & Online Examination Engine**
    - `public.quizzes`: Timed academic and coding quizzes with passing thresholds.
    - `public.quiz_questions`: Questions with configurable marks, types, and explanations.
    - `public.quiz_options`: Single and multiple choice answer options.
    - `public.quiz_attempts`: Student test sessions with duration tracking and live status.
    - `public.quiz_answers`: Individual responses and scoring logs.
    - `public.quiz_results`: Official evaluated results with percentages and pass/fail indicators.
13. **Academic Question Papers & Exam Results**
    - `public.exam_documents`: Past question papers, model papers, and answer keys.
    - `public.exam_results`: Formal student marks and grades linked to members.
14. **Contact & Communication**
    - `public.contact_messages`: Public inquiries with status tracking and admin notes.
15. **File Storage & Operations**
    - `public.file_metadata`: Supabase Storage synchronization and entity tracking.
16. **System Administration**
    - `public.site_settings`: Dynamic site configuration and feature flags.
    - `public.audit_logs`: Immutable audit trails recording actor IDs, actions, and JSON diffs.

---

## How to Apply Migrations

### Method 1: Supabase Dashboard SQL Editor (Recommended)
1. Open the Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Copy and paste the contents of `/supabase/schema.sql` (or `/supabase/migrations/20260910000001_initial_core_schema.sql`).
4. Click **Run**. All 33 tables, indexes, triggers, and seed roles will be instantiated instantly.

### Method 2: Supabase CLI
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```
