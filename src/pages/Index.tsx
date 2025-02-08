import { useState, useEffect } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButton } from "@/components/ShareButton";

import {
  List,
  LayoutGrid,
  SortAsc,
  SortDesc,
  Globe,
  Clock,
  Archive,
  CheckCircle2,
  CookingPot,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePreferences } from "@/hooks/usePreferences";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";

import { Article } from "@/lib/types";
import {
  extractDomain,
  saveArticle,
  refreshArticleMetadata,
} from "@/lib/article";
import { decodeArticlesFromUrl } from "@/lib/encode";
import confetti from "canvas-confetti";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem("articles");
    const localArticles = savedArticles
      ? JSON.parse(savedArticles).map((article) => ({
          ...article,
          status: "active",
        }))
      : [];

    // Check for shared articles in URL
    const hash = window.location.hash;
    if (hash.startsWith("#data=")) {
      const encodedData = hash.slice(6); // Remove '#data='
      const sharedArticles = decodeArticlesFromUrl(encodedData);

      // Merge shared articles with local articles, avoiding duplicates
      const mergedArticles = [...localArticles];
      sharedArticles.forEach((sharedArticle) => {
        if (
          !mergedArticles.some((article) => article.id === sharedArticle.id)
        ) {
          mergedArticles.push(sharedArticle);
        }
      });

      setArticles(mergedArticles);
      // Clear the hash after processing
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setArticles(localArticles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  const getUniqueDomains = (): string[] => {
    const domains = articles.map((article) => extractDomain(article.url));
    return [...new Set(domains)].sort();
  };

  const getUniqueCategories = (): string[] => {
    const categories = articles
      .map((article) => article.category)
      .filter((category): category is string => !!category);
    return [...new Set(categories)].sort();
  };

  const handleAddArticle = async (articleData: Partial<Article>) => {
    if (!articleData.url) return;

    try {
      const newArticle = await saveArticle(articleData.url, articleData);
      const domain = extractDomain(articleData.url);

      if (domain && !preferences.filters.domains.includes(domain)) {
        updatePreference("filters", {
          ...preferences.filters,
          domains: [...preferences.filters.domains, domain],
        });
      }

      setArticles((prev) => [...prev, newArticle]);
    } catch (error) {
      console.error("Error adding article:", error);
    }
  };

  const filteredArticles = articles.filter((article) => {
    // Skip deleted articles
    if (article.deleted) return false;

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

    // Category filter
    const hasCategoryFilter = preferences?.filters?.categories?.length > 0;
    if (
      hasCategoryFilter &&
      (!article.category ||
        !preferences?.filters?.categories?.includes(article.category))
    ) {
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

  const rewardAnimation = ({ seconds = 3 }: { seconds?: number }) => {
    const end = Date.now() + seconds * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const toggleReadStatus = (articleId: string) => {
    const updatedArticles = articles.map((article) =>
      article.id === articleId ? { ...article, read: !article.read } : article
    );

    if (
      updatedArticles.some(
        (article) => article.id === articleId && article.read
      )
    ) {
      rewardAnimation({});
    }

    setArticles(updatedArticles);
  };

  const handleRefreshMetadata = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    try {
      const updatedArticle = await refreshArticleMetadata(article);
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? updatedArticle : a))
      );
    } catch (error) {
      console.error("Error refreshing metadata:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">contentPot</h1>
            <CookingPot className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-4">
            <AddArticleModal onAddArticle={handleAddArticle} />
            <ShareButton articles={filteredArticles} />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} articles
            {preferences.filters.domains.length === 1 && (
              <span>
                {" "}
                from{" "}
                <span className="font-medium text-muted-foreground">
                  {preferences.filters.domains[0]}
                </span>
              </span>
            )}
            {preferences.filters.read.length === 1 && (
              <span>
                {" "}
                marked as{" "}
                <span className="font-medium text-muted-foreground">
                  {preferences.filters.read[0]}
                </span>
              </span>
            )}
            <span className="mx-2 text-muted-foreground/40">•</span>
            {filteredArticles.filter((a) => a.read).length} read
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b">
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

          <MultiSelectFilter
            title="Categories"
            options={getUniqueCategories().map((category) => ({
              label: category,
              value: category,
              icon: Tag,
            }))}
            selectedValues={preferences?.filters?.categories || []}
            onChange={(categories) => {
              updatePreference("filters", {
                ...preferences.filters,
                categories,
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

        {/* <ScrollArea className="h-[calc(100vh-16rem)] w-full rounded-md">
        <div className="pr-4"> */}
        <ArticleList
          articles={sortedArticles}
          displayStyle={preferences.displayStyle}
          toggleReadStatus={toggleReadStatus}
          onArchive={handleArchiveArticle}
          onDelete={handleDeleteArticle}
          onRefreshMetadata={handleRefreshMetadata}
        />
      </div>
      {/* </ScrollArea>
      </div> */}
    </div>
  );
};

export default Index;
