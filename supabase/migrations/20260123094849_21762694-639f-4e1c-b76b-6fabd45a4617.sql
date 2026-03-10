-- Past Papers Portal: tighten access to documents + ensure storage bucket/policies

-- 1) Documents: keep public read for published, but restrict management to admins
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Remove user-scoped policies (portal is admin-only for management)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Authenticated users can create documents') THEN
    EXECUTE 'DROP POLICY "Authenticated users can create documents" ON public.documents';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can update their own documents') THEN
    EXECUTE 'DROP POLICY "Users can update their own documents" ON public.documents';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can delete their own documents') THEN
    EXECUTE 'DROP POLICY "Users can delete their own documents" ON public.documents';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can view their own documents') THEN
    EXECUTE 'DROP POLICY "Users can view their own documents" ON public.documents';
  END IF;

  -- Ensure public published-read policy exists (idempotent)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Anyone can view published documents') THEN
    EXECUTE 'CREATE POLICY "Anyone can view published documents" ON public.documents FOR SELECT USING (is_published = true)';
  END IF;

  -- Admins can manage all documents (including drafts)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Admins can manage documents') THEN
    EXECUTE 'CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (is_current_user_admin()) WITH CHECK (is_current_user_admin())';
  END IF;
END $$;

-- 2) Storage bucket for PDFs (public URLs ok)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;

-- 3) Storage RLS policies (allow public read; admin-only write)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read documents bucket') THEN
    EXECUTE 'DROP POLICY "Public read documents bucket" ON storage.objects';
  END IF;
  EXECUTE 'CREATE POLICY "Public read documents bucket" ON storage.objects FOR SELECT USING (bucket_id = ''documents'')';

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins insert documents bucket') THEN
    EXECUTE 'DROP POLICY "Admins insert documents bucket" ON storage.objects';
  END IF;
  EXECUTE 'CREATE POLICY "Admins insert documents bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''documents'' AND is_current_user_admin())';

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins update documents bucket') THEN
    EXECUTE 'DROP POLICY "Admins update documents bucket" ON storage.objects';
  END IF;
  EXECUTE 'CREATE POLICY "Admins update documents bucket" ON storage.objects FOR UPDATE USING (bucket_id = ''documents'' AND is_current_user_admin())';

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete documents bucket') THEN
    EXECUTE 'DROP POLICY "Admins delete documents bucket" ON storage.objects';
  END IF;
  EXECUTE 'CREATE POLICY "Admins delete documents bucket" ON storage.objects FOR DELETE USING (bucket_id = ''documents'' AND is_current_user_admin())';
END $$;