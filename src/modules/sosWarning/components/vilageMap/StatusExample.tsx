import React, { useState, useEffect } from 'react';
import StatusManager, { MarkerSeverity, StatusConfig } from './StatusManager';

// ตัวอย่างการใช้งาน StatusManager
const StatusExample: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<MarkerSeverity>('normal');
  const [statusConfig, setStatusConfig] = useState<StatusConfig[]>(StatusManager.getAllStatuses());

  // ฟังก์ชันสำหรับเปลี่ยน status
  const changeStatus = (newStatus: MarkerSeverity) => {
    console.log(`🔄 เปลี่ยน status จาก ${currentStatus} เป็น ${newStatus}`);
    setCurrentStatus(newStatus);
    
    // แสดงการเปลี่ยนแปลงที่เกิดขึ้นในส่วนต่างๆ
    const statusInfo = StatusManager.getStatusBySeverity(newStatus);
    if (statusInfo) {
      console.log('📊 ข้อมูล status ใหม่:', {
        color: statusInfo.color,
        label: statusInfo.label,
        severity: statusInfo.severity,
        animationType: statusInfo.animationType,
        description: statusInfo.description
      });
    }
  };

  // ฟังก์ชันสำหรับสลับ status แบบอัตโนมัติ
  const toggleStatus = () => {
    const nextStatus = StatusManager.getNextStatus(currentStatus);
    changeStatus(nextStatus);
  };

  // ฟังก์ชันสำหรับปรับแต่ง status configuration
  const updateStatusLabel = (severity: MarkerSeverity, newLabel: string) => {
    const updatedStatus = StatusManager.updateStatusConfig(severity, { label: newLabel });
    if (updatedStatus) {
      setStatusConfig([...StatusManager.getAllStatuses()]);
      console.log(`✅ อัปเดต label ของ ${severity} เป็น "${newLabel}"`);
    }
  };

  // ฟังก์ชันสำหรับ reset configuration
  const resetConfig = () => {
    StatusManager.resetStatusConfig();
    setStatusConfig([...StatusManager.getAllStatuses()]);
    console.log('🔄 Reset status configuration กลับเป็นค่าเริ่มต้น');
  };

  // ได้รับ status configuration ปัจจุบัน
  const getCurrentStatusInfo = () => {
    return StatusManager.getStatusBySeverity(currentStatus);
  };

  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Status Management System - ตัวอย่างการใช้งาน
      </h1>

      {/* แสดง status ปัจจุบัน */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Status ปัจจุบัน</h2>
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full ${currentStatusInfo?.bg || 'bg-gray-400'}`}></div>
          <div>
            <div className="font-medium">{currentStatusInfo?.label}</div>
            <div className="text-sm text-gray-600">{currentStatusInfo?.description}</div>
            <div className="text-xs text-gray-500">
              สี: {currentStatusInfo?.color} | Animation: {currentStatusInfo?.animationType}
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มเปลี่ยน status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">เปลี่ยน Status</h2>
        <div className="flex gap-3">
          {statusConfig.map((status) => (
            <button
              key={status.severity}
              onClick={() => changeStatus(status.severity)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                status.severity === currentStatus
                  ? `${status.bg} text-white ring-2 ring-offset-2 ring-gray-400`
                  : `${status.bg} ${status.hover} text-white opacity-70 hover:opacity-100`
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleStatus}
          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          สลับ Status อัตโนมัติ
        </button>
      </div>

      {/* แสดงการเปลี่ยนแปลงที่เกิดขึ้น */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">ผลกระทบที่เกิดขึ้นเมื่อเปลี่ยน Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* แสดงสีที่เปลี่ยน */}
          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">สีของ Marker</h3>
            <div className={`w-12 h-12 rounded-full ${currentStatusInfo?.bg} mx-auto`}></div>
            <p className="text-center text-sm mt-2">{currentStatusInfo?.color}</p>
          </div>

          {/* แสดง animation ที่เปลี่ยน */}
          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">Animation Effect</h3>
            <div className="text-center">
              {currentStatusInfo?.animationType === 'emergency' && (
                <div className={`w-12 h-12 rounded-full ${currentStatusInfo.bg} mx-auto animate-pulse`}>
                  <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                </div>
              )}
              {currentStatusInfo?.animationType === 'warning' && (
                <div className={`w-12 h-12 rounded-full ${currentStatusInfo.bg} mx-auto animate-bounce`}></div>
              )}
              {currentStatusInfo?.animationType === 'none' && (
                <div className={`w-12 h-12 rounded-full ${currentStatusInfo.bg} mx-auto`}></div>
              )}
            </div>
            <p className="text-center text-sm mt-2">{currentStatusInfo?.animationType}</p>
          </div>

          {/* แสดง priority */}
          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">Priority Level</h3>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentStatusInfo?.priority}</div>
              <p className="text-sm">
                {currentStatusInfo?.priority === 1 && 'สูงสุด'}
                {currentStatusInfo?.priority === 2 && 'กลาง'}
                {currentStatusInfo?.priority === 3 && 'ปกติ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ตัวอย่างการปรับแต่ง configuration */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">ปรับแต่ง Status Configuration</h2>
        <div className="space-y-3">
          {statusConfig.map((status) => (
            <div key={status.severity} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`w-6 h-6 rounded-full ${status.bg}`}></div>
              <div className="flex-1">
                <input
                  type="text"
                  value={status.label}
                  onChange={(e) => updateStatusLabel(status.severity, e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                {status.severity} - Priority: {status.priority}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={resetConfig}
          className="mt-3 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Reset Configuration
        </button>
      </div>

      {/* แสดงข้อมูล status ทั้งหมด */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Status Configuration ทั้งหมด</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            {JSON.stringify(statusConfig, null, 2)}
          </pre>
        </div>
      </div>

      {/* คำอธิบายการใช้งาน */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">วิธีการใช้งาน:</h3>
        <ul className="text-sm space-y-1 text-blue-800">
          <li>1. เปลี่ยน status โดยคลิกปุ่มสีต่างๆ เพื่อดูการเปลี่ยนแปลง</li>
          <li>2. ดูผลกระทบที่เกิดขึ้นในส่วนสี, animation, และ priority</li>
          <li>3. แก้ไข label ของแต่ละ status ได้ในส่วน "ปรับแต่ง Status Configuration"</li>
          <li>4. กด "Reset Configuration" เพื่อกลับสู่ค่าเริ่มต้น</li>
          <li>5. ดู configuration ทั้งหมดในรูปแบบ JSON ได้ที่ส่วนล่าง</li>
        </ul>
      </div>

      {/* แสดงข้อมูลใน Console */}
      <div className="mt-4 text-sm text-gray-600">
        💡 เปิด Developer Console (F12) เพื่อดูข้อมูล log การเปลี่ยนแปลง status
      </div>
    </div>
  );
};

export default StatusExample; 