import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";

import { Row, Button, Col, Flex, Card, Input } from "antd";
import Header from "../../../components/templates/Header";
import PeopleCountingEditModal from "../components/PeopleCountingEditModal";
import {
  EditIcon,
  PeopleCountingStatusIcon,
} from "../../../assets/icons/Icons";

import { PeopleCountingDataType } from "../../../stores/interfaces/PeopleCounting";

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

  const onEdit = (item: PeopleCountingDataType) => {
    console.log("edit data: ", item);
    setEditData(item);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
    setRefresh(!refresh);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const statusColorSelector = (item: string) => {
    let statusColor = "#fff";
    let color = "#fff";
    switch (item) {
      case "Low":
        statusColor = "#D3F8D6";
        color = "#38BE43";
        break;

      case "Medium":
        statusColor = "#FFF7DA";
        color = "#ECA013";
        break;

      case "High":
        statusColor = "#FFE3E3";
        color = "#D73232";
        break;
      default:
        break;
    }
    return { statusColor, color };
  };

  const capitalizer = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // actions
  useEffect(() => {
    fetchData();
  }, [refresh]);

  return (
    <>
      <Header title="Counting" />
      <Row gutter={[15, 15]} className="rowPeopleCounting" justify="center">
        {data.map((item: PeopleCountingDataType, index: number) => {
          const colors = statusColorSelector(item.status || "");
          return (
            <Col xs={{ span: 24 }} lg={{ span: 8 }} key={index}>
              <Card className="cardContainer_PPC" variant="borderless">
                <div className="imageContainer_PPC">
                  <img className="cardImage_PPC" src={item.image} />
                </div>
                <div className="cardDetailContainer_PPC">
                  <Row
                    justify="space-between"
                    align="middle"
                    className="cardDetailTop_PPC"
                  >
                    <span className="cardTitle_PPC">
                      {capitalizer(item.name || "-")}
                    </span>
                    <Button
                      type="text"
                      icon={<EditIcon />}
                      onClick={() => onEdit(item)}
                    />
                  </Row>
                  <Row className="cardStatusBoxContainer_PPC" justify="start">
                    <Flex justify="start" align="center" gap={9}>
                      <PeopleCountingStatusIcon
                        color={colors.color}
                        className="cardStatusIcon_PPC"
                      />
                      <div
                        className="cardStatusText_PPC"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: colors.statusColor,
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: colors.color,
                          }}
                        ></span>
                        <span
                          style={{
                            color: colors.color,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {capitalizer(item.status || "")}
                        </span>
                      </div>
                    </Flex>
                  </Row>
                </div>
              </Card>
            </Col>
          );
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
