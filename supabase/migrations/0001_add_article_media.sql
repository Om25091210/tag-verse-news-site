ALTER TABLE public.articles DROP COLUMN IF EXISTS image_url;

-- Create article_media table for storing multiple media files per article
CREATE TABLE public.article_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to article_media
CREATE POLICY "Anyone can view article media" ON public.article_media
  FOR SELECT USING (true);

-- Create index for better performance
CREATE INDEX idx_article_media_article_id ON public.article_media(article_id);
CREATE INDEX idx_article_media_display_order ON public.article_media(display_order); 