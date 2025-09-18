import { useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { usePagination } from "../../../utils/hooks/usePagination";
import { usePermission } from "../../../utils/hooks/usePermission";

// Components
import Header from "../../../components/templates/Header";
import { Row, Button, Col, Table, Tabs, Flex } from "antd";
import { getResidentInvitationsQuery } from "../../../utils/queriesGroup/residentQueries";
import { InfoCircleOutlined } from "@ant-design/icons";
import QrCodeModal from "../components/residentInformation/QrCodeModal";
import MediumActionButton from "../../../components/common/MediumActionButton";
import ResidentInformationCreateModal from "../components/residentInformation/ResidentInformationCreateModal";

// Types
import type { ColumnsType } from "antd/es/table";
import { InvitationsDataType } from "../../../stores/interfaces/ResidentInformation";
import type { TabsProps } from "antd";

const ResidentActivation = () => {
  // Hooks & Variables
  const dispatch = useDispatch<Dispatch>();
  const { curPage, onPageChange } = usePagination();

  // States
  const [isActivated, setIsActivated] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Data
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = getResidentInvitationsQuery({
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
      title: "Name-Surname",
      align: "center",
      render: (_, record) => {
        return (
          <div>
            {record?.activateBy?.givenName
              ? `${record?.activateBy?.givenName} ${record?.activateBy?.familyName}`
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Room number",
      align: "center",
      render: (_, record) => {
        return <div>{`${record?.unit?.roomAddress}`}</div>;
      },
    },
    {
      title: "Role assign",
      align: "center",
      render: (_, record) => {
        return <div>{`${record?.role?.name}`}</div>;
      },
    },
  ];

  const inActivatedColumns: ColumnsType<InvitationsDataType> = [
    ...defaultColumns,
    {
      title: "Create at",
      align: "center",
      render: (_, record) => {
        return <div>{`${dayjs(record?.createdAt).format("DD/MM/YYYY")}`}</div>;
      },
    },

    {
      title: "Expire at",
      align: "center",
      render: (_, record) => {
        return (
          <div>{`${dayjs(record?.expireDate).format("DD/MM/YYYY HH:mm")}`}</div>
        );
      },
    },
    {
      title: "Create by",
      align: "center",
      render: (_, record) => {
        return <div>{`${record?.createdBy?.givenName}`}</div>;
      },
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={24} lg={24}>
                <Button
                  type="text"
                  onClick={() => {
                    dispatch.resident.updateQrCodeState(record.code);
                  }}
                  icon={
                    <InfoCircleOutlined
                      style={{ fontSize: 20, color: "#403d38" }}
                    />
                  }
                  disabled={!access("users", "view")}
                />
              </Col>
            </Row>
          </>
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
        return <div>{`${record?.activateBy?.contact ?? "-"}`}</div>;
      },
    },
    {
      title: "Activate at",
      align: "center",
      render: (_, record) => {
        return (
          <div>
            {record?.activateDate
              ? `${dayjs(record?.activateDate).format("DD/MM/YYYY HH:mm")}`
              : "-"}
          </div>
        );
      },
    },
    {
      title: "Create by",
      align: "center",
      render: (_, record) => {
        return <div>{`${record?.createdBy?.givenName}`}</div>;
      },
    },
  ];

  // Functions
  const onTabsChange = (key: string) => {
    // console.log(key);
    if (key === "activated") {
      setIsActivated(true);
    } else {
      setIsActivated(false);
    }
  };

  const onCreate = async () => {
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <Header title="Resident’s invitations" />
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
          disabled={!access("users", "create")}
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
            onPageChange(page);
          },
        }}
      />
      <ResidentInformationCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
        }}
        refetch={refetchInvitations}
      />
      <QrCodeModal />
    </>
  );
};

export default ResidentActivation;
