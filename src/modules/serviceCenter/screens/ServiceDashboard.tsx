import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
} from "@ant-design/icons";
import ServiceCenterChart from '../components/seviceCenterchart'
import { useServiceCenterServiceChartQuery } from '../hooks/index'
import { StatCardProps } from "../../../stores/interfaces/ServiceCenter";
import dayjs from "dayjs";
const { Title } = Typography;
import Header from "../../../components/templates/Header";
import {
  ServiceCenterPending,
  ServiceCenterTotal,
  ServiceCenterRepairing,
} from "../../../assets/icons/Icons";
const colorCard:string[]=[
  '#1890ff',
  '#ff4d4f',
  '#faad14',
  '#52c41a'
]
const iconCard: React.ReactNode[] = [
  <ServiceCenterTotal />,
  <ServiceCenterPending />,
  <ServiceCenterRepairing/>,
  <CheckCircleOutlined style={{ fontSize: 24 }} />,
];
const colorPieChartStatusMonth:string[]=[
  '#c50001' ,'#feb009','#00a526'
]
const colorPieChartStatusType:string[]=[
  '#047480','#e9a136','#8eb80e','#f23754','#32c7cd','#c97bfa','#ffdc61'
]
const ServiceDashboard = () => {
    // default automatic select month and year
  const { data } = useServiceCenterServiceChartQuery({
    startMonth: dayjs().format("YYYY-MM"),
    endMonth: dayjs().format("YYYY-MM"),
  });

  const [dateRange, setDateRange] = useState(null);

  const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <Card className="stat-card-shadow">
      <Row align="middle" justify="space-between">
        <Col>
          <Statistic
            title={title}
            value={value}
            valueStyle={{ fontSize: "2em" }}
          />
        </Col>
        <Col>
          <div
            style={{
              backgroundColor: color,
              padding: "16px",
              borderRadius: "8px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            {icon}
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <>
      <Header title="Service Center Lists" />
      <div style={{minHeight: "100vh" }}>
        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {data?.cardStatus?.length! > 0
            ? data?.cardStatus.map((item: StatCardProps, index: number) => {
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
              })
            : null}
        </Row>

        {/* Filter Section */}
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            Fixing Management Month:
          </Title>
          {/* <Space size="middle">
          <RangePicker
            picker="month"
            style={{ width: 400 }}
            onChange={(dates) => {
              setDateRange(dates);
            }}
          />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">All</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{ backgroundColor: "#135200" }}>
            Export
          </Button>
        </Space> */}
        </div>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{marginBottom:20}}>
          <Col span={12}>
            <Card title="Monthly service status" className="stat-card-shadow">
              {/* <div
              style={{
                height: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Title level={5} type="secondary">
                Please integrate with your preferred charting library
              </Title>
            </div> */}
              {data?.cardStatusByMonth ? (
                <ServiceCenterChart
                  data={data?.cardStatusByMonth}
                  color={colorPieChartStatusMonth}
                />
              ) : null}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Monthly service type" className="stat-card-shadow">
              {/* <div
              style={{
                height: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Title level={5} type="secondary">
                Please integrate with your preferred charting library
              </Title>
            </div> */}
              {data?.serviceType ? (
                <ServiceCenterChart
                  color={colorPieChartStatusType}
                  data={data?.serviceType}
                />
              ) : null}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ServiceDashboard;
