import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../../../components/templates/Header";
import { ModalFormUpdate } from "../components/ModalFormUpload";
import FormWarningSOS from "../components/FormWarningSOS";
import ImageVillage from "../components/ImageVilage";
import FormVillageLocation from "../components/FormVillageLocation";
import BuildingCondo from "../components/BuildingCondo";
import { Row, Col, Card, Spin } from "antd";
import { deletePlanAccount, deleteMarker, getMasterData, getVillageData, getEmergency } from "../service/api/SOSwarning";
import { dataSelectPlan, dataAllMap, SelectMarker } from "../../../stores/interfaces/SosWarning";
import { io, Socket } from 'socket.io-client';
import { encryptStorage } from "../../../utils/encryptStorage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";

const WarrantyTracking = () => {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showWarningCondo, setShowWarningCondo] = useState<boolean | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const formVillageRef = useRef<HTMLDivElement>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [buildingPlan, setBuildingPlan] = useState<{
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  } | null>(null);
  const [dataSelectPlan, setDataSelectPlan] = useState<dataSelectPlan>({
    planType: [],
    planTypeCondo: [],
    unit: []
  });
  const [dataMapAll, setDataMapAll] = useState<dataAllMap>({
    id: '',
    planInfoId: '',
    projectName: '',
    planTypeId: 70,
    planType: '',
    planTypeCondo: '',
    floor: '',
    planImg: '',
    marker: [],
    zone: []
  });
  // state สำหรับควบคุมว่า FormVillageLocation ควรแสดงหรือไม่ (แยกจาก handleAreaClick)
  const [shouldShowVillageForm, setShouldShowVillageForm] = useState<boolean>(false);
  // state สำหรับควบคุมการแสดง FormWarningSOS (แสดงเฉพาะตอนเปิดหน้าครั้งแรกกับตอนกด cancel)
  const [shouldShowWarningSOS, setShouldShowWarningSOS] = useState<boolean>(true);
  const [currentLat, setCurrentLat] = useState("50.5040806515");
  const [currentLng, setCurrentLng] = useState("-50.5040806515");
  const [currentMapMode, setCurrentMapMode] = useState<'preview' | 'work-it'>('preview');
  const [shouldFocusNameInput, setShouldFocusNameInput] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SelectMarker | null>(null);
  const [unitHover, setUnitHover] = useState<number | null>(null);
  const [unitClick, setUnitClick] = useState<number | null>(null);


  // Debug selectedMarker changes
  // useEffect(() => {
  //   console.log('🔄 selectedMarker state changed:', {
  //     selectedMarker,
  //     hasSelectedMarker: !!selectedMarker,
  //     timestamp: new Date().toISOString()
  //   });
  // }, [selectedMarker]);

  const [selectedMarkerUpdate, setSelectedMarkerUpdate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [planType, setPlanType] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasImageData, setHasImageData] = useState(false);
  // state สำหรับเก็บข้อมูล alert markers (สีแดงและสีเหลือง)
  const [alertMarkers, setAlertMarkers] = useState<{ red: any[], yellow: any[] }>({ red: [], yellow: [] });

  const [editMarkerData, setEditMarkerData] = useState<any | null>(null);
  // เพิ่ม state สำหรับเก็บสถานะ lock ของ markers
  const [markersLocked, setMarkersLocked] = useState<boolean>(true);
  // เพิ่ม state สำหรับควบคุมความโปร่งใสของ markers
  const [markersFullOpacity, setMarkersFullOpacity] = useState<boolean>(false);
  const [dataEmergency, setDataEmergency] = useState<any>(null)
  // State สำหรับ toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isToastExpanded, setIsToastExpanded] = useState<boolean>(false);
  // State สำหรับเก็บสถานะ active marker
  const [hasActiveMarker, setHasActiveMarker] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>("Loading...");
  // useEffect เพื่อ refresh map เมื่อ layout เปลี่ยน
  useEffect(() => {
    // ตัดสินใจว่าควรแสดง form ด้านขวาหรือไม่
    const shouldShowForm = (alertMarkers.red.length > 0 || alertMarkers.yellow.length > 0 || shouldShowVillageForm) && currentMapMode !== 'preview';

    // Refresh map หลังจาก layout เปลี่ยน
    if (villageMapRefreshRef.current) {
      setTimeout(() => {
        if (villageMapRefreshRef.current) {
          villageMapRefreshRef.current();
        }
      }, 350);
    }
  }, [alertMarkers.red.length, alertMarkers.yellow.length, shouldShowVillageForm, currentMapMode]);

  // ฟังก์ชันสำหรับรับค่า lat/lng จาก VillageMapTS
  const handleLatLngChange = useCallback((latitude: number, longitude: number) => {
    setCurrentLat(latitude.toString());
    setCurrentLng(longitude.toString());
  }, []);

  // สร้าง ref สำหรับ VillageMapTS functions
  const villageMapResetRef = useRef<((markerId: string | number) => void) | null>(null);
  const villageMapUpdateAddressRef = useRef<((markerId: string, newAddress: string) => void) | null>(null);
  const villageMapUpdateTelRef = useRef<((markerId: string | number, telType: 'tel1' | 'tel2' | 'tel3', newTel: string) => void) | null>(null);
  const villageMapConfirmRef = useRef<((markerId: string | number, markerData: any) => void) | null>(null);
  const villageMapRefreshRef = useRef<(() => void) | null>(null);

  // ฟังก์ชันสำหรับรับ marker ที่เลือกจาก VillageMapTS
  const handleMarkerSelect = useCallback((marker: any, isNewMarker: boolean = false) => {

    // Force re-render by creating new object reference
    if (marker) {
      const newMarker = { ...marker };
      setSelectedMarker(newMarker);

      // ตั้งค่า isCreatingMode ตาม parameter ที่รับมา
      setIsCreatingMode(isNewMarker);

      // แสดง FormVillageLocation เมื่อมี marker ใหม่
      setShouldShowVillageForm(true);
      setShouldShowWarningSOS(false);
    } else {
      // เมื่อยกเลิกการเลือก marker ให้รีเซ็ตทุกสถานะที่เกี่ยวข้อง
      setSelectedMarker(null);
      setIsCreatingMode(false);

      // ตรวจสอบว่ามี marker แจ้งเตือนหรือไม่ เพื่อตัดสินใจแสดง form
      const hasAlertMarkers = alertMarkers.red.length > 0 || alertMarkers.yellow.length > 0;
      if (hasAlertMarkers) {
        // ถ้ามี marker แจ้งเตือน ให้แสดง FormWarningSOS แทน
        setShouldShowVillageForm(false);
        setShouldShowWarningSOS(true);
      } else {
        // ถ้าไม่มี marker แจ้งเตือน ให้ซ่อนทั้งคู่
        setShouldShowVillageForm(false);
        setShouldShowWarningSOS(false);
      }
    }
  }, [villageMapResetRef, alertMarkers]);

  // ฟังก์ชันสำหรับแก้ไขชื่อ marker
  const handleMarkerNameChange = useCallback((markerId: string | number, newName: string) => {
    // อัพเดท selectedMarker - ต้อง preserve ข้อมูล tel ที่มีอยู่เดิม
    if (selectedMarker && selectedMarker.id === markerId) {
      const updatedMarker = {
        ...selectedMarker, // preserve ข้อมูลเดิมทั้งหมด รวมทั้ง tel1, tel2, tel3
        name: newName,      // อัพเดทเฉพาะ name
      };
      setSelectedMarker(updatedMarker);
      // อัพเดท form field ทันที
    }

    // ส่งข้อมูลการอัพเดทไปยัง VillageMapTS - ส่งเฉพาะ name
    setSelectedMarkerUpdate({ id: markerId.toString(), name: newName });

    // เคลียร์ selectedMarkerUpdate หลังจาก 100ms เพื่อให้ useEffect ทำงาน
    setTimeout(() => {
      setSelectedMarkerUpdate(null);
    }, 500);
  }, [selectedMarker]);

  // ฟังก์ชันสำหรับแก้ไข address ของ marker
  const handleMarkerAddressChange = useCallback((markerId: string | number, newAddress: string) => {
    // อัพเดท marker ใน VillageMapTS
    if (villageMapUpdateAddressRef.current) {
      villageMapUpdateAddressRef.current(markerId.toString(), newAddress);
    }

    // อัพเดท selectedMarker
    if (selectedMarker && selectedMarker.id === markerId) {
      const updatedMarker = {
        ...selectedMarker,
        address: newAddress
      };
      setSelectedMarker(updatedMarker);
    }
  }, [selectedMarker]);

  // ฟังก์ชันสำหรับแก้ไข tel1 ของ marker
  const handleMarkerTel1Change = useCallback((markerId: string | number, newTel1: string) => {
    // อัพเดท selectedMarker เพื่อให้ข้อมูลถูก save และแสดงได้เมื่อ click marker อีกครั้ง
    if (selectedMarker && selectedMarker.id === markerId) {
      const updatedMarker = {
        ...selectedMarker,
        tel1: newTel1,
        // preserve ข้อมูล tel อื่นๆ
        tel2: (selectedMarker as any).tel2 || "",
        tel3: (selectedMarker as any).tel3 || ""
      };
      setSelectedMarker(updatedMarker);
    }

    // อัพเดท marker ใน VillageMapTS ด้วย
    if (villageMapUpdateTelRef.current) {
      villageMapUpdateTelRef.current(markerId, 'tel1', newTel1);
    }
  }, [selectedMarker]);

  // ฟังก์ชันสำหรับแก้ไข tel2 ของ marker
  const handleMarkerTel2Change = useCallback((markerId: string | number, newTel2: string) => {
    // อัพเดท selectedMarker เพื่อให้ข้อมูลถูก save และแสดงได้เมื่อ click marker อีกครั้ง
    if (selectedMarker && selectedMarker.id === markerId) {
      const updatedMarker = {
        ...selectedMarker,
        tel2: newTel2,
        // preserve ข้อมูล tel อื่นๆ
        tel1: (selectedMarker as any).tel1 || "",
        tel3: (selectedMarker as any).tel3 || ""
      };
      setSelectedMarker(updatedMarker);
    }

    // อัพเดท marker ใน VillageMapTS ด้วย
    if (villageMapUpdateTelRef.current) {
      villageMapUpdateTelRef.current(markerId, 'tel2', newTel2);
    }
  }, [selectedMarker]);

  // ฟังก์ชันสำหรับแก้ไข tel3 ของ marker
  const handleMarkerTel3Change = useCallback((markerId: string | number, newTel3: string) => {
    // อัพเดท selectedMarker เพื่อให้ข้อมูลถูก save และแสดงได้เมื่อ click marker อีกครั้ง
    if (selectedMarker && selectedMarker.id === markerId) {
      const updatedMarker = {
        ...selectedMarker,
        tel3: newTel3,
        // preserve ข้อมูล tel อื่นๆ
        tel1: (selectedMarker as any).tel1 || "",
        tel2: (selectedMarker as any).tel2 || ""
      };
      setSelectedMarker(updatedMarker);
    }

    // อัพเดท marker ใน VillageMapTS ด้วย
    if (villageMapUpdateTelRef.current) {
      villageMapUpdateTelRef.current(markerId, 'tel3', newTel3);
    }
  }, [selectedMarker]);

  // ฟังก์ชันสำหรับอัพเดท marker ทั้งหมด (ใช้หลังจากสร้าง marker ใหม่)
  const handleMarkerUpdate = useCallback((markerId: string, updatedMarkerData: any) => {

    // อัพเดท selectedMarker ด้วยข้อมูลใหม่
    setSelectedMarker(updatedMarkerData);

    // ส่งข้อมูลไปยัง VillageMapTS ผ่าน villageMapConfirmRef เพื่ออัพเดท marker บนแผนที่
    if (villageMapConfirmRef.current) {
      // แปลง markerId จาก string เป็น number เพื่อส่งไปยัง VillageMapTS
      const numericMarkerId = parseInt(markerId);
      villageMapConfirmRef.current(numericMarkerId, updatedMarkerData);
    }
  }, [villageMapConfirmRef]);

  // setting pagination Option

  const handleUploadImage = () => {
    setIsModalOpen(true);
  };

  // callback เมื่ออัปโหลดสำเร็จ
  const handleUploadSuccess = (base64: string) => {
    setIsUploading(true);
    setUploadedImage(base64);
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const handleCancelCondo = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // setShowWarningCondo(false);
  };

  const handleCancelVillage = () => {
    // รีเซ็ต marker position ถ้ามี marker ที่เลือกอยู่
    if (selectedMarker && villageMapResetRef.current) {
      // แยกแยะ marker จำลอง (temporary) กับ marker ที่มีอยู่แล้ว (existing)
      const numericMarkerId = typeof selectedMarker.id === 'string' ? parseInt(selectedMarker.id) : selectedMarker.id;
      const isTemporaryMarker = numericMarkerId > 1000000000000; // 13 หลัก
      // เรียกใช้ villageMapResetRef เฉพาะสำหรับลบ marker จำลองเท่านั้น
      if (isTemporaryMarker) {
        villageMapResetRef.current(selectedMarker.id.toString());
      }
    }

    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true); // แสดง FormWarningSOS เมื่อกด cancel

    // เคลียร์ selectedMarker
    setSelectedMarker(null);
  };

  // เพิ่มฟังก์ชันสำหรับจัดการ Confirm marker
  const handleConfirmMarker = useCallback(() => {
    if (selectedMarker && villageMapConfirmRef.current) {
      // ส่งข้อมูล marker ที่อัพเดทแล้วจาก form ไปยัง VillageMapTS
      villageMapConfirmRef.current(selectedMarker.id, selectedMarker);

      // ซ่อน form และแสดง FormWarningSOS
      setShouldShowVillageForm(false);
      setShouldShowWarningSOS(true);
      setSelectedMarker(null);
    }
  }, [selectedMarker]);

  // เพิ่มฟังก์ชันสำหรับจัดการ Cancel marker 
  const handleCancelMarker = useCallback(() => {
    // ตรวจสอบว่ามี marker สีแดงหรือสีเหลืองหรือไม่
    const hasAlertMarkers = alertMarkers.red.length > 0 || alertMarkers.yellow.length > 0;

    if (selectedMarker && villageMapResetRef.current) {
      // เรียกใช้ cancelMarkerEdit โดยส่ง "cancel" เพื่อให้ VillageMapTS รู้ว่าต้องการยกเลิกการแก้ไขเท่านั้น
      villageMapResetRef.current("cancel");
    }
    // ทำทุกอย่างในครั้งเดียว:
    // 1. ปิด form village ทันที
    setShouldShowVillageForm(false);
    // 2. เคลียร์ selectedMarker
    setSelectedMarker(null);
    // 3. ตั้งค่า shouldShowWarningSOS ตามเงื่อนไข - แสดงถ้ามี marker แจ้งเตือน
    setShouldShowWarningSOS(hasAlertMarkers);
  }, [selectedMarker, villageMapResetRef, alertMarkers]);

  const loadFirst = async () => {
    try {
      setIsLoading(true);
      // setLoadingText("กำลังโหลดข้อมูลหลัก...");

      let data = await getMasterData();

      // setLoadingText("กำลังโหลดข้อมูลแผนที่...");
      let dataAllMap = await getVillageData();
      
      // setLoadingText("กำลังโหลดข้อมูลแจ้งเตือน...");
      let dataEmergency = await getEmergency();

      if (dataEmergency.status) {
        setDataEmergency(dataEmergency.result)
      }

      if (data.status) {
        setDataSelectPlan(data.result);
      }

      if (dataAllMap.status) {
        dataAllMap.result.marker = dataAllMap.result.marker.marker.map((item: any) => {
          return item
        })
        if(dataAllMap.result.planImg){
          setUploadedImage(dataAllMap.result.planImg)
        }

        setDataMapAll(dataAllMap.result);

        // เซ็ต uploadedImage และ hasImageData จาก API response
        if (dataAllMap.result && dataAllMap.result.planImg) {
          setUploadedImage(dataAllMap.result.planImg);
          setHasImageData(true);
        } else {
          setHasImageData(false);
        }
      } else {
        setHasImageData(false);
      }

      // setLoadingText("เสร็จสิ้น");
      // เพิ่ม delay เล็กน้อยเพื่อให้ดู smooth
      setTimeout(() => {
        setIsLoading(false);
      }, 500);

    } catch (error) {
      // console.error('Error loading data:', error);
      // setLoadingText("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }

  useEffect(() => {
    loadFirst();
  }, []);

  // แยก Socket.IO ออกมาเป็น useEffect เฉพาะ
  useEffect(() => {
    async function connectSocket() {
      const URL = "https://reslink-security-wqi2p.ondigitalocean.app/socket/sos/dashboard"
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
          "x-api-key": projectID
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
        // อัพเดทข้อมูลทั้งชุดเมื่อได้รับข้อมูลใหม่
        if (data) {
          // อัพเดท marker
          if (data.marker && Array.isArray(data.marker)) {
            setDataMapAll(prev => ({
              ...prev,
              marker: data.marker
            }));
          }

          // อัพเดท emergency
          if (data.emergency) {
            setDataEmergency((prev: any) => ({
              ...prev,
              emergency: data.emergency,
              deviceWarning: data.deviceWarning || []
            }));
          }
        }

        if (data.deviceWarning || data.emergency) {
          setShowToast(true);
        }
      });

      // newSocket.onAny((eventName, ...args) => {
      //   console.log('🔍 Received ANY event:', eventName, args);
      // });

      // Debug - Listen for ANY event
      setSocket(newSocket); // เพิ่มบรรทัดนี้


      // Cleanup เมื่อ component unmount
      return () => {
        // console.log('🧹 Cleaning up Socket.IO connection');
        newSocket.close();
      };
    }
    connectSocket();
  }, []); // Empty dependency array เพื่อให้รันครั้งเดียว

  // state สำหรับเช็คว่ามีแผนหรือไม่ (ตัวอย่างนี้ให้แสดง No plan เสมอ)
  const hasPlan = false;




  // ฟังก์ชัน handle click - แก้ไขให้ไม่แสดง FormVillageLocation เมื่อคลิกปกติ
  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // ฝั่ง Village: ไม่แสดง form เมื่อคลิกปกติ (จะแสดงเฉพาะเมื่อ VillageMapTS เรียกมา)
    // เฉพาะการคลิกที่ form ที่แสดงอยู่แล้วให้คงสถานะไว้
    if (formVillageRef.current && formVillageRef.current.contains(e.target as Node)) {
      // คลิกที่ form ที่แสดงอยู่แล้ว ให้คงสถานะ
      return;
    }

    // ตรวจสอบว่าคลิกที่ปุ่มรูปบ้าน (🏠) หรือไม่
    const target = e.target as HTMLElement;
    const isHomeButton = target.textContent?.includes('🏠') ||
      target.closest('button')?.textContent?.includes('🏠') ||
      target.closest('[title*="รีเซ็ต Zoom และ Pan"]');

    if (isHomeButton) {
      // ถ้าคลิกปุ่มรูปบ้าน ไม่ต้องปิด form
      return;
    }

    // ตรวจสอบว่าคลิกที่ edit modal (form แก้ไข marker หรือ zone) หรือไม่
    const isEditModal = target.closest('[class*="showEditMarkerModal"]') ||
      target.closest('[class*="showEditZoneModal"]') ||
      target.closest('form[class*="space-y-3"]') ||
      target.textContent?.includes('✕') || // ปุ่มยกเลิกใน edit modal
      target.textContent?.includes('💾') || // ปุ่มบันทึก
      target.textContent?.includes('↺') || // ปุ่มรีเซ็ต
      target.textContent?.includes('🗑️') || // ปุ่มลบ
      target.closest('[title*="ยกเลิกการแก้ไข"]') ||
      target.closest('[title*="บันทึกการแก้ไข"]') ||
      target.closest('[title*="รีเซ็ตตำแหน่ง"]') ||
      target.closest('[title*="ลบ"]');

    if (isEditModal) {
      // ถ้าคลิกที่ edit modal ไม่ต้องปิด FormVillageLocation
      return;
    }

    // ตรวจสอบว่าคลิกที่ map หรือ monitoring หรือไม่
    const isMapClick = target.closest('img') || // คลิกที่รูปภาพ
      target.closest('[class*="bg-blue-50"]') || // Monitoring section
      target.closest('[class*="bg-gray-50"]') || // Alert Status section
      target.textContent?.includes('Monitoring') ||
      target.textContent?.includes('Alert Status') ||
      target.textContent?.includes('Emergency') ||
      target.textContent?.includes('Normal');

    if (isMapClick) {
      // ถ้าคลิกที่ map หรือ monitoring ไม่ต้องปิด form
      return;
    }

    // คลิกที่อื่นๆ ให้ปิด form (หากมี) แต่ให้แสดง FormVillageLocation แทน FormWarningSOS
    // เฉพาะเมื่อคลิกที่พื้นที่ว่างๆ เท่านั้น
    // if (shouldShowVillageForm) {
    //   setShouldShowVillageForm(false);
    //   setShouldShowWarningSOS(false); // ไม่แสดง FormWarningSOS เมื่อคลิกที่อื่นๆ
    //   // แสดง FormVillageLocation แทน (จะไม่แสดง FormWarningSOS)
    // }
  };

  // callback เมื่อ VillageMapTS ต้องการแสดง FormVillageLocation (หลังสร้าง marker/zone เสร็จ)
  const handleShowVillageForm = () => {
    setShouldShowVillageForm(true);
    setShouldShowWarningSOS(false); // ซ่อน FormWarningSOS เมื่อแสดง FormVillageLocation
  };

  // callback เมื่อ map mode เปลี่ยน
  const handleMapModeChange = useCallback((mode: 'preview' | 'work-it') => {
    setCurrentMapMode(mode);

    // อัพเดทสถานะ lock และความโปร่งใสของ markers ตามโหมด
    const isPreviewMode = mode === 'preview';
    setMarkersLocked(true); // lock markers ทั้งสองโหมด
    setMarkersFullOpacity(isPreviewMode); // แสดง marker แบบเต็มในโหมด preview

    // ส่งสถานะใหม่ไปยัง ImageVillage component และ refresh map
    if (villageMapRefreshRef.current) {
      setTimeout(() => {
        if (villageMapRefreshRef.current) {
          villageMapRefreshRef.current();
        }
      }, 100);
    }
  }, [villageMapRefreshRef]);

  // callback เมื่อ marker ถูกลบ
  const handleMarkerDeleted = useCallback(async (deletedMarker?: any) => {
    // ตรวจสอบว่า deletedMarker เป็น number (markerId) หรือ array
    let id;
    if (typeof deletedMarker === 'number') {
      // ถ้าเป็น markerId จาก FormVillageLocation
      id = deletedMarker;
    } else if (deletedMarker && Array.isArray(deletedMarker) && deletedMarker[0]) {
      // ถ้าเป็น array จาก VillageMapTS
      id = deletedMarker[0].id;
    } else {
      return;
    }

    // แสดง loading เมื่อลบ marker
    setLoadingText("กำลังลบข้อมูล...");
    setIsLoading(true);

    let data = await deleteMarker(id);
    if (data.status) {
      if (data.result) {
        // อัพเดท marker
        SuccessModal("ลบข้อมูลสำเร็จ", 900)
        if (data.result.marker && Array.isArray(data.result.marker)) {
          setDataMapAll((prev: any) => ({
            ...prev,
            marker: data.result.marker
          }));
        }
        // อัพเดท emergency
        if (data.result.emergency) {
          setDataEmergency((prev: any) => ({
            ...prev,
            emergency: data.result.emergency,
            deviceWarning: data.result.deviceWarning || []
          }));
        }
      }
    }
    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true);
    setSelectedMarker(null);

    // ปิด loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [selectedMarker]);

  // callback สำหรับลบ marker จำลองเมื่อกด Cancel ใน form
  const handleCancelMarkerTemp = useCallback((markerId: string | number) => {
    // แยกแยะ marker จำลอง (temporary) กับ marker ที่มีอยู่แล้ว (existing)
    // Temporary marker จะมี ID เป็น timestamp (Date.now()) ซึ่งเป็นตัวเลขขนาดใหญ่ (13 หลัก)
    // Existing marker จะมี ID จาก database ซึ่งเป็นตัวเลขปกติ (1-6 หลัก)
    const numericMarkerId = typeof markerId === 'string' ? parseInt(markerId) : markerId;
    const isTemporaryMarker = numericMarkerId > 1000000000000; // 13 หลัก


    // เรียกใช้ villageMapResetRef เฉพาะสำหรับลบ marker จำลองเท่านั้น
    if (isTemporaryMarker && villageMapResetRef.current || true) {
      if (villageMapResetRef.current) {
        villageMapResetRef.current(markerId || 0);
      }
    }

    // ปิด form และกลับไป FormWarningSOS
    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true);
    setSelectedMarker(null);
  }, [villageMapResetRef, isCreatingMode, selectedMarker]);

  // callback เมื่อ zone ถูกสร้าง
  const handleZoneCreated = useCallback(() => {
    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true);
    setSelectedMarker(null);
  }, []);

  // callback เมื่อ zone ถูกแก้ไข
  const handleZoneEdited = useCallback(() => {
    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true);
    setSelectedMarker(null);
  }, []);

  // callback เมื่อเริ่มแก้ไข zone (double click)
  const handleZoneEditStarted = useCallback(() => {
    setShouldShowVillageForm(false);
    setShouldShowWarningSOS(true);
    setSelectedMarker(null);
  }, []);

  // callback เมื่อสร้าง marker ใหม่ - ให้ focus ที่ input Name
  const handleNewMarkerCreated = useCallback(() => {
    setShouldFocusNameInput(true);
  }, []);

  // callback สำหรับรับข้อมูล alert markers จาก VillageMapTS
  const handleAlertMarkersChange = useCallback((alertMarkersData: { red: any[], yellow: any[] }) => {
    setAlertMarkers(alertMarkersData);
  }, []);

  const handleCondoPlanSubmit = (
    condoType: string,
    floor: number,
    numberOfBuilding: number,
    projectName: string
  ) => {
    setBuildingPlan({ condoType, floor, numberOfBuilding });
    setIsModalOpen(false);
    setProjectName(projectName);
  };


  const confirmDeletePlan = async (id: string) => {
    setLoadingText("กำลังลบแผนที่...");
    setIsLoading(true);

    let dataDelete = await deletePlanAccount(id);
    if (dataDelete.status) {
      setLoadingText("ลบแผนที่สำเร็จ กำลังรีเฟรชหน้า...");
      await SuccessModal("ลบแผนที่สำเร็จ", 1000);
      window.location.reload();
    }
    else {
      setIsLoading(false);
    }
  }

  const deletePlan = async () => {
    let id = dataMapAll?.id || '';
    ConfirmModal({
      title: "ยืนยันลบแผนที่",
      message: "",
      okMessage: "ลบ",
      cancelMessage: "ยกเลิก",
      onOk: () => confirmDeletePlan(id),
      onCancel: () => { }
    });
  }

  // const fetchVillageData = async () => {
  //   try {
  //     const data = await getVillageData();

  //     // ตรวจสอบว่ามี result หรือไม่
  //     if (data?.result) {
  //       const result = data.result;

  //       // Set uploaded image จาก planImage
  //       if (result.planImage) {
  //         setUploadedImage(result.planImage);
  //         setHasImageData(true);
  //       }

  //       // แปลงข้อมูล markers จาก API response
  //       // แปลงข้อมูล zones จาก API response
  //     }
  //   } catch (error) {
  //     setHasImageData(false);
  //   }
  // }

  // เพิ่มฟังก์ชันจัดการ editMarkerData
  const handleEditMarkerData = (markerData: any | null) => {
    setEditMarkerData(markerData);
  };

  // ฟังก์ชันสำหรับแสดง toast
  const handleShowToast = () => {
    setShowToast(true);
  };

  // ฟังก์ชันสำหรับซ่อน toast
  const handleHideToast = () => {
    setShowToast(false);
    setIsToastExpanded(false); // รีเซ็ตการขยายเมื่อปิด toast
  };

  // ฟังก์ชันสำหรับ toggle การขยาย toast
  const handleToggleToast = () => {
    setIsToastExpanded(!isToastExpanded);
  };

  // Handler สำหรับรับสถานะ active marker จาก VillageMapTS
  const handleActiveMarkerChange = (isActive: boolean) => {
    setHasActiveMarker(isActive);
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
      <div className="text-center">
        <Spin size="large" className="mb-6" />
        <div className="font-bold text-lg text-[#002B45] mb-2">
          {loadingText}
        </div>
        <div className="text-[#002B45] text-sm max-w-xs">
          Please wait...
        </div>
      </div>
    </div>
  );

  // แสดง Loading เมื่อกำลังโหลดข้อมูล
  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-center !mb-5">
          <Header title="Add location" className="!mb-0" />
        </div>
        <LoadingComponent />
      </>
    );
  }

  return (
    <>
      <ModalFormUpdate
        dataSelectPlan={dataSelectPlan}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        isUploading={isUploading}
        onCondoPlanSubmit={handleCondoPlanSubmit}
        setProjectName={setProjectName}
        setPlanType={setPlanType}
        planType={planType}
        loadFirst={loadFirst}
        dataMapAll={dataMapAll}
      />

      <div className="flex justify-between  items-center !mb-5">
        <Header title="Add location" className="!mb-0" />
        <div className="flex gap-3 items-center">
          {/* Button Group สำหรับสลับโหมด */}
          {(dataMapAll?.id || uploadedImage) && (
            <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => !hasActiveMarker && handleMapModeChange('preview')}
                disabled={hasActiveMarker}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-200 h-12 w-40
                  ${hasActiveMarker
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'cursor-pointer'
                  }
                  ${currentMapMode === 'preview'
                    ? 'bg-blue-500 !text-white shadow-sm'
                    : hasActiveMarker
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
                title={hasActiveMarker ? 'มีการแก้ไข marker อยู่ กรุณายืนยันหรือยกเลิกก่อน' : ''}
              >
                PREVIEW
              </button>
              <button
                onClick={() => !hasActiveMarker && handleMapModeChange('work-it')}
                disabled={hasActiveMarker}
                className={`px-4 py-2 text-sm 
                  font-medium transition-all duration-200 border-l border-gray-300 h-12 w-40
                  ${hasActiveMarker
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'cursor-pointer'
                  }
                ${currentMapMode === 'work-it'
                    ? 'bg-blue-500 !text-white shadow-sm'
                    : hasActiveMarker
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                title={hasActiveMarker ? 'มีการแก้ไข marker อยู่ กรุณายืนยันหรือยกเลิกก่อน' : ''}
              >
                EDIT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* แสดงผล village */}
      {uploadedImage && (
        <div className="" onClick={handleAreaClick}>
          <Card className="h-full" styles={{ body: { padding: 0 } }}>
            <Row gutter={0} className="h-full test flex-col sm:flex-row">
              {/* แผนที่ - ปรับขนาดตามสภาพการแสดง form */}
              <Col
                span={24}
                sm={24}
                md={24}
                lg={16}
                className={`transition-all duration-300 ease-in-out ${
                  // เพิ่ม animation เมื่อเปลี่ยนขนาด
                  (alertMarkers.red.length === 0 && alertMarkers.yellow.length === 0 && !shouldShowVillageForm) ||
                    currentMapMode === 'preview' ? 'lg:w-full' : 'lg:w-2/3'
                  }`}
              >
                <div ref={imageRef}>
                  <ImageVillage
                    uploadedImage={uploadedImage || ""}
                    projectName={projectName}
                    setShowWarningVillage={handleShowVillageForm}
                    showWarningVillage={shouldShowVillageForm}
                    dataSelectPlan={dataSelectPlan}
                    dataMapAll={dataMapAll}
                    onLatLngChange={handleLatLngChange}
                    onMarkerSelect={handleMarkerSelect}
                    onMarkerNameChange={handleMarkerNameChange}
                    onMarkerAddressChange={handleMarkerAddressChange}
                    onMarkerUpdate={handleMarkerUpdate}
                    selectedMarkerUpdate={selectedMarkerUpdate}
                    villageMapResetRef={villageMapResetRef}
                    villageMapUpdateAddressRef={villageMapUpdateAddressRef}
                    villageMapUpdateTelRef={villageMapUpdateTelRef}
                    villageMapConfirmRef={villageMapConfirmRef}
                    villageMapRefreshRef={villageMapRefreshRef}
                    mapMode={currentMapMode}
                    onMapModeChange={handleMapModeChange}
                    onMarkerDeleted={handleMarkerDeleted}
                    onZoneCreated={handleZoneCreated}
                    onZoneEdited={handleZoneEdited}
                    onZoneEditStarted={handleZoneEditStarted}
                    onNewMarkerCreated={handleNewMarkerCreated}
                    onAlertMarkersChange={handleAlertMarkersChange}
                    editMarkerData={editMarkerData}
                    onEditMarkerData={handleEditMarkerData}
                    markersLocked={markersLocked}
                    markersFullOpacity={markersFullOpacity}
                    setDataMapAll={setDataMapAll}
                    setDataEmergency={setDataEmergency}
                    setUnitHover={setUnitHover}
                    setUnitClick={setUnitClick}
                    onActiveMarkerChange={handleActiveMarkerChange}
                  />
                </div>
              </Col>

              {/* Form ด้านขวา - แยกเป็น 2 กรณี */}
              <>
                {/* กรณีที่ 1: แสดง FormVillageLocation */}
                {currentMapMode === 'work-it' && (
                  <Col
                    span={24}
                    sm={24}
                    md={24}
                    lg={8}
                    className="animate-slide-in-right"
                  >

                    <div className="shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] h-full">
                      <div className="h-full animate-fade-in" ref={formVillageRef}>
                        <FormVillageLocation
                          latitude={currentLat}
                          longitude={currentLng}
                          selectedMarker={selectedMarker}
                          onMarkerNameChange={handleMarkerNameChange}
                          onMarkerAddressChange={handleMarkerAddressChange}
                          onMarkerTel1Change={handleMarkerTel1Change}
                          onMarkerTel2Change={handleMarkerTel2Change}
                          onMarkerTel3Change={handleMarkerTel3Change}
                          onMarkerUpdate={handleMarkerUpdate}
                          onConfirm={handleConfirmMarker}
                          onCancel={handleCancelMarker}
                          mapMode={currentMapMode}
                          shouldFocusNameInput={shouldFocusNameInput}
                          onFocusHandled={() => setShouldFocusNameInput(false)}
                          dataSelectPlan={dataSelectPlan}
                          isCreatingMode={isCreatingMode}
                          planType={planType}
                          onMarkerDelete={handleCancelMarkerTemp}
                          idVillage={dataMapAll.id}
                          setShouldShowVillageForm={setShouldShowVillageForm}
                          editMarkerData={editMarkerData}
                          onEditMarkerData={handleEditMarkerData}
                          setDataMapAll={setDataMapAll}
                          onMarkerSelect={handleMarkerSelect}
                          hasActiveMarker={!!selectedMarker}
                          dataAllMap={dataMapAll}
                        />
                      </div>
                    </div>
                  </Col>
                )}

                {currentMapMode === 'preview' && (
                  <Col
                    span={24}
                    sm={24}
                    md={24}
                    lg={8}
                    className="animate-slide-in-right"
                  >
                    <div className={`shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] h-full overflow-hidden ${dataEmergency.emergency.length === 0 && dataEmergency.deviceWarning.length === 0 ? 'flex items-center justify-center' : ''}`}>
                      <div className="animate-fade-in h-full">
                        <FormWarningSOS
                          alertMarkers={alertMarkers}
                          dataMapAll={dataMapAll}
                          dataEmergency={dataEmergency}
                          setDataEmergency={setDataEmergency}
                          unitHover={unitHover}
                          unitClick={unitClick}
                          currentMapMode={currentMapMode}
                          onClearFilter={() => setUnitClick(null)}
                        />
                      </div>
                    </div>
                  </Col>
                )}
              </>

            </Row>
          </Card>
        </div>
      )}
      {/* แสดงผล condo */}
      {buildingPlan && (
        <div className="p-4" onClick={handleAreaClick}>
          <Card className="h-full" styles={{ body: { padding: 0 } }}>
            <div ref={imageRef}>
              <BuildingCondo
                projectName={projectName}
                buildingPlan={buildingPlan}
                showWarningCondo={showWarningCondo}
                handleCancelCondo={handleCancelCondo}
                dataMapAll={dataMapAll}
              />
            </div>
          </Card>
        </div>
      )}

      {!uploadedImage && !buildingPlan && (
        <div className="flex flex-col items-center justify-center  min-h-[70vh] w-full text-2xl text-[#403d38]">
          ไม่มีข้อมูล Plan
        </div>
      )}



      {/* Custom CSS สำหรับ animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-toast-slide-in {
          animation: toastSlideIn 0.4s ease-out forwards;
        }

        /* Responsive transitions สำหรับ grid layout */
        .transition-grid {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
};

export default WarrantyTracking;
