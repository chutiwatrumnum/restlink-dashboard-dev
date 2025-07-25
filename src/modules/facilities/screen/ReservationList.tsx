import { useState, useEffect } from "react";
import { Button, Row, Pagination, Tabs, DatePicker } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import Header from "../../../components/templates/Header";
import MediumActionButton from "../../../components/common/MediumActionButton";
import ReservedFacilitiesTable from "../components/ReservedFacilitiesTable";
import { TrashIcon, QRCodeIcon } from "../../../assets/icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import QRModal from "../components/QRModal";
import CreateReservedModal from "../components/CreateReservedModal";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SearchBox from "../../../components/common/SearchBox";

import type {
  TabsProps,
  DatePickerProps,
  PaginationProps,
  TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  ReservedRowListDataType,
  ReservedDataPayloadType,
  ReservationListDataType,
} from "../../../stores/interfaces/Facilities";

const ReservationList = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { reservationListData, reservedListData } = useSelector(
    (state: RootState) => state.facilities
  );
  // const { accessibility } = useSelector((state: RootState) => state.common);
  const defaultColumns: TableColumnsType<ReservedRowListDataType> = [
    {
      title: "Booked by",
      key: "createdUser",
      align: "center",
      render: (_, record) => {
        return <span>{`${record?.createdByRole.roleCodeName}`}</span>;
      },
    },
    {
      title: "Room address",
      dataIndex: "unit",
      key: "unit",
      align: "center",
    },
    {
      title: "Facility name",
      dataIndex: "facilityName",
      key: "facilityName",
      align: "center",
    },

    {
      title: "Name-surname",
      key: "bookingUser",
      align: "center",
      render: (_, record) => {
        return (
          <span>
            {`${record?.bookingUser?.givenName} ${
              record?.bookingUser?.middleName ?? ""
            } ${record?.bookingUser?.familyName ?? ""}`}
          </span>
        );
      },
    },
    {
      title: "Reserve Date",
      key: "joinAt",
      align: "center",
      render: ({ joinAt }) => {
        return <span>{dayjs(joinAt).format("DD/MM/YYYY")}</span>;
      },
      sorter: (a, b) => dayjs(a.joinAt).unix() - dayjs(b.joinAt).unix(),
    },
    {
      title: "Start/End time",
      key: "startTime",
      align: "center",
      render: (_, record) => {
        return <span>{`${record.startTime}/${record.endTime}`}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => {
        return (
          <div className="flex flex-row justify-center items-center">
            <Button
              type="text"
              icon={<QrcodeOutlined className="iconButton" />}
              onClick={() => onQRClick(record)}
            />
            <Button
              onClick={() => showDeleteConfirm(record)}
              type="text"
              icon={<TrashIcon className="iconWidthButton" />}
            />
          </div>
        );
      },
    },
  ];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [facilitiesId, setFacilitiesId] = useState(0);
  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [date, setDate] = useState<string>();
  const [refresh, setRefresh] = useState(false);
  const [items, setItems] = useState<TabsProps["items"]>([]);
  const [qrData, setQrData] = useState<ReservedRowListDataType>();
  const [search, setSearch] = useState("");
  // const [columns, setColumns] =
  //   useState<TableColumnsType<ReservedRowListDataType>>(defaultColumns);

  // functions
  const onSearch = (value: string) => {
    // console.log(value);
    setSearch(value);
  };

  const onPageChange = (page: number) => {
    setCurPage(page);
  };

  const onCreate = () => {
    setIsCreateModalOpen(true);
  };

  const onCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const onQRClick = (record: ReservedRowListDataType) => {
    // console.log(record);
    setQrData(record);
    setIsQRModalOpen(true);
  };

  const onQRCancel = () => {
    setIsQRModalOpen(false);
  };

  const onDateSelect: DatePickerProps["onChange"] = (date, dateString) => {
    if (typeof dateString === "string") setDate(dateString);
  };

  const fetchData: VoidFunction = async () => {
    const payload: ReservedDataPayloadType = {
      facilitiesId: facilitiesId,
      curPage: curPage,
      perPage: perPage,
      date: date,
      search: search,
    };
    await dispatch.facilities.getReservationList();
    await dispatch.facilities.getReservedList(payload);
    await dispatch.facilities.getReservedCreateDataList();
  };

  const createTabsMenu = async () => {
    const arr: TabsProps["items"] = [
      {
        key: "0",
        label: "All",
      },
    ];
    reservationListData.map((facility: ReservationListDataType) => {
      arr?.push({
        key: facility.id.toString(),
        label: facility.name,
      });
    });
    setItems(arr);
  };

  const onRefresh: VoidFunction = () => {
    setRefresh(!refresh);
  };

  const showDeleteConfirm = (value: ReservedRowListDataType) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const result = await dispatch.facilities.deleteReserved([value.id]);
        if (result) {
          SuccessModal("Successfully deleted");
        } else {
          FailedModal("Something went wrong");
        }
        onRefresh();
      },
      onCancel: () => console.log("Cancel"),
    });
  };

  const onTabsChange = (key: string) => {
    // console.log(key);
    // const newArr = defaultColumns;
    // if (key === "12") {
    //   newArr.splice(4, 0, {
    //     title: "Equipment",
    //     key: "facilitiesItems",
    //     align: "center",
    //     render: (_, record) => {
    //       return <span>{record.facilitiesItems?.itemName}</span>;
    //     },
    //     filters: [
    //       {
    //         text: "Excite run 1000",
    //         value: "Excite run 1000",
    //       },
    //       {
    //         text: "Excite synchro",
    //         value: "Excite synchro",
    //       },
    //     ],
    //     onFilter: (value, record) =>
    //       record.facilitiesItems?.itemName
    //         ? record.facilitiesItems?.itemName.includes(value.toString())
    //         : false,
    //   });
    // } else if (key === "11") {
    //   newArr.splice(4, 0, {
    //     title: "Zones",
    //     key: "facilitiesItems",
    //     align: "center",
    //     render: (_, record) => {
    //       return <span>{record.facilitiesItems?.description}</span>;
    //     },
    //     filters: [
    //       {
    //         text: "Zone 1",
    //         value: "Zone 1",
    //       },
    //       {
    //         text: "Zone 2",
    //         value: "Zone 2",
    //       },
    //       {
    //         text: "Zone 3",
    //         value: "Zone 3",
    //       },
    //       {
    //         text: "Zone 4",
    //         value: "Zone 4",
    //       },
    //       {
    //         text: "Zone 5",
    //         value: "Zone 5",
    //       },
    //       {
    //         text: "Zone 6",
    //         value: "Zone 6",
    //       },
    //     ],
    //     onFilter: (value, record) =>
    //       record.facilitiesItems?.itemName
    //         ? record.facilitiesItems?.itemName.includes(value.toString())
    //         : false,
    //   });
    // }
    // setColumns(newArr);
    setFacilitiesId(parseInt(key));
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize
  ) => {
    // console.log(current, pageSize);
    setPerPage(pageSize);
  };

  // Actions
  useEffect(() => {
    createTabsMenu();
  }, [reservationListData]);

  useEffect(() => {
    fetchData();
    // console.log(accessibility);
  }, [curPage, refresh, facilitiesId, search, date, perPage]);

  return (
    <>
      <Header title="Reservation list" />
      <div className="reservedTopActionGroup">
        <div className="reservedTopActionLeftGroup">
          <DatePicker
            className="reservedDatePicker"
            onChange={onDateSelect}
            picker="month"
          />
          <SearchBox
            placeholderText="Search by name or address"
            className="reservedSearchBox"
            onSearch={onSearch}
          />
        </div>
        <MediumActionButton
          message="Create reservation"
          onClick={onCreate}
          className="createReserved"
        />
      </div>
      <Tabs defaultActiveKey="0" items={items} onChange={onTabsChange} />
      <ReservedFacilitiesTable
        columns={defaultColumns}
        data={reservedListData?.rows}
      />
      <Row
        className="reservedBottomActionContainer"
        justify="end"
        align="middle"
      >
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={reservedListData?.total}
          pageSizeOptions={[10, 20, 40, 80, 100]}
          showSizeChanger={true}
          onShowSizeChange={onShowSizeChange}
        />
      </Row>
      <QRModal visible={isQRModalOpen} data={qrData} onExit={onQRCancel} />
      <CreateReservedModal
        isCreateModalOpen={isCreateModalOpen}
        onCancel={onCreateCancel}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ReservationList;
