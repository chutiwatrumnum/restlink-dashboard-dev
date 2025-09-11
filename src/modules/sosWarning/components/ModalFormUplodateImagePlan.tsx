import { useEffect } from "react";
import CreateModal from "../../../components/common/FormModal";
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
}) => {
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
const { dataMapAll ,loadFirst } = useGlobal();
const { refreshMap } = useGlobal();
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
      // refresh แผนที่หลายครั้งเพื่อให้ภาพและมาร์คเกอร์คงตำแหน่งเดิม
      if (typeof refreshMap === 'function') {
        refreshMap();
        setTimeout(() => refreshMap(), 200);
        setTimeout(() => refreshMap(), 600);
      }
      SuccessModal("Plan Changed Successfully")
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
