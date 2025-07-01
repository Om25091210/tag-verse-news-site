import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';
import TagFilter from '@/components/TagFilter';
import ArticleDetail from '@/components/ArticleDetail';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Carousel from '@/components/Carousel';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  media?: { media_url: string; media_type: 'image' | 'video'; display_order: number }[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedNav, setSelectedNav] = useState<string>('All');

  useEffect(() => {
    fetchArticlesAndTags();
  }, []);

  const fetchArticlesAndTags = async () => {
    try {
      // Fetch articles with their tags
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          description,
          content,
          published_at,
          article_tags (
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Debug: log the raw articlesData to inspect structure
      console.log('articlesData:', articlesData);

      // Fetch all media for all articles
      const { data: mediaData, error: mediaError } = await supabase
        .from('article_media' as any)
        .select('article_id, media_url, media_type, display_order');

      if (mediaError) throw mediaError;

      // Attach media to each article
      function isMediaRecord(m: any): m is { article_id: string; media_url: string; media_type: string; display_order: number } {
        return m && typeof m.article_id === 'string' && typeof m.media_url === 'string' && typeof m.media_type === 'string' && typeof m.display_order === 'number';
      }
      const filteredMediaData = ((mediaData || []) as unknown[]).filter(isMediaRecord) as { article_id: string; media_url: string; media_type: string; display_order: number }[];
      const transformedArticles: Article[] = (articlesData || []).map(article => {
        const media = filteredMediaData
          .filter(m => m.article_id === article.id)
          .map(m => {
            if (m.media_type === 'image' || m.media_type === 'video') {
              return {
                media_url: m.media_url,
                media_type: m.media_type as 'image' | 'video',
                display_order: m.display_order
              };
            }
            return null;
          })
          .filter((m): m is { media_url: string; media_type: 'image' | 'video'; display_order: number } => m !== null);
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          content: article.content,
          imageUrl: media.find(m => m.media_type === 'image')?.media_url ?? '',
          publishedAt: article.published_at,
          tags: article.article_tags?.map(at => at.tags?.name).filter(Boolean) || [],
          media,
        };
      });

      setArticles(transformedArticles);

      // Fetch all tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesTag = selectedTag === 'All' || article.tags.includes(selectedTag);
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.description.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  const handleNavSelect = (category: string) => {
    setSelectedNav(category);
    setSelectedTag(category);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setSelectedNav(tag);
  };

  const latestArticle = filteredArticles[0];
  const olderArticles = filteredArticles.slice(1);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={handleBack} allArticles={articles} onArticleClick={handleArticleClick} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavSelect={handleNavSelect} selectedNav={selectedNav} />
      
      <Carousel 
        media={articles
          .map(article => article.media && article.media.length > 0 ? {
            url: article.media[0].media_url,
            type: article.media[0].media_type
          } : null)
          .filter((item): item is { url: string; type: 'image' | 'video' } => item !== null)
        }
        className="mt-0" 
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow"
          />
        </div>
        <TagFilter 
          tags={tags.map(tag => tag.name)}
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
        />
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <NewsGrid articles={filteredArticles} onArticleClick={handleArticleClick} />
            </div>
            {olderArticles.length > 0 && (
              <aside className="w-full lg:w-80 flex-shrink-0">
                <h2 className="text-lg font-semibold mb-4">Older News</h2>
                <div className="flex flex-col gap-4">
                  {olderArticles.map(article => (
                    <div key={article.id} className="cursor-pointer" onClick={() => handleArticleClick(article)}>
                      <div className="flex gap-3 items-center bg-white rounded-lg shadow p-2 hover:bg-gray-50 transition">
                        {article.media && article.media.length > 0 ? (
                          article.media[0].media_type === 'image' ? (
                            <img src={article.media[0].media_url} alt={article.title} className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                          ) : (
                            <video src={article.media[0].media_url} controls className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                          )
                        ) : (
                          <img src={article.imageUrl} alt={article.title} className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground truncate mb-1">{article.tags[0]}</div>
                          <div className="font-medium text-sm truncate">{article.title}</div>
                          <div className="text-xs text-gray-400 truncate">{new Date(article.publishedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found for the selected tag.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
