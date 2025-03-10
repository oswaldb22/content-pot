import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveArticle } from "@/lib/article";
import { getCategories } from "@/lib/categories";
import { CategoryDialog } from "./CategoryDialog";

interface AddArticleModalProps {
  onAddArticle: (article: {
    url: string;
    categories: string[];
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    publishedDate?: string;
  }) => void;
}

export function AddArticleModal({ onAddArticle }: AddArticleModalProps) {
  const [url, setUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats.map((c) => c.name));
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleCategoryCreated = (categoryName: string) => {
    loadCategories();
    setSelectedCategories([categoryName]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const article = await saveArticle(url, {
        categories: selectedCategories,
      });
      // Call onAddArticle before any state updates to ensure immediate propagation
      onAddArticle(article);
      setIsLoading(false);
      setUrl("");
      setSelectedCategories([]);
      setOpen(false);
      toast({
        title: "Article saved successfully",
        description: "Your article has been added to your reading list",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error saving article",
        description:
          error instanceof Error ? error.message : "Failed to save article",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="group hover:border-gray-400 transition-colors duration-300"
          >
            <PlusCircle className="mr-2 h-4 w-4 group-hover:text-gray-600" />
            Add
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Save Article
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="category">Category (optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setCategoryDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Category
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== cat)
                          )
                        }
                        className="ml-2 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!selectedCategories.includes(value)) {
                      setSelectedCategories([...selectedCategories, value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => !selectedCategories.includes(cat))
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Article"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}
