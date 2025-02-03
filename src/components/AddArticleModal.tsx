import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AddArticleModalProps {
  onAddArticle: (article: { 
    url: string; 
    category?: string;
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    publishedDate?: string;
  }) => void;
}

export function AddArticleModal({ onAddArticle }: AddArticleModalProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        onAddArticle({
          url,
          category,
          title: data.data.title,
          description: data.data.description,
          image: data.data.image?.url,
          favicon: data.data.logo?.url,
          publishedDate: data.data.date,
        });
      } else {
        onAddArticle({ url, category });
      }
      
      setIsLoading(false);
      setUrl("");
      setCategory("");
      setOpen(false);
      toast({
        title: "Article saved successfully",
        description: "Your article has been added to your reading list",
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      onAddArticle({ url, category });
      setIsLoading(false);
      setUrl("");
      setCategory("");
      setOpen(false);
      toast({
        title: "Article saved",
        description: "Article saved without preview data",
      });
    }
  };

  return (
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
          <DialogTitle className="text-xl font-semibold">Save Article</DialogTitle>
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
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="e.g., Technology, Science"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Article"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}