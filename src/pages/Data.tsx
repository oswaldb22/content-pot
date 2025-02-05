import { Article } from "@/lib/types";
import { Preferences } from "@/hooks/usePreferences";
import { useEffect, useState } from "react";

interface StoredData {
  articles: Article[];
  preferences: {
    current: Preferences;
    next: Preferences;
  };
}

const Data = () => {
  const [data, setData] = useState<StoredData>({
    articles: [],
    preferences: {
      current: null,
      next: null,
    },
  });

  useEffect(() => {
    const articles = localStorage.getItem("articles");
    const currentPreferences = localStorage.getItem("preferences");
    const nextPreferences = localStorage.getItem("next-preferences");

    setData({
      articles: articles ? JSON.parse(articles) : [],
      preferences: {
        current: currentPreferences ? JSON.parse(currentPreferences) : null,
        next: nextPreferences ? JSON.parse(nextPreferences) : null,
      },
    });
  }, []);

  return <>{JSON.stringify(data, null, 2)}</>;
};

export default Data;
