// File: src/modules/vmsInvitation/components/VMSInvitationStatsCards.tsx - Updated with English Labels

import React from "react";
import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  RiseOutlined,
  StarOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { InvitationRecord } from "../../../stores/interfaces/Invitation";
import dayjs from "dayjs";

interface VMSInvitationStatsCardsProps {
  data: InvitationRecord[];
  loading?: boolean;
}

const VMSInvitationStatsCards: React.FC<VMSInvitationStatsCardsProps> = ({
  data,
  loading = false,
}) => {
  // Calculate statistics based on actual table data
  const calculateStats = () => {
    const now = dayjs();

    const total = data.length;

    // Active = Active status in table
    const active = data.filter((item) => item.active === true).length;

    // Pending = Active and start_time not yet reached
    const pending = data.filter((item) => {
      if (!item.active) return false;
      const startTime = dayjs(item.start_time);
      return startTime.isAfter(now);
    }).length;

    // Near expiry = Active and expire_time has passed
    const expired = data.filter((item) => {
      if (!item.active) return false;
      const expireTime = dayjs(item.expire_time);
      return expireTime.isBefore(now);
    }).length;

    // Expired = Inactive
    const inactive = data.filter((item) => item.active === false).length;

    // In use = Active and within time range
    const inProgress = data.filter((item) => {
      if (!item.active) return false;
      const startTime = dayjs(item.start_time);
      const expireTime = dayjs(item.expire_time);
      return startTime.isBefore(now) && expireTime.isAfter(now);
    }).length;

    // Stamp statistics
    const stamped = data.filter(
      (item) => item.stamped_time && item.stamped_time.trim()
    ).length;
    const unstamped = data.filter(
      (item) => !item.stamped_time || !item.stamped_time.trim()
    ).length;

    return {
      total,
      active,
      pending,
      expired,
      inactive,
      inProgress,
      stamped,
      unstamped,
    };
  };

  const stats = calculateStats();

  // Simple stats cards - added stamp data
  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: <UserOutlined />,
      color: "#1890ff",
    },
    {
      title: "Active",
      value: stats.active,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
    },
    {
      title: "Near Expiry",
      value: stats.expired,
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Expired",
      value: stats.inactive,
      icon: <StopOutlined />,
      color: "#8c8c8c",
    },
    {
      title: "In Use",
      value: stats.inProgress,
      icon: <RiseOutlined />,
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
          <Col xs={12} sm={8} md={6} lg={3} key={index}>
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

export default VMSInvitationStatsCards;
