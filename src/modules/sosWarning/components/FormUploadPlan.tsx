import {  Spin } from "antd";

import { dataSelectPlan,  } from "../../../stores/interfaces/SosWarning";
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
  isUploading,
}: FormUploadPlanProps) => {



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
