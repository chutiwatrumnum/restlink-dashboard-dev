import { Form, Input, Select, Button, Upload, Progress } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { BuildingCondo as BuildingCondoType } from "../../../../stores/interfaces/SosWarning";
import CreateModal from "../../../../components/common/FormModal";
import FormUploadCondo from "./formUploadCondo/formUpload";
import { dataAllMap } from "../../../../stores/interfaces/SosWarning";
import { useState } from "react";

interface ModalFormUploadCondoProps {
  isOpen: boolean;
  setUploadImage: (image: string) => void;
  onClose: () => void;
  selectedBuildingCondo: {
    numberOfBuilding: number;
    floor: number;
  };
  dataMapAll: dataAllMap;
}

const ModalFormUploadCondo: React.FC<ModalFormUploadCondoProps> = ({
  isOpen,
  setUploadImage,
  onClose,
  selectedBuildingCondo,
  dataMapAll
}) => {
  const [form] = Form.useForm();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log(dataMapAll,'dataMapAll')
      console.log(selectedBuildingCondo,'selectedBuildingCondo')

      let floor = selectedBuildingCondo.floor - 1;
      let numberOfBuilding = selectedBuildingCondo.numberOfBuilding - 1;

      // let dataFloor = dataMapAll?.building[numberOfBuilding].floorInfo[floor];
      // console.log(dataFloor,'dataFloor')
      // let id = dataFloor?.id || '';
      // return 
      console.log(values,'values-condo')
      // Get file name from form values
      // console.log(fileName,'fileName')
      // setUploadingFileName(fileName);
      
      // Simulate upload progress
      setIsUploading(true);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // setIsUploading(false);
            // console.log(values.image,'values.image')
            // Reset progress and close modal
                          setTimeout(() => {
                setUploadProgress(0);
                setUploadingFileName("");
                setIsUploading(false);
                setIsImageUploaded(true);
                setUploadImage(imageUrl || '');
              }, 500); // Small delay to show 100% before closing
            return 100;
          }
          return prev + 1;
        });
      }, 100);

    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUploadProgress(0);
    setIsUploading(false);
    setUploadingFileName("");
    setImageUrl("");
    setIsImageUploaded(false);
    onClose();
  };

  const handleDeleteImage = () => {
    setImageUrl("");
    setIsImageUploaded(false);
    setUploadProgress(0);
    setUploadingFileName("");
    form.resetFields();
  };

  const modalContent = (
    <div>
      {!isUploading && !isImageUploaded && (
        <FormUploadCondo 
          handleSave={handleSave}  // เมื่อ save
          selectedBuildingCondo={selectedBuildingCondo} // ข้อมูลอาคาร
          imageUrl={imageUrl} // รูปภาพที่อัพโหลด
          setImageUrl={setImageUrl} // ตั้งค่า url รูปภาพ
          setUploadingFileName={setUploadingFileName} // ตั้งค่า file name
          setIsImageUploaded={setIsImageUploaded}
          setUploadProgress={setUploadProgress}
          dataMapAll={dataMapAll}
        /> 
      )}
      
      {isUploading && (
        <div className="mt-4 w-50 mx-auto flex flex-col justify-center items-center">
          <div className="mb-2 text-center">
            <p className="text-gray-700 font-medium">กำลังอัปโหลด...</p>
            <p className="text-gray-500 text-sm">{uploadingFileName}</p>
          </div>
          <Progress percent={uploadProgress} status="active" className="w-full" />
        </div>
      )}


    </div>
  );

  return (
    <CreateModal
      title={"Up Image To plan"}
      content={modalContent}
      onOk={handleSave}
      isOpen={isOpen}
      onCancel={handleCancel}
    />
  );
};
export default ModalFormUploadCondo;
