
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAppSettings, getCurrencies, getCompanyProfile } from '@/lib/db';
import type { Currency } from '@/components/settings/currency-management';
import type { AppSettings, CompanyProfile } from '@/lib/db';

interface ModulesContextType {
  isProjectManagementEnabled: boolean;
  setIsProjectManagementEnabled: (value: boolean) => void;
  isPurchaseModuleEnabled: boolean;
  setIsPurchaseModuleEnabled: (value: boolean) => void;
  isCrmEnabled: boolean;
  setIsCrmEnabled: (value: boolean) => void;
  isPayrollEnabled: boolean;
  setIsPayrollEnabled: (value: boolean) => void;
  isUserManagementEnabled: boolean;
  setIsUserManagementEnabled: (value: boolean) => void;
  isSalesModuleEnabled: boolean;
  setIsSalesModuleEnabled: (value: boolean) => void;
  currency: Currency | null;
  setCurrency: (currency: Currency | null) => void;
  allCurrencies: Currency[];
  appSettings: AppSettings | null;
  setAppSettings: (settings: AppSettings) => void;
  companyProfile: CompanyProfile | null;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProjectManagementEnabled, setIsProjectManagementEnabled] = useState(true);
  const [isPurchaseModuleEnabled, setIsPurchaseModuleEnabled] = useState(true);
  const [isCrmEnabled, setIsCrmEnabled] = useState(true);
  const [isPayrollEnabled, setIsPayrollEnabled] = useState(true);
  const [isUserManagementEnabled, setIsUserManagementEnabled] = useState(true);
  const [isSalesModuleEnabled, setIsSalesModuleEnabled] = useState(true);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      const [settings, currencies, profile] = await Promise.all([
        getAppSettings(),
        getCurrencies(),
        getCompanyProfile(),
      ]);
      const currentCurrency = currencies.find(c => c.code === settings.currency) || null;
      setAllCurrencies(currencies);
      setCurrency(currentCurrency);
      setAppSettings(settings);
      setCompanyProfile(profile);
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
        isUserManagementEnabled,
        setIsUserManagementEnabled,
        isSalesModuleEnabled,
        setIsSalesModuleEnabled,
        currency,
        setCurrency,
        allCurrencies,
        appSettings,
        setAppSettings,
        companyProfile
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
