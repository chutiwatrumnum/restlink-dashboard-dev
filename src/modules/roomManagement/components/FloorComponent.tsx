import { Floor } from "../../../stores/interfaces/Management";
import { FloorIcon } from "../../../assets/icons/Icons";

type FloorComponentType = {
  floor: Floor;
  onFloorClick: (floor: Floor) => void;
};

const FloorComponent = (props: FloorComponentType) => {
  const { floor, onFloorClick } = props;
  const { id, floorName } = floor;

  return (
    <div
      key={id}
      className="flex flex-row justify-center items-center w-full px-4 py-8 gap-4 rounded-lg bg-[var(--tertiary-color)] hover:cursor-pointer hover:brightness-90 hover:ease-in-out hover:duration-300"
      onClick={() => {
        onFloorClick(floor);
      }}
    >
      <FloorIcon className="floorIcon" color="var(--secondary-color)" />
      <span className="text-xl font-normal text-[var(--primary-color)]">
        {"Floor " + floorName}
      </span>
    </div>
  );
};

export default FloorComponent;
