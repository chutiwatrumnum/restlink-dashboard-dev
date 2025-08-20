import { useState, useEffect } from "react";
import { Button, Tag, Tooltip } from "antd";
import Header from "../../../components/templates/Header";
import VMSVehicleTable from "../components/VMSVehicleTable";
import VMSVehicleFormModal from "../components/VMSVehicleFormModal";
import VMSVehicleStatsCards from "../components/VMSVehicleStatsCards";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { VehicleRecord } from "../../../stores/interfaces/Vehicle";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useDeleteVMSVehicleMutation } from "../../../utils/mutationsGroup/vmsVehicleMutations";
import { callConfirmModal } from "../../../components/common/Modal";
import { houseMappingService } from "../../../utils/services/houseMappingService";
import { areaMappingService } from "../../../utils/services/areaMappingService";
import { getProvinceName } from "../../../utils/constants/thaiProvinces";
import "../styles/vmsVehicle.css";

const VMSVehicle = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage } = useSelector(
    (state: RootState) => state.vehicle
  );

  // Mutations
  const deleteMutation = useDeleteVMSVehicleMutation();

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<VehicleRecord | null>(null);
  const [houseAddressMap, setHouseAddressMap] = useState<Map<string, string>>(
    new Map()
  );
  const [areaNameMap, setAreaNameMap] = useState<Map<string, string>>(
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

  // Load mapping data
  useEffect(() => {
    const loadMappingData = async () => {
      try {
        console.log("🗺️ Loading mapping data for vehicles...");

        // Load house mappings
        await houseMappingService.refreshHouseCache();
        const houseMappings = houseMappingService.getAllAddressMappings();
        setHouseAddressMap(houseMappings);

        // Load area mappings
        await areaMappingService.refreshAreaCache();
        const areaMappings = areaMappingService.getAllMappings();
        setAreaNameMap(areaMappings);

        console.log(
          `✅ Mappings loaded: ${houseMappings.size} houses, ${areaMappings.size} areas`
        );
      } catch (error) {
        console.error("❌ Error loading mapping data:", error);
      }
    };

    loadMappingData();
  }, []);

  // Helper functions
  const getHouseAddress = (houseId: string): string => {
    if (!houseId) return "-";
    return houseAddressMap.get(houseId) || houseId;
  };

  const getAreaNames = (areaIds: string[]): string => {
    if (!areaIds || areaIds.length === 0) return "-";

    const areaNames = areaIds.map(
      (areaId) => areaNameMap.get(areaId) || areaId
    );

    if (areaNames.length <= 2) {
      return areaNames.join(", ");
    } else {
      return `${areaNames.slice(0, 2).join(", ")} +${
        areaNames.length - 2
      } more`;
    }
  };

  const getProvinceDisplayName = (areaCode: string): string => {
    if (!areaCode) return "-";
    return getProvinceName(areaCode);
  };

  const isVehicleExpired = (expireTime: string): boolean => {
    return dayjs(expireTime).isBefore(dayjs());
  };

  const getTierColor = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case "staff":
        return "blue";
      case "resident":
        return "green";
      case "invited visitor":
        return "orange";
      default:
        return "default";
    }
  };

  // Functions
  const onCreate = () => {
    setEditData(null);
    setIsFormModalOpen(true);
  };

  const onEdit = (record: VehicleRecord) => {
    setEditData(record);
    setIsFormModalOpen(true);
  };

  const onDelete = (record: VehicleRecord) => {
    callConfirmModal({
      title: "Delete Vehicle",
      message: `Are you sure you want to delete vehicle "${record.license_plate}"?`,
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
  const columns: ColumnsType<VehicleRecord> = [
    {
      title: "License Plate",
      key: "license_plate",
      dataIndex: "license_plate",
      width: "12%",
      align: "center",
      sorter: {
        compare: (a, b) =>
          (a.license_plate || "").localeCompare(b.license_plate || ""),
      },
      render: (license_plate) => (
        <div style={{ fontWeight: "600", color: "#1890ff" }}>
          {license_plate || "-"}
        </div>
      ),
    },
    {
      title: "จังหวัด",
      key: "area_code",
      dataIndex: "area_code",
      align: "center",
      width: "12%",
      render: (area_code) => {
        const provinceName = getProvinceDisplayName(area_code);
        const isOriginalCode = provinceName === area_code;

        return (
          <Tooltip
            title={`จังหวัด: ${provinceName}\nรหัส: ${area_code || "th-11"}`}
            placement="top">
            <Tag
              color={isOriginalCode ? "default" : "blue"}
              className="province-tag-table"
              style={{
                fontSize: "11px",
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}>
              {provinceName}
            </Tag>
          </Tooltip>
        );
      },
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
          <Tooltip
            title={`Address: ${address}\nHouse ID: ${house_id}`}
            placement="top">
            <div
              style={{
                fontWeight: isOriginalId ? "400" : "600",
                color: isOriginalId ? "#666" : "#1890ff",
                fontSize: isOriginalId ? "11px" : "13px",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {address}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Authorized Areas",
      key: "authorized_area",
      dataIndex: "authorized_area",
      align: "center",
      width: "18%",
      render: (authorized_area) => {
        const displayText = getAreaNames(authorized_area);

        return (
          <Tooltip
            title={
              authorized_area && authorized_area.length > 0
                ? `Areas: ${authorized_area
                    .map((id) => areaNameMap.get(id) || id)
                    .join(", ")}`
                : "No authorized areas"
            }
            placement="top">
            <div
              style={{
                fontSize: "12px",
                color: "#1890ff",
                fontWeight: "500",
              }}>
              {displayText}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Tier",
      key: "tier",
      dataIndex: "tier",
      align: "center",
      width: "10%",
      render: (tier) => (
        <Tag color={getTierColor(tier)} style={{ fontSize: "11px" }}>
          {tier || "-"}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "expire_time",
      dataIndex: "expire_time",
      align: "center",
      width: "8%",
      render: (expire_time) => {
        const expired = isVehicleExpired(expire_time);
        return (
          <Tag color={expired ? "red" : "green"}>
            {expired ? "Expired" : "Active"}
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
      render: (start_time) => (
        <div>
          {start_time ? dayjs(start_time).format("DD/MM/YYYY HH:mm") : "-"}
        </div>
      ),
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
        const expired = isVehicleExpired(expire_time);
        return (
          <div style={{ color: expired ? "#ff4d4f" : "inherit" }}>
            {expire_time ? dayjs(expire_time).format("DD/MM/YYYY HH:mm") : "-"}
          </div>
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
            title="Edit vehicle"
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => onDelete(record)}
            loading={
              deleteMutation.isPending && deleteMutation.variables === record.id
            }
            title="Delete vehicle"
          />
        </div>
      ),
    },
  ];

  // Table change handler
  const onChangeTable: TableProps<VehicleRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    const page = pagination?.current || currentPage;
    const pageSize = pagination?.pageSize || perPage;

    await dispatch.vehicle.getVehicleList({
      page,
      perPage: pageSize,
    });
  };

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.vehicle.getVehicleList({
        page: currentPage,
        perPage: perPage,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage]);

  return (
    <>
      <div className="vms-vehicle-header">
        <Header title="VMS Vehicles" />
      </div>

      {/* Stats Cards */}
      <VMSVehicleStatsCards data={tableData} loading={loading} />

      <div className="userManagementTopActionGroup">
        <div className="userManagementTopActionLeftGroup">
          {/* Search and filters can be added here */}
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

      <VMSVehicleTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onChangeTable={onChangeTable}
      />

      <VMSVehicleFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        editData={editData}
        refetch={refetchData}
      />
    </>
  );
};

export default VMSVehicle;
