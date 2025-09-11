import { useState, useEffect } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import Header from "../../../components/templates/Header";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ModalFormUpdate } from "../components/ModalFormUpdate";
import { ExpandedRowRender } from "../components/Expand";
import { getWarrantyTracking } from "../service/api/WarrantyTracking";
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

import dayjs from "dayjs";

import {
  WarrantyDataType,
  WarrantyDetailsType,
  paginationWarranty,
} from "../../../stores/interfaces/Warranty";

const WarrantyTracking = () => {
  // Initial
  const { curPage, perPage, pageSizeOptions, setCurPage, setPerPage } =
    usePagination();
  //   const dispatch = useDispatch<Dispatch>();
  //   const data = useSelector((state: RootState) => state.announcement.tableData);
  //   const announcementMaxLength = useSelector(
  //     (state: RootState) => state.announcement.announcementMaxLength
  //   );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyDetailsType | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [rangMonthSelect, setRangMonthSelect] = useState<string>('');

  const [paginationConfig, setPaginationConfig] = useState<any>({
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: curPage,
    showSizeChanger: true,
    total: total,
  });
  // setting pagination Option


  let params: paginationWarranty = {
    perPage: pageSizeOptions[0],
    curPage: curPage,
  };

  const [paramsData, setParamsData] = useState<paginationWarranty>(params);
  const [warrantyData, setWarrantyData] = useState<WarrantyDataType[]>([]);



  const { RangePicker } = DatePicker;

  const scroll: { x?: number | string } = {
    x: "10vw",
  };

  const dateFormat = "MMMM,YYYY";
  const customFormat: DatePickerProps["format"] = (value) =>
    `Month : ${value.format(dateFormat)}`;
  const { Search } = Input;

  const columns: ColumnsType<WarrantyDataType> = [
    {
      title: "No.",
      key: "index",
      align: "center",
      render: (_: any, __: WarrantyDataType, index: number) => {
        const currentPage = paramsData.curPage || 1;
        const pageSize = paramsData.perPage || pageSizeOptions[0];
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
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
      title: "Email",
      align: "center",
      dataIndex: "email",
      width: 200,
    },
    {
      title: "Warranty Lists",
      align: "center",
      dataIndex: "email",
      width: 150,
      render: (_, record) => (
        <Row>
          <Col span={24}>
            <Button type="primary" onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              handleSave(record);
            }}>
              Add Warranty
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  // Actions
  const handleReset = () => {
    setCurPage(1);
    setPaginationConfig((prev: any) => ({
      ...prev,
      current: 1,
    }));
  }
  const handleDate = async (e: any) => {
    handleReset();
    setRangMonthSelect(e);
  };

  const onSearch = async (value: string) => {
    handleReset();
    setSearch(value);
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
    params.curPage = pagination?.current
      ? pagination?.current
      : paginationConfig.current;
    params.perPage = pagination?.pageSize
      ? pagination?.pageSize
      : paginationConfig.defaultPageSize;
    setParamsData(params);
    setPerPage(params.perPage);
    setCurPage(params.curPage);
    setPaginationConfig((prev: any) => ({
      ...prev,
      current: params.curPage,
      defaultPageSize: params.perPage,
    }));
    // await dispatch.visitor.getTableData(paramsData);
  };

  const handleSave = (record: any) => {
    const warrantyDetails: WarrantyDetailsType = {
      ...record,
    };
    setSelectedWarranty(warrantyDetails as WarrantyDetailsType);
    setIsModalOpen(true);
  };

  const handleEditClick = (record: WarrantyDetailsType) => {
    const warrantyDetails: WarrantyDetailsType = {
      ...record,
      warrantyName: record.warrantyName,
      serialNumber: record.serialNumber,
      purchaseDate: record.purchaseDate
        ? dayjs(record.purchaseDate).format("YYYY-MM-DD")
        : "",
      startDate: record.startDate
        ? dayjs(record.startDate).format("YYYY-MM-DD")
        : "",
      expireDate: record.expireDate
        ? dayjs(record.expireDate).format("YYYY-MM-DD")
        : "",
      notifyDateBeforeExpiration: record.notifyDateBeforeExpiration,
      image: record.image,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    setSelectedWarranty(warrantyDetails);
    setIsModalOpen(true);
  };

  const expandTableProps = {
    handleEdit: handleEditClick,
    setSelectedWarranty,
  };

  // load data
  const loadFirst = async (overrideSearch?: string) => {
    let startDate = rangMonthSelect && rangMonthSelect.length === 2 ? dayjs(rangMonthSelect[0]).startOf('month').format('YYYY-MM') : null;
    let endDate = rangMonthSelect && rangMonthSelect.length === 2 ? dayjs(rangMonthSelect[1]).endOf('month').format('YYYY-MM') : null;
    let objFilter = {
      curPage: curPage || 1,
      perPage: perPage || 1,
      search: (overrideSearch ?? search) || null,
      startDate: startDate,
      endDate: endDate,
    }
    let dataWarraty = await getWarrantyTracking(objFilter);
    if (dataWarraty?.status) {
      let objWarrantyData: WarrantyDataType[] = dataWarraty.result.data.map((item: any) => {
        const contract = item?.user?.contact != '-' ? item?.user?.contact : null;
        const contract2 = item?.user?.contact2 != '-' ? item?.user?.contact2 : null;
        const contract3 = item?.user?.contact3 != '-' ? item?.user?.contact3 : null;
        const contractSuccess = contract || contract2 || contract3 || '-';


        const details: WarrantyDetailsType[] = (item?.warranties?.warranty || []).map((w: any, idx: number) => ({
          key: String(idx + 1),
          image: w?.image || '',
          warrantyName: w?.name || '-',
          serialNumber: w?.serialNumber || '-',
          purchaseDate: w?.purchaseDate ? dayjs(w?.purchaseDate).format('YYYY-MM-DD') : '',
          startDate: w?.startDate ? dayjs(w?.startDate).format('YYYY-MM-DD') : '',
          expireDate: w?.expireDate ? dayjs(w?.expireDate).format('YYYY-MM-DD') : '',
          notifyDateBeforeExpiration: w?.notifyDateBeforeExpiration ?? undefined,
          createdAt: item?.createdAt || new Date().toISOString(),
          id: w?.id,
        }));

        return {
          id: item?.id,
          total: item?.warranties?.total || 0,
          address: item?.unit?.unitNo || '-',
          owner: item?.user?.givenName || '-',
          contact: contractSuccess || '-',
          email: item?.user?.email || '-',
          user: item?.user,
          unit: item?.unit,
          expand: details,
          projectId: item?.projectId,
        } as WarrantyDataType;
      })

      setTotal(dataWarraty.result.total);
      setPaginationConfig({
        ...paginationConfig,
        total: dataWarraty.result.total,
      });
      setWarrantyData(objWarrantyData);
    }
    else {
      setWarrantyData([]);
      setTotal(0);
      setPaginationConfig({
        ...paginationConfig,
        total: 0,
      });
    }
  }
  useEffect(() => {
    loadFirst();
  }, [curPage, perPage, search, rangMonthSelect])

  return (
    <>
      <ModalFormUpdate
        loadFirst={loadFirst}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWarranty(null);
        }}
        selectedWarranty={selectedWarranty}
        onChangeSelectedWarranty={(updated) => setSelectedWarranty(updated)}
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
      </Row>
      <Row>
        <Col span={24}>
          <Table
            rowKey={(row) => String(row.id ?? `${row.address}-${row.owner}-${row.email}`)}
            columns={columns}
            expandable={{
              expandedRowRender: (record) => (
                <ExpandedRowRender {...expandTableProps} dataRecord={record} loadFirst={loadFirst} />
              ),
              expandRowByClick: true,
            }}
            pagination={paginationConfig}
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
