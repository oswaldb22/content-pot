import { Article } from "./types";
import { Preferences } from "@/hooks/usePreferences";
import { extractDomain } from "./article";

export const filterArticles = (
  articles: Article[],
  filters: Preferences["filters"]
): Article[] => {
  return articles.filter((article) => {
    // console.log(article);
    // Skip deleted articles
    if (article.deleted) return false;

    // Status filter (active/archived)
    if (filters.status.length > 0 && !filters.status.includes(article.status)) {
      return false;
    }

    // Domain filter
    const domain = extractDomain(article.url);
    if (filters.domains.length > 0 && !filters.domains.includes(domain)) {
      return false;
    }

    // Read/Unread filter
    const readStatus = article.read ? "read" : "unread";
    if (filters.read.length > 0 && !filters.read.includes(readStatus)) {
      return false;
    }

    // Category filter
    // if (
    //   filters.categories.length > 0 &&
    //   (!article.category || !filters.categories.includes(article.category))
    // ) {
    //   return false;
    // }

    // Favorite filter
    // if (filters.favorite && !article.favorite) {
    //   return false;
    // }

    return true;
  });
};

export const sortArticles = (
  articles: Article[],
  sortOrder: Preferences["sortOrder"]
): Article[] => {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
};

export const getUniqueDomains = (articles: Article[]): string[] => {
  const domains = articles.map((article) => extractDomain(article.url));
  return [...new Set(domains)].sort();
};

export const getUniqueCategories = (articles: Article[]): string[] => {
  const categories = articles
    .map((article) => article.category)
    .filter((category): category is string => !!category);
  return [...new Set(categories)].sort();
};
