import { useState, useEffect } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";

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