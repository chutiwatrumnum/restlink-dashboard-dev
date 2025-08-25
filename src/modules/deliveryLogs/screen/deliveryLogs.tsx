import { useEffect, useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";

import Header from "../../../components/templates/Header";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  changeCollectedById,
  deleteDeliveryLogsById,
  dowloadDeliveryLogs,
  getDataBlock,
} from "../service/api/DeliveryLogsServiceAPI";
import {
  Row,
  Col,
  DatePicker,
  Input,
  Button,
  Modal,
  Checkbox,
  Table,
  Select,
} from "antd";
import type { DatePickerProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CreateAddEventLog from "../components/CreateAddDeliveryLog";
import EditEventLog from "../components/EditDeliveryLog";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import {
  dataDeliveryLogsType,
  conditionPage,
  unitDetail,
} from "../../../stores/interfaces/DeliveryLogs";

// ⭐ import usePermission
import { usePermission } from "../../../utils/hooks/usePermission";

const { confirm } = Modal;

const DeliveryLogs = () => {
  const { loading, tableDataDeliveryLog, total } = useSelector(
    (state: RootState) => state.deliveryLogs
  );

  // ⭐ ดึง permission
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const {
    curPage,
    perPage,
    pageSizeOptions,
    onPageChange,
    setCurPage,
    setPerPage,
    deleteAndHandlePagination,
  } = usePagination();

  const PaginationConfig = {
    current: curPage,
    pageSize: perPage,
    onChange: onPageChange,
    showSizeChanger: false,
    pageSizeOptions: pageSizeOptions,
    total: total,
  };

  let params: conditionPage = {
    perPage: perPage,
    curPage: curPage,
  };

  const [rerender, setRerender] = useState<boolean>(true);
  const [dataEdit, setDataEdit] = useState<dataDeliveryLogsType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [unit, setunitDetail] = useState<unitDetail[]>([]);
  const dispatch = useDispatch<Dispatch>();
  const { RangePicker } = DatePicker;
  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const { Search } = Input;

  const scroll: { x?: number | string } = { x: "max-content" };

  useEffect(() => {
    (async function () {
      setParamsData(params);
      await dispatch.deliveryLogs.getTableDataDeliveryLogs(params);
      await initDataCreate();
    })();
  }, [rerender, curPage]);

  const onChangeTable: TableProps<dataDeliveryLogsType>["onChange"] = async (
    pagination: any,
    filters,
    sorter: any
  ) => {
    const updatedParams = {
      ...paramsData,
      sort: sorter?.order,
      sortBy: sorter?.field,
      curPage: pagination.current,
      perPage: pagination.pageSize,
    };

    setCurPage(pagination.current);
    setPerPage(pagination.pageSize);
    setParamsData(updatedParams);

    await dispatch.deliveryLogs.getTableDataDeliveryLogs(updatedParams);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    params.curPage = 1;
    setParamsData(params);
    await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
  };

  const columns: ColumnsType<dataDeliveryLogsType> = [
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
    },
    {
      title: "Contact",
      dataIndex: "contact",
      align: "center",
    },
    {
      title: "Tracking No.",
      dataIndex: "trackingNumber",
      align: "center",
      ellipsis: true,
      width: "10%",
    },
    {
      title: "Block No.",
      dataIndex: "blockNo",
      align: "center",
      sorter: {
        compare: (a, b) => a.blockNo.localeCompare(b.blockNo),
      },
    },
    {
      title: "Room number",
      dataIndex: "unitNo",
      align: "center",
      sorter: {
        compare: (a, b) => a.unitNo.localeCompare(b.unitNo),
      },
    },
    {
      title: "Create date",
      dataIndex: "createdAt",
      align: "center",
      render: (_, record) => (
        <div>
          {record.createdAt !== "-"
            ? dayjs(record.createdAt).format("DD/MM/YYYY")
            : "-"}
        </div>
      ),
    },
    {
      title: "From date-time",
      dataIndex: "FromDateTime",
      align: "center",
    },
    {
      title: "To date-time",
      dataIndex: "ToDateTime",
      align: "center",
    },
    {
      title: "Pick-up type",
      dataIndex: "pickUpType",
      align: "center",
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
    },
    {
      title: "Collected",
      dataIndex: "collected",
      align: "center",
      render: (_, record) => (
        <Checkbox
          disabled={record.collected || !access("parcels", "edit")}
          checked={record.collected}
          value={record.key}
          onChange={changeCollected}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <>
          <Button
            value={record.key}
            onClick={async () => editButton(record)}
            type="text"
            icon={<EditOutlined />}
            disabled={!access("parcels", "edit")}
          />
          <Button
            value={record.key}
            type="text"
            icon={<DeleteOutlined />}
            onClick={showDeleteConfirm}
            disabled={!access("parcels", "delete")}
          />
        </>
      ),
    },
  ];

  const editButton = async (data: dataDeliveryLogsType) => {
    setDataEdit(data);
    setIsModalOpen(true);
  };

  const showDeleteConfirm = ({ currentTarget }: any) => {
    confirm({
      title: "Are you sure you want to delete this?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      async onOk() {
        deleteAndHandlePagination({
          dataLength: tableDataDeliveryLog.length,
          onDelete: async () => {
            await deleteDeliveryLogsById(currentTarget.value);
          },
          fetchData: async () => {
            await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
          },
        });
      },
    });
  };

  const changeCollected = async (e: CheckboxChangeEvent) => {
    confirm({
      title: "Are you sure you want to collected this?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      async onOk() {
        await changeCollectedById(e.target.value);
        setRerender(!rerender);
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
    setParamsData(params);
    params.curPage = 1;
    await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
  };

  const initDataCreate = async () => {
    const dataeblock = await getDataBlock();
    setunitDetail(dataeblock?.dataselectblock as unitDetail[]);
  };

  const exportEventLogs = () => {
    confirm({
      title: "Are you sure you want to export file this?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      async onOk() {
        await dowloadDeliveryLogs();
      },
    });
  };

  const onChangeUnit = async (value: string) => {
    params = paramsData;
    params.curPage = 1;
    params.unitId = value;
    setParamsData(params);
    await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
  };

  return (
    <>
      <Header title="Parcel" />
      <Row style={{ marginTop: 15, marginBottom: 15 }}>
        <Col span={6}>
          <RangePicker
            onChange={handleDate}
            style={{ width: "95%" }}
            picker="month"
            format={customFormat}
          />
        </Col>
        <Col span={6} style={{ display: "flex", justifyContent: "flex-start" }}>
          <Search
            placeholder="Search by tracking no."
            allowClear
            onSearch={onSearch}
            className="searchBox"
            style={{ width: 300 }}
          />
        </Col>
        <Col
          span={6}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingLeft: "10px",
          }}
        >
          <Select
            showSearch
            allowClear
            placeholder="Select Room number"
            optionFilterProp="label"
            onChange={onChangeUnit}
            options={unit}
          />
        </Col>

        <Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* ปุ่ม Export */}
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={exportEventLogs}
            icon={<VerticalAlignBottomOutlined />}
            disabled={!access("parcels", "view")}
          >
            Export
          </Button>

          {/* ปุ่ม Add new */}
          <Button
            type="primary"
            onClick={() => setIsModalCreate(true)}
            disabled={!access("parcels", "create")}
          >
            Add new
          </Button>

          <CreateAddEventLog
            callBack={(isOpen: boolean, created: boolean) => {
              setIsModalCreate(isOpen);
              if (created) setRerender(!rerender);
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
            dataSource={tableDataDeliveryLog}
            loading={loading}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>

      <EditEventLog
        callBack={(isOpen: boolean, saved: boolean) => {
          setIsModalOpen(isOpen);
          if (saved) setRerender(!rerender);
        }}
        isOpen={isModalOpen}
        deliveryLogs={dataEdit}
      />
    </>
  );
};

export default DeliveryLogs;
