import { Button, Empty, Tag } from "antd";
// import { ChatListDataType } from "../../../stores/interfaces/Chat";
import { ServiceChatListDataType } from "../../../utils/interfaces/serviceInterface";
import {
  useServiceCenterByServiceIDQuery,
  useServiceCenterStatusTypeQuery,
} from "../hooks";
import { useEffect, useState } from "react";
import ServiceCenterEditModal from "./ServiceCenterEditModal";
import {
  ServiceCenterDataType,
  ServiceCenterSelectListType,
} from "../../../stores/interfaces/ServiceCenter";
const tagColorSelector = (status: string) => {
  switch (status) {
    case "Pending":
      return "red";
    case "Repairing":
      return "orange";
    case "Success":
      return "green";
    default:
      return "black";
  }
};

const serviceCenterChatManage = ({
  chatData,
}: {
  chatData?: ServiceChatListDataType;
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<ServiceCenterDataType | null>(null);
  const [
    ServiceCenterStatusSelectionList,
    setServiceCenterStatusSelectionList,
  ] = useState<ServiceCenterSelectListType[]>([]);
  const [refresh, setRefresh] = useState(false);

  const { data: selectList } = useServiceCenterStatusTypeQuery();
  const {
    data,
    isLoading,
    refetch: refetchServiceCenter,
  } = useServiceCenterByServiceIDQuery(chatData?.serviceId!);
  const onEditCancel = () => {
    setIsEditModalOpen(false);
    setEditData(null);
    refetchServiceCenter();
  };
  const onEditOk = () => {
    setIsEditModalOpen(false);
  };
  const onRefresh: VoidFunction = () => {
    setRefresh(!refresh);
  };
  const onEdit = () => {
    switch (data.statusName) {
      case "Pending":
        const dataRepair = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Pending"
        );
        data.statusId = Number(dataRepair?.value);
        const result = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Success"
        );

        setServiceCenterStatusSelectionList(result ? result : []);
        break;
      case "Repairing":
        const dataSuccess = selectList?.data.find(
          (item: ServiceCenterSelectListType) => item.label === "Repairing"
        );
        data.statusId = Number(dataSuccess?.value);
        const resultRepairing = selectList?.data.filter(
          (item: ServiceCenterSelectListType) => item.label !== "Pending"
        );
        setServiceCenterStatusSelectionList(
          resultRepairing ? resultRepairing : []
        );
        break;
      default:
        break;
    }
    setEditData(data);
    setIsEditModalOpen(true);
  };
  if (data) {
    return (
      <>
        <div className="sidebarContainer">
          <h2 className="headerDetail">Details</h2>
          <div className="detailContainer">
            <div className="detailItem">
              <h2 className="headerDetail">Problem: {data?.serviceTypeName}</h2>
              <p>Detail: {data?.description}</p>
              <p>
                Status:{" "}
                <Tag color={tagColorSelector(data?.statusName!)}>
                  {data?.statusName}
                </Tag>
              </p>
            </div>
          </div>
          <Button
            disabled={data.statusName === "Success" ? true : false}
            onClick={() => onEdit()}
            size="large"
            shape="round"
          >
            <b>Manage</b>
          </Button>
        </div>
        <ServiceCenterEditModal
          selectList={
            ServiceCenterStatusSelectionList
              ? ServiceCenterStatusSelectionList
              : []
          }
          isEditModalOpen={isEditModalOpen}
          onOk={onEditOk}
          onCancel={onEditCancel}
          data={editData}
          onRefresh={onRefresh}
        />
      </>
    );
  } else {
    <Empty />;
  }
  if (isLoading) {
    <p>loading.....</p>;
  }
};
export default serviceCenterChatManage;
