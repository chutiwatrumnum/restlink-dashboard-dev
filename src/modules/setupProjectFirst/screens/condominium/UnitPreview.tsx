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
        console.log(excelData,'excelData')
        if (excelData.Basement.length === 0 && excelData.Condo.length === 0) {
            navigate('/setup-project/upload-number-building')
        }
    }, [])


    const [dataFloorCondo, setDataFloorCondo] = useState<any[]>([]);


    const sentPreviewApi = async () => {
        let data: UploadFileSentApiType = {
            condo: excelData.Condo.map((item: any): CondoUnit => (
                {
                    buildingName: item["Building name"],
                    floor: item["Floor"],
                    floorName: item["Floor name"],
                    unitNo: item["Unit no."],
                    floorOfUnit: item["Floor of unit"],
                    address: item["Address"],
                    roomType: item["Room type"],
                    size: item["Size (sq.m.)"]
                })),
            basement: excelData.Basement.map((item: any): Basement => ({
                buildingName: item["Building name"],
                basementFloor: item["Basement Floor"],
                basementName: item["Basement name"]
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

    }

    // Mock data สำหรับตารางยูนิต
    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
            align: 'center',
            className: '!font-medium',
            render: (text: string) =>
                <div className="text-center font-normal">{text}</div>
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
                return item['Building name'] ||
                    item.buildingName ||
                    item.building ||
                    item['Building_name'] ||
                    item.Building;
            })
            .filter(Boolean) // กรองค่า null, undefined, empty string
            .filter((building: string, index: number, self: string[]) =>
                self.indexOf(building) === index // กรองค่าซ้ำ
            );

        // ถ้าไม่มีข้อมูลใน Basement ให้ใช้ mock data
        return buildingNames.length > 0 ? buildingNames : [];
    }, [excelData]);


    const setfloorCondo = (building: string) => {
        let condoData = (excelData as any).Condo;
        let fileterCondo = condoData.filter((item: any) => item['Building name'] === building)
        let dataFloor = fileterCondo.map((item: any, index: number) => {
            let data = {
                no: index + 1,
                address: item['Address'],
                floor: item['Floor'],
                unit: item['Unit no.'],
                sizeSQM: item['Size (sq.m.)']
            }
            return data
        })
        setDataFloorCondo(dataFloor)
    }

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 
        to-indigo-100 p-6 flex flex-col relative  min-h-screen overflow-hidden ">
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
            <Row gutter={0} className="flex-1">
                {/* ส่วนแสดงรายการอาคาร */}
                <Col span={4}>
                    <div className="bg-white border-t border-b border-l border-gray-300 py-4 h-full rounded-tl-lg rounded-bl-lg">
                        <div className="font-semibold mb-4 px-8 py-4">
                            Building ({uniqueBuildings.length})
                        </div>
                        <div className="space-y-2">
                            {uniqueBuildings.length > 0 ? (
                                uniqueBuildings.map((building: string, index: number) => (
                                    <div
                                        onClick={() => setfloorCondo(building)}
                                        key={index}
                                        className=" px-8 py-3 hover:bg-blue-50 cursor-pointer rounded "
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
                <Col span={20}>
                    <div className="bg-white border-1 border-gray-300 h-full rounded-tr-lg rounded-br-lg">
                        <div className="flex justify-between items-center  px-6 py-4">
                            <div className="font-normal">Total no. of unit: {dataFloorCondo.length}</div>
                        </div>
                                                <div className="overflow-auto" style={{ maxHeight: 400 }}>
                            <Table
                                columns={columns}
                                dataSource={dataFloorCondo}
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
                        className="px-8 py-2 rounded-full  w-[100px]"
                        onClick={() => navigate("/setup-project/upload-number-building")}
                    >
                        Back
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        onClick={() => sentPreviewApi()}
                        className="px-8 py-2 bg-[#002C55] !text-white rounded-lg hover:bg-[#001F3D]"
                    >
                        Continue
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default UnitPreview;
