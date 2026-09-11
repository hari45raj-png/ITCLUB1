-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- MIGRATION 4: Member Directory, Database-Driven Designations & Portfolio Schema
-- 
-- PROMPT 7: Public Member Directory, Member Profiles & Public Portfolio
-- ==============================================================================

-- 1. DESIGNATIONS TABLE (Database-Driven Positions)
CREATE TABLE IF NOT EXISTS public.designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL DEFAULT 'member' CHECK (level IN ('leadership', 'member', 'alumnus', 'honorary')),
    hierarchy_order INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Trigger for designations updated_at
CREATE TRIGGER set_designations_updated_at
BEFORE UPDATE ON public.designations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. EXTEND MEMBERS TABLE WITH DESIGNATION & PORTFOLIO SLUG
ALTER TABLE public.members 
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS portfolio_bio TEXT,
    ADD COLUMN IF NOT EXISTS github_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create index on member slug for fast routing
CREATE INDEX IF NOT EXISTS idx_members_slug ON public.members(slug);
CREATE INDEX IF NOT EXISTS idx_members_designation ON public.members(designation_id);
CREATE INDEX IF NOT EXISTS idx_members_public_visibility ON public.members(public_visibility, status);

-- 3. MEMBER POSTS TABLE (Approved Public Posts & Articles)
CREATE TABLE IF NOT EXISTS public.member_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_member_posts_updated_at
BEFORE UPDATE ON public.member_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_member_posts_member_id ON public.member_posts(member_id);
CREATE INDEX IF NOT EXISTS idx_member_posts_visibility ON public.member_posts(status, visibility);

-- 4. MEMBER VIDEOS TABLE (Approved Public Videos)
CREATE TABLE IF NOT EXISTS public.member_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'private')),
    published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TRIGGER set_member_videos_updated_at
BEFORE UPDATE ON public.member_videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_member_videos_member_id ON public.member_videos(member_id);
CREATE INDEX IF NOT EXISTS idx_member_videos_visibility ON public.member_videos(status, visibility);

-- 5. SEED CORE DESIGNATIONS
INSERT INTO public.designations (title, slug, level, hierarchy_order, description, is_active)
VALUES 
    ('President', 'president', 'leadership', 1, 'Executive Head of the IT Club Leadership Council', true),
    ('Vice President', 'vice-president', 'leadership', 2, 'Deputy Executive of the IT Club Council', true),
    ('Secretary', 'secretary', 'leadership', 3, 'General Secretary & Communications Coordinator', true),
    ('Senior Member', 'senior-member', 'member', 10, 'Experienced Senior Student Contributor', true),
    ('Member', 'member', 'member', 20, 'Active IT Club Member', true)
ON CONFLICT (title) DO UPDATE
SET 
    level = EXCLUDED.level,
    hierarchy_order = EXCLUDED.hierarchy_order,
    description = EXCLUDED.description;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_videos ENABLE ROW LEVEL SECURITY;

-- Designations: Public can read active designations
CREATE POLICY "Public can view active designations"
ON public.designations FOR SELECT
USING (is_active = true);

-- Designations: Admin can manage all designations
CREATE POLICY "Admins can manage designations"
ON public.designations FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
);

-- Member Posts: Public can read published public posts
CREATE POLICY "Public can view published public member posts"
ON public.member_posts FOR SELECT
USING (status = 'published' AND visibility = 'public');

-- Member Posts: Member can manage own posts
CREATE POLICY "Members can manage own posts"
ON public.member_posts FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_posts.member_id AND m.user_id = auth.uid()
    )
);

-- Member Videos: Public can view published public member videos
CREATE POLICY "Public can view published public member videos"
ON public.member_videos FOR SELECT
USING (status = 'published' AND visibility = 'public');

-- Member Videos: Member can manage own videos
CREATE POLICY "Members can manage own videos"
ON public.member_videos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_videos.member_id AND m.user_id = auth.uid()
    )
);
