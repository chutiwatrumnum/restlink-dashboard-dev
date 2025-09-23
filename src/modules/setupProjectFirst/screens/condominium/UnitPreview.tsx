import { Row, Col, Table, Button } from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ProgressStep from "../../components/village/ProgressStep";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../../stores";
import "../../styles/SetupProject.css";
import { uploadFileSentApi } from "../../service/api/SetupProject";
import { UploadFileSentApiType, CondoUnit, Basement } from "../../../../stores/interfaces/SetupProject";
import SuccessModal from "../../../../components/common/SuccessModal";
import FailedModal from "../../../../components/common/FailedModal";
const UnitPreview = () => {
    const { excelData } = useSelector((state: RootState) => state.setupProject);
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch>();
    useEffect(() => {
        if (excelData?.Basement?.length === 0 && excelData?.Condo?.length === 0) {
            navigate('/setup-project/upload-number-building')
        }
    }, [])


    const [dataFloorCondo, setDataFloorCondo] = useState<any[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatLowercase = (str: string) => {
        return str.toLowerCase();
    }

    const sentPreviewApi = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            let data: UploadFileSentApiType = {
                condo: excelData.Condo.map((item: any): CondoUnit => (
                    {
                        buildingName: item[formatLowercase("Building name") ],
                        floor: item[formatLowercase("Floor")],
                        floorName: item[formatLowercase("Floor name")],
                        unitNo: item[formatLowercase("Unit no.")],
                        floorOfUnit: item[formatLowercase("Floor of unit")],
                        address: item[formatLowercase("Address")],
                        roomType: item[formatLowercase("Room type")],
                        size: item[formatLowercase("Size (sq.m.)")]
                    })),
                basement: excelData.Basement.map((item: any): Basement => ({
                    buildingName: item[formatLowercase("Building name")],
                    basementFloor: item[formatLowercase("Basement floor")],
                    basementName: item[formatLowercase("Basement name")]
                }))
            }

            let response = await uploadFileSentApi(data)
            if (response.status) {
                SuccessModal(
                    'Upload file sent successfully',
                    1500,
                    () => {
                        dispatch.setupProject.setDataSetupUnit(response.result);
                        navigate('/setup-project/upload-floor-plan')
                    }
                )

            }
            else {
                FailedModal('Upload file sent failed', 1500)
            }
        } finally {
            setIsSubmitting(false);
        }

    }

    // Mock data สำหรับตารางยูนิต
    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            align: 'center',
            className: '!font-medium',
            render: (_: any, __: any, index: number) =>
                <div className="text-center font-normal">{index + 1}</div>
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            align: 'center',
            className: '!font-medium',
            render: (text: string) =>
                <div className="text-center font-normal">{text}</div>
        },
        {
            title: 'Floor',
            dataIndex: 'floor',
            key: 'floor',
            align: 'center',
            className: '!font-medium',
            render: (text: string) =>
                <div className="text-center font-normal">{text}</div>
        },
        {
            title: 'Unit no.',
            dataIndex: 'unit',
            key: 'unit',
            align: 'center',
            className: '!font-medium',
            render: (text: string) =>
                <div className="text-center font-normal">{text}</div>
        },
        {
            title: 'Size (sq.m.)',
            dataIndex: 'sizeSQM',
            key: 'sizeSQM',
            align: 'center',
            className: '!font-medium',
            render: (text: string) =>
                <div className="text-center font-normal">{text}</div>
        },
    ] as TableProps<any>['columns'];

    // ใช้ useMemo เพื่อดึง Building name จาก excelData.Basement และกรองค่าซ้ำ
    const uniqueBuildings = useMemo(() => {
        // ตรวจสอบว่ามี excelData และเป็น object หรือไม่
        if (!excelData || typeof excelData !== 'object') {
            return [];
        }
        // ตรวจสอบว่ามี Basement property และเป็น array หรือไม่
        if (!(excelData as any).Basement || !Array.isArray((excelData as any).Basement)) {
            return [];
        }
        const basementData = (excelData as any).Basement;
        // ดึง Building name จาก Basement data และกรองค่าซ้ำ
        const buildingNames = basementData
            .map((item: any) => {
                // ลองหาค่า Building name จากหลาย field ที่เป็นไปได้
                return item[formatLowercase("Building name")] ||
                    item.buildingName ||
                    item.building ||
                    item[formatLowercase("Building_name")] ||
                    item[formatLowercase("Building")];
            })
            .filter(Boolean) // กรองค่า null, undefined, empty string
            .filter((building: string, index: number, self: string[]) =>
                self.indexOf(building) === index // กรองค่าซ้ำ
            );

        // ถ้าไม่มีข้อมูลใน Basement ให้ใช้ mock data
        return buildingNames.length > 0 ? buildingNames : [];
    }, [excelData]);


    const setfloorCondo = (building: string) => {
        setSelectedBuilding(building);
        let condoData = (excelData as any).Condo;
        let fileterCondo = condoData.filter((item: any) => item[formatLowercase("Building name")] === building)
        let dataFloor = fileterCondo.map((item: any, index: number) => {
            let data = {
                no: index + 1,
                address: item[formatLowercase("Address")],
                floor: item[formatLowercase("Floor")],
                unit: item[formatLowercase("Unit no.")],
                sizeSQM: item[formatLowercase("Size (sq.m.)")]
            }
            return data
        })
        setDataFloorCondo(dataFloor)
    }

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 
        to-indigo-100 p-6 flex flex-col relative overflow-hidden ">
            <ProgressStep stepValue={1} progressSteps={3} />
            {/* ส่วนหัว */}
            <Row justify="center" className="text-center mb-8">
                <Col span={24}>
                    <div className="text-2xl text-[#002C55] font-medium">
                        Property unit preview
                    </div>
                    <div className="text-lg text-[#002C55] mt-2">
                        Here you can preview and review the unit.
                    </div>
                </Col>
            </Row>

            {/* ส่วนเนื้อหาหลัก */}
            <Row gutter={0} className="flex-1 min-h-0">
                {/* ส่วนแสดงรายการอาคาร */}
                <Col span={4} className="h-full min-h-0">
                    <div className="bg-white border-t border-b border-l border-gray-300 py-4 h-full rounded-tl-lg rounded-bl-lg flex flex-col overflow-hidden">
                        <div className="font-semibold mb-4 px-8 py-4">
                            Building ({uniqueBuildings.length})
                        </div>
                        <div className="space-y-2 flex-1 overflow-auto">
                            {uniqueBuildings.length > 0 ? (
                                uniqueBuildings.map((building: string, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() => setfloorCondo(building)}
                                        className={` px-8 py-3 hover:bg-blue-50 cursor-pointer rounded ${selectedBuilding === building ? 'bg-blue-100 ' : ''} `}
                                    >
                                        {building}
                                    </div>
                                ))
                            ) : (
                                <div className="px-8 py-3 text-gray-500 text-sm">
                                    No buildings found
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* ส่วนแสดงตารางข้อมูลยูนิต */}
                <Col span={20} className="h-full min-h-0">
                    <div className="bg-white border-1 border-gray-300 h-full rounded-tr-lg rounded-br-lg flex flex-col min-h-0 overflow-hidden">
                        <div className="flex justify-between items-center  px-6 py-4">
                            <div className="font-normal">Total no. of unit: {dataFloorCondo.length}</div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                            <Table
                                columns={columns}
                                dataSource={dataFloorCondo}
                                rowKey="unit"
                                pagination={false}
                                className="w-full unit-preview-table custom-table-no-radius"
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            {/* ส่วนปุ่มด้านล่าง */}
            <Row justify="space-between" className="mt-6">
                <Col>
                    <Button
                        className="px-8 py-2 rounded-full  w-[150px]"
                        onClick={() => navigate("/setup-project/upload-number-building")}
                    >
                        Back
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        onClick={() => sentPreviewApi()}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className={`px-8 py-2 bg-[#002C55] w-[150px] !text-white rounded-lg  ${isSubmitting ? '!opacity-50 !cursor-not-allowed' : ''}`}
                    >
                        Continue
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default UnitPreview;
