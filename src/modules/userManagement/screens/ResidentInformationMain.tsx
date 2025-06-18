import { useState, useEffect } from "react";
import { Button } from "antd";
import Header from "../../../components/templates/Header";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import ResidentInformationTable from "../components/residentInformation/ResidentInformationTable";
import ResidentInformationEditModal from "../components/residentInformation/ResidentInformationEditModal";
import dayjs from "dayjs";
import { conditionPage } from "../../../stores/interfaces/ResidentInformation";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ResidentInformationDataType } from "../../../stores/interfaces/ResidentInformation";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../styles/userManagement.css";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import { deleteResidentId } from "../service/api/ResidentServiceAPI";
import ConfirmModal from "../../../components/common/ConfirmModal";
import UserRoomListModal from "../components/residentInformation/UserRoomListModal";

const ResidentInformationMain = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.resident
  );

  // States
  const [currentPage, setCurrentPage] = useState<number>(1);
  // setting pagination Option
  const pageSizeOptions = [10, 20, 40, 80, 100];
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: currentPage,
    showSizeChanger: true,
    total: total,
  };
  let params: conditionPage = {
    perPage: pageSizeOptions[0],
    curPage: currentPage,
    verifyByJuristic: true,
    reject: false,
    isActive: true,
  };
  const [rerender, setRerender] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ResidentInformationDataType | null>(
    null
  );
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [isUserRoomListModalOpen, setIsUserRoomListModalOpen] = useState(false);
  const [roomListData, setRoomListData] =
    useState<ResidentInformationDataType>();

  const columns: ColumnsType<ResidentInformationDataType> = [
    {
      title: "Name-Surname",
      key: "name",
      width: "7%",
      align: "center",
      sorter: {
        compare: (a, b) => a.givenName.localeCompare(b.givenName),
      },
      render: (_, record) => {
        return (
          <div>{`${record?.givenName} ${record?.familyName ?? ""} ${
            record?.familyName
          }`}</div>
        );
      },
    },
    {
      title: "Phone number",
      key: "tel",
      align: "center",
      width: "7%",
      sorter: {
        compare: (a, b) => a.familyName.localeCompare(b.familyName),
      },
      render: (_, record) => {
        return <div>{`${record?.tel ?? "-"}`}</div>;
      },
    },
    {
      title: "Email",
      key: "email",
      align: "center",
      width: "5%",
      sorter: {
        compare: (a, b) => a.unit.roomAddress.localeCompare(b.unit.roomAddress),
      },
      render: (_, record) => {
        return <div>{record.email ?? "Something went wrong!"}</div>;
      },
    },
    {
      title: "Create at",
      key: "createdAt",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return (
          <div>
            {record?.createdAt
              ? dayjs(record.createdAt).format("DD/MM/YYYY")
              : "Something went wrong!"}
          </div>
        );
      },
    },
    {
      title: "Last Update",
      key: "updatedAt",
      dataIndex: "updatedAt",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return (
          <div>{dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm") ?? "-"}</div>
        );
      },
    },
    {
      title: "Room list",
      key: "unitList",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return (
          <>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                setRoomListData(record);
                setIsUserRoomListModalOpen(true);
              }}
            >
              Room list
            </Button>
          </>
        );
      },
    },
    {
      title: "Action",
      key: "delete",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return (
          <>
            <Button
              className="iconButton"
              type="text"
              size="large"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
            <Button
              className="iconButton"
              value={record.id}
              type="text"
              onClick={showDeleteConfirm}
              icon={<DeleteOutlined />}
            />
          </>
        );
      },
    },
  ];
  // functions
  const onChange = async (e: any) => {
    params = paramsData;
    if (e) {
      params.startDate = dayjs(e[0]).startOf("month").format("YYYY-MM");
      params.endDate = dayjs(e[1]).endOf("month").format("YYYY-MM");
    } else {
      params.startDate = undefined;
      params.endDate = undefined;
    }
    await setParamsData(params);
    await dispatch.resident.getTableData(paramsData);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    setParamsData(params);
    await dispatch.resident.getTableData(paramsData);
  };

  const onEdit = async (data: ResidentInformationDataType) => {
    // console.log(data);
    setEditData(data);
    setIsEditModalOpen(true);
  };

  const onChangeTable: TableProps<ResidentInformationDataType>["onChange"] =
    async (pagination: any, sorter: any) => {
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
      setCurrentPage(params.curPage);
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

  // Actions
  useEffect(() => {
    (async function () {
      setParamsData(params);
      await dispatch.resident.getTableData(paramsData);
    })();
    // console.log(tableData);
  }, [rerender]);

  return (
    <>
      <Header title="Resident’s information" />
      <div className="userManagementTopActionGroup">
        <div className="userManagementTopActionLeftGroup">
          <DatePicker
            className="userManagementDatePicker"
            onChange={onChange}
            picker="month"
          />
          <SearchBox
            placeholderText="Search by name and phone number"
            className="userManagementSearchBox"
            onSearch={onSearch}
          />
        </div>
      </div>
      <ResidentInformationTable
        columns={columns}
        data={tableData}
        onEdit={onEdit}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onchangeTable={onChangeTable}
      />
      <ResidentInformationEditModal
        isEditModalOpen={isEditModalOpen}
        data={editData}
        callBack={async (isOpen: boolean, saved: boolean) => {
          setIsEditModalOpen(isOpen);
          if (saved) {
            setRerender(!rerender);
          }
        }}
      />
      <UserRoomListModal
        isUserRoomListModalOpen={isUserRoomListModalOpen}
        data={roomListData}
        onCancel={() => {
          setIsUserRoomListModalOpen(false);
        }}
      />
    </>
  );
};

export default ResidentInformationMain;
