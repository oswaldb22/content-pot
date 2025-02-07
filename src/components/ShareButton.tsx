import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { Article } from "@/lib/types";
import { generateShareableUrl } from "@/lib/encode";

interface ShareButtonProps {
  articles: Article[];
}

export function ShareButton({ articles }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = generateShareableUrl(articles);

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link to show your article list",
      });
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      title="Share article list"
    >
      <Share className="h-4 w-4" />
    </Button>
  );
}
