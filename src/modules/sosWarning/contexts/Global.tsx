import React, { createContext, useContext, ReactNode } from 'react';
import { dataAllMap, dataSelectPlan } from '../../../stores/interfaces/SosWarning';

// สร้าง interface สำหรับ context value
interface GlobalContextType {
  dataAllMap: dataAllMap | null;
  setDataAllMap: (data: dataAllMap) => void;
  uploadedImage: any
  setUploadedImage: (data: any) => void
  dataEmergency: any,
  setDataEmergency: (data: any) => void
  loadFirst: (floorId?:string , buildingDisplay?:any) => void
  dataSelectPlan: dataSelectPlan,
  statusAcknowledge: boolean,
  setStatusAcknowledge: (status: boolean) => void,
  buildingPlan: any
  setBuildingPlan: (data: any) => void
  dataMapAll: any
  setDataMapAll: (data: any) => void
  refreshMap: () => void
}

// สร้าง Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// สร้าง Provider component
interface GlobalProviderProps {
  children: ReactNode;
  dataAllMap: dataAllMap | null;
  setDataAllMap: (data: dataAllMap) => void;
  uploadedImage: any
  setUploadedImage: (data: any) => void,
  dataEmergency: any,
  setDataEmergency: (data: any) => void,
  loadFirst: (floorId?:string , buildingDisplay?:any) => void,
  dataSelectPlan: dataSelectPlan,
  statusAcknowledge: boolean,
  setStatusAcknowledge: (status: boolean) => void,
  buildingPlan: any
  setBuildingPlan: (data: any) => void
  dataMapAll: any
  setDataMapAll: (data: any) => void
  refreshMap: () => void
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  dataAllMap,
  setDataAllMap,
  uploadedImage,
  setUploadedImage,
  dataEmergency,
  setDataEmergency,
  loadFirst,
  dataSelectPlan,
  statusAcknowledge,
  setStatusAcknowledge,
  buildingPlan,
  setBuildingPlan,
  dataMapAll,
  setDataMapAll,
  refreshMap
}) => {
  return (
    <GlobalContext.Provider value={{ 
      dataAllMap, 
      setDataAllMap, 
      uploadedImage, 
      setUploadedImage, 
      dataEmergency, 
      setDataEmergency, 
      loadFirst,
      dataSelectPlan,
      statusAcknowledge,
      setStatusAcknowledge,
      buildingPlan,
      setBuildingPlan,
      dataMapAll,
      setDataMapAll,
      refreshMap
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

// สร้าง custom hook สำหรับใช้ context (เหมือน inject ใน Vue)
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}; 