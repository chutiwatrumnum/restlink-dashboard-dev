# Status Management System

ระบบจัดการ Status แบบรวมศูนย์สำหรับ VillageMap ที่ทำให้การเปลี่ยน status มีผลกระทบต่อส่วนที่เกี่ยวข้องทั้งหมดอัตโนมัติ

## 🎯 วัตถุประสงค์

ระบบนี้ถูกสร้างขึ้นเพื่อแก้ปัญหาการจัดการสีและ status ที่กระจัดกระจายในโค้ด โดย:

- **รวมศูนย์การจัดการ Status**: ใช้ตัวแปรเดียวควบคุม status ทั้งหมด
- **Automatic Updates**: เมื่อเปลี่ยน status ส่วนที่เกี่ยวข้องเปลี่ยนตามอัตโนมัติ
- **Type Safety**: ใช้ TypeScript เพื่อความปลอดภัยของ Type
- **Easy Maintenance**: ง่ายต่อการดูแลรักษาและปรับแต่ง

## 📁 ไฟล์ที่เกี่ยวข้อง

```
src/modules/sosWarning/components/vilageMap/
├── StatusManager.ts          # ระบบจัดการ status หลัก
├── StatusExample.tsx         # ตัวอย่างการใช้งาน
├── VillageMapTS.tsx         # Component หลักที่ใช้ status system
└── README_StatusManager.md  # เอกสารนี้
```

## 🔧 โครงสร้าง Status Configuration

### StatusConfig Interface

```typescript
interface StatusConfig {
  color: string;              // สีของ marker (red, yellow, green)
  label: string;              // ชื่อแสดงผล (Emergency, Warning, Normal)
  severity: MarkerSeverity;   // ระดับความร้ายแรง
  bg: string;                 // Tailwind CSS background class
  hover: string;              // Tailwind CSS hover class
  animationType?: AnimationType; // ประเภท animation
  priority: number;           // ลำดับความสำคัญ (1=สูงสุด)
  description?: string;       // คำอธิบายเพิ่มเติม
}
```

### Status Configuration เริ่มต้น

```typescript
const STATUS_CONFIG: StatusConfig[] = [
  {
    color: "red",
    label: "Emergency",
    severity: "emergency",
    bg: "bg-red-500",
    hover: "hover:bg-red-600",
    animationType: "emergency",
    priority: 1,
    description: "สถานการณ์ฉุกเฉิน ต้องดำเนินการทันที"
  },
  {
    color: "yellow",
    label: "Warning",
    severity: "warning",
    bg: "bg-yellow-500",
    hover: "hover:bg-yellow-600",
    animationType: "warning",
    priority: 2,
    description: "สถานการณ์เตือน ต้องติดตามและระวัง"
  },
  {
    color: "green",
    label: "Normal",
    severity: "normal",
    bg: "bg-green-500",
    hover: "hover:bg-green-600",
    animationType: "none",
    priority: 3,
    description: "สถานการณ์ปกติ ไม่มีปัญหา"
  }
];
```

## 🚀 การใช้งาน

### 1. Import StatusManager

```typescript
import StatusManager, { MarkerSeverity, StatusConfig } from './StatusManager';
```

### 2. การดึงข้อมูล Status

```typescript
// ดึง status จากสี
const status = StatusManager.getStatusByColor('red');

// ดึง status จาก severity
const status = StatusManager.getStatusBySeverity('emergency');

// ดึง status ทั้งหมด
const allStatuses = StatusManager.getAllStatuses();

// ดึง status เรียงตาม priority
const statusesByPriority = StatusManager.getStatusesBySeverity();
```

### 3. การตรวจสอบ Status

```typescript
// ตรวจสอบว่าเป็น emergency หรือไม่
const isEmergency = StatusManager.isEmergencyStatus('red'); // true

// ตรวจสอบว่าเป็น warning หรือไม่
const isWarning = StatusManager.isWarningStatus('yellow'); // true

// ตรวจสอบว่าเป็น normal หรือไม่
const isNormal = StatusManager.isNormalStatus('green'); // true
```

### 4. การเปลี่ยน Status ใน Component

```typescript
const updateMarkerStatus = (markerId: number, newStatus: MarkerSeverity) => {
  const statusInfo = StatusManager.getStatusBySeverity(newStatus);
  if (!statusInfo) return;

  setMarkers(prevMarkers =>
    prevMarkers.map(marker => {
      if (marker.id === markerId) {
        return { 
          ...marker, 
          color: statusInfo.color,
          status: newStatus
        };
      }
      return marker;
    })
  );
};
```

### 5. การใช้งานใน Rendering

```typescript
const renderMarker = (marker: Marker) => {
  const currentStatus = StatusManager.getStatusByColor(marker.color);
  
  return (
    <div 
      className={`marker ${currentStatus?.bg}`}
      style={{
        animation: currentStatus?.animationType === 'emergency' ? 'emergency-pulse' : 'none'
      }}
    >
      {marker.name}
    </div>
  );
};
```

## 🔄 ผลกระทบเมื่อเปลี่ยน Status

เมื่อเปลี่ยน status ของ marker ส่วนต่อไปนี้จะเปลี่ยนตามอัตโนมัติ:

### 1. สีของ Marker
- เปลี่ยนจาก configuration ใน `StatusConfig.color`
- อัพเดท CSS classes ใน `StatusConfig.bg`

### 2. Animation Effects
- Emergency: แสดง ripple animation สีแดง
- Warning: แสดง ripple animation สีเหลือง  
- Normal: ไม่มี animation

### 3. Priority และ Sorting
- ใช้ `StatusConfig.priority` ในการเรียงลำดับ
- Emergency (1) > Warning (2) > Normal (3)

### 4. UI Elements
- Alert Status indicators
- Color legends
- Status labels

## ⚙️ การปรับแต่ง Configuration

### เปลี่ยน Label

```typescript
StatusManager.updateStatusConfig('emergency', { 
  label: 'URGENT' 
});
```

### เปลี่ยนสี

```typescript
StatusManager.updateStatusConfig('warning', { 
  color: 'orange',
  bg: 'bg-orange-500',
  hover: 'hover:bg-orange-600'
});
```

### Reset กลับค่าเริ่มต้น

```typescript
StatusManager.resetStatusConfig();
```

## 📋 ตัวอย่างการใช้งานจริง

### 1. VillageMapTS.tsx

```typescript
// ใช้ status configuration แทนการ hardcode สี
const statusConfig: StatusConfig[] = StatusManager.getAllStatuses();

const getMarkerCurrentStatus = (marker: Marker): StatusConfig | undefined => {
  if (marker.status) {
    return StatusManager.getStatusBySeverity(marker.status);
  }
  return StatusManager.getStatusByColor(marker.color);
};

const isEmergencyMarker = (marker: Marker): boolean => {
  const currentStatus = getMarkerCurrentStatus(marker);
  return currentStatus?.severity === 'emergency';
};
```

### 2. การโหลด Data จาก API

```typescript
const processMarkerData = (apiData: any) => {
  const markerStatus = apiData.status || 'normal';
  const statusInfo = StatusManager.getStatusBySeverity(markerStatus);
  const markerColor = statusInfo ? statusInfo.color : 'green';
  
  return {
    id: apiData.id,
    name: apiData.name,
    color: markerColor,
    status: markerStatus,
    // ... other properties
  };
};
```

## 🎨 CSS Animation Classes

ระบบใช้ CSS classes เหล่านี้สำหรับ animation:

```css
.animate-emergency-ripple-1 { /* Emergency animation layer 1 */ }
.animate-emergency-ripple-2 { /* Emergency animation layer 2 */ }
.animate-emergency-ripple-3 { /* Emergency animation layer 3 */ }
.animate-warning-ripple-1   { /* Warning animation layer 1 */ }
.animate-warning-ripple-2   { /* Warning animation layer 2 */ }
```

## 🧪 การทดสอบ

ใช้ `StatusExample.tsx` เพื่อทดสอบระบบ:

```typescript
import StatusExample from './StatusExample';

// ใช้ใน component อื่น
<StatusExample />
```

## 📚 Best Practices

### 1. ใช้ StatusManager แทนการ hardcode

❌ **ไม่ควรทำ:**
```typescript
const isEmergency = marker.color === 'red' || marker.status === 'emergency';
```

✅ **ควรทำ:**
```typescript
const isEmergency = StatusManager.isEmergencyStatus(marker.color);
```

### 2. ใช้ Type Safety

❌ **ไม่ควรทำ:**
```typescript
updateMarkerStatus(1, 'urgent'); // ไม่มี type 'urgent'
```

✅ **ควรทำ:**
```typescript
updateMarkerStatus(1, 'emergency'); // ใช้ MarkerSeverity type
```

### 3. ใช้การ Destructuring

✅ **ควรทำ:**
```typescript
const { color, bg, animationType } = StatusManager.getStatusByColor('red') || {};
```

## 🔧 Troubleshooting

### ปัญหา: Status ไม่เปลี่ยน

**สาเหตุ:** ไม่ได้เรียก `updateMarkerStatus`
**แก้ไข:** ใช้ฟังก์ชัน `updateMarkerStatus` แทนการ set state โดยตรง

### ปัญหา: Animation ไม่แสดง

**สาเหตุ:** ไม่ได้ import CSS animation classes
**แก้ไข:** ตรวจสอบว่า CSS animation classes ถูก include ในไฟล์ CSS

### ปัญหา: TypeScript Error

**สาเหตุ:** ใช้ string แทน MarkerSeverity type
**แก้ไข:** ใช้ type-safe values: 'emergency' | 'warning' | 'normal'

## 🚀 การพัฒนาต่อ

### เพิ่ม Status ใหม่

1. เพิ่มใน `STATUS_CONFIG` array
2. อัพเดท `MarkerSeverity` type  
3. เพิ่ม CSS animation classes (ถ้าต้องการ)
4. ทดสอบใน `StatusExample.tsx`

### ตัวอย่างการเพิ่ม Status ใหม่

```typescript
// เพิ่มใน StatusManager.ts
export type MarkerSeverity = 'emergency' | 'warning' | 'normal' | 'critical';

// เพิ่มใน STATUS_CONFIG
{
  color: "purple",
  label: "Critical",
  severity: "critical",
  bg: "bg-purple-500",
  hover: "hover:bg-purple-600", 
  animationType: "emergency",
  priority: 0, // สูงกว่า emergency
  description: "สถานการณ์วิกฤติ ต้องดำเนินการทันที"
}
```

---

**หมายเหตุ:** ระบบนี้ออกแบบมาให้ใช้งานง่าย ปลอดภัย และขยายได้ หากมีคำถามหรือต้องการพัฒนาเพิ่มเติม สามารถดูตัวอย่างใน `StatusExample.tsx` หรือติดต่อทีมพัฒนา 