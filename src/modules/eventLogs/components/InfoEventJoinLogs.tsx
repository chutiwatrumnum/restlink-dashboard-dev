import dayjs from "dayjs";
import { Modal, Row, Col } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { dataEventJoinLogsByIDType } from "../../../stores/interfaces/EventLog";

const rowStyle: object = {
  paddingTop: 2,
  paddingBottom: 2,
};
dayjs.extend(customParseFormat);
interface InfoResidentInformationProps {
  eventjoinLog: dataEventJoinLogsByIDType;
  isOpen: boolean;
  callBack: (isOpen: boolean) => void;
}
const InfoEventJoinLogs = (props: InfoResidentInformationProps) => {
  const handleCancel = async () => {
    await props.callBack(!props?.isOpen);
  };
  return (
    <>
      <Modal
        title="Details"
        width={350}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={false}>
        <Row style={{ paddingTop: 10, paddingBottom: 2 }}>
          <Col span={24}>
            <span style={{ fontWeight: 700 }}>{"Type:"}</span>{" "}
            <span>{props?.eventjoinLog?.typeEventJoinLog}</span>
          </Col>
          <Col span={24} style={{ fontWeight: 700 }}>
            {"Event participant name:"}
          </Col>
          {props?.eventjoinLog?.participant?.map((item: any, id: number) => {
            return (
              <Col span={24}>
                Participant name no.{id + 1}: {item.fullName}
              </Col>
            );
          })}
        </Row>
      </Modal>
    </>
  );
};

export default InfoEventJoinLogs;
