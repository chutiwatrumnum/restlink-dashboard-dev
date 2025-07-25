// ตัวอย่างการใช้งาน axios instances ต่างๆ
import { axiosMain, axiosSecondary, axiosLocation, locationServices, getAxiosInstance } from '../configs';

// ตัวอย่างที่ 1: ใช้ axios หลัก (main)
export const useMainApi = async () => {
  try {
    // ใช้ axios หลักสำหรับ API ทั่วไป
    const response = await axiosMain.get('/users');
    console.log('📡 Main API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Main API error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 2: ใช้ axios secondary (เปลี่ยน base URL ตาม path)
export const useSecondaryApi = async () => {
  try {
    // ใช้ axios secondary ที่เปลี่ยน base URL อัตโนมัติ
    const response = await axiosSecondary.get('/projects');
    console.log('📡 Secondary API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Secondary API error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 3: ใช้ axios location (เฉพาะสำหรับ location services)
export const useLocationApi = async (unitID: number) => {
  try {
    // วิธีที่ 1: ใช้ axios instance โดยตรง
    const response = await axiosLocation.get(`/address/${unitID}`);
    console.log('🗺️ Location API response:', response.data);
    
    // วิธีที่ 2: ใช้ helper functions
    const addressData = await locationServices.getAddress(unitID);
    console.log('🗺️ Address data:', addressData);
    
    return addressData;
  } catch (error) {
    console.error('❌ Location API error:', error);
    throw error;
  }
};

// ตัวอย่างที่ 4: ใช้ getAxiosInstance สำหรับเลือก axios instance แบบ dynamic
export const useDynamicApi = async (apiType: 'main' | 'secondary' | 'location', endpoint: string) => {
  try {
    const axiosInstance = getAxiosInstance(apiType);
    const response = await axiosInstance.get(endpoint);
    console.log(`📡 ${apiType} API response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${apiType} API error:`, error);
    throw error;
  }
};

// ตัวอย่างที่ 5: การ POST ข้อมูล location
export const postLocationData = async (locationData: any) => {
  try {
    // ใช้ location services helper
    const result = await locationServices.postLocation(locationData);
    console.log('✅ Location posted successfully:', result);
    return result;
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
        const locationData = await useLocationApi(123);
        console.log('📍 Location data fetched:', locationData);
      }
      
      return { mainData, secondaryData };
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    }
  };

  return { fetchData };
}; 