import { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Space } from "antd";
import Header from "../../../components/templates/Header";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { whiteLabel } from "../../../configs/theme";

import NoImg from "../../../assets/images/noImg.jpeg";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";

import {
  DevicesDataType,
  DeviceListType,
} from "../../../stores/interfaces/PowerManagement";

import "../styles/deviceControl.css";

const { Title } = Typography;

const DeviceControl = () => {
  const dispatch = useDispatch<Dispatch>();
  // const { devicesData } = useSelector(
  //   (state: RootState) => state.powerManagement
  // );
  const devicesData = [
    {
      id: 3,
      name: "City gym Floor 6",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/dbp-maint.appspot.com/o/device-control1.png?alt=media&token=cf5efdad-784b-4c9c-abc8-0d09dfd98e3d",
      deviceList: [
        {
          id: 6,
          rcuControlAreaId: 3,
          name: "1st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
        {
          id: 7,
          rcuControlAreaId: 3,
          name: "2st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
        {
          id: 8,
          rcuControlAreaId: 3,
          name: "3st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
      ],
    },
    {
      id: 5,
      name: "Co-working space Floor 29",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/dbp-maint.appspot.com/o/device-control3.png?alt=media&token=34a441ac-3b40-4bcd-bb4a-d027a84bfdb2",
      deviceList: [
        {
          id: 10,
          rcuControlAreaId: 5,
          name: "1st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
        {
          id: 11,
          rcuControlAreaId: 5,
          name: "2st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
        {
          id: 12,
          rcuControlAreaId: 5,
          name: "3st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
      ],
    },
    {
      id: 4,
      name: "Meeting room Floor 29",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/dbp-maint.appspot.com/o/device-control2.png?alt=media&token=8af90d74-6900-41eb-97df-958344f9fad4",
      deviceList: [
        {
          id: 9,
          rcuControlAreaId: 4,
          name: "1st air conditioner",
          snumOpen: 0,
          snumClose: 4,
          ip: "192.168.1.232",
        },
      ],
    },
  ];

  // const { accessibility } = useSelector((state: RootState) => state.common);
  const [refresh, setRefresh] = useState(true);

  // functions

  const fetchData = async () => {
    await dispatch.powerManagement.getDevicesData();
  };

  const refreshHandler = () => {
    setRefresh(!refresh);
  };

  const onTurnOn = async (val: DeviceListType) => {
    const payload = {
      i: `'${val.ip}'`,
      s: val.snumOpen.toString(),
      n: val.id.toString(),
      t: `${new Date().getTime()}`,
    };
    // console.log(payload);
    ConfirmModal({
      title: "Are you sure you want to edit this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const result = await dispatch.powerManagement.editDevice(payload);
        console.log(result);
      },
      onCancel: () => console.log("Cancelled"),
    });
  };

  const onTurnOff = async (val: DeviceListType) => {
    const payload = {
      i: `'${val.ip}'`,
      s: val.snumClose.toString(),
      n: val.id.toString(),
      t: `${new Date().getTime()}`,
    };
    ConfirmModal({
      title: "Are you sure you want to edit this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const result = await dispatch.powerManagement.editDevice(payload);
        console.log(result);
      },
      onCancel: () => console.log("Cancelled"),
    });
    // console.log(payload);
  };

  // components
  const DeviceCard = ({ data }: { data: DevicesDataType }) => {
    return (
      <Col md={12} xl={8}>
        <div className="areaControlCardContainer">
          <img className="areaControlCardImage" src={data.imageUrl ?? NoImg} />
          <div className="areaControlCardDetail">
            <div className="areaControlCardDetailTop">
              <Row
                className="deviceControlTitleContainer"
                justify="space-between"
              >
                <Title level={4} className="areaControlCardDetailTitle">
                  {data?.name}
                </Title>
              </Row>
              <Space
                className="deviceControlSpace"
                direction="vertical"
                size={5}
                style={{ width: "100%" }}
              >
                {data?.deviceList.map((item) => {
                  return (
                    <Row
                      className="deviceDetailContainer"
                      justify="space-between"
                    >
                      <Row style={{ width: "50%" }} align="middle">
                        <Col span={4}>
                          <img
                            width={25}
                            src={
                              "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                            }
                            style={{ objectFit: "contain" }}
                          />
                        </Col>
                        <Col
                          span={20}
                          style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          <span className="deviceControlCardDetailDeviceName">
                            {item.name}
                          </span>
                        </Col>
                      </Row>
                      <Row justify="space-evenly" style={{ width: "50%" }}>
                        <Col span={11} style={{ boxSizing: "border-box" }}>
                          <Button
                            htmlType="button"
                            size="middle"
                            shape={whiteLabel.buttonShape}
                            style={{
                              boxShadow: "none",
                              fontWeight: whiteLabel.normalWeight,
                              border: "none",
                            }}
                            className="turnOnBtn"
                            onClick={() => {
                              onTurnOn(item);
                            }}
                          >
                            <span
                              style={{
                                color: whiteLabel.whiteColor,
                                fontSize: "0.85rem",
                              }}
                            >
                              Turn on
                            </span>
                          </Button>
                        </Col>
                        <Col span={11} style={{ boxSizing: "border-box" }}>
                          <Button
                            htmlType="button"
                            size="middle"
                            shape={whiteLabel.buttonShape}
                            style={{
                              boxShadow: "none",
                              fontWeight: whiteLabel.normalWeight,
                              border: "none",
                            }}
                            className="turnOffBtn"
                            onClick={() => {
                              onTurnOff(item);
                            }}
                          >
                            <span
                              style={{
                                color: whiteLabel.whiteColor,
                                fontSize: "0.85rem",
                              }}
                            >
                              Turn off
                            </span>
                          </Button>
                        </Col>
                      </Row>
                    </Row>
                  );
                })}
              </Space>
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
      <Header title="Device control" />
      <Row style={{ marginBottom: 25 }} gutter={[16, 16]}>
        {devicesData.map((item) => {
          return <DeviceCard key={item.id} data={item} />;
        })}
      </Row>
    </>
  );
};

export default DeviceControl;
