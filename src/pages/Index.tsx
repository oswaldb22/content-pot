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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-6 sm:space-y-0 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Reading List</h1>
            <p className="text-muted-foreground text-sm">{articles.length} articles saved</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'full')}
                className={`transition-all duration-200 ${
                  preferences.displayStyle === 'full' 
                    ? 'bg-background shadow-sm hover:bg-background/90' 
                    : 'hover:bg-background/50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'minimal')}
                className={`transition-all duration-200 ${
                  preferences.displayStyle === 'minimal' 
                    ? 'bg-background shadow-sm hover:bg-background/90' 
                    : 'hover:bg-background/50'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('sortOrder', preferences.sortOrder === 'newest' ? 'oldest' : 'newest')}
                className={`transition-all duration-200 hover:bg-background/50`}
                title={`Sort by ${preferences.sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
              >
                {preferences.sortOrder === 'newest' ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AddArticleModal onAddArticle={handleAddArticle} />
            </div>
          </div>
        </div>
        <div className="transition-all duration-300">
          <ArticleList articles={sortedArticles} displayStyle={preferences.displayStyle} />
        </div>
      </div>
    </div>
  );
};

export default Index;