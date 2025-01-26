import { useState, useEffect } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { List, LayoutGrid, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  read: boolean;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    const savedArticles = localStorage.getItem('articles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  const getUniqueDomains = (): string[] => {
    const domains = articles.map(article => extractDomain(article.url));
    return [...new Set(domains)].sort();
  };

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
      read: false,
    };
    const updatedArticles = [newArticle, ...articles];
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
  };

  const toggleReadStatus = (articleId: string) => {
    const updatedArticles = articles.map(article => 
      article.id === articleId ? { ...article, read: !article.read } : article
    );
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
  };

  const sortedArticles = [...articles]
    .filter(article => selectedDomain === "all" || extractDomain(article.url) === selectedDomain)
    .filter(article => preferences.readFilter === "all" || (preferences.readFilter === "read" ? article.read : !article.read))
    .sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return preferences.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl font-bold text-foreground tracking-tight bg-clip-text">Reading List</h1>
          <p className="text-sm text-muted-foreground/80">
            {sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''} saved
            {selectedDomain !== "all" && (
              <span className="inline-flex items-center">
                <span className="mx-2 text-muted-foreground/40">•</span>
                filtered by <span className="font-medium text-muted-foreground ml-1">{selectedDomain}</span>
              </span>
            )}
            {preferences.readFilter !== "all" && (
              <span className="inline-flex items-center">
                <span className="mx-2 text-muted-foreground/40">•</span>
                {preferences.readFilter === "read" ? (
                  <span className="font-medium text-muted-foreground ml-1">read</span>
                ) : (
                  <span className="font-medium text-muted-foreground ml-1">unread</span>
                )}
              </span>
            )}
            <span className="mx-2 text-muted-foreground/40">•</span>
            {articles.filter(a => a.read).length} read
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b pb-6">
          <div className="flex-1 flex items-center gap-3">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[200px] h-9 text-sm bg-background border-muted-foreground/20">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {getUniqueDomains().map(domain => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={preferences.readFilter} onValueChange={(value: 'all' | 'read' | 'unread') => updatePreference('readFilter', value)}>
              <SelectTrigger className="w-[200px] h-9 text-sm bg-background border-muted-foreground/20">
                <SelectValue placeholder="Filter by read status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All articles</SelectItem>
                <SelectItem value="read">Read articles</SelectItem>
                <SelectItem value="unread">Unread articles</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1 h-9">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'full')}
                className={`h-7 w-7 transition-all duration-200 ${
                  preferences.displayStyle === 'full' 
                    ? 'bg-background shadow-sm hover:bg-background/90' 
                    : 'hover:bg-background/50'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('displayStyle', 'minimal')}
                className={`h-7 w-7 transition-all duration-200 ${
                  preferences.displayStyle === 'minimal' 
                    ? 'bg-background shadow-sm hover:bg-background/90' 
                    : 'hover:bg-background/50'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference('sortOrder', preferences.sortOrder === 'newest' ? 'oldest' : 'newest')}
                className={`h-7 w-7 transition-all duration-200 hover:bg-background/50`}
                title={`Sort by ${preferences.sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
              >
                {preferences.sortOrder === 'newest' ? (
                  <SortDesc className="h-3.5 w-3.5" />
                ) : (
                  <SortAsc className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AddArticleModal onAddArticle={handleAddArticle} />
          </div>
        </div>

        <div className="transition-all duration-300">
          <ArticleList articles={sortedArticles} displayStyle={preferences.displayStyle} toggleReadStatus={toggleReadStatus} />
        </div>
      </div>
    </div>
  );
};

export default Index;