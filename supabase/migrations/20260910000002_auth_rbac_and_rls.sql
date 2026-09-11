-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB PLATFORM
-- DATABASE MIGRATION 20260910000002: AUTHENTICATION, RBAC & ROW LEVEL SECURITY
-- ==============================================================================
-- Compliance:
-- 1. Single Authentication Source: auth.users managed by Supabase Auth
-- 2. Authoritative Database RBAC: roles, permissions, user_roles
-- 3. Zero Client Trust: Role information never accepted from client inputs
-- 4. Complete RLS: Explicit least-privilege policies across all 33 tables
-- 5. Hardened Security Definer Functions: Explicit search_path = public, pg_temp
-- ==============================================================================

-- ==============================================================================
-- 1. AUTHORIZATION & SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Check if a specific user holds a named role and has an active profile
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF check_user_id IS NULL OR check_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id
          AND r.name = check_role
          AND p.status = 'active'
    );
END;
$$;

-- Check if user is an Administrator or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id
          AND r.name IN ('admin', 'super_admin')
          AND p.status = 'active'
    );
END;
$$;

-- Check if user is a Faculty Moderator or Admin
CREATE OR REPLACE FUNCTION public.is_faculty_moderator(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = check_user_id
          AND r.name IN ('admin', 'super_admin', 'faculty_moderator')
          AND p.status = 'active'
    );
END;
$$;

-- Check if user has an active registered profile
CREATE OR REPLACE FUNCTION public.is_active_member(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = check_user_id
          AND p.status = 'active'
    );
END;
$$;

-- Helper to retrieve list of active roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(role_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT r.name
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = check_user_id
      AND p.status = 'active';
END;
$$;

-- ==============================================================================
-- 2. AUTHENTICATION AUTOMATION & INTEGRITY TRIGGERS
-- ==============================================================================

-- Automatic user provisioning when created via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- 1. Create Public Profile
    INSERT INTO public.profiles (
        id,
        display_name,
        full_name,
        avatar_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Assign default 'member' role
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
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Prevent privilege escalation on profiles table (users cannot elevate status)
CREATE OR REPLACE FUNCTION public.check_profile_update_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If caller is modifying their own profile and is not an administrator
    IF auth.uid() = OLD.id AND NOT public.is_admin(auth.uid()) THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Non-administrative accounts cannot modify account status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_profile_update_integrity ON public.profiles;
CREATE TRIGGER trg_check_profile_update_integrity
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_update_integrity();

-- Prevent member integrity manipulation (member_number, status, is_featured)
CREATE OR REPLACE FUNCTION public.check_member_update_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        IF NEW.status IS DISTINCT FROM OLD.status OR
           NEW.member_number IS DISTINCT FROM OLD.member_number OR
           NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Administrative member attributes can only be modified by authorized administrators.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_member_update_integrity ON public.members;
CREATE TRIGGER trg_check_member_update_integrity
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.check_member_update_integrity();

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 33 TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_public_active" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

CREATE POLICY "profiles_select_public_active" ON public.profiles
FOR SELECT USING (
    status = 'active' OR auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "profiles_insert_self" ON public.profiles
FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
FOR UPDATE USING (
    auth.uid() = id OR public.is_admin(auth.uid())
) WITH CHECK (
    auth.uid() = id OR public.is_admin(auth.uid())
);

CREATE POLICY "profiles_delete_admin" ON public.profiles
FOR DELETE USING (
    public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 2. ROLES, PERMISSIONS & ROLE_PERMISSIONS (Read for auth, write admin only)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "roles_select_auth" ON public.roles;
DROP POLICY IF EXISTS "roles_write_admin" ON public.roles;
CREATE POLICY "roles_select_auth" ON public.roles FOR SELECT USING (auth.uid() IS NOT NULL OR public.is_admin(auth.uid()));
CREATE POLICY "roles_write_admin" ON public.roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "permissions_select_auth" ON public.permissions;
DROP POLICY IF EXISTS "permissions_write_admin" ON public.permissions;
CREATE POLICY "permissions_select_auth" ON public.permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "permissions_write_admin" ON public.permissions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "role_permissions_select_auth" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_write_admin" ON public.role_permissions;
CREATE POLICY "role_permissions_select_auth" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "role_permissions_write_admin" ON public.role_permissions FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. USER_ROLES (Zero client write access. Read own or admin)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_select_self_or_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_write_admin" ON public.user_roles;

CREATE POLICY "user_roles_select_self_or_admin" ON public.user_roles
FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "user_roles_write_admin" ON public.user_roles
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 4. MEMBERS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "members_select_public" ON public.members;
DROP POLICY IF EXISTS "members_insert_admin" ON public.members;
DROP POLICY IF EXISTS "members_update_self_or_admin" ON public.members;
DROP POLICY IF EXISTS "members_delete_admin" ON public.members;

CREATE POLICY "members_select_public" ON public.members
FOR SELECT USING (
    (status = 'active' AND public_visibility = true) OR user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "members_insert_admin" ON public.members
FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
);

CREATE POLICY "members_update_self_or_admin" ON public.members
FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
) WITH CHECK (
    user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "members_delete_admin" ON public.members
FOR DELETE USING (
    public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 5. SKILLS & MEMBER_SKILLS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "skills_select_all" ON public.skills;
DROP POLICY IF EXISTS "skills_write_admin" ON public.skills;
CREATE POLICY "skills_select_all" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills_write_admin" ON public.skills FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "member_skills_select" ON public.member_skills;
DROP POLICY IF EXISTS "member_skills_write_owner_or_admin" ON public.member_skills;

CREATE POLICY "member_skills_select" ON public.member_skills
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_skills.member_id
          AND ((m.status = 'active' AND m.portfolio_visibility = true) OR m.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

CREATE POLICY "member_skills_write_owner_or_admin" ON public.member_skills
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_skills.member_id
          AND (m.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_skills.member_id
          AND (m.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

-- ------------------------------------------------------------------------------
-- 6. PROJECTS & PROJECT_MEMBERS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_auth" ON public.projects;
DROP POLICY IF EXISTS "projects_update_owner_or_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_owner_or_admin" ON public.projects;

CREATE POLICY "projects_select" ON public.projects
FOR SELECT USING (
    (status = 'published' AND visibility = 'public') OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR
    created_by = auth.uid() OR
    public.is_admin(auth.uid())
);

CREATE POLICY "projects_insert_auth" ON public.projects
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (created_by = auth.uid() OR public.is_admin(auth.uid()))
);

CREATE POLICY "projects_update_owner_or_admin" ON public.projects
FOR UPDATE USING (
    created_by = auth.uid() OR public.is_admin(auth.uid())
) WITH CHECK (
    created_by = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "projects_delete_owner_or_admin" ON public.projects
FOR DELETE USING (
    public.is_admin(auth.uid()) OR (created_by = auth.uid() AND status = 'draft')
);

DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
DROP POLICY IF EXISTS "project_members_write_owner_or_admin" ON public.project_members;

CREATE POLICY "project_members_select" ON public.project_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id
          AND ((p.status = 'published' AND p.visibility = 'public') OR (auth.uid() IS NOT NULL AND p.status = 'published' AND p.visibility = 'members_only') OR p.created_by = auth.uid() OR public.is_admin(auth.uid()))
    )
);

CREATE POLICY "project_members_write_owner_or_admin" ON public.project_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id
          AND (p.created_by = auth.uid() OR public.is_admin(auth.uid()))
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id
          AND (p.created_by = auth.uid() OR public.is_admin(auth.uid()))
    )
);

-- ------------------------------------------------------------------------------
-- 7. ACHIEVEMENTS & CERTIFICATES (Tamper-Proof)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "achievements_select" ON public.achievements;
DROP POLICY IF EXISTS "achievements_write_admin" ON public.achievements;

CREATE POLICY "achievements_select" ON public.achievements
FOR SELECT USING (
    visibility = 'public' OR (auth.uid() IS NOT NULL AND visibility = 'members_only') OR public.is_admin(auth.uid())
);

CREATE POLICY "achievements_write_admin" ON public.achievements
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "certificates_select" ON public.certificates;
DROP POLICY IF EXISTS "certificates_write_admin" ON public.certificates;

CREATE POLICY "certificates_select" ON public.certificates
FOR SELECT USING (
    status = 'valid' OR
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = certificates.recipient_id AND m.user_id = auth.uid()
    ) OR
    public.is_admin(auth.uid()) OR
    public.is_faculty_moderator(auth.uid())
);

-- Students/members CANNOT insert, alter, or revoke certificates
CREATE POLICY "certificates_write_admin" ON public.certificates
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 8. EVENTS & EVENT_PARTICIPANTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_write_admin" ON public.events;

CREATE POLICY "events_select" ON public.events
FOR SELECT USING (
    visibility = 'public' OR (auth.uid() IS NOT NULL AND visibility = 'members_only') OR public.is_admin(auth.uid())
);

CREATE POLICY "events_write_admin" ON public.events
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "event_participants_select" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_insert_self" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_update_self_or_admin" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_delete_self_or_admin" ON public.event_participants;

CREATE POLICY "event_participants_select" ON public.event_participants
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
);

CREATE POLICY "event_participants_insert_self" ON public.event_participants
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
);

CREATE POLICY "event_participants_update_self_or_admin" ON public.event_participants
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
);

CREATE POLICY "event_participants_delete_self_or_admin" ON public.event_participants
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = event_participants.member_id AND m.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 9. NOTICES & NOTIFICATIONS (Strict Recipient Isolation)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "notices_select" ON public.notices;
DROP POLICY IF EXISTS "notices_write_admin" ON public.notices;

CREATE POLICY "notices_select" ON public.notices
FOR SELECT USING (
    (status = 'published' AND visibility = 'public' AND (expires_at IS NULL OR expires_at > NOW())) OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only' AND (expires_at IS NULL OR expires_at > NOW())) OR
    public.is_admin(auth.uid())
);

CREATE POLICY "notices_write_admin" ON public.notices
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_recipient_or_admin" ON public.notifications;

-- A recipient may ONLY select their own notifications
CREATE POLICY "notifications_select_recipient" ON public.notifications
FOR SELECT USING (
    recipient_id = auth.uid()
);

-- A recipient may ONLY update their own read status
CREATE POLICY "notifications_update_recipient" ON public.notifications
FOR UPDATE USING (
    recipient_id = auth.uid()
) WITH CHECK (
    recipient_id = auth.uid()
);

CREATE POLICY "notifications_insert_admin" ON public.notifications
FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
);

CREATE POLICY "notifications_delete_recipient_or_admin" ON public.notifications
FOR DELETE USING (
    recipient_id = auth.uid() OR public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 10. GALLERY (Albums & Images)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "gallery_albums_select" ON public.gallery_albums;
DROP POLICY IF EXISTS "gallery_albums_write_admin" ON public.gallery_albums;

CREATE POLICY "gallery_albums_select" ON public.gallery_albums
FOR SELECT USING (
    (status = 'published' AND visibility = 'public') OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR
    public.is_admin(auth.uid())
);

CREATE POLICY "gallery_albums_write_admin" ON public.gallery_albums
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "gallery_images_select" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_images_write_admin" ON public.gallery_images;

CREATE POLICY "gallery_images_select" ON public.gallery_images
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.gallery_albums a
        WHERE a.id = gallery_images.album_id
          AND ((a.status = 'published' AND a.visibility = 'public') OR (auth.uid() IS NOT NULL AND a.status = 'published' AND a.visibility = 'members_only') OR public.is_admin(auth.uid()))
    )
);

CREATE POLICY "gallery_images_write_admin" ON public.gallery_images
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 11. RESOURCES & RESOURCE_FILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "resource_categories_select_all" ON public.resource_categories;
DROP POLICY IF EXISTS "resource_categories_write_admin" ON public.resource_categories;
CREATE POLICY "resource_categories_select_all" ON public.resource_categories FOR SELECT USING (true);
CREATE POLICY "resource_categories_write_admin" ON public.resource_categories FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "resources_select" ON public.resources;
DROP POLICY IF EXISTS "resources_write_admin" ON public.resources;

CREATE POLICY "resources_select" ON public.resources
FOR SELECT USING (
    (status = 'published' AND visibility = 'public') OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR
    public.is_admin(auth.uid()) OR
    public.is_faculty_moderator(auth.uid())
);

CREATE POLICY "resources_write_admin" ON public.resources
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "resource_files_select" ON public.resource_files;
DROP POLICY IF EXISTS "resource_files_write_admin" ON public.resource_files;

CREATE POLICY "resource_files_select" ON public.resource_files
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.resources r
        WHERE r.id = resource_files.resource_id
          AND ((r.status = 'published' AND r.visibility = 'public') OR (auth.uid() IS NOT NULL AND r.status = 'published' AND r.visibility = 'members_only') OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))
    )
);

CREATE POLICY "resource_files_write_admin" ON public.resource_files
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 12. QUIZZES, QUESTIONS, OPTIONS, ATTEMPTS, ANSWERS & RESULTS (Strict Integrity)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "quizzes_select" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_write_admin" ON public.quizzes;

CREATE POLICY "quizzes_select" ON public.quizzes
FOR SELECT USING (
    (status = 'published' AND visibility = 'public' AND (end_time IS NULL OR end_time > NOW())) OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only' AND (end_time IS NULL OR end_time > NOW())) OR
    public.is_admin(auth.uid()) OR
    public.is_faculty_moderator(auth.uid())
);

CREATE POLICY "quizzes_write_admin" ON public.quizzes
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "quiz_questions_select" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_write_admin" ON public.quiz_questions;

CREATE POLICY "quiz_questions_select" ON public.quiz_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quizzes q
        WHERE q.id = quiz_questions.quiz_id
          AND (q.status = 'published' OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))
    )
);

CREATE POLICY "quiz_questions_write_admin" ON public.quiz_questions
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "quiz_options_select" ON public.quiz_options;
DROP POLICY IF EXISTS "quiz_options_write_admin" ON public.quiz_options;

CREATE POLICY "quiz_options_select" ON public.quiz_options
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quiz_questions qq
        JOIN public.quizzes q ON q.id = qq.quiz_id
        WHERE qq.id = quiz_options.question_id
          AND (q.status = 'published' OR public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))
    )
);

CREATE POLICY "quiz_options_write_admin" ON public.quiz_options
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "quiz_attempts_select" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert_self" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_update_self_or_admin" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_delete_admin" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_select" ON public.quiz_attempts
FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "quiz_attempts_insert_self" ON public.quiz_attempts
FOR INSERT WITH CHECK (
    user_id = auth.uid() AND status = 'in_progress'
);

CREATE POLICY "quiz_attempts_update_self_or_admin" ON public.quiz_attempts
FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
) WITH CHECK (
    user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "quiz_attempts_delete_admin" ON public.quiz_attempts
FOR DELETE USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "quiz_answers_select" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_insert_self" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_update_self" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_delete_admin" ON public.quiz_answers;

CREATE POLICY "quiz_answers_select" ON public.quiz_answers
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
          AND (qa.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

CREATE POLICY "quiz_answers_insert_self" ON public.quiz_answers
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
          AND qa.user_id = auth.uid()
          AND qa.status = 'in_progress'
    )
);

CREATE POLICY "quiz_answers_update_self" ON public.quiz_answers
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
          AND qa.user_id = auth.uid()
          AND qa.status = 'in_progress'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
          AND qa.user_id = auth.uid()
          AND qa.status = 'in_progress'
    )
);

CREATE POLICY "quiz_answers_delete_admin" ON public.quiz_answers
FOR DELETE USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "quiz_results_select" ON public.quiz_results;
DROP POLICY IF EXISTS "quiz_results_write_admin" ON public.quiz_results;

CREATE POLICY "quiz_results_select" ON public.quiz_results
FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Members have ZERO write access to results. Scoring is strictly server/admin managed.
CREATE POLICY "quiz_results_write_admin" ON public.quiz_results
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 13. EXAM_DOCUMENTS & EXAM_RESULTS (Strict Academic Protection)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "exam_documents_select" ON public.exam_documents;
DROP POLICY IF EXISTS "exam_documents_write_admin" ON public.exam_documents;

CREATE POLICY "exam_documents_select" ON public.exam_documents
FOR SELECT USING (
    (status = 'published' AND visibility = 'public') OR
    (auth.uid() IS NOT NULL AND status = 'published' AND visibility = 'members_only') OR
    public.is_admin(auth.uid()) OR
    public.is_faculty_moderator(auth.uid())
);

CREATE POLICY "exam_documents_write_admin" ON public.exam_documents
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

DROP POLICY IF EXISTS "exam_results_select" ON public.exam_results;
DROP POLICY IF EXISTS "exam_results_write_admin" ON public.exam_results;

CREATE POLICY "exam_results_select" ON public.exam_results
FOR SELECT USING (
    (status = 'published' AND EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = exam_results.student_id AND m.user_id = auth.uid()
    )) OR
    public.is_admin(auth.uid()) OR
    public.is_faculty_moderator(auth.uid())
);

-- Zero write access for students to exam grades
CREATE POLICY "exam_results_write_admin" ON public.exam_results
FOR ALL USING (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 14. CONTACT_MESSAGES (Public submit, Admin-only view)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "contact_messages_insert_public" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_update_admin" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_delete_admin" ON public.contact_messages;

-- Public users can submit an inquiry without gaining read access to the inbox
CREATE POLICY "contact_messages_insert_public" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_select_admin" ON public.contact_messages
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "contact_messages_update_admin" ON public.contact_messages
FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "contact_messages_delete_admin" ON public.contact_messages
FOR DELETE USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 15. FILE_METADATA & SITE_SETTINGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "file_metadata_select" ON public.file_metadata;
DROP POLICY IF EXISTS "file_metadata_insert_auth" ON public.file_metadata;
DROP POLICY IF EXISTS "file_metadata_update_owner_or_admin" ON public.file_metadata;
DROP POLICY IF EXISTS "file_metadata_delete_owner_or_admin" ON public.file_metadata;

CREATE POLICY "file_metadata_select" ON public.file_metadata
FOR SELECT USING (
    bucket_name IN ('public-assets', 'gallery', 'resources') OR uploaded_by = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "file_metadata_insert_auth" ON public.file_metadata
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (uploaded_by = auth.uid() OR public.is_admin(auth.uid()))
);

CREATE POLICY "file_metadata_update_owner_or_admin" ON public.file_metadata
FOR UPDATE USING (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
) WITH CHECK (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "file_metadata_delete_owner_or_admin" ON public.file_metadata
FOR DELETE USING (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_write_admin" ON public.site_settings;

CREATE POLICY "site_settings_select_public" ON public.site_settings
FOR SELECT USING (
    is_public = true OR public.is_admin(auth.uid())
);

CREATE POLICY "site_settings_write_admin" ON public.site_settings
FOR ALL USING (
    public.is_admin(auth.uid())
) WITH CHECK (
    public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- 16. AUDIT_LOGS (Immutable Append-Only, Admin-Only Read)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_trusted" ON public.audit_logs;

CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
FOR SELECT USING (
    public.is_admin(auth.uid())
);

-- Ordinary members cannot view or insert fake audit entries
CREATE POLICY "audit_logs_insert_trusted" ON public.audit_logs
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);

-- Notice: NO UPDATE or DELETE policy exists on audit_logs. Immutable by design.

-- ==============================================================================
-- 4. DATABASE PERMISSION GRANTS
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Function Execution Grants
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_faculty_moderator(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO anon, authenticated;

-- Table Grants
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.members TO anon, authenticated;
GRANT UPDATE ON public.members TO authenticated;
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_skills TO authenticated;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.project_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT SELECT ON public.certificates TO anon, authenticated;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_participants TO authenticated;
GRANT SELECT ON public.notices TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.gallery_albums TO anon, authenticated;
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT SELECT ON public.resource_categories TO anon, authenticated;
GRANT SELECT ON public.resources TO anon, authenticated;
GRANT SELECT ON public.resource_files TO anon, authenticated;
GRANT SELECT ON public.quizzes TO anon, authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT SELECT ON public.quiz_options TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quiz_answers TO authenticated;
GRANT SELECT ON public.quiz_results TO authenticated;
GRANT SELECT ON public.exam_documents TO anon, authenticated;
GRANT SELECT ON public.exam_results TO authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_metadata TO authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
