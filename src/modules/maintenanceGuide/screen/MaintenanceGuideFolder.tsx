import { useEffect, useState } from "react";
import Header from "../../../components/templates/Header";
import {
  Row,
  Col,
  Input,
  Button,
  Typography,
  Table,
  Pagination,
  Spin,
  Breadcrumb,
  message,
  Modal,
} from "antd";
import {
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { ConvertDate } from "../../../utils/helper";
import "../styles/maintenanceGuide.css";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";
import NewFolderModal from "../components/NewFolderModal";

import {
  GetMaintenanceGuideDataPayloadType,
  MaintenanceGuideDataType,
  ModalModeType,
} from "../../../stores/interfaces/MaintenanceGuide";
import { BreadcrumbType } from "../interface/MaintenanceGuide";
import type { ColumnsType } from "antd/es/table";
import UploadMaintenanceGuide from "../components/UploadMaintenanceGuide";
import { deleteMaintenanceGuideById } from "../service/MaintenanceGuideAPI";
import { deleteFolderMutation } from "../../../utils/mutationsGroup/maintenanceMutations";

const { Text, Link } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const MaintenanceGuideFolder = () => {
  // Variables
  const dispatch = useDispatch<Dispatch>();
  const scroll: { x?: number | string } = {
    x: "50vw",
  };

  // Queries & Mutations
  const {
    isLoading,
    tableData,
    currentFoldersMaxLength,
    refresh,
    foldersLength,
  } = useSelector((state: RootState) => state.maintenanceGuide);
  const deleteFolder = deleteFolderMutation();

  // States
  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [FolderCurrent, setFolderCurrent] = useState<number>(0);
  const [folderDetail, setFolderDetail] = useState<MaintenanceGuideDataType>();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType[]>([]);
  const [isModalUploadOpen, setIsModalUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [mode, setMode] = useState<ModalModeType>("create");
  const [editFolderData, setEditFolderData] =
    useState<MaintenanceGuideDataType>();
  const [editFileData, setEditFileData] = useState<MaintenanceGuideDataType>();

  const columns: ColumnsType<MaintenanceGuideDataType> = [
    {
      title: "Name",
      key: "name",
      align: "center",
      // width: "5%",
      render: (_: any, record: MaintenanceGuideDataType, index: number) => {
        return (
          <div
            className="fileName"
            onClick={() => subFolderClick(record, index)}
          >
            <div className="fileNameIcon">
              {index < foldersLength ? <FolderOutlined /> : <FileOutlined />}
            </div>
            <Text style={{ textAlign: "left" }}>
              {record.name ?? record.fileName}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Create date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt: string) => {
        let date = dayjs(createdAt).format("DD/MM/YYYY").toString();
        return (
          <>
            <Text>{date}</Text>
          </>
        );
      },
    },
    {
      title: "Create time",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt: string) => {
        const time = ConvertDate(createdAt); // add new
        return (
          <>
            <Text>{time.time}</Text>
          </>
        );
      },
    },
    {
      title: "Create by",
      key: "createBy",
      align: "center",
      render: (_: any, record: MaintenanceGuideDataType) => {
        const names = record.fullName === "" ? "-" : record.fullName;
        return (
          <>
            <Text>{names}</Text>
          </>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "actions",
      align: "center",
      // fixed: "right",
      // hidden: breadcrumb.length === 1,
      render: (_, record, index: number) => (
        <>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record, index)}
          />
          <Button
            value={record?.id}
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record?.id)}
          />
        </>
      ),
    },
  ];

  // functions
  const fetchData = async () => {
    let conditions: GetMaintenanceGuideDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      folderId: FolderCurrent,
    };
    if (FolderCurrent === 0) {
      setBreadcrumb([
        {
          title: (
            <Link onClick={homeBreadcrumbClick} className="breadcrumbTxt">
              Project info
            </Link>
          ),
        },
      ]);
    }
    await dispatch.maintenanceGuide.getMaintenanceGuideData(conditions);
  };

  const onPageChange = async (page: number) => {
    setCurPage(page);
  };

  const subFolderClick = async (
    item: MaintenanceGuideDataType,
    index: number
  ) => {
    if (index < foldersLength && typeof item.id === "number") {
      setFolderCurrent(item.id);
      let conditions: GetMaintenanceGuideDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.id,
      };
      await dispatch.maintenanceGuide.getMaintenanceGuideData(conditions);
      setBreadcrumb((prevState) => [
        ...prevState,
        {
          title: (
            <Link
              onClick={() => {
                onBreadCrumbClick(item);
              }}
              className="breadcrumbTxt"
            >
              {item.name}
            </Link>
          ),
        },
      ]);
      setFolderDetail(item);
      return;
    }
    message.error("File is no action!");
  };

  const onSearch = async (text: string) => {
    let conditions: GetMaintenanceGuideDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      search: text,
      folderId: FolderCurrent,
    };
    await dispatch.maintenanceGuide.getMaintenanceGuideData(conditions);
  };

  const homeBreadcrumbClick = async () => {
    setFolderCurrent(0);
    setCurPage(1);
    setFolderDetail(undefined);
    fetchData();
  };

  const onBreadCrumbClick = async (item: MaintenanceGuideDataType) => {
    if (typeof item.id === "number") setFolderCurrent(item.id);
    setBreadcrumb([
      ...breadcrumb,
      {
        title: (
          <Link
            onClick={() => {
              onBreadCrumbClick(item);
            }}
            className="breadcrumbTxt"
          >
            {item.name}
          </Link>
        ),
      },
    ]);

    if (typeof item.id === "number") {
      let conditions: GetMaintenanceGuideDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.id,
      };
      await dispatch.maintenanceGuide.getMaintenanceGuideData(conditions);
    }
  };

  const showDeleteConfirm = (id: string | number) => {
    confirm({
      title: "Are you sure you want to delete this?",
      icon: null,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      async onOk() {
        if (typeof id === "string") {
          const statusDeleted = await deleteMaintenanceGuideById(id);
          if (statusDeleted) {
            callSuccessModal("Delete successfully", 1500);
            let conditions: GetMaintenanceGuideDataPayloadType = {
              curPage: curPage,
              perPage: perPage,
              folderId: FolderCurrent,
            };
            if (FolderCurrent === 0) {
              await fetchData();
            } else {
              await dispatch.maintenanceGuide.getMaintenanceGuideData(
                conditions
              );
            }
          } else {
            callFailedModal("Delete failed", 1500);
          }
        } else if (typeof id === "number") {
          // console.log("Delete folder because id is not string");
          deleteFolder
            .mutateAsync(id)
            .then(() => {
              callSuccessModal("Delete successfully", 1500);
            })
            .catch(() => {
              callFailedModal("Delete failed", 1500);
            })
            .finally(() => {
              fetchData();
            });
        } else {
          console.log("Something went wrong!");
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const onEdit = (record: MaintenanceGuideDataType, index: number) => {
    if (index < foldersLength) {
      console.log("Folder edit!", record);
      setIsNewFolderOpen(true);
      setMode("edit");
      setEditFolderData(record);
    } else {
      // console.log("File edit!", record);
      setIsModalUploadOpen(true);
      setMode("edit");
      setEditFileData(record);
    }
  };

  // Actions
  useEffect(() => {
    fetchData();
  }, [curPage, refresh]);

  return (
    <>
      <Header title="Documents" />
      <div className="maintenanceGuide">
        <Breadcrumb className="breadcrumbContainer" items={breadcrumb} />
      </div>
      <Row style={{ marginBottom: 15 }}>
        <Col
          span={12}
          style={{ display: "flex", justifyContent: "flex-start" }}
        >
          <Search
            placeholder="Search by Name"
            onSearch={onSearch}
            className="searchBox"
            style={{ width: 300 }}
            allowClear
          />
        </Col>
        <Col
          span={12}
          style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
        >
          <Button
            type="primary"
            onClick={() => {
              setIsNewFolderOpen(true);
            }}
            icon={<PlusCircleOutlined />}
            disabled={isLoading}
          >
            New folder
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              setIsModalUploadOpen(true);
            }}
            icon={<UploadOutlined />}
            disabled={isLoading}
          >
            Upload
          </Button>
          <UploadMaintenanceGuide
            callBack={async (isOpen: boolean, created: boolean) => {
              setIsModalUploadOpen(isOpen);
              setEditFileData(undefined);
              setMode("create");
              if (created) {
                let conditions: GetMaintenanceGuideDataPayloadType = {
                  curPage: curPage,
                  perPage: perPage,
                  folderId: FolderCurrent,
                };
                await dispatch.maintenanceGuide.getMaintenanceGuideData(
                  conditions
                );
              }
            }}
            isOpen={isModalUploadOpen}
            folderId={FolderCurrent}
            folderDetail={folderDetail}
            mode={mode}
            editData={editFileData}
          />
          <NewFolderModal
            isOpen={isNewFolderOpen}
            folderId={FolderCurrent}
            folderDetail={folderDetail}
            fetchData={fetchData}
            mode={mode}
            editData={editFolderData}
            onCancel={() => {
              setEditFolderData(undefined);
              setIsNewFolderOpen(false);
              setMode("create");
            }}
          />
        </Col>
      </Row>
      <Row>
        {isLoading ? (
          <div className="loadingContainer">
            <Spin />
            <p>Loading...</p>
          </div>
        ) : (
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={tableData}
              scroll={scroll}
              pagination={false}
            />
            <Row justify={"end"}>
              <Pagination
                className="pagination"
                defaultCurrent={curPage}
                pageSize={perPage}
                onChange={onPageChange}
                total={currentFoldersMaxLength}
                showSizeChanger={false}
              />
            </Row>
          </Col>
        )}
      </Row>
    </>
  );
};

export default MaintenanceGuideFolder;
