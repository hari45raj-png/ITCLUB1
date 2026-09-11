-- ==============================================================================
-- ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
-- MIGRATION: 20260910000003_storage_buckets_and_policies.sql
-- PROMPT 4: Complete Supabase Storage, Buckets, Object Security Policies & RLS
-- ==============================================================================

-- 1. PROVISION OFFICIAL STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-media',
    'public-media',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'private-documents',
    'private-documents',
    false,
    26214400, -- 25 MB
    ARRAY[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. ENABLE ROW LEVEL SECURITY ON storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. DROP PREVIOUS POLICIES (Idempotency)
DROP POLICY IF EXISTS "public_media_read" ON storage.objects;
DROP POLICY IF EXISTS "public_media_admin_manage" ON storage.objects;
DROP POLICY IF EXISTS "public_media_member_avatar_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_media_member_avatar_update" ON storage.objects;
DROP POLICY IF EXISTS "public_media_member_avatar_delete" ON storage.objects;

DROP POLICY IF EXISTS "private_documents_admin_manage" ON storage.objects;
DROP POLICY IF EXISTS "private_documents_member_resources_read" ON storage.objects;
DROP POLICY IF EXISTS "private_documents_member_submissions_insert" ON storage.objects;
DROP POLICY IF EXISTS "private_documents_member_submissions_select" ON storage.objects;
DROP POLICY IF EXISTS "private_documents_member_notices_read" ON storage.objects;

-- ==============================================================================
-- 4. BUCKET: public-media (PUBLIC CDN) POLICIES
-- ==============================================================================

-- Anyone (public, anonymous, authenticated) can read public media objects
CREATE POLICY "public_media_read" ON storage.objects
FOR SELECT USING (
    bucket_id = 'public-media'
);

-- Club Administrators and Faculty have complete manage rights over public media
CREATE POLICY "public_media_admin_manage" ON storage.objects
FOR ALL USING (
    bucket_id = 'public-media' AND (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))
) WITH CHECK (
    bucket_id = 'public-media' AND (public.is_admin(auth.uid()) OR public.is_faculty_moderator(auth.uid()))
);

-- Authenticated active members can upload their own profile avatar ONLY to avatars/{auth.uid()}/*
CREATE POLICY "public_media_member_avatar_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'public-media'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Authenticated active members can update their own profile avatar ONLY
CREATE POLICY "public_media_member_avatar_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'public-media'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'public-media'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Authenticated members can delete their own avatar
CREATE POLICY "public_media_member_avatar_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'public-media'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ==============================================================================
-- 5. BUCKET: private-documents (ACCESS-CONTROLLED VAULT) POLICIES
-- ==============================================================================

-- Administrators have full access across all private document subdirectories
CREATE POLICY "private_documents_admin_manage" ON storage.objects
FOR ALL USING (
    bucket_id = 'private-documents' AND public.is_admin(auth.uid())
) WITH CHECK (
    bucket_id = 'private-documents' AND public.is_admin(auth.uid())
);

-- Active club members can read learning resources and worksheets
CREATE POLICY "private_documents_member_resources_read" ON storage.objects
FOR SELECT USING (
    bucket_id = 'private-documents'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'resources'
);

-- Active club members can upload task submissions ONLY to submissions/{taskId}/{auth.uid()}/*
CREATE POLICY "private_documents_member_submissions_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'private-documents'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'submissions'
    AND (storage.foldername(name))[3] = auth.uid()::text
);

-- Active club members can view and download their own submissions ONLY
CREATE POLICY "private_documents_member_submissions_select" ON storage.objects
FOR SELECT USING (
    bucket_id = 'private-documents'
    AND (
        public.is_admin(auth.uid())
        OR (
            public.is_active_member(auth.uid())
            AND (storage.foldername(name))[1] = 'submissions'
            AND (storage.foldername(name))[3] = auth.uid()::text
        )
    )
);

-- Active club members can read official notice attachments
CREATE POLICY "private_documents_member_notices_read" ON storage.objects
FOR SELECT USING (
    bucket_id = 'private-documents'
    AND public.is_active_member(auth.uid())
    AND (storage.foldername(name))[1] = 'notices'
);

-- 6. GRANT NECESSARY SCHEMA PERMISSIONS
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
