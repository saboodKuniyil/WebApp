
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAppSettings, getCurrencies } from '@/lib/db';
import type { Currency } from '@/components/settings/currency-management';
import type { AppSettings } from '@/lib/db';

interface ModulesContextType {
  isProjectManagementEnabled: boolean;
  setIsProjectManagementEnabled: (value: boolean) => void;
  isPurchaseModuleEnabled: boolean;
  setIsPurchaseModuleEnabled: (value: boolean) => void;
  isCrmEnabled: boolean;
  setIsCrmEnabled: (value: boolean) => void;
  isPayrollEnabled: boolean;
  setIsPayrollEnabled: (value: boolean) => void;
  currency: Currency | null;
  setCurrency: (currency: Currency | null) => void;
  allCurrencies: Currency[];
  appSettings: AppSettings | null;
  setAppSettings: (settings: AppSettings) => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProjectManagementEnabled, setIsProjectManagementEnabled] = useState(true);
  const [isPurchaseModuleEnabled, setIsPurchaseModuleEnabled] = useState(true);
  const [isCrmEnabled, setIsCrmEnabled] = useState(true);
  const [isPayrollEnabled, setIsPayrollEnabled] = useState(true);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      const settings = await getAppSettings();
      const currencies = await getCurrencies();
      const currentCurrency = currencies.find(c => c.code === settings.currency) || null;
      setAllCurrencies(currencies);
      setCurrency(currentCurrency);
      setAppSettings(settings);
    }
    fetchInitialData();
  }, []);

  return (
    <ModulesContext.Provider value={{ 
        isProjectManagementEnabled, 
        setIsProjectManagementEnabled, 
        isPurchaseModuleEnabled, 
        setIsPurchaseModuleEnabled,
        isCrmEnabled,
        setIsCrmEnabled,
        isPayrollEnabled,
        setIsPayrollEnabled,
        currency,
        setCurrency,
        allCurrencies,
        appSettings,
        setAppSettings
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
