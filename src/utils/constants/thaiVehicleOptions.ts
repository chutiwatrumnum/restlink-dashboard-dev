// ไฟล์: src/utils/constants/thaiVehicleOptions.ts

export const VEHICLE_COLOR_OPTIONS = [
    { label: "ขาว", value: "white" },
    { label: "ดำ", value: "black" },
    { label: "เงิน", value: "silver" },
    { label: "เทา", value: "gray" },
    { label: "แดง", value: "red" },
    { label: "น้ำเงิน", value: "blue" },
    { label: "เขียว", value: "green" },
    { label: "เหลือง", value: "yellow" },
    { label: "ส้ม", value: "orange" },
    { label: "ม่วง", value: "purple" },
    { label: "น้ำตาล", value: "brown" },
    { label: "ทอง", value: "gold" },
    { label: "อื่นๆ", value: "other" },
] as const;

export const VEHICLE_BRAND_OPTIONS = [
    // รถยนต์ญี่ปุ่น
    { label: "Honda", value: "honda" },
    { label: "Toyota", value: "toyota" },
    { label: "Nissan", value: "nissan" },
    { label: "Mazda", value: "mazda" },
    { label: "Mitsubishi", value: "mitsubishi" },
    { label: "Subaru", value: "subaru" },
    { label: "Suzuki", value: "suzuki" },
    { label: "Isuzu", value: "isuzu" },
    { label: "Lexus", value: "lexus" },
    { label: "Infiniti", value: "infiniti" },

    // รถยนต์เกาหลี
    { label: "Hyundai", value: "hyundai" },
    { label: "KIA", value: "kia" },
    { label: "Genesis", value: "genesis" },

    // รถยนต์ยุโรป
    { label: "Mercedes-Benz", value: "mercedes" },
    { label: "BMW", value: "bmw" },
    { label: "Audi", value: "audi" },
    { label: "Volkswagen", value: "volkswagen" },
    { label: "Porsche", value: "porsche" },
    { label: "Volvo", value: "volvo" },
    { label: "Peugeot", value: "peugeot" },
    { label: "Renault", value: "renault" },
    { label: "Citroen", value: "citroen" },
    { label: "Skoda", value: "skoda" },
    { label: "SEAT", value: "seat" },
    { label: "Mini", value: "mini" },
    { label: "Jaguar", value: "jaguar" },
    { label: "Land Rover", value: "landrover" },

    // รถยนต์อเมริกัน
    { label: "Ford", value: "ford" },
    { label: "Chevrolet", value: "chevrolet" },
    { label: "Chrysler", value: "chrysler" },
    { label: "Jeep", value: "jeep" },
    { label: "Dodge", value: "dodge" },
    { label: "Cadillac", value: "cadillac" },
    { label: "Lincoln", value: "lincoln" },
    { label: "Tesla", value: "tesla" },

    // รถยนต์จีน
    { label: "BYD", value: "byd" },
    { label: "MG", value: "mg" },
    { label: "Great Wall", value: "greatwall" },
    { label: "Chery", value: "chery" },
    { label: "Geely", value: "geely" },
    { label: "Haval", value: "haval" },
    { label: "GAC", value: "gac" },
    { label: "NIO", value: "nio" },
    { label: "Xpeng", value: "xpeng" },

    // รถยนต์อินเดีย
    { label: "Tata", value: "tata" },
    { label: "Mahindra", value: "mahindra" },

    // รถจักรยานยนต์
    { label: "Yamaha", value: "yamaha" },
    { label: "Honda (Motorcycle)", value: "honda_motorcycle" },
    { label: "Kawasaki", value: "kawasaki" },
    { label: "Suzuki (Motorcycle)", value: "suzuki_motorcycle" },
    { label: "Ducati", value: "ducati" },
    { label: "Harley-Davidson", value: "harley" },
    { label: "BMW (Motorcycle)", value: "bmw_motorcycle" },
    { label: "KTM", value: "ktm" },
    { label: "Triumph", value: "triumph" },
    { label: "Aprilia", value: "aprilia" },
    { label: "Benelli", value: "benelli" },
    { label: "Royal Enfield", value: "royalenfield" },
    { label: "GPX", value: "gpx" },
    { label: "Zontes", value: "zontes" },

    // อื่นๆ
    { label: "อื่นๆ", value: "other" },
] as const;

export type VehicleColorOption = typeof VEHICLE_COLOR_OPTIONS[number]['value'];
export type VehicleBrandOption = typeof VEHICLE_BRAND_OPTIONS[number]['value'];

// Helper functions
export const getVehicleColorLabel = (value: string): string => {
    const option = VEHICLE_COLOR_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
};

export const getVehicleBrandLabel = (value: string): string => {
    const option = VEHICLE_BRAND_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
};

export const getVehicleColorOptions = () => {
    return VEHICLE_COLOR_OPTIONS.map(option => ({
        label: option.label,
        value: option.value,
    }));
};

export const getVehicleBrandOptions = () => {
    return VEHICLE_BRAND_OPTIONS.map(option => ({
        label: option.label,
        value: option.value,
    }));
};

// Search functions
export const searchVehicleBrands = (searchTerm: string) => {
    if (!searchTerm) return getVehicleBrandOptions();

    const term = searchTerm.toLowerCase();
    return VEHICLE_BRAND_OPTIONS
        .filter(brand =>
            brand.label.toLowerCase().includes(term) ||
            brand.value.toLowerCase().includes(term)
        )
        .map(option => ({
            label: option.label,
            value: option.value,
        }));
};

export const searchVehicleColors = (searchTerm: string) => {
    if (!searchTerm) return getVehicleColorOptions();

    const term = searchTerm.toLowerCase();
    return VEHICLE_COLOR_OPTIONS
        .filter(color =>
            color.label.toLowerCase().includes(term) ||
            color.value.toLowerCase().includes(term)
        )
        .map(option => ({
            label: option.label,
            value: option.value,
        }));
};

// Group brands by region for better UX
export const getVehicleBrandsByRegion = () => {
    return {
        japanese: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['honda', 'toyota', 'nissan', 'mazda', 'mitsubishi', 'subaru', 'suzuki', 'isuzu', 'lexus', 'infiniti'].includes(brand.value)
        ),
        korean: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['hyundai', 'kia', 'genesis'].includes(brand.value)
        ),
        european: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['mercedes', 'bmw', 'audi', 'volkswagen', 'porsche', 'volvo', 'peugeot', 'renault', 'citroen', 'skoda', 'seat', 'mini', 'jaguar', 'landrover'].includes(brand.value)
        ),
        american: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['ford', 'chevrolet', 'chrysler', 'jeep', 'dodge', 'cadillac', 'lincoln', 'tesla'].includes(brand.value)
        ),
        chinese: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['byd', 'mg', 'greatwall', 'chery', 'geely', 'haval', 'gac', 'nio', 'xpeng'].includes(brand.value)
        ),
        motorcycles: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['yamaha', 'honda_motorcycle', 'kawasaki', 'suzuki_motorcycle', 'ducati', 'harley', 'bmw_motorcycle', 'ktm', 'triumph', 'aprilia', 'benelli', 'royalenfield', 'gpx', 'zontes'].includes(brand.value)
        ),
        others: VEHICLE_BRAND_OPTIONS.filter(brand =>
            ['tata', 'mahindra', 'other'].includes(brand.value)
        ),
    };
};

// Color mapping for UI display
export const getColorDisplayInfo = (colorValue: string): { bg: string; text: string; label: string } => {
    const colorMap: Record<string, { bg: string; text: string; label: string }> = {
        white: { bg: '#ffffff', text: '#000000', label: 'ขาว' },
        black: { bg: '#000000', text: '#ffffff', label: 'ดำ' },
        silver: { bg: '#c0c0c0', text: '#000000', label: 'เงิน' },
        gray: { bg: '#808080', text: '#ffffff', label: 'เทา' },
        red: { bg: '#ff0000', text: '#ffffff', label: 'แดง' },
        blue: { bg: '#0000ff', text: '#ffffff', label: 'น้ำเงิน' },
        green: { bg: '#008000', text: '#ffffff', label: 'เขียว' },
        yellow: { bg: '#ffff00', text: '#000000', label: 'เหลือง' },
        orange: { bg: '#ffa500', text: '#000000', label: 'ส้ม' },
        purple: { bg: '#800080', text: '#ffffff', label: 'ม่วง' },
        brown: { bg: '#a52a2a', text: '#ffffff', label: 'น้ำตาล' },
        gold: { bg: '#ffd700', text: '#000000', label: 'ทอง' },
        other: { bg: '#f0f0f0', text: '#000000', label: 'อื่นๆ' },
    };

    return colorMap[colorValue] || colorMap.other;
};

// Statistics helpers
export const getVehicleBrandStats = (vehicles: any[]) => {
    const brandStats: Record<string, number> = {};

    vehicles.forEach((vehicle) => {
        const brand = vehicle.vehicle_brand || 'other';
        brandStats[brand] = (brandStats[brand] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(brandStats)
        .map(([brand, count]) => ({
            brand,
            brandLabel: getVehicleBrandLabel(brand),
            count
        }))
        .sort((a, b) => b.count - a.count);
};

export const getVehicleColorStats = (vehicles: any[]) => {
    const colorStats: Record<string, number> = {};

    vehicles.forEach((vehicle) => {
        const color = vehicle.vehicle_color || 'other';
        colorStats[color] = (colorStats[color] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(colorStats)
        .map(([color, count]) => ({
            color,
            colorLabel: getVehicleColorLabel(color),
            count,
            displayInfo: getColorDisplayInfo(color)
        }))
        .sort((a, b) => b.count - a.count);
};

// Export updated interface for Vehicle Record
export interface UpdatedVehicleRecord {
    id: string;
    license_plate: string;
    area_code: string;
    vehicle_color?: string;
    vehicle_brand?: string; // เพิ่มใหม่
    vehicle_type?: string;
    authorized_area: string[];
    house_id: string;
    invitation_id: string;
    issuer: string;
    tier: string;
    start_time: string;
    expire_time: string;
    note: string;
    stamped_time: string;
    stamper: string;
    created: string;
    updated: string;
}