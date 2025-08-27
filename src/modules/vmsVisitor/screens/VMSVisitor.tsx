import { useState, useEffect } from "react";
import {
  Tag,
  Tooltip,
  DatePicker,
  Select,
  Input,
  Space,
  Avatar,
  Image,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import Header from "../../../components/templates/Header";
import VMSVisitorTable from "../components/VMSVisitorTable";
import VMSVisitorStatsCards from "../components/VMSVisitorStatsCards";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { VMSVisitorRecord } from "../../../stores/interfaces/VMSVisitor";
import { houseMappingService } from "../../../utils/services/houseMappingService";
import { areaMappingService } from "../../../utils/services/areaMappingService";
import "../styles/vmsVisitor.css";

const { RangePicker } = DatePicker;
const { Search } = Input;

const VMSVisitor = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage } = useSelector(
    (state: RootState) => state.vmsVisitor
  );
  const { vmsUrl } = useSelector((state: RootState) => state.userAuth);

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});
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

  // Helper functions
  const getGenderColor = (gender: string): string => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "blue";
      case "female":
        return "pink";
      default:
        return "default";
    }
  };

  const getStampedColor = (stamped: boolean): string => {
    return stamped ? "green" : "orange";
  };

  const getHouseAddress = (houseId: string): string => {
    if (!houseId || houseId === "N/A") return "-";
    return houseAddressMap.get(houseId) || houseId;
  };

  const getAreaName = (areaId: string): string => {
    if (!areaId || areaId === "N/A") return "-";
    return areaNameMap.get(areaId) || areaId;
  };

  // Helper function สำหรับสร้าง URL รูปภาพ
  const getIDCardImageUrl = (
    record: VMSVisitorRecord,
    thumbSize?: string
  ): string | null => {
    if (!record.id_card || !vmsUrl) return null;

    // สมมติว่า id_card field เป็นชื่อไฟล์รูป (เช่น "id_card_123.jpg")
    // ปรับตาม structure ที่แท้จริงของ API
    const baseUrl = `${vmsUrl}/api/files/visitor/${record.id}/${record.id_card}`;

    if (thumbSize) {
      return `${baseUrl}?thumb=${thumbSize}`;
    }

    return baseUrl;
  };

  // Functions
  const refetchData = () => {
    setRerender(!rerender);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    refetchData();
  };

  // Table Columns
  const columns: ColumnsType<VMSVisitorRecord> = [
    {
      title: "ID Card",
      key: "id_card_image",
      width: "10%",
      align: "center",
      render: (_, record) => {
        const imageUrl = getIDCardImageUrl(record, "80x80");
        const fullImageUrl = getIDCardImageUrl(record);

        if (imageUrl && fullImageUrl) {
          return (
            <div className="visitor-photo-container">
              <Image
                width={60}
                height={60}
                src={imageUrl}
                fallback="/default-id-card.png" // รูป fallback เมื่อโหลดไม่ได้
                placeholder={
                  <Avatar
                    size={60}
                    icon={<UserOutlined />}
                    className="visitor-avatar-default"
                  />
                }
                preview={{
                  src: fullImageUrl,
                  mask: <div className="visitor-photo-preview">View</div>,
                }}
                style={{
                  borderRadius: "8px",
                  border: "2px solid #f0f0f0",
                  objectFit: "cover",
                }}
                className="visitor-avatar"
              />
            </div>
          );
        }

        return (
          <Avatar
            size={60}
            icon={<UserOutlined />}
            className="visitor-avatar-default"
          />
        );
      },
    },
    {
      title: "Full Name",
      key: "full_name",
      width: "15%",
      align: "left",
      render: (_, record) => (
        <div
          style={{
            fontWeight: "600",
            color: "#1890ff",
          }}>
          {`${record.first_name} ${record.last_name}`.trim() || "-"}
        </div>
      ),
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: "gender",
      align: "center",
      width: "8%",
      render: (gender) => (
        <Tag color={getGenderColor(gender)} style={{ fontSize: "11px" }}>
          {gender === "male" ? "Male" : gender === "female" ? "Female" : gender}
        </Tag>
      ),
    },
    // {
    //   title: "ID Card No.",
    //   key: "id_card_number",
    //   width: "12%",
    //   align: "center",
    //   render: (_, record) => {
    //     // ถ้า id_card เป็นรูป ให้แสดงเฉพาะเลขบัตร (ถ้ามี field แยก)
    //     // หรือแสดงข้อความว่ามีรูป ID Card
    //     const idCardNumber = record.id_card_number || record.id_card;

    //     if (idCardNumber && !idCardNumber.includes(".")) {
    //       // ถ้าเป็นเลขบัตร (ไม่ใช่ชื่อไฟล์)
    //       return (
    //         <div
    //           style={{
    //             fontFamily: "monospace",
    //             fontSize: "12px",
    //             color: "#666",
    //           }}>
    //           {idCardNumber}
    //         </div>
    //       );
    //     }

    //     // ถ้าเป็นไฟล์รูป
    //     if (getIDCardImageUrl(record)) {
    //       return (
    //         <Tag color="blue" style={{ fontSize: "10px" }}>
    //           Image Available
    //         </Tag>
    //       );
    //     }

    //     return "-";
    //   },
    // },
    {
      title: "House Address",
      key: "house_id",
      dataIndex: "house_id",
      align: "center",
      width: "15%",
      render: (house_id) => {
        const address = getHouseAddress(house_id);
        const isOriginalId = address === house_id;

        if (!house_id || house_id === "N/A") return "-";

        return (
          <Tooltip
            title={`Address: ${address}\nHouse ID: ${house_id}`}
            placement="top">
            <div
              style={{
                fontSize: isOriginalId ? "11px" : "12px",
                color: isOriginalId ? "#666" : "#1890ff",
                fontWeight: isOriginalId ? "400" : "600",
                fontFamily: isOriginalId ? "monospace" : "inherit",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
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
      width: "15%",
      render: (authorized_area) => {
        if (!authorized_area || authorized_area.length === 0) return "-";

        const areaNames = authorized_area.map((areaId: string) =>
          getAreaName(areaId)
        );

        if (areaNames.length === 1) {
          return (
            <Tag color="blue" style={{ fontSize: "11px" }}>
              {areaNames[0]}
            </Tag>
          );
        }

        return (
          <Tooltip
            title={
              <div>
                <strong>Authorized Areas:</strong>
                <ul style={{ marginLeft: 16, marginBottom: 0 }}>
                  {areaNames.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            }
            placement="top">
            <Tag color="blue" style={{ fontSize: "11px", cursor: "pointer" }}>
              {areaNames[0]} +{areaNames.length - 1}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Stamped",
      key: "stamped",
      align: "center",
      width: "8%",
      render: (_, record) => {
        const isStamped = record.stamped_time && record.stamped_time.trim();
        return (
          <Tag
            color={getStampedColor(!!isStamped)}
            style={{ fontSize: "11px" }}>
            {isStamped ? "Yes" : "No"}
          </Tag>
        );
      },
    },
    // {
    //   title: "Code",
    //   key: "code",
    //   dataIndex: "code",
    //   align: "center",
    //   width: "12%",
    //   render: (code) => {
    //     if (!code) return "-";

    //     const displayCode =
    //       code.length > 12 ? `${code.substring(0, 12)}...` : code;

    //     return (
    //       <Tooltip title={code} placement="top">
    //         <div
    //           style={{
    //             fontFamily: "monospace",
    //             fontSize: "11px",
    //             color: "#666",
    //             maxWidth: "100px",
    //             overflow: "hidden",
    //             textOverflow: "ellipsis",
    //             whiteSpace: "nowrap",
    //             cursor: "pointer",
    //           }}>
    //           {displayCode}
    //         </div>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: "Note",
      key: "note",
      dataIndex: "note",
      align: "center",
      width: "12%",
      render: (note) => {
        if (!note) return "-";

        const displayText =
          note.length > 30 ? `${note.substring(0, 30)}...` : note;

        return (
          <Tooltip title={note} placement="top">
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {displayText}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Created Time",
      key: "created",
      dataIndex: "created",
      align: "center",
      width: "12%",
      sorter: {
        compare: (a, b) =>
          dayjs(a.created).valueOf() - dayjs(b.created).valueOf(),
      },
      render: (created) => (
        <div>
          {created ? dayjs(created).format("DD/MM/YYYY HH:mm:ss") : "-"}
        </div>
      ),
    },
  ];

  // Table change handler
  const onChangeTable: TableProps<VMSVisitorRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    const page = pagination?.current || currentPage;
    const pageSize = pagination?.pageSize || perPage;

    await dispatch.vmsVisitor.getVMSVisitorList({
      page,
      perPage: pageSize,
      filters,
    });
  };

  // Filter handlers
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      handleFiltersChange({
        ...filters,
        dateRange: {
          start: dates[0].format("YYYY-MM-DD"),
          end: dates[1].format("YYYY-MM-DD"),
        },
      });
    } else {
      const { dateRange, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleGenderFilter = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, gender: value });
    } else {
      const { gender, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleStampedFilter = (value: boolean) => {
    if (value !== undefined) {
      handleFiltersChange({ ...filters, stamped: value });
    } else {
      const { stamped, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleNameSearch = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, name: value });
    } else {
      const { name, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  // Load mapping data
  useEffect(() => {
    const loadMappingData = async () => {
      try {
        console.log("🗺️ Loading mapping data for visitors...");

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

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.vmsVisitor.getVMSVisitorList({
        page: currentPage,
        perPage: perPage,
        filters,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage]);

  return (
    <>
      <div className="vms-visitor-header">
        <Header title="VMS Visitors" />
      </div>

      {/* Stats Cards */}
      <VMSVisitorStatsCards data={tableData} loading={loading} />

      {/* Filters */}
      <div className="vms-visitor-filters-container">
        <Space size="middle" wrap>
          <RangePicker
            placeholder={["Start Date", "End Date"]}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            size="large"
            style={{ minWidth: 280 }}
          />

          <Search
            placeholder="Search Name"
            allowClear
            size="large"
            onSearch={handleNameSearch}
            style={{ minWidth: 220 }}
          />

          <Select
            placeholder="Filter by Gender"
            allowClear
            size="large"
            onChange={handleGenderFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />

          <Select
            placeholder="Filter by Stamped"
            allowClear
            size="large"
            onChange={handleStampedFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: true, label: "Stamped" },
              { value: false, label: "Not Stamped" },
            ]}
          />
        </Space>
      </div>

      <VMSVisitorTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onChangeTable={onChangeTable}
      />
    </>
  );
};

export default VMSVisitor;
