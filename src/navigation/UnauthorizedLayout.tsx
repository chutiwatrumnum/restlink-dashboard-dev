import { useEffect } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";
import { encryptStorage } from "../utils/encryptStorage";

// import COVER_IMAGE from "../assets/images/coverImage.png";

// style
import "./styles/unAuthorizedLayout.css";

const UnauthorizedLayout = () => {
  const access_token = encryptStorage.getItem("access_token");
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.userAuth);
  const outlet = useOutlet();
  const path = window.location.pathname;

  useEffect(() => {
    if (isAuth && access_token) {
      navigate(path.includes("dashboard") ? path : "/dashboard/profile");
    } else if (!isAuth && window.location.pathname !== "/auth") {
      window.location.pathname = "/auth";
    }
  }, [isAuth]);

  return (
    <Row className="container">
      <Col className="contentContainer">{outlet}</Col>
    </Row>
  );
};

export default UnauthorizedLayout;
