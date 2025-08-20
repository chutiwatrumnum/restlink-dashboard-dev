// ไฟล์: src/modules/vmsInvitation/components/VMSConnectionStatus.tsx

import React, { useState, useEffect } from "react";
import { Button, Tag, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import axiosVMS from "../../../configs/axiosVMS";

const VMSConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [responseInfo, setResponseInfo] = useState<any>(null);
  const { vmsUrl, vmsToken, roleName } = useSelector(
    (state: RootState) => state.userAuth
  );

  const testConnection = async () => {
    setTesting(true);
    setResponseInfo(null);

    try {
      console.log("🧪 Testing VMS connection...");
      console.log("🔗 VMS URL:", vmsUrl);
      console.log("🔑 VMS Token exists:", !!vmsToken);

      // ทดสอบการเชื่อมต่อด้วยการเรียก API endpoint
      const response = await axiosVMS.get(
        "/api/collections/invitation/records",
        {
          params: { page: 1, perPage: 1 },
        }
      );

      console.log("✅ VMS Connection successful");
      console.log("📊 Response info:", {
        status: response.status,
        totalItems: response.data?.totalItems,
        totalPages: response.data?.totalPages,
        hasItems: response.data?.items?.length > 0,
      });

      setIsConnected(true);
      setResponseInfo({
        status: response.status,
        totalItems: response.data?.totalItems || 0,
        totalPages: response.data?.totalPages || 0,
        hasItems: response.data?.items?.length > 0,
      });
    } catch (error: any) {
      console.error("❌ VMS Connection failed:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      setIsConnected(false);
      setResponseInfo({
        error: error.response?.status || "Connection Error",
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // ทดสอบการเชื่อมต่อทันทีเมื่อ component mount
    if (vmsUrl && vmsToken) {
      testConnection();
    }
  }, [vmsUrl, vmsToken]);

  if (!vmsUrl || !vmsToken) {
    return (
      <div className="vms-status-indicator">
        <Tag color="red">VMS Not Configured</Tag>
        <small style={{ color: "#999" }}>Missing VMS URL or Token</small>
      </div>
    );
  }

  return (
    <div className="vms-status-indicator">
      <Tooltip
        title={
          <div>
            <div>
              <strong>VMS URL:</strong> {vmsUrl}
            </div>
            <div>
              <strong>Token:</strong> {vmsToken ? "••••••••" : "None"}
            </div>
            {responseInfo && (
              <div style={{ marginTop: 8 }}>
                {responseInfo.error ? (
                  <>
                    <div>
                      <strong>Error:</strong> {responseInfo.error}
                    </div>
                    <div>
                      <strong>Message:</strong> {responseInfo.message}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>Total Items:</strong> {responseInfo.totalItems}
                    </div>
                    <div>
                      <strong>Total Pages:</strong> {responseInfo.totalPages}
                    </div>
                    <div>
                      <strong>Has Data:</strong>{" "}
                      {responseInfo.hasItems ? "Yes" : "No"}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        }>
        <Tag
          color={
            isConnected === true
              ? "green"
              : isConnected === false
              ? "red"
              : "orange"
          }>
          {isConnected === true
            ? "✅ VMS Connected"
            : isConnected === false
            ? "❌ VMS Disconnected"
            : "⏳ VMS Status Unknown"}
        </Tag>
      </Tooltip>

      {roleName && <Tag color="blue">Role: {roleName}</Tag>}

      {responseInfo && !responseInfo.error && (
        <Tag color="cyan">Items: {responseInfo.totalItems}</Tag>
      )}

      <Button
        size="small"
        onClick={testConnection}
        loading={testing}
        type="link"
        style={{ padding: 0, height: "auto" }}>
        Test
      </Button>
    </div>
  );
};

export default VMSConnectionStatus;
