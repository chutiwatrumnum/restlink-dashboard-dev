// File: src/modules/vmsVisitor/components/VMSVisitorStatsCards.tsx

import React from "react";
import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  StarOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { VMSVisitorRecord } from "../../../stores/interfaces/VMSVisitor";
import dayjs from "dayjs";

interface VMSVisitorStatsCardsProps {
  data: VMSVisitorRecord[];
  loading?: boolean;
}

const VMSVisitorStatsCards: React.FC<VMSVisitorStatsCardsProps> = ({
  data,
  loading = false,
}) => {
  const calculateStats = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const total = data.length;

    // Count by gender
    const male = data.filter((item) => item.gender === "male").length;
    const female = data.filter((item) => item.gender === "female").length;

    // Count stamped/unstamped
    const stamped = data.filter(
      (item) => item.stamped_time && item.stamped_time.trim()
    ).length;
    const unstamped = data.filter(
      (item) => !item.stamped_time || !item.stamped_time.trim()
    ).length;

    // Today's records
    const todayRecords = data.filter(
      (item) => dayjs(item.created).format("YYYY-MM-DD") === today
    ).length;

    // Count by house (top house)
    const houseStats = data.reduce((acc, item) => {
      if (item.house_id) {
        acc[item.house_id] = (acc[item.house_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topHouse = Object.entries(houseStats).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      total,
      male,
      female,
      stamped,
      unstamped,
      todayRecords,
      topHouse,
    };
  };

  const stats = calculateStats();

  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: <UserOutlined />,
      color: "#1890ff",
    },
    {
      title: "Male",
      value: stats.male,
      icon: <ManOutlined />,
      color: "#52c41a",
    },
    {
      title: "Female",
      value: stats.female,
      icon: <WomanOutlined />,
      color: "#eb2f96",
    },
    {
      title: "Today",
      value: stats.todayRecords,
      icon: <CalendarOutlined />,
      color: "#722ed1",
    },
    {
      title: "Stamped",
      value: stats.stamped,
      icon: <StarOutlined />,
      color: "#13c2c2",
    },
    {
      title: "Not Stamped",
      value: stats.unstamped,
      icon: <FileProtectOutlined />,
      color: "#fa541c",
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

export default VMSVisitorStatsCards;