import React, { createContext, useContext, ReactNode } from 'react';

// สร้าง interface สำหรับ context value
interface WarrantyTrackingContextType {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

// สร้าง Context
const WarrantyTrackingContext = createContext<WarrantyTrackingContextType | undefined>(undefined);

// สร้าง Provider component
interface WarrantyTrackingProviderProps {
  children: ReactNode;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

export const WarrantyTrackingProvider: React.FC<WarrantyTrackingProviderProps> = ({ 
  children, 
  isEditMode,
  setIsEditMode
}) => {
  return (
    <WarrantyTrackingContext.Provider value={{ isEditMode, setIsEditMode }}>
      {children}
    </WarrantyTrackingContext.Provider>
  );
};

// สร้าง custom hook สำหรับใช้ context (เหมือน inject ใน Vue)
export const useWarrantyTracking = () => {
  const context = useContext(WarrantyTrackingContext);
  if (context === undefined) {
    throw new Error('useWarrantyTracking must be used within a WarrantyTrackingProvider');
  }
  return context;
}; 