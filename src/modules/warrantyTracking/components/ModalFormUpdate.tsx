import { useState, useEffect } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import CreateModal from "../../../components/common/FormModal";
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
import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import SuccessModal from "../../../components/common/SuccessModal";

interface ModalFormUpdateProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedWarranty?: WarrantyDetailsType | null;
}

export const ModalFormUpdate: React.FC<ModalFormUpdateProps> = ({ 
  isOpen, 
  onClose,
  selectedWarranty 
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
  const [imageUrl, setImageUrl] = useState<string>();
  const [form] = Form.useForm();

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (selectedWarranty) {
      const formValues = {
        ...selectedWarranty,
        purchaseDate: selectedWarranty.purchaseDate ? dayjs(selectedWarranty.purchaseDate) : null,
        expireDate: selectedWarranty.expireDate ? dayjs(selectedWarranty.expireDate) : null
      };
      form.setFieldsValue(formValues);
      setImageUrl(selectedWarranty.image);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [selectedWarranty, form]);

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };

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
    form.validateFields().then((values) => {
        form.resetFields();
        setImageUrl(undefined);
        setIsModalOpen(false);
        if (onClose) onClose();
        SuccessModal(selectedWarranty ? "แก้ไขการรับประกันสำเร็จ" : "เพิ่มการรับประกันสำเร็จ");
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(undefined);
    setIsModalOpen(false);
    if (onClose) onClose();
  }

  const formAddWarranty = () => {
    return (<>
      <Form form={form} layout="vertical">
        <div className="mb-4">
          <div className="text-gray-500 ">Owner : Jenna Kim</div>
          <div className="text-gray-500">Address : 100/1</div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Warranty Name" name="warrantyName">
              <Input placeholder="Please Input Title" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Serial Number" name="serialNumber">
              <Input placeholder="Please Input Title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Purchase Date" name="purchaseDate">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Please Input Title"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Expire Date" name="expireDate">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Please Input Title"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Image"
          name="image"
          rules={[{ required: true, message: "Please upload an image" }]}
        >
          <div>
            {!imageUrl ? (
              <Upload.Dragger
                accept="image/*"
                beforeUpload={handleImageUpload}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <PlusOutlined />
                </p>
                <p>Click to upload picture</p>
                <p style={{ color: "#888" }}>Upload your photo</p>
                <p style={{ color: "#888", fontSize: "12px" }}>
                  *File size 1MB, 16:9 Ratio, *.JPG
                </p>
              </Upload.Dragger>
            ) : (
              <div style={{ position: "relative" }}>
                <img
                  src={imageUrl}
                  alt="uploaded"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain"
                  }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveImage}
                  style={{ position: "absolute", top: 0, right: 0 }}
                  danger
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
      <div className="flex justify-end">
        <Button className="w-40" type="primary" onClick={handleSave}>Save</Button>
      </div>
      </>
    );
  };

  return (
    <CreateModal
      title={selectedWarranty ? "Edit Warranty" : "Add Warranty"}
      content={formAddWarranty()}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
    />
  );
};

 ;
