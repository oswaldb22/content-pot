import { useState } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";

interface Article {
  id: string;
  url: string;
  category?: string;
  title?: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  const handleAddArticle = ({ url, category }: { url: string; category: string }) => {
    const newArticle: Article = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      category: category || undefined,
      title: url, // In a real app, you'd fetch the title from the URL
    };
    setArticles((prev) => [newArticle, ...prev]);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Reading List</h1>
          <AddArticleModal onAddArticle={handleAddArticle} />
        </div>
        <ArticleList articles={articles} />
      </div>
    </div>
  );
};

export default Index;