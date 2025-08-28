import { useState, useEffect } from "react";
import {
  Tag,
  Tooltip,
  DatePicker,
  Select,
  Input,
  Space,
  Image,
  Button,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Header from "../../../components/templates/Header";
import VMSLogPassageTable from "../components/VMSLogPassageTable";
import VMSLogPassageStatsCards from "../components/VMSLogPassageStatsCards";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { LogPassageRecord } from "../../../stores/interfaces/LogPassage";
import { getProvinceName } from "../../../utils/constants/thaiProvinces";
import { houseMappingService } from "../../../utils/services/houseMappingService";
import "../styles/vmsLogPassage.css";

const { RangePicker } = DatePicker;
const { Search } = Input;

const VMSLogPassage = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage } = useSelector(
    (state: RootState) => state.logPassage
  );

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});
  const [houseAddressMap, setHouseAddressMap] = useState<Map<string, string>>(
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
  const getSuccessColor = (isSuccess: boolean): string => {
    return isSuccess ? "green" : "red";
  };

  const getTierColor = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case "external vehicle":
        return "red";
      case "staff":
        return "blue";
      case "resident":
        return "green";
      case "visitor":
        return "orange";
      default:
        return "default";
    }
  };

  const getRegionDisplayName = (region: string): string => {
    // ถ้าเป็นภาษาไทยอยู่แล้ว ใช้ตรงๆ
    if (region && /[\u0E00-\u0E7F]/.test(region)) {
      return region;
    }

    // ถ้าเป็นรหัส area code ให้แปลง
    const provinceName = getProvinceName(region);
    return provinceName !== region ? provinceName : region || "-";
  };

  const getHouseAddress = (houseId: string): string => {
    if (!houseId || houseId === "N/A") return "-";
    return houseAddressMap.get(houseId) || houseId;
  };

  // Functions
  const refetchData = () => {
    setRerender(!rerender);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    refetchData();
  };

  const handleImagePreview = (imageUrl: string, title: string) => {
    // สร้าง modal preview สำหรับดูรูป
    Image.PreviewGroup.preview({
      src: imageUrl,
      // title: title,
    });
  };

  // Table Columns
  const columns: ColumnsType<LogPassageRecord> = [
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
        <div
          style={{
            fontWeight: "600",
            color: "#000",
          }}>
          {license_plate || "-"}
        </div>
      ),
    },
    {
      title: "Success",
      key: "isSuccess",
      dataIndex: "isSuccess",
      align: "center",
      width: "8%",
      render: (isSuccess) => (
        <Tag color={getSuccessColor(isSuccess)} style={{ fontSize: "11px" }}>
          {isSuccess ? "ผ่าน" : "ไม่ผ่าน"}
        </Tag>
      ),
    },
    {
      title: "Tier",
      key: "tier",
      dataIndex: "tier",
      align: "center",
      width: "12%",
      render: (tier) => (
        <Tag color={getTierColor(tier)} style={{ fontSize: "11px" }}>
          {tier || "-"}
        </Tag>
      ),
    },
    {
      title: "Region",
      key: "region",
      dataIndex: "region",
      align: "center",
      width: "12%",
      render: (region) => {
        const displayName = getRegionDisplayName(region);

        return (
          <Tooltip title={`Region: ${displayName}`} placement="top">
            <Tag color="blue" style={{ fontSize: "11px", maxWidth: "100px" }}>
              {displayName}
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

        if (!house_id || house_id === "N/A") return "-";

        return (
          <Tooltip
            title={`Address: ${address}\nHouse ID: ${house_id}`}
            placement="top">
            <div>
              {address}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Images",
      key: "images",
      align: "center",
      width: "8%",
      render: (_, record) => (
        <Space>
          {record.lp_snapshot && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                handleImagePreview(record.lp_snapshot, "License Plate")
              }
              title="View License Plate Image"
            />
          )}
          {record.full_snapshot && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                handleImagePreview(record.full_snapshot, "Full Snapshot")
              }
              title="View Full Image"
            />
          )}
        </Space>
      ),
    },
    {
      title: "Note",
      key: "note",
      dataIndex: "note",
      align: "center",
      width: "15%",
      render: (note) => {
        if (!note) return "-";

        const displayText =
          note.length > 30 ? `${note.substring(0, 30)}...` : note;

        return (
          <Tooltip title={note} placement="top">
            <div
              style={{
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
      width: "16%",
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
  const onChangeTable: TableProps<LogPassageRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    const page = pagination?.current || currentPage;
    const pageSize = pagination?.pageSize || perPage;

    await dispatch.logPassage.getLogPassageList({
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

  const handleSuccessFilter = (value: boolean) => {
    if (value !== undefined) {
      handleFiltersChange({ ...filters, isSuccess: value });
    } else {
      const { isSuccess, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleTierFilter = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, tier: value });
    } else {
      const { tier, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleRegionFilter = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, region: value });
    } else {
      const { region, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  const handleLicensePlateSearch = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, license_plate: value });
    } else {
      const { license_plate, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  // Load mapping data
  useEffect(() => {
    const loadMappingData = async () => {
      try {
        console.log("🗺️ Loading house mapping data for passage logs...");

        // Load house mappings
        await houseMappingService.refreshHouseCache();
        const houseMappings = houseMappingService.getAllAddressMappings();
        setHouseAddressMap(houseMappings);

        console.log(
          `✅ House mappings loaded: ${houseMappings.size} addresses`
        );
      } catch (error) {
        console.error("❌ Error loading house mapping data:", error);
      }
    };

    loadMappingData();
  }, []);

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.logPassage.getLogPassageList({
        page: currentPage,
        perPage: perPage,
        filters,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage]);

  return (
    <>
      <div className="vms-log-passage-header">
        <Header title="VMS Passage Logs" />
      </div>

      {/* Stats Cards */}
      <VMSLogPassageStatsCards data={tableData} loading={loading} />

      {/* Filters */}
      <div className="vms-log-filters-container">
        <Space size="middle" wrap>
          <RangePicker
            placeholder={["Start Date", "End Date"]}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            size="large"
            style={{ minWidth: 280 }}
          />

          <Search
            placeholder="Search License Plate"
            allowClear
            size="large"
            onSearch={handleLicensePlateSearch}
            style={{ minWidth: 220 }}
          />

          <Select
            placeholder="Filter by Success"
            allowClear
            size="large"
            onChange={handleSuccessFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: true, label: "ผ่าน" },
              { value: false, label: "ไม่ผ่าน" },
            ]}
          />

          <Select
            placeholder="Filter by Tier"
            allowClear
            size="large"
            onChange={handleTierFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: "external vehicle", label: "External Vehicle" },
              { value: "staff", label: "Staff" },
              { value: "resident", label: "Resident" },
              { value: "visitor", label: "Visitor" },
            ]}
          />

          <Select
            placeholder="Filter by Region"
            allowClear
            size="large"
            onChange={handleRegionFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: "กรุงเทพมหานคร", label: "กรุงเทพมหานคร" },
              { value: "สมุทรปราการ", label: "สมุทรปราการ" },
              { value: "นนทบุรี", label: "นนทบุรี" },
              { value: "ปทุมธานี", label: "ปทุมธานี" },
            ]}
          />
        </Space>
      </div>

      <VMSLogPassageTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onChangeTable={onChangeTable}
      />
    </>
  );
};

export default VMSLogPassage;
