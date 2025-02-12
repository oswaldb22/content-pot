import { useState, useEffect } from "react";

export interface Preferences {
  displayStyle: "full" | "minimal";
  sortOrder: "newest" | "oldest";
  filters: {
    domains: string[];
    status: ("active" | "archived")[];
    read: ("read" | "unread")[];
    categories: string[];
    favorite: boolean;
  };
}

const DEFAULT_PREFERENCES: Preferences = {
  displayStyle: "full",
  sortOrder: "newest",
  filters: {
    domains: [],
    status: ["active"],
    read: ["read", "unread"],
    categories: [],
    favorite: false,
  },
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const savedPreferences = localStorage.getItem("preferences");
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        // Ensure all required fields exist
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          filters: {
            ...DEFAULT_PREFERENCES.filters,
            ...parsed.filters,
          },
        };
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    preferences,
    updatePreference,
  };
}
