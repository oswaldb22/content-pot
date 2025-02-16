import { useState, useEffect, useMemo, useCallback } from "react";
import { AddArticleModal } from "@/components/AddArticleModal";
import { ArticleList } from "@/components/ArticleList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButton } from "@/components/ShareButton";
import { ImportArticlesModal } from "@/components/ImportArticlesModal";

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
  Star,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePreferences } from "@/hooks/usePreferences";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";

import { Article } from "@/lib/types";
import { saveArticle, refreshArticleMetadata } from "@/lib/article";
import { decodeArticlesFromUrl } from "@/lib/encode";
import {
  filterArticles,
  sortArticles,
  getUniqueDomains,
  getUniqueCategories,
} from "@/lib/articleUtils";
import { useRewardAnimation } from "@/hooks/useRewardAnimation";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sharedArticles, setSharedArticles] = useState<Article[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const { preferences, updatePreference } = usePreferences();

  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem("articles");
    const localArticles = savedArticles
      ? JSON.parse(savedArticles).map((article: Article) => ({
          ...article,
          status: "active",
          categories: article.categories || [],
        }))
      : [];

    // Check for shared articles in URL
    const hash = window.location.hash;
    if (hash.startsWith("#data=")) {
      const encodedData = hash.slice(6); // Remove '#data='
      const shared = decodeArticlesFromUrl(encodedData);

      // Filter out articles that already exist
      const newSharedArticles = shared.filter(
        (sharedArticle) =>
          !localArticles.some((article) => article.id === sharedArticle.id)
      );

      if (newSharedArticles.length > 0) {
        setSharedArticles(newSharedArticles);
        setImportModalOpen(true);
      }

      // Clear the hash after processing
      window.history.replaceState(null, "", window.location.pathname);
    }

    setArticles(localArticles);
  }, []);

  const handleImportArticles = (selectedArticles: Article[]) => {
    setArticles((prev) => [...prev, ...selectedArticles]);
    setSharedArticles([]);
  };

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  const { trigger: triggerRewardAnimation } = useRewardAnimation();

  // Memoized computations
  const uniqueDomains = useMemo(() => getUniqueDomains(articles), [articles]);
  const uniqueCategories = useMemo(
    () => getUniqueCategories(articles),
    [articles]
  );
  const filteredArticles = useMemo(
    () => filterArticles(articles, preferences.filters),
    [articles, preferences.filters]
  );
  const sortedArticles = useMemo(
    () => sortArticles(filteredArticles, preferences.sortOrder),
    [filteredArticles, preferences.sortOrder]
  );

  const handleAddArticle = (article: Article) => {
    setArticles((prev) => {
      // Avoid duplicate articles
      const exists = prev.some((a) => a.url === article.url);
      if (exists) return prev;

      const newArticles = [...prev, article];
      let newDomain = "";
      try {
        newDomain = new URL(article.url).hostname;
      } catch (error) {
        newDomain = article.url;
      }
      if (!preferences.filters.domains.includes(newDomain)) {
        updatePreference("filters", {
          ...preferences.filters,
          domains: [...preferences.filters.domains, newDomain],
        });
      }

      return newArticles;
    });
  };

  const handleArchiveArticle = useCallback(
    (articleId: string) => {
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
    },
    [setArticles]
  );

  const handleDeleteArticle = useCallback(
    (articleId: string) => {
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, deleted: true } : article
        )
      );
    },
    [setArticles]
  );

  const toggleReadStatus = useCallback(
    (articleId: string) => {
      const updatedArticles = articles.map((article) =>
        article.id === articleId ? { ...article, read: !article.read } : article
      );

      if (
        updatedArticles.some(
          (article) => article.id === articleId && article.read
        )
      ) {
        triggerRewardAnimation();
      }

      setArticles(updatedArticles);
    },
    [articles, setArticles, triggerRewardAnimation]
  );

  const toggleFavoriteStatus = useCallback(
    (articleId: string) => {
      const updatedArticles = articles.map((article) =>
        article.id === articleId
          ? { ...article, favorite: !article.favorite }
          : article
      );

      if (
        updatedArticles.some(
          (article) => article.id === articleId && article.favorite
        )
      ) {
        triggerRewardAnimation();
      }

      setArticles(updatedArticles);
    },
    [articles, setArticles, triggerRewardAnimation]
  );

  const handleRefreshMetadata = useCallback(
    async (articleId: string) => {
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
    },
    [articles, setArticles]
  );

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

        <div className="flex justify-between items-start gap-4 mb-8 pb-6 border-b">
          <div className="flex-1 flex flex-wrap gap-3">
            <MultiSelectFilter
              title="Domains"
              options={uniqueDomains.map((domain) => ({
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
              selectedValues={preferences.filters.status}
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
              selectedValues={preferences.filters.read}
              onChange={(values) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  read: values.length
                    ? (values as ("unread" | "read")[])
                    : ["unread", "read"], // Default to both if nothing selected
                });
              }}
            />

            {/* <MultiSelectFilter
              title="Favorites"
              options={[{ label: "Favorites", value: "favorite", icon: Star }]}
              selectedValues={preferences.filters.favorite ? ["favorite"] : []}
              onChange={(values) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  favorite: values.includes("favorite"),
                });
              }}
            /> */}

            {/* <MultiSelectFilter
              title="Categories"
              options={uniqueCategories.map((category) => ({
                label: category,
                value: category,
                icon: Tag,
              }))}
              selectedValues={preferences.filters.categories}
              onChange={(categories) => {
                updatePreference("filters", {
                  ...preferences.filters,
                  categories,
                });
              }}
            /> */}
          </div>

          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1 h-9 shrink-0">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-7 w-7 transition-all duration-200 ${
                isEditMode
                  ? "bg-background shadow-sm hover:bg-background/90"
                  : "hover:bg-background/50"
              }`}
              title={`${isEditMode ? "Disable" : "Enable"} edit mode`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <ArticleList
          articles={sortedArticles}
          displayStyle={preferences.displayStyle}
          toggleReadStatus={toggleReadStatus}
          toggleFavoriteStatus={toggleFavoriteStatus}
          onArchive={handleArchiveArticle}
          onDelete={handleDeleteArticle}
          onRefreshMetadata={handleRefreshMetadata}
          isEditMode={isEditMode}
        />
      </div>
      <ImportArticlesModal
        articles={sharedArticles}
        onImport={handleImportArticles}
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
};

export default Index;
