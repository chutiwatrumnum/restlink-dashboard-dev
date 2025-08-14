import { useState } from "react";
import dayjs from "dayjs";
import { encryptStorage } from "../../../utils/encryptStorage";

// Queries
import { getJuristicInvitationsQuery } from "../../../utils/queriesGroup/juristicQueries";
import { useDeleteJuristicInvitationMutation } from "../../../utils/mutationsGroup/juristicMutations";

// Components
import Header from "../../../components/templates/Header";
import { Row, Button, Col, Table, Tabs, Flex } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MediumActionButton from "../../../components/common/MediumActionButton";
import JuristicManageCreateModal from "../components/JuristicManageCreateModal";
import JuristicEditInvitationModal from "../components/JuristicEditInvitationModal";
import {
  callConfirmModal,
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";

// Types
import type { ColumnsType } from "antd/es/table";
import { InvitationsDataType } from "../../../stores/interfaces/JuristicManage";
import type { TabsProps } from "antd";
import axios from "axios";

const JuristicInvitation = () => {
  // Initiate
  const deleteInvitation = useDeleteJuristicInvitationMutation();
  const projectID = encryptStorage.getItem("projectId");

  // States
  const [isActivated, setIsActivated] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<InvitationsDataType>();

  // Data
  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = getJuristicInvitationsQuery({
    activate: isActivated,
    curPage: curPage,
  });

  const items: TabsProps["items"] = [
    {
      key: "inactivated",
      label: "Inactivated",
    },
    {
      key: "activated",
      label: "Activated",
    },
  ];

  const defaultColumns: ColumnsType<InvitationsDataType> = [
    {
      title: "Name-surname",
      align: "center",
      render: (_, record) => {
        // สำหรับ Inactivated tab ใช้ firstName และ lastName จาก record เอง
        // สำหรับ Activated tab ลองใช้ข้อมูลจาก record ก่อน แล้วค่อย fallback ไป activateBy
        if (!isActivated) {
          // Tab Inactivated - ใช้ข้อมูลจาก record เอง
          if (record?.firstName && record?.lastName) {
            const middleName = record?.middleName
              ? ` ${record.middleName}`
              : "";
            return (
              <div>{`${record.firstName}${middleName} ${record.lastName}`}</div>
            );
          }
        } else {
          // Tab Activated - ลองใช้ข้อมูลจาก record ก่อน แล้วค่อย activateBy
          if (record?.firstName && record?.lastName) {
            const middleName = record?.middleName
              ? ` ${record.middleName}`
              : "";
            return (
              <div>{`${record.firstName}${middleName} ${record.lastName}`}</div>
            );
          } else if (
            record?.activateBy?.givenName &&
            record?.activateBy?.familyName
          ) {
            return (
              <div>
                {`${record.activateBy.givenName} ${record.activateBy.familyName}`}
              </div>
            );
          }
        }
        return <div>-</div>;
      },
    },
    {
      title: "Role",
      align: "center",
      render: (_, record) => {
        return <div>{record?.role?.name || "-"}</div>;
      },
    },
    {
      title: "Email",
      align: "center",
      render: (_, record) => {
        return <div>{record?.email}</div>;
      },
    },
    {
      title: "Phone No.",
      align: "center",
      render: (_, record) => {
        // ลองใช้ contact จาก record ก่อน แล้วค่อย activateBy.contact
        return (
          <div>{record?.contact || record?.activateBy?.contact || "-"}</div>
        );
      },
    },
  ];

  const inActivatedColumns: ColumnsType<InvitationsDataType> = [
    ...defaultColumns,
    {
      title: "Create at",
      align: "center",
      render: (_, record) => {
        return <div>{dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</div>;
      },
    },
    {
      title: "Create by",
      align: "center",
      render: (_, record) => {
        return <div>{record?.createdBy?.givenName || "-"}</div>;
      },
    },
    {
      title: "Expire at",
      align: "center",
      render: (_, record) => {
        return (
          <div>{dayjs(record?.expireDate).format("DD/MM/YYYY HH:mm")}</div>
        );
      },
    },
    {
      title: "Resend",
      align: "center",
      render: (_, record) => {
        return (
          <Row gutter={[8, 8]} justify="center">
            <Col>
              <Button
                type="default"
                style={{
                  border: "2px solid var(--secondary-color)",
                }}
                onClick={() => handleResendInvitation(record.id)}
              >
                Resend verify
              </Button>
            </Col>
          </Row>
        );
      },
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => {
        return (
          <Row gutter={[8, 8]} justify="center">
            <Col>
              <Button
                type="text"
                onClick={() => {
                  onEdit(record);
                }}
                icon={
                  <EditOutlined
                    style={{ fontSize: 20, color: "var(--primary-color)" }}
                  />
                }
                title="View Details"
              />
            </Col>
            <Col>
              <Button
                type="text"
                onClick={() => {
                  onDelete(record.id);
                }}
                icon={
                  <DeleteOutlined
                    style={{ fontSize: 20, color: "var(--primary-color)" }}
                  />
                }
                title="View Details"
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const activatedColumn: ColumnsType<InvitationsDataType> = [
    ...defaultColumns,
    {
      title: "Activate at",
      align: "center",
      render: (_, record) => {
        return (
          <div>
            {record?.activateDate
              ? dayjs(record?.activateDate).format("DD/MM/YYYY HH:mm")
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Create by",
      align: "center",
      render: (_, record) => {
        return <div>{record?.createdBy?.givenName || "-"}</div>;
      },
    },
  ];

  // Functions
  const onTabsChange = (key: string) => {
    if (key === "activated") {
      setIsActivated(true);
    } else {
      setIsActivated(false);
    }
    setCurPage(1); // Reset to first page when changing tabs
  };

  const onCreate = async () => {
    setIsCreateModalOpen(true);
  };

  const handleResendInvitation = async (invitationId: string) => {
    callConfirmModal({
      title: "Resend Invitation",
      message: "Are you sure you want to resend this invitation?",
      okMessage: "Yes, Resend",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          const response = await axios.post(
            `/team-management/invitation/juristic/resend/${invitationId}`
          );

          if (response.status === 200 || response.status === 201) {
            callSuccessModal("Invitation resent successfully!");
            refetchInvitations();
          } else {
            callFailedModal("Failed to resend invitation. Please try again.");
          }
        } catch (error: any) {
          console.error("Resend invitation error:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to resend invitation. Please try again.";
          callFailedModal(errorMessage);
        }
      },
    });
  };

  const onEdit = async (record: InvitationsDataType) => {
    setIsEditModalOpen(true);
    setEditData(record);
  };

  const onEditClose = () => {
    setIsEditModalOpen(false);
    setEditData(undefined);
  };

  const onDelete = async (id: string) => {
    callConfirmModal({
      title: "Delete invitation",
      message: "Are you sure you want to delete this invitation?",
      okMessage: "Yes, Delete",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          await deleteInvitation
            .mutateAsync(id)
            .then(() => {
              // console.log(res);
              refetchInvitations();
            })
            .catch((err) => {
              console.error(err);
            });
        } catch (error: any) {
          console.error(error);
          callFailedModal(`Failed to delete: ${error.response?.data?.message}`);
        }
      },
    });
  };

  return (
    <>
      <Header title="Juristic's invitations" />
      <Flex align="center" justify="space-between">
        <Tabs
          defaultActiveKey="inactivated"
          items={items}
          onChange={onTabsChange}
        />
        <MediumActionButton
          className="userManagementExportBtn"
          message="Add new"
          onClick={onCreate}
        />
      </Flex>

      <Table
        columns={isActivated ? activatedColumn : inActivatedColumns}
        dataSource={invitationsData?.rows}
        loading={invitationsLoading}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          current: curPage,
          total: invitationsData?.total,
          onChange: (page) => {
            setCurPage(page);
          },
        }}
        rowKey="id"
      />

      <JuristicManageCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
        }}
        refetch={refetchInvitations}
      />
      {editData ? (
        <JuristicEditInvitationModal
          editData={editData}
          onCancel={onEditClose}
          isEditModalOpen={isEditModalOpen}
          refetch={refetchInvitations}
          key={"editModal"}
        />
      ) : null}
    </>
  );
};

export default JuristicInvitation;
