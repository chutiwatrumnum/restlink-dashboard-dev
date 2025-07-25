import { useEffect, useState } from "react";
import Header from "../../../components/templates/Header";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { changeCollectedById, deleteDeliveryLogsById, dowloadDeliveryLogs, getDataBlock } from "../service/api/DeliveryLogsServiceAPI";
import { Row, Col, DatePicker, Input, Button, Modal, Checkbox, Table, Select } from "antd";
import type { DatePickerProps } from "antd";
import { DeleteOutlined, EditOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import CreateAddEventLog from "../components/CreateAddDeliveryLog";
import EditEventLog from "../components/EditDeliveryLog";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { dataDeliveryLogsType, conditionPage, unitDetail } from "../../../stores/interfaces/DeliveryLogs";
const { confirm } = Modal;

const DeliveryLogs = () => {
    const { loading, tableDataDeliveryLog, total } = useSelector((state: RootState) => state.deliveryLogs);
    const [currentPage, setCurrentPage] = useState<number>(1);
    // setting pagination Option
    const pageSizeOptions = [10, 20, 60, 100];
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
    const [dataEdit, setDataEdit] = useState<dataDeliveryLogsType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCreate, setIsModalCreate] = useState(false);
    const [paramsData, setParamsData] = useState<conditionPage>(params);
    const [unit, setunitDetail] = useState<unitDetail[]>([]);
    const dispatch = useDispatch<Dispatch>();
    const { RangePicker } = DatePicker;
    const customFormat: DatePickerProps["format"] = (value) => `Month : ${value.format(dateFormat)}`;
    const dateFormat = "MMMM,YYYY";

    const { Search } = Input;
    const scroll: { x?: number | string } = {
     x: 1500, // ปรับค่าตามความกว้างรวมของคอลัมน์
    };
    
    useEffect(() => {
        (async function () {
            setParamsData(params);
            await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
            await initDataCreate();
        })();
    }, [rerender]);

    const onChangeTable: TableProps<dataDeliveryLogsType>["onChange"] = async (pagination: any, filters, sorter: any, extra) => {
        params = paramsData;
        params.sort = sorter?.order;
        params.sortBy = sorter?.field;
        params.curPage = pagination?.current ? pagination?.current : PaginationConfig.current;
        params.perPage = pagination?.pageSize ? pagination?.pageSize : PaginationConfig.defaultPageSize;
        await setParamsData(params);
        await setCurrentPage(params.curPage);
        await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
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
      //   {
      //     title: "Sender type",
      //     dataIndex: "senderType",
      //     align: "center",
      //     ellipsis: true,
      //     width: "10%",
      //     sorter: {
      //       compare: (a, b) => a.senderType.localeCompare(b.senderType),
      //     },
      //   },
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
        width: "auto",
        render: (_, record) => (
          <>
            <Row>
              <Col span={24}>
                <Checkbox
                  disabled={record.collected}
                  checked={record.collected}
                  value={record.key}
                  onChange={changeCollected}></Checkbox>
              </Col>
            </Row>
          </>
        ),
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        align: "center",
        width: 120, // กำหนดความกว้างที่เหมาะสม
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
            />
            <Button
              value={record.key}
              type="text"
              icon={<DeleteOutlined />}
              onClick={showDeleteConfirm}
            />
          </>
        ),
      },
    ];

    const editButton = async (data: dataDeliveryLogsType) => {
        await setDataEdit(data);
        await setIsModalOpen(true);
    };

    const showDeleteConfirm = ({ currentTarget }: any) => {
        confirm({
            title: "Are you sure you want to delete this?",
            icon: null,
            // content: "Some descriptions",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            centered: true,
            async onOk() {
                const statusDeleted = await deleteDeliveryLogsById(currentTarget.value);
                if (statusDeleted) {
                    // dispatch.common.updateSuccessModalState({
                    //   open: true,
                    //   text: "Successfully deleted",
                    // });
                    alert("delete successfully");
                    await setRerender(!rerender);
                } else {
                    // dispatch.common.updateSuccessModalState({
                    //   open: true,
                    //   status: "error",
                    //   text: "Failed deleted",
                    // });
                    alert("Failed deleted");
                }
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };
    const changeCollected = async (e: CheckboxChangeEvent) => {
        confirm({
            title: "Are you sure you want to collected this?",
            icon: null,
            okText: "Yes",
            cancelText: "No",
            centered: true,
            async onOk() {
                const statusDeleted = await changeCollectedById(e.target.value);
                if (statusDeleted) {
                    // dispatch.common.updateSuccessModalState({
                    //   open: true,
                    //   text: "Successfully changed",
                    // });
                    alert("changed successfully");
                } else {
                    // dispatch.common.updateSuccessModalState({
                    //   open: true,
                    //   status: "error",
                    //   text: "Failed changed",
                    // });
                    alert("Failed changed");
                }
                setRerender(!rerender);
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
        setParamsData(params);
        params.curPage = 1;
        await dispatch.deliveryLogs.getTableDataDeliveryLogs(paramsData);
    };
    const initDataCreate = async () => {
        const dataeblock = await getDataBlock();
        setunitDetail(dataeblock?.dataselectblock as unitDetail[]);
    };
    const exportEventLogs = ({ currentTarget }: any) => {
        confirm({
            title: "Are you sure you want to export file this?",
            icon: null,
            okText: "Yes",
            okType: "primary",
            cancelText: "No",
            centered: true,
            async onOk() {
                const statusSuccess = await dowloadDeliveryLogs();
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };
    const onChangeUnit = async (value: string) => {
        params = paramsData;
        params.curPage = 1;
        params.unitId = value
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
          <Col
            span={6}
            style={{ display: "flex", justifyContent: "flex-start" }}>
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
            style={{ display: "flex", justifyContent: "flex-start","paddingLeft":"10px" }}>
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
            {/* <Button
              type="primary"
              style={{ marginRight: 10 }}
              onClick={exportEventLogs}>
              <VerticalAlignBottomOutlined />
              Export
            </Button> */}

            <Button
              type="primary"
              onClick={() => {
                setIsModalCreate(true);
              }}>
              Add new
            </Button>
            <CreateAddEventLog
              callBack={(isOpen: boolean, created: boolean) => {
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
            if (saved) {
              setRerender(!rerender);
            }
          }}
          isOpen={isModalOpen}
          deliveryLogs={dataEdit}
        />
      </>
    );
};

export default DeliveryLogs;
