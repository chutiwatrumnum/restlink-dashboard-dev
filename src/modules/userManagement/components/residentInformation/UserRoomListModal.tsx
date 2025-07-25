import { Modal, Card } from "antd";

import { ResidentInformationDataType } from "../../../../stores/interfaces/ResidentInformation";

import { roomListMockData } from "../../mockData";
import { getResidentRoomListQuery } from "../../../../utils/queriesGroup/residentQueries";

interface UserRoomListModalType {
  isUserRoomListModalOpen: boolean;
  onCancel: () => void;
  data?: ResidentInformationDataType;
}

const UserRoomListModal = (props: UserRoomListModalType) => {
  // variables
  const { isUserRoomListModalOpen, data, onCancel } = props;
  // console.log(data);

  // Data
  const { data: roomListData } = getResidentRoomListQuery({
    userId: data?.userId ?? "123",
  });

  // Functions
  const handleClose = () => {
    if (onCancel) onCancel();
  };

  // console.log("ROOM LIST DATA : ", data);

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
          {roomListData?.map((item, index) => {
            return (
              <Card
                className="w-full"
                style={{ backgroundColor: "var(--bg-table-color)" }}
              >
                <div className="flex flex-col w-full justify-center items-start gap-2">
                  <span>Unit no. : {item?.unitNo}</span>
                  <span>Room address : {item?.roomAddress}</span>
                  <span>Floor : {item?.floor}</span>
                  <span>Role : {item?.roleName}</span>
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
