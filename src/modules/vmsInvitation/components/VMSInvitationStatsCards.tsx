// ไฟล์: src/modules/vmsInvitation/components/VMSInvitationStatsCards.tsx - Simple Clean Version

import React from "react";
import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  RiseOutlined,
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
  // คำนวณสถิติตามข้อมูลจริงในตาราง
  const calculateStats = () => {
    const now = dayjs();

    const total = data.length;

    // Active = สถานะ Active ในตาราง
    const active = data.filter((item) => item.active === true).length;

    // รอเริ่มงาน = Active และ start_time ยังไม่ถึง
    const pending = data.filter((item) => {
      if (!item.active) return false;
      const startTime = dayjs(item.start_time);
      return startTime.isAfter(now);
    }).length;

    // ใกล้หมดอายุ = Active และ expire_time ผ่านไปแล้ว
    const expired = data.filter((item) => {
      if (!item.active) return false;
      const expireTime = dayjs(item.expire_time);
      return expireTime.isBefore(now);
    }).length;

    // หมดอายุ = Inactive
    const inactive = data.filter((item) => item.active === false).length;

    // กำลังใช้งาน = Active และอยู่ในช่วงเวลา
    const inProgress = data.filter((item) => {
      if (!item.active) return false;
      const startTime = dayjs(item.start_time);
      const expireTime = dayjs(item.expire_time);
      return startTime.isBefore(now) && expireTime.isAfter(now);
    }).length;

    return {
      total,
      active,
      pending,
      expired,
      inactive,
      inProgress,
    };
  };

  const stats = calculateStats();

  // การ์ดสถิติแบบเรียบง่าย
  const statsCards = [
    {
      title: "ทั้งหมด",
      value: stats.total,
      icon: <UserOutlined />,
      color: "#1890ff",
    },
    {
      title: "ใช้งานได้",
      value: stats.active,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "รอเริ่มงาน",
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
    },
    {
      title: "ใกล้หมดอายุ",
      value: stats.expired,
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "หมดอายุ",
      value: stats.inactive,
      icon: <StopOutlined />,
      color: "#8c8c8c",
    },
    {
      title: "ปิดใช้งาน",
      value: stats.inProgress,
      icon: <RiseOutlined />,
      color: "#722ed1",
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

export default VMSInvitationStatsCards;
