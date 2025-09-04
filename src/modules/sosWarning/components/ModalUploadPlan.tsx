import {  useEffect } from "react";
import CreateModal from "../../../components/common/FormModal";

import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import Content from "./uploadPlanMultiple/Content";
import { updatePlanPlural } from "../service/api/SOSwarning";
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

 
  const handleSave = async (idUploadPlan:string,blockId:number,floorId:number[]) => {
    // console.log("handleSave");
    // console.log(idUploadPlan,'idUploadPlan')
    // console.log(blockId,'blockId')
    // console.log(floorId,'floorId')
    // return 
    if(idUploadPlan && blockId && floorId.length > 0){
        let dataChangePlan = {
            "newPlanId": idUploadPlan,
            "blockId": blockId,
            "floorId": floorId
        }
        let responseChangePlan = await updatePlanPlural(dataChangePlan)
        if(responseChangePlan.status){
            setIsModalOpen(false);
            SuccessModal("Plan Changed Successfully")
        }
    }
    else {
        FailedModal("Failed to change plan",700)
    }

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
      onOk={()=>{}}
      isOpen={isModalOpen}
      onCancel={handleCancel}
      width="40%"
    />
  );
};

 ;
