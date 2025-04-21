import { useState, useEffect } from "react";
import { Button, Row, Pagination } from "antd";
import Header from "../../../components/templates/Header";
import SearchBox from "../../../components/common/SearchBox";
import MediumActionButton from "../../../components/common/MediumActionButton";
import AnnounceTable from "../components/EmergencyTable";
import EmergencyCreateModal from "../components/EmergencyCreateModal";
import EmergencyEditModal from "../components/EmergencyEditModal";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";
import ConfirmModal from "../../../components/common/ConfirmModal";

import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import { DataEmergencyTableDataType, EmergencyPayloadType } from "../../../stores/interfaces/Emergency";
import type { RangePickerProps } from "antd/es/date-picker";

import "../styles/announcement.css";

const Emergency = () => {
    // variables
    const dispatch = useDispatch<Dispatch>();
    const { tableData, EmergencyMaxLength } = useSelector((state: RootState) => state.emergency);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [editData, setEditData] = useState<DataEmergencyTableDataType | null>(null);
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

    const onEdit = (record: DataEmergencyTableDataType) => {
        const editData: DataEmergencyTableDataType = {
            ...record,
        };
        setEditData(editData);
        setIsEditModalOpen(true);
    };

    const onEditOk = () => {
        setIsEditModalOpen(false);
    };

    const onEditCancel = () => {
        setIsEditModalOpen(false);
        setEditData(null);
    };

    const onInfoClick = (record: DataEmergencyTableDataType) => {
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
        const payload: EmergencyPayloadType = {
            search: search,
            curPage: curPage,
            perPage: perPage,
        };
        await dispatch.emergency.getTableData(payload);
    };

    const onRefresh: VoidFunction = () => {
        setRefresh(!refresh);
    };

    const showDeleteConfirm = (value: DataEmergencyTableDataType) => {
        ConfirmModal({
            title: "Are you sure you want to delete this?",
            okMessage: "Yes",
            cancelMessage: "Cancel",
            onOk: async () => {
                await dispatch.emergency.deleteTableData(value.id);
                onRefresh();
            },
            onCancel: () => console.log("Cancel"),
        });
    };

    const onShowSizeChange: PaginationProps["onShowSizeChange"] = (current, pageSize) => {
        // console.log(current, pageSize);
        setPerPage(pageSize);
    };

    const columns: ColumnsType<DataEmergencyTableDataType> = [
        {
            title: "Delete",
            key: "delete",
            align: "center",
            render: (_, record) => {
                return (
                    <>
                        <Button onClick={() => showDeleteConfirm(record)} type="text" icon={<TrashIcon />} />
                    </>
                );
            },
        },
        {
            title: "No.",
            dataIndex: "id",
            key: "id",
            align: "center",
        },
        {
            title: "Picture",
            key: "image",
            align: "center",
            render: ({ image }) => <img src={image} height={100} />,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: "Tel",
            dataIndex: "tel",
            key: "tel",
            align: "center",
        },
        {
            title: "Edit",
            key: "edit",
            align: "center",
            render: (_, record) => {
                return (
                    <>
                        <Button type="text" icon={<EditIcon />} onClick={() => onEdit(record)} />
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
            <Header title="Emergency call" />
            <div className="announceTopActionGroup">
                <div className="announceTopActionLeftGroup">
                    <SearchBox className="announceSearchBox" onSearch={onSearch} placeholderText="Search by Name" />
                </div>
                <MediumActionButton message="Add Emergency call" onClick={onCreate} className="createAnnouncementBtn" />
            </div>
            <AnnounceTable columns={columns} data={tableData} />
            <Row className="announceBottomActionContainer" justify="end" align="middle">
                <Pagination defaultCurrent={1} pageSize={perPage} onChange={onPageChange} total={EmergencyMaxLength} pageSizeOptions={[10, 20, 40, 80, 100]} showSizeChanger={true} onShowSizeChange={onShowSizeChange} />
            </Row>

            <EmergencyCreateModal isCreateModalOpen={isCreateModalOpen} onOk={onCreateOk} onCancel={onCreateCancel} onRefresh={onRefresh} />
            <EmergencyEditModal isEditModalOpen={isEditModalOpen} onOk={onEditOk} onCancel={onEditCancel} data={editData} onRefresh={onRefresh} />
        </>
    );
};

export default Emergency;
