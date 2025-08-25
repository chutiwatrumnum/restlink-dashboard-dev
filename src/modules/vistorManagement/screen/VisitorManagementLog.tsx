import { useEffect, useState } from "react";
import { usePermission } from "../../../utils/hooks/usePermission";

import Header from "../../../components/templates/Header";
import { Table, Checkbox, Button } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  ApprovedId,
  ApprovedVisitorLogsId,
  dowloadVisitorLogs,
} from "../service/api/VisitorServiceAPI";
import { Row, Col, DatePicker, Input, Modal, Tabs, Form } from "antd";
import type { DatePickerProps, TabsProps } from "antd";
import type { TableColumnsType } from "antd";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  DataType,
  conditionPage,
  ExpandedDataType,
} from "../../../stores/interfaces/Visitor";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { IApprovedBody } from "../../../stores/interfaces/Visitor";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
const { confirm } = Modal;
const VisitorManagementLog = () => {
  const { loading, tableData, total, childrenVisitor } = useSelector(
    (state: RootState) => state.visitor
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  // setting pagination Option
  const pageSizeOptions = [15, 20, 60, 100];
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: false,
    total: total,
  };
  let params: conditionPage = {
    perPage: pageSizeOptions[0],
    curPage: currentPage,
  };

  const [rerender, setRerender] = useState<boolean>(true);
  const dispatch = useDispatch<Dispatch>();
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [tabsSelected, setTabsSelected] = useState<string>("1");
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const { RangePicker } = DatePicker;
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const dateFormat = "MMMM,YYYY";

  const { Search } = Input;
  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    setParamsData(params);
    await dispatch.visitor.getTableData(paramsData);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    (async function () {
      setParamsData(params);
      await dispatch.visitor.getTableData(paramsData);
    })();
  }, [rerender]);

  const expandedRowRender = (params: any) => {
    let data = childrenVisitor[params.key];
    const columns: TableColumnsType<ExpandedDataType> = [
      { title: "Name", dataIndex: "name", key: "name", align: "center" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
      },
      {
        title: "Create date",
        dataIndex: "createDate",
        key: "createDate",
        align: "center",
        render: (_, record) => {
          return (
            <div>
              {record.createDate !== "-"
                ? dayjs(record.createDate).format("DD/MM/YYYY")
                : "-"}
            </div>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        align: "center",
      },
      {
        title: "IU number",
        dataIndex: "iuNumber",
        key: "iuNumber",
        align: "center",
      },
      {
        title: "License plate",
        dataIndex: "licensePlate",
        key: "licensePlate",
        align: "center",
      },
      {
        title: "Approved",
        dataIndex: "approve",
        align: "center",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Checkbox
                  disabled={
                    record.status !== "Pending" || !access("events", "edit")
                  }
                  checked={record.approved ? true : false}
                  value={record.key}
                  onChange={showApprovedChlidID}
                />
              </Col>
            </Row>
          </>
        ),
      },
      {
        title: "Reject",
        dataIndex: "reject",
        key: "reject",
        align: "center",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Checkbox
                  disabled={
                    record.status !== "Pending" || !access("events", "delete")
                  }
                  checked={record.reject ? true : false}
                  value={record.key}
                  onChange={rejectChildID}
                />
              </Col>
            </Row>
          </>
        ),
      },
    ];

    return <Table columns={columns} dataSource={data} pagination={false} />;
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      width: "auto",
      sorter:
        tableData.length > 0
          ? {
              compare: (a, b) => a.name.localeCompare(b.name),
            }
          : false,
    },
    {
      title: "Number of participant",
      dataIndex: "totalVisitor",
      align: "center",
      width: "auto",
    },
    {
      title: "Create date",
      dataIndex: "createdAt",
      align: "center",
      width: "auto",
      sorter:
        tableData.length > 0
          ? {
              compare: (a, b) => a.createdAt.localeCompare(b.createdAt),
            }
          : false,
      render: (_, record) => {
        return (
          <div>
            {record.createdAt !== "-"
              ? dayjs(record.createdAt).format("DD/MM/YYYY")
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Booking date",
      dataIndex: "bookingAt",
      align: "center",
      width: "auto",
      render: (_, record) => {
        return (
          <div>
            {record.bookingAt !== "-"
              ? dayjs(record.bookingAt).format("DD/MM/YYYY")
              : "-"}
          </div>
        );
      },
    },
    {
      title: "From",
      dataIndex: "startTime",
      align: "center",
      width: "auto",
      sorter:
        tableData.length > 0
          ? {
              compare: (a, b) => a.startTime.localeCompare(b.startTime),
            }
          : false,
    },
    {
      title: "To",
      dataIndex: "endTime",
      align: "center",
      width: "auto",
      sorter:
        tableData.length > 0
          ? {
              compare: (a, b) => a.endTime.localeCompare(b.endTime),
            }
          : false,
    },
    {
      title: "Approved all",
      align: "center",
      dataIndex: "approve",
      width: "auto",
      render: (_, record) => (
        <>
          <Row>
            <Col span={24}>
              <Checkbox
                disabled={
                  record.status !== "pending" || !access("events", "edit")
                }
                checked={record.isApproveAll ? true : false}
                value={record.key}
                onChange={showApproved}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: "Reject all",
      dataIndex: "reject",
      align: "center",
      key: "edit",
      width: "auto",
      render: (_, record) => (
        <>
          <Row>
            <Col span={24}>
              <Checkbox
                disabled={
                  record.status !== "pending" || !access("events", "delete")
                }
                checked={record.isRejectAll ? true : false}
                value={record.key}
                onChange={reject}
              />
            </Col>
          </Row>
        </>
      ),
    },
  ];
  const onChangeTable: TableProps<DataType>["onChange"] = async (
    pagination: any,
    filters,
    sorter: any,
    extra
  ) => {
    params = paramsData;
    params.sort = sorter?.order;
    params.sortBy = sorter?.field;
    params.curPage = pagination?.current
      ? pagination?.current
      : PaginationConfig.current;
    params.perPage = pagination?.pageSize
      ? pagination?.pageSize
      : PaginationConfig.defaultPageSize;
    await setParamsData(params);
    await setCurrentPage(params.curPage);
    await dispatch.visitor.getTableData(paramsData);
  };

  // const onChangeTab = async (key: string) => {
  //   params.curPage = 1;
  //   params.keyTab = key;
  //   if (key === "2") {
  //     await setTabsSelected(key);
  //     await setCurrentPage(params.curPage);
  //     await setParamsData(params);
  //     await dispatch.visitor.getTableData(params);
  //   } else {
  //     params.reject = false;
  //     await setTabsSelected(key);
  //     await setCurrentPage(params.curPage);
  //     await setParamsData(params);
  //     await dispatch.visitor.getTableData(params);
  //   }
  // };

  // const itemsTabs: TabsProps["items"] = [
  //   {
  //     key: "1",
  //     label: `Facilities reservation`,
  //   },
  //   {
  //     key: "2",
  //     label: `Events`,
  //   },
  // ];
  //approve
  const showApproved = (e: CheckboxChangeEvent) => {
    confirm({
      title: "Confirm action",
      icon: null,
      content: "Are you sure you want to Approved this?",
      okText: "Yes",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        const dataApprove: IApprovedBody = {
          id: e.target.value,
          status: "approve",
        };
        let statusApproved: any = false;
        statusApproved = await ApprovedVisitorLogsId(dataApprove, true);
        if (statusApproved) {
          SuccessModal("Successfully approved");
          setRerender(!rerender);
        } else {
          FailedModal("Failed approved");
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  //approvechildId
  const showApprovedChlidID = (e: CheckboxChangeEvent) => {
    confirm({
      title: "Confirm action",
      icon: null,
      content: "Are you sure you want to Approved this?",
      okText: "Yes",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        const dataApprove: IApprovedBody = {
          id: e.target.value,
          status: "approve",
        };
        let statusApproved: any = false;

        statusApproved = await ApprovedVisitorLogsId(dataApprove, false);

        if (statusApproved) {
          SuccessModal("Successfully approved");
          setRerender(!rerender);
        } else {
          FailedModal("Failed approved");
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const reject = (e: CheckboxChangeEvent) => {
    confirm({
      title: "Confirm action",
      icon: null,
      content: "Are you sure you want to Reject this?",
      okText: "Yes",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        const dataReject: IApprovedBody = {
          id: e.target.value,
          status: "reject",
        };
        let statusRejected: any = false;

        statusRejected = await ApprovedVisitorLogsId(dataReject, true);

        if (statusRejected) {
          SuccessModal("Successfully reject");
          setRerender(!rerender);
        } else {
          FailedModal("Failed reject");
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  //rejectChildID
  const rejectChildID = (e: CheckboxChangeEvent) => {
    confirm({
      title: "Confirm action",
      icon: null,
      content: "Are you sure you want to Reject this?",
      okText: "Yes",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        const dataRejectChild: IApprovedBody = {
          id: e.target.value,
          status: "reject",
        };
        let statusRejected: any = false;

        statusRejected = await ApprovedVisitorLogsId(dataRejectChild, false);

        if (statusRejected) {
          SuccessModal("Successfully reject");
          setRerender(!rerender);
        } else {
          FailedModal("Failed reject");
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  const handleDate = async (e: any) => {
    params = paramsData;
    if (e) {
      params.startDate = dayjs(e[0]).startOf("month").format("YYYY-MM");
      params.endDate = dayjs(e[1]).endOf("month").format("YYYY-MM");
    } else {
      params.startDate = undefined;
      params.endDate = undefined;
    }
    await setParamsData(params);
    await dispatch.visitor.getTableData(paramsData);
  };

  const scroll: { x?: number | string } = {
    x: "10vw",
  };
  return (
    <>
      <Header title="Visitor management log" />
      {/* <Row>
          <Col span={24}>
            <Tabs defaultActiveKey="1" items={itemsTabs} onChange={onChangeTab} />
          </Col>
        </Row> */}
      <Row style={{ marginTop: 15, marginBottom: 15 }}>
        <Col span={10}>
          <RangePicker
            onChange={handleDate}
            style={{ width: "95%" }}
            picker="month"
            format={customFormat}
          />
        </Col>
        <Col
          span={10}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <Search
            placeholder="Search by name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: 300 }}
          />
        </Col>
        <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={dowloadVisitorLogs}
            disabled={!access("events", "view")}
          >
            <VerticalAlignBottomOutlined />
            Export
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            expandable={{ expandedRowRender }}
            pagination={PaginationConfig}
            dataSource={tableData}
            loading={loading}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>
    </>
  );
};

export default VisitorManagementLog;
