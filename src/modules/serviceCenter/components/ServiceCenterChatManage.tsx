import { Button, Empty, Tag } from "antd";
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

const serviceCenterChatManage = ({
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

  if (data) {
    return (
      <>
        <div className="sidebarContainer">
          <h2 className="headerDetail">Details</h2>
          <div className="detailContainer">
            <div className="detailItem">
              <h2 className="headerDetail">Problem: {data?.serviceTypeName}</h2>
              <p>Detail: {data?.description}</p>
              <p>
                Status:{" "}
                <Tag color={tagColorSelector(data?.statusName!)}>
                  {data?.statusName}
                </Tag>
              </p>
            </div>
          </div>
          <Button
            disabled={data.statusName === "Success" ? true : false}
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
  } else {
    <Empty />;
  }
  if (isLoading) {
    <p>loading.....</p>;
  }
};

export default serviceCenterChatManage;