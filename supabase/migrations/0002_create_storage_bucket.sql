-- Create a new storage bucket for article media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-media', 'article-media', true);

-- Set up storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-media'
  AND auth.role() = 'authenticated'
); 