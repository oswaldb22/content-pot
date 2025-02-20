import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Archive,
  Trash2,
  ArchiveRestore,
  RefreshCcw,
  Eye,
  EyeOff,
  Star,
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/types";

export interface ArticleListProps {
  articles: Article[];
  displayStyle: "full" | "minimal";
  toggleReadStatus: (articleId: string) => void;
  toggleFavoriteStatus: (articleId: string) => void;
  onArchive: (articleId: string) => void;
  onDelete: (articleId: string) => void;
  onRefreshMetadata?: (articleId: string) => void;
  isEditMode?: boolean;
}

import { BulkRefreshButton } from "./BulkRefreshButton";

export function ArticleList({
  articles,
  displayStyle,
  toggleReadStatus,
  toggleFavoriteStatus,
  onArchive,
  onDelete,
  onRefreshMetadata,
  isEditMode = false,
}: ArticleListProps) {
  const [enrichedArticles, setEnrichedArticles] = useState<Article[]>(articles);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  const handleSelect = (article: Article, checked: boolean) => {
    if (checked) {
      setSelectedArticles([...selectedArticles, article]);
    } else {
      setSelectedArticles(selectedArticles.filter((a) => a.id !== article.id));
    }
  };

  const handleBulkRefreshComplete = (updatedArticles: Article[]) => {
    setEnrichedArticles((prev) => {
      const updated = [...prev];
      updatedArticles.forEach((refreshedArticle) => {
        const index = updated.findIndex((a) => a.id === refreshedArticle.id);
        if (index !== -1) {
          updated[index] = refreshedArticle;
        }
      });
      return updated;
    });
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      const updatedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            if (
              article.title !== null &&
              article.description !== null &&
              article.image !== null &&
              article.favicon !== null
            ) {
              return article;
            }

            const response = await fetch(
              `https://api.microlink.io?url=${encodeURIComponent(article.url)}`
            );
            const data = await response.json();

            if (data.status === "success") {
              return {
                ...article,
                title: data.data.title || article.title || article.url,
                description: data.data.description || "",
                image: data.data.image?.url || "",
                favicon: data.data.logo?.url || "",
                publishedDate: data.data.date || article.publishedDate,
              };
            }
          } catch (error) {
            console.error("Error fetching metadata:", error);
          }
          return article;
        })
      );
      setEnrichedArticles(updatedArticles);
    };

    fetchMetadata();
  }, [articles]);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No articles saved yet. Add your first article to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {enrichedArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div
              className={`flex items-start p-4 border rounded-lg
            hover:border-primary/40 hover:bg-accent/50
            transition-all duration-300 ease-in-out transform hover:-translate-y-[2px]
            ${article.read ? "bg-muted/30" : "bg-background"}
          `}
            >
              {isEditMode && (
                <div className="flex items-center h-5 mr-4">
                  <Checkbox
                    checked={selectedArticles.some((a) => a.id === article.id)}
                    onCheckedChange={(checked) =>
                      handleSelect(article, checked as boolean)
                    }
                    aria-label="Select article"
                  />
                </div>
              )}
              <a
                href={
                  article.url.startsWith("//")
                    ? `https:${article.url}`
                    : article.url.match(/^https?:\/\//)
                    ? article.url
                    : `https://${article.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 flex-1 min-w-0 group"
              >
                {article.favicon && (
                  <img
                    src={article.favicon}
                    alt=""
                    className="w-5 h-5 rounded flex-shrink-0 mt-1 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base leading-6 truncate group-hover:text-primary transition-colors duration-300">
                    {article.title || article.url}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {article.categories && article.categories.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {article.categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(article.dateAdded))} ago
                    </span>
                  </div>
                  {displayStyle === "full" && article.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.description}
                    </p>
                  )}
                </div>
              </a>
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavoriteStatus(article.id);
                        }}
                        className={
                          article.favorite
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }
                      >
                        {article.favorite ? (
                          <Star className="h-4 w-4 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {article.favorite
                          ? "Remove from favorites"
                          : "Add to favorites"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleReadStatus(article.id);
                        }}
                        className={
                          article.read
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {article.read ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{article.read ? "Mark as unread" : "Mark as read"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onArchive(article.id)}
                        className="flex items-center gap-2"
                      >
                        {article.status === "archived" ? (
                          <>
                            <ArchiveRestore className="h-4 w-4" />
                            <span>Unarchive</span>
                          </>
                        ) : (
                          <>
                            <Archive className="h-4 w-4" />
                            <span>Archive</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRefreshMetadata?.(article.id)}
                        className="flex items-center gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Refresh Metadata</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(article.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isEditMode && selectedArticles.length > 0 && (
        <BulkRefreshButton
          selectedArticles={selectedArticles}
          onRefreshComplete={handleBulkRefreshComplete}
          onClearSelection={() => setSelectedArticles([])}
        />
      )}
    </>
  );
}
