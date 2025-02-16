import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Article } from "@/lib/types";
import { Globe } from "lucide-react";

interface ImportArticlesModalProps {
  articles: Article[];
  onImport: (selectedArticles: Article[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportArticlesModal({
  articles,
  onImport,
  open,
  onOpenChange,
}: ImportArticlesModalProps) {
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );

  const handleToggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map((article) => article.id)));
    }
  };

  const handleImport = () => {
    const selectedArticleObjects = articles.filter((article) =>
      selectedArticles.has(article.id)
    );
    onImport(selectedArticleObjects);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] md:h-auto md:max-h-[85vh] p-0 gap-0 animate-in fade-in zoom-in duration-200 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-medium tracking-tight">
            Import Articles
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-3 flex items-center justify-between bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {selectedArticles.size} of {articles.length} selected
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-sm font-medium hover:bg-muted"
          >
            {selectedArticles.size === articles.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>

        <div className="relative h-[calc(90vh-14rem)] md:h-[50vh] overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4 space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="group flex items-start gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10"
                  role="button"
                  onClick={() => handleToggleArticle(article.id)}
                >
                  <Checkbox
                    checked={selectedArticles.has(article.id)}
                    onCheckedChange={() => handleToggleArticle(article.id)}
                    className="mt-1 transition-transform duration-200 group-hover:scale-110"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium leading-tight truncate">
                      {article.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                      <span
                        className="truncate group-hover:whitespace-normal group-hover:break-all transition-all duration-200"
                        title={article.url}
                      >
                        {article.url}
                      </span>
                    </div>
                    {article.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedArticles.size === 0}
              className="min-w-[140px] font-medium"
            >
              Import ({selectedArticles.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
