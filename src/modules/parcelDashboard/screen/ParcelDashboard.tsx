import { useState } from "react";
import Header from "../../../components/templates/Header";
import {
  Card,
  Row,
  Col,
  DatePicker,
  DatePickerProps,
  Button,
  Table,
} from "antd";
import { Pie } from "@ant-design/plots";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import {
  ParcelDelivered,
  ParcelPickUp,
  ParcelAwaiting,
  ParcelOverduePickUp,
} from "../../../assets/icons/Icons";
import ParcelStatusChart from "../components/ParcelStatusChart";
import ParcelDailyChart from "../components/ParcelDailyChart";
import "../style/parcelDashboard.css";

type dataType = {
  title: string;
  value: number;
};

interface DataType {
  key: string;
  room: string;
  delivered: string;
  overdue: number;
}

const ParcelDashboard = () => {
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const pageSizeOptions = [10, 20, 60, 100];
  // const PaginationConfig = {
  //   defaultPageSize: pageSizeOptions[0],
  //   pageSizeOptions: pageSizeOptions,
  //   current: currentPage,
  //   showSizeChanger: false,
  //   total: total,
  // };
  // Mock up Data for Stat Card
  const dataStat: dataType[] = [
    {
      title: "Delivered parcels",
      value: 1170,
    },
    {
      title: "Parcels awaiting pickup",
      value: 950,
    },
    {
      title: "Picked up parcels",
      value: 190,
    },
    {
      title: "Overdue pickup",
      value: 30,
    },
  ];

  const colorCard: string[] = ["#f0f5ff", "#fff7e1", "#eefaea", "#fff4f1"];

  const iconCard: React.ReactNode[] = [
    <ParcelDelivered />,
    <ParcelAwaiting />,
    <ParcelPickUp />,
    <ParcelOverduePickUp />,
  ];
  const colorStatus: string[] = ["#64db99", "#56a0ff", "#ff8f6b"];

  const { RangePicker } = DatePicker;
  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card className="stat-card-shadow">
      <Row align="middle" justify="start" gutter={16}>
        <Col>
          <div
            style={{
              backgroundColor: color,
              padding: "14px",
              borderRadius: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        </Col>
        <Col>
          <div>
            <div style={{ fontSize: "24px", color: "#000", fontWeight: "500" }}>
              {value}
            </div>
            <div
              style={{ fontSize: "12px", color: "#616161", fontWeight: "300" }}
            >
              {title}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  // Mock up Data for Pie Chart Pickup Status
  const pickUpStatusData = [
    { type: "Picked Up", value: 950 },
    { type: "Awaiting Pickup", value: 150 },
    { type: "Overdue", value: 30 },
  ];
  // Mock up Data for Daily Deliveries & Pickups Chart
  const DailyData = [
    { date: "2025-04-05", value: 100, type: "Picked up" },
    { date: "2025-04-05", value: 50, type: "Awaiting pickup" },
    { date: "2025-04-05", value: 10, type: "Overdue" },
    { date: "2025-04-06", value: 90, type: "Picked up" },
    { date: "2025-04-06", value: 40, type: "Awaiting pickup" },
    { date: "2025-04-06", value: 3, type: "Overdue" },
    { date: "2025-04-07", value: 130, type: "Picked up" },
    { date: "2025-04-07", value: 20, type: "Awaiting pickup" },
    { date: "2025-04-07", value: 13, type: "Overdue" },
    { date: "2025-04-08", value: 90, type: "Picked up" },
    { date: "2025-04-08", value: 10, type: "Awaiting pickup" },
    { date: "2025-04-08", value: 3, type: "Overdue" },
    { date: "2025-04-09", value: 102, type: "Picked up" },
    { date: "2025-04-09", value: 40, type: "Awaiting pickup" },
    { date: "2025-04-09", value: 23, type: "Overdue" },
    { date: "2025-04-10", value: 99, type: "Picked up" },
    { date: "2025-04-10", value: 32, type: "Awaiting pickup" },
    { date: "2025-04-10", value: 12, type: "Overdue" },
    { date: "2025-04-11", value: 120, type: "Picked up" },
    { date: "2025-04-11", value: 20, type: "Awaiting pickup" },
    { date: "2025-04-11", value: 20, type: "Overdue" },
    { date: "2025-04-12", value: 90, type: "Picked up" },
    { date: "2025-04-12", value: 10, type: "Awaiting pickup" },
    { date: "2025-04-12", value: 2, type: "Overdue" },
  ];

  // Mock up Data for Table Overdue Parcel
  const dataTable: DataType[] = [
    {
      key: "1",
      room: "100/101",
      delivered: "23/06/2025",
      overdue: 5,
    },
    {
      key: "2",
      room: "100/102",
      delivered: "23/06/2025",
      overdue: 6,
    },
    {
      key: "3",
      room: "100/103",
      delivered: "23/06/2025",
      overdue: 7,
    },
    {
      key: "4",
      room: "100/104",
      delivered: "23/06/2025",
      overdue: 8,
    },
    {
      key: "5",
      room: "100/105",
      delivered: "23/06/2025",
      overdue: 2,
    },
  ];

  // Columns for Table
  const columns: any[] = [
    {
      title: "Room no.",
      dataIndex: "room",
      align: "center",
      key: "room",
    },
    {
      title: "Delivery on",
      dataIndex: "delivered",
      align: "center",
      key: "delivered",
    },
    {
      title: "Day overdue",
      dataIndex: "overdue",
      align: "center",
      key: "overdue",
      render: (overdue: number) => {
        return (
          <span style={{ color: overdue > 6 ? "red" : "default" }}>
            {overdue} days
          </span>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "overdue",
      key: "action",
      align: "center",
      width: 120, // กำหนดความกว้างที่เหมาะสม
      render: (overdue: number) => {
        return (
          <Button
            type="text"
            danger={overdue > 6}
            style={{
              border: "solid",
              borderColor: overdue > 6 ? "danger" : "#4a95ff",
            }}
          >
            {overdue > 6 ? "Return parcel" : "Send reminder"}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Header title="Parcel dashboard" />
      <Row gutter={[10, 10]} style={{ marginBottom: 24 }}>
        {dataStat?.map((item: dataType, index: number) => {
          return (
            <Col span={6} style={{ color: "#FBFBFB" }}>
              <StatCard
                title={item.title}
                value={item.value}
                icon={iconCard[index]}
                color={colorCard[index]}
              />
            </Col>
          );
        })}
      </Row>
      <div className="border-[0.5px] border-[#B2B2B2] w-full"></div>
      <Row style={{ marginTop: 24 }}>
        <Col span={12}>
          <RangePicker
            style={{ width: 300 }}
            picker="month"
            format={customFormat}
          />
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="text"
            size="middle"
            style={{ border: "solid", borderColor: "#4a95ff" }}
          >
            {/* <VerticalAlignBottomOutlined /> */}
            Export
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Pickup status" className="stat-card-shadow">
            {pickUpStatusData ? (
              <ParcelStatusChart data={pickUpStatusData} color={colorStatus} />
            ) : null}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Daily deliveries & pickups" className="stat-card-shadow">
            {DailyData ? (
              <ParcelDailyChart data={DailyData} color={colorStatus} />
            ) : null}
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            style={{ minHeight: 400 }}
            title="Overdue parcel"
            className="stat-card-shadow"
          >
            <Row>
              <Col span={24}>
                <Table
                  columns={columns}
                  dataSource={dataTable}
                  // pagination={PaginationConfig}
                  // loading={loading}
                  // onChange={onChangeTable}
                  size="small"
                  className="parcel-dashboard-table"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ParcelDashboard;
