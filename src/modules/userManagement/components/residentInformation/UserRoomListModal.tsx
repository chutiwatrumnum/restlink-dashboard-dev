import { Modal, Card } from "antd";

import {
  ResidentInformationDataType,
  UserRoomListType,
} from "../../../../stores/interfaces/ResidentInformation";

import { roomListMockData } from "../../mockData";

interface UserRoomListModalType {
  isUserRoomListModalOpen: boolean;
  onCancel: () => void;
  data?: ResidentInformationDataType;
}

const UserRoomListModal = (props: UserRoomListModalType) => {
  // variables
  const { isUserRoomListModalOpen, data, onCancel } = props;
  const roomListData: UserRoomListType[] = roomListMockData;

  // Functions
  const handleClose = () => {
    if (onCancel) onCancel();
  };

  return (
    <Modal
      open={isUserRoomListModalOpen}
      onCancel={handleClose}
      width={"90%"}
      style={{ maxWidth: 480 }}
      footer={null}
      title="Room list"
      closable
    >
      <div className="flex flex-col w-full h-[60vh] overflow-y-scroll">
        <div className="flex my-2">
          <p className="font-medium">
            {data
              ? `${data?.givenName} ${data.middleName ?? ""} ${data.familyName}`
              : "Something went wrong!"}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center w-full gap-4">
          {roomListData.map((item, index) => {
            return (
              <Card
                className="w-full"
                style={{ backgroundColor: "var(--BG-Table-color)" }}
              >
                <div className="flex flex-col w-full justify-center items-start gap-2">
                  <span>Unit no. : {item?.unit?.unitNo}</span>
                  <span>Room address : {item?.unit?.roomAddress}</span>
                  <span>Floor : {item?.unit?.floor}</span>
                  <span>Role : {item?.role?.name}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default UserRoomListModal;
