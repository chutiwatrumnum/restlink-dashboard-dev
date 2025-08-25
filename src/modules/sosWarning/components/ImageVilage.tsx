import { Card } from "antd";
import React, { useState, useRef, useEffect } from "react";
import Topbar from "./imageVillage/Topbar";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { dataSelectPlan } from "../../../stores/interfaces/SosWarning";
import VillageMapTS from "./vilageMap/VillageMapTS";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";


const ImageVillage = ({ uploadedImage, projectName, showWarningVillage,
  setShowWarningVillage, dataMapAll, dataSelectPlan, onLatLngChange, onMarkerSelect,
  onMarkerNameChange, onMarkerAddressChange, onMarkerUpdate, selectedMarkerUpdate, villageMapResetRef,
  villageMapUpdateAddressRef, villageMapConfirmRef, mapMode, onMapModeChange, onMarkerDeleted, onZoneCreated, onZoneEdited,
  onZoneEditStarted, onNewMarkerCreated, onAlertMarkersChange, villageMapRefreshRef,
  setDataMapAll, setDataEmergency, setUnitHover, setUnitClick, onActiveMarkerChange, currentDataFloor }: any) => {

  // ใช้ mapMode จาก props แทน state ของตัวเอง
  const currentMapMode = mapMode || 'work-it';
  
  // ใช้ useRef สำหรับ dataFloor เพื่อป้องกัน re-render
  const dataFloorRef = useRef<any>(currentDataFloor || {});
  
  // อัปเดต ref เมื่อ currentDataFloor เปลี่ยน
  useEffect(() => {
    dataFloorRef.current = currentDataFloor || {};
  }, [currentDataFloor]);

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
        dataFloorRef={dataFloorRef}
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
