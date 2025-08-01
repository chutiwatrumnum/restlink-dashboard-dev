// Components
import { Empty, Button } from "antd";

const EmptyCard = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <div className="flex flex-col justify-between items-center w-full gap-4 bg-[var(--tertiary-color)] pt-12 pb-4 px-4 rounded-xl">
      <Empty />
      <Button onClick={onAdd} type="primary" size="large" className="w-[90%]">
        {`+ Add user`}
      </Button>
    </div>
  );
};

export default EmptyCard;
