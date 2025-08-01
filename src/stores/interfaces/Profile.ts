// ใน stores/interfaces/Profile.ts
export interface ProfileDetail {
    userId: string;
    lastName: string;
    firstName: string;
    nickName: string;
    email: string;
    imageProfile: string | null;
    contact: string;
    allowNotifications: boolean;
    callAllowNotification: boolean;
    roleName: string;
    roleCode: string;
    projectName: string;
}

// ปรับ interface สำหรับการแก้ไขข้อมูลให้ตรงกับการใช้งานใหม่
export interface editProfileDetail {
    // เพิ่มหรือปรับฟิลด์ตามที่ต้องการให้แก้ไขได้
    firstName?: string;
    lastName?: string;
    nickName?: string;
    contact?: string;
    allowNotifications?: boolean;
    callAllowNotification?: boolean;
    imageProfile?: string;
    // ฟีลด์อื่นๆ ที่อนุญาตให้แก้ไข
}