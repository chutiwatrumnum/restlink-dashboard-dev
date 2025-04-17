import React, { useState, useEffect } from "react";
import Header from "../../../components/templates/Header";
import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import {
  deleteResidentId,
  ApprovedId,
  RejectById,
  ResendById,
} from "../service/api/ResidentServiceAPI";
import { Row, Col, Input, Button, Modal, Tabs, Form } from "antd";
import type { TabsProps } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  ResidentInformationDataType,
  columnTable,
  conditionPage,
  rejectRequest,
} from "../../../stores/interfaces/ResidentInformation";
import ApprovedResidentSignUp from "../components/residentSignUp/ApprovedResidentSignUp";
import InfoResidentSignUp from "../components/residentSignUp/InfoResidentSignUp";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import SmallButton from "../../../components/common/SmallButton";
import { requiredRule } from "../../../configs/inputRule";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import { TrashIcon } from "../../../assets/icons/Icons";
import ConfirmModal from "../../../components/common/ConfirmModal";
import "../styles/userManagement.css";
const { confirm } = Modal;
const ResidentSignUp = () => {
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.resident
  );
  const { accessibility } = useSelector((state: RootState) => state.common);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // setting pagination Option
  const pageSizeOptions = [10, 20, 40, 80, 100];
  let PaginationConfig: TablePaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: true,
    total: total,
  };
  let params: conditionPage = {
    perPage: pageSizeOptions[0],
    curPage: currentPage,
    verifyByJuristic: false,
    reject: false,
    isActive: false,
  };
  const [PaginationConfigState, setPaginationConfig] =
    useState<TablePaginationConfig>(PaginationConfig);

  const columnTables: columnTable = {
    defaultTable: [
      {
        title: "Information",
        align: "center",
        width: "1%",
        render: (record) => {
          return (
            <Row>
              <Col span={24}>
                <Button
                  value={record.key}
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={async () => {
                    await setDataInfo(record);
                    await setIsModalOpenInfo(true);
                  }}
                />
              </Col>
            </Row>
          );
        },
      },
      {
        title: "First name",
        dataIndex: "firstName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.firstName.localeCompare(b.firstName),
              }
            : false,
      },
      // {
      //   title: "Middle name",
      //   width: "7%",
      //   dataIndex: "middleName",
      //   align: "center",
      //   sorter: {
      //     compare: (a, b) => a.firstName.localeCompare(b.firstName),
      //   },
      // },
      {
        title: "Last name",
        dataIndex: "lastName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.lastName.localeCompare(b.lastName),
              }
            : false,
      },
      {
        title: "Email",
        dataIndex: "email",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.email.localeCompare(b.email),
              }
            : false,
      },
      {
        title: "Role",
        dataIndex: "role",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.role.localeCompare(b.role),
              }
            : false,
      },
      {
        title: "Room address",
        dataIndex: "roomAddress",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.roomAddress.localeCompare(b.roomAddress),
              }
            : false,
      },
      {
        title: "Create",
        dataIndex: "createdAt",
        align: "center",
        width: "5%",
        // sorter:tableData.length>0? {
        //   compare: (a, b) => a.createdAt.localeCompare(b.createdAt),
        // },
        render: (record) => {
          return (
            <Row>
              <Col span={24}>{dayjs(record).format("DD/MM/YYYY HH:mm")}</Col>
            </Row>
          );
        },
      },
    ],
    allTabsColumn: [
      {
        title: "Information",
        align: "center",
        width: "1%",
        render: (record) => {
          return (
            <Row>
              <Col span={24}>
                <Button
                  value={record.key}
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={async () => {
                    await setDataInfo(record);
                    await setIsModalOpenInfo(true);
                  }}
                />
              </Col>
            </Row>
          );
        },
      },
      {
        title: "Approved",
        dataIndex: "approved",
        align: "center",
        key: "approved",
        width: "1%",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Button
                  // className= {accessibility?.team_user_management.allowEdit ? "buttonSuccess" : "buttonDisableSuccess"}
                  className="buttonSuccess"
                  value={record.key}
                  onClick={showApproved}
                  disabled={
                    accessibility?.team_user_management.allowEdit ? false : true
                  }>
                  Approved
                </Button>
              </Col>
            </Row>
          </>
        ),
      },
      {
        title: "Reject",
        dataIndex: "Reject",
        align: "center",
        key: "Reject",
        width: "2%",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Button
                  danger
                  value={record.key}
                  onClick={showReject}
                  disabled={
                    accessibility?.team_user_management.allowEdit ? false : true
                  }>
                  Reject
                </Button>
              </Col>
            </Row>
          </>
        ),
      },
      {
        title: "First name",
        dataIndex: "firstName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.firstName.localeCompare(b.firstName),
              }
            : false,
      },
      // {
      //   title: "Middle name",
      //   width: "7%",
      //   dataIndex: "middleName",
      //   align: "center",
      //   sorter: {
      //     compare: (a, b) => a.firstName.localeCompare(b.firstName),
      //   },
      // },
      {
        title: "Last name",
        dataIndex: "lastName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.lastName.localeCompare(b.lastName),
              }
            : false,
      },
      {
        title: "Email",
        dataIndex: "email",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.email.localeCompare(b.email),
              }
            : false,
      },
      {
        title: "Role",
        dataIndex: "role",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.role.localeCompare(b.role),
              }
            : false,
      },
      {
        title: "Room address",
        dataIndex: "roomAddress",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.roomAddress.localeCompare(b.roomAddress),
              }
            : false,
      },
      {
        title: "Create",
        dataIndex: "createdAt",
        align: "center",
        width: "5%",
        // sorter:tableData.length>0? {
        //   compare: (a, b) => a.createdAt.localeCompare(b.createdAt),
        // },
        render: (record) => {
          return (
            <Row>
              <Col span={24}>{dayjs(record).format("DD/MM/YYYY HH:mm")}</Col>
            </Row>
          );
        },
      },
      {
        title: "Delete",
        dataIndex: "action",
        align: "center",
        width: "2%",
        render: (_, record) => (
          <>
            <Button
              value={record.key}
              type="text"
              icon={<TrashIcon />}
              onClick={showDeleteConfirm}
              disabled={
                accessibility?.team_user_management.allowDelete ? false : true
              }></Button>
          </>
        ),
      },
    ],
    rejectTabsColumn: [
      {
        title: "Reject date",
        dataIndex: "rejectAt",
        align: "center",
        width: "5%",
        render: (_, record) => {
          return (
            <div>
              {record.rejectAt !== "-"
                ? dayjs(record.rejectAt).format("DD/MM/YYYY")
                : "-"}
            </div>
          );
        },
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.rejectAt.localeCompare(b.rejectAt),
              }
            : false,
      },
      {
        title: "Reject by",
        dataIndex: "rejectUser",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.rejectUser.localeCompare(b.rejectUser),
              }
            : false,
      },
      {
        title: "Delete",
        dataIndex: "action",
        align: "center",
        width: "2%",
        render: (_, record) => (
          <>
            <Button
              value={record.key}
              type="text"
              icon={<TrashIcon />}
              onClick={showDeleteConfirm}
              disabled={
                accessibility?.team_user_management.allowDelete ? false : true
              }></Button>
          </>
        ),
      },
      // {
      //   title: "Information",
      //   align: "center",
      //   width: "2%",
      //   render: (record) => {
      //     return (
      //       <Row>
      //         <Col span={24}>
      //           <Button
      //             disabled={
      //               accessibility?.team_user_management.allowView ? false : true
      //             }
      //             value={record.key}
      //             type="text"
      //             icon={<InfoCircleOutlined />}
      //             onClick={async () => {
      //               await setDataInfo(record);
      //               await setIsModalOpenInfo(true);
      //             }}
      //           />
      //         </Col>
      //       </Row>
      //     );
      //   },
      // },
    ],
    waitActiveTabsColumn: [
      {
        title: "Information",
        align: "center",
        width: "1%",
        render: (record) => {
          return (
            <Row>
              <Col span={24}>
                <Button
                  value={record.key}
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={async () => {
                    await setDataInfo(record);
                    await setIsModalOpenInfo(true);
                  }}
                />
              </Col>
            </Row>
          );
        },
      },
      {
        title: "Resend",
        dataIndex: "resend",
        align: "center",
        key: "resend",
        width: "1%",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Button
                  className="buttonSuccess"
                  value={record.key}
                  onClick={showResend}
                  disabled={record?.reSendStatus ? false : true}>
                  Resend
                </Button>
              </Col>
            </Row>
          </>
        ),
      },
      {
        title: "First name",
        dataIndex: "firstName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.firstName.localeCompare(b.firstName),
              }
            : false,
      },
      // {
      //   title: "Middle name",
      //   width: "7%",
      //   dataIndex: "middleName",
      //   align: "center",
      //   sorter: {
      //     compare: (a, b) => a.firstName.localeCompare(b.firstName),
      //   },
      // },
      {
        title: "Last name",
        dataIndex: "lastName",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.lastName.localeCompare(b.lastName),
              }
            : false,
      },
      {
        title: "Email",
        dataIndex: "email",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.email.localeCompare(b.email),
              }
            : false,
      },
      {
        title: "Role",
        dataIndex: "role",
        align: "center",
        width: "5%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.role.localeCompare(b.role),
              }
            : false,
      },
      {
        title: "Room address",
        dataIndex: "roomAddress",
        align: "center",
        width: "7%",
        sorter:
          tableData.length > 0
            ? {
                compare: (a, b) => a.roomAddress.localeCompare(b.roomAddress),
              }
            : false,
      },
      {
        title: "Create",
        dataIndex: "createdAt",
        align: "center",
        width: "5%",
        // sorter:tableData.length>0? {
        //   compare: (a, b) => a.createdAt.localeCompare(b.createdAt),
        // },
        render: (record) => {
          return (
            <Row>
              <Col span={24}>{dayjs(record).format("DD/MM/YYYY HH:mm")}</Col>
            </Row>
          );
        },
      },
      {
        title: "Delete",
        dataIndex: "action",
        align: "center",
        width: "2%",
        render: (_, record) => (
          <>
            <Button
              value={record.key}
              type="text"
              icon={<TrashIcon />}
              onClick={showDeleteConfirm}
              disabled={
                accessibility?.team_user_management.allowDelete ? false : true
              }></Button>
          </>
        ),
      },
    ],
  };
  const [rerender, setRerender] = useState<boolean>(true);
  const [dataApproved, setDataApproved] = useState<any>(null);
  const [dataInfo, setDataInfo] = useState<any>(null);
  const [isModalOpen, setIsModalOpenApproved] = useState(false);
  const [isModalOpenInfo, setIsModalOpenInfo] = useState(false);
  const dispatch = useDispatch<Dispatch>();
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [rejectModal, setRejectModal] = useState<boolean>(false);
  const [RejectId, setRejectId] = useState<string | null>(null);
  const [columnsTable, setColumnsTable] = useState<
    ColumnsType<ResidentInformationDataType>
  >(columnTables.defaultTable);
  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    setParamsData(params);
    await dispatch.resident.getTableData(paramsData);
  };
  const [form] = Form.useForm();
  useEffect(() => {
    (async function () {
      const columns = columnTables.allTabsColumn;
      setColumnsTable(columns);
      setParamsData(params);
      await dispatch.resident.getTableData(paramsData);
    })();
  }, [rerender]);

  const scroll: { x?: number | string } = {
    x: "100vw",
  };
  const onChangeTable: TableProps<ResidentInformationDataType>["onChange"] =
    async (pagination: any, filters, sorter: any, extra) => {
      params = paramsData;
      params.sort = sorter?.order;
      params.sortBy = sorter?.field;
      params.curPage = pagination?.current
        ? pagination?.current
        : PaginationConfig.current;
      params.perPage = pagination?.pageSize
        ? pagination?.pageSize
        : PaginationConfig.defaultPageSize;
      PaginationConfig.pageSize = params.perPage;
      setParamsData(params);
      setCurrentPage(params.curPage);
      setPaginationConfig(PaginationConfig);
      await dispatch.resident.getTableData(paramsData);
    };

  const showDeleteConfirm = ({ currentTarget }: any) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const statusDeleted = await deleteResidentId(currentTarget.value);
        if (statusDeleted) {
          SuccessModal("Successfully deleted");
        } else {
          FailedModal("Failed deleted");
        }
        setRerender(!rerender);
      },
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const onChangeTab = async (key: string) => {
    if (key === "2") {
      const columns = 
        columnTables.waitActiveTabsColumn
     
      setColumnsTable(columns);
      params = paramsData;
      params.reject = false;
      params.verifyByJuristic = true;
      params.isActive = false;
      params.curPage = 1;
      params.perPage = 10;
      PaginationConfig.pageSize = 10;
      setParamsData(params);
      setCurrentPage(params.curPage);
      setPaginationConfig(PaginationConfig);
      await dispatch.resident.getTableData(paramsData);
    } else if (key === "3") {
      const columns = columnTables.defaultTable.concat(
        columnTables.rejectTabsColumn
      );
      setColumnsTable(columns);
      params = paramsData;
      params.reject = true;
      params.verifyByJuristic = true;
      params.curPage = 1;
      params.perPage = 10;
      PaginationConfig.pageSize = 10;
      setParamsData(params);
      setCurrentPage(params.curPage);
      setPaginationConfig(PaginationConfig);
      await dispatch.resident.getTableData(paramsData);
    } else {
      params = paramsData;
      params.reject = false;
      params.verifyByJuristic = false;
      params.curPage = 1;
      params.perPage = 10;
      PaginationConfig.pageSize = 10;
      const columns = columnTables.allTabsColumn;
      setColumnsTable(columns);
      setParamsData(params);
      setCurrentPage(params.curPage);
      setPaginationConfig(PaginationConfig);
      await dispatch.resident.getTableData(paramsData);
    }
  };

  const itemsTabs: TabsProps["items"] = [
    {
      key: "1",
      label: `Waiting for confirmation`,
    },
    {
      key: "2",
      label: `Pending verification`,
    },
    {
      key: "3",
      label: `Reject`,
    },
  ];
  //approve
  const showApproved = ({ currentTarget }: any) => {
    ConfirmModal({
      title: "Are you sure you want to approved this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      async onOk() {
        const statusApproved = await ApprovedId(currentTarget.value);
        if (statusApproved) {
          SuccessModal("Successfully approve");
        } else {
          FailedModal("Failed approve");
        }
        setRerender(!rerender);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  //reject
  const showRejectConfirm = (rejectValue: rejectRequest) => {
    ConfirmModal({
      title: "Confirm information in note.",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      async onOk() {
        const statusReject = await RejectById(rejectValue);

        if (statusReject) {
          SuccessModal("Successfully reject");
        } else {
          FailedModal("Failed reject");
        }
        setRejectModal(false);
        form.resetFields();
        setRerender(!rerender);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };


  const showResend = ({ currentTarget }: any) => {
    ConfirmModal({
      title: "Are you sure you want to resend this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      async onOk() {
        const statusResend = await ResendById(currentTarget.value);
        if (statusResend) {
          SuccessModal("Successfully Resend");
          const columns = 
          columnTables.waitActiveTabsColumn
       
        setColumnsTable(columns);
        params = paramsData;
        params.reject = false;
        params.verifyByJuristic = true;
        params.isActive = false;
        params.curPage = 1;
        params.perPage = 10;
        PaginationConfig.pageSize = 10;
        setParamsData(params);
        setCurrentPage(params.curPage);
        setPaginationConfig(PaginationConfig);
        await dispatch.resident.getTableData(paramsData);
        } else {
          FailedModal("Failed Resend");
        }
       // setRerender(!rerender);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const showReject = async ({ currentTarget }: any) => {
    setRejectId(currentTarget.value);
    setRejectModal(true);
  };
  const onFinish = async (values: any) => {
    const requestReject: rejectRequest = {
      userId: `${RejectId}`,
      rejectReason: values.rejectReason,
    };
    showRejectConfirm(requestReject);
  };
  const onFinishFailed = (errorInfo: any) => {
    console.error("Failed:", errorInfo);
  };
  const handleCancel = async () => {
    setRejectId(null);
    form.resetFields();
    setRejectModal(false);
  };
  const onChange = async (e: any) => {
    params = paramsData;
    if (e) {
      params.startDate = dayjs(e[0]).startOf("month").format("YYYY-MM");
      params.endDate = dayjs(e[1]).endOf("month").format("YYYY-MM");
    } else {
      params.startDate = undefined;
      params.endDate = undefined;
    }
    setParamsData(params);
    await dispatch.resident.getTableData(paramsData);
  };
  return (
    <>
      <Header title="Resident’s sign up" />
      <div className="userManagementTopActionLeftGroup">
        <DatePicker
          className="userManagementDatePicker"
          onChange={onChange}
          picker="month"
        />
        <SearchBox
          placeholderText="Search by first name"
          className="userManagementSearchBox"
          onSearch={onSearch}
        />
      </div>

      <Row>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={itemsTabs} onChange={onChangeTab} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            style={{ width: "100%" }}
            columns={columnsTable}
            pagination={PaginationConfigState}
            dataSource={tableData}
            loading={loading}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>
      <InfoResidentSignUp
        callBack={async (isOpen: boolean) => await setIsModalOpenInfo(isOpen)}
        isOpen={isModalOpenInfo}
        resident={dataInfo}
      />
      <ApprovedResidentSignUp
        callBack={async (isOpen: boolean) => setIsModalOpenApproved(isOpen)}
        isOpen={isModalOpen}
        resident={dataApproved}
      />
      <Modal
        title="Please input note to reject this"
        open={rejectModal}
        footer={[
          <div style={{}}>
            <SmallButton
              className="saveButton"
              form={form}
              formSubmit={form.submit}
              message="OK"
            />
          </div>,
        ]}
        //onOk={form.submit}
        onCancel={handleCancel}
        //  okButtonProps={{ style: {marginRight:30 } }}
        cancelButtonProps={{ style: { display: "none" } }}>
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 20 }}
          wrapperCol={{ span: 22 }}
          style={{ width: "110%", paddingTop: 10 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <Form.Item label="Note" name="rejectReason" rules={requiredRule}>
            <Input.TextArea
              showCount
              style={{ height: 120, resize: "none" }}
              rows={4}
              maxLength={200}
              placeholder="Please input detail"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default ResidentSignUp;
