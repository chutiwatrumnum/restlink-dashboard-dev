import axios, { AxiosInstance } from "axios";
import { encryptStorage } from "../utils/encryptStorage";

// สร้าง axios instance เฉพาะสำหรับ SOS APIs
const axiosSOS: AxiosInstance = axios.create({
  baseURL: 'https://reslink-security-wqi2p.ondigitalocean.app/api/v1.0',
  timeout: 10000,
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

    console.log('🚨 SOS API request to:', `${request.baseURL || ''}${request.url || ''}`);
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
    console.log('✅ SOS API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ SOS API response error:', error.response?.status, error.response?.data);
    return error.response;
  }
);

export default axiosSOS;
