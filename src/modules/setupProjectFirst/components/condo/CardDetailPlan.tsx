import { useState, useEffect, useRef } from "react";
import { Button, Row, Col, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { useNavigate } from "react-router-dom";
import uploadBuildingImage from "../../../../assets/images/setupProject/UploadBuildingImage.png";
import defaultImage from "../../../../assets/images/setupProject/DefaultImage.jpg"

const CardDetailPlan = ({ onBack }: { onBack: string }) => {
    const navigate = useNavigate();
    const { projectData } = useSelector((state: RootState) => state.setupProject);
    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                <div className="h-full overflow-y-auto p-6">
                    <div className="w-full rounded-lg mb-4 ">
                        <img src={projectData?.projectImage || defaultImage} alt="demoUploadPlan" 
                        className="w-full h-full object-cover rounded-lg max-h-[250px] " />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-bold  text-lg">Project name</span>
                            <span className="text-gray-800 text-right text-lg">{projectData?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-bold  text-lg">Developer</span>
                            <span className="text-gray-800 text-right text-lg">{projectData?.developer?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-bold  text-lg">Contact no.</span>
                            <span className="text-gray-800 text-right text-lg">{projectData?.contactNo || '-'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 font-bold  text-lg">Location</span>
                            <a
                                href={projectData?.location || '-'}
                                target="_blank"
                                className="!text-[#0077FF] !text-lg !max-w-80 !break-all !text-right !underline line-clamp-2"
                                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                                {projectData?.location || '-'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-start mt-5">
                <Button
                    className="px-8 py-2 rounded-full  w-[100px]"
                    onClick={() => navigate(onBack)}
                >
                    Back
                </Button>
            </div>


        </>
    )
}

export default CardDetailPlan;