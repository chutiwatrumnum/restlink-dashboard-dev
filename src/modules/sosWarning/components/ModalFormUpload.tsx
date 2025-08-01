import { useState, useEffect } from "react";
import CreateModal from "../../../components/common/FormModal";
import dayjs from 'dayjs';
import { Form, message, Progress } from "antd";
import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { FormUploadPlan } from "./FormUploadPlan";
import { dataSelectPlan } from "../../../stores/interfaces/SosWarning";




interface ModalFormUpdateProps {
  dataSelectPlan: dataSelectPlan,
  isOpen: boolean;
  selectedWarranty?: WarrantyDetailsType | null;
  isUploading: boolean;
  onClose?: () => void;
  onUploadSuccess: (base64: string) => void;
  onCondoPlanSubmit?: (condoType: string, floor: number, numberOfBuilding: number, projectName: string) => void;
  setProjectName: (projectName: string) => void;
  setPlanType: (planType: string) => void;
  loadFirst: ()=>void;
  planType: string;
  
  dataMapAll: dataAllMap;
}

export const ModalFormUpdate: React.FC<ModalFormUpdateProps> = ({ 
  isOpen,
  onClose,
  onUploadSuccess,
  isUploading,
  onCondoPlanSubmit,
  setProjectName,
  dataSelectPlan,
  setPlanType,
  planType,
  loadFirst,// function
  dataMapAll
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buildingPlan, setBuildingPlan] = useState<{
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  } | null>(null);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  // ฟังก์ชันอัพเดท progress จาก axios
  const handleProgressUpdate = (progressPercent: number) => {
    setProgress(progressPercent);
    if (progressPercent >= 100) {
      setTimeout(() => {
        loadFirst();
        setShowProgress(false);
        onUploadSuccess(imageBase64!);
      }, 200);
    }
  };

  const handleNextVillage = (projectName: string) => {
    setProjectName(projectName);
    // setShowProgress จะถูกเรียกจาก FormUploadPlan เมื่อเริ่มต้น upload
  };

  // ฟังก์ชันเรียกเมื่อเริ่มต้น upload
  const handleUploadStart = () => {
    setProgress(0);
    setShowProgress(true);
  };

  const handleNextCondo = (condoType: string, floor: number, numberOfBuilding: number, projectName: string) => {
    if (onCondoPlanSubmit) {
      onCondoPlanSubmit(condoType, floor, numberOfBuilding, projectName);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    if (onClose) {
      onClose();
    }
    setImageBase64(null);
    setShowProgress(false);
  };

  const renderBuildingPlan = () => {
    if (!buildingPlan) return null;
    const { condoType, floor, numberOfBuilding } = buildingPlan;
    const maxPerRow = condoType === "High-rise" ? 18 : numberOfBuilding;
    const rows = [];
    let buildingIndex = 1;

    while (buildingIndex <= numberOfBuilding) {
      const thisRow = [];
      for (let b = 0; b < maxPerRow && buildingIndex <= numberOfBuilding; b++, buildingIndex++) {
        thisRow.push(
          <div key={buildingIndex} style={{ display: "inline-block", margin: 8 }}>
            <div style={{ textAlign: "center", fontWeight: "bold" }}>Building {buildingIndex}</div>
            {[...Array(floor)].map((_, i) => (
              <div key={i} style={{ background: "#f0e6fa", margin: 2, padding: 4, minWidth: 60, textAlign: "center" }}>
                {floor - i}
              </div>
            ))}
          </div>
        );
      }
      rows.push(<div key={buildingIndex + "-row"} style={{ marginBottom: 16 }}>{thisRow}</div>);
    }
    return <div style={{ marginTop: 24 }}>{rows}</div>;
  };

  return (
    <>
      <CreateModal
        title={"Upload Plan"}
        content={
          showProgress ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Progress percent={progress} status={progress < 100 ? "active" : "success"} style={{ width: 200 }} />
              <div className="mt-4 text-[#002B45] font-semibold">Uploading...</div>
            </div>
          ) : (
            <FormUploadPlan
              dataSelectPlan={dataSelectPlan}
              imageBase64={imageBase64}
              setImageBase64={setImageBase64}
              isUploading={isUploading}
              handleNextVillage={handleNextVillage}
              handleNextCondo={handleNextCondo}
              setPlanType={setPlanType}
              planType={planType}
              onUploadStart={handleUploadStart}
              onProgressUpdate={handleProgressUpdate}
              dataMapAll={dataMapAll}
              loadFirst={loadFirst}
            />
          )
        }
        onOk={() => {}}
        isOpen={isModalOpen}
        onCancel={handleCancel}
      />
      {buildingPlan?.condoType === "Condo" && renderBuildingPlan()}
    </>
  );
};
