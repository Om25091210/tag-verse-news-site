import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, X, Upload } from 'lucide-react';

// --- CORRECT BUCKET NAME ---
const BUCKET_NAME = 'news-object';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  status: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface MediaFile {
  id?: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
}

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

const ArticleForm = ({ article, onClose }: ArticleFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    status: 'published'
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchTags();
    if (article) {
      setFormData({
        title: article.title,
        description: article.description,
        content: article.content,
        status: article.status
      });
      fetchArticleTags(article.id);
      fetchArticleMedia(article.id);
    }
  }, [article]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchArticleTags = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('article_tags')
        .select('tag_id')
        .eq('article_id', articleId);
      if (error) throw error;
      setSelectedTags(data?.map(item => item.tag_id) || []);
    } catch (error) {
      console.error('Error fetching article tags:', error);
    }
  };

  const fetchArticleMedia = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('article_media')
        .select('*')
        .eq('article_id', articleId)
        .order('display_order');
      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error fetching article media:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploadingFiles(true);
    try {
      const newMediaFiles: MediaFile[] = [];
      const currentMediaCount = mediaFiles.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const filePath = `${article?.id || 'temp'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME) // Use constant
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME) // Use constant
          .getPublicUrl(filePath);

        newMediaFiles.push({
          media_url: publicUrl,
          media_type: file.type.startsWith('image/') ? 'image' : 'video',
          display_order: currentMediaCount + i
        });
      }

      setMediaFiles(prev => [...prev, ...newMediaFiles]);
      toast({
        title: "Success",
        description: "Files uploaded. Save the article to make changes permanent.",
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: `Failed to upload files: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeMediaFile = async (index: number) => {
    const fileToRemove = mediaFiles[index];
    setMediaFiles(prev => prev.filter((_, i) => i !== index));

    try {
        const path = new URL(fileToRemove.media_url).pathname.split(`/${BUCKET_NAME}/`)[1];
        
        if (path) {
            const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]); // Use constant
            if (error) throw error;
        }
        toast({
            title: "File Removed",
            description: "The file has been removed. Save the article to confirm changes.",
        });
    } catch (error) {
        console.error('Error removing file from storage:', error);
        toast({
            title: "Error",
            description: "Failed to remove file from storage. It may become an orphan file.",
            variant: "destructive",
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let articleResponse;
      
      if (article) {
        articleResponse = await supabase
          .from('articles')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', article.id)
          .select()
          .single();
      } else {
        articleResponse = await supabase
          .from('articles')
          .insert([formData])
          .select()
          .single();
      }

      if (articleResponse.error) throw articleResponse.error;
      const articleData = articleResponse.data;

      const processedMediaFiles = await Promise.all(
        mediaFiles.map(async (file, index) => {
          if (file.media_url.includes('/temp/')) {
            const oldPath = new URL(file.media_url).pathname.split(`/${BUCKET_NAME}/`)[1];
            const fileName = oldPath.split('/').pop();
            const newPath = `${articleData.id}/${fileName}`;
            
            const { error: moveError } = await supabase.storage.from(BUCKET_NAME).move(oldPath, newPath); // Use constant
            if (moveError) {
              console.error(`Error moving file from ${oldPath} to ${newPath}:`, moveError);
              return { ...file, display_order: index };
            }
            
            const { data: { publicUrl: newPublicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newPath); // Use constant
            return { ...file, media_url: newPublicUrl, display_order: index };
          }
          return { ...file, display_order: index };
        })
      );
 // This logic now works correctly because the table and permissions exist
      await supabase.from('article_media').delete().eq('article_id', articleData.id);
      if (processedMediaFiles.length > 0) {
        const mediaInserts = processedMediaFiles.map(media => ({ article_id: articleData.id, media_url: media.media_url, media_type: media.media_type, display_order: media.display_order }));
        const { error: insertMediaError } = await supabase.from('article_media').insert(mediaInserts);
        if (insertMediaError) throw insertMediaError;
      }
      
      // Tag handling remains the same and will work with the new policies
      await supabase.from('article_tags').delete().eq('article_id', articleData.id);
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({ article_id: articleData.id, tag_id: tagId }));
        await supabase.from('article_tags').insert(tagInserts);
      }

      toast({
        title: "Success",
        description: `Article ${article ? 'updated' : 'created'} successfully`,
      });
      onClose();

    } catch (error) {
      console.error('Error saving article:', error);
      // This will now show a meaningful error message from the database
      const errorMessage = (error as { message: string }).message || 'An unknown error occurred.';
      toast({
        title: "Error",
        description: `Failed to ${article ? 'update' : 'create'} article: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddTag = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (tags.some(tag => tag.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewTag('');
      return;
    }
    const { data, error } = await (supabase
      .from('tags') as any)
      .insert([{ name: trimmed }])
      .select()
      .single();
    if (!error && data) {
      setTags(prev => [...prev, data]);
      setSelectedTags(prev => [...prev, data.id]);
      setNewTag('');
    } else {
      // Optionally show a toast or error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onClose} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {article ? 'Edit Article' : 'Create New Article'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{article ? 'Edit Article' : 'Create New Article'}</CardTitle>
            <CardDescription>
              Fill in the details below to {article ? 'update' : 'create'} your article.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* --- Form fields are unchanged, rendered below for completeness --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter article title" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter article description" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Enter full article content" rows={10} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">Images and videos</p>
                      </div>
                      <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} disabled={uploadingFiles} />
                    </label>
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaFiles.map((media, index) => (
                        <div key={index} className="relative group">
                          {media.media_type === 'image' ? (
                            <img src={media.media_url} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded-lg"/>
                          ) : (
                            <video src={media.media_url} className="w-full h-32 object-cover rounded-lg" controls />
                          )}
                          <button type="button" onClick={() => removeMediaFile(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Add new tag"
                    className="border rounded px-2 py-1"
                  />
                  <button type="button" onClick={handleAddTag} className="bg-primary text-white px-3 py-1 rounded">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border-2 ${
                        selectedTags.includes(tag.id) ? '' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                      }`}
                      style={ selectedTags.includes(tag.id) ? { backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color } : {} }
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isLoading || uploadingFiles}>
                  {isLoading ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ArticleForm;