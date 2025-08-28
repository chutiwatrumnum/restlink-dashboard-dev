import { Col, Typography } from "antd";

import LOGO from "../../assets/images/LogoNexres.png";

import "./styles/successResetScreen.css";

const { Text, Title } = Typography;

const SuccessResetScreen = () => {
  return (
    <Col className="successResetContainer">
      <div className="successResetContent">
        <img src={LOGO} alt="logo" className="logo" style={{ maxWidth: 300 }} />
        <p style={{ marginTop: 50 }}>
          Thank you. Your account password has been changed.
        </p>
      </div>
    </Col>
  );
};

export default SuccessResetScreen;
