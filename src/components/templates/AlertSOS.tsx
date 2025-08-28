import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef,useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../stores';
import { io, Socket } from "socket.io-client";
import { getEmergency,getEventPending } from "../../modules/sosWarning/service/api/SOSwarning";
import { encryptStorage } from "../../utils/encryptStorage";
// import { toast } from 'react-toastify';
import { Button } from 'antd';
import { ToastContainer,toast } from 'react-toastify';

const AlertSOS = ({isAuth}:any) => {
  const dispatch = useDispatch<Dispatch>();
  const [isToastExpanded, setIsToastExpanded] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [dataEmergency, setDataEmergency] = useState<any>(null);
  // State สำหรับควบคุม animation
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
 
  const notify = () => toast("Problem in your Room");
  useEffect(() => {
    if(dataEmergency?.emergency?.length > 0 || dataEmergency?.deviceWarning?.length > 0){
      dispatch.sosWarning.setShowToast(true);
    }
  }, [dataEmergency]);

  // useEffect สำหรับควบคุม animation
  useEffect(() => {
    if (showToast) {
      // แสดง component
      setIsVisible(true);
      setIsAnimatingOut(false);
    } else {
      // เริ่ม animation fade out
      setIsAnimatingOut(true);
      // ซ่อน component หลัง animation เสร็จ (500ms)
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimatingOut(false);
      }, 500);
    }
  }, [showToast]);

  useEffect(() => {
    async function connectSocket() {
      const getEmergencyData = async () => {
        let dataEmergency = await getEventPending();
        if (dataEmergency.status) {
          setDataEmergency(dataEmergency.result);
          // ส่งข้อมูลเริ่มต้นไปยัง Redux store
          dispatch.sosWarning.setDataEmergency(dataEmergency.result);
          
          let haveEmergency = dataEmergency.result.emergency.length > 0;
          let haveWarning = dataEmergency.result.deviceWarning.length > 0;
          if (haveEmergency || haveWarning) {
            setTimeout(() => {
              setShowToast(true);  
            }, 500);
            
          }
        }
      };
      getEmergencyData();

      const URL ="https://reslink-security-wqi2p.ondigitalocean.app/socket/sos/dashboard";
      const access_token = encryptStorage.getItem("access_token");
      const projectID = await encryptStorage.getItem("projectId");
      const newSocket = io(URL, {
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 2000,
        timeout: 10000,
        extraHeaders: {
          Authorization: `Bearer ${access_token}`,
          "x-api-key": projectID,
        },
      });
      newSocket.connect();
      newSocket.on("connect", () => {
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("sos", (data) => {
        let haveEmergency = data?.events?.emergency?.length > 0;
        let haveWarning = data?.events?.deviceWarning?.length > 0;
        let conditionEmergency = haveEmergency || haveWarning;
 
        // อัพเดท Redux store สำหรับให้ SideMenu ใช้
        if (data?.events) {
          setDataEmergency(data.events);
          dispatch.sosWarning.setDataEmergency(data.events);
        }
        if(conditionEmergency) {
          if(data.action == 'OPEN_EMERGENCY'){
            notify();
          }
          setTimeout(() => {
            setShowToast(true);
          }, 500);
          
        }
        else if(data?.events && !haveEmergency && !haveWarning) {
          setTimeout(() => {
            setShowToast(false);
          }, 500);
        }

      });
      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }

    // เชื่อมต่อ socket เฉพาะเมื่อ login แล้ว
    if (isAuth) {
      connectSocket();
    }
  }, []);


    const navigate = useNavigate();
    const alertRef = useRef<HTMLDivElement>(null);
    // ฟังก์ชันสำหรับ navigate ไปยัง add-location
    const handleNavigateToAddLocation = (unitId:string) => {
        navigate(`/dashboard/manage-plan?unitId=${unitId}`);
        // ปิดเฉพาะ dropdown list แต่ไม่ปิดปุ่ม SOS
        handleToggleToast(); // ปิด dropdown
    };


  
    const handleToggleToast = useCallback(() => {
      setIsToastExpanded((prev) => !prev);
    }, []);


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

    {isVisible && (
        <div 
          ref={alertRef} 
          className={`fixed top-20 right-15 z-50 transition-all duration-500 ${
            isAnimatingOut ? 'animate-fade-out' : 'animate-slide-in'
          }`}
        >
          {/* เหลือแค่วงกลมสีแดงอย่างเดียว */}
          <div 
            className="w-18 h-18 bg-red-500 rounded-full cursor-pointer 
            hover:bg-red-600 transition-colors emergency-pulse 
            "
            onClick={handleToggleToast}
          >
            {/* แสดงจำนวนแจ้งเตือนรวม */}
            <div className="text-white text-xl font-bold 
             flex flex-col  items-center justify-center my-auto h-full font-sarabun
            ">
              <div>
                SOS 
              </div>
            </div>
          </div>
          
          {/* Dropdown - แสดงเฉพาะเมื่อขยาย */}
          {isToastExpanded && (
            <div className="absolute top-14 right-0 w-80 bg-white shadow-lg rounded-lg border border-gray-200 animate-dropdown-in">
              
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

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
        }

        .animate-fade-out {
          animation: fadeOut 0.5s ease-in forwards;
        }

        /* Toast progress bar สีแดง */
        .toast-progress-red {
          background: #dc2626 !important;
          background-image: none !important;
        }
      `}</style>

    
    </>
  );
};

export default AlertSOS;