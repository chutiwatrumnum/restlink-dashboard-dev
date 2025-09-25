import { useState, useEffect, useCallback, useMemo } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

import { Button, Row, Pagination, Tag, Col, Tabs, Select } from "antd";
import Header from "../../../components/templates/Header";
import ServiceCenterTable from "../components/ServiceCenterTable";
import ServiceCenterEditModal from "../components/ServiceCenterEditModal";
import { EditIcon } from "../../../assets/icons/Icons";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps, TabsProps } from "antd";
import {
  useServiceCenterServiceListQuery,
  useServiceCenterStatusTypeQuery,
  useServiceCenterIssueTypeQuery,
} from "../hooks/index";
import {
  ServiceCenterDataType,
  ServiceCenterPayloadType,
  ServiceCenterSelectListType,
} from "../../../stores/interfaces/ServiceCenter";
import MediumActionButton from "../../../components/common/MediumActionButton";
import dayjs from "dayjs";
import "../styles/ServiceCenterLists.css";
import { getDataBlock } from "../../deliveryLogs/service/api/DeliveryLogsServiceAPI";
import { unitDetail } from "../../../stores/interfaces/DeliveryLogs";
import { getServiceCenterServiceListQuery } from "../hooks/serviceCenterQuery";

interface ExtendedServiceCenterDataType extends ServiceCenterDataType {
  requestReSchedule: boolean;
}

const ServiceCenterLists = () => {
  const {
    curPage,
    perPage,
    pageSizeOptions,
    setCurPage,
    setPerPage,
    onPageChange: handlePageChange,
  } = usePagination();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] =
    useState<ExtendedServiceCenterDataType | null>(null);
  const [unitNo, setUnitNo] = useState("");
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const [SelectServiceCenterIssueType, setSelectServiceCenterIssueType] =
    useState<string | undefined>(undefined);
  const [SelectTabsServiceCenterType, setSelectTabsServiceCenterType] =
    useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [ServiceCenterList, setServiceCenterStatusList] = useState<
    TabsProps["items"]
  >([
    {
      label: "All",
      key: "",
    },
  ]);
  const [ServiceCenterIssueList, setServiceCenterStatusIssueList] = useState<
    ServiceCenterSelectListType[]
  >([
    {
      label: "All",
      value: "",
    },
  ]);
  const [
    ServiceCenterStatusSelectionList,
    setServiceCenterStatusSelectionList,
  ] = useState<ServiceCenterSelectListType[]>([]);

  // API Queries
  const { data: selectList, isSuccess } = useServiceCenterStatusTypeQuery();
  const { data: selectIssueList, isSuccess: isSuccessIssue } =
    useServiceCenterIssueTypeQuery();

  // ✅ ดึง permission
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const payload: ServiceCenterPayloadType = useMemo(() => {
    const isSpecialTab =
      SelectTabsServiceCenterType === "request_close" ||
      SelectTabsServiceCenterType === "request_reschedule";

    return {
      serviceTypeId: SelectServiceCenterIssueType,
      curPage: isSpecialTab ? 1 : curPage,
      perPage: isSpecialTab ? 100 : perPage,
      status: isSpecialTab ? null : SelectTabsServiceCenterType,
      unitId: unitNo,
      search: null,
    };
  }, [
    SelectServiceCenterIssueType,
    curPage,
    perPage,
    SelectTabsServiceCenterType,
    unitNo,
  ]);

  // Query for getting data to count (always get all data for counting)
  const countPayload: ServiceCenterPayloadType = useMemo(
    () => ({
      serviceTypeId: SelectServiceCenterIssueType,
      curPage: 1,
      perPage: 1000, // Get a large number to count all
      status: null, // Get all statuses for counting
      unitId: unitNo,
      search: null,
    }),
    [SelectServiceCenterIssueType, unitNo]
  );

  const {
    data: serviceCenterData,
    isLoading,
    refetch: refetchServiceCenterList,
  } = useServiceCenterServiceListQuery(payload);

  // Separate query for counting all data
  const { data: serviceCenterCountData } =
    useServiceCenterServiceListQuery(countPayload);

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    if (!serviceCenterCountData?.data) {
      return {};
    }

    const data = serviceCenterCountData.data;

    // Count by status using both nameCode and nameEn
    const statusCounts: { [key: string]: number } = {};

    data.forEach((item: ServiceCenterDataType) => {
      // Use nameEn for counting (matches with tab labels)
      const statusName = item.status.nameEn;
      const statusCode = item.status.nameCode;

      // Count by nameEn
      if (statusName) {
        statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
      }

      // Also count by nameCode for backward compatibility
      if (statusCode) {
        statusCounts[statusCode.toLowerCase()] =
          (statusCounts[statusCode.toLowerCase()] || 0) + 1;
      }
    });

    // Count special request types
    const requestCloseCases = data.filter((item: ServiceCenterDataType) => {
      const hasCloseRequest = Boolean(item.requestCloseCase) === true;
      const allowedStatuses = [
        "Waiting for confirmation",
        "Confirm appointment",
        "Repairing",
      ];
      const isInAllowedStatus = allowedStatuses.includes(item.statusName);
      return hasCloseRequest && isInAllowedStatus;
    }).length;

    const requestRescheduleCases = data.filter(
      (item: ServiceCenterDataType) => {
        return Boolean(item.requestReSchedule) === true;
      }
    ).length;

    return {
      all: data.length,
      // Use exact status names from API
      Pending: statusCounts["Pending"] || 0,
      "Please confirm fixing date":
        statusCounts["Please confirm fixing date"] || 0,
      "Waiting for confirmation": statusCounts["Waiting for confirmation"] || 0,
      "Confirm appointment": statusCounts["Confirm appointment"] || 0,
      Repairing: statusCounts["Repairing"] || 0,
      Success: statusCounts["Success"] || 0,
      Closed: statusCounts["Closed"] || 0,
      request_close: requestCloseCases,
      request_reschedule: requestRescheduleCases,
    };
  }, [serviceCenterCountData?.data]);

  const { filteredData, paginatedData, totalFiltered } = useMemo(() => {
    if (!serviceCenterData?.data) {
      return { filteredData: [], paginatedData: [], totalFiltered: 0 };
    }

    const data = serviceCenterData.data;
    let filtered = data;

    switch (SelectTabsServiceCenterType) {
      case "request_close":
        filtered = data.filter((item: ServiceCenterDataType) => {
          const hasCloseRequest = Boolean(item.requestCloseCase) === true;
          const allowedStatuses = [
            "Waiting for confirmation",
            "Confirm appointment",
            "Repairing",
          ];
          const isInAllowedStatus = allowedStatuses.includes(item.statusName);

          return hasCloseRequest && isInAllowedStatus;
        });
        break;

      case "request_reschedule":
        filtered = data.filter((item: ServiceCenterDataType) => {
          return Boolean(item.requestReSchedule) === true;
        });
        break;

      default:
        filtered = data;
        break;
    }

    const isSpecialTab =
      SelectTabsServiceCenterType === "request_close" ||
      SelectTabsServiceCenterType === "request_reschedule";

    if (isSpecialTab) {
      const start = (curPage - 1) * perPage;
      const end = start + perPage;
      const paginated = filtered.slice(start, end);
      return {
        filteredData: filtered,
        paginatedData: paginated,
        totalFiltered: filtered.length,
      };
    }

    return {
      filteredData: filtered,
      paginatedData: filtered,
      totalFiltered: serviceCenterData?.total || filtered.length,
    };
  }, [serviceCenterData?.data, SelectTabsServiceCenterType, curPage, perPage]);

  const onPageChange = (page: number) => {
    handlePageChange(page);
  };

  const onEdit = useCallback(
    async (record: ServiceCenterDataType) => {
      const editData: ExtendedServiceCenterDataType = {
        ...record,
        requestCloseCase: Boolean(record.requestCloseCase),
        requestNewAppointment: Boolean(record.requestNewAppointment),
        requestReSchedule: Boolean(record.requestReSchedule),
      };

      const dataSuccess = selectList?.data.find(
        (item: ServiceCenterSelectListType) =>
          item.label === editData.status.nameEn
      );
      editData.statusId = Number(dataSuccess?.value);
      setServiceCenterStatusSelectionList(selectList?.data!);

      setEditData(editData);
      setIsEditModalOpen(true);

      try {
        const apiData = await getServiceCenterServiceListQuery(editData.id);

        if (
          apiData?.appointmentDate &&
          Array.isArray(apiData.appointmentDate)
        ) {
          const selectedAppointment = apiData.appointmentDate.find(
            (item: any) => item.selected === true
          );
          if (selectedAppointment) {
            editData.appointmentDateConfirmAppointmentID =
              selectedAppointment.id;
            if (selectedAppointment.startTime && selectedAppointment.endTime) {
              editData.appointmentDateConfirmAppointment = `${selectedAppointment.date} ${selectedAppointment.startTime}-${selectedAppointment.endTime}`;
            } else {
              editData.appointmentDateConfirmAppointment =
                selectedAppointment.date;
            }
          }
          editData.appointmentDate = apiData.appointmentDate;
        } else if (apiData?.appointmentDateSelected) {
          editData.appointmentDateConfirmAppointment =
            apiData.appointmentDateSelected;
        }

        editData.requestCloseCase = Boolean(apiData?.requestCloseCase);
        editData.requestNewAppointment = Boolean(
          apiData?.requestNewAppointment
        );
        editData.requestReSchedule = Boolean(apiData?.requestReSchedule);

        setEditData({ ...editData });
      } catch (error) {
        console.error("Failed to fetch latest data from API:", error);
      }

      if (
        editData.requestReSchedule === null ||
        editData.requestReSchedule === undefined
      ) {
        editData.requestReSchedule = false;
      }
    },
    [selectList?.data]
  );

  const onEditOk = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const onEditCancel = useCallback(() => {
    setIsEditModalOpen(false);
    setEditData(null);
    refetchServiceCenterList();
  }, [refetchServiceCenterList]);

  const fetchData = async () => {
    if (selectList) {
      // Create tabs with counts
      const tabsWithCounts = [
        {
          label: `All (${tabCounts.all || 0})`,
          key: "",
        },
        ...selectList.tabsList.map((tab: any) => {
          // Use tab label directly for counting
          const count = tabCounts[tab.label] || 0;
          return {
            label: `${tab.label} (${count})`,
            key: tab.key,
          };
        }),
        {
          label: `Close Requests (${tabCounts.request_close || 0})`,
          key: "request_close",
        },
        {
          label: `Reschedule Requests (${tabCounts.request_reschedule || 0})`,
          key: "request_reschedule",
        },
      ];

      setServiceCenterStatusList(tabsWithCounts);
    }
    if (selectIssueList) {
      setServiceCenterStatusIssueList([
        { label: "All", value: "" },
        ...selectIssueList,
      ]);
    }
    const dataeblock = await getDataBlock();
    setunitDetail(dataeblock?.dataselectblock as unitDetail[]);
  };

  const onRefresh = () => {
    setRefresh(!refresh);
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize
  ) => {
    setCurPage(current);
    setPerPage(pageSize);
  };

  const onChangeUnit = (value: string) => {
    setCurPage(1);
    setPerPage(5);
    setUnitNo(value);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "Pending":
        return <Tag color="red">{status}</Tag>;
      case "Waiting for confirmation":
        return <Tag color="orange">{status}</Tag>;
      case "Confirm appointment":
        return <Tag color="blue">{status}</Tag>;
      case "Repairing":
        return <Tag color="red">{status}</Tag>;
      case "Success":
        return <Tag color="green">{status}</Tag>;
      case "Closed":
        return <Tag color="gray">{status}</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns: ColumnsType<ServiceCenterDataType> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "fullname",
        key: "fullname",
        align: "center",
      },
      {
        title: "Room number",
        dataIndex: "roomAddress",
        key: "roomAddress",
        align: "center",
      },
      {
        title: "Type",
        dataIndex: "serviceTypeName",
        key: "serviceTypeName",
        align: "center",
      },
      {
        title: "Submission Date",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        render: (record) => (
          <Row>
            <Col span={24}>{dayjs(record).format("DD/MM/YYYY HH:mm")}</Col>
          </Row>
        ),
      },
      {
        title: "Tel.",
        dataIndex: "tel",
        key: "tel",
        align: "center",
      },
      {
        title: "Status",
        dataIndex: "statusName",
        key: "statusName",
        align: "center",
        render: (status) => renderStatus(status),
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Button
            type="text"
            icon={<EditIcon />}
            onClick={() => onEdit(record)}
            disabled={!access("fixing_report", "edit")} // ✅
          />
        ),
      },
    ],
    [onEdit]
  );

  useEffect(() => {
    fetchData();
  }, [
    SelectTabsServiceCenterType,
    curPage,
    refresh,
    perPage,
    isSuccess,
    isSuccessIssue,
    tabCounts, // Add tabCounts to dependencies to update when counts change
  ]);

  return (
    <>
      <Header title="Fixing Lists" />
      <Row style={{ marginTop: 15, marginBottom: 15 }}>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-start" }}>
          <Select
            className="serviceCenterSelect"
            defaultValue={ServiceCenterIssueList[0]?.value}
            onChange={(value: string) => {
              setSelectServiceCenterIssueType(value);
            }}
            options={ServiceCenterIssueList}
          />
        </Col>

        <Col span={6} style={{ display: "flex", justifyContent: "flex-start" }}>
          <Select
            className="serviceCenterSelect"
            showSearch
            allowClear
            placeholder="Select room address"
            optionFilterProp="label"
            onChange={onChangeUnit}
            options={unit}
            style={{ width: "100%", height: "100%" }}
          />
        </Col>
        <Col span={6}>{/* Placeholder for future date picker */}</Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <MediumActionButton
            disabled={!access("fixing_report", "view")} // ✅ ปรับตามสิทธิ์
            message="Export"
            onClick={() => {}}
          />
        </Col>
      </Row>

      {selectList && (
        <Tabs
          defaultActiveKey=""
          items={ServiceCenterList}
          onChange={setSelectTabsServiceCenterType}
        />
      )}

      <ServiceCenterTable
        loading={isLoading}
        columns={columns}
        data={paginatedData}
      />
      <Row
        className="announceBottomActionContainer"
        justify="end"
        align="middle">
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={totalFiltered}
          pageSizeOptions={pageSizeOptions}
          showSizeChanger={true}
          onShowSizeChange={onShowSizeChange}
        />
      </Row>

      <ServiceCenterEditModal
        selectList={
          ServiceCenterStatusSelectionList
            ? ServiceCenterStatusSelectionList
            : []
        }
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        data={editData}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ServiceCenterLists;
