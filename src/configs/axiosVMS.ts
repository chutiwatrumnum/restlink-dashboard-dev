// ไฟล์: src/configs/axiosVMS.ts

import axios, { AxiosInstance } from "axios";
import { encryptStorage } from "../utils/encryptStorage";
import { store } from "../stores";

// สร้าง axios instance เฉพาะสำหรับ VMS APIs
const axiosVMS: AxiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor สำหรับ VMS axios instance
axiosVMS.interceptors.request.use(
    async (request) => {
        const vmsUrl = await encryptStorage.getItem("vmsUrl");
        const vmsToken = await encryptStorage.getItem("vmsToken");

        // ตั้งค่า baseURL แบบ dynamic จาก vmsUrl
        if (vmsUrl) {
            request.baseURL = vmsUrl;
        } else {
            console.warn('⚠️ No VMS URL found in storage');
        }

        // ตั้งค่า Authorization header จาก vmsToken
        if (vmsToken && vmsToken !== "undefined") {
            request.headers.Authorization = `Bearer ${vmsToken}`;
        } else {
            console.warn('⚠️ No VMS Token found in storage');
        }

        console.log('🔄 VMS Request:', {
            url: request.url,
            baseURL: request.baseURL,
            method: request.method,
            hasAuth: !!request.headers.Authorization
        });

        return request;
    },
    (error) => {
        console.log('❌ VMS API request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor สำหรับ VMS axios instance
axiosVMS.interceptors.response.use(
    (response) => {
        console.log('✅ VMS Response:', {
            status: response.status,
            url: response.config.url,
            dataLength: JSON.stringify(response.data).length
        });
        return response;
    },
    async (error) => {
        console.error('❌ VMS API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message
        });

        const originalRequest = error.config;

        // ตรวจสอบถ้าเป็น error 401 (Unauthorized)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            console.log("❌ [VMS] 401 Unauthorized detected");

            // สำหรับ VMS อาจจะไม่มี refresh token logic เหมือน main API
            // ให้ redirect ไปหน้า login
            if (!window.location.pathname.includes('/auth')) {
                console.log("❌ [VMS] VMS Token expired, redirecting to login");

                // เคลียร์ storage และ redirect
                await store.dispatch.userAuth.onLogout();
                window.location.href = '/auth';

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosVMS;