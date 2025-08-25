// Components
import { Empty, Button } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

const EmptyCard = ({ onAdd }: { onAdd: () => void }) => {
  // ✅ ดึง permission จาก redux มาใช้
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  return (
    <div className="flex flex-col justify-between items-center w-full gap-4 bg-[var(--tertiary-color)] pt-12 pb-4 px-4 rounded-xl">
      <Empty />
      <Button
        disabled={!access("room_management", "create")}
        onClick={onAdd}
        type="primary"
        size="large"
        className="w-[90%]"
      >
        {`+ Add user`}
      </Button>
    </div>
  );
};

export default EmptyCard;
