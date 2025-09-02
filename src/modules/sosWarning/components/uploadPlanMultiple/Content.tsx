import { Form, Input, Row, Col, Tooltip, Select, Tag, Upload, message } from "antd";
import { Button } from "antd";
import { InboxOutlined, CloseOutlined } from '@ant-design/icons';
import { useState, useMemo } from "react";
import { useGlobal } from "../../contexts/Global";
const { Dragger } = Upload;
const { Option } = Select;
import { uploadPlan } from "../../service/api/SOSwarning";

const Content = ({
  handleSave,
  handleCancel
}: {
  handleSave: (idUploadPlan:string,blockId:number,floorId:number[]) => void;
  handleCancel: () => void;
}) => {
  const [form] = Form.useForm();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [idUploadPlan, setIdUploadPlan] = useState<string>('');

  // ใช้ try-catch เพื่อจัดการ error
  let buildingPlan: any = null;
  let setBuildingPlan: any = null;

  try {
    const globalContext = useGlobal();
    buildingPlan = globalContext.buildingPlan;
    setBuildingPlan = globalContext.setBuildingPlan;
  } catch (error) {
    console.error('useGlobal error:', error);
  }


  // ตัวอย่างข้อมูล floor
  const floorOptions = [
    { value: 'floor1', label: 'Floor 1' },
    { value: 'floor2', label: 'Floor 2' },
    { value: 'floor3', label: 'Floor 3' },
    { value: 'floor4', label: 'Floor 4' },
  ];

  const handleFloorChange = (value: number[]) => {
    setSelectedFloors(value);
  };

  const removeFloor = (removedFloor: number) => {
    const newFloors = selectedFloors.filter(floor => floor !== removedFloor);
    setSelectedFloors(newFloors);
    form.setFieldsValue({ floors: newFloors });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: 'image/*,.pdf', // รองรับทั้งรูปภาพและ PDF
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        message.error('คุณสามารถอัปโหลดเฉพาะไฟล์รูปภาพหรือ PDF เท่านั้น!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('ไฟล์ต้องมีขนาดไม่เกิน 10MB!');
        return false;
      }

      // สร้าง preview URL สำหรับรูปภาพ
      if (isImage) {
        const url = URL.createObjectURL(file);
        file.url = url;
      }

      return false; // ป้องกันการ upload อัตโนมัติ
    },
    onChange: async (info: any) => {
      console.log(info,'info-upload-plan')
      
      let file = info?.fileList[0] || null
      if(file){
        let dataUploadPlan = await uploadPlan(info.file)
        console.log(dataUploadPlan,'dataUploadPlan-upload-plan')
        if(dataUploadPlan.status){
          setIdUploadPlan(dataUploadPlan.result.id)
        }
        // let formData = new FormData()
        // formData.append('file', info.fileList[0])
        // console.log(formData,'formData')
        setFileList(info.fileList);
      }
    },
    onDrop(e: any) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove: (file: any) => {
      // ลบ URL ที่สร้างขึ้นเพื่อป้องกัน memory leak
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    },
  };


  const buildingData = useMemo(() => {
    if (buildingPlan?.buildings) return buildingPlan.buildings
    return [];
  }, [buildingPlan]);

  const floorData = useMemo(() => {
    if (buildingPlan?.buildings[selectedBuilding]?.floors)
      return buildingPlan.buildings[selectedBuilding].floors
    return [];
  }, [buildingPlan, selectedBuilding]);

  const resetForm = () => {
    form.resetFields();
    setSelectedBuilding('');
    setSelectedFloors([]);
    setFileList([]);
    handleCancel();
  }


  return (
    <>

      <Form form={form} layout="vertical">
        
        {/* <Button onClick={() => {
          // console.log(selectedBuilding,'selectedBuilding')
          console.log(buildingPlan,'buildingPlan')
        }}>
          click
        </Button>  */}
       

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Number of building"
              name="building"
              rules={[{ required: true, message: 'กรุณาเลือก building' }]}
            >
              <Select
                placeholder="เลือก building"
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  setSelectedBuilding(value);
                  // Clear selected floors เมื่อเลือก building ใหม่
                  setSelectedFloors([]);
                  form.setFieldsValue({ floors: [] });
                }}
              >
                {(buildingData || []).map((option: any, index: number) => (
                  <Option key={index} value={index}>
                    {option.blockName}
                  </Option>
                ))}
              </Select>

            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Floor"
              name="floors"
              rules={[{ required: true, message: 'Please select floor(s)' }]}
            >
              <Select
                disabled={!selectedBuilding.toString()}
                mode="multiple"
                placeholder="Please select floor(s)"
                style={{ width: '100%' }}
                onChange={handleFloorChange}
                value={selectedFloors}
                showSearch
                optionFilterProp="label"
                tagRender={(props) => {
                  const { label, closable, onClose } = props;
                  return (
                    <Tag
                      color="blue"
                      closable={closable}
                      onClose={onClose}
                      style={{ marginRight: 3 }}
                    >
                      {label}
                    </Tag>
                  );
                }}
              >
                {
                  floorData.map((item: any, index: number) => (
                    <Option key={item.floorId} value={item.floorId}>
                      {item.floorName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>


            <div style={{ color: '#666', fontSize: '12px', marginBottom: 16 }}>
              Please select the floors you want to upload plans for. The system will automatically create a document folder for each floor.
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Plan"
              name="file"
              rules={[{ required: true, message: 'กรุณาอัปโหลดไฟล์' }]}
            >
              {fileList.length === 0 ? (
                // แสดง form upload เมื่อยังไม่มีไฟล์
                <Dragger {...uploadProps} style={{ padding: '20px' }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: '16px', marginBottom: 8 }}>
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#666', fontSize: '14px' }}>
                    รองรับการอัปโหลดไฟล์รูปภาพ (JPG, PNG, GIF) หรือ PDF<br />
                    ขนาดไฟล์ไม่เกิน 10MB
                  </p>
                </Dragger>
              ) : (
                // แสดงรูปภาพแทน form upload
                <div>
                  {fileList.map((file, index) => {
                    const isImage = file.type?.startsWith('image/');
                    const isPDF = file.type === 'application/pdf';

                    return (
                      <div
                        key={index}
                        className="relative inline-block w-full"
                      >
                        {/* แสดงรูปภาพขนาดที่เหมาะสม */}
                        {isImage && file.url && (
                          <div className="w-full max-w-[400px] mx-auto">
                            {/* กรอบรูปภาพ */}
                            <div className="w-full h-[250px] border-2 border-dashed border-[#d9d9d9] rounded-lg overflow-hidden relative bg-[#fafafa]">
                              <div className="p-4 flex justify-center items-center h-full">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-scale-down block max-h-[150px] max-w-[400px]"
                                />
                              </div>

                              {/* ปุ่มลบที่มุมขวาบน */}
                              <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => {
                                  if (file.url) {
                                    URL.revokeObjectURL(file.url);
                                  }
                                  const newFileList = fileList.filter((_, i) => i !== index);
                                  setFileList(newFileList);
                                  form.setFieldsValue({ file: undefined });
                                }}
                                className="!absolute !top-2 !right-2 !bg-black/50 !text-white !border-none"
                                title="ลบไฟล์"
                              />
                            </div>
                            {/* แสดงชื่อไฟล์ด้านล่างกรอบ */}
                            <div className="mt-2 px-2 py-1 text-sm text-[#666] text-start">
                              File : {file.name}
                            </div>
                          </div>
                        )}

                        {/* แสดง PDF */}
                        {isPDF && (
                          <div className="w-full min-h-[200px] border-2 border-dashed border-[#d9d9d9] rounded-lg bg-[#fafafa] flex flex-col items-center justify-center relative p-5">
                            <div className="w-20 h-20 bg-[#ff4d4f] rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                              PDF
                            </div>
                            <div className="text-base font-medium text-center">
                              {file.name}
                            </div>
                            <div className="text-xs text-[#666] mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            {/* ปุ่มลบที่มุมขวาบน */}
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => {
                                const newFileList = fileList.filter((_, i) => i !== index);
                                setFileList(newFileList);
                                form.setFieldsValue({ file: undefined });
                              }}
                              className="!absolute !top-2 !right-2 !bg-black/50 !text-white !border-none"
                              title="ลบไฟล์"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="flex justify-end mt-4">
        <Button className="w-40 !me-4" type="primary" onClick={() => handleSave(idUploadPlan,buildingPlan?.buildings[selectedBuilding].blockId,selectedFloors)}>
          Upload
        </Button>
        <Button className="w-40" type="default" onClick={resetForm}>
          Cancel
        </Button>
      </div>
    </>
  );
};

export default Content;