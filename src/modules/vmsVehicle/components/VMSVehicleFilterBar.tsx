import React from "react";
import { Row, Col, Select, Input, DatePicker, Button } from "antd";
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
    <div className="vms-vehicle-filters" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]} align="middle">
        {/* Date Range Filter */}
        <Col xs={24} sm={8} md={5} lg={4} xl={4}>
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
        <Col xs={24} sm={8} md={6} lg={5} xl={4}>
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
        <Col xs={12} sm={6} md={4} lg={3} xl={4}>
          <Select
            placeholder="Filter by Vehicle Type"
            value={filters.vehicleType}
            onChange={(value) => handleFilterChange("vehicleType", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={VEHICLE_TYPE_OPTIONS}
            style={{ width: "100%" }}
          />
        </Col>

        {/* Tier Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Filter by Tier"
            value={filters.tier}
            onChange={(value) => handleFilterChange("tier", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={TIER_OPTIONS}
            style={{ width: "100%" }}
          />
        </Col>

        {/* Province Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
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
            style={{ width: "100%" }}
          />
        </Col>

        {/* Status Filter */}
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Select
            placeholder="Filter by Status"
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
        <Col xs={24} sm={4} md={3} lg={2} xl={3}>
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
