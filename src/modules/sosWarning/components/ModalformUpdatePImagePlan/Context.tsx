
import { Button } from "antd";
import { Upload } from "antd";
import { useState, useEffect } from "react";
import { useGlobal } from "../../contexts/Global";
import { uploadPlan } from "../../service/api/SOSwarning";


const Content = ({
    handleSave,
    handleCancel,
    isModalOpen,
}: {
    handleSave: (idUploadPlan:string) => void;
    handleCancel: () => void;
    isModalOpen: boolean;
}) => {
    const { dataAllMap  } = useGlobal();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [idUploadPlan, setIdUploadPlan] = useState<string>('');

    // useEffect เพื่อตั้งค่ารูปภาพเริ่มต้นจาก dataAllMap?.planImg
    useEffect(() => {
        if (dataAllMap?.planImg) {
            setSelectedImage(dataAllMap.planImg);
            setShowUpload(false);
        } else {
            setShowUpload(true);
        }
    }, [dataAllMap?.planImg]);

    useEffect(()=>{
        if(!isModalOpen){
            setIdUploadPlan('')
        }
    },[isModalOpen])

    // useEffect เพื่อ reset รูปภาพกลับเป็นค่าเริ่มต้นเมื่อเปิด popup ใหม่
    useEffect(() => {
        if (isModalOpen) {
            // Reset กลับเป็นรูปเริ่มต้นจาก dataAllMap?.planImg เมื่อเปิด popup
            if (dataAllMap?.planImg) {
                setSelectedImage(dataAllMap.planImg);
                setShowUpload(false);
            } else {
                setSelectedImage(null);
                setShowUpload(true);
            }
        }
    }, [isModalOpen, dataAllMap?.planImg]);

    const handleUploadChange = async (info: any) => {
        const file = info.file.originFileObj || info.file;
        let dataUpdatePlan = await uploadPlan(file)
        if(dataUpdatePlan.status){
            setIdUploadPlan(dataUpdatePlan.result.id)
        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setSelectedImage(imageUrl);
                setShowUpload(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setSelectedImage(null);
        setShowUpload(true);
    };

    const getCurrentDisplayImage = () => {
        if (selectedImage && !showUpload) return selectedImage;
        return null;
    };

    return (<>

        <div className="px-20 h-full">
            <div className="mx-6   border-dashed cursor-pointer h-full">
                {getCurrentDisplayImage() ? (
                    <div className=" ">
                        <img
                            src={getCurrentDisplayImage()!}
                            alt="Selected"
                            className="w-full h-full object-contain rounded-lg"
                        />
                        {/* {selectedImage && (
                            <div className="text-center ">
                                <Button
                                    type="primary"
                                    className="!mt-4"
                                    danger
                                    shape="circle"
                                    icon={<DeleteOutlined />}
                                    onClick={handleDeleteImage}
                                />
                            </div>
                        )} */}
                    </div>
                ) : showUpload ? (
                    <Upload.Dragger
                        name="image"
                        listType="picture"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleUploadChange}
                        accept="image/*"
                        className="w-full h-[400px] !border-dashed !border-gray-300"
                        style={{ height: '100%' }}
                    >
                        <div className="flex flex-col items-center justify-center w-full h-[400px]">
                            <span className="text-lg text-gray-500">Upload Image</span>
                            <span className="text-sm text-gray-400 mt-2">
                                Click or drag and drop files here
                            </span>
                        </div>
                    </Upload.Dragger>
                ) : (
                    <span className="text-lg text-gray-500">เลือกรูปภาพ</span>
                )}
            </div>
        </div>

        <div className="flex justify-end mt-4">
            <Button  type="default" className="w-40 !me-auto !bg-red-500 !text-white hover:!border-red-500" 
            onClick={handleDeleteImage}>Delete</Button>
            <Button  disabled={!idUploadPlan} className="w-40 !me-4" type="primary" onClick={()=>handleSave(idUploadPlan)}>Save</Button>
            <Button className="w-40" type="default" onClick={handleCancel}>Cancel</Button>
        </div>
    </>
    );
};

export default Content;