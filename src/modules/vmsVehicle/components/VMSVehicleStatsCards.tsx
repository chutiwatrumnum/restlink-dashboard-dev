// File: src/modules/vmsVehicle/components/VMSVehicleStatsCards.tsx - English Version

import React from "react";
import { Card, Row, Col } from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { VehicleRecord } from "../../../stores/interfaces/Vehicle";
import dayjs from "dayjs";
import { getProvinceName } from "../../../utils/constants/thaiProvinces";

interface VMSVehicleStatsCardsProps {
  data: VehicleRecord[];
  loading?: boolean;
}

const calculateProvinceStats = (data: VehicleRecord[]) => {
  const provinceStats: Record<string, number> = {};

  data.forEach((vehicle) => {
    const provinceName = getProvinceName(vehicle.area_code || "th-11");
    provinceStats[provinceName] = (provinceStats[provinceName] || 0) + 1;
  });

  // Sort by highest count
  const sortedProvinces = Object.entries(provinceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Take top 5 provinces

  return sortedProvinces;
};

const VMSVehicleStatsCards: React.FC<VMSVehicleStatsCardsProps> = ({
  data,
  loading = false,
}) => {
  const calculateStats = () => {
    const now = dayjs();
    const total = data.length;

    // Active vehicles (not expired)
    const active = data.filter((item) => {
      const expireTime = dayjs(item.expire_time);
      return expireTime.isAfter(now);
    }).length;

    // Expired vehicles
    const expired = data.filter((item) => {
      const expireTime = dayjs(item.expire_time);
      return expireTime.isBefore(now);
    }).length;

    // By tier
    const staff = data.filter((item) => item.tier === "staff").length;
    const resident = data.filter((item) => item.tier === "resident").length;
    const visitor = data.filter(
      (item) => item.tier === "invited visitor"
    ).length;

    return {
      total,
      active,
      expired,
      staff,
      resident,
      visitor,
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
      title: "Active",
      value: stats.active,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: <StopOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Staff",
      value: stats.staff,
      icon: <UserOutlined />,
      color: "#1890ff",
    },
    {
      title: "Resident",
      value: stats.resident,
      icon: <UserOutlined />,
      color: "#52c41a",
    },
    {
      title: "Visitor",
      value: stats.visitor,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
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

export default VMSVehicleStatsCards;
