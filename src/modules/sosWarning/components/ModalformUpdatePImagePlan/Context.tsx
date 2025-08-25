import { Form, Input, Row, Col, Tooltip } from "antd";
import { DatePicker } from "antd";
import { Button } from "antd";
import { Upload } from "antd";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useGlobal } from "../../contexts/Global";
import type { UploadFile } from 'antd/es/upload/interface';
import Map1 from "../../../../assets/images/plan/Map1.png";
import Map2 from "../../../../assets/images/plan/Map2.jpg";
import Map3 from "../../../../assets/images/plan/Map3.jpg";
import Map4 from "../../../../assets/images/plan/Map4.jpg";
import Map5 from "../../../../assets/images/plan/Map5.png";
import Map6 from "../../../../assets/images/plan/Map6.png";
import Map7 from "../../../../assets/images/plan/Map7.jpg";

const Content = ({
    handleSave,
    handleCancel,
    isModalOpen
}: {
    handleSave: () => void;
    handleCancel: () => void;
    isModalOpen: boolean;
}) => {
    const { dataAllMap } = useGlobal();

    const [form] = Form.useForm();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    // useEffect เพื่อตั้งค่ารูปภาพเริ่มต้นจาก dataAllMap?.planImg
    useEffect(() => {
        if (dataAllMap?.planImg) {
            setSelectedImage(dataAllMap.planImg);
            setShowUpload(false);
        } else {
            setShowUpload(true);
        }
    }, [dataAllMap?.planImg]);

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
            // Clear uploaded image เมื่อเปิด popup ใหม่
            setUploadedImage(null);
        }
    }, [isModalOpen, dataAllMap?.planImg]);

    // Helper function to format floor range
    const formatFloorRange = (floors: string[]) => {
        if (floors.length <= 3) {
            return floors.join(', ');
        }
        return `${floors[0]}-${floors[floors.length - 1]} (${floors.length} ชั้น)`;
    };

    // Helper function to create tooltip content
    const createFloorTooltip = (floors: string[]) => {
        const chunks = [];
        for (let i = 0; i < floors.length; i += 10) {
            chunks.push(floors.slice(i, i + 10));
        }
        return (
            <div className="max-w-xs">
                <div className="font-medium mb-2">ชั้นทั้งหมด ({floors.length} ชั้น):</div>
                {chunks.map((chunk, index) => (
                    <div key={index} className="text-xs mb-1">
                        {chunk.join(', ')}
                    </div>
                ))}
            </div>
        );
    };

    const predefinedImages = [Map1, Map2, Map3, Map4, Map5, Map6, Map7];
    const storeImage = [
        {
            image: Map1,
            building: 'A-23',
            floors: ['A1', 'A2']
        },
        {
            image: Map2,
            building: 'A-23',
            floors: ['A2', 'A3']
        },
        {
            image: Map3,
            building: 'A-23',
            floors: ['A3']
        },
        {
            image: Map4,
            building: 'A-23',
            floors: ['A4', 'A5']
        },
        {
            image: Map5,
            building: 'B-22',
            floors: ['B1']
        },
        {
            image: Map6,
            building: 'B-22',
            floors: ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
                'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26',
                'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B39', 'B40',
                'B41', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48', 'B49', 'B50', 'B51', 'B52', 'B53', 'B54',
                'B55', 'B56', 'B57', 'B58', 'B59', 'B60', 'B61', 'B62', 'B63', 'B64', 'B65', 'B66', 'B67', 'B68',
                'B69', 'B70', 'B71', 'B72', 'B73', 'B74', 'B75', 'B76', 'B77', 'B78', 'B79', 'B80', 'B81', 'B82',
                'B83', 'B84', 'B85', 'B86', 'B87', 'B88', 'B89', 'B90', 'B91', 'B92', 'B93', 'B94', 'B95', 'B96',
                'B97', 'B98', 'B99', 'B100']
        },

    ]
    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setShowUpload(false);
    };

    const handleEmptyDivClick = () => {
        if (uploadedImage) {
            setSelectedImage(uploadedImage);
            setShowUpload(false);
        } else {
            setShowUpload(true);
        }
    };

    const handleUploadChange = (info: any) => {
        const file = info.file.originFileObj || info.file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setUploadedImage(imageUrl);
                setSelectedImage(imageUrl);
                setShowUpload(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setSelectedImage(null);
        setUploadedImage(null);
        setShowUpload(true);
    };

    const getCurrentDisplayImage = () => {
        if (selectedImage && !showUpload) return selectedImage;
        return null;
    };

    return (<>

            <div className="px-20">
                <div className="mx-6   border-dashed cursor-pointer h-100">
                    {getCurrentDisplayImage() ? (
                        <div className=" w-full h-full">
                            <img
                                src={getCurrentDisplayImage()!}
                                alt="Selected"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            {selectedImage && (
                                <div className="text-center">
                                    <Button
                                        type="primary"
                                        danger
                                        shape="circle"
                                        icon={<DeleteOutlined />}
                                        onClick={handleDeleteImage}
                                    />
                                </div>
                            )}
                        </div>
                    ) : showUpload ? (
                        <Upload.Dragger
                            name="image"
                            listType="picture"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                            accept="image/*"
                            className="w-full h-full !border-dashed !border-gray-300"
                            style={{ height: '100%' }}
                        >
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <span className="text-lg text-gray-500">Upload Image</span>
                                <span className="text-sm text-gray-400 mt-2">คลิกหรือลากไฟล์มาวางที่นี่</span>
                            </div>
                        </Upload.Dragger>
                    ) : (
                        <span className="text-lg text-gray-500">เลือกรูปภาพ</span>
                    )}
                </div>




            </div>

        <div className="flex justify-end mt-4">
            <Button className="w-40 !me-4" type="primary" onClick={handleSave}>Save</Button>
            <Button className="w-40" type="default" onClick={handleCancel}>Cancel</Button>
        </div>
    </>
    );
};

export default Content;