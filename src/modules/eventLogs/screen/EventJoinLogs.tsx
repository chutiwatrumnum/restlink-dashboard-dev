import { useEffect, useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";

import Header from "../../../components/templates/Header";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  deleteEventJoinById,
  getDataJoinLogByid,
  downloadEventJoinLogs,
} from "../service/api/EventLogsServiceAPI";
import { Row, Col, DatePicker, Input, Button, Modal } from "antd";
import type { DatePickerProps } from "antd";
import { InfoCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  dataEventJoinLogsType,
  conditionPage,
} from "../../../stores/interfaces/EventLog";
import InfoEventJoinLogs from "../components/InfoEventJoinLogs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
const { confirm } = Modal;

const EventJoinLogs = () => {
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.eventLog
  );
  const { curPage, perPage, setCurPage, deleteAndHandlePagination } =
    usePagination();

  // setting pagination Option
  const PaginationConfig = {
    current: curPage,
    showSizeChanger: false,
    total: total,
  };
  let params: conditionPage = {
    perPage: perPage,
    curPage: curPage,
  };
  const [rerender, setRerender] = useState<boolean>(true);
  const [dataInfo, setDataInfo] = useState<any>(null);
  const [isModalOpenInfo, setIsModalOpenInfo] = useState(false);
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const dispatch = useDispatch<Dispatch>();
  const { RangePicker } = DatePicker;
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const dateFormat = "MMMM,YYYY";

  const { Search } = Input;
  const scroll: { x?: number | string } = {
    x: "max-content",
  };

  const onChangeTable: TableProps<dataEventJoinLogsType>["onChange"] = async (
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
    setParamsData(params);
    setCurPage(params.curPage);
    await dispatch.eventLog.getTableData(paramsData);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    await setParamsData(params);
    await dispatch.eventLog.getTableData(paramsData);
  };
  const columns: ColumnsType<dataEventJoinLogsType> = [
    {
      title: "Event name",
      dataIndex: "eventName",
      align: "center",
      width: "6%",
      sorter: {
        compare: (a, b) => a.eventName.localeCompare(b.eventName),
      },
    },
    {
      title: "Joining date",
      dataIndex: "joiningDate",
      align: "center",
      width: "6%",
      sorter: {
        compare: (a, b) => a.joiningDate.localeCompare(b.joiningDate),
      },
    },
    {
      title: "Room number",
      dataIndex: "unitNo",
      align: "center",
      width: "6%",
      sorter: {
        compare: (a, b) => a.unitNo.localeCompare(b.unitNo),
      },
    },
    {
      title: "Participant",
      dataIndex: "participant",
      align: "center",
      key: "participant",
      width: "5%",
      sorter: {
        compare: (a, b) => a.participant - b.participant,
      },
    },
    {
      title: "Booked by",
      dataIndex: "bookingBy",
      align: "center",
      key: "bookingBy",
      width: "5%",
    },

    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: "2%",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button
            value={record.key}
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={async () => {
              const dataInfo = await getDataJoinLogByid(record.key);
              if (dataInfo?.status) {
                await setDataInfo(dataInfo.data);
                await setIsModalOpenInfo(true);
              }
            }}
          />
          <Button
            value={record.key}
            type="text"
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirm}
          ></Button>
        </>
      ),
    },
  ];
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
          dataLength: tableData.length,
          fetchData: fetchData,
          onDelete: async () => {
            const statusDeleted = await deleteEventJoinById(
              currentTarget.value
            );
            if (statusDeleted) {
              SuccessModal("Event joining logs has been successfully deleted.");
            } else {
              FailedModal("Failed to delete");
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
    await dispatch.eventLog.getTableData(paramsData);
  };

  const fetchData = async () => {
    setParamsData(params);
    await dispatch.eventLog.getTableData(paramsData);
  };

  useEffect(() => {
    fetchData();
  }, [rerender]);
  return (
    <>
      <Header title="Event joining logs" />
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
            placeholder="Search by event name"
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: 300 }}
          />
        </Col>
        <Col span={4} style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={exportEventJoinLogs}>
            Export
          </Button> */}
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            columns={columns}
            pagination={PaginationConfig}
            dataSource={tableData}
            loading={loading}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>
      <InfoEventJoinLogs
        callBack={async (isOpen: boolean) => await setIsModalOpenInfo(isOpen)}
        isOpen={isModalOpenInfo}
        eventjoinLog={dataInfo}
      />
    </>
  );
};

export default EventJoinLogs;
