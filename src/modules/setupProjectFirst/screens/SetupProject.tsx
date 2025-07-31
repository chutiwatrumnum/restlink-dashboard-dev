import { useState, useEffect } from "react";
import { Button, Row, Col ,  message,  } from "antd";
import bgStartProject from "../../../assets/images/setupProject/BG-SetupProjectRight.png";
import demoProject from "../../../assets/images/setupProject/DemoProgram.png";
import logoProject from "../../../assets/images/setupProject/LogoProject.png";
import { useNavigate } from "react-router-dom";
const SetupProject = () => {
  const navigate = useNavigate();
  return (
    <>
    <Row className="w-full h-screen relative" style={{ minHeight: "100vh" }}>
      <Col xs={24} md={12} >
      <div className="flex flex-col justify-center items-start h-full ps-[20%] ">
        <img src={logoProject} alt="logoProject" className=" mb-5" />
        <div className="text-3xl font-medium  text-[#002C55] mb-5"> Welcome to ONNEX</div>
        <div className="text-xl text-[#002C55]">Let’s set up your property so you can start</div>
        <div className="text-xl text-[#002C55] mb-20">managing everything easily.</div>
        <Button onClick={() => navigate("/setup-project/upload-plan")} type="primary" className="bg-[#002C55] text-white font-medium !rounded-xl !px-10 !py-5 !text-lg">Get Started</Button>
      </div>
      </Col>
      <Col xs={24} md={12} className="bg-blue-200 flex items-center justify-end h-full pr-0" style={{ backgroundImage: `url(${bgStartProject})`, backgroundSize: "cover", backgroundPosition: "center" }}>
         <img src={demoProject} alt="demoProject" className="w-[90%] h-full object-cover ml-auto" />
      </Col>
    </Row>
    </>
  );
};

export default SetupProject;
