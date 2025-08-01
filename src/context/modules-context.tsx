
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAppSettings, getCurrencies, getCompanyProfile } from '@/lib/db';
import type { Currency } from '@/components/settings/currency-management';
import type { AppSettings, CompanyProfile } from '@/lib/db';

interface ModulesContextType {
  isProjectManagementEnabled: boolean;
  isPurchaseModuleEnabled: boolean;
  isCrmEnabled: boolean;
  isPayrollEnabled: boolean;
  isUserManagementEnabled: boolean;
  isSalesModuleEnabled: boolean;
  currency: Currency | null;
  setCurrency: (currency: Currency | null) => void;
  allCurrencies: Currency[];
  appSettings: AppSettings | null;
  setAppSettings: (settings: AppSettings) => void;
  companyProfile: CompanyProfile | null;
  setCompanyProfile: (profile: CompanyProfile | null) => void;
  isLoading: boolean;
  isInitialLoad: boolean;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
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
      
      setIsLoading(false);
      setIsInitialLoad(false);
    }
    fetchInitialData();
  }, []);

  const isProjectManagementEnabled = appSettings?.enabled_modules?.project_management ?? false;
  const isPurchaseModuleEnabled = appSettings?.enabled_modules?.purchase ?? false;
  const isCrmEnabled = appSettings?.enabled_modules?.crm ?? false;
  const isPayrollEnabled = appSettings?.enabled_modules?.payroll ?? false;
  const isUserManagementEnabled = appSettings?.enabled_modules?.user_management ?? false;
  const isSalesModuleEnabled = appSettings?.enabled_modules?.sales ?? false;

  return (
    <ModulesContext.Provider value={{ 
        isProjectManagementEnabled,
        isPurchaseModuleEnabled,
        isCrmEnabled,
        isPayrollEnabled,
        isUserManagementEnabled,
        isSalesModuleEnabled,
        currency,
        setCurrency,
        allCurrencies,
        appSettings,
        setAppSettings,
        companyProfile,
        setCompanyProfile,
        isLoading,
        isInitialLoad
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
