import { useState, useEffect } from "react";
import { Tag, Tooltip, DatePicker, Select, Input, Space } from "antd";
import Header from "../../../components/templates/Header";
import VMSLogAccessTable from "../components/VMSLogAccessTable";
import VMSLogAccessStatsCards from "../components/VMSLogAccessStatsCards";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { LogAccessRecord } from "../../../stores/interfaces/LogAccess";
import "../styles/vmsLogAccess.css";

const { RangePicker } = DatePicker;
const { Search } = Input;

const VMSLogAccess = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total, currentPage, perPage } = useSelector(
    (state: RootState) => state.logAccess
  );

  // States
  const [rerender, setRerender] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({});

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
  const getResultColor = (result: string): string => {
    switch (result?.toLowerCase()) {
      case "success":
        return "green";
      case "failed":
      case "failure":
        return "red";
      default:
        return "default";
    }
  };

  const getGateStateColor = (gateState: string): string => {
    switch (gateState?.toLowerCase()) {
      case "enabled":
        return "green";
      case "disabled":
        return "red";
      default:
        return "orange";
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case "fast-pass":
        return "blue";
      case "staff":
        return "purple";
      case "resident":
        return "cyan";
      case "visitor":
        return "orange";
      default:
        return "default";
    }
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
  const columns: ColumnsType<LogAccessRecord> = [
    {
      title: "Gate Name",
      key: "gate_name",
      dataIndex: "gate_name",
      width: "12%",
      align: "center",
      sorter: {
        compare: (a, b) => (a.gate_name || "").localeCompare(b.gate_name || ""),
      },
      render: (gate_name) => (
        <div style={{ fontWeight: "600", color: "#1890ff" }}>
          {gate_name || "-"}
        </div>
      ),
    },
    {
      title: "Result",
      key: "result",
      dataIndex: "result",
      align: "center",
      width: "10%",
      render: (result) => (
        <Tag color={getResultColor(result)} style={{ fontSize: "11px" }}>
          {result || "-"}
        </Tag>
      ),
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
      title: "Gate State",
      key: "gate_state",
      dataIndex: "gate_state",
      align: "center",
      width: "10%",
      render: (gate_state) => (
        <Tag color={getGateStateColor(gate_state)} style={{ fontSize: "11px" }}>
          {gate_state || "-"}
        </Tag>
      ),
    },
    {
      title: "Invitation State",
      key: "invitation_state",
      dataIndex: "invitation_state",
      align: "center",
      width: "12%",
      render: (invitation_state) => (
        <Tag
          color={invitation_state === "active" ? "green" : "default"}
          style={{ fontSize: "11px" }}>
          {invitation_state || "-"}
        </Tag>
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
                fontSize: "12px",
                color: "#666",
                maxWidth: "150px",
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
      title: "Issuer",
      key: "issuer",
      dataIndex: "issuer",
      align: "center",
      width: "15%",
      render: (issuer) => {
        if (!issuer) return "-";

        const displayText =
          issuer.length > 20 ? `${issuer.substring(0, 20)}...` : issuer;

        return (
          <Tooltip title={issuer} placement="top">
            <div
              style={{
                fontSize: "12px",
                color: "#1890ff",
                fontWeight: "500",
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
  const onChangeTable: TableProps<LogAccessRecord>["onChange"] = async (
    pagination: any,
    _filters: any,
    sorter: any
  ) => {
    const page = pagination?.current || currentPage;
    const pageSize = pagination?.pageSize || perPage;

    await dispatch.logAccess.getLogAccessList({
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

  const handleResultFilter = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, result: value });
    } else {
      const { result, ...restFilters } = filters;
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

  const handleGateNameSearch = (value: string) => {
    if (value) {
      handleFiltersChange({ ...filters, gate_name: value });
    } else {
      const { gate_name, ...restFilters } = filters;
      handleFiltersChange(restFilters);
    }
  };

  // Effects
  useEffect(() => {
    (async function () {
      await dispatch.logAccess.getLogAccessList({
        page: currentPage,
        perPage: perPage,
        filters,
      });
    })();
  }, [rerender, dispatch, currentPage, perPage]);

  return (
    <>
      <div className="vms-log-access-header">
        <Header title="VMS Access Logs" />
      </div>

      {/* Stats Cards */}
      <VMSLogAccessStatsCards data={tableData} loading={loading} />

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
            placeholder="Search Gate Name"
            allowClear
            size="large"
            onSearch={handleGateNameSearch}
            style={{ minWidth: 220 }}
          />

          <Select
            placeholder="Filter by Result"
            allowClear
            size="large"
            onChange={handleResultFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
              { value: "failure", label: "Failure" },
            ]}
          />

          <Select
            placeholder="Filter by Tier"
            allowClear
            size="large"
            onChange={handleTierFilter}
            style={{ minWidth: 160 }}
            options={[
              { value: "fast-pass", label: "Fast-pass" },
              { value: "staff", label: "Staff" },
              { value: "resident", label: "Resident" },
              { value: "visitor", label: "Visitor" },
            ]}
          />
        </Space>
      </div>

      <VMSLogAccessTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onChangeTable={onChangeTable}
      />
    </>
  );
};

export default VMSLogAccess;
