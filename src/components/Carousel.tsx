import React, { useEffect, useRef, useState } from 'react';

interface CarouselMedia {
  url: string;
  type: 'image' | 'video';
  poster?: string;
}
interface CarouselProps {
  media: CarouselMedia[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_VIDEO_POSTER = '/public/placeholder.svg'; // fallback image

const Carousel: React.FC<CarouselProps> = ({ media, className = '', orientation = 'horizontal' }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 3000; // 3 seconds

  useEffect(() => {
    if (media.length === 0) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % media.length);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, media.length]);

  if (!media.length) return null;

  return (
    <div className={`w-full mb-2 relative overflow-hidden shadow-lg ${className}`}>
      <div className={
        orientation === 'vertical'
          ? 'relative w-full h-64 md:h-80 lg:h-[28rem] xl:h-[32rem] flex flex-col'
          : 'relative h-64 md:h-80 lg:h-[28rem] xl:h-[32rem]'
      }>
        {media.map((item, idx) => (
          item.type === 'image' ? (
            <img
              key={idx}
              src={item.url}
              alt={`carousel-img-${idx}`}
              className={
                orientation === 'vertical'
                  ? `absolute left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${idx === current ? 'top-0' : idx < current ? '-top-full' : 'top-full'}`
                  : `absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
              }
              draggable={false}
            />
          ) : (
            <video
              key={idx}
              src={item.url}
              className={
                orientation === 'vertical'
                  ? `absolute left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${idx === current ? 'top-0' : idx < current ? '-top-full' : 'top-full'}`
                  : `absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
              }
              autoPlay
              muted
              loop
              playsInline
              poster={item.poster || DEFAULT_VIDEO_POSTER}
            />
          )
        ))}
      </div>
      <div className={
        orientation === 'vertical'
          ? 'absolute right-3 top-1/2 -translate-y-1/2 flex flex-col space-y-2'
          : 'absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2'
      }>
        {media.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-primary' : 'bg-gray-300'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel; 