import {
    Button,
    Table,
} from "antd";
import { useEffect } from "react";
import { CheckCircleFilled } from '@ant-design/icons';
import ProgressStep from "../../components/village/ProgressStep";
import "../../styles/SetupProject.css";
import type { ColumnsType } from "antd/es/table";
import { UnitPreviewType } from "../../../../stores/interfaces/SetupProject";
// import { unitPreviewData } from "./dummyData/Unit";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SetupSuccessModal from "../../components/ModalSuccessUnit";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../../stores";
import { uploadFilePlan, uploadFileSentApiHome } from "../../service/api/SetupProject";
import FailedModal from "../../../../components/common/FailedModal";
import SuccessModal from "../../../../components/common/SuccessModal";



// Custom Success Modal Component
const UploadPlan = () => {

    const dispatch = useDispatch<Dispatch>();
    const { excelData,uploadedImage,uploadedFileName,imageFileObject } = useSelector((state: RootState) => state.setupProject);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const navigate = useNavigate();
    

    useEffect(()=>{
        if(!imageFileObject || excelData.village?.length === 0){
            navigate('/setup-project/upload-unit')
        }
        
    },[])
    
    const handleFinishSetup = async () => {
        try {
            if (!uploadedImage) {
                return;
            }
            // Upload file
            let idPlan = ''
            let formData = new FormData();
            formData.append("imgFile", imageFileObject as any);
            const dataPlan = await uploadFilePlan(formData);
            if (dataPlan.status) {
                idPlan = dataPlan.result.id
            } else {
                FailedModal('Upload plan failed',1500)
                return 
            }

            if(idPlan){
                let objUnit = excelData?.village?.map((item: any) => ({
                    address: item["Address"],
                    unitNo: item["Unit no."],
                    houseType: item["House type"],
                    numberOfFloor: item["Number of floor"],
                    size: item["Size (sq.m.)"]
                }))
                let objSetupHome = {
                    planId: idPlan,
                    unit: objUnit || []
                }
                const dataPlan = await uploadFileSentApiHome(objSetupHome);
                if(dataPlan.status){
                    // อัพเดท step ใน store หลังจาก setup สำเร็จ
                    SuccessModal('Setup plan success',1500,async ()=>{
                        await dispatch.setupProject.getStepCondoModel(null);
                        setIsSuccessModalOpen(true)
                        navigate('/dashboard/profile')
                    })
                }
                else{
                    FailedModal('Setup plan failed',1500)
                }
            }

        } catch (error) {
            console.error('Error in handleFinishSetup:', error);
        }
    };

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
    };

    const columns: ColumnsType<any> = [
        {
            title: "No.",
            dataIndex: "No",
            align: "center",
            render: (_, record) => (
                <div className="text-lg font-light text-[#002C55]">
                    {record.No}
                </div>
            )
        },
        {
            title: "Address",
            dataIndex: "Address",
            align: "center",
            render: (_, record) => (
                <div className="text-lg font-light text-[#002C55]">
                    {record.Address}
                </div>
            )
        },
        {
            title: "Unit no.",
            dataIndex: "Unit no.",
            align: "center",
            render: (_, record) => (
                <div className="text-lg font-light text-[#002C55]">
                    {record.UnitNo}
                </div>
            )

        },
        {
            title: "House type",
            dataIndex: "House type",
            align: "center",
            render: (_, record) => (
                <div className="text-lg font-light text-[#002C55]">
                    {record.HomeType}
                </div>
            )
        },

    ];

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col relative ">
            {/* Progress Steps */}
            <ProgressStep stepValue={2} progressSteps={3} />
            {/* Title */}
            <div className="text-center  ">
                <h1 className="text-2xl font-semibold text-[#002C55]">Property unit preview</h1>
                <div className="text-lg font-semibold text-[#002C55]">
                    Here you can preview and review the unit names before completing the setup.
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-start items-center p-4 mt-10">
                {/* Outer Card */}
                <div className="max-w-screen-xl bg-white rounded-2xl shadow-lg border-2 border-gray-200  p-4" style={{ width: '100%', maxWidth: '1200px', maxHeight: 'calc(100vh - 250px)' }}>
                    {/* Inner Card */}
                    <div className="bg-white rounded-xl border border-gray-300 overflow-hidden h-full">
                        <div className="bg-white p-4 text-lg font-semibold text-[#002C55] border-b border-gray-300">
                            Total no. of unit: {excelData?.village?.length || 0}
                        </div>
                        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                            <Table
                                columns={columns}
                                dataSource={excelData?.village?.map((item: any, index: number) => ({
                                    key: index,
                                    No: item.No,
                                    Address: item.Address,
                                    UnitNo: item["Unit no."],
                                    HomeType: item["House type"]
                                })) || []}
                                loading={false}
                                className="custom-table-no-radius"
                                pagination={false}
                            />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center p-6 bg-white">
                            <Button
                                onClick={() => navigate("/setup-project/upload-unit")}
                                size="large"
                                className="px-8 py-2 rounded-lg border-gray-300 w-[150px]"
                            >
                                Back
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                className="px-8 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 w-[150px]"
                                onClick={handleFinishSetup}
                            >
                                Finish setup
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <SetupSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessModalClose}
            />
        </div>
    );
};

export default UploadPlan;



