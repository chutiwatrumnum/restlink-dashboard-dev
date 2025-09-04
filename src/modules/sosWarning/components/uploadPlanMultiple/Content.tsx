import { Form, Row, Col, Select, Tag, Upload, message } from "antd";
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
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [idUploadPlan, setIdUploadPlan] = useState<string>('');

  // ใช้ try-catch เพื่อจัดการ error
  let buildingPlan: any = null;

  try {
    const globalContext = useGlobal();
    buildingPlan = globalContext.buildingPlan;
  } catch (error) {
    console.error('useGlobal error:', error);
  }




  const handleFloorChange = (value: number[]) => {
    // ห้ามเลือกอย่างอื่นขณะอยู่โหมด Select all จนกว่าจะลบแท็ก
    if (isAllSelected && value && !value.includes(-1)) {
      return;
    }

    // ถ้ามีค่า -1 แปลว่าเลือก Select all → เซ็ตเป็นโหมดทั้งหมดและแท็กเดียว
    if (value && value.includes(-1)) {
      const allIds = (floorData || []).map((f: any) => f.floorId);
      setIsAllSelected(true);
      setSelectedFloors(allIds);
      // แสดงแท็กเดียวด้วยการใส่ค่าใน form เป็น [-1]
      form.setFieldsValue({ floors: [-1] });
      return;
    }

    setIsAllSelected(false);
    setSelectedFloors(value);
    form.setFieldsValue({ floors: value });
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
      let file = info?.fileList[0] || null
      if(file){
        let dataUploadPlan = await uploadPlan(info.file)
        if(dataUploadPlan.status){
          setIdUploadPlan(dataUploadPlan.result.id)
        }
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
    if(Object.keys(buildingPlan?.buildings).length === 0) return []
    if (buildingPlan?.buildings) return buildingPlan?.buildings || []

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


        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Number of building"
              name="building"
              rules={[{ required: true, message: 'Please select building' }]}
            >
              <Select
                placeholder="Please select building"
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  setSelectedBuilding(value);
                  // Clear selected floors เมื่อเลือก building ใหม่
                  setIsAllSelected(false);
                  setSelectedFloors([]);
                  form.setFieldsValue({ floors: [] });
                }}
              >
                {(buildingData  || []).map((option: any, index: number) => (
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
                value={isAllSelected ? [-1] : selectedFloors}
                showSearch
                optionFilterProp="label"
                tagRender={(props) => {
                  const { closable, onClose } = props;
                  if (isAllSelected) {
                    return (
                      <Tag
                        color="blue"
                        closable={true}
                        onClose={() => {
                          setIsAllSelected(false);
                          setSelectedFloors([]);
                          form.setFieldsValue({ floors: [] });
                        }}
                        style={{ marginRight: 3 }}
                      >
                        Select all
                      </Tag>
                    );
                  }
                  return (
                    <Tag
                      color="blue"
                      closable={closable}
                      onClose={onClose}
                      style={{ marginRight: 3 }}
                    >
                      {props.label}
                    </Tag>
                  );
                }}
                dropdownRender={(menu) => (
                  <div>
                    <div className="px-3 py-2 cursor-pointer hover:bg-gray-50" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                      const allIds = (floorData || []).map((f: any) => f.floorId);
                      setIsAllSelected(true);
                      setSelectedFloors(allIds);
                      form.setFieldsValue({ floors: [-1] });
                    }}>
                      Select all
                    </div>
                    {menu}
                  </div>
                )}
              >
                {
                  floorData.map((item: any) => (
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
                    Supports image files (JPG, PNG, GIF) or PDF upload<br />
                    File size must not exceed 10MB
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