-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- AUTHORITATIVE POSTGRESQL DATABASE SCHEMA (PROMPT 2 ARCHITECTURE)
-- ==============================================================================
-- This file represents the complete unified DDL for St. Mary's English School IT Club.
-- It can be executed directly in the Supabase SQL Editor or applied via migration tools.
--
-- CORE ARCHITECTURAL STANDARDS:
-- 1. Persistent PostgreSQL Database: Authoritative cloud single source of truth.
-- 2. Strict Normalization: Zero data duplication, structured junction tables.
-- 3. Referential Integrity: Precise ON DELETE rules (Restrict/Set Null for history, Cascade for subordinate items).
-- 4. Secure Authorization Readiness: RLS enabled on all tables, role-based authorization structure.
-- 5. Complete Lifecycle Modeling: Controlled status fields with CHECK constraints.
-- ==============================================================================

-- Enable standard UUID and crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 0. REUSABLE UTILITY FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. IDENTITY & PROFILES (Linked 1:1 with auth.users)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    public_contact TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 2. ROLES, PERMISSIONS & AUTHORIZATION (Normalized Multi-Role System)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, role_id)
);

-- ==============================================================================
-- 3. CLUB MEMBERS (Structured Student Membership)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT UNIQUE,
    member_number TEXT UNIQUE,
    class_grade TEXT,
    section TEXT,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'alumnus', 'suspended', 'pending')),
    public_visibility BOOLEAN NOT NULL DEFAULT true,
    portfolio_visibility BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. SKILLS & MEMBER SKILLS (Normalized Many-to-Many)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.member_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    proficiency_level TEXT NOT NULL DEFAULT 'Intermediate' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(member_id, skill_id)
);

-- ==============================================================================
-- 5. PROJECTS & PROJECT MEMBERS (Collaborative Many-to-Many Projects)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private', 'admin_only')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    thumbnail_url TEXT,
    repo_url TEXT,
    live_url TEXT,
    start_date DATE,
    completion_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_project_dates CHECK (completion_date IS NULL OR start_date IS NULL OR completion_date >= start_date)
);

CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    role_in_project TEXT NOT NULL DEFAULT 'Contributor',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(project_id, member_id)
);

-- ==============================================================================
-- 6. ACHIEVEMENTS (Accreditations & Honors)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Competition' CHECK (category IN ('Competition', 'Academic', 'Hackathon', 'Leadership', 'Honor', 'Other')),
    issuer TEXT NOT NULL,
    achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    proof_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. CERTIFICATES & VERIFICATION (Tamper-Resistant Digital Credentials)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.members(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    certificate_number TEXT NOT NULL UNIQUE,
    verification_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked', 'expired')),
    file_url TEXT,
    issuer_name TEXT NOT NULL DEFAULT 'St. Mary''s English School IT Club',
    metadata JSONB DEFAULT '{}'::jsonb,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_certificate_dates CHECK (expiry_date IS NULL OR expiry_date >= issue_date)
);

CREATE TRIGGER set_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. EVENTS & PARTICIPANTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'Workshop' CHECK (event_type IN ('Workshop', 'Seminar', 'Competition', 'Coding Challenge', 'Meeting', 'Hackathon')),
    location TEXT NOT NULL DEFAULT 'Computer Lab 1',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_status TEXT NOT NULL DEFAULT 'open' CHECK (registration_status IN ('open', 'closed', 'waitlist', 'not_required')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    cover_image_url TEXT,
    max_participants INTEGER CHECK (max_participants IS NULL OR max_participants > 0),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_event_times CHECK (end_time > start_time)
);

CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'waitlisted')),
    attended BOOLEAN NOT NULL DEFAULT false,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(event_id, member_id)
);

-- ==============================================================================
-- 9. NOTICES & ANNOUNCEMENTS (Content Lifecycle)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Academic', 'Event', 'Quiz', 'Urgent', 'Competition')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'unpublished', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'admin_only')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_popup BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_notice_dates CHECK (expires_at IS NULL OR published_at IS NULL OR expires_at > published_at)
);

CREATE TRIGGER set_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 10. NOTIFICATIONS (Cross-Device Persistent Notifications)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'alert', 'event', 'certificate', 'quiz', 'notice', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 11. GALLERY ALBUMS & IMAGES (Storage Metadata References)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_gallery_albums_updated_at
BEFORE UPDATE ON public.gallery_albums
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 12. LEARNING RESOURCES & FILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.resource_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.resource_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    resource_type TEXT NOT NULL DEFAULT 'tutorial' CHECK (resource_type IN ('pdf', 'document', 'worksheet', 'tutorial', 'code', 'link')),
    subject TEXT NOT NULL DEFAULT 'Computer Science',
    class_level TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.resource_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
    mime_type TEXT NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 13. QUIZZES, QUESTIONS & OPTIONS (Relational Quiz Engine)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT,
    category TEXT NOT NULL DEFAULT 'General IT',
    duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes > 0),
    total_marks INTEGER NOT NULL DEFAULT 100 CHECK (total_marks > 0),
    passing_marks INTEGER NOT NULL DEFAULT 40 CHECK (passing_marks >= 0 AND passing_marks <= total_marks),
    attempt_limit INTEGER NOT NULL DEFAULT 1 CHECK (attempt_limit > 0),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'closed')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_quiz_times CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE TRIGGER set_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_text')),
    marks INTEGER NOT NULL DEFAULT 1 CHECK (marks > 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 14. QUIZ ATTEMPTS, ANSWERS & RESULTS (Persistent Evaluation Engine)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'evaluated', 'abandoned')),
    score NUMERIC(5,2) DEFAULT 0.00 CHECK (score >= 0),
    percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (percentage >= 0 AND percentage <= 100),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(quiz_id, user_id, attempt_number)
);

CREATE TRIGGER set_quiz_attempts_updated_at
BEFORE UPDATE ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE RESTRICT,
    selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE SET NULL,
    text_response TEXT,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(5,2) DEFAULT 0.00 CHECK (marks_awarded >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE UNIQUE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (total_score >= 0),
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (percentage >= 0 AND percentage <= 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 15. ACADEMIC QUESTION PAPERS & EXAM DOCUMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.exam_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    class_grade TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('Half-Yearly', 'Annual', 'Pre-Board', 'Unit Test', 'Model Paper', 'Entrance')),
    document_type TEXT NOT NULL DEFAULT 'question_paper' CHECK (document_type IN ('question_paper', 'sample_paper', 'answer_key', 'syllabus', 'worksheet', 'study_material')),
    description TEXT,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
    download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'admin_only')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_exam_documents_updated_at
BEFORE UPDATE ON public.exam_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 16. EXAM RESULTS (Official Academic & Club Test Results)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
    document_id UUID REFERENCES public.exam_documents(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
    max_marks NUMERIC(5,2) NOT NULL CHECK (max_marks > 0),
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    grade TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'withheld', 'archived')),
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT chk_result_marks CHECK (marks_obtained <= max_marks)
);

CREATE TRIGGER set_exam_results_updated_at
BEFORE UPDATE ON public.exam_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 17. CONTACT MESSAGES (Public Inquiries)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    handled_at TIMESTAMPTZ,
    handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 18. FILE STORAGE METADATA (Supabase Storage Sync)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
    entity_type TEXT,
    entity_id UUID,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_file_metadata_updated_at
BEFORE UPDATE ON public.file_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 19. SITE SETTINGS (System Configuration)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 20. AUDIT LOGS (Immutable Administrative Tracking)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 21. HIGH-PERFORMANCE TARGETED INDEXES
-- ==============================================================================

-- Profiles & Members
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status_vis ON public.members(status, public_visibility);
CREATE INDEX IF NOT EXISTS idx_members_featured ON public.members(is_featured) WHERE is_featured = true;

-- Skills & Junctions
CREATE INDEX IF NOT EXISTS idx_member_skills_member ON public.member_skills(member_id);
CREATE INDEX IF NOT EXISTS idx_member_skills_skill ON public.member_skills(skill_id);

-- Projects & Junctions
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status_vis ON public.projects(status, visibility);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_member ON public.project_members(member_id);

-- Achievements & Certificates
CREATE INDEX IF NOT EXISTS idx_achievements_member ON public.achievements(member_id);
CREATE INDEX IF NOT EXISTS idx_achievements_featured ON public.achievements(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_certificates_recipient ON public.certificates(recipient_id);
CREATE INDEX IF NOT EXISTS idx_certificates_vcode ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- Events & Participants
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_times ON public.events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_events_status_vis ON public.events(registration_status, visibility);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_member ON public.event_participants(member_id);

-- Notices & Notifications
CREATE INDEX IF NOT EXISTS idx_notices_slug ON public.notices(slug);
CREATE INDEX IF NOT EXISTS idx_notices_status_vis ON public.notices(status, visibility);
CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- Gallery & Resources
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON public.gallery_images(album_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resource_files_resource ON public.resource_files(resource_id);

-- Quizzes, Questions & Attempts
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_status_vis ON public.quizzes(status, visibility);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_user ON public.quiz_attempts(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON public.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.quiz_results(user_id);

-- Exam Documents & Results
CREATE INDEX IF NOT EXISTS idx_exam_docs_slug ON public.exam_documents(slug);
CREATE INDEX IF NOT EXISTS idx_exam_docs_class_subject ON public.exam_documents(class_grade, subject);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.exam_results(student_id);

-- Contact Messages, File Metadata, Audit
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_file_metadata_bucket ON public.file_metadata(bucket_name, storage_path);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 22. ROW LEVEL SECURITY (RLS) ACTIVATION & POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Helper Functions (SECURITY DEFINER, explicit search_path)
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF check_user_id IS NULL OR check_role IS NULL THEN RETURN FALSE; END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id AND r.name = check_role AND p.status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF check_user_id IS NULL THEN RETURN FALSE; END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id AND r.name IN ('admin', 'super_admin') AND p.status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_faculty_moderator(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF check_user_id IS NULL THEN RETURN FALSE; END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id AND r.name IN ('admin', 'super_admin', 'faculty_moderator') AND p.status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_active_member(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF check_user_id IS NULL THEN RETURN FALSE; END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = check_user_id AND p.status = 'active'
    );
END;
$$;

-- Automatic user provisioning on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE default_role_id UUID;
BEGIN
    INSERT INTO public.profiles (id, display_name, full_name, avatar_url, status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'active', NOW(), NOW()
    ) ON CONFLICT (id) DO NOTHING;

    SELECT id INTO default_role_id FROM public.roles WHERE name = 'member';
    IF default_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (NEW.id, default_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles
CREATE POLICY "profiles_select_public_active" ON public.profiles FOR SELECT USING (status = 'active' OR auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));

-- Roles & Permissions
CREATE POLICY "roles_select_auth" ON public.roles FOR SELECT USING (auth.uid() IS NOT NULL OR public.is_admin(auth.uid()));
CREATE POLICY "roles_write_admin" ON public.roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "permissions_select_auth" ON public.permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "permissions_write_admin" ON public.permissions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "role_permissions_select_auth" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "role_permissions_write_admin" ON public.role_permissions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- User Roles (Anti-Privilege Escalation: zero ordinary client write access)
CREATE POLICY "user_roles_select_self_or_admin" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles_write_admin" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Members
CREATE POLICY "members_select_public" ON public.members FOR SELECT USING ((status = 'active' AND public_visibility = true) OR user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "members_insert_admin" ON public.members FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "members_update_self_or_admin" ON public.members FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "members_delete_admin" ON public.members FOR DELETE USING (public.is_admin(auth.uid()));

-- Skills & Member Skills
CREATE POLICY "skills_select_all" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills_write_admin" ON public.skills FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "member_skills_select" ON public.member_skills FOR SELECT USING (EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_skills.member_id AND ((m.status = 'active' AND m.portfolio_visibility = true) OR m.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "member_skills_write_owner_or_admin" ON public.member_skills FOR ALL USING (EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_skills.member_id AND (m.user_id = auth.uid() OR public.is_admin(auth.uid())))) WITH CHECK (EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_skills.member_id AND (m.user_id = auth.uid() OR public.is_admin(auth.uid()))));

-- Projects & Project Members
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING ((status = 'published' AND visibility = 'public') OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "projects_insert_auth" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR public.is_admin(auth.uid())));
CREATE POLICY "projects_update_owner_or_admin" ON public.projects FOR UPDATE USING (created_by = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (created_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "projects_delete_owner_or_admin" ON public.projects FOR DELETE USING (public.is_admin(auth.uid()) OR (created_by = auth.uid() AND status = 'draft'));
CREATE POLICY "project_members_select" ON public.project_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND ((p.status = 'published' AND p.visibility = 'public') OR (auth.uid() IS NOT NULL AND p.status = 'published' AND p.visibility = 'members_only') OR p.created_by = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "project_members_write_owner_or_admin" ON public.project_members FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND (p.created_by = auth.uid() OR public.is_admin(auth.uid())))) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_members.project_id AND (p.created_by = auth.uid() OR public.is_admin(auth.uid()))));

-- Achievements & Certificates
CREATE POLICY "achievements_select" ON public.achievements FOR SELECT USING (visibility = 'public' OR (auth.uid() IS NOT NULL AND visibility = 'members_only') OR public.is_admin(auth.uid()));
CREATE POLICY "achievements_write_admin" ON public.achievements FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "certificates_select" ON public.certificates FOR SELECT USING (status = 'valid' OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = certificates.recipient_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "certificates_write_admin" ON public.certificates FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));

-- Events & Event Participants
CREATE POLICY "events_select" ON public.events FOR SELECT USING (visibility = 'public' OR (auth.uid() IS NOT NULL AND visibility = 'members_only') OR public.is_admin(auth.uid()));
CREATE POLICY "events_write_admin" ON public.events FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "event_participants_select" ON public.event_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.members m WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "event_participants_insert_self" ON public.event_participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.members m WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "event_participants_update_self_or_admin" ON public.event_participants FOR UPDATE USING (EXISTS (SELECT 1 FROM public.members m WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.members m WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "event_participants_delete_self_or_admin" ON public.event_participants FOR DELETE USING (EXISTS (SELECT 1 FROM public.members m WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()) OR public.is_admin(auth.uid()));

-- Notices & Notifications
CREATE POLICY "notices_select" ON public.notices FOR SELECT USING ((status = 'published' AND visibility = 'public' AND (expires_at IS NULL OR expires_at > NOW())) OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only' AND (expires_at IS NULL OR expires_at > NOW())) OR public.is_admin(auth.uid()));
CREATE POLICY "notices_write_admin" ON public.notices FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "notifications_select_recipient" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications_update_recipient" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "notifications_insert_admin" ON public.notifications FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "notifications_delete_recipient_or_admin" ON public.notifications FOR DELETE USING (recipient_id = auth.uid() OR public.is_admin(auth.uid()));

-- Gallery
CREATE POLICY "gallery_albums_select" ON public.gallery_albums FOR SELECT USING ((status = 'published' AND visibility = 'public') OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR public.is_admin(auth.uid()));
CREATE POLICY "gallery_albums_write_admin" ON public.gallery_albums FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "gallery_images_select" ON public.gallery_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = gallery_images.album_id AND ((a.status = 'published' AND a.visibility = 'public') OR (auth.uid() IS NOT NULL AND a.status = 'published' AND a.visibility = 'members_only') OR public.is_admin(auth.uid()))));
CREATE POLICY "gallery_images_write_admin" ON public.gallery_images FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Resources
CREATE POLICY "resource_categories_select_all" ON public.resource_categories FOR SELECT USING (true);
CREATE POLICY "resource_categories_write_admin" ON public.resource_categories FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "resources_select" ON public.resources FOR SELECT USING ((status = 'published' AND visibility = 'public') OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "resources_write_admin" ON public.resources FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "resource_files_select" ON public.resource_files FOR SELECT USING (EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_files.resource_id AND ((r.status = 'published' AND r.visibility = 'public') OR (auth.uid() IS NOT NULL AND r.status = 'published' AND r.visibility = 'members_only') OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))));
CREATE POLICY "resource_files_write_admin" ON public.resource_files FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));

-- Quizzes
CREATE POLICY "quizzes_select" ON public.quizzes FOR SELECT USING ((status = 'published' AND visibility = 'public' AND (end_time IS NULL OR end_time > NOW())) OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only' AND (end_time IS NULL OR end_time > NOW())) OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "quizzes_write_admin" ON public.quizzes FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "quiz_questions_select" ON public.quiz_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_questions.quiz_id AND (q.status = 'published' OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))));
CREATE POLICY "quiz_questions_write_admin" ON public.quiz_questions FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "quiz_options_select" ON public.quiz_options FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_questions qq JOIN public.quizzes q ON q.id = qq.quiz_id WHERE qq.id = quiz_options.question_id AND (q.status = 'published' OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))));
CREATE POLICY "quiz_options_write_admin" ON public.quiz_options FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "quiz_attempts_select" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "quiz_attempts_insert_self" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid() AND status = 'in_progress');
CREATE POLICY "quiz_attempts_update_self_or_admin" ON public.quiz_attempts FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "quiz_attempts_delete_admin" ON public.quiz_attempts FOR DELETE USING (public.is_admin(auth.uid()));
CREATE POLICY "quiz_answers_select" ON public.quiz_answers FOR SELECT USING (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = quiz_answers.attempt_id AND (qa.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "quiz_answers_insert_self" ON public.quiz_answers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = quiz_answers.attempt_id AND qa.user_id = auth.uid() AND qa.status = 'in_progress'));
CREATE POLICY "quiz_answers_update_self" ON public.quiz_answers FOR UPDATE USING (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = quiz_answers.attempt_id AND qa.user_id = auth.uid() AND qa.status = 'in_progress')) WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = quiz_answers.attempt_id AND qa.user_id = auth.uid() AND qa.status = 'in_progress'));
CREATE POLICY "quiz_answers_delete_admin" ON public.quiz_answers FOR DELETE USING (public.is_admin(auth.uid()));
CREATE POLICY "quiz_results_select" ON public.quiz_results FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "quiz_results_write_admin" ON public.quiz_results FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));

-- Exams
CREATE POLICY "exam_documents_select" ON public.exam_documents FOR SELECT USING ((status = 'published' AND visibility = 'public') OR (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "exam_documents_write_admin" ON public.exam_documents FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "exam_results_select" ON public.exam_results FOR SELECT USING ((status = 'published' AND EXISTS (SELECT 1 FROM public.members m WHERE m.id = exam_results.student_id AND m.user_id = auth.uid())) OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));
CREATE POLICY "exam_results_write_admin" ON public.exam_results FOR ALL USING (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())) WITH CHECK (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()));

-- Contact Messages
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select_admin" ON public.contact_messages FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "contact_messages_update_admin" ON public.contact_messages FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "contact_messages_delete_admin" ON public.contact_messages FOR DELETE USING (public.is_admin(auth.uid()));

-- Storage Metadata & Site Settings
CREATE POLICY "file_metadata_select" ON public.file_metadata FOR SELECT USING (bucket_name IN ('public-assets', 'gallery', 'resources') OR uploaded_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "file_metadata_insert_auth" ON public.file_metadata FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (uploaded_by = auth.uid() OR public.is_admin(auth.uid())));
CREATE POLICY "file_metadata_update_owner_or_admin" ON public.file_metadata FOR UPDATE USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "file_metadata_delete_owner_or_admin" ON public.file_metadata FOR DELETE USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "site_settings_select_public" ON public.site_settings FOR SELECT USING (is_public = true OR public.is_admin(auth.uid()));
CREATE POLICY "site_settings_write_admin" ON public.site_settings FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Audit Logs (Immutable append-only)
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "audit_logs_insert_trusted" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 23. FOUNDATIONAL SEED DATA (System Roles & Initial Site Settings)
-- ==============================================================================

-- System Roles
INSERT INTO public.roles (name, description, is_system) VALUES
('super_admin', 'Full platform authority, configuration, user role management', true),
('admin', 'Club administrator, content publishing, event and notice management', true),
('faculty_moderator', 'Teacher/faculty moderator overseeing academic papers, results, and certificates', true),
('member', 'Standard verified IT Club student member with portfolio and quiz access', true)
ON CONFLICT (name) DO NOTHING;

-- Initial Site Settings
INSERT INTO public.site_settings (key, value, description, is_public) VALUES
('general', '{"club_name": "St. Mary''s English School IT Club", "motto": "Innovation, Discipline, and Digital Excellence", "established_year": 2024, "contact_email": "itclub@stmarys.edu"}'::jsonb, 'General school club branding and public information', true),
('features', '{"quizzes_enabled": true, "certificate_verification_enabled": true, "question_papers_enabled": true, "member_portfolios_enabled": true}'::jsonb, 'Platform feature flag configurations', true)
ON CONFLICT (key) DO NOTHING;
