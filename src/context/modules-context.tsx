
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAppSettings, getCurrencies } from '@/lib/db';
import type { Currency } from '@/components/settings/currency-management';

interface ModulesContextType {
  isProjectManagementEnabled: boolean;
  setIsProjectManagementEnabled: (value: boolean) => void;
  isPurchaseModuleEnabled: boolean;
  setIsPurchaseModuleEnabled: (value: boolean) => void;
  currency: Currency | null;
  setCurrency: (currency: Currency | null) => void;
  allCurrencies: Currency[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProjectManagementEnabled, setIsProjectManagementEnabled] = useState(true);
  const [isPurchaseModuleEnabled, setIsPurchaseModuleEnabled] = useState(true);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      const settings = await getAppSettings();
      const currencies = await getCurrencies();
      const currentCurrency = currencies.find(c => c.code === settings.currency) || null;
      setAllCurrencies(currencies);
      setCurrency(currentCurrency);
    }
    fetchInitialData();
  }, []);

  return (
    <ModulesContext.Provider value={{ 
        isProjectManagementEnabled, 
        setIsProjectManagementEnabled, 
        isPurchaseModuleEnabled, 
        setIsPurchaseModuleEnabled,
        currency,
        setCurrency,
        allCurrencies
    }}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};
