-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- MIGRATION: Final Member/Admin Reset + Root Admin IT@0 & Applicant Reservation
-- ==============================================================================

-- 1. APPLICANT NUMBER GENERATOR: STRICT IT@0 RESERVATION & STARTS AT IT@1
-- Guarantees sequential generation starting at IT@1, IT@2, IT@3...
-- IT@0 is permanently reserved for the Root Administrative Account and CANNOT be assigned.
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
        
        -- Disallow non-positive numbers
        IF next_val <= 0 THEN
            CONTINUE;
        END IF;

        candidate := 'IT@' || next_val::TEXT;
        
        -- Strictly disallow IT@0 for normal members
        IF candidate = 'IT@0' THEN
            CONTINUE;
        END IF;
        
        -- Prevent collision with existing member records
        IF NOT EXISTS (SELECT 1 FROM public.members WHERE member_number = candidate) THEN
            RETURN candidate;
        END IF;
    END LOOP;
END;
$$;

-- Reset sequence so the first provisioned member gets IT@1 if no members exist
SELECT setval('public.member_applicant_number_seq', 1, false);

-- 2. ENSURE ROOT ADMIN PROFILE & MEMBER RECORD (IT@0)
-- Never store initial credential "0000" as plaintext!
DO $$
DECLARE
    root_user_id UUID := '00000000-0000-4000-8000-000000000000';
    admin_role_id UUID;
    super_admin_role_id UUID;
BEGIN
    -- Upsert Root Admin profile
    INSERT INTO public.profiles (id, email, full_name, display_name, status)
    VALUES (
        root_user_id,
        'applicant.it0@stmarysenglishschool.edu',
        'Root Administrator',
        'Root Administrator',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
        status = 'active';

    -- Upsert Root Admin member record with admission_number = NULL (NEVER store 0000)
    INSERT INTO public.members (
        user_id,
        member_number,
        admission_number,
        slug,
        class_grade,
        section,
        designation,
        designation_level,
        hierarchy_order,
        status,
        public_visibility,
        portfolio_visibility,
        is_featured,
        must_change_password
    )
    VALUES (
        root_user_id,
        'IT@0',
        NULL,
        'root-admin',
        'Staff',
        'Admin',
        'Root Administrator',
        'leadership',
        1,
        'active',
        false,
        false,
        false,
        true
    )
    ON CONFLICT (member_number) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        admission_number = NULL,
        status = 'active',
        public_visibility = false,
        portfolio_visibility = false;

    -- Get admin and super_admin role IDs
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO super_admin_role_id FROM public.roles WHERE name = 'super_admin';

    -- Ensure IT@0 has admin & super_admin roles
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (root_user_id, admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    IF super_admin_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (root_user_id, super_admin_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;

    -- Remove admin privileges from all other member accounts
    DELETE FROM public.user_roles
    WHERE user_id <> root_user_id
      AND role_id IN (admin_role_id, super_admin_role_id);

    -- Remove test/mock member accounts from public.members
    DELETE FROM public.members
    WHERE member_number <> 'IT@0'
      AND member_number IN ('IT@1', 'IT@2', 'IT@3', 'IT@4', '1', '2', '3', '4');

    DELETE FROM public.profiles
    WHERE id IN (
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333'
    );
END;
$$;
