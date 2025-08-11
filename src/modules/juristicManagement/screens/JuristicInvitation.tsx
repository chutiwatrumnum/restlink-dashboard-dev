import { useState } from "react";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

// Components
import Header from "../../../components/templates/Header";
import { Row, Button, Col, Table, Tabs, Flex, message, Modal } from "antd";
import { getJuristicInvitationsQuery } from "../../../utils/queriesGroup/juristicQueries";
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import QrCodeModal from "../components/QrCodeModal";
import MediumActionButton from "../../../components/common/MediumActionButton";
import JuristicManageCreateModal from "../components/JuristicManageCreateModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";

// Types
import type { ColumnsType } from "antd/es/table";
import { InvitationsDataType } from "../../../stores/interfaces/JuristicManage";
import type { TabsProps } from "antd";
import axios from "axios";

const JuristicInvitation = () => {
  // Hooks & Variables
  const dispatch = useDispatch<Dispatch>();

  // States
  const [isActivated, setIsActivated] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<InvitationsDataType | null>(null);

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

  // Resend invitation function
  const handleResendInvitation = async (invitationId: string) => {
    ConfirmModal({
      title: "Resend Invitation",
      message: "Are you sure you want to resend this invitation?",
      okMessage: "Yes, Resend",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          setResendingId(invitationId);
          const response = await axios.post(
            `/team-management/invitation/juristic/resend/${invitationId}`
          );

          if (response.status === 200 || response.status === 201) {
            SuccessModal("Invitation resent successfully!");
            refetchInvitations();
          } else {
            FailedModal("Failed to resend invitation. Please try again.");
          }
        } catch (error: any) {
          console.error("Resend invitation error:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to resend invitation. Please try again.";
          FailedModal(errorMessage);
        } finally {
          setResendingId(null);
        }
      },
    });
  };

  // Show detail modal
  const showDetailModal = (record: InvitationsDataType) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const defaultColumns: ColumnsType<InvitationsDataType> = [
    {
      title: "Name-Surname",
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
      title: "Role assign",
      align: "center",
      render: (_, record) => {
        return <div>{record?.role?.name || "-"}</div>;
      },
    },
  ];

  const inActivatedColumns: ColumnsType<InvitationsDataType> = [
    ...defaultColumns,
    {
      title: "Create at",
      align: "center",
      render: (_, record) => {
        return <div>{dayjs(record?.createdAt).format("DD/MM/YYYY")}</div>;
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
      title: "Create by",
      align: "center",
      render: (_, record) => {
        return <div>{record?.createdBy?.givenName || "-"}</div>;
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
                onClick={() => showDetailModal(record)}
                icon={
                  <InfoCircleOutlined
                    style={{ fontSize: 20, color: "#403d38" }}
                  />
                }
                title="View Details"
              />
            </Col>
            <Col>
              <Button
                type="text"
                loading={resendingId === record.id}
                onClick={() => handleResendInvitation(record.id)}
                icon={
                  <ReloadOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                }
                title="Resend Invitation"
                disabled={resendingId === record.id}
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
      title: "Phone No.",
      align: "center",
      render: (_, record) => {
        // ลองใช้ contact จาก record ก่อน แล้วค่อย activateBy.contact
        return (
          <div>{record?.contact || record?.activateBy?.contact || "-"}</div>
        );
      },
    },
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
    {
      title: "Action",
      align: "center",
      render: (_, record) => {
        return (
          <Row gutter={[8, 8]} justify="center">
            <Col>
              <Button
                type="text"
                onClick={() => showDetailModal(record)}
                icon={
                  <InfoCircleOutlined
                    style={{ fontSize: 20, color: "#403d38" }}
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

      <QrCodeModal />

      {/* Detail Modal */}
      <Modal
        title="Invitation Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedRecord(null);
            }}>
            Close
          </Button>,
        ]}
        width={600}>
        {selectedRecord && (
          <div style={{ padding: "16px 0" }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <strong>Name:</strong>
                </div>
                <div>
                  {selectedRecord?.firstName} {selectedRecord?.middleName || ""}{" "}
                  {selectedRecord?.lastName}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Email:</strong>
                </div>
                <div>{selectedRecord?.email || "-"}</div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Contact:</strong>
                </div>
                <div>{selectedRecord?.contact || "-"}</div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Role:</strong>
                </div>
                <div>{selectedRecord?.role?.name || "-"}</div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Created At:</strong>
                </div>
                <div>
                  {dayjs(selectedRecord?.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Expire At:</strong>
                </div>
                <div>
                  {dayjs(selectedRecord?.expireDate).format("DD/MM/YYYY HH:mm")}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Created By:</strong>
                </div>
                <div>
                  {selectedRecord?.createdBy?.givenName}{" "}
                  {selectedRecord?.createdBy?.familyName}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Project:</strong>
                </div>
                <div>{selectedRecord?.project?.name || "-"}</div>
              </Col>
              {selectedRecord?.failReason && (
                <Col span={24}>
                  <div>
                    <strong>Fail Reason:</strong>
                  </div>
                  <div style={{ color: "#ff4d4f" }}>
                    {selectedRecord.failReason}
                  </div>
                </Col>
              )}
              {selectedRecord?.activate && selectedRecord?.activateBy && (
                <>
                  <Col span={12}>
                    <div>
                      <strong>Activated By:</strong>
                    </div>
                    <div>
                      {selectedRecord.activateBy.givenName}{" "}
                      {selectedRecord.activateBy.familyName}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <strong>Activated At:</strong>
                    </div>
                    <div>
                      {selectedRecord?.activateDate
                        ? dayjs(selectedRecord.activateDate).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "-"}
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </>
  );
};

export default JuristicInvitation;
