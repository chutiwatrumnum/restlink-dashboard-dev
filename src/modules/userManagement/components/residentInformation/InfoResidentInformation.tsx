import dayjs from "dayjs";
import { Modal, Row, Col } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { whiteLabel } from "../../../../configs/theme";
import { ResidentInformationDataType } from "../../../../stores/interfaces/ResidentInformation";
const rowStyle: object = {
  paddingTop: 2,
  paddingBottom: 2,
};
dayjs.extend(customParseFormat);
interface InfoResidentInformationProps {
  resident: ResidentInformationDataType;
  isOpen: boolean;
  callBack: (isOpen: boolean) => void;
}
const InfoResidentInformation = (props: InfoResidentInformationProps) => {
  const handleCancel = async () => {
    await props.callBack(!props?.isOpen);
  };
  return (
    <>
      <Modal
        title="Details"
        width={450}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={false}>
        <Row style={{ paddingTop: 10, paddingBottom: 2 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"First name "}
          </Col>
          <Col
            className="textStyleTitleInfo"
            span={10}
            style={{ fontWeight: 400 }}>
            {"Move-in date"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.firstName}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.moveInDate !== null
              ? dayjs(props?.resident?.moveInDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col
            className="textStyleTitleInfo"
            span={14}
            style={{ fontWeight: 400 }}>
            {"Nickname"}
          </Col>
          <Col
            className="textStyleTitleInfo"
            span={10}
            style={{ fontWeight: 400 }}>
            {"Move-out date"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.nickName ? props?.resident?.nickName : "-"}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.moveOutDate !== null
              ? dayjs(props?.resident?.moveOutDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col
            className="textStyleTitleInfo"
            span={14}
            style={{ fontWeight: 400 }}>
            {"Last name "}
          </Col>
          <Col
            className="textStyleTitleInfo"
            span={10}
            style={{ fontWeight: 400 }}>
            {"Role"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.lastName}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.role}
          </Col>
        </Row>

        <Row style={rowStyle}>
          <Col
            className="textStyleTitleInfo"
            span={14}
            style={{ fontWeight: 400 }}>
            {"Room address"}
          </Col>
          <Col
            className="textStyleTitleInfo"
            span={10}
            style={{ fontWeight: 400 }}>
            {"Birthday (Op) "}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.roomAddress}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.birthDate
              ? dayjs(props?.resident?.birthDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col
            className="textStyleTitleInfo"
            span={14}
            style={{ fontWeight: 400 }}>
            {"Mobile no."}
          </Col>
          <Col
            className="textStyleTitleInfo"
            span={10}
            style={{ fontWeight: 400 }}>
            {"Registration channel"}
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.contact}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.channel}
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default InfoResidentInformation;
