import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hdgayvhdqaxbvlthditm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZ2F5dmhkcWF4YnZsdGhkaXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA3NjQsImV4cCI6MjA2NDQ1Njc2NH0.b2t78R8zFubmmbh7gRArH0crV9JaB4HoajvUnJIrTk0";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.get('/api/share/article/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching article:', id);
  
  try {
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, description, article_media(media_url, media_type, display_order)')
      .eq('id', id)
      .single();
    
    if (articleError || !article) {
      console.log('Article not found:', articleError);
      return res.status(404).send('Article not found');
    }
    
    console.log('Article found:', article.title);
    
    // Find the first image for Open Graph
    let imageUrl = '';
    if (Array.isArray(article.article_media)) {
      const imageMedia = article.article_media.find((m) => m.media_type === 'image');
      if (imageMedia) imageUrl = imageMedia.media_url;
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="${article.title}" />
          <meta property="og:description" content="${article.description}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="https://www.highwaynews.blog/${article.id}" />
          <meta name="twitter:card" content="summary_large_image" />
        </head>
        <body>
          <script>
            window.location.href = "/article/${article.id}";
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
}); 