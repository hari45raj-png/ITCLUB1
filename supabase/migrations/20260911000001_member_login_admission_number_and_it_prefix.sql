-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- MIGRATION: Member Login Correction (Applicant IT@N & School Admission Number)
-- 
-- System Requirements:
-- 1. Applicant Number format: IT@N (e.g. IT@1, IT@25)
-- 2. Password credential: School Admission Number (e.g. 6756)
-- 3. Passwords must NEVER be stored as plain-text in public tables.
-- 4. Global Permission Model: EVERYONE CAN VIEW -> ONLY ADMIN CAN MODIFY
-- ==============================================================================

-- 1. EXTEND MEMBERS TABLE WITH SCHOOL ADMISSION NUMBER
ALTER TABLE public.members
    ADD COLUMN IF NOT EXISTS admission_number TEXT;

-- Index on admission_number for quick administrative validation and uniqueness enforcement
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_admission_number 
    ON public.members(LOWER(admission_number)) 
    WHERE admission_number IS NOT NULL;

-- 2. UPDATE APPLICANT NUMBER GENERATOR TO OUTPUT IT@N FORMAT
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
        candidate := 'IT@' || next_val::TEXT;
        
        -- Prevent collision with existing member records
        IF NOT EXISTS (SELECT 1 FROM public.members WHERE member_number = candidate) THEN
            RETURN candidate;
        END IF;
    END LOOP;
END;
$$;

-- 3. SECURITY RULE: STRICT PRESERVATION OF PASSWORDS & CREDENTIALS
-- Passwords are encrypted through Supabase Auth (or argon2/bcrypt server-side)
-- The members table MUST NOT store plain-text passwords.
COMMENT ON COLUMN public.members.admission_number IS 'Official student admission number used for administrative cross-reference and initial credential generation. Never exposed via public API.';

-- 4. AFFIRM CMS PERMISSION MODEL: EVERYONE CAN VIEW -> ONLY ADMIN CAN MODIFY
-- Ensure all public CMS tables permit unrestricted SELECT for published records,
-- while INSERT, UPDATE, DELETE are restricted exclusively to verified administrators.

-- Syllabus Units & Topics
DROP POLICY IF EXISTS "syllabus_units_select_all" ON public.syllabus_units;
CREATE POLICY "syllabus_units_select_all" ON public.syllabus_units
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "syllabus_units_admin_modify" ON public.syllabus_units;
CREATE POLICY "syllabus_units_admin_modify" ON public.syllabus_units
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Resources (Books, Software, Docs)
DROP POLICY IF EXISTS "resources_select_published" ON public.resources;
CREATE POLICY "resources_select_published" ON public.resources
    FOR SELECT USING (status = 'published' OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "resources_admin_modify" ON public.resources;
CREATE POLICY "resources_admin_modify" ON public.resources
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- FAQs
DROP POLICY IF EXISTS "faqs_select_published" ON public.faqs;
CREATE POLICY "faqs_select_published" ON public.faqs
    FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "faqs_admin_modify" ON public.faqs;
CREATE POLICY "faqs_admin_modify" ON public.faqs
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Testimonials
DROP POLICY IF EXISTS "testimonials_select_published" ON public.testimonials;
CREATE POLICY "testimonials_select_published" ON public.testimonials
    FOR SELECT USING (status = 'published' OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "testimonials_admin_modify" ON public.testimonials;
CREATE POLICY "testimonials_admin_modify" ON public.testimonials
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
