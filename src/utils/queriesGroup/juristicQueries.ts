import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  GetInvitationsType,
  JuristicInvitationsPromiseType,
} from "../../stores/interfaces/JuristicManage";

// Services Chat section
const getJuristicRole = async () => {
  let url = `/team-management/invitation/juristic/role`;
  const res = await axios.get(url);
  //   console.log("RES : ", res);

  return res.data.data;
};

const getJuristicInvitations = async ({
  queryKey,
}: QueryFunctionContext<
  [string, boolean, number]
>): Promise<JuristicInvitationsPromiseType> => {
  const [_key, activate, curPage] = queryKey;
  let url = `/team-management/invitation/juristic/list?activate=${activate}&curPage=${curPage}`;
  const res = await axios.get(url);
  // console.log("RES : ", res.data.result);

  return res.data.result;
};

//  Queries Service Chat
export const getJuristicRoleQuery = () => {
  return useQuery({
    queryKey: ["juristicRole"],
    queryFn: getJuristicRole,
  });
};

export const getJuristicInvitationsQuery = (payload: GetInvitationsType) => {
  const { activate, curPage } = payload;
  return useQuery({
    queryKey: ["juristicInvitations", activate, curPage],
    queryFn: getJuristicInvitations,
  });
};
