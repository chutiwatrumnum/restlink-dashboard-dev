import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Space,
  Form,
  TimePicker,
  type FormProps,
} from "antd";
import Header from "../../../components/templates/Header";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { whiteLabel } from "../../../configs/theme";
import { BulbIcon } from "../../../assets/icons/Icons";
import NoImg from "../../../assets/images/noImg.jpeg";
// import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import SmallButton from "../../../components/common/SmallButton";
import { requiredRule } from "../../../configs/inputRule";

import {
  AreaDataType,
  AreaPutDataType,
} from "../../../stores/interfaces/PowerManagement";

import "../styles/deviceControl.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = TimePicker;

const AreaControl = () => {
  const dispatch = useDispatch<Dispatch>();
  const { areaData } = useSelector((state: RootState) => state.powerManagement);
  // const areaData = [
  //   {
  //     id: 1,
  //     name: "Lighting control area",
  //     subName: "-",
  //     imageUrl:
  //       "https://firebasestorage.googleapis.com/v0/b/dbp-maint.appspot.com/o/Rectangle%20173047108.png?alt=media&token=8cbde0a9-a405-4b2a-a6e5-b8deeae9cf4d",
  //     startTime: "09:02",
  //     endTime: "11:02",
  //     active: true,
  //     status: 1,
  //     rcuConfigList: [
  //       {
  //         id: 1,
  //         rcuControlAreaId: 1,
  //         name: "recreation garden (1 fl)",
  //         subName: "-",
  //         imageUrl: "https",
  //         active: true,
  //         groupShow: "0",
  //         deviceType: "0",
  //         status: 0,
  //       },
  //       {
  //         id: 2,
  //         rcuControlAreaId: 1,
  //         name: "mind oasis (1 fl)",
  //         subName: "-",
  //         imageUrl: "https",
  //         active: true,
  //         groupShow: "0",
  //         deviceType: "0",
  //         status: 0,
  //       },
  //       {
  //         id: 3,
  //         rcuControlAreaId: 1,
  //         name: "multiscape (1 fl)",
  //         subName: "-",
  //         imageUrl: "https",
  //         active: true,
  //         groupShow: "0",
  //         deviceType: "0",
  //         status: 0,
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: "Lighting control area 2",
  //     subName: "-",
  //     imageUrl:
  //       "https://firebasestorage.googleapis.com/v0/b/dbp-maint.appspot.com/o/Rectangle%20173047108.png?alt=media&token=8cbde0a9-a405-4b2a-a6e5-b8deeae9cf4d",
  //     startTime: "09:10",
  //     endTime: "16:10",
  //     active: true,
  //     status: 0,
  //     rcuConfigList: [
  //       {
  //         id: 4,
  //         rcuControlAreaId: 2,
  //         name: "garden lounge (23 fl)",
  //         subName: "-",
  //         imageUrl: "https",
  //         active: true,
  //         groupShow: "0",
  //         deviceType: "0",
  //         status: 0,
  //       },
  //       {
  //         id: 5,
  //         rcuControlAreaId: 2,
  //         name: "garden roof (29 fl)",
  //         subName: "-",
  //         imageUrl: "https",
  //         active: true,
  //         groupShow: "0",
  //         deviceType: "0",
  //         status: 0,
  //       },
  //     ],
  //   },
  // ];

  const { accessibility } = useSelector((state: RootState) => state.common);
  const [refresh, setRefresh] = useState(true);

  // functions
  const fetchData = async () => {
    await dispatch.powerManagement.getAreaData();
    // console.log("GET DATA", areaData);
  };

  const refreshHandler = () => {
    setRefresh(!refresh);
  };

  // components
  const AreaCard = ({ data }: { data: AreaDataType }) => {
    const [form] = Form.useForm();
    if (data.startTime) {
      form.setFieldsValue({
        timeRange: [
          dayjs(`${dayjs().format("YYYY-MM-DD")} ${data.startTime}`),
          dayjs(`${dayjs().format("YYYY-MM-DD")} ${data.endTime}`),
        ],
      });
    }

    const onSaveTime: FormProps["onFinish"] = async (values) => {
      const startTime = values.timeRange[0];
      const endTime = values.timeRange[1];
      const payload: AreaPutDataType = {
        id: data.id.toString(),
        time: `${new Date().getTime()}`,
        start: startTime.format("HH:mm"),
        end: endTime.format("HH:mm"),
      };
      // console.log(payload);
      const editTime = await dispatch.powerManagement.editAreaTime(payload);
      if (editTime) {
        SuccessModal("Successfully Changed");
        refreshHandler();
      }
    };

    const onLightControlClick = async (status: string) => {
      const payload = {
        status: status,
        id: data.id.toString(),
        time: `${new Date().getTime()}`,
      };
      console.log(payload);
      const lightControl = await dispatch.powerManagement.controlAreaLight(
        payload
      );
      if (lightControl) {
        SuccessModal("Successfully Changed");
      }
    };

    return (
      <Col md={12} xl={8}>
        <div className="areaControlCardContainer">
          <img className="areaControlCardImage" src={data.imageUrl ?? NoImg} />
          <div className="areaControlCardDetail">
            <div className="areaControlCardDetailTop">
              <Row
                className="areaControlTitleContainer"
                justify="space-between"
              >
                <Title level={4} className="areaControlCardDetailTitle">
                  {data?.name}
                </Title>
              </Row>
              <Space direction="vertical" size={5}>
                {data?.rcuConfigList.map((rcuItem: any) => {
                  return (
                    <span className="areaControlCardDetailInfo">
                      - {rcuItem.name}
                    </span>
                  );
                })}
              </Space>
            </div>
            <div className="areaControlCardDetailBottom">
              <Row justify="space-between">
                <Title level={5} className="areaControlCardDetailBottomTitle">
                  Opening time / Closing time
                </Title>
              </Row>
              <Form
                name="time"
                form={form}
                onFinish={onSaveTime}
                onFinishFailed={() => {
                  console.log("Failed");
                }}
              >
                <Row justify="space-between">
                  <Col span={16}>
                    <Form.Item name={`timeRange`} rules={requiredRule}>
                      <RangePicker size="large" format={"HH:mm"} />
                    </Form.Item>
                  </Col>
                  <SmallButton
                    className="areaSaveBtn"
                    form={form}
                    message="Save"
                  />
                </Row>
              </Form>
              <Row justify="space-between">
                <Button
                  htmlType="button"
                  size="large"
                  shape={whiteLabel.buttonShape}
                  style={{
                    width: "45%",
                    boxShadow: "none",
                    fontWeight: whiteLabel.normalWeight,
                    border: "none",
                  }}
                  className="turnOnBtn"
                  onClick={() => {
                    onLightControlClick("1");
                  }}
                >
                  <Row justify="center" align="middle">
                    <BulbIcon
                      color={whiteLabel.whiteColor}
                      className="bulbIconControl"
                    />
                    <span
                      style={{ color: whiteLabel.whiteColor, marginLeft: 10 }}
                    >
                      Turn on
                    </span>
                  </Row>
                </Button>
                <Button
                  htmlType="button"
                  size="large"
                  shape={whiteLabel.buttonShape}
                  style={{
                    width: "45%",
                    boxShadow: "none",
                    fontWeight: whiteLabel.normalWeight,
                    border: "none",
                  }}
                  className="turnOffBtn"
                  onClick={() => {
                    onLightControlClick("0");
                  }}
                >
                  <Row justify="center" align="middle">
                    <BulbIcon
                      color={whiteLabel.whiteColor}
                      className="bulbIconControl"
                    />
                    <span
                      style={{ color: whiteLabel.whiteColor, marginLeft: 10 }}
                    >
                      Turn off
                    </span>
                  </Row>
                </Button>
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
      <Header title="Area control" />
      <Row gutter={[16, 16]}>
        {areaData?.map((item: AreaDataType) => {
          return <AreaCard key={item.id} data={item} />;
        })}
      </Row>
    </>
  );
};

export default AreaControl;
