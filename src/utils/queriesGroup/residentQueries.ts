import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  GetInvitationsType,
  ResidentInvitationsPromiseType,
  UserRoomListType,
} from "../../stores/interfaces/ResidentInformation";

// Services Chat section
const getResidentRole = async () => {
  let url = `/users/invitation/resident/role`;
  const res = await axios.get(url);
  //   console.log("RES : ", res);

  return res.data.data;
};

const getResidentUnit = async () => {
  let url = `/users/invitation/resident/unit`;
  const res = await axios.get(url);
  //   console.log("RES : ", res);

  return res.data.data;
};

const getResidentRoomList = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<UserRoomListType[]> => {
  const [_key, userId] = queryKey;
  let url = `/users/room-list?userId=${userId}`;
  const res = await axios.get(url);
  // console.log("RES : ", res);

  return res.data.data;
};

const getResidentInvitations = async ({
  queryKey,
}: QueryFunctionContext<
  [string, boolean, number]
>): Promise<ResidentInvitationsPromiseType> => {
  const [_key, activate, curPage] = queryKey;
  let url = `/users/invitation/resident/list?activate=${activate}&curPage=${curPage}`;
  const res = await axios.get(url);
  // console.log("RES : ", res.data.result);

  return res.data.result;
};

//  Queries Service Chat
export const getResidentRoleQuery = () => {
  return useQuery({
    queryKey: ["residentRole"],
    queryFn: getResidentRole,
  });
};

export const getResidentUnitQuery = () => {
  return useQuery({
    queryKey: ["residentUnit"],
    queryFn: getResidentUnit,
  });
};

export const getResidentInvitationsQuery = (payload: GetInvitationsType) => {
  const { activate, curPage } = payload;
  return useQuery({
    queryKey: ["residentInvitations", activate, curPage],
    queryFn: getResidentInvitations,
  });
};

export const getResidentRoomListQuery = (payload: { userId: string }) => {
  const { userId } = payload;
  return useQuery({
    queryKey: ["residentRoomList", userId],
    queryFn: getResidentRoomList,
  });
};
