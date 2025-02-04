import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Archive, Trash2, ArchiveRestore, RefreshCcw } from "lucide-react";

export interface Article {
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
  status: "active" | "archived";
  deleted: boolean;
}

export interface ArticleListProps {
  articles: Article[];
  displayStyle: "full" | "minimal";
  toggleReadStatus: (articleId: string) => void;
  onArchive: (articleId: string) => void;
  onDelete: (articleId: string) => void;
  onRefreshMetadata?: (articleId: string) => void;
}

export function ArticleList({
  articles,
  displayStyle,
  toggleReadStatus,
  onArchive,
  onDelete,
  onRefreshMetadata,
}: ArticleListProps) {
  const [enrichedArticles, setEnrichedArticles] = useState<Article[]>(articles);

  useEffect(() => {
    const fetchMetadata = async () => {
      const updatedArticles = await Promise.all(
        articles
          .map(async (article) => {
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
                `https://api.microlink.io?url=${encodeURIComponent(
                  article.url
                )}`
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
            <a
              href={article.url}
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
                  {article.category && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                      {article.category}
                    </span>
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleReadStatus(article.id);
                      }}
                      className={`p-2 rounded-full hover:bg-accent/10 transition-colors ${
                        article.read
                          ? "text-accent"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {article.read ? (
                          <>
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        ) : (
                          <>
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="m3 3 18 18" />
                          </>
                        )}
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{article.read ? "Mark as unread" : "Mark as read"}</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-accent/10 transition-colors text-muted-foreground/50">
                      <MoreVertical className="h-4 w-4" />
                    </button>
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
  );
}
