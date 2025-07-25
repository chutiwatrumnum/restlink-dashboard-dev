import React from "react";
import { useState, useRef, useEffect } from "react";
import { Row, Col } from "antd";
import FormBuildingCondo from "./FormBuildingCondo";
import FormWarningSOS from "./FormWarningSOS";
import Topbar from "./condoMap/Topbar";
import VillageMapTS from "./vilageMap/VillageMapTS";
interface CondoMapProps {
  uploadImage: string;
  handleCancelCondo: (e: React.MouseEvent<HTMLDivElement>) => void;
  buildingPlan: {
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  };
  projectName: string;
}

const CondoMap = ({
  uploadImage,
  handleCancelCondo,
  buildingPlan,
  projectName
}: CondoMapProps) => {
  const [statusClickMap, setStatusClickMap] = useState<boolean>(false);
  const [showRightForm, setShowRightForm] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [createdItem, setCreatedItem] = useState<{
    type: 'marker' | 'zone';
    data: any;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // ตรวจสอบว่าคลิกที่ Monitoring หรือ Alert Status หรือไม่
      const isMonitoringClick = target.closest('[class*="bg-blue-50"]') || // Monitoring section
                                target.closest('[class*="bg-gray-50"]') || // Alert Status section
                                target.textContent?.includes('Monitoring') ||
                                target.textContent?.includes('Alert Status') ||
                                target.textContent?.includes('Emergency') ||
                                target.textContent?.includes('Normal');
      
      if (isMonitoringClick) {
        // ถ้าคลิกที่ Monitoring หรือ Alert Status ไม่ต้องปิด form
        return;
      }
      
      // ตรวจสอบว่าคลิกนอก form และนอกรูปภาพ
      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        imageRef.current &&
        !imageRef.current.contains(event.target as Node)
      ) {
        setStatusClickMap(false);
        setShowRightForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusClickMap(true);
    setShowRightForm(true);
  };

  const handleCancel = (e: React.MouseEvent<HTMLDivElement>) => {
    handleCancelCondo(e);
    setStatusClickMap(false);
    setShowRightForm(false);
    setCreatedItem(null); // ล้างข้อมูล item ที่สร้าง
  };

  // callback เมื่อสร้าง marker หรือ zone เสร็จ
  const handleItemCreated = (type: 'marker' | 'zone', data: any) => {
    setCreatedItem({ type, data });
    setStatusClickMap(true);
    setShowRightForm(true); // แสดง FormBuildingCondo
  };

  // callback เมื่อ double click marker หรือ zone (สำหรับแก้ไข)
  const handleItemEdit = (item: {type: 'marker' | 'zone', data: any} | null) => {
    setCreatedItem(item);
    if (item) {
      setStatusClickMap(true);
      setShowRightForm(true); // แสดง FormBuildingCondo เมื่อ double click เพื่อแก้ไข
    }
  };

  return (
    <>

      <Row gutter={0}>
        <Col 
          span={24} sm={24} md={24} lg={16}
          className=""
        >
          <div className="">
            <Topbar
              condoType={buildingPlan.condoType}
              floor={buildingPlan.floor}
              buildingNumber={buildingPlan.numberOfBuilding}
              projectName={projectName}
            />
            
            <div className="w-full flex flex-wrap">
              <VillageMapTS 
                showWarningVillage={showRightForm}
                setShowWarningVillage={setShowRightForm}
                uploadedImage={uploadImage} 
                setStatusClickMap={setStatusClickMap}
                statusClickMap={statusClickMap}
                onItemCreated={handleItemCreated}
                onLastCreatedItemChange={handleItemEdit}
              />
            </div>
          </div>
        </Col>

        
        <Col 
          span={24} sm={24} md={24} lg={8} 
          className="min-h-screen  "
          ref={formRef}
        >
          <div className=" flex flex-wrap h-full">
          {/* <FormBuildingCondo onCancel={handleCancel} /> */}
            {showRightForm ? (
              <FormBuildingCondo onCancel={handleCancel} createdItem={createdItem} />
            ) : (
              <FormWarningSOS />
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CondoMap;
