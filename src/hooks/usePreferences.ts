import { useState, useEffect } from 'react';

interface Preferences {
  displayStyle: 'full' | 'minimal';
  sortOrder: 'newest' | 'oldest';
}

const DEFAULT_PREFERENCES: Preferences = {
  displayStyle: 'full',
  sortOrder: 'newest',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const savedPreferences = localStorage.getItem('preferences');
    return savedPreferences ? JSON.parse(savedPreferences) : DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
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
