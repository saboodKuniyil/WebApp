
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

interface ModulesProviderProps {
  children: ReactNode;
  serverAppSettings: AppSettings;
  serverCurrencies: Currency[];
  serverCompanyProfile: CompanyProfile;
}

export const ModulesProvider: React.FC<ModulesProviderProps> = ({ 
  children,
  serverAppSettings,
  serverCurrencies,
  serverCompanyProfile
}) => {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(serverAppSettings);
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>(serverCurrencies);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(serverCompanyProfile);
  const [currency, setCurrency] = useState<Currency | null>(() => {
    return serverCurrencies.find(c => c.code === serverAppSettings.currency) || null;
  });
  
  const [isInitialLoad, setIsInitialLoad] = useState(false); // No initial load flicker needed

  const handleSetAppSettings = (settings: AppSettings) => {
    setAppSettings(settings);
  };
  
  const handleSetCompanyProfile = (profile: CompanyProfile | null) => {
    setCompanyProfile(profile);
  };

  const handleSetCurrency = (newCurrency: Currency | null) => {
    setCurrency(newCurrency);
  };

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
        setCurrency: handleSetCurrency,
        allCurrencies,
        appSettings,
        setAppSettings: handleSetAppSettings,
        companyProfile,
        setCompanyProfile: handleSetCompanyProfile,
        isLoading: false, // Data is pre-loaded
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
