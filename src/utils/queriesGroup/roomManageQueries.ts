import {
  useQuery,
  QueryFunctionContext,
  UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import {
  BlockDataType,
  FloorType,
  MemberType,
  UnitType,
} from "../../stores/interfaces/Management";

// Block
const getBlockList = async (): Promise<BlockDataType[]> => {
  const res = await axios.get("/room-management/block");
  return res.data.result;
};

// Floor (requires curPage, perPage, blockId)
const getFloorList = async ({
  queryKey,
}: QueryFunctionContext<
  [string, number, number, number]
>): Promise<FloorType> => {
  const [_key, curPage, perPage, blockId] = queryKey;
  const res = await axios.get(`/room-management/floor`, {
    params: { curPage, perPage, blockId },
  });
  return res.data.result;
};

// Unit (requires curPage, perPage, floorId)
const getUnitList = async ({
  queryKey,
}: QueryFunctionContext<[string, number, number, number]>): Promise<
  UnitType[]
> => {
  const [_key, curPage, perPage, floorId] = queryKey;
  const res = await axios.get(`/room-management/unit`, {
    params: { curPage, perPage, floorId },
  });
  return res.data.result;
};

// Member (requires unitId)
const getMemberList = async ({
  queryKey,
}: QueryFunctionContext<[string, number]>): Promise<MemberType[]> => {
  const [_key, unitId] = queryKey;
  const res = await axios.get(`/room-management/member`, {
    params: { unitId },
  });
  // console.log("MEMBER : ", res);

  return res.data;
};

// Queries
export const getBlockListQuery = (): UseQueryResult<BlockDataType> => {
  return useQuery({
    queryKey: ["blockList"],
    queryFn: getBlockList,
  });
};

export const getFloorListQuery = (payload: {
  curPage: number;
  perPage: number;
  blockId: number;
  shouldFetch: boolean;
}): UseQueryResult<FloorType> => {
  const { curPage, perPage, blockId, shouldFetch } = payload;
  return useQuery({
    queryKey: ["floorList", curPage, perPage, blockId],
    queryFn: getFloorList,
    enabled: shouldFetch,
  });
};

export const getUnitListQuery = (payload: {
  curPage: number;
  perPage: number;
  floorId: number;
  shouldFetch: boolean;
}): UseQueryResult<UnitType> => {
  const { curPage, perPage, floorId, shouldFetch } = payload;
  return useQuery({
    queryKey: ["unitList", curPage, perPage, floorId],
    queryFn: getUnitList,
    enabled: shouldFetch,
  });
};

export const getMemberListQuery = (payload: {
  unitId: number;
  shouldFetch: boolean;
}): UseQueryResult<MemberType[]> => {
  const { unitId, shouldFetch } = payload;
  return useQuery({
    queryKey: ["memberList", unitId],
    queryFn: getMemberList,
    enabled: shouldFetch,
  });
};
