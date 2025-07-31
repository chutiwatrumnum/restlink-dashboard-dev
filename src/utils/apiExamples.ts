// ตัวอย่างการใช้งาน axios instances ต่างๆ
import axios from 'axios';

// Utility function สำหรับ retry logic
export const apiWithRetry = async (
  apiCall: () => Promise<any>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error: any) {
      console.warn(`🔄 API attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // ถ้าเป็น timeout หรือ network error และยังมี retry เหลือ
      if (
        (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error')) 
        && attempt < maxRetries
      ) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // เพิ่ม delay แบบ exponential backoff
        continue;
      }
      
      // ถ้าไม่ใช่ error ที่ retry ได้ หรือ retry หมดแล้ว
      throw error;
    }
  }
};

// ตัวอย่างที่ 1: ใช้ axios หลัก (main) พร้อม retry
export const useMainApi = async () => {
  try {
    const result = await apiWithRetry(async () => {
      const response = await axios.get('/users');
    console.log('📡 Main API response:', response.data);
    return response.data;
    });
    return result;
  } catch (error) {
    console.error('❌ Main API error after retries:', error);
    throw error;
  }
};

// ตัวอย่างที่ 2: ใช้ axios secondary (เปลี่ยน base URL ตาม path)
export const useSecondaryApi = async () => {
  try {
    // ใช้ axios secondary ที่เปลี่ยน base URL อัตโนมัติ
    const response = await axios.get('/projects');
    console.log('📡 Secondary API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Secondary API error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 3: ใช้ location services
export const useLocationApi = async () => {
  try {
    // ใช้ location services สำหรับ API ที่เกี่ยวข้องกับตำแหน่ง
    const response = await axios.get('/locations');
    console.log('📍 Location API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Location API error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 4: ใช้ axios instance แบบ dynamic พร้อม retry
export const useDynamicApi = async (endpoint: string) => {
  try {
    const result = await apiWithRetry(async () => {
      const response = await axios.get(endpoint);
      console.log(`📡 API response:`, response.data);
    return response.data;
    });
    return result;
  } catch (error) {
    console.error(`❌ API error after retries:`, error);
    throw error;
  }
};

// Helper function สำหรับจัดการ timeout แบบ manual
export const withTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number = 30000,
  timeoutMessage: string = 'Request timeout'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    })
  ]);
};

// ตัวอย่างการใช้ manual timeout
export const useApiWithManualTimeout = async () => {
  try {
    const result = await withTimeout(
      axios.get('/slow-endpoint'),
      15000, // 15 วินาที
      'API call took too long'
    );
    return result.data;
  } catch (error) {
    console.error('❌ API timeout or error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 5: การ POST ข้อมูล location
export const postLocationData = async (locationData: any) => {
  try {
    // ใช้ location services helper
    const result = await axios.post('/locations', locationData);
    console.log('✅ Location posted successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error posting location:', error);
    throw error;
  }
};

// ตัวอย่างที่ 6: การใช้งานใน React Component
export const useAxiosInComponent = () => {
  const fetchData = async () => {
    try {
      // เรียกใช้ API ต่างๆ ตามความต้องการ
      
      // สำหรับข้อมูลทั่วไป
      const mainData = await useMainApi();
      
      // สำหรับข้อมูลที่ต้องเปลี่ยน base URL ตาม path
      const secondaryData = await useSecondaryApi();
      
      // สำหรับข้อมูล location เฉพาะ
      if (window.location.pathname.includes('add-location')) {
        const locationData = await useLocationApi();
        console.log('📍 Location data fetched:', locationData);
      }
      
      return { mainData, secondaryData };
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    }
  };

  return { fetchData };
}; 