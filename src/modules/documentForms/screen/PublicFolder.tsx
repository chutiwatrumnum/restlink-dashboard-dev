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
  FolderFilled,
  FileFilled,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import { ConvertDate } from "../../../utils/helper";
import "../styles/document.css";

import {
  GetPublicDataPayloadType,
  DocumentDataType,
} from "../../../stores/interfaces/Document";
import { BreadcrumbType } from "../interface/Public";
import type { ColumnsType } from "antd/es/table";
import UploadPublic from "../components/UploadPublic";
import { deleteDocumentById } from "../service/DocumentAPI";

const { Text, Link } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const PublicFolder = () => {
  const dispatch = useDispatch<Dispatch>();
  const [isModalUploadPublic, setIsModalUploadPublic] = useState(false);
  const {
    isLoading,
    tableData,
    currentFoldersMaxLength,
    publicFiles,
    publicFolders,
    refresh,
  } = useSelector((state: RootState) => state.document);
  const { accessibility } = useSelector((state: RootState) => state.common);
  const defaultURL = "public-folder";
  const scroll: { x?: number | string } = {
    x: "50vw",
  };

  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [FolderCurrent, setFolderCurrent] = useState<number>(0);
  const [folderDetail, setFolderDetail] = useState<DocumentDataType>();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType[]>([]);
  const showDeleteConfirm = ({ currentTarget }: any) => {
    confirm({
      title: "Are you sure you want to delete this?",
      icon: null,
      // content: "Some descriptions",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      async onOk() {
        // const statusDeleted = await deleteDocumentById(currentTarget.value);
        // if (statusDeleted) {
        //   dispatch.common.updateSuccessModalState({
        //     open: true,
        //     text: "Successfully deleted",
        //   });
        // } else {
        //   dispatch.common.updateSuccessModalState({
        //     open: true,
        //     status: "error",
        //     text: "Failed deleted",
        //   });
        // }
        // let conditions: GetPublicDataPayloadType = {
        //   curPage: curPage,
        //   perPage: perPage,
        //   folderId: FolderCurrent,
        // };
        // if (FolderCurrent === 0) {
        //   await fetchData();
        // } else {
        //   await dispatch.document.getFolderData(conditions);
        // }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const columns: ColumnsType<DocumentDataType> = [
    {
      title: "Delete",
      dataIndex: "delete",
      align: "center",
      width: "1%",
      render: (_, record) => (
        <>
          {record?.idFile ? (
            <Button
              value={record?.idFile}
              type="text"
              icon={<DeleteOutlined />}
              onClick={showDeleteConfirm}
              // disabled={!accessibility?.menu_document_form_management.allowEdit}
            ></Button>
          ) : null}
        </>
      ),
    },
    {
      title: "Name",
      key: "name",
      align: "center",
      width: "5%",
      render: (_: any, record: DocumentDataType) => {
        let name = record.fileName === "" ? record.folderName : record.fileName;
        return (
          <div className="fileName" onClick={() => subFolderClick(record)}>
            <div className="fileNameIcon">
              {record.fileName === "" ? <FolderFilled /> : <FileFilled />}
            </div>
            <Text style={{ textAlign: "left" }}>{name}</Text>
          </div>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "fileSize",
      key: "fileSize",
      align: "center",
      width: "1%",
      render: (fileSize: string) => {
        const size = fileSize === "" ? "-" : fileSize;
        return (
          <>
            <Text>{size}</Text>
          </>
        );
      },
    },
    {
      title: "Create date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "2%",
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
      width: "2%",
      render: (startDate: string) => {
        const time = ConvertDate(startDate); // add new
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
      width: "2%",
      render: (_: any, record: DocumentDataType) => {
        const names = record.fullName === "" ? "-" : record.fullName;
        return (
          <>
            <Text>{names}</Text>
          </>
        );
      },
    },
  ];

  // functions
  const fetchData = async () => {
    let conditionsDefault: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
    };

    let conditions: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      folderId: FolderCurrent,
    };
    if (FolderCurrent > 0) {
      await dispatch.document.getFolderData(conditions);
    } else {
      setBreadcrumb([
        {
          title: (
            <Link onClick={homeBreadcrumbClick} className="breadcrumbTxt">
              Public folder
            </Link>
          ),
        },
      ]);
      await dispatch.document.getPublicData(conditionsDefault);
    }
  };

  const onPageChange = async (page: number) => {
    await setCurPage(page);
  };

  const subFolderClick = async (item: DocumentDataType) => {
    if (!item.fileName) {
      let conditions: GetPublicDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.folderId,
      };
      await setFolderCurrent(item.folderId);
      await dispatch.document.getFolderData(conditions);
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
              {item.folderName}
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
    if (!text && FolderCurrent === 0) {
      dispatch.document.updateTableDataState([
        ...publicFolders,
        ...publicFiles,
      ]);
      return;
    }
    let conditions: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      search: text,
      folderId: FolderCurrent,
    };
    if (FolderCurrent === 0) {
      await dispatch.document.getSearchPublicData(conditions);
      return;
    }
    await dispatch.document.getFolderData(conditions);
  };

  const homeBreadcrumbClick = async () => {
    await setFolderCurrent(0);
    await setCurPage(1);
    dispatch.document.updateRefreshState(!refresh);
  };

  const onBreadCrumbClick = async (item: DocumentDataType) => {
    let conditions: GetPublicDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      folderId: item.folderId,
    };

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
            {item.folderName}
          </Link>
        ),
      },
    ]);

    await dispatch.document.getFolderData(conditions);
  };

  useEffect(() => {
    fetchData();
  }, [curPage, refresh]);

  return (
    <>
      <Header title="Document forms" />
      <div className="document">
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
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            onClick={async () => {
              await setIsModalUploadPublic(true);
            }}
            // disabled={!accessibility?.menu_document_form_management.allowEdit}
            icon={<UploadOutlined />}
          >
            Upload
          </Button>
          <UploadPublic
            callBack={async (isOpen: boolean, created: boolean) => {
              await setIsModalUploadPublic(isOpen);
              if (created) {
                let conditions: GetPublicDataPayloadType = {
                  curPage: curPage,
                  perPage: perPage,
                  folderId: FolderCurrent,
                };
                if (FolderCurrent === 0) {
                  await fetchData();
                } else {
                  await dispatch.document.getFolderData(conditions);
                }
              }
            }}
            isOpen={isModalUploadPublic}
            FolderId={FolderCurrent}
            folderDetail={folderDetail}
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
