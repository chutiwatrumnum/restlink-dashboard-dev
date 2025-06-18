import { Input, Button, Form, Upload, message, Select, Spin } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useState } from "react";

interface FormUploadPlanProps {
  imageBase64: string | null;
  setImageBase64: (img: string | null) => void;
  isUploading: boolean;
  handleNextVillage: () => void;
  handleNextCondo: (condoType: string, floor: number, numberOfBuilding: number) => void;
}

export const FormUploadPlan = ({
  imageBase64,
  setImageBase64,
  isUploading,
  handleNextVillage,
  handleNextCondo
}: FormUploadPlanProps) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [planType, setPlanType] = useState<string>("");
  const [condoType, setCondoType] = useState<string>("");
  const [floor, setFloor] = useState<number | null>(null);
  const [numberOfBuilding, setNumberOfBuilding] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [buildingData, setBuildingData] = useState<{
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [buildingPlan, setBuildingPlan] = useState<{
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  } | null>(null);

  const handleUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // อนุญาตแค่ไฟล์เดียว
    setFileList(newFileList);
    if (info.file.status === "done") {
      message.success(`${info.file.name} อัปโหลดสำเร็จ`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} อัปโหลดล้มเหลว`);
    }
    // แปลงไฟล์เป็น base64
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageBase64(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("คุณสามารถอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น!");
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("ขนาดไฟล์ต้องไม่เกิน 1MB!");
    }
    return isImage && isLt1M;
  };

  const handleNext = {
    'Village': async () => {
      console.log('Village');
      try {
        await form.validateFields();
        handleNextVillage();
      } catch (e) {
        // error handled by antd
      }
    },
    'Condo': async () => {
      console.log('Condo');
      try {
        await form.validateFields();
        handleNextCondo(condoType, floor!, numberOfBuilding!);
      } catch (e) {
        // error handled by antd
      }
    }
  }    

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Spin size="large" />
        <div className="mt-4 text-[#002B45] font-semibold">
          Uploading...
        </div>
      </div>
    );
  }

  return (
    <Form layout="vertical" className="pt-2 pb-0 px-0" form={form}>
      <Form.Item
        label={
          <span className="font-semibold text-[#002B45]">Project name</span>
        }
        name="planName"
        rules={[{ required: true, message: "Please enter project name!" }]}
      >
        <Input placeholder="Project name" size="large" />
      </Form.Item>

      <Form.Item
        label={<span className="font-semibold text-[#002B45]">Plan type</span>}
        name="planType"
        rules={[{ required: true, message: "Please select plan type!" }]}
      >
        <Select
          placeholder="Select type"
          size="large"
          onChange={(value) => setPlanType(value)}
        >
          <Select.Option value="Village">Village</Select.Option>
          <Select.Option value="Condo">Condo</Select.Option>
        </Select>
      </Form.Item>

      {planType === "Village" && (
        <Form.Item
          label={<span className="font-semibold text-[#002B45]">Image</span>}
          name="image"
          rules={[{ required: true, message: "Please upload image!" }]}
        >
          <div>
            {imageBase64 ? (
              <img
                src={imageBase64}
                alt="Preview"
                className="w-full h-full object-contain rounded-xl bg-[#f5f5f5] max-h-[300px]"
              />
            ) : (
              <Upload.Dragger
                name="file"
                multiple={false}
                accept="image/jpeg,image/png"
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={beforeUpload}
                customRequest={({ onSuccess }) => {
                  setTimeout(() => {
                    onSuccess && onSuccess("ok");
                  }, 1000);
                }}
                className="h-[300px] rounded-xl border-[#D9D9D9] bg-[#f5f5f5]"
              >
                <div className="flex flex-col items-center justify-center h-full my-15">
                  <InboxOutlined className="text-[40px] text-[#B0B0B0]" />
                  <div className="mt-2 text-[#B0B0B0] text-sm">
                    Upload your photo
                  </div>
                  <div className="text-[#B0B0B0] text-xs">
                    *File size &lt;1MB, 16:9 Ratio, *.JPGs
                  </div>
                </div>
              </Upload.Dragger>
            )}
            {imageBase64 && (
              <div className="flex justify-center mt-2">
                <Button
                  danger
                  type="default"
                  size="small"
                  onClick={() => {
                    setImageBase64(null);
                    setFileList([]);
                  }}
                >
                  ลบรูป
                </Button>
              </div>
            )}
          </div>
        </Form.Item>
      )}
      {
      planType === "Condo" && 
      <>
        <Form.Item
          label={<span className="font-semibold text-[#002B45]">Condo Type</span>}
          name="condoType"
          rules={[{ required: true, message: "Please select plan type!" }]}
        >
          <Select
            placeholder="Select type"
            size="large"
            onChange={(value) => setCondoType(value)}
          >
            <Select.Option value="Low-rise">Low-rise</Select.Option>
            <Select.Option value="High-rise">High-rise</Select.Option>
          </Select>
        </Form.Item>


        <Form.Item
          label={<span className="font-semibold text-[#002B45]">Floor</span>}
          name="floor"
          rules={[{ required: true, message: "Please select plan type!" }]}
        >
          <Input type="number" placeholder="Floor" size="large" onChange={(e) => setFloor(Number(e.target.value))} />
        </Form.Item>


        <Form.Item
          label={<span className="font-semibold text-[#002B45]">Number of Building</span>}
          name="numberOfBuilding"
          rules={[{ required: true, message: "Please select plan type!" }]}
        >
          <Input type="number" placeholder="Number of Building" size="large" onChange={(e) => setNumberOfBuilding(Number(e.target.value))} />
        </Form.Item>

      </>
      }

      <div className={`flex ${planType === "Condo" ? "justify-end" : "justify-center"} mt-6`}>
        <Button
          type="primary"
          htmlType="button"
          size="large"
          className="rounded-lg px-10 w-40"
          onClick={handleNext[planType as keyof typeof handleNext]}
        >
          Next
        </Button>
      </div>
    </Form>
  );
};
