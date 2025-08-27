import React from "react";
import { Row, Col, Select, Input, DatePicker, Button, Space } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getProvinceOptions } from "../../../utils/constants/thaiProvinces";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface FilterValues {
  vehicleType?: string;
  vehicleColor?: string;
  tier?: string;
  province?: string;
  status?: string;
  searchText?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

interface VMSVehicleFiltersProps {
  onFilter: (filters: FilterValues) => void;
  loading?: boolean;
}

// Vehicle Type Options
const VEHICLE_TYPE_OPTIONS = [
  { label: "🚗 รถยนต์", value: "car" },
  { label: "🏍️ มอเตอร์ไซค์", value: "motorcycle" },
];

// Color Options
const COLOR_OPTIONS = [
  { label: "ขาว", value: "white" },
  { label: "ดำ", value: "black" },
  { label: "เงิน", value: "silver" },
  { label: "เทา", value: "gray" },
  { label: "แดง", value: "red" },
  { label: "น้ำเงิน", value: "blue" },
  { label: "เขียว", value: "green" },
  { label: "เหลือง", value: "yellow" },
  { label: "ส้ม", value: "orange" },
  { label: "ม่วง", value: "purple" },
  { label: "น้ำตาล", value: "brown" },
  { label: "ทอง", value: "gold" },
  { label: "อื่นๆ", value: "other" },
];

// Tier Options
const TIER_OPTIONS = [
  { label: "Staff", value: "staff" },
  { label: "Resident", value: "resident" },
  { label: "Invited Visitor", value: "invited visitor" },
];

// Status Options
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
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

  // Get province options
  const provinceOptions = getProvinceOptions();

  return (
    <div className="vms-vehicle-filters">
      <Row gutter={[16, 16]} align="middle">
        {/* Date Range Filter */}
        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-date-range">
            <RangePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Start Date", "End Date"]}
              disabled={loading}
              className="modern-date-picker"
              suffixIcon={<CalendarOutlined className="date-picker-icon" />}
            />
          </div>
        </Col>

        {/* Search Input */}
        <Col xs={24} sm={12} md={8} lg={6}>
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
        <Col xs={24} sm={12} md={5} lg={4}>
          <Select
            placeholder="Filter by Vehicle Type"
            value={filters.vehicleType}
            onChange={(value) => handleFilterChange("vehicleType", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={VEHICLE_TYPE_OPTIONS}
          />
        </Col>

        {/* Vehicle Color Filter */}
        <Col xs={24} sm={12} md={5} lg={4}>
          <Select
            placeholder="Filter by Color"
            value={filters.vehicleColor}
            onChange={(value) => handleFilterChange("vehicleColor", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={COLOR_OPTIONS}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Col>

        {/* Tier Filter */}
        <Col xs={24} sm={12} md={4} lg={3}>
          <Select
            placeholder="Filter by Tier"
            value={filters.tier}
            onChange={(value) => handleFilterChange("tier", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={TIER_OPTIONS}
          />
        </Col>

        {/* Province Filter */}
        <Col xs={24} sm={12} md={5} lg={4}>
          <Select
            placeholder="Filter by Province"
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
                <span>{option.data.name}</span>
                <span style={{ color: "#999", fontSize: "11px" }}>
                  {option.data.code}
                </span>
              </div>
            )}
          />
        </Col>

        {/* Status Filter */}
        <Col xs={24} sm={12} md={4} lg={3}>
          <Select
            placeholder="Filter by Status"
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={STATUS_OPTIONS}
          />
        </Col>

        {/* Clear Button */}
        <Col xs={24} sm={12} md={3} lg={2}>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            disabled={loading}
            className="modern-clear-button"
            title="Clear all filters">
            Clear
          </Button>
        </Col>
      </Row>

      {/* Active Filters Display */}
      {Object.keys(filters).some(
        (key) => filters[key as keyof FilterValues] !== undefined
      ) && (
        <div className="active-filters-container">
          <div className="active-filters-label">Active Filters:</div>
          <Space wrap size={[8, 4]}>
            {searchInput && (
              <span className="filter-tag filter-tag-search">
                Search: {searchInput}
              </span>
            )}
            {filters.vehicleType && (
              <span className="filter-tag filter-tag-type">
                Type:{" "}
                {
                  VEHICLE_TYPE_OPTIONS.find(
                    (opt) => opt.value === filters.vehicleType
                  )?.label
                }
              </span>
            )}
            {filters.vehicleColor && (
              <span className="filter-tag filter-tag-color">
                Color:{" "}
                {
                  COLOR_OPTIONS.find(
                    (opt) => opt.value === filters.vehicleColor
                  )?.label
                }
              </span>
            )}
            {filters.tier && (
              <span className="filter-tag filter-tag-tier">
                Tier: {filters.tier}
              </span>
            )}
            {filters.province && (
              <span className="filter-tag filter-tag-province">
                Province:{" "}
                {
                  provinceOptions.find((opt) => opt.value === filters.province)
                    ?.name
                }
              </span>
            )}
            {filters.status && (
              <span className="filter-tag filter-tag-status">
                Status: {filters.status}
              </span>
            )}
            {filters.dateRange && (
              <span className="filter-tag filter-tag-date">
                Date: {filters.dateRange[0].format("DD/MM/YY")} -{" "}
                {filters.dateRange[1].format("DD/MM/YY")}
              </span>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};

export default VMSVehicleFilters;
