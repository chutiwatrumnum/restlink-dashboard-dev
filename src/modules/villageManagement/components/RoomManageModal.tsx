// Hooks
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

// Components
import { Modal, Tabs, Button } from "antd";
import EmptyCard from "./EmptyCard";
import MemberInfoCard from "./MemberInfoCard";

// Types
import {
  Unit,
  MemberType,
  DeleteMemberPayload,
} from "../../../stores/interfaces/Management";
import type { TabsProps } from "antd";

interface RoomManageModalProps {
  isModalOpen: boolean;
  onCancel: () => void;
  onAdd: (curTabIndex: number) => void;
  onDelete: (payload: DeleteMemberPayload) => void;

  unitData?: Unit;
  memberData?: MemberType[];
}

const RoomManageModal = (props: RoomManageModalProps) => {
  // initials
  const { unitData, memberData, isModalOpen, onCancel, onAdd, onDelete } =
    props;
  const items: TabsProps["items"] = memberData?.map((memberType, index) => ({
    key: index.toString(),
    label: memberType.roleName,
    children: null,
  }));

  // States
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);
  // Functions
  const onModalClose = () => {
    setCurrentMemberIndex(0);
    onCancel();
  };

  const onTabsChange = (key: string) => {
    // console.log(parseInt(key));
    setCurrentMemberIndex(parseInt(key));
  };

  //   Actions
  useEffect(() => {
    return () => {
      setCurrentMemberIndex(0);
    };
  }, [isModalOpen]);

  return (
    <Modal
      open={isModalOpen}
      title="Information"
      onCancel={onModalClose}
      width={"90%"}
      style={{ maxWidth: 640 }}
      footer={null}
      centered
    >
      <div className="flex flex-col justify-center items-start w-full">
        <Tabs
          items={items}
          onChange={onTabsChange}
          defaultActiveKey="0"
          activeKey={currentMemberIndex.toString()}
        />
        <div className="w-full">
          {memberData &&
          unitData?.family &&
          memberData[currentMemberIndex]?.member ? (
            <div className="flex flex-col justify-center items-center w-full">
              {memberData[currentMemberIndex]?.member.map((member, index) => {
                return (
                  <MemberInfoCard
                    key={index}
                    index={index}
                    memberData={member}
                    onDelete={onDelete}
                    unitId={unitData?.id}
                    roleManageCode={
                      memberData[currentMemberIndex]?.roleManageCode
                    }
                  />
                );
              })}
              {memberData[currentMemberIndex]?.roleManageCode !==
                "resident_owner" && unitData?.family < 5 ? (
                <Button
                  onClick={() =>
                    onAdd(memberData[currentMemberIndex]?.roleId ?? -1)
                  }
                  type="primary"
                  size="large"
                  className="w-full"
                  disabled={!access("room_management", "create")}
                >
                  {`+ Add user`}
                </Button>
              ) : null}
            </div>
          ) : (
            <EmptyCard
              onAdd={() =>
                onAdd(memberData?.[currentMemberIndex]?.roleId ?? -1)
              }
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoomManageModal;
