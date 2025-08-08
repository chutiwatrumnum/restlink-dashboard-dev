import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import {
  GetInvitationsType,
  JuristicInvitationsPromiseType,
} from "../../stores/interfaces/JuristicManage";

// Services Chat section - ใช้ API endpoint ที่ถูกต้อง
const getJuristicRole = async () => {
  try {
    // ใช้ API endpoint ที่ระบุ
    let url = `/team-management/invitation/juristic/role`;
    const res = await axios.get(url);

    console.log("Role API Response:", res.data);

    // ตรวจสอบโครงสร้างข้อมูลและแปลงให้เป็นรูปแบบที่ต้องการ
    let roleData = [];

    if (res.data?.data) {
      roleData = res.data.data;
    } else if (res.data?.result) {
      roleData = res.data.result;
    } else if (Array.isArray(res.data)) {
      roleData = res.data;
    } else {
      console.warn("Unexpected role data structure:", res.data);
      return [];
    }

    // แปลงข้อมูลให้เป็นรูปแบบที่ Select component ต้องการ
    const formattedRoles = roleData.map((role: any) => ({
      id: role.id || role.roleId,
      name: role.name || role.roleName || role.roleCode || role.title,
      value: role.id || role.roleId,
      label: role.name || role.roleName || role.roleCode || role.title,
    }));

    console.log("Formatted Roles:", formattedRoles);
    return formattedRoles;

  } catch (error: any) {
    console.error("Error fetching juristic roles:", error);

    // Log more details about the error
    if (error.response) {
      console.error("Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    // Return empty array on error
    return [];
  }
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
    // เพิ่ม retry และ error handling
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    // เพิ่ม onError callback เพื่อ debug
    onError: (error) => {
      console.error("getJuristicRoleQuery error:", error);
    },
    onSuccess: (data) => {
      console.log("getJuristicRoleQuery success:", data);
    }
  });
};

export const getJuristicInvitationsQuery = (payload: GetInvitationsType) => {
  const { activate, curPage } = payload;
  return useQuery({
    queryKey: ["juristicInvitations", activate, curPage],
    queryFn: getJuristicInvitations,
  });
};