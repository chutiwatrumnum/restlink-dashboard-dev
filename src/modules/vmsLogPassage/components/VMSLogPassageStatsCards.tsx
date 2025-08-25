import React from "react";
import { Card, Row, Col } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  CalendarOutlined,
  PercentageOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { LogPassageRecord } from "../../../stores/interfaces/LogPassage";
import dayjs from "dayjs";

interface VMSLogPassageStatsCardsProps {
  data: LogPassageRecord[];
  loading?: boolean;
}

const VMSLogPassageStatsCards: React.FC<VMSLogPassageStatsCardsProps> = ({
  data,
  loading = false,
}) => {
  const calculateStats = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const total = data.length;

    // Success vs Failed
    const success = data.filter((item) => item.isSuccess === true).length;
    const failed = total - success;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : "0";

    // Today's records
    const todayRecords = data.filter(
      (item) => dayjs(item.created).format("YYYY-MM-DD") === today
    ).length;

    // By tier
    const tierStats = data.reduce((acc, item) => {
      acc[item.tier] = (acc[item.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // By region (top regions)
    const regionStats = data.reduce((acc, item) => {
      if (item.region) {
        acc[item.region] = (acc[item.region] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topRegion = Object.entries(regionStats).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      total,
      success,
      failed,
      successRate,
      todayRecords,
      tierStats,
      regionStats,
      topRegion,
    };
  };

  const stats = calculateStats();

  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: <CarOutlined />,
      color: "#1890ff",
    },
    {
      title: "Allowed",
      value: stats.success,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Denied",
      value: stats.failed,
      icon: <CloseCircleOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Pass Rate",
      value: `${stats.successRate}%`,
      icon: <PercentageOutlined />,
      color: "#faad14",
    },
    {
      title: "Today",
      value: stats.todayRecords,
      icon: <CalendarOutlined />,
      color: "#722ed1",
    },
    {
      title: "External Vehicle",
      value: stats.tierStats["external vehicle"] || 0,
      icon: <EnvironmentOutlined />,
      color: "#eb2f96",
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {statsCards.map((card, index) => (
          <Col xs={12} sm={8} md={6} lg={4} key={index}>
            <Card
              loading={loading}
              bordered={false}
              style={{
                background: "#ffffff",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "16px 20px" }}
              hoverable>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: card.color,
                      lineHeight: 1.2,
                      marginBottom: 4,
                    }}>
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      fontWeight: 400,
                    }}>
                    {card.title}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: card.color,
                    opacity: 0.7,
                  }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default VMSLogPassageStatsCards;
