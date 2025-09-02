import { useState } from "react";
import {  Row, Col } from "antd";
import CardDetailPlan from "../../components/condo/CardDetailPlan";
import UploadImage from "../../components/village/UploadImage";
import CardDetailUploadExcel from "../../components/village/CardDetailUploadUnit";
import ProgressStep from "../../components/village/ProgressStep";
import "../../styles/SetupProject.css";

import { useDispatch } from "react-redux";
const UploadNumberBuilding = () => {
    
    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col relative ">  
            <ProgressStep stepValue={0} progressSteps={3} />
            <div className="text-center  ">
                <div className="text-2xl font-semibold text-gray-800 mb-10">
                    Upload number of buildings, floors, and units
                </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-start items-center">
                <Row gutter={25} className=" mx-auto w-full">
                    <Col xs={24} lg={8}>
                        <CardDetailPlan onBack={"/setup-project/get-start"} ></CardDetailPlan>
                    </Col>
                    {/* Right Panel - Upload Area */}
                    <Col xs={24} lg={8}>
                        <CardDetailUploadExcel onBack={"/setup-project/get-start"} statusBackButton={false} ></CardDetailUploadExcel>
                    </Col>
                    {/* Right Panel - Upload Area */}
                    <Col xs={24} lg={8}>
                        <UploadImage  status={'excel'} onNext={"/setup-project/unit-preview-condo"} />
                    </Col>

                </Row>
            </div>
        </div>
    );
};

export default UploadNumberBuilding;
