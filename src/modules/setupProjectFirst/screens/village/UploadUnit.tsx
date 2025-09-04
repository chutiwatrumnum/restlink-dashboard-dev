import {  useEffect } from "react";
import {  Row, Col } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { useNavigate } from "react-router-dom";


import CardDetailUploadExcel from "../../components/village/CardDetailUploadUnit";
import UploadImage from "../../components/village/UploadImage";
import ProgressStep from "../../components/village/ProgressStep";
import "../../styles/SetupProject.css";
const UploadPlan = () => {
    const navigate = useNavigate();
    const { imageFileObject } = useSelector((state: RootState) => state.setupProject);
    // const { dataSetupUnit } = useSelector((state: RootState) => state.setupProject);

    useEffect(()=>{
        if(!imageFileObject){
            navigate('/setup-project/upload-plan')
        }
    },[])

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col relative ">
            {/* Progress Steps */}
            <ProgressStep stepValue={1} progressSteps={3} />
            {/* Title */}
            <div className="text-center  ">
                <h1 className="text-2xl font-semibold text-gray-800">Property unit preview</h1>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center">
                <Row gutter={25} className="mx-auto w-full max-w-screen-lg">
                    {/* Left Panel - Project Info */}
                    <Col xs={24} lg={12}>
                        <CardDetailUploadExcel onBack={"/setup-project/upload-plan"} ></CardDetailUploadExcel>
                    </Col>
                    {/* Right Panel - Upload Area */}
                    <Col xs={24} lg={12}>
                        <UploadImage onNext={"/setup-project/unit-preview"} status={'excel'}  ></UploadImage>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UploadPlan;
