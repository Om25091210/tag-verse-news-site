
import React, { useState } from 'react';
import Header from '../components/Header';
import NewsGrid from '../components/NewsGrid';
import TagFilter from '../components/TagFilter';
import ArticleDetail from '../components/ArticleDetail';

// Mock data for demonstration
const mockArticles = [
  {
    id: '1',
    title: 'Revolutionary AI Technology Transforms Healthcare Industry',
    description: 'Breakthrough developments in artificial intelligence are revolutionizing patient care and medical diagnosis, promising a new era of precision medicine.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-08T10:30:00Z',
    tags: ['Technology', 'Healthcare', 'AI'],
    author: 'Dr. Sarah Johnson',
    content: 'In a groundbreaking development that promises to reshape the healthcare landscape, researchers have unveiled a revolutionary AI system capable of diagnosing complex medical conditions with unprecedented accuracy. This cutting-edge technology combines machine learning algorithms with advanced imaging techniques to provide real-time analysis of patient data, enabling healthcare professionals to make more informed decisions and improve patient outcomes.'
  },
  {
    id: '2',
    title: 'Global Climate Summit Reaches Historic Agreement',
    description: 'World leaders unite in unprecedented climate action plan, setting ambitious targets for carbon neutrality and renewable energy adoption.',
    imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-08T08:15:00Z',
    tags: ['Environment', 'Politics', 'Global'],
    author: 'Michael Chen',
    content: 'In a historic moment for environmental policy, delegates from 195 countries have reached a landmark agreement at the Global Climate Summit. The comprehensive plan outlines aggressive targets for reducing greenhouse gas emissions and transitioning to renewable energy sources over the next decade.'
  },
  {
    id: '3',
    title: 'Quantum Computing Breakthrough Achieved by Research Team',
    description: 'Scientists demonstrate stable quantum computer operation at room temperature, marking a significant milestone in quantum technology development.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-08T06:45:00Z',
    tags: ['Technology', 'Science', 'Innovation'],
    author: 'Prof. Elena Rodriguez',
    content: 'A breakthrough in quantum computing has been achieved by an international research team, successfully demonstrating stable quantum operations at room temperature. This advancement eliminates the need for expensive cooling systems and brings quantum computers closer to practical, widespread application.'
  },
  {
    id: '4',
    title: 'Major Sports Championship Finals Draw Record Viewership',
    description: 'The championship game breaks all previous viewing records with over 200 million global viewers tuning in for the thrilling finale.',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-07T22:30:00Z',
    tags: ['Sports', 'Entertainment'],
    author: 'James Wilson',
    content: 'The championship finals have set a new standard for sports entertainment, drawing an unprecedented global audience of over 200 million viewers. The thrilling match showcased exceptional athleticism and sportsmanship, captivating fans worldwide.'
  },
  {
    id: '5',
    title: 'Economic Markets Show Strong Recovery Signals',
    description: 'Global financial markets demonstrate resilience with steady growth indicators across major economies, suggesting economic stabilization.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-07T14:20:00Z',
    tags: ['Business', 'Economy', 'Finance'],
    author: 'Lisa Thompson',
    content: 'Financial analysts report encouraging signs of economic recovery as major markets show consistent upward trends. Key indicators suggest stabilization across various sectors, with technology and renewable energy leading the growth momentum.'
  },
  {
    id: '6',
    title: 'Space Exploration Mission Discovers Potentially Habitable Exoplanet',
    description: 'NASA announces the discovery of an Earth-like planet in the habitable zone of a nearby star system, opening new possibilities for life beyond Earth.',
    imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2024-06-07T11:45:00Z',
    tags: ['Science', 'Space', 'Discovery'],
    author: 'Dr. Amanda Foster',
    content: 'In an extraordinary discovery that expands our understanding of the universe, NASA scientists have identified a potentially habitable exoplanet located within the Goldilocks zone of its host star. This Earth-sized world shows promising conditions that could support liquid water and potentially life.'
  }
];

const Index = () => {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags from articles
  const allTags = Array.from(new Set(mockArticles.flatMap(article => article.tags)));

  // Filter articles based on selected tag
  const filteredArticles = selectedTag 
    ? mockArticles.filter(article => article.tags.includes(selectedTag))
    : mockArticles;

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
  };

  const handleBackToNews = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        onBack={handleBackToNews}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Latest News & Updates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the most recent developments from around the world
          </p>
        </div>

        <TagFilter 
          tags={allTags}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />

        <NewsGrid 
          articles={filteredArticles}
          onArticleClick={handleArticleClick}
        />
      </main>

      <footer className="bg-muted/30 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 NewsHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
