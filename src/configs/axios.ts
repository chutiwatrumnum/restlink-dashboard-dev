import axios from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { API_URL } from "./configs";
import { store } from "../stores";
import { clearIntendedDestination } from "../utils/googleAuth";

axios.defaults.baseURL = API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use(
  async (request) => {
    const access_token = await encryptStorage.getItem("access_token");
    const projectID = await encryptStorage.getItem("projectId");

    // Set Authorization header if token exists
    if (access_token && access_token !== "undefined" && access_token !== null) {
      request.headers.Authorization = `Bearer ${access_token}`;
    }

    // Set x-api-key header if projectID exists
    if (projectID && projectID !== "undefined" && projectID !== null) {
      request.headers["x-api-key"] = projectID;
    } else {
      // Fallback to default x-api-key for login requests
      request.headers["x-api-key"] = "9c89fc0d-5153-448b-a98a-9434f4ec1114";
    }
    return request;
  },
  (error) => {
    console.log("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ตรวจสอบถ้าเป็น error 401 (Unauthorized) และยังไม่ได้ retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // ข้าม refresh token API เพื่อป้องกัน infinite loop
      if (originalRequest.url && originalRequest.url.includes('/refresh-token')) {
        return Promise.reject(error);
      }
      
      // ตรวจสอบว่าอยู่ในหน้า login อยู่แล้วหรือไม่
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
        originalRequest._retry = true; // ป้องกัน infinite loop
        
        console.log("❌ 401 Unauthorized detected, redirecting to login immediately");
        
        // ไม่ต้องพยายาม refresh token แล้ว ให้ logout และไปหน้า login ทันที
        try {
          // ลองทำ refresh token แบบเดียวกับ AuthorizedLayout
          const resReToken = await store.dispatch.userAuth.refreshTokenNew();
          
          if (resReToken) {
            // ถ้า refresh สำเร็จ ให้ retry request เดิมด้วย token ใหม่
            const newAccessToken = await encryptStorage.getItem("access_token");
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            }
          } else {
            // ถ้า refresh ไม่สำเร็จ ให้ logout
            await store.dispatch.userAuth.onLogout();
            clearIntendedDestination(); // ทำความสะอาด intended destination
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/auth';
            }, 100);
          }
          
        } catch (refreshError) {
          // ถ้า refresh token ล้มเหลว ให้ logout
          localStorage.clear();
          await store.dispatch.userAuth.onLogout();
        } 
        
        // เคลียร์ storage
        clearIntendedDestination();
        localStorage.clear();
        
        // Redirect ไปหน้า auth ทันที
        window.location.href = '/auth';
        
        return Promise.reject(error);
      }
    }
    
    return error.response;
  }
);

export default axios;