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
import "../styles/maintenanceGuide.css";

import {
  GetMaintenanceGuideDataPayloadType,
  MaintenanceGuideDataType,
} from "../../../stores/interfaces/MaintenanceGuide";
import { BreadcrumbType } from "../interface/MaintenanceGuide";
import type { ColumnsType } from "antd/es/table";
import UploadMaintenanceGuide from "../components/UploadMaintenanceGuide";
import { deleteMaintenanceGuideById } from "../service/MaintenanceGuideAPI";

const { Text, Link } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const MaintenanceGuideFolder = () => {
  const dispatch = useDispatch<Dispatch>();
  const [isModalUploadMaintenanceGuide, setIsModalUploadMaintenanceGuide] =
    useState(false);
  const {
    isLoading,
    tableData,
    currentFoldersMaxLength,
    maintenanceGuideFiles,
    maintenanceGuideFolders,
    refresh,
  } = useSelector((state: RootState) => state.maintenanceGuide);
  const { accessibility } = useSelector((state: RootState) => state.common);
  const defaultURL = "maintenanceGuide-folder";
  const scroll: { x?: number | string } = {
    x: "50vw",
  };

  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [FolderCurrent, setFolderCurrent] = useState<number>(0);
  const [folderDetail, setFolderDetail] = useState<MaintenanceGuideDataType>();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType[]>([]);

  const columns: ColumnsType<MaintenanceGuideDataType> = [
    {
      title: "Name",
      key: "name",
      align: "center",
      width: "5%",
      render: (_: any, record: MaintenanceGuideDataType) => {
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
      render: (_: any, record: MaintenanceGuideDataType) => {
        const names = record.fullName === "" ? "-" : record.fullName;
        return (
          <>
            <Text>{names}</Text>
          </>
        );
      },
    },
    // {
    //   title: "Delete",
    //   dataIndex: "delete",
    //   align: "center",
    //   width: "1%",
    //   hidden: breadcrumb.length === 1,
    //   render: (_, record) => (
    //     <>
    //       {record?.idFile ? (
    //         <Button
    //           value={record?.idFile}
    //           type="text"
    //           icon={<DeleteOutlined />}
    //           onClick={showDeleteConfirm}
    //           // disabled={!accessibility?.menu_maintenanceGuide_form_management.allowEdit}
    //         ></Button>
    //       ) : null}
    //     </>
    //   ),
    // },
  ];

  // functions
  const fetchData = async () => {
    let conditionsDefault: GetMaintenanceGuideDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
    };

    let conditions: GetMaintenanceGuideDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      folderId: FolderCurrent,
    };
    if (FolderCurrent > 0) {
      await dispatch.maintenanceGuide.getFolderData(conditions);
    } else {
      setBreadcrumb([
        {
          title: (
            <Link onClick={homeBreadcrumbClick} className="breadcrumbTxt">
              Project info
            </Link>
          ),
        },
      ]);
      await dispatch.maintenanceGuide.getMaintenanceGuideData(
        conditionsDefault
      );
    }
  };

  const onPageChange = async (page: number) => {
    setCurPage(page);
  };

  const subFolderClick = async (item: MaintenanceGuideDataType) => {
    if (!item.fileName) {
      let conditions: GetMaintenanceGuideDataPayloadType = {
        curPage: curPage,
        perPage: perPage,
        folderId: item.folderId,
      };
      setFolderCurrent(item.folderId);
      await dispatch.maintenanceGuide.getFolderData(conditions);
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
      dispatch.maintenanceGuide.updateTableDataState([
        ...maintenanceGuideFolders,
        ...maintenanceGuideFiles,
      ]);
      return;
    }
    let conditions: GetMaintenanceGuideDataPayloadType = {
      curPage: curPage,
      perPage: perPage,
      search: text,
      folderId: FolderCurrent,
    };
    if (FolderCurrent === 0) {
      await dispatch.maintenanceGuide.getSearchMaintenanceGuideData(conditions);
      return;
    }
    await dispatch.maintenanceGuide.getFolderData(conditions);
  };

  const homeBreadcrumbClick = async () => {
    await setFolderCurrent(0);
    await setCurPage(1);
    dispatch.maintenanceGuide.updateRefreshState(!refresh);
  };

  const onBreadCrumbClick = async (item: MaintenanceGuideDataType) => {
    let conditions: GetMaintenanceGuideDataPayloadType = {
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

    await dispatch.maintenanceGuide.getFolderData(conditions);
  };

  const showDeleteConfirm = ({ currentTarget }: any) => {
    confirm({
      title: "Are you sure you want to delete this?",
      icon: null,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      async onOk() {
        const statusDeleted = await deleteMaintenanceGuideById(
          currentTarget.value
        );
        if (statusDeleted) {
          Modal.success({ content: "Delete successfully", centered: true });
          destroyModal();
        } else {
          Modal.error({ content: "Delete failed", centered: true });
          destroyModal();
        }
        let conditions: GetMaintenanceGuideDataPayloadType = {
          curPage: curPage,
          perPage: perPage,
          folderId: FolderCurrent,
        };
        if (FolderCurrent === 0) {
          await fetchData();
        } else {
          await dispatch.maintenanceGuide.getFolderData(conditions);
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const destroyModal = () => {
    setTimeout(() => {
      Modal.destroyAll();
    }, 1500);
  };

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
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            onClick={async () => {
              setIsModalUploadMaintenanceGuide(true);
            }}
            // disabled={!accessibility?.menu_maintenanceGuide_form_management.allowEdit}
            icon={<UploadOutlined />}
          >
            Upload
          </Button>
          <UploadMaintenanceGuide
            callBack={async (isOpen: boolean, created: boolean) => {
              setIsModalUploadMaintenanceGuide(isOpen);
              if (created) {
                let conditions: GetMaintenanceGuideDataPayloadType = {
                  curPage: curPage,
                  perPage: perPage,
                  folderId: FolderCurrent,
                };
                if (FolderCurrent === 0) {
                  await fetchData();
                } else {
                  await dispatch.maintenanceGuide.getFolderData(conditions);
                }
              }
            }}
            isOpen={isModalUploadMaintenanceGuide}
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

export default MaintenanceGuideFolder;
