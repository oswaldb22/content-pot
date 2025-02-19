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
import { Globe, RefreshCw } from "lucide-react";
import { bulkRefreshMetadata, RefreshResult } from "@/lib/articleUtils";
import { useToast } from "@/components/ui/use-toast";

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
  const [refreshProgress, setRefreshProgress] = useState<
    Record<string, boolean>
  >({});
  const [refreshErrors, setRefreshErrors] = useState<Record<string, string>>(
    {}
  );
  const [refreshedArticles, setRefreshedArticles] = useState<
    Record<string, Article>
  >({});
  const { toast } = useToast();

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

  const handleRefreshMetadata = async () => {
    const selectedArticleObjects = articles.filter((article) =>
      selectedArticles.has(article.id)
    );

    if (selectedArticleObjects.length === 0) return;

    // Initialize progress tracking
    setRefreshProgress(
      Object.fromEntries(selectedArticleObjects.map((a) => [a.id, true]))
    );
    setRefreshErrors({});

    try {
      const results = await bulkRefreshMetadata(
        selectedArticleObjects,
        (current, total, result) => {
          // Update progress
          setRefreshProgress((prev) => ({
            ...prev,
            [result.article.id]: current !== total,
          }));

          if (!result.success) {
            setRefreshErrors((prev) => ({
              ...prev,
              [result.article.id]: result.error || "Failed to refresh metadata",
            }));
          } else {
            // Store refreshed article in local state
            setRefreshedArticles((prev) => ({
              ...prev,
              [result.article.id]: result.article,
            }));
          }
        }
      );

      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.length - successCount;

      toast({
        title: "Metadata Refresh Complete",
        description: `Successfully refreshed ${successCount} article${
          successCount !== 1 ? "s" : ""
        }${
          errorCount > 0
            ? `. Failed to refresh ${errorCount} article${
                errorCount !== 1 ? "s" : ""
              }.`
            : "."
        }`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "An error occurred while refreshing metadata.",
        variant: "destructive",
      });
    } finally {
      setRefreshProgress({});
    }
  };

  const handleImport = () => {
    const selectedArticleObjects = articles
      .filter((article) => selectedArticles.has(article.id))
      .map(
        (article) =>
          // Use refreshed article data if available, otherwise use original
          refreshedArticles[article.id] || article
      );

    onImport(selectedArticleObjects);
    onOpenChange(false);

    // Clear local state
    setRefreshedArticles({});
    setRefreshErrors({});
    setRefreshProgress({});
    setSelectedArticles(new Set());
  };

  const isRefreshing = Object.values(refreshProgress).some(Boolean);

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
              {articles.map((article) => {
                // Use refreshed article data if available
                const displayArticle = refreshedArticles[article.id] || article;
                return (
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
                        {displayArticle.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                        <span
                          className="truncate group-hover:whitespace-normal group-hover:break-all transition-all duration-200"
                          title={displayArticle.url}
                        >
                          {displayArticle.url}
                        </span>
                      </div>
                      {displayArticle.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {displayArticle.description}
                        </p>
                      )}
                      {refreshedArticles[article.id] && (
                        <p className="text-sm text-green-500">
                          Metadata refreshed
                        </p>
                      )}
                      {refreshProgress[article.id] && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Refreshing metadata...
                        </p>
                      )}
                      {refreshErrors[article.id] && (
                        <p className="text-sm text-destructive">
                          Error: {refreshErrors[article.id]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
              variant="outline"
              onClick={handleRefreshMetadata}
              disabled={selectedArticles.size === 0 || isRefreshing}
              className="min-w-[140px] font-medium"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh Metadata
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedArticles.size === 0 || isRefreshing}
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
