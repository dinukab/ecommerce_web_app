'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, StoreSettings } from '@/lib/api';

interface StoreContextType {
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.getStoreSettings();
        if (response.success && response.data) {
          setSettings(response.data);
          
          // Apply primary color to CSS variable if it exists in settings
          if (response.data.primaryColor) {
            document.documentElement.style.setProperty('--brand', response.data.primaryColor);
            // You can also calculate dark/light variants or just use the one from DB
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch store settings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <StoreContext.Provider value={{ settings, loading, error }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
