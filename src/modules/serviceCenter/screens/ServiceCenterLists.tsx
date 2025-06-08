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
import { useServiceCenterServiceListQuery, useServiceCenterStatusTypeQuery, useServiceCenterIssueTypeQuery, useServiceCenterByServiceIDQuery } from "../hooks/index";
import { ServiceCenterDataType, ServiceCenterPayloadType, ServiceCenterSelectListType } from "../../../stores/interfaces/ServiceCenter";
import MediumActionButton from "../../../components/common/MediumActionButton";
import dayjs from "dayjs";
import "../styles/ServiceCenterLists.css";
import { getDataBlock } from "../../deliveryLogs/service/api/DeliveryLogsServiceAPI";
import { unitDetail } from "../../../stores/interfaces/DeliveryLogs";

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
    const [statusConfrimServiceId, setStatusConfrimServiceId] = useState<number>(-1)
    const [endMonth, setEndMonth] = useState();
    const [SelectServiceCenterIssueType, setSelectServiceCenterIssueType] = useState<string | undefined>(undefined);
    const [SelectTabsServiceCenterType, setSelectTabsServiceCenterType] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [ServiceCenterList, setServiceCenterStatusList] = useState<TabsProps["items"]>([
        {
            label: "All",
            key: "",
        },
    ]);
    const [ServiceCenterIssueList, setServiceCenterStatusIssueList] = useState<ServiceCenterSelectListType[]>([
        {
            label: "All",
            value: "",
        },
    ]);
    const [ServiceCenterStatusSelectionList, setServiceCenterStatusSelectionList] = useState<ServiceCenterSelectListType[]>([]);
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
    const { data: dataServiceCenterList, isLoading, refetch: refetchServiceCenterList } = useServiceCenterServiceListQuery(payload);
    const { data: selectList, isSuccess } = useServiceCenterStatusTypeQuery("tabs");
    const { data: selectIssueList, isSuccess: isSuccessIssue } = useServiceCenterIssueTypeQuery();
    const {
        data:ServiceCenterByServiceIDData,
        refetch: isRefetchingServiceCenterByServiceID,
      } = useServiceCenterByServiceIDQuery(statusConfrimServiceId);
    const onSearch = (value: string) => {
        setSearch(value);
        setCurPage(1);
        setPerPage(5);
    };

    const onPageChange = (page: number) => {
        setCurPage(page);
    };
    const onEdit = async(record: ServiceCenterDataType) => {
        const editData: ServiceCenterDataType = {
            ...record,
        };
        // switch (record.statusName) {
        //     case "Pending":
        //         const dataRepair = selectList?.data.find((item: ServiceCenterSelectListType) => item.value ===editData.status.nameEn);
        //         editData.statusId = Number(dataRepair?.value);
        //         const result = selectList?.data.filter((item: ServiceCenterSelectListType) => item.label !== "Success");

        //         setServiceCenterStatusSelectionList(result ? result : []);
        //         break;
        //     case "Repairing":
        //         const dataSuccess = selectList?.data.find((item: ServiceCenterSelectListType) => item.label === "Repairing");
        //         editData.statusId = Number(dataSuccess?.value);
        //         const resultRepairing = selectList?.data.filter((item: ServiceCenterSelectListType) => item.label !== "Pending");
        //         setServiceCenterStatusSelectionList(resultRepairing ? resultRepairing : []);
        //         break;
        //     default:
        //         break;
        // }
        // const resultRepairing = selectList?.data.filter((item: ServiceCenterSelectListType) => item.label !== "Pending");
        const dataSuccess = selectList?.data.find((item: ServiceCenterSelectListType) => item.label ===editData.status.nameEn);
                editData.statusId = Number(dataSuccess?.value);
        setServiceCenterStatusSelectionList(selectList?.data!);
       
        if (editData.status.nameCode==='confirm_appointment') {
            
            setStatusConfrimServiceId(editData.id)
            await isRefetchingServiceCenterByServiceID()
            // console.log('editData.id',ServiceCenterByServiceIDData);
            editData.appointmentDate = ServiceCenterByServiceIDData?.appointmentDateSelected
            editData.closedWithReject=ServiceCenterByServiceIDData?. closedWithReject
            editData.requestNewAppointment=ServiceCenterByServiceIDData?.requestNewAppointment
            
        }else{
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

    const onShowSizeChange: PaginationProps["onShowSizeChange"] = (current, pageSize) => {
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
        // {
        //     title: "Issue",
        //     dataIndex: "issue",
        //     key: "issue",
        //     align: "center",
        // },
        // {
        //     title: "Description",
        //     dataIndex: "description",
        //     key: "description",
        //     align: "center",
        // },
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
            title: "Action",
            key: "action",
            align: "center",
            render: (_, record) => {
                return (
                    <>
                        <Button type="text" icon={<EditIcon />} onClick={() => onEdit(record)} />
                    </>
                );
            },
        },
    ];

    // Actions
    useEffect(() => {
        fetchData();
    }, [startMonth, endMonth, SelectTabsServiceCenterType, search, curPage, refresh, perPage, isSuccess, isSuccessIssue]);
    return (
      <>
        <Header title="Service Center Lists" />
        <Row style={{ marginTop: 15, marginBottom: 15 }}>
          <Col
            span={6}
            style={{ display: "flex", justifyContent: "flex-start" }}>
            <Select
              className="serviceCenterSelect"
              defaultValue={ServiceCenterIssueList[0]?.value}
              onChange={(value: string) => {
                setSelectServiceCenterIssueType(value);
              }}
              options={ServiceCenterIssueList}
            />
          </Col>

          <Col
            span={6}
            style={{ display: "flex", justifyContent: "flex-start" }}>
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
          <Col
            span={6}
            style={{ display: "flex", justifyContent: "flex-start" }}>
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
              //   className="createServiceCenterBtn"
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
