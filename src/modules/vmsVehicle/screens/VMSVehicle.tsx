import { useState, useEffect, useMemo } from "react";
import { usePermission } from "../../../utils/hooks/usePermission";
import { Button, Tag, Tooltip } from "antd";
import Header from "../../../components/templates/Header";
import VMSVehicleTable from "../components/VMSVehicleTable";
import VMSVehicleFormModal from "../components/VMSVehicleFormModal";
import VMSVehicleStatsCards from "../components/VMSVehicleStatsCards";
import VMSVehicleFilterBar from "../components/VMSVehicleFilterBar";
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

interface VMSVehicleFilters {
  searchText?: string;
  vehicleType?: string;
  vehicleColor?: string;
  tier?: string;
  province?: string;
  status?: string;
  dateRange?: any;
}

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
  // เพิ่ม state สำหรับ filters
  const [filters, setFilters] = useState<VMSVehicleFilters>({});

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

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

  // Filter data based on filters
  const filteredData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];

    let filtered = [...tableData];

    // Search by license plate or note
    if (filters.searchText && filters.searchText.trim()) {
      const searchTerm = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.license_plate?.toLowerCase().includes(searchTerm) ||
          item.note?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by vehicle type
    if (filters.vehicleType) {
      filtered = filtered.filter(
        (item) => item.vehicle_type === filters.vehicleType
      );
    }

    // Filter by vehicle color
    if (filters.vehicleColor) {
      filtered = filtered.filter(
        (item) => item.vehicle_color === filters.vehicleColor
      );
    }

    // Filter by tier
    if (filters.tier) {
      filtered = filtered.filter((item) => item.tier === filters.tier);
    }

    // Filter by province
    if (filters.province) {
      filtered = filtered.filter((item) => item.area_code === filters.province);
    }

    // Filter by status
    if (filters.status) {
      const now = dayjs();
      if (filters.status === "active") {
        filtered = filtered.filter((item) =>
          dayjs(item.expire_time).isAfter(now)
        );
      } else if (filters.status === "expired") {
        filtered = filtered.filter((item) =>
          dayjs(item.expire_time).isBefore(now)
        );
      }
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((item) => {
        const itemDate = dayjs(item.start_time);
        return (
          itemDate.isAfter(startDate.startOf("day")) &&
          itemDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    return filtered;
  }, [tableData, filters]);

  // Update pagination config for filtered data
  const filteredPaginationConfig = {
    ...PaginationConfig,
    total: filteredData.length,
  };

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

  // เพิ่มฟังก์ชันสำหรับ vehicle type และ color
  const getVehicleTypeColor = (vehicleType: string): string => {
    switch (vehicleType?.toLowerCase()) {
      case "motorcycle":
        return "orange";
      case "car":
        return "blue";
      default:
        return "default";
    }
  };

  const getVehicleTypeLabel = (vehicleType: string): string => {
    switch (vehicleType?.toLowerCase()) {
      case "motorcycle":
        return "🏍️ มอเตอร์ไซค์";
      case "car":
        return "🚗 รถยนต์";
      default:
        return vehicleType || "-";
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

  // Handle filters change
  const handleFiltersChange = (newFilters: VMSVehicleFilters) => {
    console.log("🔍 Filters changed:", newFilters);
    setFilters(newFilters);
  };

  // Table Columns (same as before)
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
    // เพิ่มคอลัมน์ Vehicle Type
    {
      title: "Vehicle Type",
      key: "vehicle_type",
      dataIndex: "vehicle_type",
      align: "center",
      width: "10%",
      render: (vehicle_type) => (
        <Tag
          color={getVehicleTypeColor(vehicle_type)}
          style={{ fontSize: "11px" }}>
          {getVehicleTypeLabel(vehicle_type)}
        </Tag>
      ),
      filters: [
        { text: "🚗 รถยนต์", value: "car" },
        { text: "🏍️ มอเตอร์ไซค์", value: "motorcycle" },
      ],
      onFilter: (value: any, record) => record.vehicle_type === value,
    },
    // เพิ่มคอลัมน์ Vehicle Color
    {
      title: "Color",
      key: "vehicle_color",
      dataIndex: "vehicle_color",
      align: "center",
      width: "8%",
      render: (vehicle_color) => {
        if (!vehicle_color) return "-";

        const colorMap: Record<
          string,
          { bg: string; text: string; label: string }
        > = {
          white: { bg: "#ffffff", text: "#000000", label: "ขาว" },
          black: { bg: "#000000", text: "#ffffff", label: "ดำ" },
          silver: { bg: "#c0c0c0", text: "#000000", label: "เงิน" },
          gray: { bg: "#808080", text: "#ffffff", label: "เทา" },
          red: { bg: "#ff0000", text: "#ffffff", label: "แดง" },
          blue: { bg: "#0000ff", text: "#ffffff", label: "น้ำเงิน" },
          green: { bg: "#008000", text: "#ffffff", label: "เขียว" },
          yellow: { bg: "#ffff00", text: "#000000", label: "เหลือง" },
          orange: { bg: "#ffa500", text: "#000000", label: "ส้ม" },
          purple: { bg: "#800080", text: "#ffffff", label: "ม่วง" },
          brown: { bg: "#a52a2a", text: "#ffffff", label: "น้ำตาล" },
          gold: { bg: "#ffd700", text: "#000000", label: "ทอง" },
          other: { bg: "#f0f0f0", text: "#000000", label: "อื่นๆ" },
        };

        const colorInfo = colorMap[vehicle_color] || colorMap.other;

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
            }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: colorInfo.bg,
                border:
                  vehicle_color === "white" ? "1px solid #d9d9d9" : "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            />
            <span style={{ fontSize: "11px", color: "#666" }}>
              {colorInfo.label}
            </span>
          </div>
        );
      },
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
            disabled={!access("vms", "edit")}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => onDelete(record)}
            loading={
              deleteMutation.isPending && deleteMutation.variables === record.id
            }
            title="Delete vehicle"
            disabled={!access("vms", "delete")}
          />
        </div>
      ),
    },
  ];

  // Table change handler - ใช้ filtered data
  const onChangeTable: TableProps<VehicleRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    // สำหรับ client-side filtering ไม่ต้องเรียก API ใหม่
    console.log("Table pagination changed:", pagination);
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

      {/* Stats Cards - ใช้ filtered data */}
      <VMSVehicleStatsCards data={filteredData} loading={loading} />

      {/* Filter Bar */}
      <VMSVehicleFilterBar
        onFiltersChange={handleFiltersChange}
        loading={loading}
        data={tableData}
      />

      <div className="userManagementTopActionGroup">
        <div className="userManagementTopActionLeftGroup">
          {/* แสดงจำนวนผลลัพธ์ที่กรองแล้ว */}
          {Object.keys(filters).length > 0 && (
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
              <span>
                Showing {filteredData.length} of {tableData.length} vehicles
              </span>
              {filteredData.length !== tableData.length && (
                <Tag color="blue" style={{ fontSize: "11px" }}>
                  Filtered
                </Tag>
              )}
            </div>
          )}
        </div>
        <div className="userManagementTopActionRightGroup">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            className="userManagementExportBtn"
            disabled={!access("vms", "create")}>
            Add New
          </Button>
        </div>
      </div>

      {/* ใช้ filtered data แทน tableData */}
      <VMSVehicleTable
        columns={columns}
        data={filteredData}
        PaginationConfig={filteredPaginationConfig}
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
