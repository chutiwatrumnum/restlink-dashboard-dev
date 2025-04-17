import dayjs from "dayjs";
import { Modal, Row, Col } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface InfoResidentSignUp {
  resident: any;
  isOpen: boolean;
  callBack: (isOpen: boolean) => void;
}

const InfoResidentSignUp = (props: InfoResidentSignUp) => {
  const handleCancel = async () => {
    await props.callBack(!props?.isOpen);
  };

  return (
    <>
      <Modal
        title="Details"
        width={600}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={false}>
        <Row style={{ paddingTop: 10, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"First name"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Move-in date"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.firstName}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.moveInDate !== null
              ? dayjs(props?.resident?.moveInDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Last name"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Move-out date"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.lastName}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.moveOutDate !== null
              ? dayjs(props?.resident?.moveOutDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Nickname"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Role "}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.nickName ? props?.resident?.nickName : "-"}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.role}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Email "}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Hobby"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.email}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.hobby}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Contact"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Status"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.contact}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.rejectAt ? "Reject" : "Waiting for approve"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Birthday (Op)"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}>
            {"Create"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.birthDate
              ? dayjs(props?.resident?.birthDate).format("DD-MM-YYYY")
              : "-"}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}>
            {props?.resident?.createdAt
              ? dayjs(props?.resident?.createdAt).format("DD-MM-YYYY")
              : "-"}
          </Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleTitleInfo" span={14}>
            {"Room address"}
          </Col>
          <Col className="textStyleTitleInfo" span={10}></Col>
        </Row>
        <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
          <Col className="textStyleSubTitleInfo" span={14}>
            {props?.resident?.roomAddress}
          </Col>
          <Col className="textStyleSubTitleInfo" span={10}></Col>
        </Row>

        {/* Reject */}
        {props?.resident?.rejectAt ? (
          <>
            <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
              <Col className="textStyleTitleInfo" span={14}>
                {"Reject By "}
              </Col>
              <Col className="textStyleTitleInfo" span={10}>
                {"Reject date"}
              </Col>
              <Col className="textStyleSubTitleInfo" span={14}>
                {props?.resident?.rejectUser}
              </Col>
              {/* Reject */}
              <Col className="textStyleSubTitleInfo" span={10}>
                {props?.resident?.rejectAt
                  ? dayjs(props?.resident?.rejectAt).format("DD-MM-YYYY")
                  : null}
              </Col>
            </Row>
            <Row style={{ paddingTop: 2, paddingBottom: 2, paddingLeft: 40 }}>
              <Col className="textStyleTitleInfo" span={24}>
                {"Note"}
              </Col>
              <Col span={24}>{props?.resident?.rejectReason}</Col>
            </Row>
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default InfoResidentSignUp;
