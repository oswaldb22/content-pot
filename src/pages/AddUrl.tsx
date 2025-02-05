import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Article } from "@/components/ArticleList";

const AddUrl = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = window.location;

  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const saveArticle = async () => {
      // Get everything after /add/
      const urlPath = location.pathname.replace("/add/", "");
      if (!urlPath) {
        navigate("/");
        return;
      }

      setStatus("Decoding URL...");

      const validUrl = decodeURIComponent(urlPath);

      try {
        setStatus("Fetching article metadata...");

        const response = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(validUrl)}`
        );
        const data = await response.json();

        setStatus("Saving article...");

        const newArticle: Article = {
          id: crypto.randomUUID(),
          url: validUrl,
          title: data.status === "success" ? data.data.title : undefined,
          description:
            data.status === "success" ? data.data.description : undefined,
          image: data.status === "success" ? data.data.image?.url : undefined,
          favicon: data.status === "success" ? data.data.logo?.url : undefined,
          publishedDate: data.status === "success" ? data.data.date : undefined,
          dateAdded: new Date().toISOString(),
          read: false,
          status: "active",
          deleted: false,
        };

        const savedArticles = localStorage.getItem("articles");
        const articles = savedArticles ? JSON.parse(savedArticles) : [];

        localStorage.setItem(
          "articles",
          JSON.stringify([...articles, newArticle])
        );

        toast({
          title: "Article saved successfully",
          description: "Your article has been added to your reading list",
        });
      } catch (error) {
        console.error("Error saving article:", error);
        setStatus("Saving article without metadata...");

        const newArticle: Article = {
          id: crypto.randomUUID(),
          url: validUrl,
          dateAdded: new Date().toISOString(),
          read: false,
          status: "active",
          deleted: false,
        };

        const savedArticles = localStorage.getItem("articles");
        const articles = savedArticles ? JSON.parse(savedArticles) : [];
        localStorage.setItem(
          "articles",
          JSON.stringify([...articles, newArticle])
        );

        toast({
          title: "Article saved",
          description: "Article saved without preview data",
        });
      }

      setStatus("Redirecting to home...");
      navigate("/");
    };

    saveArticle();
  }, [location.pathname, navigate, toast]);

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
