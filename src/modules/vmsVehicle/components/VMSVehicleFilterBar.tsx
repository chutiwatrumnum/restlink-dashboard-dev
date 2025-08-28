import React from "react";
import { Row, Col, Select, Input, DatePicker, Button } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getProvinceOptions } from "../../../utils/constants/thaiProvinces";
import { VEHICLE_TYPE_OPTIONS } from "../../../stores/interfaces/Vehicle";
import {
  getVehicleBrandOptions,
  getVehicleColorOptions,
} from "../../../utils/constants/thaiVehicleOptions";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface FilterValues {
  vehicleType?: string;
  vehicleBrand?: string; // เพิ่มใหม่
  vehicleColor?: string; // เปลี่ยนจาก tier เป็น vehicleColor
  province?: string;
  status?: string;
  searchText?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

interface VMSVehicleFiltersProps {
  onFilter: (filters: FilterValues) => void;
  loading?: boolean;
}

// Status Options
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
];

// Tier Options
const TIER_OPTIONS = [
  { label: "Staff", value: "staff" },
  { label: "Resident", value: "resident" },
  { label: "Invited Visitor", value: "invited visitor" },
];

const VMSVehicleFilters: React.FC<VMSVehicleFiltersProps> = ({
  onFilter,
  loading = false,
}) => {
  const [filters, setFilters] = React.useState<FilterValues>({});
  const [searchInput, setSearchInput] = React.useState<string>("");

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    const newFilters = { ...filters, searchText: searchInput };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setSearchInput("");
    onFilter(clearedFilters);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    handleFilterChange("dateRange", dates);
  };

  // Get options
  const provinceOptions = getProvinceOptions();
  const brandOptions = getVehicleBrandOptions();
  const colorOptions = getVehicleColorOptions();

  return (
    <div className="vms-vehicle-filters" style={{ marginBottom: 24 }}>
      <Row gutter={[12, 16]} align="middle">
        {" "}
        {/* ลด gutter */}
        {/* Date Range Filter */}
        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
          <RangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={["Start Date", "End Date"]}
            disabled={loading}
            className="modern-date-picker"
            suffixIcon={<CalendarOutlined className="date-picker-icon" />}
            style={{ width: "100%" }}
          />
        </Col>
        {/* Search Input */}
        <Col xs={24} sm={12} md={6} lg={4} xl={3}>
          <div className="filter-search-wrapper">
            <Input
              className="modern-search-input"
              placeholder="Search License Plate or Note"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              suffix={
                <Button
                  type="text"
                  icon={<SearchOutlined className="search-suffix-icon" />}
                  onClick={handleSearch}
                  disabled={loading}
                  className="search-suffix-button"
                />
              }
            />
            <SearchOutlined className="search-prefix-icon" />
          </div>
        </Col>
        {/* Vehicle Type Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Vehicle Type"
            value={filters.vehicleType}
            onChange={(value) => handleFilterChange("vehicleType", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={VEHICLE_TYPE_OPTIONS}
            style={{ width: "100%" }}
          />
        </Col>
        {/* Vehicle Brand Filter - ใหม่ */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Brand"
            value={filters.vehicleBrand}
            onChange={(value) => handleFilterChange("vehicleBrand", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={brandOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
          />
        </Col>
        {/* Vehicle Color Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Color"
            value={filters.vehicleColor}
            onChange={(value) => handleFilterChange("vehicleColor", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={colorOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
          />
        </Col>
        {/* Province Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="County"
            value={filters.province}
            onChange={(value) => handleFilterChange("province", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={provinceOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.name ?? "")
                .toLowerCase()
                .includes(input.toLowerCase()) ||
              (option?.code ?? "").toLowerCase().includes(input.toLowerCase())
            }
            optionRender={(option) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span style={{ fontSize: "12px" }}>{option.data.name}</span>
                <span style={{ color: "#999", fontSize: "10px" }}>
                  {option.data.code}
                </span>
              </div>
            )}
            style={{ width: "100%" }}
          />
        </Col>
        {/* Status Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={STATUS_OPTIONS}
            style={{ width: "100%" }}
          />
        </Col>
        {/* Clear Button */}
        <Col xs={24} sm={6} md={4} lg={2} xl={2}>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            disabled={loading}
            className="modern-clear-button"
            title="Clear all filters"
            style={{ width: "100%" }}>
            Clear
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default VMSVehicleFilters;
