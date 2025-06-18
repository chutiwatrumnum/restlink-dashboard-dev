import { Col, Button, Row } from "antd";
const FormWarningSOS = () => {
  return <>            
        {/* SOS & Device Issue */}
        <Row className="mb-2 mt-5 px-4" gutter={16}>
            {/* SOS */}
            <Col span={12}>
                <div className="bg-white rounded-tr-lg rounded-tl-lg rounded-br-lg  rounded-bl-lg border border-[#E0E0E0] border-r-0 overflow-hidden relative">
                    <div className="bg-[#E74C3C] text-white text-xs font-bold tracking-wide px-2 py-1 text-center" style={{borderTopLeftRadius:8}}>
                        SOS
                    </div>
                    <div className="flex items-center justify-center py-2 h-25">
                        <span className="text-3xl font-bold text-[#E74C3C]">0</span>
                    </div>
                </div>
            </Col>
            {/* Device has an issue */}
            <Col span={12}>
                <div className="bg-white rounded-tr-lg rounded-tl-lg rounded-br-lg  rounded-bl-lg border border-[#E0E0E0] overflow-hidden relative">
                    <div className="bg-[#FFE082] text-[#222] text-xs font-bold tracking-wide px-2 py-1 text-center" style={{borderTopRightRadius:8}}>
                        Device has an issue
                    </div>
                    <div className="flex items-center justify-center py-2 h-25">
                        <span className="text-3xl font-bold text-[#143A66]">1</span>
                    </div>
                    {/* ขอบล่างซ้ายสีเหลือง */}
                </div>
            </Col>
        </Row>
        {/* Incident Details */}
        <Row className="mb-2 mt-5 px-4" gutter={16}>
            <Col span={24}>
                <div className="bg-white rounded-lg shadow p-3 mb-4 border-l-4 border-[#E74C3C] px">
                    <div className="text-xs mb-1"><span className="font-bold">Incident:</span> Emergency alert - Intruder detected</div>
                    <div className="text-xs mb-1"><span className="font-bold">Reported by:</span> Natthaporn Rojrithana</div>
                    <div className="text-xs mb-1"><span className="font-bold">Address:</span> 303/203</div>
                    <div className="text-xs mb-1"><span className="font-bold">Emergency Contact Numbers:</span> 0991209268, 0998756230</div>
                    <div className="text-xs mb-2"><span className="font-bold">Reported Date:</span> 26/08/2024 09:10:00</div>
                    <Button type="primary" block className="rounded">Acknowledge</Button>
                </div>
            </Col>
        </Row>
   </>
  ;
};

export default FormWarningSOS;