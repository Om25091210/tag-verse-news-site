
-- Create articles table for storing news content
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published'))
);

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

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article_tags junction table for many-to-many relationship
CREATE TABLE public.article_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the admin user (password hash for "tiger@1234")
INSERT INTO public.admin_users (username, email, password_hash) 
VALUES ('admin', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to articles
CREATE POLICY "Anyone can view published articles" ON public.articles
  FOR SELECT USING (status = 'published');

-- RLS Policies for public read access to tags
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

-- RLS Policies for public read access to article_tags
CREATE POLICY "Anyone can view article tags" ON public.article_tags
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_article_tags_article_id ON public.article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON public.article_tags(tag_id);

-- Insert some sample tags
INSERT INTO public.tags (name, color) VALUES 
  ('Technology', '#3B82F6'),
  ('Healthcare', '#10B981'),
  ('AI', '#8B5CF6'),
  ('Environment', '#059669'),
  ('Politics', '#DC2626'),
  ('Global', '#F59E0B'),
  ('Science', '#6366F1'),
  ('Innovation', '#EC4899'),
  ('Sports', '#EF4444'),
  ('Entertainment', '#F97316'),
  ('Business', '#84CC16'),
  ('Economy', '#06B6D4'),
  ('Finance', '#8B5CF6'),
  ('Space', '#6366F1'),
  ('Discovery', '#10B981');
