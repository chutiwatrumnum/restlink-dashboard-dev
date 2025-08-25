import React, { createContext, useContext, ReactNode } from 'react';

// สร้าง interface สำหรับ context value
interface CondoContextType {
  dataBuilding: any;
}

// สร้าง Context
const CondoContext = createContext<CondoContextType | undefined>(undefined);

// สร้าง Provider component
interface CondoProviderProps {
  children: ReactNode;
  dataBuilding: any;
}

export const CondoProvider: React.FC<CondoProviderProps> = ({ 
  children, 
  dataBuilding 
}) => {
  return (
    <CondoContext.Provider value={{ dataBuilding }}>
      {children}
    </CondoContext.Provider>
  );
};

// สร้าง custom hook สำหรับใช้ context (เหมือน inject ใน Vue)
export const useCondo = () => {
  const context = useContext(CondoContext);
  if (context === undefined) {
    throw new Error('useCondo must be used within a CondoProvider');
  }
  return context;
}; 