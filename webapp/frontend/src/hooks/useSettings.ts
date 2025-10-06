import { useState, useEffect } from 'react';

interface Settings {
  apiKey: string;
  baseUrl: string;
  verifySSL: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://server1.tailaa85d9.ts.net',
  verifySSL: true,
};

const SETTINGS_KEY = 'misp-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_KEY);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};