import { useEffect } from "react";
import { useOutlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";
import { encryptStorage } from "../utils/encryptStorage";

// style
import "./styles/unAuthorizedLayout.css";

const UnauthorizedLayout = () => {
  const access_token = encryptStorage.getItem("access_token");
  const projectId = encryptStorage.getItem("projectId");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();
  const path = window.location.pathname;

  // ตรวจสอบว่าเป็นหน้า auth หรือไม่
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    if (isAuth && access_token && projectId) {
      navigate(path.includes("dashboard") ? path : "/dashboard/profile");
    } else if (!isAuth && window.location.pathname !== "/auth") {
      window.location.pathname = "/auth";
    }
  }, [isAuth, access_token, projectId]);

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
