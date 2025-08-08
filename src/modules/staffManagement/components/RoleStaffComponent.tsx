import IconLoader from "../../../components/common/IconLoader";

interface RoleStaffProps {
  data: { id: number; name: string; total: number };
}

const RoleStaffComponent = (props: RoleStaffProps) => {
  const { data } = props;
  return (
    <div className="staffRoleCard flex flex-col p-4 gap-4 rounded-2xl">
      <div className="flex flex-row justify-between items-center pl-1">
        <span className="font-semibold text-lg text-[var(--primary-color)]">
          {data.name}
        </span>
        <IconLoader
          iconName="moreOption"
          alt="more option"
          style={{ height: 20 }}
        />
      </div>
      <div className="flex flex-row justify-start items-center gap-2">
        <IconLoader
          iconName="totalStaff"
          alt="more option"
          style={{ height: 20 }}
        />
        <span>{data.total}</span>
      </div>
    </div>
  );
};

export default RoleStaffComponent;
