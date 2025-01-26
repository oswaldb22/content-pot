import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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

interface ArticleListProps {
  articles: Article[];
  displayStyle: 'full' | 'minimal';
}

export function ArticleList({ articles, displayStyle }: ArticleListProps) {
  const [enrichedArticles, setEnrichedArticles] = useState<Article[]>(articles);

  useEffect(() => {
    const fetchMetadata = async () => {
      const updatedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(article.url)}`);
            const data = await response.json();
            
            if (data.status === 'success') {
              return {
                ...article,
                title: data.data.title || article.title || article.url,
                description: data.data.description || '',
                image: data.data.image?.url || '',
                favicon: data.data.logo?.url || '',
                publishedDate: data.data.date || article.publishedDate,
              };
            }
          } catch (error) {
            console.error('Error fetching metadata:', error);
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
        <p className="text-muted-foreground">No articles saved yet. Add your first article to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrichedArticles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:border-accent transition-colors duration-300">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              {displayStyle === 'full' ? (
                <CardHeader className="flex flex-row items-start space-x-4">
                  {article.favicon && (
                    <img
                      src={article.favicon}
                      alt=""
                      className="w-6 h-6 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {article.title || article.url}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {article.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                          {article.category}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(article.dateAdded))} ago
                      </span>
                    </div>
                    {article.description && (
                      <CardDescription className="mt-2 line-clamp-2">
                        {article.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
              ) : (
                <CardHeader className="flex flex-row items-center space-x-4 py-3">
                  {article.favicon && (
                    <img
                      src={article.favicon}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate">
                        {article.title || article.url}
                      </CardTitle>
                      {article.category && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded whitespace-nowrap">
                          {article.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(article.dateAdded))} ago
                  </span>
                </CardHeader>
              )}
            </a>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}