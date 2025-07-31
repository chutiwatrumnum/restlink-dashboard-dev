import { useState, useEffect, useRef } from "react";
import { Button, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import ExcelImage from "../../../../assets/images/setupProject/ExcelImage.png";
import iconDownload from "../../../../assets/images/setupProject/IconDownload.png";
interface ProjectData {
    projectName: string;
    developer: string;
    projectManager: string;
    contactNo: string;
    location: string;
}
const CardDetailPlan = ({ onBack, statusBackButton = true }: { onBack: string, statusBackButton?: boolean }) => {
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState<ProjectData>({
        projectName: "The green trees village",
        developer: "Developer A",
        projectManager: "Sakawrut Meesaeng",
        contactNo: "0966758918",
        location: "https://www.google.com/maps/place/Sample+Office/@13.7563,100.5018,17z"
    });
    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                <div className="h-full overflow-y-auto p-6 flex flex-col justify-center items-center">
                    <div className="w-full  bg-blue-100 rounded-lg mb-4 flex items-center justify-center flex-shrink-0">
                        <img src={ExcelImage} alt="demoUploadPlan" className="w-full h-full object-cover rounded-lg" />
                    </div>

                    <div className="mt-5">
                        <div className="!flex !flex-col !justify-start !items-start text-lg font-normal text-[#002C55] mb-5">
                            
                            <div className="indent-8">In this step, you can quickly name each unit in your village by using our Excel template.</div>
                        </div>
                        <div className="text-lg font-normal text-[#002C55]">
                            <div className="indent-8">Download the file, enter the house information, and then upload it here to create all units at once.</div>
                            
                        </div>
                     
                    </div>

                    <div className="mt-auto flex items-center justify-between w-full">
                        <span className="text-lg font-medium text-[#002C55]">
                        File template:
                        </span>
                        <a 
                            href="/excel/condo/Templete-upload-plan-condo.xlsx" 
                            download="Templete-upload-plan-condo.xlsx"
                            className="text-lg font-medium text-[#002C55] flex items-center cursor-pointer hover:opacity-80"
                        >          
                            <img src={iconDownload} alt="iconDownload" className="w-[25px] h-[25px] mr-2" />
                            <span className="text-[#4995FF]">Download</span> 
                        </a>
                    </div>
                </div>
            </div>
            {statusBackButton && (
                <div className="flex justify-start mt-5">
                    <Button
                        size="large"
                    className="px-8 py-2 rounded-full  w-[150px]"
                    onClick={() => navigate('/setup-project/upload-plan')}
                >
                    Back
                </Button>
            </div>
            )}

        </>
    )
}

export default CardDetailPlan;