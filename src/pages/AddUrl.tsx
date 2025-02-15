import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { extractDomain, saveArticle } from "@/lib/article";
import { usePreferences } from "@/hooks/usePreferences";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AddUrl = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = window.location;
  const { preferences, updatePreference } = usePreferences();

  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const handleSaveArticle = async () => {
      // Get everything after /add/
      const urlPath = location.pathname.replace("/add/", "");
      if (!urlPath) {
        navigate("/", { replace: true });
        return;
      }

      setStatus("Decoding URL...");

      const validUrl = decodeURIComponent(urlPath);

      try {
        setStatus("Saving article...");
        await saveArticle(validUrl);
        const domain = extractDomain(validUrl);
        if (!preferences.filters.domains.includes(domain)) {
          updatePreference("filters", {
            ...preferences.filters,
            domains: [...preferences.filters.domains, domain],
          });
        }
        toast({
          title: "Article saved successfully",
          description: "Your article has been added to your reading list",
        });
      } catch (error) {
        console.error("Error saving article:", error);
        if (
          error instanceof Error &&
          error.message === "Article already exists in your reading list"
        ) {
          toast({
            title: "Article already exists",
            description: "This article is already in your reading list",
          });
        } else {
          toast({
            title: "Article saved",
            description: "Article saved without preview data",
          });
        }
      }

      setStatus("Redirecting to home...");
      navigate("/", { replace: true });
    };

    handleSaveArticle();
  }, [
    location.pathname,
    navigate,
    toast,
    preferences.filters,
    updatePreference,
  ]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
};

export default AddUrl;
