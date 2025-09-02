import { useEffect } from "react";
import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";
import { encryptStorage } from "../utils/encryptStorage";

import { getProject } from "../modules/setupProjectFirst/service/api/SetupProject";
// style
import "./styles/unAuthorizedLayout.css";

const UnauthorizedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const { step,projectData } = useSelector((state: RootState) => state.setupProject);
  const outlet = useOutlet();

  // ตรวจสอบว่าเป็นหน้า auth หรือไม่
  const isAuthPage = location.pathname === "/auth";

  const checkSetupProject = async () => {
    if(step === 0){
      const response = await getProject() 
      let projectType 
      if(response.status){
        dispatch.setupProject.setProjectData(response || {});
        projectType = response?.projectType?.nameCode || '';
        const strType = projectType.split('_');
        projectType = strType[strType.length - 1];       
        if(projectType === 'condo'){
          navigate('/setup-project/upload-number-building', { replace: true });
        }
        else if(projectType === 'village'){
          navigate('/setup-project/upload-plan', { replace: true });
        }
      } 
      else{
        dispatch.setupProject.setProjectData({});
      }
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const access_token = await encryptStorage.getItem("access_token");
        // const projectId = await encryptStorage.getItem("projectId");
        const responseStep = await dispatch.setupProject.getStepCondoModel();
        // ถ้า login แล้วและมี token ให้ redirect ไป dashboard
        if (isAuth && access_token && access_token !== "undefined") {
          // ดึง project data ก่อนเสมอ
          await dispatch.setupProject.setDataProject();
          
          if(responseStep !== 3){
            checkSetupProject();
          }
          else{
            navigate("/dashboard/profile", { replace: true });
          }
          return;
        }

        // ถ้าไม่ได้ login และไม่ได้อยู่หน้า auth ให้ redirect ไปหน้า login
        if (!isAuth && !isAuthPage) {
          navigate("/auth", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!isAuthPage) {
          navigate("/auth", { replace: true });
        }
      }
    };

    checkAuth();
  }, [isAuth, location.pathname, navigate, isAuthPage]);

  // สำหรับหน้า login ให้ใช้ layout แบบเต็มหน้าจอ
  if (isAuthPage) {
    return <>{outlet}</>;
  }

  // สำหรับหน้าอื่นๆ ใช้ layout เดิม
  return (
    <Row className="container">
      <Col className="contentContainer">{outlet}</Col>
    </Row>
  );
};

export default UnauthorizedLayout;
