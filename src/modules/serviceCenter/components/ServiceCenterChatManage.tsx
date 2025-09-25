import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

import { Button, Empty, Tag, Image } from "antd";
import { ServiceChatListDataType } from "../../../stores/interfaces/Service";
import {
  useServiceCenterByServiceIDQuery,
  useServiceCenterStatusTypeQuery,
} from "../hooks";
import { useEffect, useState, useCallback } from "react";
import ServiceCenterEditModal from "./ServiceCenterEditModal";
import {
  ServiceCenterDataType,
  ServiceCenterSelectListType,
} from "../../../stores/interfaces/ServiceCenter";
import fallbackImg from "../../../assets/images/noImg.jpeg";

const tagColorSelector = (status: string) => {
  switch (status) {
    case "Pending":
      return "red";
    case "Waiting for confirmation":
      return "orange";
    case "Confirm appointment":
      return "blue";
    case "Repairing":
      return "red";
    case "Success":
      return "green";
    case "Closed":
      return "gray";
    default:
      return "default";
  }
};

const ServiceCenterChatManage = ({
  chatData,
}: {
  chatData?: ServiceChatListDataType;
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ServiceCenterDataType | null>(null);
  const [
    ServiceCenterStatusSelectionList,
    setServiceCenterStatusSelectionList,
  ] = useState<ServiceCenterSelectListType[]>([]);
  const [refresh, setRefresh] = useState(false);

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const { data: selectList } = useServiceCenterStatusTypeQuery();
  const {
    data,
    isLoading,
    refetch: refetchServiceCenter,
  } = useServiceCenterByServiceIDQuery(chatData?.serviceId!);

  const onEditCancel = useCallback(() => {
    setIsEditModalOpen(false);
    setEditData(null);
    refetchServiceCenter();
  }, [refetchServiceCenter]);

  const onEditOk = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefresh(!refresh);
  }, [refresh]);

  const onEdit = () => {
    console.log("🔍 [ServiceCenterChatManage] Starting onEdit...");
    console.log("📋 [ServiceCenterChatManage] Raw data:", data);

    // ✅ เพิ่ม validation
    if (!data) {
      console.error("❌ No data available for editing");
      return;
    }

    // ✅ สร้าง data object พร้อม validation และ Boolean conversion
    const editData: ServiceCenterDataType = {
      ...data,
      // ใช้ Boolean constructor เพื่อให้แน่ใจว่าเป็น boolean
      requestCloseCase: Boolean(data.requestCloseCase),
      requestNewAppointment: Boolean(data.requestNewAppointment),
      requestReSchedule: Boolean(data.requestReSchedule), // ✅ เปลี่ยนจาก requestReschedule
    };

    // ✅ เพิ่ม logging เพื่อ debug
    console.log("🔍 [ServiceCenterChatManage] Validated editData:", {
      id: editData.id,
      statusName: editData.statusName,
      requestCloseCase: editData.requestCloseCase,
      requestNewAppointment: editData.requestNewAppointment,
      requestReSchedule: editData.requestReSchedule,
      types: {
        requestCloseCase: typeof editData.requestCloseCase,
        requestNewAppointment: typeof editData.requestNewAppointment,
        requestReSchedule: typeof editData.requestReSchedule,
      },
    });

    // ✅ เพิ่มการตรวจสอบค่าที่ไม่คาดคิด
    if (
      editData.requestReSchedule === null ||
      editData.requestReSchedule === undefined
    ) {
      console.warn("⚠️ requestReSchedule is null/undefined, setting to false");
      editData.requestReSchedule = false;
    }

    switch (editData.statusName) {
      case "Pending":
        const dataRepair = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Pending"
        );
        editData.statusId = Number(dataRepair?.value);
        const result = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Success"
        );

        setServiceCenterStatusSelectionList(result ? result : []);
        break;
      case "Repairing":
        const dataSuccess = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Repairing"
        );
        editData.statusId = Number(dataSuccess?.value);
        const resultRepairing = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Pending"
        );
        setServiceCenterStatusSelectionList(
          resultRepairing ? resultRepairing : []
        );
        break;
      default:
        break;
    }

    console.log("📋 [ServiceCenterChatManage] Final editData:", {
      id: editData.id,
      requestCloseCase: editData.requestCloseCase,
      requestNewAppointment: editData.requestNewAppointment,
      requestReSchedule: editData.requestReSchedule,
    });

    setEditData(editData);
    setIsEditModalOpen(true);
  };

  // Get the primary image to display
  const getPrimaryImage = () => {
    if (!data?.imageItems || data.imageItems.length === 0) {
      return null;
    }

    // Try to get the first available image, prioritizing by status
    const pendingImages = data.imageItems.filter(
      (item) =>
        item.imageStatus?.nameEn === "Pending" || item.imageStatusId === 1
    );

    const repairingImages = data.imageItems.filter(
      (item) =>
        item.imageStatus?.nameEn === "Repairing" || item.imageStatusId === 2
    );

    const successImages = data.imageItems.filter(
      (item) =>
        item.imageStatus?.nameEn === "Success" || item.imageStatusId === 3
    );

    // Return the first image from available categories
    if (pendingImages.length > 0) return pendingImages[0];
    if (repairingImages.length > 0) return repairingImages[0];
    if (successImages.length > 0) return successImages[0];

    // Fallback to any image
    return data.imageItems[0];
  };

  const primaryImage = getPrimaryImage();

  if (isLoading) {
    return (
      <div className="sidebarContainer">
        <h2 className="headerDetail">Loading...</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sidebarContainer">
        <Empty description="No service selected" />
      </div>
    );
  }

  return (
    <>
      <div className="sidebarContainer">
        <h2 className="headerDetail">Details</h2>

        {/* Enhanced image display section */}
        {primaryImage && (
          <div
            style={{
              marginBottom: 16,
              textAlign: "center",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}>
            <Image
              width={150}
              height={150}
              style={{
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
              src={primaryImage.imageUrl}
              fallback={fallbackImg}
              preview={{
                mask: "Click to preview",
              }}
              placeholder={
                <div
                  style={{
                    width: 150,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    color: "#999",
                  }}>
                  Loading...
                </div>
              }
            />
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "4px",
              }}>
              {primaryImage.imageStatus?.nameEn || "Service Image"}
              {data.imageItems &&
                data.imageItems.length > 1 &&
                ` (${data.imageItems.length} images)`}
            </div>
          </div>
        )}

        {/* Service details */}
        <div className="detailContainer">
          <div className="detailItem">
            <h2 className="headerDetail">
              Problem: {data?.serviceTypeName || "Unknown Service"}
            </h2>
            <p>
              <strong>Detail:</strong>{" "}
              {data?.description || "No description available"}
            </p>
            <p>
              <strong>Room:</strong> {data?.roomAddress || "N/A"}
            </p>
            <p>
              <strong>Reporter:</strong>{" "}
              {data?.createdBy
                ? `${
                    data.createdBy.givenName ||
                    data.createdBy.firstName ||
                    "Unknown"
                  } ${
                    data.createdBy.familyName ||
                    data.createdBy.lastName ||
                    "User"
                  }`.trim()
                : data?.fullname || "Unknown User"}
            </p>
            {data?.tel && (
              <p>
                <strong>Tel:</strong> {data.tel}
              </p>
            )}
            <p>
              <strong>Status:</strong>{" "}
              <Tag color={tagColorSelector(data?.statusName!)}>
                {data?.statusName || "Unknown"}
              </Tag>
            </p>

            {/* Additional image info */}
            {data?.imageItems && data.imageItems.length > 0 && (
              <div
                style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                <p>
                  <strong>Images:</strong> {data.imageItems.length} total
                </p>
                {data.imageItems.map((img, index) => (
                  <div key={img.id || index} style={{ marginLeft: "8px" }}>
                    • {img.imageStatus?.nameEn || "Unknown status"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          disabled={
            data.statusName === "Success" || !access("fixing_report", "edit")
          }
          onClick={() => onEdit()}
          size="large"
          shape="round">
          <b>Manage</b>
        </Button>
      </div>

      <ServiceCenterEditModal
        selectList={
          ServiceCenterStatusSelectionList
            ? ServiceCenterStatusSelectionList
            : []
        }
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        data={editData}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ServiceCenterChatManage;
