import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';
import TagFilter from '@/components/TagFilter';
import ArticleDetail from '@/components/ArticleDetail';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
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
          image_url,
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

      // Transform the data to match our interface
      const transformedArticles: Article[] = (articlesData || []).map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        imageUrl: article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80',
        publishedAt: article.published_at,
        tags: article.article_tags?.map(at => at.tags?.name).filter(Boolean) || []
      }));

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

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchValue={search} onSearchChange={setSearch} onNavSelect={handleNavSelect} selectedNav={selectedNav} />
      
      <div className="fixed top-4 right-4 z-50">
        <Link to="/admin">
          <Button variant="outline" className="flex items-center space-x-2 bg-white shadow-lg">
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </Button>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
          <NewsGrid articles={filteredArticles} onArticleClick={handleArticleClick} />
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
