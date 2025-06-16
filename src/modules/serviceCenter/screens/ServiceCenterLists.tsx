import { useState, useEffect } from "react";
import { Button, Row, Pagination, Tag, Col, Tabs, Select } from "antd";
import Header from "../../../components/templates/Header";
import ServiceCenterTable from "../components/ServiceCenterTable";
import ServiceCenterEditModal from "../components/ServiceCenterEditModal";
import { EditIcon } from "../../../assets/icons/Icons";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps, TabsProps } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
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

const ServiceCenterLists = () => {
  // variables
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ServiceCenterDataType | null>(null);
  const [search, setSearch] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
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
  const { data: selectList, isSuccess } =
    useServiceCenterStatusTypeQuery("tabs");
  const { data: selectIssueList, isSuccess: isSuccessIssue } =
    useServiceCenterIssueTypeQuery();

  const onSearch = (value: string) => {
    setSearch(value);
    setCurPage(1);
    setPerPage(5);
  };

  const onPageChange = (page: number) => {
    setCurPage(page);
  };

  const onEdit = async (record: ServiceCenterDataType) => {
    const editData: ServiceCenterDataType = {
      ...record,
    };
    const dataSuccess = selectList?.data.find(
      (item: ServiceCenterSelectListType) =>
        item.label === editData.status.nameEn
    );
    editData.statusId = Number(dataSuccess?.value);
    setServiceCenterStatusSelectionList(selectList?.data!);

    if (editData.status.nameCode === "confirm_appointment") {
      try {
        const data = await getServiceCenterServiceListQuery(editData.id);

        // Handle appointment data with new format support
        if (data?.appointmentDate && Array.isArray(data.appointmentDate)) {
          // Find selected appointment from the new format
          const selectedAppointment = data.appointmentDate.find(
            (item: any) => item.selected === true
          );
          if (selectedAppointment) {
            editData.appointmentDateConfirmAppointmentID =
              selectedAppointment.id;
            // Format the selected appointment data for display
            if (selectedAppointment.startTime && selectedAppointment.endTime) {
              editData.appointmentDateConfirmAppointment = `${selectedAppointment.date} ${selectedAppointment.startTime}-${selectedAppointment.endTime}`;
            } else {
              editData.appointmentDateConfirmAppointment =
                selectedAppointment.date;
            }
          }

          // Set the full appointment data array
          editData.appointmentDate = data.appointmentDate;
        } else if (data?.appointmentDateSelected) {
          // Legacy format support
          editData.appointmentDateConfirmAppointment =
            data.appointmentDateSelected;
        }

        editData.requestCloseCase = data?.requestCloseCase;
        editData.requestNewAppointment = data?.requestNewAppointment;
      } catch (error) {
        console.log(error);
        alert("get service center by id error");
      }
    }
    setEditData(editData);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
    setEditData(null);
    refetchServiceCenterList();
  };

  const onDateSelect = (values: RangePickerProps["value"]) => {
    let start: any, end: any;
    values?.forEach((value, index) => {
      if (index === 0) {
        start = value?.format("YYYY-MM");
      } else {
        end = value?.format("YYYY-MM");
      }
    });
    setStartMonth(start);
    setEndMonth(end);
  };

  const fetchData: VoidFunction = async () => {
    if (selectList) {
      setServiceCenterStatusList([
        {
          label: "All",
          key: "",
        },
        ,
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

  const columns: ColumnsType<ServiceCenterDataType> = [
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
            break;
          case "Repairing":
            return <Tag color="orange">{status}</Tag>;
            break;
          case "Success":
            return <Tag color="green">{status}</Tag>;
            break;
          default:
            return <Tag color="default">{status}</Tag>;
            break;
        }
      },
    },
    {
      title: "Appointment",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      align: "center",
      render: (appointmentDate) => {
        if (!appointmentDate || !Array.isArray(appointmentDate)) {
          return "N/A";
        }

        // Show first appointment slot with time if available
        const firstSlot = appointmentDate[0];
        if (typeof firstSlot === "object" && firstSlot.date) {
          let displayText = dayjs(firstSlot.date).format("DD/MM/YYYY");
          if (firstSlot.startTime && firstSlot.endTime) {
            displayText += ` (${firstSlot.startTime}-${firstSlot.endTime})`;
          }
          if (appointmentDate.length > 1) {
            displayText += ` +${appointmentDate.length - 1} more`;
          }
          return displayText;
        } else if (typeof firstSlot === "string") {
          // Legacy format
          let displayText = dayjs(firstSlot).format("DD/MM/YYYY");
          if (appointmentDate.length > 1) {
            displayText += ` +${appointmentDate.length - 1} more`;
          }
          return displayText;
        }

        return "N/A";
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
  ];

  // Actions
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
            placeholder="Select unit"
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
        align="middle">
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={dataServiceCenterList?.total}
          pageSizeOptions={[10, 20, 40, 80, 100]}
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
