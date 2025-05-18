import { useState, useEffect } from "react";
import { Button, Row, Pagination, Tag, Col, Tabs, Select } from "antd";
import DatePicker from "../../../components/common/DatePicker";
import Header from "../../../components/templates/Header";
import SearchBox from "../../../components/common/SearchBox";
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

const ServiceCenterLists = () => {
  // variables
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ServiceCenterDataType | null>(null);
  const [search, setSearch] = useState("");
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
  const onEdit = (record: ServiceCenterDataType) => {
    const editData: ServiceCenterDataType = {
      ...record,
    };
    switch (record.statusName) {
      case "Pending":
        const dataRepair = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Pending"
        );
        editData.statusId = Number(dataRepair?.value);
        const result = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Success"
        );

        setServiceCenterStatusSelectionList(result ? result : []);
        break;
      case "Repairing":
        const dataSuccess = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Repairing"
        );
        editData.statusId = Number(dataSuccess?.value);
        const resultRepairing = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Pending"
        );
        setServiceCenterStatusSelectionList(
          resultRepairing ? resultRepairing : []
        );
        break;
      default:
        break;
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
      await setServiceCenterStatusList([
        {
          label: "All",
          key: "",
        },
        ,
        ...(selectList.tabsList as any),
      ]);
    }
    if (selectIssueList) {
      await setServiceCenterStatusIssueList([
        {
          label: "All",
          value: "",
        },
        ...selectIssueList,
      ]);
    }
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

  const columns: ColumnsType<ServiceCenterDataType> = [
    {
      title: "Name-Surname",
      dataIndex: "fullname",
      key: "fullname",
      align: "center",
    },
    {
      title: "Room-number",
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
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
      align: "center",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
            break;
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
              disabled={record.statusName !== "Success" ? false : true}
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
      <div className="serviceCenterListsTopActionGroup">
        <div className="serviceCenterListsTopActionLeftGroup">
          <Select
            className="serviceCenterSelect"
            defaultValue={ServiceCenterIssueList[0]?.value}
            style={{ width: "48%", height: "100%" }}
            onChange={(value: string) => {
              setSelectServiceCenterIssueType(value);
            }}
            options={ServiceCenterIssueList}
          />

          <DatePicker
            className="serviceCenterDatePicker"
            onChange={onDateSelect}
            picker="month"
          />
          <SearchBox
            className="serviceCenterSearchBox"
            onSearch={onSearch}
            placeholderText="Search by Issue"
          />
        </div>
        <MediumActionButton
          disabled={true}
          message="Export"
          onClick={() => {}}
          className="createServiceCenterBtn"
        />
      </div>

      {selectList ? (
        <Tabs
          defaultActiveKey=""
          items={ServiceCenterList}
          onChange={async (key: string) => {
            setSelectTabsServiceCenterType(key);
          }}
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
