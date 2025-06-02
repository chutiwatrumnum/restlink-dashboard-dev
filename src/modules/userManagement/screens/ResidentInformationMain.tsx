import { useState, useEffect } from "react";
import { Row, Button, Modal, Col, QRCode, Flex, Input, message } from "antd";
import Header from "../../../components/templates/Header";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import ResidentInformationTable from "../components/residentInformation/ResidentInformationTable";
import ResidentInformationCreateModal from "../components/residentInformation/ResidentInformationCreateModal";
// import ResidentInformationEditModal from "../components/residentInformation/ResidentInformationEditModal";
import dayjs from "dayjs";
import { conditionPage } from "../../../stores/interfaces/ResidentInformation";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import type { ColumnsType, TableProps } from "antd/es/table";
import { ResidentInformationDataType } from "../../../stores/interfaces/ResidentInformation";
import { InfoCircleOutlined } from "@ant-design/icons";
import "../styles/userManagement.css";
import SuccessModal from "../../../components/common/SuccessModal";
import FailedModal from "../../../components/common/FailedModal";
import { deleteResidentId } from "../service/api/ResidentServiceAPI";
import InfoResidentInformation from "../components/residentInformation/InfoResidentInformation";
import ConfirmModal from "../../../components/common/ConfirmModal";
import QrCodeModal from "../components/residentInformation/QrCodeModal";
const ResidentInformationMain = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const { loading, tableData, total } = useSelector(
    (state: RootState) => state.resident
  );
  const { accessibility } = useSelector((state: RootState) => state.common);

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ResidentInformationDataType | null>(
    null
  );
  const [paramsData, setParamsData] = useState<conditionPage>(params);
  const [isModalOpenInfo, setIsModalOpenInfo] = useState(false);
  const [dataInfo, setDataInfo] = useState<any>(null);

  const columns: ColumnsType<ResidentInformationDataType> = [
    {
      title: "First name",
      width: "7%",
      dataIndex: "givenName",
      align: "center",
      sorter: {
        compare: (a, b) => a.givenName.localeCompare(b.givenName),
      },
    },
    {
      title: "Last name",
      dataIndex: "familyName",
      align: "center",
      width: "7%",
      sorter: {
        compare: (a, b) => a.familyName.localeCompare(b.familyName),
      },
    },
    {
      title: "Room address",
      align: "center",
      width: "5%",
      sorter: {
        compare: (a, b) => a.unit.roomAddress.localeCompare(b.unit.roomAddress),
      },
      render: (_, record) => {
        return <div>{record.unit.roomAddress}</div>;
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      align: "center",
      width: "5%",
      sorter: {
        compare: (a, b) => a.role.name.localeCompare(b.role.name),
      },
      render: (_, record) => {
        return <div>{record.role.name}</div>;
      },
    },
    // {
    //   title: "Move-in-date",
    //   dataIndex: "moveInDate",
    //   align: "center",
    //   width: "5%",
    //   render: (_, record) => {
    //     return (
    //       <div>
    //         {record.moveInDate
    //           ? dayjs(record.moveInDate).format("DD/MM/YYYY")
    //           : "-"}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Move-out-date",
    //   dataIndex: "moveOutDate",
    //   align: "center",
    //   width: "5%",
    //   render: (_, record) => {
    //     return (
    //       <div>
    //         {record.moveOutDate
    //           ? dayjs(record.moveOutDate).format("DD/MM/YYYY")
    //           : "-"}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Last Update",
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
      title: "Update by",
      dataIndex: "updatedBy",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return <div>{record?.updatedBy ?? "-"}</div>;
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
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={24} lg={24}>
                <Button
                  type="text"
                  // disabled={
                  //   accessibility?.team_user_management.allowView ? false : true
                  // }
                  onClick={() => onGetDetail(record)}
                  icon={
                    <InfoCircleOutlined
                      style={{ fontSize: 20, color: "#403d38" }}
                    />
                  }
                />
              </Col>
              {/* <Col xs={8} sm={8} lg={8}>
                <Button
                  disabled={
                    accessibility?.team_user_management.allowEdit ? false : true
                  }
                  type="link"
                  icon={<EditIcon />}
                  onClick={() => onEdit(record)}
                />
              </Col> */}
              {/* <Col xs={8} sm={8} lg={8}>
                <Button
                  disabled={
                    accessibility?.team_user_management.allowDelete
                      ? false
                      : true
                  }
                  value={record.id}
                  type="text"
                  onClick={showDeleteConfirm}
                  icon={<TrashIcon />}
                />
              </Col> */}
            </Row>
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
    await setParamsData(params);
    await dispatch.resident.getTableData(paramsData);
  };

  const onCreate = async () => {
    setIsCreateModalOpen(true);
  };

  const onGetDetail = async (data: ResidentInformationDataType) => {
    await setDataInfo(data);
    await setIsModalOpenInfo(true);
  };

  const onEdit = async (data: ResidentInformationDataType) => {
    // console.log(data);
    await setEditData(data);
    await setIsEditModalOpen(true);
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
      await setParamsData(params);
      await setCurrentPage(params.curPage);
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
      await setParamsData(params);
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
            placeholderText="Search by first name, mobile no. and Room address"
            className="userManagementSearchBox"
            onSearch={onSearch}
          />
        </div>
        <MediumActionButton
          // disabled={accessibility?.team_user_management.allowAdd ? false : true}
          className="userManagementExportBtn"
          message="Add new"
          onClick={onCreate}
        />
      </div>
      <InfoResidentInformation
        callBack={async (isOpen: boolean) => await setIsModalOpenInfo(isOpen)}
        isOpen={isModalOpenInfo}
        resident={dataInfo}
      />
      <ResidentInformationTable
        columns={columns}
        data={tableData}
        onEdit={onEdit}
        PaginationConfig={PaginationConfig}
        loading={loading}
        onchangeTable={onChangeTable}
      />
      <ResidentInformationCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
        }}
      />
      {/* <ResidentInformationEditModal
        isEditModalOpen={isEditModalOpen}
        data={editData}
        callBack={async (isOpen: boolean, saved: boolean) => {
          await setIsEditModalOpen(isOpen);
          if (saved) {
            await setRerender(!rerender);
          }
        }}
      /> */}
      <QrCodeModal />
    </>
  );
};

export default ResidentInformationMain;
