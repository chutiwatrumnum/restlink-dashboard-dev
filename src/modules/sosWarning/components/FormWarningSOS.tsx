import { useState, useEffect } from "react";
import { Button, message } from "antd";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { ModalFormMemberHome } from "./acknowledge/ModalFormMemberHome";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGlobal } from "../contexts/Global";
// import { RootState } from "../../../stores/models";
import { getSosWarningById, receiveCast } from "../service/api/SOSwarning";
import { usePermission } from "../../../utils/hooks/usePermission";
import { RootState } from "../../../stores";
import FailedModal from "../../../components/common/FailedModal";

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
    dataSelectPlan: any;

}
const FormWarningSOS = ({ dataEmergency, unitHover, unitClick, setDataEmergency, 
    currentMapMode, onClearFilter, dataSelectPlan }: FormWarningSOSProps) => {
    const dispatch = useDispatch();
    const permissions = useSelector(
        (state: RootState) => state.common?.permission
    );
    // const projectData = useSelector((state: RootState) => state.setupProject.projectData);
    const step = useSelector((state: RootState) => state.sosWarning.step);
    const { access } = usePermission(permissions);
    // const navigate = useNavigate();
    const { uploadedImage, setStatusAcknowledge } = useGlobal();
    // เพิ่ม state สำหรับ animation
    const [filteredCards, setFilteredCards] = useState<Set<string>>(new Set());
    const [isReturningToFull, setIsReturningToFull] = useState<boolean>(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set()); // cards ที่ถูกซ่อนหลัง animation
    const [idMarker, setIdMarker] = useState<string>('');
    
    // ฟิลเตอร์จากการ์ดสรุปด้านบน: all | red(emergency) | yellow(deviceWarning)
    const [summaryFilter, setSummaryFilter] = useState<'all' | 'red' | 'yellow'>('all');
    const toggleSummaryFilter = (type: 'red' | 'yellow') => {
        setSummaryFilter((prev) => (prev === type ? 'all' : type));
    };


    useEffect(() => {
        if(currentMapMode==='preview') { 
            if(unitClick) {                
                
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
    const [dataOriginEmergency, setDataOriginEmergency] = useState<any>();
    const [displayEmergencyData, setDisplayEmergencyData] = useState<any>();

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
            if ((unitClick || summaryFilter !== 'all') && event.target) {
                const target = event.target as Element;
                const formElement = target.closest('.form-warning-sos');
                const isSummaryCard = target.closest('.summary-filter-cards');

                // ถ้า click นอก FormWarningSOS/summary cards และไม่ใช่ marker บนแผนที่
                if (!formElement && !isSummaryCard && !target.closest('.leaflet-marker-icon') && !target.closest('.marker-element')) {
                    if (onClearFilter) {
                        onClearFilter();
                    }
                    setSummaryFilter('all');
                }
            }
        };

        if (unitClick || summaryFilter !== 'all') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [unitClick, onClearFilter, summaryFilter]);
    const handleAcknowledgeEmergency = async (marker: any, type: string) => {        


        let data = await getSosWarningById(marker.id)
        if(!data.status){
            FailedModal(data.message,900)
            return
        }
        if(data.status && data?.result?.sosEventInfo){
            await dispatch.sosWarning.setStep(data.result.sosEventInfo.step)
        }
        data.result = {
            ...data.result,
            type: type
        }
        let stepCurrent = marker.step || data.result.sosEventInfo.step
        // return
        if(stepCurrent >= 1){
            setStatusAcknowledge(true)
            await dispatch.sosWarning.setDataEmergencyDetail(data.result)
            return
        }
        if (data.status) {
            let dataReceiveCast = {
                status: false,
                message: 'Error',
                result: {
                    step: 0,
                    is_completed: false,
                    event_help_id: null,
                    sosEventLog: {
                        createdAt: null
                    }
                }
            }
            if(data?.result?.sosEventInfo.step < 1) {
                dataReceiveCast = await receiveCast(marker.id)
                if(!dataReceiveCast.status){
                    FailedModal(dataReceiveCast.message,900)
                    return
                }
            }
            

            if(dataReceiveCast.status){
                await dispatch.sosWarning.setStep(dataReceiveCast?.result?.step)
                data.result.sosEventInfo.step = dataReceiveCast?.result?.step
                data.result.sosEventInfo.isCompleted = dataReceiveCast?.result?.is_completed
                data.result.sosEventInfo.event_help_id = dataReceiveCast?.result?.event_help_id
                data.result.sosEventInfo.sosEventLogs = [dataReceiveCast?.result?.sosEventLog] || []
                await dispatch.sosWarning.setDataEmergencyDetail(data.result)
                setStatusAcknowledge(true)
            }
        } 
        else {
            FailedModal(data?.message,900)
            return
        }   
    }
    // ฟังก์ชันสำหรับตรวจสอบว่า card กำลังถูกลบหรือไม่
    const isCardRemoving = (cardId: string) => {
        return removingCards.has(cardId);
    };

    return <>
        <ModalFormMemberHome 
            isModalOpen={isModalOpen} 
            setIsModalOpen={setIsModalOpen} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} idMarker={idMarker} 
        />
        <div>
            {/* Summary Cards */}
            <div className="summary-filter-cards flex justify-between gap-4  p-4">
                {/* SOS Card */}
                <div
                    onClick={() => toggleSummaryFilter('red')}
                    className={`bg-white rounded-2xl  border border-gray-100 flex-1 cursor-pointer ${summaryFilter === 'red' ? 'ring-2 ring-blue-500' : ''}`}
                >
                    <div className="bg-[#D73232] text-white px-4 py-2 rounded-t-2xl text-center">
                        <span className=" font-semibold text-sm">SOS</span>
                    </div>
                    <div className="p-6 flex justify-center items-center">
                        <div className="text-4xl font-bold text-red-600 ">
                            {dataEmergency?.emergency?.length || 0}
                        </div>
                    </div>
                </div>

                {/* Device Issue Card */}
                <div
                    onClick={() => toggleSummaryFilter('yellow')}
                    className={`bg-white rounded-2xl  border border-gray-100 flex-1 cursor-pointer ${summaryFilter === 'yellow' ? 'ring-2 ring-blue-500' : ''}`}
                >
                    <div className="bg-[#FFD54F] text-white px-4 py-2 rounded-t-2xl text-center">
                        <span className=" whitespace-nowrap text-[#002C55]  font-semibold text-sm">Device has an issue</span>
                    </div>
                    <div className="p-6 flex justify-center items-center">
                        <div className="text-4xl font-bold text-blue-900 ">
                        {dataEmergency?.deviceWarning?.length || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className={`
            form-warning-sos p-4 pt-0 pb-4 
            w-full h-full flex flex-col 
            gap-4 overflow-y-auto 
            max-h-[calc(100vh-100px)]
            mb-4 sm:mb-6 md:mb-8 lg:mb-0`}>


            {dataOriginEmergency && dataOriginEmergency.emergency.map((marker: any, index: any) => {
                if (summaryFilter === 'yellow') return null; // กรองเมื่อเลือกเฉพาะสีเหลือง
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
                let id = marker?.id
                let incident = marker?.type?.nameEn || '-'
                // marker?.eventProcess?.[0]?.name || '-'
                let stepName = marker.stepName.nameEn
                // let incident = marker?.type.nameEn || '-'
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
                            <div className="text-md mb-3"><span className="font-medium">Incident:</span> {incident}</div>
                            <div className="text-md  mb-3"><span className="font-medium">Reported by:</span> {createBy}</div>
                            <div className="text-md  mb-3"><span className="font-medium">Address:</span> {address}</div>
                            <div className="text-md  mb-3"><span className="font-medium">Emergency Contact:</span> {contract}</div>
                            <div className="text-md  mb-3"><span className="font-medium">Time:</span> {time}</div>
                            <Button 
                            type="primary" 
                            block
                            disabled={!access('sos_security', 'edit')}
                                className="rounded bg-[#E74C3C] border-[#E74C3C] hover:bg-[#C0392B] hover:border-[#C0392B]"
                                onClick={() => handleAcknowledgeEmergency(marker, 'emergency')}>
                                Acknowledge Emergency
                            </Button>
                        </div>
                    </div>
                );
            })}

            {/* Warning Markers (Yellow) - Individual Cards */}
            {dataOriginEmergency && dataOriginEmergency.deviceWarning.map((marker: any, index: any) => {
                if (summaryFilter === 'red') return null; // กรองเมื่อเลือกเฉพาะสีแดง
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

                let stepName = marker.stepName.nameEn
                let incident = marker?.type?.nameEn || '-'
                // marker?.eventProcess?.[0]?.name || '-'
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
                            <div className="text-md mb-1"><span className="font-medium">Incident:</span> {incident}</div>
                            <div className="text-md mb-1"><span className="font-medium">Reported by:</span> {createBy}</div>
                            <div className="text-md mb-1"><span className="font-medium">Address:</span> {address}</div>
                            <div className="text-md mb-1"><span className="font-medium">Emergency Contact:</span> {contract}</div>
                            <div className="text-md mb-3"><span className="font-medium">Time:</span> {time}</div>
                            <Button type="primary" block
                            disabled={!access('sos_security', 'edit')}
                                className="rounded bg-[#E74C3C] border-[#E74C3C] hover:bg-[#C0392B] hover:border-[#C0392B]"
                                onClick={() => handleAcknowledgeEmergency(marker, 'DeviceWarning')}>
                                Acknowledge Emergency
                            </Button>
                        </div>
                    </div>
                );
            })}
            {
                ((summaryFilter === 'all' && dataEmergency.emergency.length === 0 && dataEmergency.deviceWarning.length === 0)
                || (summaryFilter === 'red' && dataEmergency.emergency.length === 0)
                || (summaryFilter === 'yellow' && dataEmergency.deviceWarning.length === 0)) && (
                    <div className="text-xs font-bold tracking-wide px-3 py-2 flex justify-center items-center  gap-2"
                        style={{ lineHeight: 'normal' }}>
                        <span className="pt-1 text-xl whitespace-nowrap">No emergency</span>
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