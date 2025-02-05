import { Article } from "./types";

export const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    return url;
  }
};

export const saveArticle = async (
  url: string,
  options?: {
    category?: string;
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    publishedDate?: string;
  }
): Promise<Article> => {
  // Check if article already exists
  const savedArticles = localStorage.getItem("articles");
  const articles = savedArticles ? JSON.parse(savedArticles) : [];
  const articleExists = articles.some(
    (article: Article) => article.url === url && !article.deleted
  );

  if (articleExists) {
    throw new Error("Article already exists in your reading list");
  }

  let metadata = options;

  // If no metadata provided, fetch it
  if (!metadata?.title) {
    try {
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.status === "success") {
        metadata = {
          title: data.data.title,
          description: data.data.description,
          image: data.data.image?.url,
          favicon: data.data.logo?.url,
          publishedDate: data.data.date,
        };
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }

  const newArticle: Article = {
    id: crypto.randomUUID(),
    url,
    category: metadata?.category,
    title: metadata?.title,
    description: metadata?.description,
    image: metadata?.image,
    favicon: metadata?.favicon,
    dateAdded: new Date().toISOString(),
    publishedDate: metadata?.publishedDate,
    read: false,
    status: "active",
    deleted: false,
  };

  // Save to localStorage
  localStorage.setItem("articles", JSON.stringify([...articles, newArticle]));

  return newArticle;
};

export const refreshArticleMetadata = async (
  article: Article
): Promise<Article> => {
  if (!article.url) {
    throw new Error("Invalid article URL");
  }

  const response = await fetch(
    `https://api.microlink.io?url=${encodeURIComponent(article.url)}`
  );
  const data = await response.json();

  if (data.status === "success") {
    return {
      ...article,
      title: data.data.title,
      description: data.data.description,
      image: data.data.image?.url,
      favicon: data.data.logo?.url,
      publishedDate: data.data.date,
    };
  }

  return article;
};
