import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCcw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Article } from "@/lib/types";
import {
  RefreshResult,
  bulkRefreshMetadata,
  updateArticlesInStorage,
} from "@/lib/articleUtils";

interface BulkRefreshButtonProps {
  selectedArticles: Article[];
  onRefreshComplete: (updatedArticles: Article[]) => void;
  onClearSelection: () => void;
}

export function BulkRefreshButton({
  selectedArticles,
  onRefreshComplete,
  onClearSelection,
}: BulkRefreshButtonProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [failedResults, setFailedResults] = useState<RefreshResult[]>([]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setProgress(0);
    setFailedResults([]);

    const results = await bulkRefreshMetadata(
      selectedArticles,
      (current, total, result) => {
        const progressPercent = (current / total) * 100;
        setProgress(progressPercent);

        if (result.success) {
          toast({
            title: "Article Updated",
            description: `Successfully refreshed metadata for "${
              result.article.title || result.article.url
            }"`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: `Failed to refresh "${
              result.article.title || result.article.url
            }": ${result.error}`,
          });
        }
      }
    );

    const failed = results.filter((r) => !r.success);
    setFailedResults(failed);

    // Update successful articles in storage
    const successfulArticles = results
      .filter((r) => r.success)
      .map((r) => r.article);

    const updatedArticles = [...selectedArticles];
    successfulArticles.forEach((refreshedArticle) => {
      const index = updatedArticles.findIndex(
        (a) => a.id === refreshedArticle.id
      );
      if (index !== -1) {
        updatedArticles[index] = refreshedArticle;
      }
    });

    updateArticlesInStorage(updatedArticles);
    onRefreshComplete(updatedArticles);

    setIsRefreshing(false);
    onClearSelection();

    toast({
      title: "Bulk Refresh Complete",
      description: `Successfully refreshed ${successfulArticles.length} articles. ${failed.length} failed.`,
    });

    if (failed.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleRetryFailed = () => {
    setShowConfirmDialog(false);
    const failedArticles = failedResults.map((r) => r.article);
    handleRefresh();
  };

  if (selectedArticles.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 flex items-center gap-4 p-4 bg-background border rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span>{selectedArticles.length} articles selected</span>
        </div>

        {isRefreshing && (
          <div className="w-48">
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          variant="default"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          {isRefreshing ? "Refreshing..." : "Refresh Metadata"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={isRefreshing}
        >
          Cancel
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {failedResults.length} articles failed to refresh. Would you like
              to retry these articles?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetryFailed}>
              Retry Failed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
