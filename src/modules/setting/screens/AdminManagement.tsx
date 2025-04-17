import { useState } from "react";
import { Button, Row, Pagination, Switch } from "antd";
import Header from "../../../components/templates/Header";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import SmallActionButton from "../../../components/common/SmallActionButton";
import AdminManagementTable from "../components/AdminManagementTable";
import AdminManagementCreateModal from "../components/AdminManagementCreateModal";
import AdminManagementEditModal from "../components/AdminManagementEditModal";
import {
  EditIcon,
  TrashIcon,
  LineSpacerIcon,
} from "../../../assets/icons/Icons";

import type { ColumnsType } from "antd/es/table";
import { AdminTableDataType } from "../../../stores/interfaces/Setting";

import "../styles/setting.css";

const AdminManagement = () => {
  // variables
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<AdminTableDataType>();

  // functions
  const onSearch = (value: string) => {
    console.log(value);
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

  const onEdit = (record: AdminTableDataType) => {
    const editData: AdminTableDataType = {
      key: record.key,
      image: record.image,
      displayName: record.displayName,
      actualName: record.actualName,
      email: record.email,
      role: record.role,
      tel: record.tel,
      active: record.active,
    };
    setEditData(editData);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const data: AdminTableDataType[] = [
    {
      key: "1",
      image:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      displayName: "display name1",
      actualName: "firstName lastName1",
      email: "exam@mail.com",
      role: "Super Admin",
      tel: "0818238182",
      active: true,
    },
    {
      key: "2",
      image:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      displayName: "display name2",
      actualName: "firstName lastName2",
      email: "exam2@mail.com",
      role: "Super Admin",
      tel: "0818238182",
      active: true,
    },
    {
      key: "3",
      image:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      displayName: "display name3",
      actualName: "firstName lastName3",
      email: "exam3@mail.com",
      role: "Super Admin",
      tel: "0818238182",
      active: false,
    },
  ];

  const columns: ColumnsType<AdminTableDataType> = [
    {
      title: "No.",
      key: "no",
      align: "center",
      render: (_, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Display name",
      key: "displayName",
      dataIndex: "displayName",
      align: "center",
    },
    {
      title: "Actual Name",
      dataIndex: "actualName",
      key: "actualName",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
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
      key: "action",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              type="text"
              icon={<EditIcon />}
              onClick={() => onEdit(record)}
            />
            <LineSpacerIcon className="lineSpacer" />
            <Button type="text" icon={<TrashIcon />} />
          </>
        );
      },
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      align: "center",
      render: (active) => {
        return <Switch defaultChecked={active} onChange={() => {}} />;
      },
    },
  ];

  return (
    <>
      <Header title="Admin Management" />
      <div className="adminManageTopActionGroup">
        <SearchBox className="adminManageSearchBox" onSearch={onSearch} />
        <MediumActionButton
          message="Create Admin"
          onClick={onCreate}
          className="createAdminMangeBtn spacer"
        />
      </div>
      <AdminManagementTable columns={columns} data={data} />
      <Row
        className="adminManageBottomActionContainer"
        justify="space-between"
        align="middle">
        <SmallActionButton
          message="Export"
          onClick={() => {}}
          className="exportAdminMangeBtn"
        />
        <Pagination defaultCurrent={1} total={60} />
      </Row>
      <AdminManagementCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onOk={onCreateOk}
        onCancel={onCreateCancel}
      />
      <AdminManagementEditModal
        isEditModalOpen={isEditModalOpen}
        onCancel={onEditCancel}
        onOk={onEditOk}
        data={editData}
      />
    </>
  );
};

export default AdminManagement;
