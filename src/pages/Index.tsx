import { useState, useEffect } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { List, LayoutGrid, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";

interface Article {
  id: string;
  url: string;
  category?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  dateAdded: string;
  publishedDate?: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  const handleAddArticle = (articleData: Partial<Article>) => {
    const newArticle: Article = {
      id: Math.random().toString(36).substr(2, 9),
      url: articleData.url!,
      category: articleData.category,
      title: articleData.title,
      description: articleData.description,
      image: articleData.image,
      favicon: articleData.favicon,
      dateAdded: new Date().toISOString(),
      publishedDate: articleData.publishedDate,
    };
    const updatedArticles = [newArticle, ...articles];
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
  };

  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return preferences.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Reading List</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'full')}
                className={preferences.displayStyle === 'full' ? 'bg-accent' : ''}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'minimal')}
                className={preferences.displayStyle === 'minimal' ? 'bg-accent' : ''}
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('sortOrder', preferences.sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="ml-2"
              >
                {preferences.sortOrder === 'newest' ? (
                  <SortDesc className="h-5 w-5" />
                ) : (
                  <SortAsc className="h-5 w-5" />
                )}
              </Button>
            </div>
            <ThemeToggle />
            <AddArticleModal onAddArticle={handleAddArticle} />
          </div>
        </div>
        <ArticleList articles={sortedArticles} displayStyle={preferences.displayStyle} />
      </div>
    </div>
  );
};

export default Index;