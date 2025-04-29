import { useState, useEffect } from "react";
import { Button, Row, Pagination } from "antd";
import Header from "../../../components/templates/Header";
import DatePicker from "../../../components/common/DatePicker";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import AnnounceTable from "../components/ProjectNewTable";
import AnnouncementCreateModal from "../components/ProjectNewCreateModal";
import AnnouncementEditModal from "../components/ProjectNewEditModal";
import AnnouncementInfo from "../components/ProjectNewInfo";
import { EditIcon, TrashIcon, InfoIcon } from "../../../assets/icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import ConfirmModal from "../../../components/common/ConfirmModal";

import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import dayjs from "dayjs";
import {
  ProjectNewFormDataType,
  DataProjectNewType,
  ProjectNewPayloadType,
} from "../../../stores/interfaces/ProjectNew";
import type { RangePickerProps } from "antd/es/date-picker";

import "../styles/announcement.css";
import { ConvertDate } from "../../../utils/helper";

const projectNew = () => {
  // variables
  const dispatch = useDispatch<Dispatch>();
  const data = useSelector((state: RootState) => state.projectNew.tableData);
  const announcementMaxLength = useSelector(
    (state: RootState) => state.projectNew.announcementMaxLength
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editData, setEditData] = useState<ProjectNewFormDataType>({});
  const [search, setSearch] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [refresh, setRefresh] = useState(false);

  // functions
  const onSearch = (value: string) => {
    // console.log(value);
    setSearch(value);
  };

  const onPageChange = (page: number) => {
    setCurPage(page);
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

  const onEdit = (record: DataProjectNewType) => {
    const editData: ProjectNewFormDataType = {
      id: record.id,
      title: record.title,
      image: record.imageUrl,
      startDate: ConvertDate(record.startDate).dateTimeUTC,
      startTime: ConvertDate(record.startDate).dateTimeUTC,
      endDate: ConvertDate(record.endDate).dateTimeUTC,
      endTime: ConvertDate(record.endDate).dateTimeUTC,
      description: record.description,
      link: record.url,
    };
    setEditData(editData);
    setIsEditModalOpen(true);
  };

  const onEditOk = () => {
    setIsEditModalOpen(false);
  };

  const onEditCancel = () => {
    setIsEditModalOpen(false);
    setEditData({});
  };

  const onInfoClick = (record: DataProjectNewType) => {
    setEditData(record);
    setIsInfoModalOpen(true);
  };

  const onInfoCancel = () => {
    setIsInfoModalOpen(false);
  };

  const onDateSelect = (values: RangePickerProps["value"]) => {
    let start: any, end: any;
    values?.forEach((value, index) => {
      if (index === 0) {
        start = value?.format("YYYY-MM");
      } else {
        end = value?.format("YYYY-MM");
      }
    });
    setStartDate(start);
    setEndDate(end);
  };

  const fetchData: VoidFunction = async () => {
    const payload: ProjectNewPayloadType = {
      search: search,
      curPage: curPage,
      perPage: perPage,
      startDate: startDate,
      endDate: endDate,
    };
    await dispatch.projectNew.getTableData(payload);
  };

  const onRefresh: VoidFunction = () => {
    setRefresh(!refresh);
  };

  const showDeleteConfirm = (value: DataProjectNewType) => {
    ConfirmModal({
      title: "Are you sure you want to delete this?",
      okMessage: "Yes",
      cancelMessage: "Cancel",
      onOk: async () => {
        await dispatch.projectNew.deleteTableData(value.id);
        onRefresh();
      },
      onCancel: () => console.log("Cancel"),
    });
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize
  ) => {
    // console.log(current, pageSize);
    setPerPage(pageSize);
  };

  const columns: ColumnsType<DataProjectNewType> = [
    {
      title: "Delete",
      key: "delete",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              onClick={() => showDeleteConfirm(record)}
              type="text"
              icon={<TrashIcon />}
            />
          </>
        );
      },
    },
    {
      title: "Image",
      key: "imageUrl",
      align: "center",
      render: ({ imageUrl }) => <img src={imageUrl} height={100} />,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      align: "center",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Status",
      key: "active",
      align: "center",
      render: ({ startDate, endDate }) => {
        let status = "Unpublished";
        if (dayjs().isBefore(endDate) && dayjs().isAfter(startDate)) {
          status = "Published";
        }
        return <span>{status}</span>;
      },
    },
    {
      title: "Start Date",
      key: "startDate",
      align: "center",
      render: ({ startDate }) => {
        return <span>{dayjs(startDate).format("DD/MM/YYYY HH:mm")}</span>;
      },
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "Start Time",
      key: "startDate",
      align: "center",
      render: ({ startDate }) => {
        return <span>{dayjs(startDate).format("HH:mm")}</span>;
      },
    },
    {
      title: "End Date",
      key: "endDate",
      align: "center",
      render: ({ endDate }) => {
        return <span>{dayjs(endDate).format("DD/MM/YYYY")}</span>;
      },
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "End Time",
      key: "endDate",
      align: "center",
      render: ({ endDate }) => {
        return <span>{dayjs(endDate).format("HH:mm")}</span>;
      },
    },
    {
      title: "Create by",
      key: "createBy",
      align: "center",
      render: ({ createBy }) => {
        return (
          <span>
            {createBy?.firstName && createBy?.middleName && createBy?.lastName
              ? `${createBy?.firstName ?? "-"}`
              : "Removed admin"}
          </span>
        );
      },
    },
    {
      title: "Create date",
      key: "createdAt",
      align: "center",
      render: ({ createdAt }) => {
        // return <span>{dayjs(createdAt).format("DD/MM/YYYY")}</span>;
        return <span>{dayjs(createdAt).format("DD/MM/YYYY HH:mm")}</span>;
      },
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Edit",
      key: "edit",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Button
              type="text"
              icon={<InfoIcon />}
              onClick={() => onInfoClick(record)}
            />
            <Button
              type="text"
              icon={<EditIcon />}
              onClick={() => onEdit(record)}
            />
          </>
        );
      },
    },
  ];

  // Actions
  useEffect(() => {
    fetchData();
  }, [startDate, endDate, search, curPage, refresh, perPage]);

  return (
    <>
      <Header title="Project New" />
      <div className="announceTopActionGroup">
        <div className="announceTopActionLeftGroup">
          <DatePicker
            className="announceDatePicker"
            onChange={onDateSelect}
            picker="month"
          />
          <SearchBox
            className="announceSearchBox"
            onSearch={onSearch}
            placeholderText="Search by title"
          />
        </div>
        <MediumActionButton
          message="Add new"
          onClick={onCreate}
          className="createAnnouncementBtn"
        />
      </div>
      <AnnounceTable columns={columns} data={data} />
      <Row
        className="announceBottomActionContainer"
        justify="end"
        align="middle">
        <Pagination
          defaultCurrent={1}
          pageSize={perPage}
          onChange={onPageChange}
          total={announcementMaxLength}
          pageSizeOptions={[10, 20, 40, 80, 100]}
          showSizeChanger={true}
          onShowSizeChange={onShowSizeChange}
        />
      </Row>

      <AnnouncementCreateModal
        isCreateModalOpen={isCreateModalOpen}
        onOk={onCreateOk}
        onCancel={onCreateCancel}
        onRefresh={onRefresh}
      />
      <AnnouncementEditModal
        isEditModalOpen={isEditModalOpen}
        onOk={onEditOk}
        onCancel={onEditCancel}
        data={editData}
        onRefresh={onRefresh}
      />
      <AnnouncementInfo
        isInfoModalOpen={isInfoModalOpen}
        data={editData}
        onCancel={onInfoCancel}
      />
    </>
  );
};

export default projectNew;
