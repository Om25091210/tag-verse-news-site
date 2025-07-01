import React from 'react';
import { Tag, Clock } from 'lucide-react';

interface NewsCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  onClick: () => void;
  media?: { media_url: string; media_type: 'image' | 'video'; display_order: number }[];
}

const NewsCard = ({ title, description, imageUrl, publishedAt, tags, onClick, media }: NewsCardProps) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Pick the first media file as thumbnail
  let thumbnail = null;
  if (media && media.length > 0) {
    thumbnail = media[0];
  }

  return (
    <div 
      className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {thumbnail ? (
          thumbnail.media_type === 'image' ? (
            <img 
              src={thumbnail.media_url} 
              alt={title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="relative w-full h-48 bg-black">
              <video
                src={thumbnail.media_url}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                poster={thumbnail.poster || '/placeholder.svg'}
                controls={false}
                autoPlay={false}
                muted
                loop={false}
                preload="metadata"
                tabIndex={-1}
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="48" height="48" fill="black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          )
        ) : (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
          <Clock className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {getTimeAgo(publishedAt)}
          </span>
          <button className="text-primary text-sm font-medium hover:underline">
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
