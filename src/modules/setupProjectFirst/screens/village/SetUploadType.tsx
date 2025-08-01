import {  Row, Col } from "antd";
import CardDetailPlan from "../../components/village/CardDetailPlan";
import UploadImage from "../../components/village/UploadImage";
import ProgressStep from "../../components/village/ProgressStep";
import CardAddType from "../../components/village/CardAddType";
import "../../styles/SetupProject.css";
const UploadPlan = () => {


    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col relative font-sarabun">
            {/* Progress Steps */}
            <ProgressStep stepValue={1} />
            {/* Title */}
            <div className="text-center  ">
                <h1 className="text-2xl font-semibold text-gray-800">Set up house types</h1>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center">
                <Row gutter={25} className="mx-auto w-full max-w-screen-lg">
                    {/* Left Panel - Project Info */}
                    <Col xs={24} lg={12}>
                        <CardDetailPlan onBack={"/setup-project/upload-plan"} ></CardDetailPlan>
                    </Col>

                    {/* Right Panel - Upload Area */}
                    <Col xs={24} lg={12}>
                        <CardAddType onBack={"/setup-project/upload-unit"} ></CardAddType>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UploadPlan;
