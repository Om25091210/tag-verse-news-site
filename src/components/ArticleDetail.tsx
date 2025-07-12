import React from 'react';
import { ArrowLeft, Tag, Calendar, User, Share2 } from 'lucide-react';
import NewsGrid from './NewsGrid';
import Carousel from './Carousel';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import NewsCard from './NewsCard';
import { Helmet } from 'react-helmet';

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  content?: string;
  media?: { media_url: string; media_type: 'image' | 'video'; display_order: number }[];
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  allArticles: Article[];
  onArticleClick: (article: Article) => void;
}

const ArticleDetail = ({ article: propArticle, onBack, allArticles = [], onArticleClick }: Partial<ArticleDetailProps>) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = React.useState<Article | null>(propArticle || null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const shareUrl = typeof window !== 'undefined' && article ? `${window.location.origin}/article/${article.id}` : '';
  const [allArticlesState, setAllArticlesState] = React.useState<Article[]>(allArticles || []);

  React.useEffect(() => {
    setArticle(null);
    setLoading(true);
    setError(null);
    if (id) {
      (async () => {
        try {
          // Fetch article by id
          const { data: articleData, error } = await supabase
            .from('articles')
            .select(`
              id, title, description, content, published_at,
              article_tags ( tags ( id, name, color ) )
            `)
            .eq('id', id)
            .single();
          if (error || !articleData) {
            setError('Article not found.');
            if (error) console.error('Supabase error:', error);
            setLoading(false);
            return;
          }
          // Fetch media
          const { data: mediaData, error: mediaError } = await supabase
            .from('article_media' as any)
            .select('media_url, media_type, display_order')
            .eq('article_id', id)
            .order('display_order');
          if (mediaError) {
            setError('Failed to load article media.');
            console.error('Supabase media error:', mediaError);
            setLoading(false);
            return;
          }
          function isMediaArray(arr: any): arr is { media_url: string; media_type: string; display_order: number }[] {
            return Array.isArray(arr) && arr.every(m => m && typeof m.media_url === 'string');
          }
          setArticle({
            id: articleData.id,
            title: articleData.title,
            description: articleData.description,
            content: articleData.content,
            imageUrl: isMediaArray(mediaData) ? mediaData.find((m: any) => m.media_type === 'image')?.media_url ?? '' : '',
            publishedAt: articleData.published_at,
            tags: articleData.article_tags?.map((at: any) => at.tags?.name).filter(Boolean) || [],
            media: isMediaArray(mediaData) ? mediaData.map((m: any) => ({
              media_url: m.media_url,
              media_type: m.media_type,
              display_order: m.display_order,
            })) : [],
          });
          setLoading(false);
        } catch (err) {
          setError('An unexpected error occurred.');
          console.error('Unexpected error:', err);
          setLoading(false);
        }
      })();
    }
  }, [id]);

  // Fetch all articles if not provided
  React.useEffect(() => {
    if (!allArticles || allArticles.length === 0) {
      (async () => {
        const { data: articlesData, error } = await supabase
          .from('articles')
          .select(`
            id, title, description, content, published_at,
            article_tags ( tags ( id, name, color ) )
          `)
          .order('published_at', { ascending: false });
        if (error) {
          console.error('Failed to fetch all articles:', error);
          return;
        }
        // Fetch all media for all articles
        const { data: mediaData, error: mediaError } = await supabase
          .from('article_media' as any)
          .select('article_id, media_url, media_type, display_order');
        if (mediaError) {
          console.error('Failed to fetch all article media:', mediaError);
          return;
        }
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
            tags: article.article_tags?.map((at: any) => at.tags?.name).filter(Boolean) || [],
            media,
          };
        });
        setAllArticlesState(transformedArticles);
      })();
    }
  }, [allArticles]);

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading article...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }
  if (!article) {
    return <div className="text-center py-12 text-red-600">Article not found.</div>;
  }

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const linkify = (text: string) => {
    return text
      .replace(/(https?:\/\/[^\s]+)/g, url =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`
      )
      .replace(/\n/g, '<br />');
  };

  // Find related articles (share at least one tag, not the current article)
  const relatedArticles = allArticlesState.filter(a =>
    a.id !== article.id && a.tags.some(tag => article.tags.includes(tag))
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title}</title>
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={article.imageUrl} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to News</span>
        </button>
        {/* Media Gallery */}
        {article.media && article.media.length > 0 ? (
          <div className="mb-8 flex flex-col gap-6 justify-center items-center w-full max-w-2xl mx-auto">
            {article.media.map((media, idx) =>
              media.media_type === 'image' ? (
                <img
                  key={idx}
                  src={media.media_url}
                  alt={`media-${idx}`}
                  className="w-full h-96 rounded-lg object-cover"
                  style={{ maxWidth: '100%' }}
                />
              ) : (
                <video
                  key={idx}
                  src={media.media_url}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-96 rounded-lg object-cover"
                  style={{ maxWidth: '100%' }}
                />
              )
            )}
          </div>
        ) : (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
          />
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <article className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight flex items-center gap-3">
                  {article.title}
                  <Button size="icon" variant="ghost" onClick={handleShare} title="Share this article">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  {copied && <span className="text-xs text-green-600 ml-2">Link copied!</span>}
                </h1>
                <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{getFormattedDate(article.publishedAt)}</span>
                  </div>
                </div>
                <div className="text-xl text-muted-foreground leading-relaxed mb-8">
                  <span dangerouslySetInnerHTML={{ __html: linkify(article.description) }} />
                </div>
                <div className="text-foreground leading-relaxed mb-8" style={{ whiteSpace: 'pre-line' }}>
                  <span dangerouslySetInnerHTML={{ __html: linkify(article.content || `
                    This is where the full article content would be displayed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  `) }} />
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* All News Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">All News</h3>
                    <NewsGrid
                      articles={allArticlesState}
                      onArticleClick={onArticleClick ? onArticleClick : (article) => navigate(`/article/${article.id}`)}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
          {/* Related News Sidebar */}
          {relatedArticles.length > 0 && (
            <aside className="w-full lg:w-80 flex-shrink-0 self-start mt-0 lg:mt-0">
              <h2 className="text-lg font-semibold mb-4">Related News</h2>
              <div className="flex flex-col gap-4">
                {relatedArticles.map(article => (
                  <NewsCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    description={article.description}
                    imageUrl={article.imageUrl}
                    publishedAt={article.publishedAt}
                    tags={article.tags}
                    onClick={() => navigate(`/article/${article.id}`)}
                    media={article.media}
                  />
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
