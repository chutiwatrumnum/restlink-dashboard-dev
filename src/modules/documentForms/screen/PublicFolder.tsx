import { useEffect, useState } from "react";
import { usePagination } from "../../../utils/hooks/usePagination";
import { usePermission } from "../../../utils/hooks/usePermission";

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
import UploadPublic from "../components/UploadPublic";
import NewFolderModal from "../components/NewFolderModal";
import { deleteDocumentFileById } from "../service/DocumentAPI";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";
import { deleteFolderMutation } from "../../../utils/mutationsGroup/documentMutations";

import type { ColumnsType } from "antd/es/table";
import { BreadcrumbType } from "../interface/Public";
import {
  GetPublicDataPayloadType,
  DocumentDataType,
  ModalModeType,
} from "../../../stores/interfaces/Document";

import "../styles/document.css";

const { Text, Link } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const PublicFolder = () => {
  // Initial
  const {
    curPage,
    perPage,
    setCurPage,
    onPageChange: onPageDocChange,
    deleteAndHandlePagination,
  } = usePagination();
  const dispatch = useDispatch<Dispatch>();
  const scroll: { x?: number | string } = {
    x: "max-content",
  };

  // Queries & Mutations
  const {
    isLoading,
    tableData,
    currentFoldersMaxLength,
    refresh,
    foldersLength,
  } = useSelector((state: RootState) => state.document);
  const deleteFolder = deleteFolderMutation();

  // States
  const [isModalUploadPublic, setIsModalUploadPublic] = useState(false);
  const [FolderCurrent, setFolderCurrent] = useState<number>(0);
  const [folderDetail, setFolderDetail] = useState<DocumentDataType>();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType[]>([]);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [mode, setMode] = useState<ModalModeType>("create");
  const [editFolderData, setEditFolderData] = useState<DocumentDataType>();
  const [editFileData, setEditFileData] = useState<DocumentDataType>();

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const columns: ColumnsType<DocumentDataType> = [
    {
      title: "Name",
      key: "name",
      align: "center",
      // width: "5%",
      render: (_: any, record: DocumentDataType, index: number) => {
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
      render: (_: any, record: DocumentDataType) => {
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
      fixed: "right",
      width: 120,
      render: (_, record, index) => (
        <>
          <Button
            className="iconButton"
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record, index)}
            disabled={!access("document_home", "edit")}
          />
          <Button
            className="iconButton"
            value={record?.id}
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record?.id)}
            disabled={!access("document_home", "delete")}
          />
        </>
      ),
    },
  ];

  // functions
  const fetchData = async () => {
    let conditions: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      folderId: FolderCurrent,
    };
    if (FolderCurrent === 0) {
      setBreadcrumb([
        {
          title: (
            <Link onClick={homeBreadcrumbClick} className="breadcrumbTxt">
              House Documents
            </Link>
          ),
        },
      ]);
    }
    await dispatch.document.getPublicData(conditions);
  };

  const onPageChange = async (page: number) => {
    onPageDocChange(page);
  };

  const subFolderClick = async (item: DocumentDataType, index: number) => {
    if (index < foldersLength && typeof item.id === "number") {
      setFolderCurrent(item.id);
      let conditions: GetPublicDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.id,
      };
      await dispatch.document.getPublicData(conditions);
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
    let conditions: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      search: text,
      folderId: FolderCurrent,
    };
    await dispatch.document.getPublicData(conditions);
  };

  const homeBreadcrumbClick = async () => {
    setFolderCurrent(0);
    setCurPage(1);
    setFolderDetail(undefined);
    fetchData();
  };

  const onBreadCrumbClick = async (item: DocumentDataType) => {
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
      let conditions: GetPublicDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.id,
      };
      await dispatch.document.getPublicData(conditions);
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
        deleteAndHandlePagination({
          dataLength: tableData.length,
          onDelete: async () => {
            if (typeof id === "string") {
              const statusDeleted = await deleteDocumentFileById(id);
              if (statusDeleted) {
                callSuccessModal("Delete successfully", 1500);
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
                });
            } else {
              console.log("Something went wrong!");
            }
            fetchData();
          },
          fetchData: fetchData,
        });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const onEdit = (record: DocumentDataType, index: number) => {
    if (index < foldersLength) {
      // console.log("Folder edit!", record);
      setIsNewFolderOpen(true);
      setMode("edit");
      setEditFolderData(record);
    } else {
      // console.log("File edit!", record);
      setIsModalUploadPublic(true);
      setMode("edit");
      setEditFileData(record);
    }
  };

  useEffect(() => {
    fetchData();
  }, [curPage, refresh]);

  return (
    <>
      <Header title="Documents" />
      <div className="document">
        <Breadcrumb className="breadcrumbPublicContainer" items={breadcrumb} />
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
            disabled={isLoading || !access("document_home", "create")}
          >
            New folder
          </Button>

          <Button
            type="primary"
            onClick={() => {
              setIsModalUploadPublic(true);
            }}
            icon={<UploadOutlined />}
            disabled={isLoading || !access("document_home", "create")}
          >
            Upload
          </Button>

          <UploadPublic
            callBack={async (isOpen: boolean, created: boolean) => {
              setIsModalUploadPublic(isOpen);
              setEditFileData(undefined);
              setMode("create");
              if (created) {
                let conditions: GetPublicDataPayloadType = {
                  curPage: curPage,
                  perPage: perPage,
                  folderId: FolderCurrent,
                };
                await dispatch.document.getPublicData(conditions);
              }
            }}
            isOpen={isModalUploadPublic}
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

export default PublicFolder;
