import React, { createContext, useContext, ReactNode } from 'react';

// สร้าง interface สำหรับ context value
interface SecurityAlarmContextType {
  handleCallCustomer: (membre: any,status:boolean) => void;
}

// สร้าง Context
const SecurityAlarmContext = createContext<SecurityAlarmContextType | undefined>(undefined);

// สร้าง Provider component
interface SecurityAlarmProviderProps {
  children: ReactNode;
  handleCallCustomer: (member: any,status:boolean) => void;
}

export const SecurityAlarmProvider: React.FC<SecurityAlarmProviderProps> = ({ 
  children, 
  handleCallCustomer 
}) => {
  return (
    <SecurityAlarmContext.Provider value={{ handleCallCustomer }}>
      {children}
    </SecurityAlarmContext.Provider>
  );
};

// สร้าง custom hook สำหรับใช้ context 
export const useSecurityAlarm = () => {
  const context = useContext(SecurityAlarmContext);
  if (context === undefined) {
    throw new Error('useSecurityAlarm must be used within a SecurityAlarmProvider');
  }
  return context;
}; 


