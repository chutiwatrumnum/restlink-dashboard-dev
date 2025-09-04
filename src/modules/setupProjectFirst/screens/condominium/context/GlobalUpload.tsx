import React, { createContext, useContext, ReactNode } from 'react';

// สร้าง interface สำหรับ context value
interface GlobalUploadContextType {
  selectedBuilding: string;
  buildingData: any;
  setBuildingData: (data: any) => void;
}

// สร้าง Context
const GlobalUploadContext = createContext<GlobalUploadContextType | undefined>(undefined);

// สร้าง Provider component
interface GlobalUploadProviderProps {
  children: ReactNode;
  selectedBuilding: string;
  buildingData: any;
  setBuildingData: (data: any) => void;
}

export const GlobalUploadProvider: React.FC<GlobalUploadProviderProps> = ({ 
  children, 
  selectedBuilding,
  buildingData,
  setBuildingData
}) => {
  return (
    <GlobalUploadContext.Provider value={{ selectedBuilding, buildingData, setBuildingData }}>
      {children}
    </GlobalUploadContext.Provider>
  );
};

// สร้าง custom hook สำหรับใช้ context (เหมือน inject ใน Vue)
export const useGlobalUpload = () => {
  const context = useContext(GlobalUploadContext);
  if (context === undefined) {
    throw new Error('useGlobalUpload must be used within a GlobalUploadProvider');
  }
  return context;
}; 