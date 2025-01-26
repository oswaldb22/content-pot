import { motion } from "framer-motion";

interface Article {
  id: string;
  url: string;
  category?: string;
  title?: string;
}

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles saved yet. Add your first article to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-300 group"
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:opacity-80 transition-opacity"
          >
            <h3 className="font-medium text-lg mb-1 text-gray-900">
              {article.title || article.url}
            </h3>
            {article.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {article.category}
              </span>
            )}
          </a>
        </motion.div>
      ))}
    </div>
  );
}