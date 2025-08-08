import { useState, useEffect } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";

import { Button, Tabs } from "antd";
import Header from "../../../components/templates/Header";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import StaffManageTable from "../components/StaffManageTable";
import StaffManageEditModal from "../components/StaffManageEditModal";
import StaffManageCreateModal from "../components/StaffManageCreateModal";
import RoleStaffComponent from "../components/RoleStaffComponent";
import ConfirmModal from "../../../components/common/ConfirmModal";
import CreateRoleModal from "../components/CreateRoleModal";

import IconLoader from "../../../components/common/IconLoader";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PlusIcon } from "../../../assets/icons/Icons";

import {
  JuristicManageDataType,
  conditionPage,
} from "../../../stores/interfaces/JuristicManage";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { TabsProps } from "antd";

import "../style.css";

const StaffManage = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.juristic
  );
  const { curPage, perPage, pageSizeOptions, setCurPage, setPerPage } =
    usePagination();

  // setting pagination Option
  const PaginationConfig = {
    defaultPageSize: pageSizeOptions[0],
    pageSizeOptions: pageSizeOptions,
    current: curPage,
    showSizeChanger: true,
    total: total,
  };
  let params: conditionPage = {
    perPage: perPage,
    curPage: curPage,
    verifyByJuristic: true,
    reject: false,
    isActive: true,
  };

  const items: TabsProps["items"] = [
    {
      key: "staff",
      label: "Staff",
    },
    {
      key: "role",
      label: "Role",
    },
  ];

  const columns: ColumnsType<JuristicManageDataType> = [
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
          <div>{`${record?.givenName} ${record?.middleName ?? ""} ${
            record?.familyName ?? ""
          }`}</div>
        );
      },
    },
    {
      title: "Phone number",
      key: "contact",
      align: "center",
      width: "7%",
      sorter: {
        compare: (a, b) => a.familyName.localeCompare(b.familyName),
      },
      render: (_, record) => {
        return <div>{`${record?.contact ?? "-"}`}</div>;
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
      title: "Role",
      key: "role",
      align: "center",
      width: "5%",
      sorter: {
        compare: (a, b) => a.role.name.localeCompare(b.role.name),
      },
      render: (_, record) => {
        return <div>{record.role.name ?? "Something went wrong!"}</div>;
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
              value={record.userId}
              type="text"
              onClick={() => {
                showDeleteConfirm(record.userId);
              }}
              icon={<DeleteOutlined />}
            />
          </>
        );
      },
    },
  ];

  const mockRoleData = [
    {
      id: 1,
      name: "Security guard",
      total: 5,
    },
    {
      id: 2,
      name: "Maid",
      total: 12,
    },
  ];

  // States
  const [rerender, setRerender] = useState<boolean>(true);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<JuristicManageDataType | null>(null);
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [activeKey, setActiveKey] = useState("staff");
  const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState(false);

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
    await dispatch.juristic.getTableData(paramsData);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    setParamsData(params);
    await dispatch.juristic.getTableData(paramsData);
  };

  const onEdit = async (data: JuristicManageDataType) => {
    // console.log(data);
    setEditData(data);
    setIsEditModalOpen(true);
  };

  const onChangeTable: TableProps<JuristicManageDataType>["onChange"] = async (
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
    await dispatch.juristic.getTableData(paramsData);
  };

  const showDeleteConfirm = (userId: string) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {},
      onCancel: () => {
        console.log("Cancel");
      },
    });
  };

  const onTabsChange = (key: string) => {
    setActiveKey(key);
  };

  const onCreateRole = () => {
    setIsCreateRoleOpen(true);
  };

  const fetchData = async () => {
    setParamsData(params);
    await dispatch.juristic.getTableData(paramsData);
  };

  const onCreateStaff = () => {
    setIsCreateStaffModalOpen(true);
  };

  // Components
  const CreateCard = () => {
    return (
      <div
        onClick={onCreateRole}
        className="staffRoleCard flex flex-col p-4 gap-4 rounded-2xl justify-center items-center hover:cursor-pointer hover:brightness-90"
      >
        <div className="flex flex-row justify-center items-center gap-4">
          <PlusIcon color="var(--light-color)" style={{ height: 48 }} />
          <span className="font-normal text-lg text-[var(--light-color)]">
            Create role
          </span>
        </div>
      </div>
    );
  };

  // Actions
  useEffect(() => {
    fetchData();
  }, [rerender, curPage]);

  return (
    <>
      <Header title="Juristic’s information" />
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
        <div className="userManagementTopActionRightGroup">
          <Button
            type="primary"
            size="large"
            onClick={onCreateStaff}
            className="px-4"
          >
            Create staff
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey={activeKey}
        items={items}
        onChange={onTabsChange}
      />
      <div>
        {activeKey === "staff" ? (
          <StaffManageTable
            columns={columns}
            data={tableData}
            onEdit={onEdit}
            PaginationConfig={PaginationConfig}
            loading={loading}
            onchangeTable={onChangeTable}
          />
        ) : (
          <div className="flex grid grid-cols-4 gap-4 p-8 max-2xl:grid-cols-3">
            {mockRoleData.map((item) => {
              return <RoleStaffComponent key={item.id} data={item} />;
            })}
            <CreateCard />
          </div>
        )}
      </div>
      <CreateRoleModal
        isCreateModalOpen={isCreateRoleOpen}
        onCancel={() => {
          setIsCreateRoleOpen(false);
        }}
        refetch={() => {}}
      />
      <StaffManageCreateModal
        isCreateModalOpen={isCreateStaffModalOpen}
        refetch={() => {}}
        onCancel={() => {
          setIsCreateStaffModalOpen(false);
        }}
      />
    </>
  );
};

export default StaffManage;
