// ไฟล์: src/modules/vmsInvitation/components/VMSInvitationFilters.tsx - Updated UI Design

import React from "react";
import { Row, Col, Select, Input, DatePicker, Button, Space } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface FilterValues {
  active?: boolean;
  type?: string;
  searchText?: string;
  stamped?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

interface VMSInvitationFiltersProps {
  onFilter: (filters: FilterValues) => void;
  loading?: boolean;
}

const VMSInvitationFilters: React.FC<VMSInvitationFiltersProps> = ({
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

  return (
    <div className="vms-invitation-filters">
      <Row gutter={[16, 16]} align="middle">
        {/* Date Range Filter */}
        <Col xs={24} sm={12} md={6} lg={5}>
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
              placeholder="Search Guest Name, House Address, License Plate"
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

        {/* Status Filter */}
        <Col xs={24} sm={12} md={5} lg={4}>
          <Select
            placeholder="Filter by Status"
            value={filters.active}
            onChange={(value) => handleFilterChange("active", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={[
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ]}
          />
        </Col>

        {/* Type Filter */}
        <Col xs={24} sm={12} md={5} lg={4}>
          <Select
            placeholder="Filter by Type"
            value={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={[
              { label: "Invitation", value: "invitation" },
              { label: "Vehicle", value: "vehicle" },
            ]}
          />
        </Col>

        {/* Stamped Filter */}
        <Col xs={24} sm={12} md={5} lg={3}>
          <Select
            placeholder="Filter by Stamp"
            value={filters.stamped}
            onChange={(value) => handleFilterChange("stamped", value)}
            allowClear
            disabled={loading}
            className="modern-select"
            options={[
              { label: "Stamped", value: true },
              { label: "Not Stamped", value: false },
            ]}
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
            {filters.active !== undefined && (
              <span className="filter-tag filter-tag-status">
                Status: {filters.active ? "Active" : "Inactive"}
              </span>
            )}
            {filters.type && (
              <span className="filter-tag filter-tag-type">
                Type: {filters.type}
              </span>
            )}
            {filters.stamped !== undefined && (
              <span className="filter-tag filter-tag-stamp">
                Stamp: {filters.stamped ? "Stamped" : "Not Stamped"}
              </span>
            )}
            {filters.dateRange && (
              <span className="filter-tag filter-tag-date">
                Date: {filters.dateRange[0].format("DD/MM/YYYY")} -{" "}
                {filters.dateRange[1].format("DD/MM/YYYY")}
              </span>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};

export default VMSInvitationFilters;
