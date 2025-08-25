// File: src/modules/vmsLogAccess/components/VMSLogAccessStatsCards.tsx - English Version

import React from "react";
import { Card, Row, Col } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  CalendarOutlined,
  PercentageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { LogAccessRecord } from "../../../stores/interfaces/LogAccess";
import dayjs from "dayjs";

interface VMSLogAccessStatsCardsProps {
  data: LogAccessRecord[];
  loading?: boolean;
}

const VMSLogAccessStatsCards: React.FC<VMSLogAccessStatsCardsProps> = ({
  data,
  loading = false,
}) => {
  const calculateStats = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const total = data.length;

    // Success vs Failed
    const success = data.filter((item) => item.result === "success").length;
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

    // By gate state
    const gateStateStats = data.reduce((acc, item) => {
      acc[item.gate_state] = (acc[item.gate_state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      success,
      failed,
      successRate,
      todayRecords,
      tierStats,
      gateStateStats,
    };
  };

  const stats = calculateStats();

  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: <DashboardOutlined />,
      color: "#1890ff",
    },
    {
      title: "Success",
      value: stats.success,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: <CloseCircleOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Success Rate",
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
      title: "Fast-pass",
      value: stats.tierStats["fast-pass"] || 0,
      icon: <UserOutlined />,
      color: "#13c2c2",
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

export default VMSLogAccessStatsCards;
