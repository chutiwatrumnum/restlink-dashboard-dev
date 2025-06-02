import { useState } from "react";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";

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

  // States
  const [isActivated, setIsActivated] = useState(true);
  const [curPage, setCurPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Data
  const { data: invitationsData, isLoading: invitationsLoading } =
    getResidentInvitationsQuery({
      activate: isActivated,
      curPage: curPage,
    });

  const items: TabsProps["items"] = [
    {
      key: "activated",
      label: "Activated",
    },
    {
      key: "inactivated",
      label: "Inactivated",
    },
  ];

  const columns: ColumnsType<InvitationsDataType> = [
    {
      title: "Activate by",
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
      title: "Room address",
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
        return <div>{`${dayjs(record?.createdAt).format("DD/MM/YYYY")}`}</div>;
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
                    // console.log(record.code);
                    dispatch.resident.updateQrCodeState(record.code);
                  }}
                  icon={
                    <InfoCircleOutlined
                      style={{ fontSize: 20, color: "#403d38" }}
                    />
                  }
                />
              </Col>
            </Row>
          </>
        );
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
          defaultActiveKey="activated"
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
        columns={columns}
        dataSource={invitationsData?.rows}
        loading={invitationsLoading}
        pagination={{
          pageSize: 10,
          current: curPage,
          total: invitationsData?.total,
          onChange: (page) => {
            // console.log(page);
            setCurPage(page);
          },
        }}
      />
      <ResidentInformationCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
        }}
      />
      <QrCodeModal />
    </>
  );
};

export default ResidentActivation;
