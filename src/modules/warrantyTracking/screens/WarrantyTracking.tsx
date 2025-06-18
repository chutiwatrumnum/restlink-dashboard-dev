import { useState, } from "react";
import Header from "../../../components/templates/Header";
// import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ModalFormUpdate } from "../components/modalFormUpdate";
import { warrantyData } from "../dummyData/table";
import { ExpandedRowRender } from "../components/expand";

import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import {
  Row,
  Col,
  DatePicker,
  DatePickerProps,
  Input,
  Button,
  Table,
  Form,
  
} from "antd";

import dayjs from 'dayjs';

import {
  WarrantyDataType,
  WarrantyDetailsType,
  paginationWarranty
} from "../../../stores/interfaces/Warranty";

const WarrantyTracking = () => {
  // variables
  //   const dispatch = useDispatch<Dispatch>();
  //   const data = useSelector((state: RootState) => state.announcement.tableData);
  //   const announcementMaxLength = useSelector(
  //     (state: RootState) => state.announcement.announcementMaxLength
  //   );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyDetailsType | null>(null);
  // setting pagination Option
  const pageSizeOptions = [15, 20, 60, 100];
  
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: true,
    total: warrantyData?.length,
    ...pageSizeOptions,
  };
  let params: paginationWarranty = {
    perPage: pageSizeOptions[0],
    curPage: currentPage
  };
  
  const [paramsData, setParamsData] = useState<paginationWarranty>(params);
  const { RangePicker } = DatePicker;
  
  const scroll: { x?: number | string } = {
    x: "10vw"
  };


  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const { Search } = Input;

  const columns: ColumnsType<WarrantyDataType> = [
    {
      title: "No.",
      dataIndex: "key",
      align: "center",
    },
    {
      title: "Room No.",
      dataIndex: "address",
      align: "center",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      align: "center",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      align: "center",
    },
    {
      title: "Nationality",
      dataIndex: "nationality",
      align: "center",
    },
    {
      title: "Email",
      align: "center",
      dataIndex: "email",
      width: 200
    },
    {
      title: "Warranty Lists",
      align: "center",
      dataIndex: "email",
      width: 150,
      render: (_, record) => (
        <Row>
          <Col span={24}>
            <Button type="primary" onClick={() => handleSave()}>
              Add Warranty
            </Button>
          </Col>
        </Row>
      )
    }
  ];

  // Actions

  const handleDate = async (e: any) => {};

  const onSearch = async (value: string) => {
    console.log(value, "value");
  };

  const dowloadVisitorLogs = async () => {
    console.log("dowloadVisitorLogs");
  };



  const [imageUrl, setImageUrl] = useState<string>();
  const [form] = Form.useForm();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };



  const onChangeTable: TableProps<WarrantyDataType>["onChange"] = async (
    pagination: any,
    filters,
    sorter: any,
    extra
  ) => {
    params = paramsData;
    params.sort = sorter?.order;
    params.sortBy = sorter?.field;
    params.curPage = pagination?.current ? pagination?.current : PaginationConfig.current;
    params.perPage = pagination?.pageSize ? pagination?.pageSize : PaginationConfig.defaultPageSize;
    await setParamsData(params);
    await setCurrentPage(params.curPage);
    // await dispatch.visitor.getTableData(paramsData);
  };

  const handleSave = () => {
    const warrantyDetails: unknown = null;
      setSelectedWarranty(warrantyDetails as WarrantyDetailsType);
      setIsModalOpen(true);
  }

  const handleEditClick = (record: WarrantyDetailsType) => {
    const warrantyDetails: WarrantyDetailsType = {
      ...record,
      warrantyName: record.warrantyName,
      serialNumber: record.serialNumber,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate).format('YYYY-MM-DD') : '',
      expireDate: record.expireDate ? dayjs(record.expireDate).format('YYYY-MM-DD') : '',
      image: record.image,
      createdAt: record.createdAt || new Date().toISOString()
    };
    setSelectedWarranty(warrantyDetails);
    setIsModalOpen(true);
  };

  const expandTableProps = {
    handleEdit: handleEditClick
  };

  return (
    <>
      <ModalFormUpdate 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWarranty(null);
        }}
        selectedWarranty={selectedWarranty}
      />

      <Header title="Warranty Tracking" />
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
            expandable={{ 
              expandedRowRender: (record) => ExpandedRowRender(expandTableProps)
            }}
            pagination={PaginationConfig}
            dataSource={warrantyData}
            loading={false}
            onChange={onChangeTable}
            scroll={scroll}
          />
        </Col>
      </Row>
    </>
  );
};

export default WarrantyTracking;

