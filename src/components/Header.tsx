import React from 'react';
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNavSelect: (category: string) => void;
  selectedNav: string;
}

const NAV_CATEGORIES = [
  { label: 'Home', value: 'All' },
  { label: 'World', value: 'World' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Business', value: 'Business' },
];

const Header = ({ searchValue, onSearchChange, onNavSelect, selectedNav }: HeaderProps) => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <img src="/logo.png" alt="Highway News Logo" className="h-10 w-10 rounded-full shadow" />
            <h1 className="text-2xl font-bold text-primary">Highway News</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search news..."
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
