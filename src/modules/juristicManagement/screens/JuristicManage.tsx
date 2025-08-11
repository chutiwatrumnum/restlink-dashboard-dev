// ไฟล์: src/modules/juristicManagement/screens/JuristicManage.tsx

import { useState, useEffect } from "react";
import { Button } from "antd";
import Header from "../../../components/templates/Header";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import JuristicManageTable from "../components/JuristicManageTable";
import JuristicManageEditModal from "../components/JuristicManageEditModal";
import dayjs from "dayjs";
import { conditionPage } from "../../../stores/interfaces/JuristicManage";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../styles/userManagement.css";

// *** แก้ไขตรงนี้ - ใช้ mutation แทน API function ***
import { useDeleteJuristicMutation } from "../../../utils/mutationsGroup/juristicMutations";
import ConfirmModal from "../../../components/common/ConfirmModal";

const JuristicManage = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.juristic
  );

  // *** เพิ่ม mutation ***
  const deleteJuristicMutation = useDeleteJuristicMutation();

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
  const [editData, setEditData] = useState<JuristicManageDataType | null>(null);
  const [paramsData, setParamsData] = useState<conditionPage>(params);

  const columns: ColumnsType<JuristicManageDataType> = [
    {
      title: "Name-Surname",
      key: "name",
      width: "7%",
      align: "center",
      sorter: {
        compare: (a, b) => {
          const aName = a.firstName || a.givenName || "";
          const bName = b.firstName || b.givenName || "";
          return aName.localeCompare(bName);
        },
      },
      render: (_, record) => {
        // รองรับทั้ง format เก่าและใหม่
        const firstName = record?.firstName || record?.givenName || "";
        const middleName = record?.middleName || "";
        const lastName = record?.lastName || record?.familyName || "";

        return <div>{`${firstName} ${middleName} ${lastName}`.trim()}</div>;
      },
    },
    {
      title: "Phone number",
      key: "contact",
      align: "center",
      width: "7%",
      sorter: {
        compare: (a, b) => {
          const aContact = a.contact || "";
          const bContact = b.contact || "";
          return aContact.localeCompare(bContact);
        },
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
        compare: (a, b) => {
          const aEmail = a.email || "";
          const bEmail = b.email || "";
          return aEmail.localeCompare(bEmail);
        },
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
              onClick={() => showDeleteConfirm(record.userId)}
              icon={<DeleteOutlined />}
              // *** แสดง loading state ***
              loading={
                deleteJuristicMutation.isPending &&
                deleteJuristicMutation.variables === record.userId
              }
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
    await dispatch.juristic.getTableData(paramsData);
  };

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    setParamsData(params);
    await dispatch.juristic.getTableData(paramsData);
  };

  const onEdit = async (data: JuristicManageDataType) => {
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
    setCurrentPage(params.curPage);
    await dispatch.juristic.getTableData(paramsData);
  };

  // *** แก้ไขฟังก์ชัน delete ให้ใช้ mutation ***
  const showDeleteConfirm = (userId: string) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: () => {
        // ใช้ mutation แทน API call โดยตรง
        deleteJuristicMutation.mutate(userId, {
          onSuccess: () => {
            // ไม่ต้องแสดง success message ที่นี่ เพราะ mutation จัดการให้แล้ว
            setRerender(!rerender); // refresh data
          },
          onError: () => {
            // error message จะแสดงจาก mutation
          },
        });
      },
      onCancel: () => {
        console.log("Cancel delete");
      },
    });
  };

  // Actions
  useEffect(() => {
    (async function () {
      setParamsData(params);
      await dispatch.juristic.getTableData(paramsData);
    })();
  }, [rerender]);

  return (
    <>
      <Header title="Juristic's information" />
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
      <JuristicManageTable
        columns={columns}
        data={tableData}
        onEdit={onEdit}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onchangeTable={onChangeTable}
      />
      <JuristicManageEditModal
        isEditModalOpen={isEditModalOpen}
        data={editData}
        callBack={async (isOpen: boolean, saved: boolean) => {
          setIsEditModalOpen(isOpen);
          if (saved) {
            setRerender(!rerender);
          }
        }}
      />
    </>
  );
};

export default JuristicManage;
