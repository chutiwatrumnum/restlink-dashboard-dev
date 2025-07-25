import { Card } from "antd";
import React, { useState } from "react";
import Topbar from "./imageVillage/Topbar";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { dataSelectPlan } from "../../../stores/interfaces/SosWarning";
import VillageMapTS from "./vilageMap/VillageMapTS";


const ImageVillage = ({ uploadedImage, projectName, showWarningVillage,
  setShowWarningVillage, dataMapAll, dataSelectPlan, onLatLngChange, onMarkerSelect,
  onMarkerNameChange, onMarkerAddressChange, onMarkerUpdate, selectedMarkerUpdate, villageMapResetRef,
  villageMapUpdateAddressRef, villageMapConfirmRef, mapMode, onMapModeChange, onMarkerDeleted, onZoneCreated, onZoneEdited,
  onZoneEditStarted, onNewMarkerCreated, onAlertMarkersChange, villageMapRefreshRef,
  setDataMapAll, setDataEmergency, setUnitHover, setUnitClick, onActiveMarkerChange }: {
    uploadedImage: string,
    projectName: string, showWarningVillage: boolean,
    setShowWarningVillage: (showWarningVillage: boolean) => void,
    dataMapAll: dataAllMap,
    dataSelectPlan: dataSelectPlan,
    onLatLngChange?: (latitude: number, longitude: number) => void,
    onMarkerSelect?: (marker: any, isNewMarker?: boolean) => void,
    onMarkerNameChange?: (markerId: string | number, newName: string) => void,
    onMarkerAddressChange?: (markerId: string | number, newAddress: string) => void,
    onMarkerUpdate?: (markerId: string | number, updatedMarker: any) => void,
    selectedMarkerUpdate?: {
      id: string | number;
      name: string;
    } | null,
    villageMapResetRef?: React.MutableRefObject<((markerId: string | number) => void) | null>,
    villageMapUpdateAddressRef?: React.MutableRefObject<((markerId: string | number, newAddress: string) => void) | null>,
    villageMapConfirmRef?: React.MutableRefObject<((markerId: string | number, markerData: any) => void) | null>,
    mapMode?: 'preview' | 'work-it',
    onMapModeChange?: (mode: 'preview' | 'work-it') => void,
    onMarkerDeleted?: (deletedMarker?: any) => void,
    onZoneCreated?: () => void,
    onZoneEdited?: () => void,
    onZoneEditStarted?: () => void,
    onNewMarkerCreated?: () => void,
    onAlertMarkersChange?: (alertMarkers: { red: any[], yellow: any[] }) => void,
    villageMapRefreshRef?: React.MutableRefObject<(() => void) | null>,
    setDataMapAll?: (data: any) => void,
    setDataEmergency?: (data: any) => void,
    setUnitHover?: (unitHover: number | null) => void,
    setUnitClick?: (unitClick: number | null) => void,
    onActiveMarkerChange?: (hasActiveMarker: boolean) => void
  }) => {

  // ใช้ mapMode จาก props แทน state ของตัวเอง
  const currentMapMode = mapMode || 'work-it';

  const handleModeChange = (mode: 'preview' | 'work-it') => {
    console.log(`Map mode changed to: ${mode}`);

    // ส่งข้อมูลโมดไปยัง parent component
    if (onMapModeChange) {
      onMapModeChange(mode);
    }
  };



  return (
    <>
      <Topbar
        projectName={projectName}
        mode={currentMapMode}
        onModeChange={handleModeChange}
        dataMapAll={dataMapAll}
      />
      <div className="">
        <VillageMapTS
          uploadedImage={uploadedImage}
          showWarningVillage={showWarningVillage}
          setShowWarningVillage={setShowWarningVillage}
          dataMapAll={dataMapAll}
          dataSelectPlan={dataSelectPlan}
          onLatLngChange={onLatLngChange}
          onMarkerSelect={onMarkerSelect}
          onMarkerNameChange={onMarkerNameChange}
          onMarkerAddressChange={onMarkerAddressChange}
          onMarkerUpdate={onMarkerUpdate}
          selectedMarkerUpdate={selectedMarkerUpdate}
          villageMapResetRef={villageMapResetRef}
          villageMapUpdateAddressRef={villageMapUpdateAddressRef}
          villageMapConfirmRef={villageMapConfirmRef}
          villageMapRefreshRef={villageMapRefreshRef}
          mapMode={currentMapMode}
          onMarkerDeleted={onMarkerDeleted}
          onZoneCreated={onZoneCreated}
          onZoneEdited={onZoneEdited}
          onZoneEditStarted={onZoneEditStarted}
          onNewMarkerCreated={onNewMarkerCreated}
          onAlertMarkersChange={onAlertMarkersChange}
          setDataMapAll={setDataMapAll || (() => { })}
          setDataEmergency={setDataEmergency || (() => { })}
          setUnitHover={setUnitHover || (() => { })}
          setUnitClick={setUnitClick || (() => { })}
          onActiveMarkerChange={onActiveMarkerChange}
        />
      </div>
      {/* สามารถ overlay tooltip/alert ได้ที่นี่ */}
    </>
  );
};

export default ImageVillage;
