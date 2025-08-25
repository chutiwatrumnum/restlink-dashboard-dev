import {  useEffect } from "react";
import CreateModal from "../../../components/common/FormModal";

import SuccessModal from "../../../components/common/SuccessModal";
import Content from "./uploadPlanMultiple/Content";

interface ModalFormUpdateProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onClose?: () => void;
  
}

export const ModalUploadPlan: React.FC<ModalFormUpdateProps> = ({ 
  isModalOpen, 
  setIsModalOpen,
  onClose,
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
    console.log(onClose,'onClose')
    // setIsModalOpen(false);
    if(onClose){
      onClose()
    }
  }

  return (
    <CreateModal
      title={"Upload floor plan"}
      content={<Content handleSave={handleSave} handleCancel={handleCancel} />}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
      width="40%"
    />
  );
};

 ;
