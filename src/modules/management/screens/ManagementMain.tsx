import { useEffect, useState } from "react";
import { Row, Button, Image, Avatar } from "antd";
import Header from "../../../components/templates/Header";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import ManagementTable from "../components/ManagementTable";
import ManagementCreateModal from "../components/ManagementCreateModal";
import ManagementEditModal from "../components/ManagementEditModal";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import {
  ManagementDataType,
  ManagementFormDataType,
  conditionPage,
} from "../../../stores/interfaces/Management";
import "../styles/management.css";
import { deleteManagementId } from "../service/api/ManagementServiceAPI";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import dayjs from "dayjs";

const ManagementMain = () => {
  // variables
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ManagementFormDataType>({});
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.MCST
  );
  const { accessibility } = useSelector((state: RootState) => state.common);
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
    sort: "desc   ",
    sortBy: "updated",
  };
  const [rerender, setRerender] = useState<boolean>(true);
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    (async function () {
      await setParamsData(params);
      await dispatch.MCST.getTableData(paramsData);
    })();
    // console.log("team data :", accessibility?.team_team_management.allowAdd);
    if (accessibility?.team_team_management) {
    }
    // if (!accessibility?.menu_mcst.available) {
    //   navigate("/dashboard");

    // }
    // console.log(tableData);
  }, [rerender]);

  const onChangeTable: TableProps<ManagementDataType>["onChange"] = async (
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
    await setParamsData(params);
    await setCurrentPage(params.curPage);
    await dispatch.MCST.getTableData(paramsData);
  };

  // functions

  const onSearch = async (value: string) => {
    params = paramsData;
    params.search = value;
    await setParamsData(params);
    await dispatch.MCST.getTableData(paramsData);
  };

  const onCreate = async () => {
    await setIsCreateModalOpen(true);
  };

  const onEdit = async (data: ManagementFormDataType) => {
    // console.log(data);
    data.middleName = data.middleName === "-" ? null : data.middleName;
    await setEditData(data);
    await setIsEditModalOpen(true);
  };

  const columns: ColumnsType<ManagementDataType> = [
    {
      title: "Delete",
      key: "delete",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              disabled={
                accessibility?.team_team_management.allowDelete ? false : true
              }
              value={record.key}
              type="text"
              onClick={showDeleteConfirm}
              icon={<TrashIcon />}
            />
          </>
        );
      },
    },
    {
      title: "Image",
      key: "image",
      align: "center",
      render: (_, record) => (
        <>
          {/* <p>{record.image}</p> */}
          {record.image ? (
            <Avatar
              size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
              src={<Image src={record.image} width={"100%"} height={"100%"} />}
            />
          ) : (
            "No Image"
          )}
        </>
      ),
    },
    {
      title: "First name",
      dataIndex: "firstName",
      width: "auto",
      align: "center",
      sorter: {
        compare: (a, b) => a.firstName.localeCompare(b.firstName),
      },
    },
    {
      title: "Last name",
      dataIndex: "lastName",
      key: "lastName",
      align: "center",
      sorter: {
        compare: (a, b) => a.lastName.localeCompare(b.lastName),
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      sorter: {
        compare: (a, b) => a.role.localeCompare(b.role),
      },
    },
    {
      title: "Mobile no.",
      dataIndex: "contact",
      key: "contact",
      align: "center",
    },
    {
      title: "Activate",
      dataIndex: "activate",
      key: "activate",
      align: "center",
      render: (_, record) => (
        <>
          <span>{record.activate.toString()}</span>
        </>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (_, record) => (
        <>
          <span>{dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")}</span>
        </>
      ),
    },
    {
      title: "Update by",
      dataIndex: "updateByUser",
      key: "updateByUser",
      align: "center",
      render: (_, record) => (
        <>
          <span>{record.updatedByUser?.firstName ?? "-"}</span>
        </>
      ),
    },
    {
      title: "Edit",
      key: "action",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              disabled={
                accessibility?.team_team_management.allowEdit ? false : true
              }
              type="text"
              icon={<EditIcon />}
              onClick={() => onEdit(record)}
            />
          </>
        );
      },
    },
  ];

  const showDeleteConfirm = ({ currentTarget }: any) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        const statusDeleted = await deleteManagementId(currentTarget.value);
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
  return (
    <>
      <Header title="Management team" />
      <div className="managementTopActionGroup">
        <div className="managementTopActionLeftGroup">
          <SearchBox
            className="managementSearchBox"
            placeholderText="Search by first name, mobile no. and email"
            onSearch={onSearch}
          />
        </div>
        <MediumActionButton
          disabled={accessibility?.team_team_management.allowAdd ? false : true}
          className="managementExportBtn"
          message="Add new"
          onClick={onCreate}
        />
      </div>
      <ManagementTable
        columns={columns}
        data={tableData}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onchangeTable={onChangeTable}
      />
      <Row
        className="managementBottomActionContainer"
        justify="end"
        align="middle"
      >
        {/* <Pagination defaultCurrent={1} total={60} /> */}
      </Row>
      <ManagementCreateModal
        isCreateModalOpen={isCreateModalOpen}
        callBack={async (isOpen: boolean, created: boolean) => {
          await setIsCreateModalOpen(isOpen);
          if (created) {
            await setRerender(!rerender);
          }
        }}
      />
      <ManagementEditModal
        isEditModalOpen={isEditModalOpen}
        data={editData}
        callBack={async (isOpen: boolean, saved: boolean) => {
          await setIsEditModalOpen(isOpen);
          if (saved) {
            await setRerender(!rerender);
          }
        }}
      />
    </>
  );
};

export default ManagementMain;
