import { Row, Col, Button, Select, Upload, Tag, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { BaseSelectRef } from 'rc-select';
import ProgressStep from "../../components/village/ProgressStep";
import "../../styles/SetupProject.css";
import FormUploadPlan from "../../components/condo/FormUploadPlan";
import MapAddPlanFloor from "../../components/condo/MapAddPlanFloor";
import ConfirmModal from "../../../../components/common/ConfirmModal";
// import UploadBuildingImage from "../../../../assets/images/setupProject/UploadBuildingImage.png";
import PlanOnFloor from "../../components/condo/PlanOnFloor";
import SetupSuccessModal from "../../components/ModalSuccessUnit";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../../stores";
import { DataSetupUnitType } from "../../../../stores/interfaces/SetupProject";
import { uploadFilePlan, setupProjectCondoFinish, getProject } from "../../service/api/SetupProject";
import FailedModal from "../../../../components/common/FailedModal";
import SuccessModal from "../../../../components/common/SuccessModal";

// เพิ่ม interface สำหรับ floor plan data
interface FloorPlanData {
    floorName: string;
    id: string | number;
}

const { Dragger } = Upload;

const UploadFloorPlan = () => {

    // กำหนด type สำหรับ floorOptions
    interface FloorOption {
        value: string;
        label: string;
        disabled: boolean;
    }

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch>();
    const { dataSetupUnit } = useSelector((state: RootState) => state.setupProject);
    

    const [storeData, setStoreData] = useState<{
        fileList: File | null,
        fileName: string,
        selectedFloors: string[],
        imagePreview: string | null,
    }[]>([]);

    const [storeDataOriginal, setStoreDataOriginal] = useState<{
        fileList: File | null,
        fileName: string,
        selectedFloors: string[],
        imagePreview: string | null,
    }[]>([]);


    const [fileList, setFileList] = useState<File[]>([]);
    const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [statusAddPlanFloor, setStatusAddPlanFloor] = useState<boolean>(true);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [forceUpdateKey, setForceUpdateKey] = useState(0);
    // แก้ไข type definition และ naming
    const [storeFloorPlan, setStoreFloorPlan] = useState<FloorPlanData[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<string>('');
    const [countShow, setCountShow] = useState(0);



   const storeBuilding = useMemo(()=>{
    return [...(dataSetupUnit?.block || [])].map((item: any) => ({
        blockName: item.blockName,
        id: item.id,
    }));
   },[dataSetupUnit])

    const [floorOptions, setFloorOptions] = useState<FloorOption[]>([]);

    const handleFinishSetup = async () => {
        // Save ข้อมูลของตึกปัจจุบันก่อน
        if (selectedBuilding) {
            saveCurrentBuildingData(selectedBuilding);
        }
        // รวบรวมข้อมูลทั้งหมด
        const allBuildingsData = {
            currentBuilding: {
                id: selectedBuilding,
                data: {
                    storeData,
                    storeDataOriginal,
                    fileList,
                    selectedFloors
                }
            },
            allBuildings: Object.entries(buildingData).map(([buildingId, data]) => ({
                id: buildingId,
                data: {
                    storeData: data.storeData,
                    storeDataOriginal: data.storeDataOriginal,
                    fileList: data.fileList,
                    selectedFloors: data.selectedFloors
                }
            }))
        };
        const buildingLogs = Object.entries(buildingData).map(([buildingId, data]) => {
            const buildingInfo = dataSetupUnit?.block.find(b => b.id === Number(buildingId));
            return {
                label: `🏢 ${buildingInfo?.blockName || buildingId}:`,
                data: {
                    cards: data.storeData,
                    selectedFloors: data.selectedFloors,
                    files: data.fileList.map(f => f.name)
                }
            };
        });

        // ไม่ใช้ JSON.parse(JSON.stringify()) เพราะจะทำให้ File object หาย
        // ทำ deep copy แบบ manual เพื่อรักษา File object
        let buildingDataNewObject: { [key: string]: any } = {};
        Object.entries(buildingData).forEach(([buildingId, data]) => {
            buildingDataNewObject[buildingId] = {
                ...data,
                storeData: data.storeData.map((item: any) => ({ ...item })),
                storeDataOriginal: data.storeDataOriginal.map((item: any) => ({ ...item })),
                fileList: [...data.fileList]
            };
        });
        
        // แปลงข้อมูลให้มี buildingId ด้วย
        const cardStorData = Object.entries(buildingDataNewObject).map(([buildingId, data]: [string, any]) => {
            // ใช้ข้อมูล floor จาก dataSetupUnit โดยตรงแทนการใช้ storeFloorPlan
            // เพื่อให้ได้ข้อมูล floor ที่ถูกต้องสำหรับแต่ละตึก
            const floorsForThisBuilding = dataSetupUnit?.floor?.filter((floor: any) => 
                floor.blockId === Number(buildingId)
            ) || [];
            
            // สร้าง map ของ floorName และ id สำหรับตึกนี้
            const floorIdMap = floorsForThisBuilding.reduce((acc: { [key: string]: string | number }, floor: any) => {
                const formattedFloorName = floor.floorName.toUpperCase();
                acc[formattedFloorName] = floor.id;
                return acc;
            }, {});

            // แปลงข้อมูลของแต่ละ card พร้อมเพิ่ม floorIds
            const cardsWithIds = data.storeData.map((card: { 
                fileList: File | null,
                fileName: string,
                selectedFloors: string[],
                imagePreview: string | null 
            }) => {
                const selectedFloorNames = card.selectedFloors
                    .filter((floor: string) => floor !== 'all' && !floor.startsWith('pre_select_all:'))
                    .map((floor: string) => floor.toUpperCase());
                // หา id สำหรับแต่ละชั้นที่เลือกโดยใช้ floorIdMap ของตึกนี้
                const floorIds = selectedFloorNames.map((floorName: string) => {
                    const floorId = floorIdMap[floorName];
                    return floorId;
                }).filter((id: string | number | undefined): id is string | number => id !== undefined);
                return {
                    ...card,
                    floorIds
                };
            });

            return {
                buildingId: Number(buildingId),
                cards: cardsWithIds
            };
        });



        
        for (const building of cardStorData) {
            for (const card of building.cards) {
                let fileList = card.fileList;                
                if (!fileList || !(fileList instanceof File)) {
                    continue; // ข้าม card นี้ถ้าไม่มี file
                }
                
                let formData = new FormData();
                formData.append('imgFile', fileList as File);
                let result = await uploadFilePlan(formData);
                if(result.status){
                    card.fileSuccess = result.result.id
                }
            }
        }
        let objSetupFinish = cardStorData.map((item: any) => ({
            blockId: item.buildingId,
            plan: item.cards.map((card: any) => ({
                planId: card.fileSuccess,
                floorId: card.floorIds
            }))
        }))
        let objSetupFinishNew = {
            payload: objSetupFinish
        }
        let resultSetupFinish = await setupProjectCondoFinish(objSetupFinishNew);
        if(resultSetupFinish.status){
            // อัพเดท step ใน store หลังจาก setup สำเร็จ
            dispatch.setupProject.setClearData();
            await dispatch.setupProject.getStepCondoModel(null);
            // สร้าง promise สำหรับหน่วงเวลา 1200 มิลลิวินาที
            await SuccessModal("Setup Project Success",1200)
            navigate('/dashboard/profile')
            // SuccessModal(
            //     "Setup Project Success",
            //     1500,
            //     () => {
            //         navigate('/dashboard/profile')
            //     }
            // )
        }
        else{
            FailedModal("Setup Project Failed",1500)
        }

      



        setIsSuccessModalOpen(true);
    };

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
        // เพิ่มการนำทางไปหน้าอื่นหลังจากปิด modal ถ้าต้องการ
    };

    // เพิ่มฟังก์ชัน resetForm
    const resetForm = () => {
        // setFileList([]);
        setSelectedFloors([]);
        setImagePreview(null);
        setIsSelectOpen(false);
        // Reset input value ถ้ามี
        const input = document.getElementById('upload-floor-plan-input') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    // สร้างฟังก์ชันเพื่อรวมชั้นที่ถูกเลือกทั้งหมด
    const getAllSelectedFloors = useCallback(() => {        
        const allSelectedFloors = new Set<string>();
        
        // เพิ่มชั้นจาก storeData (cards ที่มีอยู่แล้ว)
        storeData.forEach((data, index) => {
            data.selectedFloors.forEach(floor => {
                if (floor !== 'all' && !isNaN(Number(floor)) && !floor.startsWith('pre_select_all:')) {
                    allSelectedFloors.add(floor);
                }
            });
        });
        
        // เพิ่มชั้นจาก selectedFloors (form ปัจจุบัน)
        selectedFloors.forEach(floor => {
            if (floor !== 'all' && !isNaN(Number(floor)) && !floor.startsWith('pre_select_all:')) {
                allSelectedFloors.add(floor);
            }
        });
        
        // เพิ่มชั้นที่ถูกใช้ไปแล้วจาก storeFloorPlan (ถ้ามี)
        storeFloorPlan.forEach(floor => {
            if (floor.floorName && !isNaN(Number(floor.floorName))) {
                allSelectedFloors.add(floor.floorName);
            }
        });
        
        const result = Array.from(allSelectedFloors);
        return result;
    }, [storeData, selectedFloors, storeFloorPlan]);
    // ใช้ useState กับ useEffect เพื่อให้ floorOptions อัพเดทอัตโนมัติ
    
    
    const setFloor = (idBuilding:string) => {
        const data: FloorPlanData[] = [...(dataSetupUnit?.floor || [])].filter((item: any) => item.blockId === idBuilding).map((item: any) => ({
            floorName: item.floorName,
            id: item.id,
        }));
        setStoreFloorPlan(data);
    }

    // เพิ่ม state สำหรับเก็บข้อมูลแยกตามตึก
    const [buildingData, setBuildingData] = useState<{
        [key: string]: {
            storeData: typeof storeData;
            storeDataOriginal: typeof storeDataOriginal;
            fileList: typeof fileList;
            selectedFloors: typeof selectedFloors;
            imagePreview: typeof imagePreview;
            statusAddPlanFloor: typeof statusAddPlanFloor;
        };
    }>({});

    // เพิ่ม function สำหรับ save ข้อมูลของตึกปัจจุบัน
    const saveCurrentBuildingData = (buildingId: string) => {
        if (!buildingId) return;
        
        setBuildingData(prev => ({
            ...prev,
            [buildingId]: {
                storeData,
                storeDataOriginal,
                fileList,
                selectedFloors,
                imagePreview,
                statusAddPlanFloor,
            }
        }));
    };

    // เพิ่ม function สำหรับ load ข้อมูลของตึกที่เลือก
    const loadBuildingData = (buildingId: string) => {
        const data = buildingData[buildingId];
        if (data) {
            setStoreData(data.storeData);
            setStoreDataOriginal(data.storeDataOriginal);
            setFileList(data.fileList);
            setSelectedFloors(data.selectedFloors);
            setImagePreview(data.imagePreview);
            setStatusAddPlanFloor(data.statusAddPlanFloor);
        } else {
            // ถ้ายังไม่มีข้อมูลของตึกนี้ ให้ initialize ค่าเริ่มต้น
            setStoreData([]);
            setStoreDataOriginal([]);
            setFileList([]);
            setSelectedFloors([]);
            setImagePreview(null);
            setStatusAddPlanFloor(true);
        }
        setIsSelectOpen(false);
        setForceUpdateKey(prev => prev + 1);
    };

    // เพิ่ม function สำหรับจัดการการเปลี่ยนตึก
    const handleBuildingChange = (buildingId: string) => {
        // Save ข้อมูลของตึกปัจจุบัน
        if (selectedBuilding) {
            saveCurrentBuildingData(selectedBuilding);
        }
        
        // Set ตึกใหม่
        setSelectedBuilding(buildingId);
        
        // Load ข้อมูลของตึกที่เลือก
        loadBuildingData(buildingId);
        
        // Set floor data สำหรับตึกใหม่
        setFloor(buildingId);
    };
    
    
    // ลบการประกาศ floorOptions ที่ซ้ำออก

    // สร้างตัวเลือกชั้น 1-100


    const handleRemoveFloor = (removedFloor: string, indexEdit: number|null = null) => {
        let newStoreData = [...storeData];
        let newSelectedFloors = [...selectedFloors];

        if(indexEdit !== null){
            // ถ้าลบ flag 'all' ให้คืนค่าเป็นชั้นที่เลือกไว้ก่อน Select All
            if (removedFloor === 'all') {
                // หา pre_select_all flag เพื่อคืนค่าชั้นที่เลือกไว้ก่อนหน้า
                const preSelectAllFlag = newStoreData[indexEdit].selectedFloors.find(floor => floor.startsWith('pre_select_all:'));
                if (preSelectAllFlag) {
                    const originalFloors = preSelectAllFlag.split(':')[1];
                    newStoreData[indexEdit].selectedFloors = originalFloors ? originalFloors.split(',').filter(f => f.trim() !== '') : [];
                } else {
                    newStoreData[indexEdit].selectedFloors = [];
                }
            } else {
                // ลบ floor ที่ระบุ
                newStoreData[indexEdit].selectedFloors = newStoreData[indexEdit].selectedFloors.filter(floor => floor !== removedFloor);
                // ถ้าลบ floor ปกติและยังมี flag 'all' อยู่ ให้ลบ flag 'all' ด้วย
                if (newStoreData[indexEdit].selectedFloors.includes('all')) {
                    newStoreData[indexEdit].selectedFloors = newStoreData[indexEdit].selectedFloors.filter(floor => floor !== 'all');
                }
            }
            setStoreData(newStoreData);
            // Force update floorOptions ทันที
            setForceUpdateKey(prev => prev + 1);
            setTimeout(() => {
                setForceUpdateKey(prev => prev + 1);
            }, 50);
        } else {
            // ถ้าลบ flag 'all' ให้คืนค่าเป็นชั้นที่เลือกไว้ก่อน Select All
            if (removedFloor === 'all') {
                // หา pre_select_all flag เพื่อคืนค่าชั้นที่เลือกไว้ก่อนหน้า
                const preSelectAllFlag = selectedFloors.find(floor => floor.startsWith('pre_select_all:'));
                if (preSelectAllFlag) {
                    const originalFloors = preSelectAllFlag.split(':')[1];
                    newSelectedFloors = originalFloors ? originalFloors.split(',').filter(f => f.trim() !== '') : [];
                } else {
                    newSelectedFloors = [];
                }
            } else {
                newSelectedFloors = selectedFloors.filter(floor => floor !== removedFloor);
                
                // ถ้าลบ floor ปกติและยังมี flag 'all' อยู่ ให้ลบ flag 'all' ด้วย
                if (newSelectedFloors.includes('all')) {
                    newSelectedFloors = newSelectedFloors.filter(floor => floor !== 'all');
                }
            }
            setSelectedFloors(newSelectedFloors);
            // Force update floorOptions ทันที
            setForceUpdateKey(prev => prev + 1);
            setTimeout(() => {
                setForceUpdateKey(prev => prev + 1);
            }, 50);
        }

        // floorOptions จะถูกอัพเดทอัตโนมัติผ่าน useMemo
    };

    // สำหรับจัดการการเลือกชั้น
    const handleFloorSelect = (value: string, indexEdit: number|null = null) => {
        
        let newStoreData = [...storeData];
        let newSelectedFloors = [...selectedFloors];
        
        if(indexEdit === null){
            if (!selectedFloors.includes(value)) {
                newSelectedFloors = [...selectedFloors, value];
                setSelectedFloors(newSelectedFloors);
            }
        } else {
            if (!newStoreData[indexEdit].selectedFloors.includes(value)) {
                newStoreData[indexEdit].selectedFloors = [...newStoreData[indexEdit].selectedFloors, value];
                setStoreData(newStoreData);
            }
        }

        // Force update floorOptions
        setForceUpdateKey(prev => prev + 1);
    };


    // เพิ่มฟังก์ชันลบ card
    const handleDeleteCard = (index: number) => {
        const newStoreData = [...storeData];
        const deletedCard = newStoreData[index];

        // Remove the card
        newStoreData.splice(index, 1);
        setStoreData(newStoreData);

        // Update original store data
        const newStoreDataOriginal = [...storeDataOriginal];
        newStoreDataOriginal.splice(index, 1);
        setStoreDataOriginal(newStoreDataOriginal);

        // Force update floor options to make deleted floors available again
        setForceUpdateKey(prev => prev + 1);
        setTimeout(() => {
            setForceUpdateKey(prev => prev + 1);
        }, 50);
    };

    const handleDeleteCardConfirm = (index: number) => {
        ConfirmModal({
            title: "Are you sure you want to delete this plan?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: () => handleDeleteCard(index),
            onCancel: () => {},
          });
          
    };



    // อัพเดท floorOptions เมื่อข้อมูลเปลี่ยนแปลง - ใช้ข้อมูลจาก dataSetupUnit
    useEffect(() => {
        // ถ้ายังไม่ได้เลือกตึก ไม่ต้องสร้าง floorOptions
        if (!selectedBuilding) {
            setFloorOptions([]);
            return;
        }

        if (dataSetupUnit?.floor && dataSetupUnit.floor.length > 0) {
            // ใช้ข้อมูลจาก dataSetupUnit แทนการสร้าง 100 ชั้น
            const filteredFloors = dataSetupUnit.floor.filter((floor: any) => floor.blockId === Number(selectedBuilding));
            
            const options: FloorOption[] = filteredFloors.map((floor: any) => {
                const allUsedFloors = getAllSelectedFloors();
                const isDisabled = allUsedFloors.includes(floor.floorName);
                
                return {
                    value: floor.floorName,
                    label: `Floor ${floor.floorName}`,
                    disabled: isDisabled
                };
            });
        
            setFloorOptions(options);
        } else {
            // fallback: ถ้าไม่มีข้อมูลจาก dataSetupUnit ให้ใช้ array ว่าง
            setFloorOptions([]);
        }
    }, [storeData, selectedFloors, getAllSelectedFloors, forceUpdateKey, dataSetupUnit, selectedBuilding]);


    // Debug useEffect
    useEffect(() => {
    }, [selectedFloors]);

    useEffect(() => {
    }, [selectedBuilding]);

    



    // Save ข้อมูลอัตโนมัติเมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (selectedBuilding) {
            saveCurrentBuildingData(selectedBuilding);
        }
    }, [storeData, storeDataOriginal, fileList, selectedFloors, imagePreview, statusAddPlanFloor]);

    useEffect(()=>{
        if(dataSetupUnit.floor.length === 0 || dataSetupUnit.block.length === 0){
            navigate('/setup-project/unit-preview-condo')
        }
    },[])


    return (
        <div className="bg-gradient-to-br from-blue-50 
        to-indigo-100 p-6 pb-0 flex flex-col 
        relative font-sarabun min-h-screen overflow-hidden ">



            <ProgressStep stepValue={2} progressSteps={3} />
            {/* ส่วนหัว */}

            <Row justify="center" className="text-center mb-8">
                <Col span={24}>
                    <div className="text-2xl text-[#002C55] font-medium">
                        Upload floor plan
                    </div>
                    <div className="text-lg text-[#002C55] mt-2">
                        Please upload your floor plan here.
                    </div>
                </Col>
            </Row>

            {/* ส่วนเนื้อหาหลัก */}
            <Row gutter={0} className="flex-1">
                {/* ส่วนแสดงรายการอาคาร */}
                <Col span={4}>
                    <div className="bg-white border-t border-b border-l border-gray-300 py-4 h-full rounded-tl-lg rounded-bl-lg">
                        <div className="font-semibold mb-4 px-8 py-4">Building</div>


                        <div className="space-y-2">
                            {storeBuilding.map((building:any,index:number) => (
                                <div
                                    onClick={()=>{
                                        handleBuildingChange(building.id)
                                    }}
                                    key={index}
                                    className={`px-8 py-3 hover:bg-blue-50 cursor-pointer rounded 
                                        ${selectedBuilding === building.id ? 'bg-blue-50' : ''}`}
                                >
                                    {building.blockName}
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>

                {/* ส่วนแสดง Upload Floor Plan */}
                <Col span={20}>
                    <div className=" bg-white border-1 border-gray-300 h-full rounded-tr-lg rounded-br-lg p-8">
                        <Row gutter={30}>
                            <Col span={8}>
                                {/* แสดงข้อความเมื่อยังไม่ได้เลือกตึก */}
                                {!selectedBuilding && (
                                    <div className="text-start text-gray-500">
                                        <div className="text-lg mb-2">Please select a building first</div>
                                        <div className="text-sm">กรุณาเลือกตึกจากรายการด้านซ้ายก่อน</div>
                                    </div>
                                )}
                                
                                {statusAddPlanFloor && selectedBuilding !== '' && (
                                    <FormUploadPlan
                                        floorOptions={floorOptions}
                                        fileList={fileList}
                                        setFileList={setFileList}
                                        selectedFloors={selectedFloors}
                                        setSelectedFloors={setSelectedFloors}
                                        handleRemoveFloor={handleRemoveFloor}
                                        handleFloorSelect={handleFloorSelect}
                                        storeData={storeData}
                                        setStoreData={setStoreData}
                                        setStatusAddPlanFloor={setStatusAddPlanFloor}
                                        storeDataOriginal={storeDataOriginal}
                                        setStoreDataOriginal={setStoreDataOriginal}
                                        storeDataAll={storeData}
                                        indexEdit={null}
                                        statusEdit={false}
                                    />
                                )}
                                {!statusAddPlanFloor && (
                                    <MapAddPlanFloor 
                                        setStatusAddPlanFloor={setStatusAddPlanFloor}
                                        resetForm={resetForm}
                                    />
                                )}
                            </Col>

                            {
                                storeData.map((item, index) => (
                                        <Col span={8} >
                                            <div className={`w-full h-full ${index > 1 ? '!mt-4' : ''}`} key={index}>
                                                <PlanOnFloor 
                                                    storeData={item} 
                                                    onDelete={() => handleDeleteCardConfirm(index)}
                                                    floorOptions={floorOptions}
                                                    fileList={fileList}
                                                    setFileList={setFileList}
                                                    selectedFloors={selectedFloors}
                                                    setSelectedFloors={setSelectedFloors}
                                                    handleRemoveFloor={handleRemoveFloor}
                                                    handleFloorSelect={handleFloorSelect}
                                                    setStoreData={setStoreData}
                                                    indexEdit={index}
                                                    setStatusAddPlanFloor={setStatusAddPlanFloor}
                                                    storeDataAll={storeData}
                                                    storeDataOriginal={storeDataOriginal}
                                                    setStoreDataOriginal={setStoreDataOriginal}
                                                />
                                            </div>
                                        </Col>
                                ))
                            }
                        </Row>
                    </div>
                </Col>
            </Row>

            {/* ส่วนปุ่มด้านล่าง */}
            <Row justify="space-between" className="!py-6">
                <Col>
                    <Button
                        className="px-8 py-2 rounded-full w-[100px]"
                        onClick={() => navigate('/setup-project/unit-preview-condo')}
                    >
                        Back
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        onClick={handleFinishSetup}
                        className="px-8 py-2 bg-[#002C55] !text-white rounded-lg hover:bg-[#001F3D]"
                    >
                        Continue
                    </Button>
                </Col>
            </Row>

            {/* Success Modal */}
            <SetupSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessModalClose}
            />
        </div>
    );
};

export default UploadFloorPlan;
