import {  Row, Col } from "antd";
import { Button } from "antd";


import CardDetailPlan from "../../components/village/CardDetailPlan";
import UploadImage from "../../components/village/UploadImage";
import ProgressStep from "../../components/village/ProgressStep";
import "../../styles/SetupProject.css";
const UploadPlan = () => {

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col relative ">
            <ProgressStep stepValue={0} progressSteps={3} />
            <div className="text-center  ">
                <h1 className="text-2xl font-semibold text-gray-800">Upload property plan</h1>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center  ">
                <Row gutter={25} className=" mx-auto w-full max-w-screen-lg ">
                    <Col xs={24} lg={12}>
                        <CardDetailPlan onBack={"/setup-project/get-start"} ></CardDetailPlan>
                    </Col>

                    {/* Right Panel - Upload Area */}
                    <Col xs={24} lg={12}>
                        <UploadImage onNext={"/setup-project/upload-unit"} />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UploadPlan;
