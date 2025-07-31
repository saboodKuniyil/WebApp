
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModulesContextType {
  isProjectManagementEnabled: boolean;
  setIsProjectManagementEnabled: (value: boolean) => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export const ModulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProjectManagementEnabled, setIsProjectManagementEnabled] = useState(true);

  return (
    <ModulesContext.Provider value={{ isProjectManagementEnabled, setIsProjectManagementEnabled }}>
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
