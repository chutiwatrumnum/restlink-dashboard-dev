// ไฟล์: src/modules/vmsInvitation/screens/VMSInvitation.tsx - Improved Vehicle Display

import { useState, useEffect } from "react";
import { Button, Tag, Tooltip } from "antd";
import Header from "../../../components/templates/Header";
import InvitationTable from "../components/InvitationTable";
import VMSConnectionStatus from "../components/VMSConnectionStatus";
import VMSInvitationFormModal from "../components/VMSInvitationFormModal";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { InvitationRecord } from "../../../stores/interfaces/Invitation";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useDeleteVMSInvitationMutation } from "../../../utils/mutationsGroup/vmsInvitationMutations";
import { callConfirmModal } from "../../../components/common/Modal";
import { vmsMappingService } from "../../../utils/services/vmsMappingService";
import "../styles/vmsInvitation.css";

const VMSInvitation = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage, houseMapping } =
    useSelector((state: RootState) => state.invitation);

  // Mutations
  const deleteMutation = useDeleteVMSInvitationMutation();

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<InvitationRecord | null>(null);
  const [vehicleMapping, setVehicleMapping] = useState<Map<string, string>>(
    new Map()
  );

  // Pagination Options
  const pageSizeOptions = [10, 20, 40, 80, 100];
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: true,
    total: total,
  };

  // Function to get house address from mapping
  const getHouseAddress = (houseId: string): string => {
    if (!houseId) return "-";
    return houseMapping?.get(houseId) || houseId;
  };

  // Improved function to get vehicle license plates
  const getVehicleLicensePlates = (vehicleIds: string[]): string => {
    if (!vehicleIds || vehicleIds.length === 0) return "-";

    // ถ้า vehicleIds เป็น license plates แล้ว (จากการแปลงใน model)
    // ให้แสดงตรงๆ
    const licensePlates = vehicleIds.filter(Boolean);

    if (licensePlates.length === 0) return "-";
    if (licensePlates.length === 1) return licensePlates[0];
    if (licensePlates.length <= 2) return licensePlates.join(", ");

    return `${licensePlates.slice(0, 2).join(", ")} +${
      licensePlates.length - 2
    } more`;
  };

  // Functions
  const onCreate = () => {
    setEditData(null);
    setIsFormModalOpen(true);
  };

  const onEdit = (record: InvitationRecord) => {
    setEditData(record);
    setIsFormModalOpen(true);
  };

  const onDelete = (record: InvitationRecord) => {
    callConfirmModal({
      title: "Delete Invitation",
      message: `Are you sure you want to delete invitation for "${record.guest_name}"?`,
      okMessage: "Yes, Delete",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.id);
          refetchData();
        } catch (error) {
          // Error handled by mutation
        }
      },
    });
  };

  const refetchData = () => {
    setRerender(!rerender);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setEditData(null);
  };

  // Table Columns
  const columns: ColumnsType<InvitationRecord> = [
    {
      title: "Guest Name",
      key: "guest_name",
      dataIndex: "guest_name",
      width: "15%",
      align: "center",
      sorter: {
        compare: (a, b) =>
          (a.guest_name || "").localeCompare(b.guest_name || ""),
      },
      render: (guest_name) => <div>{guest_name || "-"}</div>,
    },
    {
      title: "House Address",
      key: "house_id",
      dataIndex: "house_id",
      align: "center",
      width: "15%",
      render: (house_id) => {
        const address = getHouseAddress(house_id);
        const isOriginalId = address === house_id;

        return (
          <Tooltip title={`House ID: ${house_id}`} placement="top">
            <div
              style={{
                fontWeight: isOriginalId ? "400" : "500",
                color: isOriginalId ? "#666" : "#1890ff",
                fontSize: isOriginalId ? "11px" : "13px",
              }}>
              {address}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Vehicle License Plates",
      key: "vehicle_id",
      dataIndex: "vehicle_id",
      align: "center",
      width: "18%",
      render: (vehicle_ids) => {
        const licensePlates = getVehicleLicensePlates(vehicle_ids);

        return (
          <Tooltip
            title={
              vehicle_ids && vehicle_ids.length > 0
                ? `License Plates: ${vehicle_ids.join(", ")}`
                : "No vehicles"
            }
            placement="top">
            <div
              style={{
                fontSize: "12px",
                color: licensePlates === "-" ? "#999" : "#1890ff",
                fontWeight: licensePlates === "-" ? "400" : "500",
              }}>
              {licensePlates}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
      align: "center",
      width: "8%",
      render: (type) => <div>{type || "-"}</div>,
    },
    {
      title: "Status",
      key: "active",
      dataIndex: "active",
      align: "center",
      width: "8%",
      render: (active) => {
        return (
          <Tag color={active ? "green" : "red"}>
            {active ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Start Time",
      key: "start_time",
      dataIndex: "start_time",
      align: "center",
      width: "12%",
      sorter: {
        compare: (a, b) =>
          dayjs(a.start_time).valueOf() - dayjs(b.start_time).valueOf(),
      },
      render: (start_time) => {
        return (
          <div>
            {start_time ? dayjs(start_time).format("DD/MM/YYYY HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      title: "Expire Time",
      key: "expire_time",
      dataIndex: "expire_time",
      align: "center",
      width: "12%",
      sorter: {
        compare: (a, b) =>
          dayjs(a.expire_time).valueOf() - dayjs(b.expire_time).valueOf(),
      },
      render: (expire_time) => {
        const isExpired = expire_time && dayjs(expire_time).isBefore(dayjs());
        return (
          <div style={{ color: isExpired ? "#ff4d4f" : "inherit" }}>
            {expire_time ? dayjs(expire_time).format("DD/MM/YYYY HH:mm") : "-"}
          </div>
        );
      },
    },
    {
      title: "Created",
      key: "created",
      dataIndex: "created",
      align: "center",
      width: "10%",
      render: (created) => {
        return (
          <div>{created ? dayjs(created).format("DD/MM/YYYY HH:mm") : "-"}</div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => onEdit(record)}
            title="Edit invitation"
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => onDelete(record)}
            loading={
              deleteMutation.isPending && deleteMutation.variables === record.id
            }
            title="Delete invitation"
          />
        </div>
      ),
    },
  ];

  // Functions
  const onChangeTable: TableProps<InvitationRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    const page = pagination?.current || currentPage;
    const pageSize = pagination?.pageSize || perPage;

    await dispatch.invitation.getInvitationList({
      page,
      perPage: pageSize,
    });
  };

  // Load mapping data when component mounts
  useEffect(() => {
    const loadMappingData = async () => {
      try {
        const currentHouseData = dispatch.getState().house.tableData;
        if (!currentHouseData || currentHouseData.length === 0) {
          await dispatch.house.getHouseList({ page: 1, perPage: 500 });
        }

        const currentAreaData = dispatch.getState().area.tableData;
        if (!currentAreaData || currentAreaData.length === 0) {
          await dispatch.area.getAreaList({ page: 1, perPage: 500 });
        }

        const currentVehicleData = dispatch.getState().vehicle.tableData;
        if (!currentVehicleData || currentVehicleData.length === 0) {
          await dispatch.vehicle.getVehicleList({ page: 1, perPage: 500 });
        }

        if (!houseMapping || houseMapping.size === 0) {
          await dispatch.invitation.refreshHouseMapping();
        }
      } catch (error) {
        // Error handled by individual dispatches
      }
    };

    loadMappingData();
  }, [dispatch, houseMapping]);

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.invitation.getInvitationList({
        page: currentPage,
        perPage: perPage,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage]);

  return (
    <>
      <div className="vms-invitation-header">
        <Header title="VMS Invitations" />
        <VMSConnectionStatus />
      </div>

      <div className="userManagementTopActionGroup">
        <div className="userManagementTopActionLeftGroup">
          <div style={{ color: "#666", fontSize: "14px" }}>
            Items: {total} | House Mapping: {houseMapping?.size || 0} addresses
            loaded
          </div>
        </div>
        <div className="userManagementTopActionRightGroup">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            className="userManagementExportBtn">
            Add New
          </Button>
        </div>
      </div>

      <InvitationTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onChangeTable={onChangeTable}
      />

      <VMSInvitationFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        editData={editData}
        refetch={refetchData}
      />
    </>
  );
};

export default VMSInvitation;
