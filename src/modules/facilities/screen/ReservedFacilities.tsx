import { useState, useEffect } from "react";
import { Row, Col, Typography, Switch, Button } from "antd";
import Header from "../../../components/templates/Header";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { whiteLabel } from "../../../configs/theme";
import {
  LimitPeopleIcon,
  MaxTimeIcon,
  EditIcon,
} from "../../../assets/icons/Icons";
import NoImg from "../../../assets/images/noImg.jpeg";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EditFacilityModal from "../components/EditFacilityModal";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";

import { ReservationListDataType } from "../../../stores/interfaces/Facilities";

import "../styles/ReserveFacility.css";

const { Title } = Typography;

const ReservedFacilities = () => {
  const dispatch = useDispatch<Dispatch>();
  const data = useSelector(
    (state: RootState) => state.facilities.reservationListData
  );
  const { accessibility } = useSelector((state: RootState) => state.common);
  const [refresh, setRefresh] = useState(true);
  const [editData, setEditData] = useState<ReservationListDataType>();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // functions

  const fetchData = async () => {
    await dispatch.facilities.getReservationList();
  };

  const onSwitchChange = (checked: boolean, id: number) => {
    // console.log(`ID ${id} switch to ${checked}`);
    const payload = { id: id, lock: checked };
    ConfirmModal({
      title: `Are you sure you want to ${
        checked ? "lock" : "unlock"
      } this facility?`,
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: () => onLockOk(payload),
      onCancel: onLockCancel,
    });
  };

  const onLockOk = async (payload: { id: number; lock: boolean }) => {
    const result = await dispatch.facilities.updateLockStatus(payload);
    if (result) {
      SuccessModal("Successfully change information");
    }
    setRefresh(!refresh);
  };

  const onLockCancel = () => {
    console.log("cancel");
  };

  const onEdit = async (data: ReservationListDataType) => {
    // console.log(data);
    setEditData(data);
    setEditModalOpen(true);
  };

  const onEditSave = async (values: ReservationListDataType) => {
    // console.log(values);
    const result = await dispatch.facilities.updateFacilities(values);
    if (result) {
      SuccessModal("Successfully change information");
    } else {
      FailedModal("Something went wrong");
    }
    refreshHandler();
  };

  const onEditCancel = () => {
    setEditModalOpen(false);
  };

  const refreshHandler = () => {
    setRefresh(!refresh);
  };

  // components

  const RoomCard = ({ data }: { data: ReservationListDataType }) => {
    return (
      <Col md={12} xl={8}>
        <div className="reservedCardContainer">
          <img className="reservedCardImage" src={data.imageUrl ?? NoImg} />
          <div className="reserveCardDetail">
            <div className="reserveCardDetailTop">
              <Row justify="space-between">
                <Title level={4} className="reserveCardDetailTitle">
                  {data?.name}
                </Title>
                <Button
                  icon={<EditIcon color={whiteLabel.subMenuTextColor} />}
                  type="text"
                  onClick={() => onEdit(data)}
                />
              </Row>
              <p className="reserveCardDetailSubName">{data?.subName}</p>
              <Row justify="space-between">
                <Row align="middle">
                  <LimitPeopleIcon className="reservedIcon" />
                  <span className="subTextColor reservedDetailTxt reservedLeftTxtSpace">
                    {data?.limitPeople} Persons
                  </span>
                </Row>
                <Row align="middle">
                  <MaxTimeIcon className="reservedIcon" />
                  <span className="subTextColor reservedLeftTxtSpace reservedDetailTxt">
                    {data?.maximumHourBooking} Hours
                  </span>
                </Row>
              </Row>
            </div>
            <div className="reserveCardDetailBottom">
              <Row justify="space-between" align="middle">
                <Row>
                  <Switch
                    disabled={
                      accessibility?.team_facility_management.allowEdit
                        ? false
                        : true
                    }
                    checked={data?.locked}
                    onChange={() => onSwitchChange(!data.locked, data.id)}
                  />
                  <span
                    style={{
                      color: whiteLabel.subMenuTextColor,
                      marginLeft: 5,
                    }}
                  >
                    Click to {data?.locked ? "unlock" : "lock"}
                  </span>
                </Row>
                {data?.locked ? (
                  <span style={{ color: whiteLabel.dangerTextColor }}>
                    Unavailable
                  </span>
                ) : (
                  <span style={{ color: whiteLabel.successTextColor }}>
                    Available
                  </span>
                )}
              </Row>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <>
      <Header title="Facilities" />
      <Row gutter={[16, 16]}>
        {data.map((item) => {
          return <RoomCard key={item.id} data={item} />;
        })}
      </Row>
      <EditFacilityModal
        visible={editModalOpen}
        data={editData}
        onSave={onEditSave}
        onExit={onEditCancel}
      />
    </>
  );
};

export default ReservedFacilities;
