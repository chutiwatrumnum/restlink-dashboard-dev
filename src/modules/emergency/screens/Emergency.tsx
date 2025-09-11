import { useState, useEffect } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import { usePermission } from "../../../utils/hooks/usePermission";

import { Button, Row, Pagination } from "antd";
import Header from "../../../components/templates/Header";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import EmergencyTable from "../components/EmergencyTable";
import EmergencyCreateModal from "../components/EmergencyCreateModal";
import EmergencyEditModal from "../components/EmergencyEditModal";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import ConfirmModal from "../../../components/common/ConfirmModal";
import NoImg from "../../../assets/images/noImg.jpeg";

import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import {
  DataEmergencyTableDataType,
  EmergencyPayloadType,
} from "../../../stores/interfaces/Emergency";

import "../styles/announcement.css";

const Emergency = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { tableData, EmergencyMaxLength } = useSelector(
    (state: RootState) => state.emergency
  );
  const {
    curPage,
    perPage,
    setPerPage,
    pageSizeOptions,
    deleteAndHandlePagination,
    onPageChange: handlePageChange,
  } = usePagination();

  // States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<DataEmergencyTableDataType | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  // functions
  const onSearch = (value: string) => {
    // console.log(value);
    setSearch(value);
  };

  const onPageChange = (page: number) => {
    handlePageChange(page);
  };

  const onCreate = () => {
    setIsCreateModalOpen(true);
  };

  const onCreateOk = () => {
    setIsCreateModalOpen(false);
  };

  const onCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const onEdit = (record: DataEmergencyTableDataType) => {
    const editData: DataEmergencyTableDataType = {
      ...record,
    };
    setEditData(editData);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
    setEditData(null);
  };

  const fetchData: VoidFunction = async () => {
    const payload: EmergencyPayloadType = {
      search: search,
      curPage: curPage,
      perPage: perPage,
    };
    await dispatch.emergency.getTableData(payload);
  };

  const onRefresh: VoidFunction = () => {
    setRefresh(!refresh);
  };

  const showDeleteConfirm = (value: DataEmergencyTableDataType) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        deleteAndHandlePagination({
          dataLength: tableData.length,
          fetchData: fetchData,
          onDelete: async () => {
            await dispatch.emergency.deleteTableData(value.id);
          },
        });
      },
      onCancel: () => console.log("Cancel"),
    });
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize
  ) => {
    setPerPage(pageSize);
  };

  const columns: ColumnsType<DataEmergencyTableDataType> = [
    // {
    //   title: "No.",
    //   dataIndex: "id",
    //   key: "id",
    //   align: "center",
    //   width: "5%",
    // },
    {
      title: "Picture",
      key: "image",
      align: "center",
      width: 200, // กำหนดความกว้างของ column
      render: ({ image }) => (
        <img
          src={image ? image : NoImg}
          style={{
            width: "200px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "2px",
          }}
          alt="Contact"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Tel.",
      dataIndex: "tel",
      key: "tel",
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        return (
          <>
            <Button
              type="text"
              icon={<EditIcon />}
              onClick={() => onEdit(record)}
              disabled={!access("contact_list", "edit")}
            />
            <Button
              onClick={() => showDeleteConfirm(record)}
              type="text"
              icon={<TrashIcon />}
              disabled={!access("contact_list", "delete")}
            />
          </>
        );
      },
    },
  ];

  // Actions
  useEffect(() => {
    fetchData();
  }, [search, curPage, refresh, perPage]);

  return (
    <>
      <Header title="Contact lists" />
      <div className="announceTopActionGroup">
        <div className="announceTopActionLeftGroup">
          <SearchBox
            className="announceSearchBox"
            onSearch={onSearch}
            placeholderText="Search by Name"
          />
        </div>
        <MediumActionButton
          message="Add Contact list"
          onClick={onCreate}
          className="createAnnouncementBtn"
          disabled={!access("contact_list", "create")}
        />
      </div>
      <EmergencyTable columns={columns} data={tableData} />
      <Row
        className="announceBottomActionContainer"
        justify="end"
        align="middle"
      >
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={EmergencyMaxLength}
          pageSizeOptions={pageSizeOptions}
          showSizeChanger={true}
          onShowSizeChange={onShowSizeChange}
        />
      </Row>

      <EmergencyCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onOk={onCreateOk}
        onCancel={onCreateCancel}
        onRefresh={onRefresh}
      />
      <EmergencyEditModal
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        data={editData}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default Emergency;
