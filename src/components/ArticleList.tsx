import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: string;
  url: string;
  category?: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
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
        <p className="text-gray-500">No articles saved yet. Add your first article to get started.</p>
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
          <Card className="hover:border-gray-300 transition-colors duration-300">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
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
                  <CardTitle className="text-lg mb-1 text-gray-900">
                    {article.title || article.url}
                  </CardTitle>
                  {article.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {article.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {article.description && (
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {article.description}
                  </CardDescription>
                )}
                {article.image && (
                  <div className="mt-4">
                    <img
                      src={article.image}
                      alt=""
                      className="rounded-lg w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </a>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}