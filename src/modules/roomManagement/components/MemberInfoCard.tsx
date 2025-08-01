// Components
import IconLoader from "../../../components/common/IconLoader";
import { Dropdown } from "antd";
import { TrashIcon } from "../../../assets/icons/Icons";
import { callConfirmModal } from "../../../components/common/Modal";
// Types
import {
  Member,
  DeleteMemberPayload,
} from "../../../stores/interfaces/Management";
import type { MenuProps } from "antd";

interface MemberInfoCardPropsType {
  index: number;
  memberData: Member;
  onDelete: (payload: DeleteMemberPayload) => void;
  unitId: number;
  roleManageCode: string;
}

interface InfoItem {
  label: string;
  value: string | undefined;
}

const MemberInfoCard = (props: MemberInfoCardPropsType) => {
  const { index, memberData, onDelete, unitId, roleManageCode } = props;

  const infoItems: InfoItem[] = [
    { label: "First name", value: memberData?.givenName },
    { label: "Last name", value: memberData?.familyName },
    { label: "Middle name", value: memberData?.middleName },
    { label: "Nickname", value: memberData?.nickName },
    { label: "Email", value: memberData?.email },
    { label: "Telephone", value: memberData?.contact },
  ];

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            const payload: DeleteMemberPayload = {
              unitId: unitId,
              userId: memberData.userId,
            };
            callConfirmModal({
              title:
                roleManageCode == "resident_owner"
                  ? "Remove owner"
                  : "Remove member",
              message: `Are you sure you want to remove this member?`,
              okMessage: "Remove",
              alertMessage:
                roleManageCode == "resident_owner"
                  ? "Removing owners will remove all assigned members."
                  : undefined,
              cancelMessage: "Cancel",
              onOk: () => {
                onDelete(payload);
              },
              onCancel: () => {
                console.log("Cancel");
              },
            });
          }}
          className="flex flex-row justify-center items-center gap-2 w-[120px]"
        >
          <TrashIcon color="var(--danger-color)" />
          <span className="text-[var(--danger-color)]">Remove</span>
        </div>
      ),
      danger: true,
    },
  ];

  return (
    <div
      key={index}
      className="flex flex-col justify-center items-start w-full p-4 rounded-xl mb-4 bg-[var(--tertiary-color)] gap-4"
    >
      {/* Section No. & option */}
      <section className="flex flex-row justify-between items-center w-full">
        <span className="text-lg font-semibold text-[var(--primary-color)]">{`No. : ${
          index + 1
        }`}</span>
        <Dropdown menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <IconLoader
              iconName="moreOption"
              alt="More option"
              style={{ height: 20 }}
            />
          </a>
        </Dropdown>
      </section>
      <section className="grid grid-cols-2 gap-4 w-full">
        {infoItems.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <span className="text-lg font-semibold text-[var(--primary-color)]">
              {item.label}
            </span>
            <span className="text-lg font-light text-[var(--primary-color)]">
              {item.value ?? "-"}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default MemberInfoCard;
