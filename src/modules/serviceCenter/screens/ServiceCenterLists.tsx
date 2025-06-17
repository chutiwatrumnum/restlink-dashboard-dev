import { useState, useEffect, useCallback, useMemo } from "react";
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

// Extended interface เพื่อรองรับ requestReschedule
interface ExtendedServiceCenterDataType extends ServiceCenterDataType {
  requestReschedule: boolean; // ✅ เปลี่ยนจาก optional เป็น required
}

const ServiceCenterLists = () => {
  // variables
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] =
    useState<ExtendedServiceCenterDataType | null>(null);
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

  const { data: selectList, isSuccess } = useServiceCenterStatusTypeQuery();

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

  // ✅ ใช้ useCallback เพื่อป้องกันการ re-render ที่ไม่จำเป็น
  const onEdit = useCallback(
    async (record: ServiceCenterDataType) => {
      console.log("🔍 [onEdit] Starting edit process for record:", record.id);

      // ✅ ปรับปรุงการตั้งค่าเริ่มต้นให้ชัดเจนขึ้น
      const editData: ExtendedServiceCenterDataType = {
        ...record,
        // ตั้งค่าเริ่มต้นอย่างชัดเจนด้วย Boolean constructor
        requestCloseCase: Boolean(record.requestCloseCase),
        requestNewAppointment: Boolean(record.requestNewAppointment),
        requestReschedule: Boolean(record.requestReschedule),
      };

      console.log("📋 [onEdit] Initial editData:", {
        id: editData.id,
        statusName: editData.statusName,
        requestCloseCase: editData.requestCloseCase,
        requestNewAppointment: editData.requestNewAppointment,
        requestReschedule: editData.requestReschedule,
      });

      const dataSuccess = selectList?.data.find(
        (item: ServiceCenterSelectListType) =>
          item.label === editData.status.nameEn
      );
      editData.statusId = Number(dataSuccess?.value);
      setServiceCenterStatusSelectionList(selectList?.data!);

      // ✅ เปิด modal ทันทีด้วยข้อมูลพื้นฐาน
      setEditData(editData);
      setIsEditModalOpen(true);

      // ✅ ดึงข้อมูลจาก API แบบ background เพื่อ update ข้อมูลล่าสุด
      try {
        console.log("🔄 Fetching latest data from API...");
        const apiData = await getServiceCenterServiceListQuery(editData.id);

        console.log("✅ API Response received:", {
          requestCloseCase: apiData?.requestCloseCase,
          requestNewAppointment: apiData?.requestNewAppointment,
          requestReschedule: apiData?.requestReschedule,
        });

        // Handle appointment data with new format support
        if (
          apiData?.appointmentDate &&
          Array.isArray(apiData.appointmentDate)
        ) {
          // Find selected appointment from the new format
          const selectedAppointment = apiData.appointmentDate.find(
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
          editData.appointmentDate = apiData.appointmentDate;
        } else if (apiData?.appointmentDateSelected) {
          // Legacy format support
          editData.appointmentDateConfirmAppointment =
            apiData.appointmentDateSelected;
        }

        // ✅ ปรับปรุงการดึงข้อมูลฟิลด์ใหม่แบบ explicit กับ Boolean conversion
        editData.requestCloseCase = Boolean(apiData?.requestCloseCase);
        editData.requestNewAppointment = Boolean(
          apiData?.requestNewAppointment
        );
        editData.requestReschedule = Boolean(apiData?.requestReschedule);

        console.log("📋 [onEdit] Final editData after API update:", {
          id: editData.id,
          requestCloseCase: editData.requestCloseCase,
          requestNewAppointment: editData.requestNewAppointment,
          requestReschedule: editData.requestReschedule,
          types: {
            requestCloseCase: typeof editData.requestCloseCase,
            requestNewAppointment: typeof editData.requestNewAppointment,
            requestReschedule: typeof editData.requestReschedule,
          },
        });

        // ✅ อัพเดท editData หลังจากได้ข้อมูลจาก API
        setEditData({ ...editData });
      } catch (error) {
        console.error("❌ Failed to fetch latest data from API:", error);
        // ถ้า API ล้มเหลว ให้ใช้ค่าเริ่มต้นที่ตั้งไว้แล้ว
        console.warn("⚠️ Using default values due to API failure");
      }

      // ✅ เพิ่มการ validate ข้อมูลก่อนส่งไปยัง Modal
      if (
        editData.requestReschedule === null ||
        editData.requestReschedule === undefined
      ) {
        console.warn(
          "⚠️ requestReschedule is null/undefined, forcing to false"
        );
        editData.requestReschedule = false;
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

  // ✅ ใช้ useMemo สำหรับ columns เพื่อป้องกัน re-render
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
