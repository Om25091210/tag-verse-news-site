-- supabase/migrations/20250610000000_seed_sample_articles.sql

-- This script adds sample articles and connects them to existing tags.

DO $$
DECLARE
    article1_id UUID;
    article2_id UUID;
    article3_id UUID;
    tech_tag_id UUID;
    ai_tag_id UUID;
    global_tag_id UUID;
BEGIN
    -- 1. Get the IDs of the tags we want to use
    SELECT id INTO tech_tag_id FROM public.tags WHERE name = 'Technology';
    SELECT id INTO ai_tag_id FROM public.tags WHERE name = 'AI';
    SELECT id INTO global_tag_id FROM public.tags WHERE name = 'Global';

    -- 2. Insert sample articles and capture their new IDs
    INSERT INTO public.articles (title, description, content, status, image_url)
    VALUES
        (
            'The Future of Artificial Intelligence',
            'Exploring the next wave of AI innovations and their potential impact on society. From autonomous vehicles to personalized medicine, AI is set to revolutionize every aspect of our lives.',
            'The field of Artificial Intelligence (AI) is advancing at an unprecedented pace. Recent breakthroughs in machine learning, natural language processing, and computer vision are paving the way for transformative applications. This article delves into the latest research, discusses the ethical considerations, and provides a glimpse into what the future holds for AI technology. We will cover topics like generative models, reinforcement learning, and the quest for Artificial General Intelligence (AGI).',
            'published',
            'https://images.unsplash.com/photo-1620712943543-26363252419a?q=80&w=2070&auto=format&fit=crop'
        )
    RETURNING id INTO article1_id;

    INSERT INTO public.articles (title, description, content, status, image_url)
    VALUES
        (
            'Global Tech Summit 2024 Highlights',
            'A recap of the major announcements and trends from the annual Global Tech Summit. Keynotes included discussions on quantum computing, blockchain, and the metaverse.',
            'The Global Tech Summit 2024 was a landmark event, bringing together the brightest minds in the technology industry. This year, the focus was heavily on future-forward technologies. Speakers from major tech giants unveiled new products and roadmaps. We saw impressive demos of next-generation VR hardware, discussions on the decentralization of the web, and new frameworks for ethical AI development. This article provides a comprehensive summary of the most important takeaways from the week-long conference.',
            'published',
            'https://images.unsplash.com/photo-1496065187959-7f07b8353c55?q=80&w=2070&auto=format&fit=crop'
        )
    RETURNING id INTO article2_id;

    INSERT INTO public.articles (title, description, content, status, image_url)
    VALUES
        (
            'AI in Healthcare: A Quiet Revolution',
            'AI is silently transforming healthcare, from drug discovery to diagnostic imaging. Learn how machine learning algorithms are helping doctors save lives.',
            'While headline-grabbing applications of AI often steal the spotlight, a quieter but more profound revolution is happening in the healthcare sector. Machine learning models are now capable of detecting diseases like cancer from medical scans with superhuman accuracy. Pharmaceutical companies are using AI to accelerate drug discovery, saving billions of dollars and years of research. This article explores the real-world impact of AI in healthcare, featuring case studies and interviews with leading medical professionals and data scientists.',
            'published',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop'
        )
    RETURNING id INTO article3_id;

    -- 3. Link the articles to their tags in the article_tags table
    IF article1_id IS NOT NULL AND ai_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article1_id, ai_tag_id);
    END IF;
    IF article1_id IS NOT NULL AND tech_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article1_id, tech_tag_id);
    END IF;

    IF article2_id IS NOT NULL AND tech_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article2_id, tech_tag_id);
    END IF;
    IF article2_id IS NOT NULL AND global_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article2_id, global_tag_id);
    END IF;

    IF article3_id IS NOT NULL AND ai_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article3_id, ai_tag_id);
    END IF;
    IF article3_id IS NOT NULL AND tech_tag_id IS NOT NULL THEN
        INSERT INTO public.article_tags (article_id, tag_id) VALUES (article3_id, tech_tag_id);
    END IF;

END $$; 