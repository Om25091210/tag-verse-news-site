import React from 'react';
import NewsCard from './NewsCard';

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  media?: { media_url: string; media_type: 'image' | 'video'; display_order: number }[];
}

interface NewsGridProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const NewsGrid = ({ articles, onArticleClick }: NewsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          id={article.id}
          title={article.title}
          description={article.description}
          imageUrl={article.imageUrl}
          publishedAt={article.publishedAt}
          tags={article.tags}
          onClick={() => onArticleClick(article)}
          media={article.media}
        />
      ))}
    </div>
  );
};

export default NewsGrid;
