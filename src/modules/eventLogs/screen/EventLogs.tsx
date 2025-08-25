import React, { useEffect, useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import { usePermission } from "../../../utils/hooks/usePermission";

import Header from "../../../components/templates/Header";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  changeLockedById,
  deleteEventLogsById,
  downloadEventLogs,
} from "../service/api/EventLogsServiceAPI";
import { Row, Col, DatePicker, Input, Button, Modal, Switch } from "antd";
import type { DatePickerProps } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import CreateAddEventLog from "../components/CreateAddEventLog";
import EditEventLog from "../components/EditEventLog";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import {
  dataEventLogsType,
  conditionPage,
  IChangeLockedById,
} from "../../../stores/interfaces/EventLog";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";
const { confirm } = Modal;
const EventLogs = () => {
  const { loading, tableDataEventLog, total } = useSelector(
    (state: RootState) => state.eventLog
  );
  const { curPage, perPage, setCurPage, deleteAndHandlePagination } =
    usePagination();
  const PaginationConfig = {
    defaultPageSize: perPage,
    current: curPage,
    showSizeChanger: false,
    total: total,
  };
  let params: conditionPage = {
    perPage: perPage,
    curPage: curPage,
  };
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const dateFormat = "MMMM,YYYY";
  const { Search } = Input;
  const scroll: { x?: number | string } = {
    x: "max-content",
  };

  const columns: ColumnsType<dataEventLogsType> = [
    {
      title: "Title",
      dataIndex: "title",
      align: "center",
      sorter: {
        compare: (a, b) => a.title.localeCompare(b.title),
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
    },
    {
      title: "Locked",
      dataIndex: "locked",
      align: "center",
      key: "locked",
      width: "7%",
      render: (_, record) => (
        <>
          <Row>
            <Col span={24}>
              <Switch
                checked={record.locked}
                onChange={async () => {
                  await switchChange(record);
                }}
                disabled={!access("events", "edit")}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: "Total number of pax",
      dataIndex: "limitPeople",
      align: "center",
      render: (_, record) => {
        return (
          <div>{`${record.currentBookingPeople ?? 0} / ${
            record.limitPeople ?? 1
          }`}</div>
        );
      },
    },
    {
      title: "Create date",
      dataIndex: "createDate",
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
      // sorter: {
      //   compare: (a, b) => a.moveInDate.localeCompare(b.moveInDate),
      // },
    },
    {
      title: "Start date",
      dataIndex: "startDate",
      align: "center",
      render: (_, record) => {
        return (
          <div>
            {record.startDate !== "-"
              ? dayjs(record.startDate).format("DD/MM/YYYY")
              : "-"}
          </div>
        );
      },
      // sorter: {
      //   compare: (a, b) => a.moveInDate.localeCompare(b.moveInDate),
      // },
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      align: "center",
      // sorter: {
      //   compare: (a, b) => a.moveInDate.localeCompare(b.moveInDate),
      // },
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      align: "center",
      // sorter: {
      //   compare: (a, b) => a.moveInDate.localeCompare(b.moveInDate),
      // },
    },
    {
      title: "Visitor register",
      dataIndex: "visitorRegister",
      align: "center",
      width: "7%",
      // sorter: {
      //   compare: (a, b) => a.visitorRegister.localeCompare(b.visitorRegister),
      // },
      render: (_, record) => {
        return <div>{record.visitorRegister ? "Allow" : "Not Allow"}</div>;
      },
    },
    {
      title: "Created by",
      dataIndex: "createBy",
      align: "center",
      width: "7%",
      // sorter: {
      //   compare: (a, b) => a.email.localeCompare(b.email),
      // },
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: "8%",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button
            value={record.key}
            onClick={async () => {
              await editButton(record);
            }}
            type="text"
            icon={<EditOutlined />}
            disabled={!access("events", "edit")}
          />
          <Button
            value={record.key}
            type="text"
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirm}
            disabled={!access("events", "delete")}
          />
        </>
      ),
    },
  ];
  // States
  const [rerender, setRerender] = useState<boolean>(true);
  const [dataEdit, setDataEdit] = useState<dataEventLogsType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const dispatch = useDispatch<Dispatch>();
  const { RangePicker } = DatePicker;

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const onChangeTable: TableProps<dataEventLogsType>["onChange"] = async (
    pagination: any,
    sorter: any
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
    setParamsData(params);
    setCurPage(params.curPage);
    await dispatch.eventLog.getTableDataEventLogs(paramsData);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    await setParamsData(params);
    await dispatch.eventLog.getTableDataEventLogs(paramsData);
  };

  const editButton = async (data: dataEventLogsType) => {
    setDataEdit(data);
    setIsModalOpen(true);
  };

  const showDeleteConfirm = ({ currentTarget }: any) => {
    confirm({
      title: "Confirm action",
      icon: null,
      content: "Are you sure you want to delete event logs?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        deleteAndHandlePagination({
          dataLength: tableDataEventLog.length,
          fetchData: fetchData,
          onDelete: async () => {
            const statusDeleted = await deleteEventLogsById(
              currentTarget.value
            );
            if (statusDeleted) {
              SuccessModal("Event logs has been successfully deleted.");
            } else {
              FailedModal("Failed deleted");
            }
          },
        });
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
    await dispatch.eventLog.getTableDataEventLogs(paramsData);
  };

  const switchChange = async (record: dataEventLogsType) => {
    let data: IChangeLockedById = {
      id: record.key,
      locked: !record.locked,
    };
    let message: string = "Are you sure you want to lock this?";
    if (record.locked) {
      message = "Are you sure you want to unlock this?";
    }
    confirm({
      title: "Confirm action",
      icon: null,
      content: message,
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      async onOk() {
        const statusDeleted = await changeLockedById(data);
        if (statusDeleted) {
          SuccessModal("Successfully locked");
        } else {
          FailedModal("Failed locked");
        }
        setRerender(!rerender);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const fetchData = async () => {
    setParamsData(params);
    await dispatch.eventLog.getTableDataEventLogs(params);
  };

  useEffect(() => {
    fetchData();
  }, [rerender, curPage]);

  return (
    <>
      <Header title="Event logs" />
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
            placeholder="Search by title"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: 300 }}
          />
        </Col>

        <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            onClick={async () => {
              setIsModalCreate(true);
            }}
          >
            Add new
          </Button>
          <CreateAddEventLog
            callBack={async (isOpen: boolean, created: boolean) => {
              setIsModalCreate(isOpen);
              if (created) {
                setRerender(!rerender);
              }
            }}
            isOpen={isModalCreate}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            pagination={PaginationConfig}
            dataSource={tableDataEventLog}
            loading={loading}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>
      <EditEventLog
        callBack={async (isOpen: boolean, saved: boolean) => {
          setIsModalOpen(isOpen);
          if (saved) {
            setRerender(!rerender);
          }
        }}
        isOpen={isModalOpen}
        eventLogs={dataEdit}
      />
    </>
  );
};

export default EventLogs;
