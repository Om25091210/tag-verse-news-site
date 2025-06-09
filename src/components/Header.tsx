
import React from 'react';
import { Search, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-primary">NewsHub</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Home</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">World</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Technology</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Sports</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Business</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search news..."
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
