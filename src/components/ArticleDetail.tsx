import React from 'react';
import { ArrowLeft, Tag, Calendar, User } from 'lucide-react';
import NewsGrid from './NewsGrid';

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  content?: string;
  author?: string;
  media?: { media_url: string; media_type: 'image' | 'video'; display_order: number }[];
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  allArticles: Article[];
  onArticleClick: (article: Article) => void;
}

const ArticleDetail = ({ article, onBack, allArticles, onArticleClick }: ArticleDetailProps) => {
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

  // Find related articles (share at least one tag, not the current article)
  const relatedArticles = allArticles.filter(a =>
    a.id !== article.id && a.tags.some(tag => article.tags.includes(tag))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to News</span>
        </button>
        {/* Media Gallery */}
        {article.media && article.media.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto mb-8 justify-center items-center">
            {article.media.map((media, idx) =>
              media.media_type === 'image' ? (
                <img key={idx} src={media.media_url} alt={`media-${idx}`} className="h-96 rounded-lg object-cover" style={{ maxWidth: '100%' }} />
              ) : (
                <video
                  key={idx}
                  src={media.media_url}
                  controls
                  autoPlay
                  muted
                  loop
                  className="h-96 rounded-lg object-cover"
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
                <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{getFormattedDate(article.publishedAt)}</span>
                  </div>
                  {article.author && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                  )}
                </div>
                <div className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {article.description}
                </div>
                <div className="text-foreground leading-relaxed mb-8">
                  {article.content || `
                    This is where the full article content would be displayed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  `}
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
                    <NewsGrid articles={allArticles} onArticleClick={onArticleClick} />
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
                  <div key={article.id} className="cursor-pointer" onClick={() => onArticleClick(article)}>
                    <div className="flex gap-3 items-center bg-white rounded-lg shadow p-2 hover:bg-gray-50 transition">
                      <img src={article.imageUrl} alt={article.title} className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
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
      </div>
    </div>
  );
};

export default ArticleDetail;
