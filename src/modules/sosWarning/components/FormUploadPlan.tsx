import { Input, Button, Form, Upload, message, Select, Spin } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useState } from "react";
import { dataSelectPlan, createPlan, createPlanCondo , } from "../../../stores/interfaces/SosWarning";
import { uploadPlan, createVillage, createCondo } from "../service/api/SOSwarning";
import FailedModal from "../../../components/common/FailedModal";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";``

interface FormUploadPlanProps {
  imageBase64: string | null;
  setImageBase64: (img: string | null) => void;
  isUploading: boolean;
  handleNextVillage: (projectName: string) => void;
  handleNextCondo: (condoType: string, floor: number, numberOfBuilding: number, projectName: string) => void;
  dataSelectPlan : dataSelectPlan,
  setPlanType: (planType: string) => void;
  planType: string;
  onUploadStart?: () => void;
  onProgressUpdate?: (progressPercent: number) => void;
  dataMapAll: dataAllMap;
  loadFirst: () => void;
}

export const FormUploadPlan = ({
  imageBase64,
  setImageBase64,
  isUploading,
  handleNextVillage,
  handleNextCondo,
  dataSelectPlan,
  setPlanType,
  planType,
  onUploadStart,
  onProgressUpdate,
  dataMapAll,
  loadFirst
}: FormUploadPlanProps) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  
  const [condoType, setCondoType] = useState<string>("");
  const [floor, setFloor] = useState<number | null>(null);
  const [numberOfBuilding, setNumberOfBuilding] = useState<number | null>(null);
  const [planId, setPlanId] = useState<string>("");
  

  const [form] = Form.useForm();





  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("File size must not exceed 1MB!");
      return Upload.LIST_IGNORE;
    }
    
    return true; // อนุญาตให้ upload ผ่าน customRequest
  };

  const handleNext = {
    'Village': async () => {
      try {
        await form.validateFields();
        
        // เริ่มแสดง progress เมื่อกด Next
        if (onUploadStart) {
          onUploadStart();
        }
        
        const dataCreatePlan: createPlan = {
          projectName: projectName,
          planTypeID: 70,
          planID: planId
        }
        
        // simulate progress ระหว่างการสร้าง village
        const simulateProgress = () => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (onProgressUpdate) {
              onProgressUpdate(progress);
            }
            if (progress >= 90) {
              clearInterval(interval);
            }
          }, 200);
          return interval;
        };
        
        const progressInterval = simulateProgress();
        
        let data = await createVillage(dataCreatePlan);
        
        // clear interval และตั้ง progress เป็น 100%
        clearInterval(progressInterval);
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
        if(data?.status){
          if(data?.message) {
            FailedModal(data?.message,1000);
            // return;
          }
          handleNextVillage(projectName);
        }else{
          handleNextVillage(projectName);
          FailedModal(data?.message);
        }
      } catch (e) {
        // รีเซ็ต progress เมื่อเกิด error
        if (onProgressUpdate) {
          onProgressUpdate(0);
        }
        // error handled by antd
      }
    },
    'Condo': async () => {
      try {        
        await form.validateFields();
        let planTypeId = dataSelectPlan.planTypeCondo.find((item: any) => item.nameEn === condoType)?.id;
        const dataCreatePlanCondo: createPlanCondo = {
          projectName: projectName,
          planTypeID: 71,
          condoTypeID: Number(planTypeId),
          floor: Number(floor),
          numberOfBuilding: Number(numberOfBuilding)
        }
        let data = await createCondo(dataCreatePlanCondo);
        if(data?.status){
          await loadFirst();
          handleNextCondo(condoType, floor!, numberOfBuilding!,projectName);
        }else{
          FailedModal("Failed to create condo diagram");
        }
        handleNextCondo(condoType, floor!, numberOfBuilding!,projectName);
      } catch (e) {
        // error handled by antd
      }
    }
  }  
    
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'floor' | 'numberOfBuilding') => {
    const value = e.target.value;
    
    // ป้องกันค่าติดลบและค่าที่ไม่ใช่ตัวเลข
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      let numValue = value === '' ? null : Number(value);
      
      if (type === 'floor') {
        // ตรวจสอบและบังคับค่าตาม condo type
        let maxFloor = 0;
        if (condoType === 'Low-rise') {
          maxFloor = 20;
        } else if (condoType === 'High-rise') {
          maxFloor = 40;
        }
        
        // บังคับค่าให้ไม่เกินขีดจำกัด
        if (numValue !== null && maxFloor > 0 && numValue > maxFloor) {
          numValue = maxFloor;
          // อัปเดตค่าใน form field เพื่อแสดงค่าที่ถูกบังคับ
          form.setFieldsValue({ floor: maxFloor });
        }
        
        setFloor(numValue);
      } else if (type === 'numberOfBuilding') {
        setNumberOfBuilding(numValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ป้องกันการพิมพ์เครื่องหมายติดลบ, จุด, และเครื่องหมาย e/E
    if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };


  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // แปลงไฟล์เป็น base64 ทันทีเพื่อแสดงรูป preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageBase64(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // upload ไฟล์
      let data = await uploadPlan(file);
      
      if (data.status) {
        setPlanId(data.result.id);
        message.success(`${file.name} uploaded successfully`);
        onSuccess && onSuccess(data);
      } else {
        message.error(`${file.name} upload failed`);
        setImageBase64(null);
        onError && onError(new Error('Upload failed'));
      }
    } catch (error) {
      message.error(`${file.name} upload failed`);
      setImageBase64(null);
      onError && onError(error);
    }
  };


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
    // <Form layout="vertical" className="pt-2 pb-0 px-0" form={form}>
    //   <Form.Item
    //     label={
    //       <span className="font-semibold text-[#002B45]">Project name</span>
    //     }
    //     name="planName"
    //     rules={[{ required: true, message: "Please enter project name!" }]}
    //   >
    //     <Input placeholder="Project name" size="large" onChange={(e) => setProjectName(e.target.value)} />
    //   </Form.Item>

    //   <Form.Item
    //     label={<span className="font-semibold text-[#002B45]">Plan type</span>}
    //     name="planType"
    //     rules={[{ required: true, message: "Please select plan type!" }]}
    //   >
    //     <Select
    //       showSearch
    //       filterOption={(input, option) =>
    //         (option?.children as unknown as string)
    //           ?.toLowerCase()
    //           ?.includes(input.toLowerCase()) ?? false
    //       }
    //       placeholder="Search or select plan type"
    //       size="large"
    //       onChange={(value) => setPlanType(value)}
    //     >
    //       { dataSelectPlan.planType.map((item: any) => (
    //         <Select.Option value={item.nameEn}>{item.nameEn}</Select.Option>
    //       ))}
    //       {/* <Select.Option value="Village">Village</Select.Option>
    //       <Select.Option value="Condo">Condo</Select.Option> */}
    //     </Select>
    //   </Form.Item>

    //   {planType === "Village" && (
    //     <Form.Item
    //       label={<span className="font-semibold text-[#002B45]">Image</span>}
    //       name="image"
    //       rules={[{ required: true, message: "Please upload image!" }]}
    //       extra={
    //         <div className="flex justify-between items-center mt-2">
    //           <span className="text-gray-400">
    //             File size 5MB, 16:9 Ratio, *JPG
    //           </span>
    //           {imageBase64 && (
    //             <Button
    //               danger
    //               className="w-25"
    //               type="default"
    //               size="small"
    //               onClick={() => {
    //                 setImageBase64(null);
    //                 setFileList([]);
    //               }}
    //             >
    //               Remove Image
    //             </Button>
    //           )}
    //         </div>
    //       }
    //     >
    //       <div>
            
    //           <Upload.Dragger
    //             name="file"
    //             multiple={false}
    //             accept="image/*"
    //             fileList={fileList}
    //             showUploadList={false}
    //             beforeUpload={beforeUpload}
    //             customRequest={customRequest}
    //             className="h-[300px] rounded-xl border-[#D9D9D9] bg-[#f5f5f5]"
    //           >

    //           {imageBase64 ? (
    //             <div className="relative w-full h-full flex items-center justify-center">
    //               <img
    //                 src={imageBase64}
    //                 alt="Preview"
    //                 className="w-full h-full object-contain rounded-xl max-h-[280px]"
    //               />
    //               <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
    //                 Upload Complete
    //               </div>
    //             </div>
    //           ) : (
    //             <div className="flex flex-col items-center justify-center h-full my-15">
    //               <InboxOutlined className="text-[40px] text-[#B0B0B0]" />
    //               <div className="mt-2 text-[#B0B0B0] text-sm">
    //                 Upload your photo
    //               </div>
    //               <div className="text-[#B0B0B0] text-xs">
    //                 *File size &lt;1MB, 16:9 Ratio, *.JPGs
    //               </div>
    //             </div>
    //           )}


    //           </Upload.Dragger>
            
    //       </div>
    //     </Form.Item>
    //   )}
    //   {
    //   planType === "Condo" && 
    //   <>
    //     <Form.Item
    //       label={<span className="font-semibold text-[#002B45]">Condo Type</span>}
    //       name="condoType"
    //       rules={[{ required: true, message: "Please select plan type!" }]}
    //     >
    //       <Select
    //         showSearch
    //         filterOption={(input, option) =>
    //           (option?.children as unknown as string)
    //             ?.toLowerCase()
    //             ?.includes(input.toLowerCase()) ?? false
    //         }
    //         placeholder="Search or select condo type"
    //         size="large"
    //         onChange={(value) => setCondoType(value)}
    //       >
    //         {dataSelectPlan.planTypeCondo.map((item: any) => (
    //           <Select.Option value={item.nameEn}>{item.nameEn}</Select.Option>
    //         ))}
    //       </Select>
    //     </Form.Item>


    //     <Form.Item
    //       label={<span className="font-semibold text-[#002B45]">Floor</span>}
    //       name="floor"
    //       rules={[{ required: true, message: "Please enter floor number!" }]}
    //       extra={
    //         condoType && (
    //           <span className="text-gray-400 text-xs">
    //             {condoType === 'Low-rise' ? 'Maximum 20 floors' : condoType === 'High-rise' ? 'Maximum 40 floors' : ''}
    //           </span>
    //         )
    //       }
    //     >
    //       <Input 
    //         type="number" 
    //         placeholder="Floor" 
    //         size="large" 
    //         min={0}
    //         max={condoType === 'Low-rise' ? 20 : condoType === 'High-rise' ? 40 : undefined}
    //         disabled={!condoType}
    //         onChange={(e) => handleNumberInputChange(e, 'floor')}
    //         onKeyDown={handleKeyDown}
    //       />
    //     </Form.Item>


    //     <Form.Item
    //       label={<span className="font-semibold text-[#002B45]">Number of Building</span>}
    //       name="numberOfBuilding"
    //       rules={[{ required: true, message: "Please enter number of building!" }]}
    //     >
    //       <Input 
    //         type="number" 
    //         placeholder="Number of Building" 
    //         size="large" 
    //         min={0}
    //         disabled={!condoType}
    //         onChange={(e) => handleNumberInputChange(e, 'numberOfBuilding')}
    //         onKeyDown={handleKeyDown}
    //       />
    //     </Form.Item>

    //   </>
    //   }

    //   <div className={`flex ${planType === "Condo" ? "justify-end" : "justify-center"} mt-6`}>
    //     <Button
    //       type="primary"
    //       htmlType="button"
    //       size="large"
    //       className="rounded-lg px-10 w-40"
    //       onClick={handleNext[planType as keyof typeof handleNext]}
    //     >
    //       Next
    //     </Button>
    //   </div>
    // </Form>
    <></>
  );
};
