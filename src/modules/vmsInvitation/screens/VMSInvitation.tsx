import { useState, useEffect } from "react";
import { Button, Tag, Tooltip, message } from "antd";
import Header from "../../../components/templates/Header";
import InvitationTable from "../components/InvitationTable";
import VMSInvitationFormModal from "../components/VMSInvitationFormModal";
import VMSInvitationStatsCards from "../components/VMSInvitationStatsCards";
import VMSInvitationFilters from "../components/VMSInvitationFilters";
import QRCodeModal from "../../../components/common/QRCodeModal";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { InvitationRecord } from "../../../stores/interfaces/Invitation";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  StarOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useDeleteVMSInvitationMutation } from "../../../utils/mutationsGroup/vmsInvitationMutations";
import { useEStampVMSInvitationMutation } from "../../../utils/mutationsGroup/vmsInvitationEStampMutations";
import { callConfirmModal } from "../../../components/common/Modal";
import { vehicleMappingService } from "../../../utils/services/vehicleMappingService";
import axiosVMS from "../../../configs/axiosVMS";
import "../styles/vmsInvitation.css";

interface FilterValues {
  active?: boolean;
  type?: string;
  searchText?: string;
  stamped?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

const VMSInvitation = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage } = useSelector(
    (state: RootState) => state.invitation
  );

  // Mutations
  const deleteMutation = useDeleteVMSInvitationMutation();
  const eStampMutation = useEStampVMSInvitationMutation();

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<InvitationRecord | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<InvitationRecord | null>(null);
  const [vehicleLicensePlates, setVehicleLicensePlates] = useState<
    Map<string, string[]>
  >(new Map());
  const [filters, setFilters] = useState<FilterValues>({});

  // State สำหรับ house address mapping
  const [houseAddressMap, setHouseAddressMap] = useState<Map<string, string>>(
    new Map()
  );
  const [isLoadingHouseMapping, setIsLoadingHouseMapping] = useState(false);

  // State สำหรับ area name mapping
  const [areaNameMap, setAreaNameMap] = useState<Map<string, string>>(
    new Map()
  );
  const [isLoadingAreaMapping, setIsLoadingAreaMapping] = useState(false);

  // Pagination Options
  const pageSizeOptions = [10, 20, 40, 80, 100];
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: true,
    total: total,
  };

  // ฟังก์ชันโหลด area name mapping โดยตรงจาก VMS API
  const loadAreaNameMapping = async () => {
    if (isLoadingAreaMapping) return;

    setIsLoadingAreaMapping(true);
    try {
      console.log("🗺️ Loading area name mapping directly from VMS API...");

      let allAreas: any[] = [];
      let currentPage = 1;
      let hasMoreData = true;

      // ดึงข้อมูลทุกหน้าจนหมด
      while (hasMoreData) {
        console.log(`📄 Fetching areas page ${currentPage}...`);

        const response = await axiosVMS.get("/api/collections/area/records", {
          params: {
            page: currentPage,
            perPage: 500,
          },
        });

        if (response.data?.items && response.data.items.length > 0) {
          allAreas = [...allAreas, ...response.data.items];
          console.log(
            `✅ Page ${currentPage}: ${response.data.items.length} areas`
          );

          // ตรวจสอบว่ามีหน้าถัดไปหรือไม่
          const totalPages = response.data.totalPages || 1;
          hasMoreData = currentPage < totalPages;
          currentPage++;
        } else {
          hasMoreData = false;
        }
      }

      console.log(`📊 Total areas loaded: ${allAreas.length}`);

      // สร้าง mapping
      const mapping = new Map<string, string>();

      allAreas.forEach((area: any) => {
        mapping.set(area.id, area.name);
        console.log(`🗺️ Mapped: ${area.id} → ${area.name}`);
      });

      setAreaNameMap(mapping);
      console.log(`✅ Area name mapping created: ${mapping.size} entries`);

      // แสดงตัวอย่าง mapping
      console.log(
        "🗺️ Sample area mappings:",
        Array.from(mapping.entries()).slice(0, 5)
      );
    } catch (error) {
      console.error("❌ Error loading area name mapping:", error);
      message.error("Failed to load area name mapping");
    } finally {
      setIsLoadingAreaMapping(false);
    }
  };
  const loadHouseAddressMapping = async () => {
    if (isLoadingHouseMapping) return;

    setIsLoadingHouseMapping(true);
    try {
      console.log("🏠 Loading house address mapping directly from VMS API...");

      let allHouses: any[] = [];
      let currentPage = 1;
      let hasMoreData = true;

      // ดึงข้อมูลทุกหน้าจนหมด
      while (hasMoreData) {
        console.log(`📄 Fetching houses page ${currentPage}...`);

        const response = await axiosVMS.get("/api/collections/house/records", {
          params: {
            page: currentPage,
            perPage: 500,
          },
        });

        if (response.data?.items && response.data.items.length > 0) {
          allHouses = [...allHouses, ...response.data.items];
          console.log(
            `✅ Page ${currentPage}: ${response.data.items.length} houses`
          );

          // ตรวจสอบว่ามีหน้าถัดไปหรือไม่
          const totalPages = response.data.totalPages || 1;
          hasMoreData = currentPage < totalPages;
          currentPage++;
        } else {
          hasMoreData = false;
        }
      }

      console.log(`📊 Total houses loaded: ${allHouses.length}`);

      // สร้าง mapping
      const mapping = new Map<string, string>();

      allHouses.forEach((house: any) => {
        mapping.set(house.id, house.address);
        console.log(`🏠 Mapped: ${house.id} → ${house.address}`);
      });

      setHouseAddressMap(mapping);
      console.log(`✅ House address mapping created: ${mapping.size} entries`);

      // แสดงตัวอย่าง mapping
      console.log(
        "🏠 Sample mappings:",
        Array.from(mapping.entries()).slice(0, 5)
      );
    } catch (error) {
      console.error("❌ Error loading house address mapping:", error);
      message.error("Failed to load house address mapping");
    } finally {
      setIsLoadingHouseMapping(false);
    }
  };

  // โหลด house mapping และ area mapping เมื่อ component mount
  useEffect(() => {
    loadHouseAddressMapping();
    loadAreaNameMapping();
  }, []);

  // ฟังก์ชันสำหรับ get area name
  const getAreaName = (areaId: string): string => {
    if (!areaId) return "-";

    console.log(`🔍 Looking up area ID: ${areaId}`);
    console.log(`📋 Available area mappings: ${areaNameMap.size}`);

    // หาจาก mapping
    const areaName = areaNameMap.get(areaId);

    if (areaName) {
      console.log(`✅ Found area name: ${areaName}`);
      return areaName;
    } else {
      console.log(`❌ No area name found for ID: ${areaId}`);
      console.log(
        `🗂️ Available area IDs:`,
        Array.from(areaNameMap.keys()).slice(0, 5)
      );

      // ถ้าไม่เจอ area name ให้แสดง ID แบบย่อ
      return areaId.length > 10 ? `${areaId.substring(0, 8)}...` : areaId;
    }
  };
  const getHouseAddress = (houseId: string): string => {
    if (!houseId) return "-";

    console.log(`🔍 Looking up house ID: ${houseId}`);
    console.log(`📋 Available mappings: ${houseAddressMap.size}`);

    // หาจาก mapping
    const address = houseAddressMap.get(houseId);

    if (address) {
      console.log(`✅ Found address: ${address}`);
      return address;
    } else {
      console.log(`❌ No address found for ID: ${houseId}`);
      console.log(
        `🗂️ Available IDs:`,
        Array.from(houseAddressMap.keys()).slice(0, 5)
      );

      // ถ้าไม่เจอ address ให้แสดง ID แบบย่อ
      return houseId.length > 10 ? `${houseId.substring(0, 8)}...` : houseId;
    }
  };

  // แปลง vehicle IDs เป็น license plates
  useEffect(() => {
    const processVehicleMappings = async () => {
      if (!tableData || tableData.length === 0) return;

      console.log("🚗 Processing vehicle mappings...");

      try {
        await vehicleMappingService.refreshVehicleCache();
        const mappings = new Map<string, string[]>();

        for (const invitation of tableData) {
          if (invitation.vehicle_id && invitation.vehicle_id.length > 0) {
            const licensePlates: string[] = [];

            for (const vehicleId of invitation.vehicle_id) {
              try {
                const licensePlate =
                  await vehicleMappingService.getVehicleLicensePlate(vehicleId);
                licensePlates.push(licensePlate);
              } catch (error) {
                licensePlates.push(vehicleId);
              }
            }

            mappings.set(invitation.id, licensePlates);
          }
        }

        setVehicleLicensePlates(mappings);
      } catch (error) {
        console.error("❌ Error processing vehicle mappings:", error);
      }
    };

    processVehicleMappings();
  }, [tableData]);

  // Helper function to get license plates for display
  const getDisplayLicensePlates = (
    invitationId: string,
    vehicleIds: string[]
  ): string => {
    const mappedPlates = vehicleLicensePlates.get(invitationId);

    if (mappedPlates && mappedPlates.length > 0) {
      if (mappedPlates.length === 1) {
        return mappedPlates[0];
      } else if (mappedPlates.length <= 2) {
        return mappedPlates.join(", ");
      } else {
        return `${mappedPlates.slice(0, 2).join(", ")} +${
          mappedPlates.length - 2
        } more`;
      }
    }

    if (!vehicleIds || vehicleIds.length === 0) return "-";

    if (vehicleIds.length === 1) {
      return vehicleIds[0];
    } else if (vehicleIds.length <= 2) {
      return vehicleIds.join(", ");
    } else {
      return `${vehicleIds.slice(0, 2).join(", ")} +${
        vehicleIds.length - 2
      } more`;
    }
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

  const onEStamp = (record: InvitationRecord) => {
    // ตรวจสอบว่าประทับตราแล้วหรือยัง
    if (record.stamped_time) {
      message.warning("บัตรเชิญนี้ได้รับการประทับตราแล้ว");
      return;
    }

    callConfirmModal({
      title: "E-Stamp Invitation",
      message: `คุณต้องการประทับตราบัตรเชิญสำหรับ "${record.guest_name}" หรือไม่?`,
      okMessage: "ประทับตรา",
      cancelMessage: "ยกเลิก",
      onOk: async () => {
        try {
          await eStampMutation.mutateAsync(record.id);
          refetchData();
        } catch (error) {
          // Error handled by mutation
        }
      },
    });
  };

  const onDownloadQR = (record: InvitationRecord) => {
    // ตรวจสอบว่ามี code หรือไม่
    if (!record.code || !record.code.trim()) {
      message.error("ไม่พบรหัสบัตรเชิญสำหรับการสร้าง QR Code");
      return;
    }

    // แปลง authorized_area IDs เป็นชื่อ
    const authorizedAreaNames =
      record.authorized_area?.map((areaId) => getAreaName(areaId)) || [];

    // เพิ่มข้อมูลที่จำเป็นลงใน record
    const enhancedRecord = {
      ...record,
      house_address: getHouseAddress(record.house_id),
      vehicle_license_plates: vehicleLicensePlates.get(record.id) || [],
      authorized_area_names: authorizedAreaNames,
    };

    setSelectedInvitation(enhancedRecord);
    setIsQRModalOpen(true);
  };

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
    refetchData();
  };

  const refetchData = () => {
    setRerender(!rerender);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setEditData(null);
  };

  const handleQRModalClose = () => {
    setIsQRModalOpen(false);
    setSelectedInvitation(null);
  };

  // Check if invitation is stamped
  const isStamped = (record: InvitationRecord): boolean => {
    return !!(record.stamped_time && record.stamped_time.trim());
  };

  // Table Columns
  const columns: ColumnsType<InvitationRecord> = [
    {
      title: "Guest Name",
      key: "guest_name",
      dataIndex: "guest_name",
      width: "12%",
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
      width: "12%",
      render: (house_id) => {
        const address = getHouseAddress(house_id);
        const isOriginalId = address === house_id || address.includes("...");

        return (
          <Tooltip
            title={
              isOriginalId
                ? `House ID: ${house_id}`
                : `Address: ${address}\nHouse ID: ${house_id}`
            }
            placement="top">
            <div
              style={{
                fontWeight: isOriginalId ? "400" : "600",
                color: isOriginalId ? "#666" : "#1890ff",
                fontSize: isOriginalId ? "11px" : "13px",
                cursor: "pointer",
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
      title: "Vehicle License Plates",
      key: "vehicle_id",
      dataIndex: "vehicle_id",
      align: "center",
      width: "15%",
      render: (vehicle_ids, record) => {
        const displayText = getDisplayLicensePlates(record.id, vehicle_ids);
        const mappedPlates = vehicleLicensePlates.get(record.id);

        if (displayText === "-") {
          return <div style={{ fontSize: "12px", color: "#999" }}>-</div>;
        }

        return (
          <Tooltip
            title={
              mappedPlates && mappedPlates.length > 0
                ? `License Plates: ${mappedPlates.join(", ")}`
                : vehicle_ids && vehicle_ids.length > 0
                ? `Vehicle IDs: ${vehicle_ids.join(", ")}`
                : "No vehicles"
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
      width: "10%",
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
      width: "10%",
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
      title: "Stamped Time",
      key: "stamped_time",
      dataIndex: "stamped_time",
      align: "center",
      width: "10%",
      sorter: {
        compare: (a, b) => {
          if (!a.stamped_time && !b.stamped_time) return 0;
          if (!a.stamped_time) return 1;
          if (!b.stamped_time) return -1;
          return (
            dayjs(a.stamped_time).valueOf() - dayjs(b.stamped_time).valueOf()
          );
        },
      },
      render: (stamped_time) => {
        if (!stamped_time) {
          return <Tag color="orange">ยังไม่ประทับตรา</Tag>;
        }
        return (
          <div>
            <Tag color="green" style={{ marginBottom: "4px" }}>
              ประทับตราแล้ว
            </Tag>
            <div style={{ fontSize: "11px", color: "#666" }}>
              {dayjs(stamped_time).format("DD/MM/YYYY HH:mm")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Stamper",
      key: "stamper",
      dataIndex: "stamper",
      align: "center",
      width: "8%",
      render: (stamper) => (
        <div style={{ fontSize: "12px" }}>{stamper || "-"}</div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "15%",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1890ff" }} />}
            onClick={() => onEdit(record)}
            title="Edit invitation"
            size="small"
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => onDelete(record)}
            loading={
              deleteMutation.isPending && deleteMutation.variables === record.id
            }
            title="Delete invitation"
            size="small"
          />
          <Button
            type="text"
            icon={
              <StarOutlined
                style={{
                  color: isStamped(record) ? "#52c41a" : "#fa8c16",
                }}
              />
            }
            onClick={() => onEStamp(record)}
            loading={
              eStampMutation.isPending && eStampMutation.variables === record.id
            }
            title={isStamped(record) ? "Already stamped" : "E-stamp invitation"}
            disabled={isStamped(record)}
            size="small"
          />
          <Button
            type="text"
            icon={<QrcodeOutlined style={{ color: "#722ed1" }} />}
            onClick={() => onDownloadQR(record)}
            title="View QR Code"
            size="small"
            disabled={!record.code || !record.code.trim()}
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
      filters,
    });
  };

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.invitation.getInvitationList({
        page: currentPage,
        perPage: perPage,
        filters,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage, filters]);

  return (
    <>
      <div className="vms-invitation-header">
        <Header title="VMS Invitations" />
      </div>

      {/* Stats Cards */}
      <VMSInvitationStatsCards data={tableData} loading={loading} />

      {/* Filters */}
      <VMSInvitationFilters onFilter={handleFilter} loading={loading} />

      <div className="userManagementTopActionGroup">
        <div className="userManagementTopActionLeftGroup">
          {/* เอาปุ่ม refresh ออก */}
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
        loading={loading || isLoadingHouseMapping || isLoadingAreaMapping}
        onChangeTable={onChangeTable}
      />

      <VMSInvitationFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        editData={editData}
        refetch={refetchData}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={handleQRModalClose}
        invitation={selectedInvitation}
      />
    </>
  );
};

export default VMSInvitation;
