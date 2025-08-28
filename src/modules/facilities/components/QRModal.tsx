import { DownloadOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row } from "antd";
import QRCode from "qrcode.react";
import { useRef } from "react";
import { exportComponentAsJPEG } from "react-component-export-image";
import { ReservedRowListDataType } from "../../../stores/interfaces/Facilities";
import QR_LOGO from "../../../assets/images/QRLogo.png";
import LOGO from "../../../assets/images/LogoNexres.png";
import SuccessModal from "../../../components/common/SuccessModal";
import dayjs from "dayjs";

import "../styles/ReserveFacility.css";
import { whiteLabel } from "../../../configs/theme";

interface EditFacilityModalProps {
  visible: boolean;
  data?: ReservedRowListDataType;
  onExit: () => void;
}

export default function QrModal({
  data,
  visible = false,
  onExit,
}: EditFacilityModalProps) {
  const qrRef = useRef(null);
  return (
    <>
      <Modal
        centered
        title={
          <span style={{ fontWeight: whiteLabel.normalWeight }}>
            Reservation
          </span>
        }
        open={visible}
        onCancel={() => onExit()}
        footer={null}
        width={"30%"}
      >
        <div ref={qrRef} className="reservedQRCardContainer">
          <div className="flex flex-col justify-center items-center reservedCardHeader">
            <img src={LOGO} alt="LOGO" style={{ height: 50, margin: 15 }} />
          </div>
          <div className="flex flex-col justify-center items-center reservedQRContainer">
            <QRCode
              value={data?.qrCode ?? "Something went wrong"}
              size={200}
              imageSettings={{
                src: QR_LOGO,
                height: 60,
                width: 60,
                excavate: false,
              }}
            />
          </div>
          <div style={{ paddingLeft: 30, marginTop: 20 }}>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Facility</span>
              </Col>
              <Col span={12}>: {data?.facilityName}</Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Topic</span>
              </Col>
              <Col span={12}>: {data?.topic}</Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Name Surname</span>
              </Col>
              <Col span={12}>
                :{" "}
                {`${data?.bookingUser?.givenName} ${
                  data?.bookingUser?.middleName ?? ""
                } ${data?.bookingUser?.familyName}`}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Mobile no.</span>
              </Col>
              <Col span={12}>: {data?.contactNo}</Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Reserve Date</span>
              </Col>
              <Col span={12}>
                : {data ? dayjs(data.joinAt).format("DD/MM/YYYY") : null}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Time</span>
              </Col>
              <Col span={12}>
                : {data ? data?.startTime : null} -{" "}
                {data ? data?.endTime : null}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Number of people</span>
              </Col>
              <Col span={12}>: {data?.countPeople}</Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Note</span>
              </Col>
              <Col span={12}>: {data?.note ?? "-"}</Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Create</span>
              </Col>
              <Col span={12}>
                : {data ? dayjs(data.createdAt).format("DD/MM/YYYY") : "-"}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <span className="reservedTxtSemiBold">Create by</span>
              </Col>
              <Col span={12}>: {data?.bookedBy ?? "-"}</Col>
            </Row>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button
            size="large"
            type="primary"
            onClick={() =>
              exportComponentAsJPEG(qrRef, {
                fileName: `${data?.fullName}_QR_Reserved`,
              }).then(() => SuccessModal("Image saved successfully"))
            }
            style={{ width: 200, marginTop: 10 }}
            icon={<DownloadOutlined />}
          >
            Save Image
          </Button>
        </div>
      </Modal>
    </>
  );
}
