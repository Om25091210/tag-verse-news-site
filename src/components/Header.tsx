import React from 'react';
import { Search, Menu } from 'lucide-react';

interface HeaderProps {
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

const Header = ({ onNavSelect, selectedNav }: HeaderProps) => {
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
          <nav className="flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</a>
            <a href="/admin" className="text-foreground hover:text-primary transition-colors font-medium">Login</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
