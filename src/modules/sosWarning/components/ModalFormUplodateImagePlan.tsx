import { useState, useEffect } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import CreateModal from "../../../components/common/FormModal";
import dayjs from 'dayjs';
import {
  Form,
} from "antd";
import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import SuccessModal from "../../../components/common/SuccessModal";
import Content from "./ModalformUpdatePImagePlan/Context";

interface ModalFormUpdateProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onClose?: () => void;
  selectedWarranty?: WarrantyDetailsType | null;
}

export const ModalFormUploadateImagePlan: React.FC<ModalFormUpdateProps> = ({ 
  isModalOpen, 
  setIsModalOpen,
  onClose,
  selectedWarranty 
}) => {
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);

  useEffect(() => {
    setIsModalOpen(isModalOpen);
  }, [isModalOpen]);

 
  const handleSave = () => {
    console.log("handleSave");
    setIsModalOpen(false);
    SuccessModal("เปลี่ยน Plan สำเร็จ")
  }

  const handleCancel = () => {
    console.log("handleCancel");
    setIsModalOpen(false);
  }

  return (
    <CreateModal
      title={"Edit Plan"}
      content={<Content handleSave={handleSave} handleCancel={handleCancel} isModalOpen={isModalOpen} />}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
      width="40%"
    />
  );
};

 ;
