import { Button, Row, Col } from "antd";
import bgStartProject from "../../../assets/images/setupProject/BG-SetupProjectRight.png";
import demoProject from "../../../assets/images/setupProject/DemoProgram.png";
import { useNavigate } from "react-router-dom";
import { useDispatch,useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { getProject } from "../service/api/SetupProject";
import SigninLogo from "../../../assets/images/SignInLogo.png";
import { useState } from "react";
const SetupProject = () => {
  const navigate = useNavigate();
  const { projectData } = useSelector((state: RootState) => state.setupProject);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setTypeRedirect = async ()=>{

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let response:any = {}
      if(Object.keys(projectData).length === 0){
        response = await getProject() 
        if(response.status){
          await dispatch.setupProject.setProjectData(response || {});
        }
      }
      let projectType = projectData?.projectType?.nameCode || response?.projectType?.nameCode || '';
      const strType = projectType.split('_');
      projectType = strType[strType.length - 1];
      if(projectType === 'village'){
        navigate("/setup-project/upload-plan")
      }
      else if(projectType === 'condo'){
        navigate("/setup-project/upload-floor-plan")
      }
      
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
    <Row className="w-full h-screen relative" style={{ minHeight: "100vh" }}>
      <Col xs={24} md={12} >
      <div className="flex flex-col justify-center items-start h-full ps-[20%] ">
        <img src={SigninLogo} alt="logoProject" className=" mb-5 w-[350px] h-[130px]" />
        <div className="text-3xl font-medium  text-[#002C55] mb-5"> Welcome to Nexres</div>
        <div className="text-xl text-[#002C55]">Let’s set up your property so you can start</div>
        <div className="text-xl text-[#002C55] mb-20">managing everything easily.</div>
        <div className="d-flex items-center md:mb-0 mb-10"> 
          <Button onClick={setTypeRedirect} type="primary" loading={isSubmitting} disabled={isSubmitting} className={`bg-[#002C55] text-white font-medium !rounded-xl !px-10 !py-5 !text-lg ${isSubmitting ? 'opacity-50' : ''}`}>
            Get Started
          </Button>

          <Button  
          onClick={dispatch.userAuth.onLogout} type="primary" loading={isSubmitting} disabled={isSubmitting} 
          className={`bg-[#002C55] text-white font-medium !rounded-xl !px-10 !py-5 !text-lg !ms-4 !w-[150px] ${isSubmitting ? 'opacity-50' : ''}`}>
            Login
          </Button>
        </div>
      </div>
      </Col>
      <Col xs={0} md={12} 
      className="hidden md:flex  bg-blue-200 items-center justify-end h-full pr-0" 
      style={{ backgroundImage: `url(${bgStartProject})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
         <img src={demoProject} alt="demoProject" className="w-[90%] h-full object-cover ml-auto" />
      </Col>
    </Row>
    </>
  );
};

export default SetupProject;
