import { useEffect, useState } from "react";
import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../stores";
import { Col, Row } from "antd";

// import COVER_IMAGE from "../assets/images/coverImage.png";

// style
import "./styles/unAuthorizedLayout.css";

const from = window.location.pathname;

const UnauthorizedLayout = () => {
  const userAuth = useSelector((state: RootState) => state.userAuth);
  const location = useLocation();
  const outlet = useOutlet();
  const { width } = useWindowDimensions();

  if (userAuth.isAuth) {
    return (
      <Navigate
        to={from.includes("dashboard") ? from : "/dashboard/managementMain"}
        state={{ from: location }}
        replace
      />
    );
  }

  //Responsive helper login views functions
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
  }

  return (
    <Row className="container">
      {/* {width < 1024 ? null : (
        <Col span={8} className="imageContainer">
          <img src={COVER_IMAGE} alt="cover" className="coverImage" />
        </Col>
      )} */}
      <Col className="contentContainer">{outlet}</Col>
    </Row>
  );
};

export default UnauthorizedLayout;
