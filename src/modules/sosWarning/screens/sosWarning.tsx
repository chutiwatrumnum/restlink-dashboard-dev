import { useState, useRef, useCallback } from "react";
import Header from "../../../components/templates/Header";
// import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ModalFormUpdate } from "../components/ModalFormUpload";
import FormWarningSOS from "../components/FormWarningSOS";
import ImageVillage from "../components/ImageVilage";
import FormVillageLocation from "../components/FormVillageLocation";
import BuildingCondo from "../components/BuildingCondo";
import FormBuildingCondo from "../components/FormBuildingCondo";

import { Row, Col, Button, Card } from "antd";

import defaultImageSOS from "../../../assets/images/defaultImageSOS.png";
const WarrantyTracking = () => {
  // variables
  //   const dispatch = useDispatch<Dispatch>();
  //   const data = useSelector((state: RootState) => state.announcement.tableData);
  //   const announcementMaxLength = useSelector(
  //     (state: RootState) => state.announcement.announcementMaxLength
  //   );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showWarning, setShowWarning] = useState<boolean | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const formVillageRef = useRef<HTMLDivElement>(null);
  const [buildingPlan, setBuildingPlan] = useState<{
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  } | null>(null);

  // setting pagination Option

  const handleUploadImage = () => {
    setIsModalOpen(true);
  };

  // callback เมื่ออัปโหลดสำเร็จ
  const handleUploadSuccess = (base64: string) => {
    setIsUploading(true);
    setUploadedImage(base64);
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const handleCancelCondo = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setBuildingPlan(null);
  };

  const handleCancelVillage = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowWarning(false);
  };

  // state สำหรับเช็คว่ามีแผนหรือไม่ (ตัวอย่างนี้ให้แสดง No plan เสมอ)
  const hasPlan = false;

  // ฟังก์ชัน handle click
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (imageRef.current && imageRef.current.contains(e.target as Node)) ||
      (formVillageRef.current &&
        formVillageRef.current.contains(e.target as Node))
    ) {
      setShowWarning(true); // คลิกบนรูปภาพหรือ FormVillageLocation => แสดง FormVillageLocation
    } else {
      setShowWarning(false); // คลิกที่อื่นๆ => แสดง FormWarningSOS
    }
  };

  const handleCondoPlanSubmit = (
    condoType: string,
    floor: number,
    numberOfBuilding: number
  ) => {
    console.log("handleCondoPlanSubmit");
    console.log("condoType", condoType);
    console.log("floor", floor);
    console.log("numberOfBuilding", numberOfBuilding);
    setBuildingPlan({ condoType, floor, numberOfBuilding });
    setIsModalOpen(false);
  };

  return (
    <>
      <ModalFormUpdate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        isUploading={isUploading}
        onCondoPlanSubmit={handleCondoPlanSubmit}
      />
      <Header title="SOS" />

      {uploadedImage && (
        <div className="p-4" onClick={handleAreaClick}>
          <Card className="h-full" styles={{ body: { padding: 0 } }}>
            <Row gutter={0} className="h-full test">
              <Col span={16}>
                <div ref={imageRef}>
                  <ImageVillage uploadedImage={uploadedImage || ""} />
                </div>
              </Col>
              <Col span={8}>
                <div className="shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  {showWarning === true ? (
                    <div ref={formVillageRef}>
                      <FormVillageLocation onCancel={handleCancelVillage} />
                    </div>
                  ) : (
                    <FormWarningSOS />
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {buildingPlan && (
        <div className="p-4" onClick={handleAreaClick}>
          <Card className="h-full" styles={{ body: { padding: 0 } }}>
            <Row gutter={0} className="h-full test">
              <Col span={16}>
                <div ref={imageRef}>
                  <BuildingCondo buildingPlan={buildingPlan} />
                </div>
              </Col>
              <Col span={8}>
                <div className="shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  {showWarning === true ? (
                    <div ref={formVillageRef}>
                      <FormBuildingCondo onCancel={handleCancelCondo} />
                    </div>
                  ) : (
                    <FormWarningSOS />
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {!uploadedImage && !buildingPlan && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
          <img
            src={defaultImageSOS}
            alt="No plan available"
            className="w-[140px] h-[140px] mb-6 object-contain"
          />
          <div className="text-center">
            <div className="font-bold text-lg text-[#002B45] mb-2">
              No plan available
            </div>
            <div className="text-[#002B45] text-sm mb-6 max-w-xs">
              Please upload a plan using the button below and follow the
              instructions.
            </div>
            <Button
              type="primary"
              size="large"
              className="rounded-lg px-8"
              onClick={handleUploadImage}
            >
              Upload plan
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default WarrantyTracking;
