// Components
import { Unit } from "../../../stores/interfaces/Management";
import { Pagination, Button } from "antd";
// Icons
import IconLoader from "../../../components/common/IconLoader";
import { EditOutlined } from "@ant-design/icons";

type UnitComponentType = {
  unit: Unit;
  onEditClick: () => void;
  onAddMemberClick: () => void;
};

const UnitComponent = (props: UnitComponentType) => {
  const { unit, onEditClick, onAddMemberClick } = props;
  const { id, roomAddress, unitNo, family, unitOwner } = unit;

  return (
    <div
      key={id}
      className="unitCard flex flex-col gap-4 w-full px-4 py-4 rounded-lg bg-[var(--white-color)] min-h-[220px]"
    >
      {/* Section 1 (Address & Room no.) */}
      <div className="flex flex-row justify-between items-center">
        <span className="text-2xl font-[500] text-[var(--primary-color)]">
          Address : {roomAddress ?? "XXX/XX"}
        </span>
        <Button
          icon={<EditOutlined className="iconButton" />}
          type="text"
          onClick={onEditClick}
        />
      </div>
      <span className="text-lg font-light text-[var(--text-gray)]">
        Unit No. : {unitNo ?? "123(XX)"}
      </span>
      {/* Section 1 (Room info | Add room member) */}
      {unitOwner ? (
        <>
          <div className="flex flex-row gap-4 items-center justify-start">
            <IconLoader
              iconName="homeOwner"
              className="text-[var(--white-color)]"
              style={{ fill: "black", stroke: "black" }}
            />
            <span className="text-lg font-light text-[var(--text-gray)]">
              {`${unitOwner.givenName} ${unitOwner.middleName ?? ""} ${
                unitOwner.familyName
              }`}
            </span>
          </div>
          <div className="flex flex-row gap-4 items-center justify-start">
            <IconLoader
              iconName="family"
              className="text-[var(--primary-color)]"
            />
            <span className="text-lg font-light text-[var(--text-gray)]">
              {family ?? "0"}
            </span>
          </div>
          <div className="flex flex-row gap-4 items-center justify-start">
            <IconLoader
              iconName="contact"
              className="text-[var(--primary-color)]"
            />
            <span className="text-lg font-light text-[var(--text-gray)]">
              {unitOwner.contact ?? "0888888888"}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-center items-start w-full h-full">
          <div
            className="w-fit h-fit hover:cursor-pointer hover:brightness-90 hover:ease-in-out hover:duration-300"
            onClick={onAddMemberClick}
          >
            <IconLoader
              iconName="addNewMember"
              className="w-20 h-20 text-[var(--primary-color)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitComponent;
