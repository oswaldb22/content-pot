import { Article } from "./types";
import { refreshArticleMetadata } from "./article";
import { Preferences } from "@/hooks/usePreferences";

export interface RefreshResult {
  article: Article;
  success: boolean;
  error?: string;
}

export const getUniqueDomains = (articles: Article[]): string[] => {
  const domains = new Set<string>();
  articles.forEach((article) => {
    try {
      const domain = new URL(article.url).hostname.replace("www.", "");
      domains.add(domain);
    } catch {
      domains.add(article.url);
    }
  });
  return Array.from(domains);
};

export const getUniqueCategories = (articles: Article[]): string[] => {
  const categories = new Set<string>();
  articles.forEach((article) => {
    article.categories.forEach((category) => categories.add(category));
  });
  return Array.from(categories);
};

export const filterArticles = (
  articles: Article[],
  filters: Preferences["filters"]
): Article[] => {
  return articles.filter((article) => {
    if (article.deleted) return false;

    // Domain filter
    let domain;
    try {
      domain = new URL(article.url).hostname.replace("www.", "");
    } catch {
      domain = article.url;
    }
    if (filters.domains.length > 0 && !filters.domains.includes(domain)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(article.status)) {
      return false;
    }

    // Read status filter
    const readStatus = article.read ? "read" : "unread";
    if (filters.read.length > 0 && !filters.read.includes(readStatus)) {
      return false;
    }

    // Favorite filter
    if (filters.favorite && !article.favorite) {
      return false;
    }

    // Categories filter
    if (
      filters.categories.length > 0 &&
      !article.categories.some((cat) => filters.categories.includes(cat))
    ) {
      return false;
    }

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

export const bulkRefreshMetadata = async (
  articles: Article[],
  onProgress?: (current: number, total: number, result: RefreshResult) => void
): Promise<RefreshResult[]> => {
  const results: RefreshResult[] = [];

  for (let i = 0; i < articles.length; i++) {
    try {
      const refreshedArticle = await refreshArticleMetadata(articles[i]);
      const result: RefreshResult = {
        article: refreshedArticle,
        success: true,
      };
      results.push(result);
      onProgress?.(i + 1, articles.length, result);
    } catch (error) {
      const result: RefreshResult = {
        article: articles[i],
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to refresh metadata",
      };
      results.push(result);
      onProgress?.(i + 1, articles.length, result);
    }

    // Add a small delay between requests to prevent API overload
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
};

export const updateArticlesInStorage = (articles: Article[]) => {
  localStorage.setItem("articles", JSON.stringify(articles));
};
