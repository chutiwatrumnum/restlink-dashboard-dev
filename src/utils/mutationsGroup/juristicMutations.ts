import { useMutation } from "@tanstack/react-query";
import { JuristicAddNew } from "../../stores/interfaces/JuristicManage";
import axios from "axios";

export const postCreateJuristicMutation = () => {
  return useMutation({
    retry: 2,
    scope: {
      id: "createJuristic",
    },
    mutationFn: (payload: JuristicAddNew) => {
      // แปลงข้อมูลให้ตรงกับ API format ใหม่
      const apiPayload = {
        roleId: payload.roleId,
        firstName: payload.firstName,
        middleName: payload.middleName || "",
        lastName: payload.lastName,
        contact: payload.contact,
        email: payload.email,
        ...(payload.image && { image: payload.image }) // เพิ่ม image ถ้ามี
      };

      console.log("API Payload:", apiPayload);
      // เปลี่ยน endpoint เป็น /team-management/add
      return axios.post(`/team-management/add`, apiPayload);
    },
    onError: (error: any) => {
      console.error("Create juristic error:", error);
      // แสดง error message ถ้ามี
      if (error.response?.data?.message) {
        console.error("API Error:", error.response.data.message);
      }
    },
    onSuccess: (data) => {
      console.log("Create juristic success:", data);
    },
  });
};