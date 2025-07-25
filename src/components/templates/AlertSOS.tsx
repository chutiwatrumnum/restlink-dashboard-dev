import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const AlertSOS = ({showToast,isToastExpanded,handleToggleToast,dataEmergency,handleHideToast}:any) => {
    const navigate = useNavigate();
    const alertRef = useRef<HTMLDivElement>(null);

    // ฟังก์ชันสำหรับ navigate ไปยัง add-location
    const handleNavigateToAddLocation = (unitId:string) => {
        navigate(`/dashboard/add-location?unitId=${unitId}`);
        // ปิดเฉพาะ dropdown list แต่ไม่ปิดปุ่ม SOS
        handleToggleToast(); // ปิด dropdown
    };

    // useEffect สำหรับจับการคลิกนอก component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
                // ถ้าคลิกนอก component และ dropdown กำลังเปิดอยู่ ให้ปิดมัน
                if (isToastExpanded) {
                    handleToggleToast();
                }
            }
        };

        // เพิ่ม event listener เมื่อ dropdown เปิด
        if (isToastExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // cleanup function เพื่อเอา event listener ออกเมื่อ component unmount หรือ dropdown ปิด
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isToastExpanded, handleToggleToast]);

    return (
    <>
    {showToast && (
        <div ref={alertRef} className="fixed top-20 right-15 z-50 animate-slide-in">
          {/* เหลือแค่วงกลมสีแดงอย่างเดียว */}
          <div 
            className="w-18 h-18 bg-red-500 rounded-full cursor-pointer 
            hover:bg-red-600 transition-colors emergency-pulse 
            "
            onClick={handleToggleToast}
          >
            {/* แสดงจำนวนแจ้งเตือนรวม */}
            <div className="text-white text-xs font-bold 
             flex flex-col  items-center justify-center my-auto h-full
            ">
              <div>
                SOS 
              </div>
            </div>
          </div>
          
          {/* Dropdown - แสดงเฉพาะเมื่อขยาย */}
          {isToastExpanded && (
            <div className="absolute top-14 right-0 w-80 bg-white shadow-lg rounded-lg border border-gray-200 animate-dropdown-in">
              {/* <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800">รายการแจ้งเตือน</h3>
                <button
                  onClick={handleHideToast}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div> */}
              
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="divide-y divide-gray-200">
                  {
                    dataEmergency?.emergency?.map((item: any,index:number) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={()=>handleNavigateToAddLocation(item?.unitId)}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-xs font-medium pt-1">
                            ห้อง : {item?.unit?.roomAddress || '-'}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  {
                    dataEmergency?.deviceWarning?.map((item: any,index:number) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={()=>handleNavigateToAddLocation(item?.unitId)}
                      >
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-xs font-medium t">
                            ห้อง : {item?.unit?.roomAddress || '-'}
                          </div>
                        </div>
                      </div>
                    ))
                  }

                
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    
    

    <style>{`
        @keyframes emergencyPulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          100% { 
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
          }
        }
        
        .emergency-pulse {
          animation: emergencyPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-dropdown-in {
          animation: dropdownIn 0.2s ease-out forwards;
        }
        
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
            scale: 0.95;
          }
          to {
            opacity: 1;
            transform: translateX(0);
            scale: 1;
          }
        }
        .animate-toast-slide-in {
          animation: toastSlideIn 0.4s ease-out forwards;
        }

      `}</style>

    
    </>
  );
};

export default AlertSOS;