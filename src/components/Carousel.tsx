import React, { useEffect, useRef, useState } from 'react';

interface CarouselProps {
  images: string[];
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ images, className = '' }) => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delay = 3000; // 3 seconds

  useEffect(() => {
    if (images.length === 0) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, images.length]);

  if (!images.length) return null;

  return (
    <div className={`w-full mb-2 relative overflow-hidden shadow-lg ${className}`}>
      <div className="relative h-64 md:h-80 lg:h-[28rem] xl:h-[32rem]">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`carousel-img-${idx}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            draggable={false}
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
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