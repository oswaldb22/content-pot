import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AddArticleModalProps {
  onAddArticle: (article: { url: string; category: string }) => void;
}

export function AddArticleModal({ onAddArticle }: AddArticleModalProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }
    onAddArticle({ url, category });
    setUrl("");
    setCategory("");
    setOpen(false);
    toast({
      title: "Article saved successfully",
      description: "Your article has been added to your reading list",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group hover:border-gray-400 transition-colors duration-300"
        >
          <PlusCircle className="mr-2 h-4 w-4 group-hover:text-gray-600" />
          Add Article
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
          <Button type="submit" className="w-full">Save Article</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}