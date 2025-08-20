export const THAI_PROVINCES = {
    "th-10": "กรุงเทพมหานคร",
    "th-11": "สมุทรปราการ",
    "th-12": "นนทบุรี",
    "th-13": "ปทุมธานี",
    "th-14": "พระนครศรีอยุธยา",
    "th-15": "อ่างทอง",
    "th-16": "ลพบุรี",
    "th-17": "สิงห์บุรี",
    "th-18": "ชัยนาท",
    "th-19": "สระบุรี",
    "th-20": "นครนายก",
    "th-21": "สระแก้ว",
    "th-22": "ปราจีนบุรี",
    "th-23": "ฉะเชิงเทรา",
    "th-24": "ชลบุรี",
    "th-25": "ระยอง",
    "th-26": "จันทบุรี",
    "th-27": "ตราด",
    "th-30": "นครราชสีมา",
    "th-31": "บุรีรัมย์",
    "th-32": "สุรินทร์",
    "th-33": "ศิวะนครคร",
    "th-34": "อุบลราชธานี",
    "th-35": "ยโสธร",
    "th-36": "ชัยภูมิ",
    "th-37": "อำนาจเจริญ",
    "th-38": "หนองบัวลำภู",
    "th-39": "ขอนแก่น",
    "th-40": "อุดรธานี",
    "th-41": "เลย",
    "th-42": "หนองคาย",
    "th-43": "มหาสารคาม",
    "th-44": "ร้อยเอ็ด",
    "th-45": "กาฬสินธุ์",
    "th-46": "สกลนคร",
    "th-47": "นครพนม",
    "th-48": "มุกดาหาร",
    "th-49": "เชียงใหม่",
    "th-50": "ลำพูน",
    "th-51": "ลำปาง",
    "th-52": "อุตรดิตถ์",
    "th-53": "แพร่",
    "th-54": "น่าน",
    "th-55": "พะเยา",
    "th-56": "เชียงราย",
    "th-57": "แม่ฮ่องสอน",
    "th-58": "นครสวรรค์",
    "th-60": "กำแพงเพชร",
    "th-61": "ตาก",
    "th-62": "สุโขทัย",
    "th-63": "พิษณุโลก",
    "th-64": "พิจิตร",
    "th-65": "เพชรบูรณ์",
    "th-66": "ราชบุรี",
    "th-67": "กาญจนบุรี",
    "th-70": "เพชรบุรี",
    "th-71": "ประจวบคีรีขันธ์",
    "th-72": "นครศรีธรรมราช",
    "th-73": "กระบี่",
    "th-74": "พังงา",
    "th-75": "ภูเก็ต",
    "th-76": "สุราษฎร์ธานี",
    "th-77": "ระนอง",
    "th-80": "ชุมพร",
    "th-81": "สงขลา",
    "th-82": "สตูล",
    "th-83": "ตรัง",
    "th-84": "พัทลุง",
    "th-85": "ปัตตานี",
    "th-86": "ยะลา",
    "th-90": "นราธิวาส",
    "th-91": "บึงกาฬ",
} as const;

export type ProvinceCode = keyof typeof THAI_PROVINCES;

// Helper functions
export const getProvinceName = (code: string): string => {
    return THAI_PROVINCES[code as ProvinceCode] || code;
};

export const getProvinceOptions = () => {
    return Object.entries(THAI_PROVINCES).map(([code, name]) => ({
        label: `${name} (${code})`,
        value: code,
        name: name,
        code: code,
    }));
};

export const searchProvinces = (searchTerm: string) => {
    if (!searchTerm) return getProvinceOptions();

    const term = searchTerm.toLowerCase();
    return getProvinceOptions().filter(
        (province) =>
            province.name.toLowerCase().includes(term) ||
            province.code.toLowerCase().includes(term)
    );
};

// Export functions for vehicle management
export const exportVehicleDataWithProvinces = (vehicles: any[]) => {
    return vehicles.map(vehicle => ({
        ...vehicle,
        province_name: getProvinceName(vehicle.area_code || "th-11"),
        province_code: vehicle.area_code || "th-11"
    }));
};

// Validate province code
export const isValidProvinceCode = (code: string): boolean => {
    return Object.keys(THAI_PROVINCES).includes(code);
};

// Group vehicles by province
export const groupVehiclesByProvince = (vehicles: any[]) => {
    return vehicles.reduce((groups, vehicle) => {
        const provinceName = getProvinceName(vehicle.area_code || "th-11");
        if (!groups[provinceName]) {
            groups[provinceName] = [];
        }
        groups[provinceName].push(vehicle);
        return groups;
    }, {} as Record<string, any[]>);
};