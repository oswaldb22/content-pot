import { useState, useEffect } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  List,
  LayoutGrid,
  SortAsc,
  SortDesc,
  Globe,
  Clock,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";

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
  read: boolean;
  status: "active" | "archived";
  deleted: boolean;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { preferences, updatePreference } = usePreferences();
  const [showArchived, setShowArchived] = useState<boolean>(false);

  useEffect(() => {
    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) {
      setArticles(
        JSON.parse(savedArticles).map((article) => ({
          ...article,
          status: "active",
        }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url;
    }
  };

  const getUniqueDomains = (): string[] => {
    const domains = articles.map((article) => extractDomain(article.url));
    return [...new Set(domains)].sort();
  };

  const handleAddArticle = (articleData: Partial<Article>) => {
    const newArticle: Article = {
      id: crypto.randomUUID(),
      url: articleData.url!,
      category: articleData.category,
      title: articleData.title,
      description: articleData.description,
      image: articleData.image,
      favicon: articleData.favicon,
      dateAdded: new Date().toISOString(),
      publishedDate: articleData.publishedDate,
      read: false,
      status: "active",
      deleted: false,
    };

    setArticles((prev) => [...prev, newArticle]);
  };

  console.log(preferences);
  const filteredArticles = articles.filter((article) => {
    // Skip deleted articles
    console.log({
      description: article.description,
      deleted: article.deleted,
    });
    if (article.deleted) return false;
    console.log({
      description: article.description,
      deleted: article.deleted,
      status: article.status,
      url: article.url,
      domains: extractDomain(article.url),
      read: article.read,
    });
    // Status filter (active/archived)
    const hasStatusFilter = preferences?.filters?.status?.length > 0;
    if (
      hasStatusFilter &&
      !preferences?.filters?.status?.includes(article.status)
    ) {
      return false;
    }

    // Domain filter
    const domain = extractDomain(article.url);
    const hasDomainFilter = preferences?.filters?.domains?.length > 0;
    if (hasDomainFilter && !preferences?.filters?.domains?.includes(domain)) {
      return false;
    }

    // Read/Unread filter
    const readStatus = article.read ? "read" : "unread";
    const hasReadFilter = preferences?.filters?.read?.length > 0;
    if (hasReadFilter && !preferences?.filters?.read?.includes(readStatus)) {
      return false;
    }

    return true;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.dateAdded).getTime();
    const dateB = new Date(b.dateAdded).getTime();
    return preferences.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleArchiveArticle = (articleId: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              status: article.status === "archived" ? "active" : "archived",
            }
          : article
      )
    );
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, deleted: true } : article
      )
    );
  };

  const toggleReadStatus = (articleId: string) => {
    const updatedArticles = articles.map((article) =>
      article.id === articleId ? { ...article, read: !article.read } : article
    );
    setArticles(updatedArticles);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl font-bold text-foreground tracking-tight bg-clip-text">
            Reading List
          </h1>
          <p className="text-sm text-muted-foreground/80">
            {sortedArticles.length} article
            {sortedArticles.length !== 1 ? "s" : ""} saved
            {preferences.filters.domains.length > 0 && (
              <span className="inline-flex items-center">
                <span className="mx-2 text-muted-foreground/40">•</span>
                filtered by{" "}
                {preferences.filters.domains.length === 1
                  ? "domain"
                  : "domains"}
              </span>
            )}
            {preferences.filters.status.length > 0 && (
              <span className="inline-flex items-center">
                <span className="mx-2 text-muted-foreground/40">•</span>
                {preferences.filters.status.length === 1 ? (
                  <span className="font-medium text-muted-foreground ml-1">
                    {preferences.filters.status[0]}
                  </span>
                ) : (
                  <span className="font-medium text-muted-foreground ml-1">
                    multiple statuses
                  </span>
                )}
              </span>
            )}
            {preferences.filters.read.length > 0 && (
              <span className="inline-flex items-center">
                <span className="mx-2 text-muted-foreground/40">•</span>
                {preferences.filters.read.length === 1 ? (
                  <span className="font-medium text-muted-foreground ml-1">
                    {preferences.filters.read[0]}
                  </span>
                ) : (
                  <span className="font-medium text-muted-foreground ml-1">
                    multiple read statuses
                  </span>
                )}
              </span>
            )}
            <span className="mx-2 text-muted-foreground/40">•</span>
            {filteredArticles.filter((a) => a.read).length} read
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b pb-6">
          <div className="flex-1 flex items-center gap-3">
            <MultiSelectFilter
              title="Domains"
              options={getUniqueDomains().map((domain) => ({
                label: domain,
                value: domain,
                icon: Globe,
              }))}
              selectedValues={preferences.filters.domains}
              onChange={(domains) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  domains,
                });
              }}
            />

            <MultiSelectFilter
              title="Status"
              options={[
                { label: "Active", value: "active", icon: Clock },
                { label: "Archived", value: "archived", icon: Archive },
              ]}
              selectedValues={preferences?.filters?.status || []}
              onChange={(values) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  status: values.length
                    ? (values as ("active" | "archived")[])
                    : ["active"], // Default to active if nothing selected
                });
              }}
            />

            <MultiSelectFilter
              title="Read Status"
              options={[
                { label: "Read", value: "read", icon: CheckCircle2 },
                { label: "Unread", value: "unread", icon: Clock },
              ]}
              selectedValues={preferences?.filters?.read || []}
              onChange={(values) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  read: values.length
                    ? (values as ("unread" | "read")[])
                    : ["unread", "read"], // Default to both if nothing selected
                });
              }}
            />

            <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1 h-9">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference("displayStyle", "full")}
                className={`h-7 w-7 transition-all duration-200 ${
                  preferences.displayStyle === "full"
                    ? "bg-background shadow-sm hover:bg-background/90"
                    : "hover:bg-background/50"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updatePreference("displayStyle", "minimal")}
                className={`h-7 w-7 transition-all duration-200 ${
                  preferences.displayStyle === "minimal"
                    ? "bg-background shadow-sm hover:bg-background/90"
                    : "hover:bg-background/50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  updatePreference(
                    "sortOrder",
                    preferences.sortOrder === "newest" ? "oldest" : "newest"
                  )
                }
                className={`h-7 w-7 transition-all duration-200 hover:bg-background/50`}
                title={`Sort by ${
                  preferences.sortOrder === "newest" ? "oldest" : "newest"
                } first`}
              >
                {preferences.sortOrder === "newest" ? (
                  <SortDesc className="h-3.5 w-3.5" />
                ) : (
                  <SortAsc className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AddArticleModal onAddArticle={handleAddArticle} />
          </div>
        </div>

        <div className="transition-all duration-300">
          <ArticleList
            articles={sortedArticles}
            displayStyle={preferences.displayStyle}
            toggleReadStatus={toggleReadStatus}
            onArchive={handleArchiveArticle}
            onDelete={handleDeleteArticle}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
