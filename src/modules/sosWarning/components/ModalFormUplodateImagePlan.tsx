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
import { updatePlanSingular } from "../service/api/SOSwarning";
import { useSelector } from "react-redux";

import { useGlobal } from "../contexts/Global";

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
const { dataMapAll ,loadFirst } = useGlobal();
const floorIdGlobal = useSelector((state:any)=>state.sosWarning.floorIdGlobal)
  useEffect(() => {
    setIsModalOpen(isModalOpen);
  }, [isModalOpen]);

 
  const handleSave = async (idUploadPlan:string) => {
    let objUpdate = {
      "newPlanId": idUploadPlan,
      "planInfoId": dataMapAll?.planInfoId
    }
    let dataUpdatePlan = await updatePlanSingular(objUpdate)
    if(dataUpdatePlan.status){
      await loadFirst(floorIdGlobal)
      setIsModalOpen(false);
      SuccessModal("เปลี่ยน Plan สำเร็จ")
    }
  }

  const handleCancel = () => {
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
