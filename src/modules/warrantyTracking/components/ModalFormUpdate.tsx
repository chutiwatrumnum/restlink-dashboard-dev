import { useState, useEffect , useMemo } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import CreateModal from "../../../components/common/FormModal";
import dayjs from 'dayjs';
import {
  Row,
  Col,
  DatePicker,
  Input,
  Button,
  Form,
  Upload,
  InputNumber
} from "antd";
import IconImagePhoto from "../../../assets/images/IconImagePhoto.png";
import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import SuccessModal from "../../../components/common/SuccessModal";
import { createWarrantyTracking ,updateWarrantyById } from "../service/api/WarrantyTracking";
import FailedModal from "../../../components/common/FailedModal";
interface ModalFormUpdateProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedWarranty?: (WarrantyDetailsType & {
    owner?: string;
    address?: string;
    startDate?: string;
    notifyDateBeforeExpiration?: number | string;
  }) | null;
  onChangeSelectedWarranty?: (
    warranty: (WarrantyDetailsType & { owner?: string; address?: string })
  ) => void;
  loadFirst: (overrideSearch?: any) => Promise<void>;
}

export const ModalFormUpdate: React.FC<ModalFormUpdateProps> = ({ 
  isOpen, 
  onClose,
  selectedWarranty,
  onChangeSelectedWarranty,
  loadFirst,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);
  const [imageUrl, setImageUrl] = useState<string>();
  const [fileUpload, setFileUpload] = useState<File>();
  const [form] = Form.useForm();
  
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (selectedWarranty) {
      const formValues = {
        ...selectedWarranty,
        purchaseDate: selectedWarranty.purchaseDate ? dayjs(selectedWarranty.purchaseDate) : null,
        expireDate: selectedWarranty.expireDate ? dayjs(selectedWarranty.expireDate) : null,
        startDate: selectedWarranty.startDate ? dayjs(selectedWarranty.startDate) : null,
        notifyDateBeforeExpiration: selectedWarranty.notifyDateBeforeExpiration ?? undefined,
      };
      form.setFieldsValue(formValues);
      setImageUrl(selectedWarranty.image);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [selectedWarranty, form]);

  const isEditMode = useMemo(() => {
    if (!selectedWarranty) return false;
    return Boolean(
      selectedWarranty.serialNumber ||
      selectedWarranty.warrantyName ||
      selectedWarranty.purchaseDate ||
      selectedWarranty.expireDate ||
      selectedWarranty.image
    );
  }, [selectedWarranty]);


  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setFileUpload(undefined)
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

  const handleUploadChange = (info: any) => {
    const file = info?.file?.originFileObj as File | undefined;
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setFileUpload(file)
      form.setFieldsValue({ image: file });
    }
  };

  const handleSave = async () => {
    form.validateFields().then(async () => {
      let message = isEditMode ? "Warranty updated successfully" : "Warranty added successfully";

      const warrantyName = form.getFieldValue('warrantyName');
      const serialNumber = form.getFieldValue('serialNumber');
      const startDate = form.getFieldValue('startDate').format("YYYY-MM-DD");
      const purchaseDate = form.getFieldValue('purchaseDate').format("YYYY-MM-DD");
      const expireDate = form.getFieldValue('expireDate').format("YYYY-MM-DD");
      const notifyDateBeforeExpiration = form.getFieldValue('notifyDateBeforeExpiration');
      const image = form.getFieldValue('image');

       let formData = new FormData();
       if (selectedWarranty?.user?.sub && !isEditMode) formData.append('sub', String(selectedWarranty.user.sub));
       if (selectedWarranty?.unit?.id && !isEditMode) formData.append('unitId', String(selectedWarranty.unit.id));
       if (selectedWarranty?.projectId && !isEditMode) formData.append('projectId', String(selectedWarranty.projectId));
       if (warrantyName) formData.append('name', String(warrantyName));
       

       
       if (serialNumber) formData.append('serialNumber', String(serialNumber));
       if (startDate) formData.append('startDate', String(startDate));
       if (purchaseDate) formData.append('purchaseDate', String(purchaseDate));
       if (expireDate) formData.append('expireDate', String(expireDate));
       if (notifyDateBeforeExpiration) formData.append('notifyDateBeforeExpiration', String(notifyDateBeforeExpiration));
       if (fileUpload) formData.append('image', fileUpload);
       if (selectedWarranty?.user?.sub) formData.append('user', String(selectedWarranty.user.sub));
       




      if(isEditMode && selectedWarranty?.id){
        let updateWarranty = await updateWarrantyById(selectedWarranty.id, formData);
        if(updateWarranty.status){
          setImageUrl(undefined);
          setIsModalOpen(false);
          onClose?.();
          SuccessModal(message);
          loadFirst();
        }else{
          FailedModal("Failed to update warranty tracking");
        }
        return 
      }
       let createWarranty = await createWarrantyTracking(formData);
       if(createWarranty.status){
        setImageUrl(undefined);
        setIsModalOpen(false);
        onClose?.();
        SuccessModal(message);
        loadFirst();
       }else{
        FailedModal("Failed to create warranty tracking");
       }
      return 


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
      <Form 
        form={form} 
        layout="vertical"
        onValuesChange={(_, allValues) => {
          const updated = {
            ...(selectedWarranty ?? {}),
            ...allValues,
            purchaseDate: allValues?.purchaseDate
              ? dayjs(allValues.purchaseDate).format("YYYY-MM-DD")
              : undefined,
            expireDate: allValues?.expireDate
              ? dayjs(allValues.expireDate).format("YYYY-MM-DD")
              : undefined,
            image: imageUrl,
          } as WarrantyDetailsType & { owner?: string; address?: string };
          onChangeSelectedWarranty && onChangeSelectedWarranty(updated);
        }}
      >

        
        <div className="mb-4">
          <div className="text-gray-500 ">Owner : {selectedWarranty?.owner}</div>
          <div className="text-gray-500">Address : {selectedWarranty?.address}</div>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Warranty Name" name="warrantyName" 
            rules={[{ required: true, message: "Please input warranty name" }] }>
              <Input placeholder="Please Input Title" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Serial Number" name="serialNumber" 
            rules={[{ required: true, message: "Please input serial number" }] }>
              <Input placeholder="Please Input Title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Purchase Date" name="purchaseDate" 
            rules={[{ required: true, message: "Please select purchase date" }] }>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Please Input Title"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Start Date" name="startDate" 
            rules={[{ required: true, message: "Please select start date" }] }>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Please Input Title"
              />
            </Form.Item>
          </Col>
 
 
        </Row>
 
        <Row gutter={16}>
          <Col span={12}>
              <Form.Item label="Expire Date" name="expireDate" rules={[{ required: true, message: "Please select expire date" }] }>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Please Input Title"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item label="Notify Date Before Expiration" name="notifyDateBeforeExpiration" 
            rules={[{ required: true, message: "Please input notify date before expiration" }] }>
              <InputNumber placeholder="Please Input Title"  style={{ width: "100%" }} />
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
                accept=".jpg,.jpeg,.png"
                onChange={handleUploadChange}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon flex justify-center items-center">
                  <img src={IconImagePhoto} alt="upload"  />
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
      title={isEditMode ? "Edit Warranty" : "Add Warranty"}
      content={formAddWarranty()}
      onOk={handleSave}
      isOpen={isModalOpen}
      onCancel={handleCancel}
    />
  );
};

 ;
