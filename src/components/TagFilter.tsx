
import React from 'react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagFilter = ({ tags, selectedTag, onTagSelect }: TagFilterProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTagSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedTag === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All News
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
    </div>
  );
};

export default TagFilter;
