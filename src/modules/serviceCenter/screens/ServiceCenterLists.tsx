import { useState, useEffect, useCallback, useMemo } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";

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

// ✅ Extended interface เพื่อรองรับ requestReSchedule
interface ExtendedServiceCenterDataType extends ServiceCenterDataType {
  requestReSchedule: boolean;
}

const ServiceCenterLists = () => {
  // Initial
  const {
    curPage,
    perPage,
    pageSizeOptions,
    setCurPage,
    setPerPage,
    onPageChange: handlePageChange,
    deleteAndHandlePagination,
  } = usePagination();

  // States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] =
    useState<ExtendedServiceCenterDataType | null>(null);
  const [search, setSearch] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const [startMonth, setStartMonth] = useState();
  const [endMonth, setEndMonth] = useState();
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

  const payload: ServiceCenterPayloadType = {
    serviceTypeId: SelectServiceCenterIssueType,
    startMonth: startMonth,
    endMonth: endMonth,
    search: search,
    curPage: curPage,
    perPage: perPage,
    status: SelectTabsServiceCenterType,
    unitId: unitNo,
  };

  const {
    data: dataServiceCenterList,
    isLoading,
    refetch: refetchServiceCenterList,
  } = useServiceCenterServiceListQuery(payload);

  const { data: selectList, isSuccess } = useServiceCenterStatusTypeQuery();

  const { data: selectIssueList, isSuccess: isSuccessIssue } =
    useServiceCenterIssueTypeQuery();

  const onPageChange = (page: number) => {
    handlePageChange(page);
  };

  const onEdit = useCallback(
    async (record: ServiceCenterDataType) => {
      console.log("🔍 [onEdit] Starting edit process for record:", record.id);
      const editData: ExtendedServiceCenterDataType = {
        ...record,
        requestCloseCase: Boolean(record.requestCloseCase),
        requestNewAppointment: Boolean(record.requestNewAppointment),
        requestReSchedule: Boolean(record.requestReSchedule),
      };

      console.log("📋 [onEdit] Initial editData:", {
        id: editData.id,
        statusName: editData.statusName,
        requestCloseCase: editData.requestCloseCase,
        requestNewAppointment: editData.requestNewAppointment,
        requestReSchedule: editData.requestReSchedule,
      });

      const dataSuccess = selectList?.data.find(
        (item: ServiceCenterSelectListType) =>
          item.label === editData.status.nameEn
      );
      editData.statusId = Number(dataSuccess?.value);
      setServiceCenterStatusSelectionList(selectList?.data!);

      setEditData(editData);
      setIsEditModalOpen(true);

      try {
        console.log("🔄 Fetching latest data from API...");
        const apiData = await getServiceCenterServiceListQuery(editData.id);

        console.log("✅ API Response received:", {
          requestCloseCase: apiData?.requestCloseCase,
          requestNewAppointment: apiData?.requestNewAppointment,
          requestReSchedule: apiData?.requestReSchedule,
        });
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

        console.log("📋 [onEdit] Final editData after API update:", {
          id: editData.id,
          requestCloseCase: editData.requestCloseCase,
          requestNewAppointment: editData.requestNewAppointment,
          requestReSchedule: editData.requestReSchedule,
          types: {
            requestCloseCase: typeof editData.requestCloseCase,
            requestNewAppointment: typeof editData.requestNewAppointment,
            requestReSchedule: typeof editData.requestReSchedule,
          },
        });
        setEditData({ ...editData });
      } catch (error) {
        console.error("❌ Failed to fetch latest data from API:", error);
        console.warn("⚠️ Using default values due to API failure");
      }
      if (
        editData.requestReSchedule === null ||
        editData.requestReSchedule === undefined
      ) {
        console.warn(
          "⚠️ requestReSchedule is null/undefined, forcing to false"
        );
        editData.requestReSchedule = false;
      }

      console.log("🎯 [onEdit] Modal opened with data");
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

  const fetchData: VoidFunction = async () => {
    if (selectList) {
      setServiceCenterStatusList([
        {
          label: "All",
          key: "",
        },
        ...(selectList.tabsList as any),
      ]);
    }
    if (selectIssueList) {
      setServiceCenterStatusIssueList([
        {
          label: "All",
          value: "",
        },
        ...selectIssueList,
      ]);
    }
    const dataeblock = await getDataBlock();
    setunitDetail(dataeblock?.dataselectblock as unitDetail[]);
  };

  const onRefresh: VoidFunction = () => {
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
        render: (record) => {
          return (
            <Row>
              <Col span={24}>{dayjs(record).format("DD/MM/YYYY HH:mm")}</Col>
            </Row>
          );
        },
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
        render: (status) => {
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
        },
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => {
          return (
            <>
              <Button
                type="text"
                icon={<EditIcon />}
                onClick={() => onEdit(record)}
              />
            </>
          );
        },
      },
    ],
    [onEdit]
  );

  useEffect(() => {
    fetchData();
  }, [
    startMonth,
    endMonth,
    SelectTabsServiceCenterType,
    search,
    curPage,
    refresh,
    perPage,
    isSuccess,
    isSuccessIssue,
  ]);

  return (
    <>
      <Header title="Service Center Lists" />
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
        <Col span={6} style={{ display: "flex", justifyContent: "flex-start" }}>
          {/* <DatePicker
              className="serviceCenterDatePicker"
              onChange={onDateSelect}
              picker="month"
            /> */}
        </Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          <MediumActionButton
            disabled={true}
            message="Export"
            onClick={() => {}}
          />
        </Col>
      </Row>

      {selectList ? (
        <Tabs
          defaultActiveKey=""
          items={ServiceCenterList}
          onChange={setSelectTabsServiceCenterType}
        />
      ) : null}

      <ServiceCenterTable
        loading={isLoading}
        columns={columns}
        data={dataServiceCenterList?.data}
      />
      <Row
        className="announceBottomActionContainer"
        justify="end"
        align="middle"
      >
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={dataServiceCenterList?.total}
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
