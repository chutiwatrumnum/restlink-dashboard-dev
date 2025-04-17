import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { whiteLabel } from "../../../configs/theme";

import { Row, Button, Col } from "antd";
import Header from "../../../components/templates/Header";
import PeopleCountingEditModal from "../components/PeopleCountingEditModal";
import { EditIcon, PeopleStatusIcon } from "../../../assets/icons/Icons";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";

import {
  PeopleCountingDataType,
  PeopleCountingFormDataType,
} from "../../../stores/interfaces/PeopleCounting";

import "../styles/peopleCounting.css";

const PeopleCountingMain = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const data = useSelector(
    (state: RootState) => state.peopleCounting.peopleCountingData
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<PeopleCountingDataType>();
  const [refresh, setRefresh] = useState(false);

  // functions
  const fetchData = async () => {
    await dispatch.peopleCounting.getPeopleCountingData();
  };

  const onEdit = (data: PeopleCountingDataType) => {
    setEditData(data);
    setIsEditModalOpen(true);
  };

  const onEditOk = async (payload: PeopleCountingFormDataType) => {
    // console.log(payload);
    ConfirmModal({
      title: "Are you sure you want to edit this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const edit = await dispatch.peopleCounting.editPeopleCountingData(
          payload
        );
        if (edit) {
          SuccessModal("Successfully edited");
          setIsEditModalOpen(false);
          setRefresh(!refresh);
        }
      },
      onCancel: () => {
        console.log("cancelled");
      },
    });
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const statusColorSelector = (status: string) => {
    let statusColor = "#fff";
    switch (status) {
      case "low":
        statusColor = whiteLabel.successColor;
        break;

      case "medium":
        statusColor = whiteLabel.warningColor;
        break;

      case "high":
        statusColor = whiteLabel.dangerColor;
        break;

      default:
        break;
    }
    return statusColor;
  };

  const capitalizer = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // components
  const RoomCard = ({ data }: { data: PeopleCountingDataType }) => {
    return (
      <Col lg={{ span: 8 }} xs={{ span: 24 }} className="cardContainer_PPC">
        <div className="imageContainer_PPC">
          <img className="cardImage_PPC" src={data.facility.imageUrl} />
        </div>
        <div className="cardDetailContainer_PPC">
          <Row
            justify="space-between"
            align="middle"
            className="cardDetailTop_PPC"
          >
            <span className="cardTitle_PPC">{data.facility.name}</span>
            <Button
              type="text"
              icon={<EditIcon />}
              onClick={() => onEdit(data)}
            />
          </Row>
          <Row
            justify="center"
            align="middle"
            className="cardStatusBoxContainer_PPC"
            style={{ backgroundColor: statusColorSelector(data.status) }}
          >
            <PeopleStatusIcon
              color={whiteLabel.whiteColor}
              className="cardStatusIcon_PPC"
            />
            <span className="cardStatusText_PPC">
              {capitalizer(data.status)}
            </span>
          </Row>
        </div>
      </Col>
    );
  };

  // actions
  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <>
      <Header title="People counting" />
      <Row gutter={[30, 30]} style={{ justifyContent: "space-between" }}>
        {data.map((item) => {
          return <RoomCard data={item} />;
        })}
      </Row>
      <PeopleCountingEditModal
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        data={editData}
      />
    </>
  );
};

export default PeopleCountingMain;
