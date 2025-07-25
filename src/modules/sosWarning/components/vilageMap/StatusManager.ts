// Status Manager - ไฟล์สำหรับจัดการ status configuration แบบรวมศูนย์
// ใช้สำหรับการเปลี่ยน status และทำให้ส่วนอื่นๆ เปลี่ยนตามอัตโนมัติ

export type MarkerSeverity = 'emergency' | 'warning' | 'normal';
export type AnimationType = 'emergency' | 'warning' | 'none';

export interface StatusConfig {
  color: string;
  label: string;
  severity: MarkerSeverity;
  bg: string;
  hover: string;
  animationType?: AnimationType;
  priority: number;
  description?: string;
}

// ตัวแปรหลักสำหรับการจัดการ status ทั้งหมด
export const STATUS_CONFIG: StatusConfig[] = [
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
  },
];

// Helper Functions สำหรับการใช้งาน status
export class StatusManager {
  static getStatusByColor(color: string): StatusConfig | undefined {
    return STATUS_CONFIG.find(status => status.color === color);
  }

  static getStatusBySeverity(severity: MarkerSeverity): StatusConfig | undefined {
    return STATUS_CONFIG.find(status => status.severity === severity);
  }

  static getAllStatuses(): StatusConfig[] {
    return STATUS_CONFIG;
  }

  static getStatusesBySeverity(): StatusConfig[] {
    return STATUS_CONFIG.sort((a, b) => a.priority - b.priority);
  }

  static getColorOptions() {
    return STATUS_CONFIG.map(status => ({
      value: status.color,
      label: status.label,
      bg: status.bg,
      hover: status.hover
    }));
  }

  static isEmergencyStatus(color: string): boolean {
    const status = this.getStatusByColor(color);
    return status?.severity === 'emergency';
  }

  static isWarningStatus(color: string): boolean {
    const status = this.getStatusByColor(color);
    return status?.severity === 'warning';
  }

  static isNormalStatus(color: string): boolean {
    const status = this.getStatusByColor(color);
    return status?.severity === 'normal';
  }

  static getNextStatus(currentSeverity: MarkerSeverity): MarkerSeverity {
    switch (currentSeverity) {
      case 'normal':
        return 'warning';
      case 'warning':
        return 'emergency';
      case 'emergency':
        return 'normal';
      default:
        return 'normal';
    }
  }

  static getStatusAnimation(severity: MarkerSeverity): AnimationType {
    const status = this.getStatusBySeverity(severity);
    return status?.animationType || 'none';
  }

  // ฟังก์ชันสำหรับเปลี่ยน status configuration (สำหรับ admin)
  static updateStatusConfig(severity: MarkerSeverity, updates: Partial<StatusConfig>): StatusConfig | null {
    const statusIndex = STATUS_CONFIG.findIndex(status => status.severity === severity);
    if (statusIndex === -1) return null;

    STATUS_CONFIG[statusIndex] = { ...STATUS_CONFIG[statusIndex], ...updates };
    return STATUS_CONFIG[statusIndex];
  }

  // ฟังก์ชันสำหรับ reset status configuration กลับเป็นค่าเริ่มต้น
  static resetStatusConfig(): void {
    // Reset ค่ากลับเป็นค่าเริ่มต้น
    const defaultConfig: StatusConfig[] = [
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
      },
    ];

    STATUS_CONFIG.splice(0, STATUS_CONFIG.length, ...defaultConfig);
  }
}

// Export เพื่อให้ component อื่นๆ สามารถใช้งานได้
export default StatusManager;

// Type exports
export type { StatusConfig as StatusConfigType }; 