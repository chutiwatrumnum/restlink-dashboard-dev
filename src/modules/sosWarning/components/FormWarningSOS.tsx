import { useState, useEffect } from "react";
import { Button } from "antd";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { ModalFormMemberHome } from "./acknowledge/ModalFormMemberHome";

interface AlertMarkers {
    red: any[];
    yellow: any[];
}

interface FormWarningSOSProps {
    alertMarkers?: AlertMarkers;
    dataMapAll: dataAllMap;
    dataEmergency: any;
    unitHover: number | null;
    unitClick: number | null;
    setDataEmergency: (data: any) => void;
    currentMapMode: 'preview' | 'work-it';
    onClearFilter?: () => void;
}

const FormWarningSOS = ({  dataEmergency, unitHover, unitClick, setDataEmergency, currentMapMode, onClearFilter }: FormWarningSOSProps) => {
    
    // เพิ่ม state สำหรับ animation
    const [filteredCards, setFilteredCards] = useState<Set<string>>(new Set());
    const [isReturningToFull, setIsReturningToFull] = useState<boolean>(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set()); // cards ที่ถูกซ่อนหลัง animation
    const [idMarker, setIdMarker] = useState<string>('');
    
    useEffect(() => {
        if(currentMapMode==='preview') { 
            if(unitClick) {
                console.log('🎯 New filter applied:', {
                    unitClick,
                    currentDataEmergency: dataEmergency,
                    previousDataOriginEmergency: dataOriginEmergency
                });
                
                // dataOriginEmergency จะถูกอัพเดทจาก useEffect ด้านบนเมื่อมีข้อมูลใหม่จาก API
                
                // สร้าง set ของ cards ที่จะแสดง (ที่ผ่าน filter) ทันที
                // ใช้ทั้ง unitId และ unitID เพื่อ compatible กับทั้งสองแบบ
                // ใช้ข้อมูลต้นฉบับ (dataOriginEmergency) ในการ filter เสมอ
                const emergency = dataOriginEmergency.emergency.filter((marker: any) => 
                    marker?.unitId === unitClick || marker?.unitID === unitClick
                );
                const deviceWarning = dataOriginEmergency.deviceWarning.filter((marker: any) => 
                    marker?.unitId === unitClick || marker?.unitID === unitClick
                );

                // ใช้ local state สำหรับการแสดงผลแทนการเปลี่ยน parent state
                const filteredData = {
                    emergency: emergency,
                    deviceWarning: deviceWarning
                };
                setDisplayEmergencyData(filteredData);

                console.log('🔍 Filter results:', {
                    unitClick,
                    totalEmergency: dataOriginEmergency.emergency.length,
                    filteredEmergency: emergency.length,
                    totalDeviceWarning: dataOriginEmergency.deviceWarning.length,
                    filteredDeviceWarning: deviceWarning.length,
                    emergencyUnitIds: dataOriginEmergency.emergency.map((m: any) => ({ id: m.id, unitId: m.unitId, unitID: m.unitID })),
                    deviceWarningUnitIds: dataOriginEmergency.deviceWarning.map((m: any) => ({ id: m.id, unitId: m.unitId, unitID: m.unitID }))
                });
                
                const newFilteredCards = new Set<string>();
                emergency.forEach((marker: any) => newFilteredCards.add(`red-${marker.id}`));
                deviceWarning.forEach((marker: any) => newFilteredCards.add(`yellow-${marker.id}`));
                setFilteredCards(newFilteredCards);
                setIsReturningToFull(false);
                setExpandedCards(new Set()); // ล้าง expandedCards เมื่อมี filter ใหม่
                
                // ไม่ต้องหน่วงเวลา - ให้ animation ทำงานผ่าน CSS transition เท่านั้น
                // Cards ที่ไม่ผ่าน filter จะหุบเข้าและหายไปตาม CSS duration-1500
            }
            else {
                console.log('🎯 Clearing filter:', {
                    dataOriginEmergency,
                    currentDataEmergency: dataEmergency
                });
                
                // เมื่อยกเลิก click ให้คืนข้อมูลเดิม แต่ไม่ reset filteredCards ทันที
                if (dataOriginEmergency) {
                    setDisplayEmergencyData(dataOriginEmergency);
                    
                    // สร้าง set ของ cards ใหม่ที่ต้องแสดง animation เข้ามา
                    const currentFilteredCards = new Set(filteredCards);
                    const newCards = new Set<string>();
                    
                    // หา cards ที่ไม่ได้อยู่ใน filtered set (cards ใหม่ที่ต้องแสดง)
                    dataOriginEmergency.emergency.forEach((marker: any) => {
                        const cardId = `red-${marker.id}`;
                        if (!currentFilteredCards.has(cardId)) {
                            newCards.add(cardId);
                        }
                    });
                    
                    dataOriginEmergency.deviceWarning.forEach((marker: any) => {
                        const cardId = `yellow-${marker.id}`;
                        if (!currentFilteredCards.has(cardId)) {
                            newCards.add(cardId);
                        }
                    });
                    
                    // ตั้งค่า state สำหรับ animation cards ใหม่
                    setIsReturningToFull(true);
                    
                    // หลังจาก animation เสร็จให้ reset state
                    setTimeout(() => {
                        // เพิ่ม cards ใหม่เข้าไปใน expandedCards และล้าง animation states
                        const allCards = new Set<string>();
                        dataOriginEmergency.emergency.forEach((marker: any) => allCards.add(`red-${marker.id}`));
                        dataOriginEmergency.deviceWarning.forEach((marker: any) => allCards.add(`yellow-${marker.id}`));
                        
                        setExpandedCards(allCards);
                        setIsReturningToFull(false);
                        setFilteredCards(new Set()); // ล้าง filteredCards หลังจาก animation เสร็จ
                    }, 400); // 0.4s animation duration
                } else {
                    setFilteredCards(new Set());
                    setIsReturningToFull(false);
                    // ถ้าไม่มี dataOriginEmergency ให้ใช้ข้อมูลปัจจุบัน
                    setDisplayEmergencyData(dataEmergency);
                }
            }
        }
    }, [unitClick])

    
    const [removingCards, setRemovingCards] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [dataOriginEmergency, setDataOriginEmergency] = useState<any>(dataEmergency);
    const [displayEmergencyData, setDisplayEmergencyData] = useState<any>(dataEmergency);
    
    // Sync dataOriginEmergency และ displayEmergencyData เมื่อ dataEmergency เปลี่ยนจาก parent (เฉพาะการเปลี่ยนแปลงข้อมูลจริงๆ)
    useEffect(() => {
        // อัพเดท dataOriginEmergency เสมอเมื่อมีข้อมูลใหม่จาก API
        setDataOriginEmergency(dataEmergency);
        
        // อัพเดท displayEmergencyData เฉพาะเมื่อไม่มี filter (unitClick)
        if (!unitClick) {
            setDisplayEmergencyData(dataEmergency);
        }
    }, [dataEmergency, unitClick]);
    
    // useEffect สำหรับจัดการการซ่อน cards หลัง animation จบ
    useEffect(() => {
        if (unitClick && dataOriginEmergency) {
            // เมื่อมี filter ใหม่ ให้ reset hidden cards ทันที
            setHiddenCards(new Set());
            
            // หน่วงเวลา 400ms (ตาม animation duration) แล้วซ่อน cards ที่ไม่ผ่าน filter
            const timer = setTimeout(() => {
                const newHiddenCards = new Set<string>();
                
                // หา cards ทั้งหมดที่ไม่ตรงกับ unitClick ปัจจุบัน
                dataOriginEmergency.emergency.forEach((marker: any) => {
                    if (!(marker?.unitId === unitClick || marker?.unitID === unitClick)) {
                        newHiddenCards.add(`red-${marker.id}`);
                    }
                });
                
                dataOriginEmergency.deviceWarning.forEach((marker: any) => {
                    if (!(marker?.unitId === unitClick || marker?.unitID === unitClick)) {
                        newHiddenCards.add(`yellow-${marker.id}`);
                    }
                });
                

                
                setHiddenCards(newHiddenCards);
            }, 400);
            
            return () => clearTimeout(timer);
        } else {
            // เมื่อไม่มี filter ให้แสดง cards ทั้งหมด
            setHiddenCards(new Set());
        }
    }, [unitClick, dataOriginEmergency]);
    
    // เพิ่ม useEffect สำหรับจัดการ click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // ตรวจสอบว่ามี filter อยู่และ click ไม่ได้อยู่ใน FormWarningSOS
            if (unitClick && event.target) {
                const target = event.target as Element;
                const formElement = target.closest('.form-warning-sos');
                
                // ถ้า click นอก FormWarningSOS และไม่ใช่ marker บนแผนที่
                if (!formElement && !target.closest('.leaflet-marker-icon') && !target.closest('.marker-element')) {
                    if (onClearFilter) {
                        onClearFilter();
                    }
                }
            }
        };

        if (unitClick) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [unitClick, onClearFilter]);
    const handleAcknowledgeEmergency = async (id: string) => {
        setIdMarker(id)
        setIsModalOpen(true)        
    }
    // ฟังก์ชันสำหรับตรวจสอบว่า card กำลังถูกลบหรือไม่
    const isCardRemoving = (cardId: string) => {
        return removingCards.has(cardId);
    };

    return <>
        <ModalFormMemberHome  isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} idMarker={idMarker} />
        <div className={`form-warning-sos p-4 pb-0 w-full h-full flex flex-col 
            gap-4 overflow-y-auto
            ${dataOriginEmergency && 
            dataOriginEmergency.emergency && 
            dataOriginEmergency.emergency.length === 0 ? ' justify-center' : ''}`}>
            {dataOriginEmergency && dataOriginEmergency.emergency.map((marker: any, index: any) => {
                // แปลง time เป็นรูปแบบที่ต้องการ
                const formatTime = (timeStr: string) => {
                    const date = new Date(timeStr);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                };

                console.log(marker, 'marker-event')
                let id = marker?.id
                let incident = marker?.eventProcess?.[0]?.name || '-'
                let createBy = marker?.createdByUser?.givenName || '-'
                let address = marker?.unit?.roomAddress || '-'
                let contract = marker?.createdByUser?.contact || marker?.createdByUser?.contact2 || marker?.createdByUser?.contact3 || '-'
                let time = formatTime(marker?.createdAt)
                let unitID = marker?.unitId || marker?.unitID || null




                const telNumbers = [marker?.tel1, marker?.tel2, marker?.tel3].filter(tel => tel && tel.trim()).join(', ');
                const displayName = marker?.addressUnit?.user?.givenName || marker?.name || 'Unknown';
                const displayAddress = marker?.addressUnit?.user?.roomAddress || marker?.address || marker?.roomAddress || 'N/A';
                const displayContact = marker?.addressUnit?.user?.contact || telNumbers || 'N/A';
                const cardId = `red-${marker?.id || index}`;
                const isRemoving = isCardRemoving(cardId);



                // ตรวจสอบสถานะการ filter และ animation
                const isMatchingFilter = !unitClick || (marker?.unitId === unitClick || marker?.unitID === unitClick);
                const shouldShow = isMatchingFilter; // แสดงเมื่อไม่มี filter หรือ card นี้ผ่าน filter
                const isFiltered = unitClick && isMatchingFilter; // เป็น card ที่ถูก filter เฉพาะ
                const shouldCollapse = unitClick && !isMatchingFilter; // cards ที่ต้องหุบเข้าเมื่อ filter
                const isNewCard = !unitClick && isReturningToFull && !isMatchingFilter; // cards ใหม่ที่เข้ามาหลังจากยกเลิก click
                
                // ตรวจสอบว่าควรซ่อน card นี้หรือไม่
                if (hiddenCards.has(cardId)) return null;
                
                // กำหนด animation class
                let animationClass = 'animate-fade-in'; // default
                if (isRemoving) {
                    animationClass = 'animate-collapse';
                } else if (isFiltered) {
                    animationClass = 'animate-fade-in'; // cards ที่ถูกเลือกไฮไลต์
                } else if (shouldCollapse) {
                    animationClass = 'animate-collapse'; // cards ที่ไม่ถูกเลือกหุบเข้า
                } else if (isNewCard) {
                    animationClass = 'animate-expand'; // cards ใหม่ที่เข้ามาแทรก
                } else if (expandedCards.has(cardId)) {
                    animationClass = 'animate-expand-complete'; // cards ที่ animation เสร็จแล้ว
                }
                
                return (
                    <div
                        key={cardId}
                        className={`bg-white rounded-lg shadow border-l-4 border-[#E74C3C] !w-full ${animationClass}`}
                        style={{
                            transformOrigin: 'top center',
                            zIndex: isFiltered ? 10 : 1,
                            position: 'relative'
                        }}
                    >
                        <div className="p-3">
                            <div className="text-xs mb-1"><span className="font-bold">Incident:</span> {incident}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Reported by:</span> {createBy}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Address:</span> {address}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Emergency Contact:</span> {contract}</div>
                            <div className="text-xs mb-3"><span className="font-bold">Time:</span> {time}</div>
                            <Button type="primary" block 
                            className="rounded bg-[#E74C3C] border-[#E74C3C] hover:bg-[#C0392B] hover:border-[#C0392B]" 
                            onClick={() => handleAcknowledgeEmergency(id)}>
                                Acknowledge Emergency
                            </Button>
                        </div>
                    </div>
                );
            })}

            {/* Warning Markers (Yellow) - Individual Cards */}
            {dataOriginEmergency && dataOriginEmergency.deviceWarning.map((marker: any, index: any) => {
                const formatTime = (timeStr: string) => {
                    const date = new Date(timeStr);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                };


                let incident = marker?.eventProcess?.[0]?.name || '-'
                let createBy = marker?.createdByUser?.givenName || '-'
                let address = marker?.unit?.roomAddress || '-'
                let contract = marker?.createdByUser?.contact || marker?.createdByUser?.contact2 || marker?.createdByUser?.contact3 || marker?.createdByUser?.contact4 || '-'
                let time = formatTime(marker.createdAt);





                const telNumbers = [marker.tel1, marker.tel2, marker.tel3].filter(tel => tel && tel.trim()).join(', ');
                const displayName = marker.addressUnit?.user?.givenName || marker.name || 'Unknown';
                const displayAddress = marker.addressUnit?.user?.roomAddress || marker.address || marker.roomAddress || 'N/A';
                const displayContact = marker.addressUnit?.user?.contact || telNumbers || 'N/A';
                const cardId = `yellow-${marker.id || index}`;
                const isRemoving = isCardRemoving(cardId);
                
                // ตรวจสอบสถานะการ filter และ animation
                const isMatchingFilter = !unitClick || (marker?.unitId === unitClick || marker?.unitID === unitClick);
                const shouldShow = isMatchingFilter; // แสดงเมื่อไม่มี filter หรือ card นี้ผ่าน filter
                const isFiltered = unitClick && isMatchingFilter; // เป็น card ที่ถูก filter เฉพาะ
                const shouldCollapse = unitClick && !isMatchingFilter; // cards ที่ต้องหุบเข้าเมื่อ filter
                const isNewCard = !unitClick && isReturningToFull && !isMatchingFilter; // cards ใหม่ที่เข้ามาหลังจากยกเลิก click

                // ตรวจสอบว่าควรซ่อน card นี้หรือไม่
                if (hiddenCards.has(cardId)) return null;

                // กำหนด animation class
                let animationClass = 'animate-fade-in'; // default
                if (isRemoving) {
                    animationClass = 'animate-collapse';
                } else if (isFiltered) {
                    animationClass = 'animate-fade-in'; // cards ที่ถูกเลือกไฮไลต์
                } else if (shouldCollapse) {
                    animationClass = 'animate-collapse'; // cards ที่ไม่ถูกเลือกหุบเข้า
                } else if (isNewCard) {
                    animationClass = 'animate-expand'; // cards ใหม่ที่เข้ามาแทรก
                } else if (expandedCards.has(cardId)) {
                    animationClass = 'animate-expand-complete'; // cards ที่ animation เสร็จแล้ว
                }

                return (
                    <div
                        key={cardId}
                        className={`w-full bg-white rounded-lg shadow border-l-4 border-[#F39C12] ${animationClass}`}
                        style={{
                            transformOrigin: 'top center',
                            zIndex: isFiltered ? 10 : 1,
                            position: 'relative'
                        }}
                    >
                        <div className="p-3">
                            <div className="text-xs mb-1"><span className="font-bold">Incident:</span> {incident}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Reported by:</span> {createBy}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Address:</span> {address}</div>
                            <div className="text-xs mb-1"><span className="font-bold">Emergency Contact:</span> {contract}</div>
                            <div className="text-xs mb-3"><span className="font-bold">Time:</span> {time}</div>
                            <Button type="primary" block 
                            className="rounded bg-[#E74C3C] border-[#E74C3C] hover:bg-[#C0392B] hover:border-[#C0392B]"
                            onClick={() => handleAcknowledgeEmergency(marker.id)}>
                                Acknowledge Emergency
                            </Button>
                        </div>
                    </div>
                );
            })}


            {
                dataEmergency.emergency.length === 0 && dataEmergency.deviceWarning.length === 0 && (
                    <div className="text-xs font-bold tracking-wide px-3 py-2 flex items-center  gap-2"  
                    style={{lineHeight: 'normal'}}>
                        <span>✅</span>
                        <span className="pt-1 text-xl">No emergency</span>
                    </div>
                )
            }


        </div>

        {/* CSS Animations */}
        <style>{`
          /* Base styles for all cards to prevent flickering */
          .bg-white.rounded-lg.shadow {
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes collapseCard {
            0% {
              opacity: 1;
              transform: scaleY(1) translateY(0);
              max-height: 200px;
              margin: 1rem 0;
              padding: 0.75rem;
            }
            50% {
              opacity: 0.7;
              transform: scaleY(0.8) translateY(2px);
              max-height: 160px;
            }
            100% {
              opacity: 0;
              transform: scaleY(0) translateY(4px);
              max-height: 0;
              margin: 0;
              padding: 0;
            }
          }
          
          @keyframes moveToTop {
            0% {
              transform: translateY(0) scale(1);
              z-index: 1;
            }
            50% {
              transform: translateY(-5px) scale(1.01);
              z-index: 10;
            }
            100% {
              transform: translateY(0) scale(1);
              z-index: 10;
            }
          }
          
          @keyframes expandCard {
            0% {
              opacity: 0;
              transform: scaleY(0);
              max-height: 0;
            }
            100% {
              opacity: 1;
              transform: scaleY(1);
              max-height: 300px;
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          
          .animate-collapse {
            animation: collapseCard 0.4s ease-in-out forwards;
          }
          
          .animate-move-top {
            animation: moveToTop 0.4s ease-in-out forwards;
          }
          
          .animate-expand {
            animation: expandCard 0.4s ease-out forwards;
            transform-origin: top center;
            will-change: transform, opacity, max-height;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            contain: layout style paint;
            overflow: hidden;
            animation-fill-mode: forwards;
          }
          
          /* หลัง animation เสร็จ */
          .animate-expand-complete {
            opacity: 1;
            transform: scaleY(1);
            max-height: none;
            overflow: visible;
            transition: none;
          }
        `}</style>
    </>
        ;
};

export default FormWarningSOS;