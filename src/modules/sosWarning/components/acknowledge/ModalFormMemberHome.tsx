import { useState, useEffect } from "react";
import CreateModal from "../../../../components/common/FormModal";
import dayjs from 'dayjs';
import {
  Row,
  Col,
  DatePicker,
  Input,
  Button,
  Form,
  Upload
} from "antd";
import SuccessModal from "../../../../components/common/SuccessModal";
import { ListMember } from "./components/ListMember";
import { Member } from "../../../../stores/interfaces/SosWarning";



interface ModalFormMemberHomeProps {
  isOpen: boolean;
  onClose: () => void;
  idMarker: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const ModalFormMemberHome: React.FC<ModalFormMemberHomeProps> = ({ 
  isOpen, 
  onClose,
  idMarker,
  setIsModalOpen,
  isModalOpen
}) => {
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
  const [storeMember, setStoreMember] = useState<Member[]>([
    {
      id: 1,
      name: "Warunya Thacharoenyiing",
      role: 1,
      phone: "08X-XXX-XXXX",
      lastCall: "22/11/2024 11:11",
      status: "pending" as const,
      failedCount: 0
    },
    {
      id: 2,
      name: "Komchai Thacharoenyiing",
      role: 0,
      phone: "08X-XXX-XXXX", 
      lastCall: "22/11/2024 11:11",
      status: "pending" as const,
      failedCount: 1
    },
    {
      id: 3,
      name: "Komsan Thacharoenyiing",
      role: 0,
      phone: "08X-XXX-XXXX",
      lastCall: "22/11/2024 11:11",
      status: "pending" as const,
      failedCount: 1
    }
  ]);
  const [imageUrl, setImageUrl] = useState<string>();
  const [form] = Form.useForm();

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);



  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSave = () => {
    console.log('handleSave')
  }

  const handleCancel = () => {
    onClose();
    // console.log('handleCancel')
  }

  const formMemberHome = () => {
    return (
      <div className="p-6">
        {/* ส่วนหัว */}
        <div className="mb-6">
          <h2 className="text-2xl text-[#5387ea] font-bold mb-2" 
          >House Members List</h2>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-2">🏠</span>
            <span className="text-lg">11/9 Soi Waransinittwong 79, Bangkok</span>
          </div>
        </div>

        {/* รายการสมาชิก */}
        <div className="space-y-4">
          {/* สมาชิกคนที่ 1 */}
         {storeMember.map((member, idx) => (
            <ListMember
              setIsModalOpen={setIsModalOpen}
              key={member.id}
              member={member}
              count={idx < storeMember.length - 1 }
              idMarker={idMarker}
            />
         ))}
        </div>
      </div>
    );
  };

  return (
    <CreateModal
      title={""}
      content={formMemberHome()}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
    />
  );
};

 ;
