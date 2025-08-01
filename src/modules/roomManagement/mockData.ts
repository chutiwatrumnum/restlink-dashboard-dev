import {
  BlockDataType,
  FloorBuildingDataType,
} from "../../stores/interfaces/Management";
export const blockData: BlockDataType = {
  blocks: [
    {
      blockId: 0,
      blockName: "Building A",
    },
    {
      blockId: 1,
      blockName: "Building B",
    },
  ],
  projectName: "AiTAN Project 1",
  total: 2,
};

export const floorBuildingData: FloorBuildingDataType[] = [
  {
    floors: Array.from({ length: 15 }, (_, i) => {
      const floorId = i + 1;
      const floorName = floorId === 13 ? "Floor 12A" : `Floor ${floorId}`;
      return { floorId, floorName };
    }),
    total: 15,
  },
  {
    floors: Array.from({ length: 12 }, (_, i) => {
      const floorId = i + 1;
      const floorName = floorId === 13 ? "Floor 12A" : `Floor ${floorId}`;
      return { floorId, floorName };
    }),
    total: 12,
  },
];
