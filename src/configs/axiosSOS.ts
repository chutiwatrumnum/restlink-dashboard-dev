import axios, { AxiosInstance } from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { store } from "../stores";

// สร้าง axios instance เฉพาะสำหรับ SOS APIs
const axiosSOS: AxiosInstance = axios.create({
  baseURL: 'https://reslink-security-wqi2p.ondigitalocean.app/api/v1.0',
  timeout: 30000, // เพิ่มจาก 10 วินาที เป็น 30 วินาที
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '9c89fc0d-5153-448b-a98a-9434f4ec1114'
  }
});
// ลบ configuration เก่าออก เพราะเราใช้ axios.create() แล้ว



// Request interceptor สำหรับ SOS axios instance
axiosSOS.interceptors.request.use(
  async (request) => {
    const access_token = await encryptStorage.getItem("access_token");
    const projectID = await encryptStorage.getItem("projectId");
    
    if (access_token !== undefined) {
      request.headers.Authorization = `Bearer ${access_token}`;
    }
    if (projectID) {
      request.headers["x-api-key"] = projectID;
    }
    return request;
  },
  (error) => {
    console.log('❌ SOS API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor สำหรับ SOS axios instance
axiosSOS.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ตรวจสอบถ้าเป็น error 401 (Unauthorized) และยังไม่ได้ retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // ตรวจสอบว่าอยู่ในหน้า login อยู่แล้วหรือไม่
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
        originalRequest._retry = true; // ป้องกัน infinite loop
        
        try {
          // ลองทำ refresh token แบบเดียวกับ AuthorizedLayout
          const resReToken = await store.dispatch.userAuth.refreshTokenNew();
          
          if (resReToken) {
            // ถ้า refresh สำเร็จ ให้ retry request เดิมด้วย token ใหม่
            const newAccessToken = await encryptStorage.getItem("access_token");
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosSOS(originalRequest);
            }
          } else {
            // ถ้า refresh ไม่สำเร็จ ให้ logout
            await store.dispatch.userAuth.onLogout();
            setTimeout(() => {
              window.location.href = '/auth';
            }, 100);
          }
          
        } catch (refreshError) {
          // ถ้า refresh token ล้มเหลว ให้ logout
          await store.dispatch.userAuth.onLogout();
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
      }
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosSOS;
