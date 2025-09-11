import { useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";

import Header from "../../../components/templates/Header";
// import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ModalFormUpdatePlan } from "../components/ModalFormUpdatePlan";
import {
  SosWarningDataType,
  paginationSosWarning,
} from "../../../stores/interfaces/SosWarning";
import { sosWarningData } from "../dummyData/Table";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import {
  Row,
  Col,
  Input,
  Button,
  Table,
} from "antd";
import {
  VerticalAlignBottomOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

const SOSBuildingPlan = () => {
  // Initial
  const {
    curPage,
    pageSizeOptions,
    setCurPage,
    deleteAndHandlePagination,
  } = usePagination();
  // variables
  //   const dispatch = useDispatch<Dispatch>();
  //   const data = useSelector((state: RootState) => state.announcement.tableData);
  //   const announcementMaxLength = useSelector(
  //     (state: RootState) => state.announcement.announcementMaxLength
  //   );

  // setting pagination Option


  const dowloadBuildingPlan = () => {
    console.log("dowloadBuildingPlan");
  };



  const onSearch = (value: string) => {
    console.log("Search:", value);
  };

  const onDelete = async (record: SosWarningDataType) => {
    console.log("onDelete", record);
    ConfirmModal({
      message:
        "When you delete this data, you will not be able to retrieve this data back.",
      title: "Confirm delete this data",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        deleteAndHandlePagination({
          dataLength: sosWarningData.length,
          fetchData: () => {},
          onDelete: async () => {
            await new Promise((resolve) => {
              setTimeout(resolve, 300);
            });
            SuccessModal("Delete data successfully");
          },
        });
      },
    });
  };

  let params: paginationSosWarning = {
    perPage: pageSizeOptions[0],
    curPage: curPage,
  };

  const [paramsData, setParamsData] = useState<paginationSosWarning>(params);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSosWarning, setSelectedSosWarning] =
    useState<SosWarningDataType | null>(null);
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: curPage,
    showSizeChanger: true,
    total: sosWarningData?.length,
  };

  const { Search } = Input;
  const onChangeTable: TableProps<SosWarningDataType>["onChange"] = async (
    pagination: any,
    sorter: any,
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
    // await dispatch.visitor.getTableData(paramsData);
  };
  const onEdit = (record: SosWarningDataType) => {
    setSelectedSosWarning(record);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<SosWarningDataType> = [
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
    },
    {
      title: "Tel",
      dataIndex: "tel",
      align: "center",
    },
    {
      title: "Plan Type",
      dataIndex: "planType",
      align: "center",
    },
    {
      title: "Address",
      dataIndex: "address",
      align: "center",
    },
    {
      title: "Latitude",
      dataIndex: "lat",
      align: "center",
    },
    {
      title: "Longitude",
      align: "center",
      dataIndex: "long",
      width: 200,
    },
    {
      title: "Action",
      align: "center",
      dataIndex: "action",
      width: 150,
      render: (_, record) => (
        <Row>
          <Col span={24}>
            <div className="flex justify-center items-center gap-2 ">
              <div onClick={() => onEdit(record)} className="cursor-pointer">
                <EditOutlined />
              </div>
              <div onClick={() => onDelete(record)} className="cursor-pointer">
                <DeleteOutlined />
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
  ];
  const scroll: { x?: number | string } = {
    x: "10vw",
  };

  return (
    <>
      <ModalFormUpdatePlan
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSosWarning(null);
        }}
        selectedSosWarning={selectedSosWarning}
      />
      <Header title="Building plan" />
      <Row style={{ marginTop: 15, marginBottom: 15 }}>
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
        <Col span={14} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            style={{ marginRight: 10 }}
            onClick={dowloadBuildingPlan}
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
            dataSource={sosWarningData}
            loading={false}
            scroll={scroll}
            pagination={PaginationConfig}
            onChange={onChangeTable}
          />
        </Col>
      </Row>
    </>
  );
};

export default SOSBuildingPlan;
