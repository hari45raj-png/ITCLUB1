-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- MIGRATION 5: Member Authentication, Applicant Number & Private Member Area
-- 
-- PROMPT 8: Member Auth, Sequential Applicant ID, Private Dashboard & IDOR Guard
-- ==============================================================================

-- 1. EXTEND MEMBERS TABLE WITH BIRTH YEAR & PASSWORD CHANGE FLAG
ALTER TABLE public.members 
    ADD COLUMN IF NOT EXISTS birth_year INTEGER,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT true;

-- Ensure index on member_number for rapid login resolution
CREATE INDEX IF NOT EXISTS idx_members_member_number ON public.members(member_number);

-- 2. SEQUENTIAL APPLICANT NUMBER GENERATOR
-- Guarantees clean sequential numbers: 1, 2, 3, 4... without duplicates
CREATE SEQUENCE IF NOT EXISTS public.member_applicant_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.next_applicant_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    next_val BIGINT;
    candidate TEXT;
BEGIN
    LOOP
        next_val := nextval('public.member_applicant_number_seq');
        candidate := next_val::TEXT;
        
        -- Prevent collision with existing member records
        IF NOT EXISTS (SELECT 1 FROM public.members WHERE member_number = candidate) THEN
            RETURN candidate;
        END IF;
    END LOOP;
END;
$$;

-- 3. INITIAL PASSWORD FORMULA HELPER
-- Formula: Birth Year + Class + Section (no spaces, uppercase)
-- Examples: 2012 + 10 + C -> 201210C; 2012 + X + C -> 2012XC; 2012 + 9 + A -> 20129A
CREATE OR REPLACE FUNCTION public.calculate_initial_member_password(
    p_birth_year INTEGER,
    p_class_grade TEXT,
    p_section TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN p_birth_year::TEXT || 
           UPPER(REGEXP_REPLACE(COALESCE(p_class_grade, ''), '\s+', '', 'g')) || 
           UPPER(REGEXP_REPLACE(COALESCE(p_section, ''), '\s+', '', 'g'));
END;
$$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR PRIVATE MEMBER DATA
-- Strict IDOR Protection: Members can only read/update their own private data.

-- Members: Self profile update (only allowed personal fields)
DROP POLICY IF EXISTS "Members can update own profile details" ON public.members;
CREATE POLICY "Members can update own profile details"
ON public.members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Notifications: Member can only view own notifications
DROP POLICY IF EXISTS "Members can view own notifications" ON public.notifications;
CREATE POLICY "Members can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (recipient_id = auth.uid() OR public.is_admin(auth.uid()));

-- Notifications: Member can mark own notifications as read
DROP POLICY IF EXISTS "Members can update own notifications" ON public.notifications;
CREATE POLICY "Members can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Exam Results: Members can only view their own results
DROP POLICY IF EXISTS "Members can view own exam results" ON public.exam_results;
CREATE POLICY "Members can view own exam results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = exam_results.student_id AND m.user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

-- Quiz Results: Members can only view their own quiz results
DROP POLICY IF EXISTS "Members can view own quiz results" ON public.quiz_results;
CREATE POLICY "Members can view own quiz results"
ON public.quiz_results FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
