import React, { useRef } from 'react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagFilter = ({ tags, selectedTag, onTagSelect }: TagFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.7;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - amount : scrollLeft + amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-4 mt-0 relative">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Filter by Category</h3>
      <div className="relative flex items-center">
        <button
          type="button"
          className="z-10 bg-background p-1 rounded-full shadow hidden md:block mr-2 -translate-y-5"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-2 mb-8 mt-0 overflow-x-auto pb-2 no-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          <button
            onClick={() => onTagSelect('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === 'All'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="z-10 bg-background p-1 rounded-full shadow hidden md:block ml-2 -translate-y-5"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TagFilter;
