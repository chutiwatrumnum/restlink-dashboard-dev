import React from "react";
import { useState, useMemo } from "react";
import { Row, Col, Button, Card, Input, Select } from "antd";
import FormBuildingCondo from "./FormBuildingCondo";
import FormWarningSOS from "./FormWarningSOS";
import ModalFormUploadCondo from "./buildingCondo/ModalFormUploadCondo";
import Topbar from "./buildingCondo/Topbar";
import CondoMap from "./CondoMap";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import { BuildingCondo as BuildingCondoType } from "../../../stores/interfaces/SosWarning";
import { useGlobal } from "../contexts/Global";
import "./buildingCondo/alarm.css";
import AlarmIcon from "./buildingCondo/Alarm";
import { useDispatch } from "react-redux";



interface BuildingCondoProps {
  buildingPlan: {
    condoType: string;
    floor: number;
    numberOfBuilding: number;
    buildings?: any[];
  };
  showWarningCondo: boolean | null;
  handleCancelCondo: (e: React.MouseEvent<HTMLDivElement>) => void;
  projectName: string;
  dataMapAll: dataAllMap;
  onDataFloorChange?: (dataFloor: any) => void; // เพิ่ม callback สำหรับส่งข้อมูล dataFloor
} 

const BuildingCondo: React.FC<BuildingCondoProps> = ({
  buildingPlan,
  showWarningCondo,
  handleCancelCondo,
  projectName,
  dataMapAll,
  onDataFloorChange
}) => {
  if (!buildingPlan) return null;
  const { loadFirst } = useGlobal();
  const { floor, numberOfBuilding, buildings = [] } = buildingPlan;
  const dispatch = useDispatch();
  // ฟังก์ชันสร้างสีแบบ random ที่ไม่ซ้ำกัน
  const generateUniqueColors = (count: number) => {
    const usedColors = new Set<string>();
    const colors: string[] = [];
    const borderColors: string[] = [];

    while (colors.length < count) {
      // สร้างสี RGB แบบ random
      const r = Math.floor(Math.random() * 100) + 150; // 150-250 เพื่อให้ได้สีอ่อน
      const g = Math.floor(Math.random() * 100) + 150;
      const b = Math.floor(Math.random() * 100) + 150;
      
      const color = `rgb(${r}, ${g}, ${b})`;
      const colorKey = `${r}-${g}-${b}`;
      
      // ตรวจสอบว่าสีไม่ซ้ำกัน
      if (!usedColors.has(colorKey)) {
        usedColors.add(colorKey);
        colors.push(color);
        
        // สร้างสีขอบที่เข้มกว่า
        const borderR = Math.max(0, r - 50);
        const borderG = Math.max(0, g - 50);
        const borderB = Math.max(0, b - 50);
        borderColors.push(`rgb(${borderR}, ${borderG}, ${borderB})`);
      }
    }
    
    return { colors, borderColors };
  };

  // ใช้ useMemo เพื่อให้สีคงที่และไม่เปลี่ยนเมื่อ re-render
  const { buildingColors, buildingBorderColors } = useMemo(() => {
    const { colors, borderColors } = generateUniqueColors(numberOfBuilding);
    return { buildingColors: colors, buildingBorderColors: borderColors };
  }, [numberOfBuilding]);

  const nameFloor = (bIdx: number, currentFloor: number) => {
    return dataMapAll.building?.[bIdx]?.['floors']?.[currentFloor-1]?.floorName || '-'
  }

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBuildingCondo, setSelectedBuildingCondo] =
    useState<{ floor: number ; numberOfBuilding: number  }>(
      { floor: 0, numberOfBuilding: 0 }
    );
  const [uploadImage, setUploadImage] = useState<string>("");
  const [minFloor, setMinFloor] = useState<number>(1);
  const [floorRange, setFloorRange] = useState<number>(0);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

  // Helper function สำหรับแปลงหมายเลขชั้นให้แสดงผล
  const formatFloorNumber = (floorNumber: number): string => {
    if (floorNumber < 0) {
      return `B${Math.abs(floorNumber)}`;
    }
    return floorNumber.toString();
  };

  // ตรวจจับขนาดหน้าจอ
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1199); // xl breakpoint คือ 1200px, แสดงด้านล่างตั้งแต่ lg ลงไป
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const generateFloorOptions = (startFloor: number, endFloor: number) => {
    const options = [];
    for (let i = startFloor; i <= endFloor; i++) {
      options.push({
        value: i,
        label: (
          <div className="py-1 hover:bg-purple-200 transition-colors">
            ชั้น {i}
          </div>
        )
      });
    }
    return options;
  };

  const dropdownStyle = {
    dropdownMatchSelectWidth: false,
    className: 'custom-select-dropdown',
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBuildingCondo({ floor: 0, numberOfBuilding: 0 });
  };

  const chooseDetailFloor = async (numberOfBuilding: number, floor: number) => {
    let indexBuilding = numberOfBuilding - 1
    let indexFloor = floor -1
    let chooseFloor = dataMapAll.building?.[indexBuilding]?.['floors']?.[indexFloor]
    let dataFloor = {
      numberOfFloor: chooseFloor?.numberOfFloor || 0,
      floorName: chooseFloor?.floorName || '-',
      buildingName: dataMapAll.building?.[indexBuilding]?.['blockName']
    }
    
    loadFirst(chooseFloor.floorId,dataMapAll.building);
    // ใช้ callback แทน dispatch
    if (onDataFloorChange) {
      onDataFloorChange(dataFloor);
    }
    
  }

  const handleMouseEnter = (currentFloor: number, bIdx: number) => {
    // ยกเลิก timeout ที่รออยู่
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredFloor(currentFloor);
    setHoveredBuilding(bIdx);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // ตรวจสอบว่า mouse ไปยัง dropdown หรือ element ที่เกี่ยวข้องหรือไม่
    if (relatedTarget && (
      relatedTarget.closest('.custom-dropdown') ||
      // relatedTarget.closest('.relative') ||
      currentTarget.contains(relatedTarget)
    )) {
      return; // ไม่ต้องปิด dropdown
    }
    
    const timeout = setTimeout(() => {
      setHoveredFloor(null);
      setHoveredBuilding(null);
      setHoverTimeout(null);
    }, 150);
    setHoverTimeout(timeout);
  };

  // Helper function เพื่อเช็คว่าชั้นมี event หรือไม่
  const checkFloorHasEvent = (buildingIndex: number, floorNumber: number): boolean => {
    if (!buildings || !buildings[buildingIndex] || !buildings[buildingIndex].floors) {
      return false;
    }
    // หา floor object ตาม index (ใช้ floorNumber - 1 เป็น index)
    const floorIndex = floorNumber - 1;
    const floorData = buildings[buildingIndex].floors[floorIndex];
    if (!floorData) {
      return false;
    }
    const result = floorData?.isEvent === true;
    
    return result;
  };

  // Helper function เพื่อเช็คว่าในช่วงชั้นมี event หรือไม่ (สำหรับกลุ่ม)
  const checkGroupHasEvent = (buildingIndex: number, startFloor: number, endFloor: number): boolean => {
    if (!buildings || !buildings[buildingIndex] || !buildings[buildingIndex].floors) {
      return false;
    }
    
    // เช็คทุกชั้นในช่วงที่กำหนด
    for (let floor = startFloor; floor <= endFloor; floor++) {
      if (checkFloorHasEvent(buildingIndex, floor)) {
        return true; // ถ้ามีสักชั้นที่มี event ให้ return true
      }
    }
    
    return false;
  };

  const chooseFloor = (bIdx: number, startFloor: number, endFloor: number,i:number) => {
    chooseDetailFloor(bIdx + 1, startFloor+i);
    setHoveredFloor(null);
    setHoveredBuilding(null);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }

   // Component สำหรับแสดงกล่องสี่เหลี่ยมที่อาจมี AlarmIcon (ชั้นเดี่ยว)
   const FloorBox = ({ buildingIndex, floorNumber }: { buildingIndex: number; floorNumber: number }) => {
     const hasEvent = checkFloorHasEvent(buildingIndex, floorNumber);
     
     return (
       <div className="w-4 h-4 bg-white border border-gray-300 flex items-center justify-center">
         
       </div>
     );
   };

   // Component สำหรับแสดงกล่องสี่เหลี่ยมของกลุ่ม
   const GroupFloorBox = ({ buildingIndex, startFloor, endFloor }: { buildingIndex: number; startFloor: number; endFloor: number }) => {
   const hasGroupEvent = checkGroupHasEvent(buildingIndex, startFloor, endFloor);
     
     return (
       <div className="w-4 h-4 bg-white border border-gray-300 flex items-center justify-center">
       </div>
     );
   };

  const renderFloor = (currentFloor: number, bIdx: number) => {
    // ใช้จำนวนชั้นจริงของตึกนี้
    const currentBuildingFloors = buildings[bIdx]?.floors?.length || floor;
    
    // คำนวณข้อมูลกลุ่มแบบ dynamic
    const getFloorGroupInfo = (checkFloor: number, totalFloor: number) => {
      if (checkFloor < minFloor) return { inGroup: false, groupIndex: -1, isGroupStart: false, isRemainingFloor: false, remainingFloorCount: 0 };
      
      const floorFromMin = checkFloor - minFloor;
      const groupIndex = Math.floor(floorFromMin / floorRange);
      const isGroupStart = floorFromMin % floorRange === 0;
      
      // คำนวณจำนวนกลุ่มเต็มที่สามารถทำได้จากชั้นทั้งหมด
      const totalAvailableFloors = totalFloor - minFloor + 1;
      const totalGroupableFloors = Math.floor(totalAvailableFloors / floorRange) * floorRange;
      const maxGroupIndex = Math.floor((totalGroupableFloors - 1) / floorRange);
      const remainingAfterGroups = totalAvailableFloors - totalGroupableFloors;
      
      return {
        inGroup: floorFromMin < totalGroupableFloors,
        groupIndex,
        isGroupStart: isGroupStart && floorFromMin < totalGroupableFloors,
        isRemainingFloor: checkFloor > minFloor + totalGroupableFloors - 1,
        remainingFloorCount: remainingAfterGroups
      };
    };

    const floorInfo = getFloorGroupInfo(currentFloor, currentBuildingFloors);
    const totalFloorInfo = getFloorGroupInfo(currentBuildingFloors, currentBuildingFloors);
    const isHovered = hoveredBuilding === bIdx && hoveredFloor === currentFloor;
    const buildingColor = buildingColors[bIdx % buildingColors.length];
    const buildingBorderColor = buildingBorderColors[bIdx % buildingBorderColors.length];

    // ตรวจสอบว่าชั้นนี้ควรแสดงหรือไม่
    const shouldShowFloor = () => {
      // ชั้นที่ไม่อยู่ในกลุ่ม = แสดง
      if (!floorInfo.inGroup && !floorInfo.isRemainingFloor) return true;
      
      // ชั้นแรกของกลุ่ม = แสดง (จะเป็น dropdown)
      if (floorInfo.inGroup && floorInfo.isGroupStart) return true;
      
      // ชั้นที่เหลือ - ถ้ามีมากกว่า 1 ชั้น ให้แสดงเป็น dropdown (ณ ชั้นแรกของกลุ่มที่เหลือ)
      if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1) {
        // แสดงที่ชั้นแรกของกลุ่มที่เหลือ
        const firstRemainingFloor = minFloor + Math.floor((currentBuildingFloors - minFloor + 1) / floorRange) * floorRange;
        if (currentFloor === firstRemainingFloor) return true;
      }
      
      // ชั้นที่เหลือ - ถ้าเหลือแค่ 1 ชั้น ให้แสดงเป็นชั้นเดี่ยว
      if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) === 1) return true;
      
      return false;
    };

    if (!shouldShowFloor()) return null;

    // dropdown สำหรับชั้นที่เหลือ (มากกว่า 1 ชั้น)
    if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1) {
      const firstRemainingFloor = minFloor + Math.floor((currentBuildingFloors - minFloor + 1) / floorRange) * floorRange;
      if (currentFloor === firstRemainingFloor) {
      const startFloor = minFloor + Math.floor((currentBuildingFloors - minFloor + 1) / floorRange) * floorRange;
      
      return (
        <div 
          className="relative hover-container"
          style={{ height: '30px' }}
          onMouseEnter={() => handleMouseEnter(currentFloor, bIdx)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center px-4 h-full min-w-[200px]">
            <GroupFloorBox buildingIndex={bIdx} startFloor={startFloor} endFloor={currentBuildingFloors} />
            <GroupFloorBox buildingIndex={bIdx} startFloor={startFloor} endFloor={currentBuildingFloors} />
            <div className="w-20 text-center font-bold text-[#222222] text-xl mx-auto">
                            <div className="flex justify-center items-center gap-2">
                <span>
                  {formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[startFloor-1]?.numberOfFloor || startFloor)}
                </span>
                <span className="flex items-center justify-center">
                  {checkGroupHasEvent(bIdx, startFloor, currentBuildingFloors) && <AlarmIcon nameAlarm={"ถึง"} />}
                  {!checkGroupHasEvent(bIdx, startFloor, currentBuildingFloors) && 'ถึง'}
                </span>
                <span>
                  {formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[currentBuildingFloors-1]?.numberOfFloor || currentBuildingFloors)}
                </span>
              </div>
            </div>
            <GroupFloorBox buildingIndex={bIdx} startFloor={startFloor} endFloor={currentBuildingFloors} />
            <GroupFloorBox buildingIndex={bIdx} startFloor={startFloor} endFloor={currentBuildingFloors} />
          </div>
          {isHovered && (
            <div 
              className="absolute w-full shadow-lg custom-dropdown z-50"
              style={{ 
                backgroundColor: buildingColor,
                ...(isMobileOrTablet 
                  ? { top: '100%', marginTop: '8px', left: '0' }
                  : { top: '0', left: '100%', marginLeft: '8px' }
                )
              }}
              onMouseEnter={() => handleMouseEnter(currentFloor, bIdx)}
              onMouseLeave={handleMouseLeave}
            >
              {Array.from({ length: totalFloorInfo.remainingFloorCount || 0 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center px-4 cursor-pointer border-b-2 border-white last:border-b-0"
                  style={{ 
                    height: '32px',
                    backgroundColor: buildingColor
                  }}
                  onClick={() => chooseDetailFloor(bIdx + 1, startFloor + i)}
                >
                      <FloorBox buildingIndex={bIdx} floorNumber={startFloor + i} />
                      <FloorBox buildingIndex={bIdx} floorNumber={startFloor + i} />
                        <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
                          {checkGroupHasEvent(bIdx, startFloor, currentBuildingFloors) && checkFloorHasEvent(bIdx, startFloor + i) && 
                          <AlarmIcon nameAlarm={formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[startFloor + i - 1]?.numberOfFloor || (startFloor + i))} />}
                          {!(checkGroupHasEvent(bIdx, startFloor, currentBuildingFloors) && checkFloorHasEvent(bIdx, startFloor + i)) && formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[startFloor + i - 1]?.numberOfFloor || (startFloor + i))}
                        </div>
                      <FloorBox buildingIndex={bIdx} floorNumber={startFloor + i} />
                      <FloorBox buildingIndex={bIdx} floorNumber={startFloor + i} />
                    </div>
                ))}
              </div>
          )}
        </div>
      );
      }
    }
    
    // dropdown สำหรับกลุ่มปกติ
    else if (floorInfo.inGroup && floorInfo.isGroupStart) {
      const groupStartFloor = minFloor + (floorInfo.groupIndex * floorRange);
      const groupEndFloor = groupStartFloor + floorRange - 1;
      
      return (
        <div 
          className="relative hover-container"
          style={{ height: '32px' }}
          onMouseEnter={() => handleMouseEnter(currentFloor, bIdx)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center px-4 h-full min-w-[200px]">
            <GroupFloorBox buildingIndex={bIdx} startFloor={groupStartFloor} endFloor={groupEndFloor} />
            <GroupFloorBox buildingIndex={bIdx} startFloor={groupStartFloor} endFloor={groupEndFloor} />
            <div className="w-20 text-center font-bold text-[#222222] text-xl mx-auto">
                              <div className="flex justify-center items-center gap-2"> 
                  <span>
                    {formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[groupStartFloor-1]?.numberOfFloor ||  groupStartFloor)}
                  </span>
                  <span className="flex items-center justify-center">
                    {checkGroupHasEvent(bIdx, groupStartFloor, groupEndFloor) && <AlarmIcon nameAlarm={"ถึง"} />}
                    {!checkGroupHasEvent(bIdx, groupStartFloor, groupEndFloor) && 'ถึง'}
                  </span>
                  <span>
                    {nameFloor(bIdx, groupEndFloor) || '-'}
                  </span>
                </div>
              {/* {`${formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[groupStartFloor-1]?.numberOfFloor || 
              groupStartFloor)}  ${formatFloorNumber(dataMapAll.building?.[bIdx]?.['floors']?.[groupEndFloor-1]?.
                numberOfFloor || 
                groupEndFloor)}`} */}
            </div>
            <GroupFloorBox buildingIndex={bIdx} startFloor={groupStartFloor} endFloor={groupEndFloor} />
            <GroupFloorBox buildingIndex={bIdx} startFloor={groupStartFloor} endFloor={groupEndFloor} />
          </div>
          {isHovered && (
            <div 
              className="absolute w-full shadow-lg custom-dropdown z-50"
              style={{ 
                backgroundColor: buildingColor,
                ...(isMobileOrTablet 
                  ? { top: '100%', marginTop: '8px', left: '0' }
                  : { top: '0', left: '100%', marginLeft: '8px' }
                )
              }}
              onMouseEnter={() => handleMouseEnter(currentFloor, bIdx)}
              onMouseLeave={handleMouseLeave}
            >
              {Array.from({ length: floorRange }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center px-4 cursor-pointer border-b-2 border-white last:border-b-0"
                  style={{ 
                    height: '32px',
                    backgroundColor: buildingColor
                  }}
                  onClick={() => chooseFloor(bIdx, groupStartFloor, groupEndFloor,i)}
                >
                  <FloorBox buildingIndex={bIdx} floorNumber={groupStartFloor + i} />
                  <FloorBox buildingIndex={bIdx} floorNumber={groupStartFloor + i} />
                  <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
                    {checkGroupHasEvent(bIdx, groupStartFloor, groupEndFloor) && checkFloorHasEvent(bIdx, groupStartFloor + i) && <AlarmIcon nameAlarm={nameFloor(bIdx, groupStartFloor + i) || '-'} />}
                    {!(checkGroupHasEvent(bIdx, groupStartFloor, groupEndFloor) && checkFloorHasEvent(bIdx, groupStartFloor + i)) && (nameFloor(bIdx, groupStartFloor + i) || '-')}
                  </div>
                  <FloorBox buildingIndex={bIdx} floorNumber={groupStartFloor + i} />
                  <FloorBox buildingIndex={bIdx} floorNumber={groupStartFloor + i} />
            </div>
          ))}
            </div>
          )}
        </div>
      );
    }
    
    // ชั้นปกติ (ไม่อยู่ในกลุ่ม หรือเป็นชั้นเดี่ยวที่เหลือ)
    else {
      return (
        <div 
          className="flex justify-center items-center px-4 w-full min-w-[200px]"
          style={{ height: '30px' }}
          onClick={() => chooseDetailFloor(bIdx + 1, currentFloor)}
        >
          <FloorBox buildingIndex={bIdx} floorNumber={currentFloor} />
          <FloorBox buildingIndex={bIdx} floorNumber={currentFloor} />
          <div 
          onClick = {()=>{
            console.log(dataMapAll.building?.[bIdx]?.['floors']?.[currentFloor-1],'test')
          }}
          className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
            
            {
              checkFloorHasEvent(bIdx, currentFloor) && 
              <AlarmIcon  nameAlarm={nameFloor(bIdx, currentFloor)}/>
            }
            {
              !checkFloorHasEvent(bIdx, currentFloor) && (nameFloor(bIdx, currentFloor) || '-')
            }
          </div>
          <FloorBox buildingIndex={bIdx} floorNumber={currentFloor} />
          <FloorBox buildingIndex={bIdx} floorNumber={currentFloor} />
        </div>
      );
    }
  };

  if (uploadImage) {
    return <>
      <CondoMap  
        buildingPlan={buildingPlan} 
        uploadImage={uploadImage}  
        handleCancelCondo={handleCancelCondo} 
        projectName={projectName}
      />
    </>;
  }

  return (
    <>
      <style>
        {`
          .custom-dropdown {
            animation: slideIn 0.2s ease-out;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <ModalFormUploadCondo
        isOpen={isModalOpen}
        setUploadImage={setUploadImage}
        onClose={closeModal}
        selectedBuildingCondo={selectedBuildingCondo}
        dataMapAll={dataMapAll}
      />

      <Topbar 
        condoType={buildingPlan.condoType} 
        floor={buildingPlan.floor}
        projectName={projectName}
      />
      <div className="px-4 py-2  shadow-sm bg-gray-100">
        <div className="flex gap-4 items-center">
          <div className="hidden gap-2 ">
            <span className="text-gray-700">เลือกชั้นเริ่มต้น</span>
            <Input
              disabled={true}
              type="number"
              value={minFloor}
              onChange={(e) => setMinFloor(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>
          <div className="flex justify-center items-center gap-2">
            <span className="text-gray-700">จำนวนชั้นที่แสดงต่อกลุ่ม:</span>
            <select
            
              value={floorRange}
              onChange={(e) => {
                const value = e.target.value === "all" ? 0 : Number(e.target.value);
                setFloorRange(value);
              }}
              className="w-[100px] h-8 rounded border border-[#d9d9d9] px-2 bg-white"
            >
              <option value="all">All</option>
              {[...Array(9)].map((_, idx) => (
                <option key={idx + 2} value={idx + 2}>{idx + 2}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* <div className="px-4 py-2 bg-white shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">
              การจัดกลุ่มชั้นจะเริ่มที่ชั้นบนสุดเสมอของทุกๆตึก
            </span>
          </div>
        </div>
      </div>


      <div className="px-4 py-2 bg-white shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">
              การจัดกลุ่มค่าเป็น 0 = แสดงข้อมูลทุกๆชั้นแบบไม่จัดกลุ่ม
            </span>
          </div>
        </div>
      </div>


      <div className="px-4 py-2 bg-white shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">
              การจัดกลุ่มค่าเป็น 2 ขึ้นไป = แสดงข้อมูลทุกๆชั้นแบบจัดกลุ่ม
            </span>

          </div>
        </div>
      </div> */}



      <Row gutter={0} className="min-h-screen bg-white">
        <Col span={24} className="h-full bg-gray-100">
          
                      <div className=" p-10 bg-white ">
                            <Row justify="center" gutter={[16, 16]}>
                {Array.from({ length: numberOfBuilding }).map((_, bIdx) => (
                  <React.Fragment key={bIdx}>
                    <Col 
                      xs={24}
                      sm={12}
                      md={12}
                      lg={6}
                      xl={6}
                      className="flex justify-center"
                    >
                    <div className="flex flex-col items-center h-full justify-end">
                      {/* Building Floors */}
                      <div
                        className="cursor-pointer h-auto"
                        style={{ 
                          backgroundColor: buildingColors[bIdx % buildingColors.length]
                        }}
                      >
                        <div className="flex flex-col flex-wrap items-center">
                          {(() => {
                            // ใช้จำนวนชั้นจริงของตึกนี้
                            const currentBuildingFloors = buildings[bIdx]?.floors?.length || floor;
                            // คำนวณข้อมูลกลุ่มแบบ dynamic (ย้ายมาจาก renderFloor function)
                            const getFloorGroupInfo = (checkFloor: number, totalFloor: number) => {
                              if (checkFloor < minFloor) return { inGroup: false, groupIndex: -1, isGroupStart: false, isRemainingFloor: false, remainingFloorCount: 0 };
                              
                              const floorFromMin = checkFloor - minFloor;
                              const groupIndex = Math.floor(floorFromMin / floorRange);
                              const isGroupStart = floorFromMin % floorRange === 0;
                              
                              // คำนวณจำนวนกลุ่มเต็มที่สามารถทำได้จากชั้นทั้งหมด
                              const totalAvailableFloors = totalFloor - minFloor + 1;
                              const totalGroupableFloors = Math.floor(totalAvailableFloors / floorRange) * floorRange;
                              const maxGroupIndex = Math.floor((totalGroupableFloors - 1) / floorRange);
                              const remainingAfterGroups = totalAvailableFloors - totalGroupableFloors;
                              
                              return {
                                inGroup: floorFromMin < totalGroupableFloors,
                                groupIndex,
                                isGroupStart: isGroupStart && floorFromMin < totalGroupableFloors,
                                isRemainingFloor: checkFloor > minFloor + totalGroupableFloors - 1,
                                remainingFloorCount: remainingAfterGroups
                              };
                            };
                            
                            const totalFloorInfo = getFloorGroupInfo(currentBuildingFloors, currentBuildingFloors);
                            const renderedFloors = [];
                            
                            // สร้าง array ของชั้นทั้งหมดแล้ว reverse เพื่อแสดงจากล่างขึ้นบน
                            const allFloors = Array.from({length: currentBuildingFloors}, (_, i) => i + 1);
                            
                            for (let i = 0; i < currentBuildingFloors; i++) {
                              const currentFloor = allFloors[i]; // ชั้นที่ 1, 2, 3, ...
                              
                              // เช็คว่าชั้นนี้ถูกจัดกลุ่มแล้วหรือไม่
                              const floorInfo = getFloorGroupInfo(currentFloor, currentBuildingFloors);
                              
                              // ถ้าชั้นนี้อยู่ในกลุ่มแต่ไม่ใช่ชั้นแรกของกลุ่ม ให้ skip
                              if (floorInfo.inGroup && !floorInfo.isGroupStart) {
                                continue;
                              }
                              
                              // ถ้าเป็นชั้นที่เหลือและไม่ใช่ชั้นแรกของกลุ่มที่เหลือ ให้ skip (เพราะจะแสดงใน dropdown ของชั้นแรก)
                              if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1) {
                                const firstRemainingFloor = minFloor + Math.floor((currentBuildingFloors - minFloor + 1) / floorRange) * floorRange;
                                if (currentFloor !== firstRemainingFloor) {
                                  continue;
                                }
                              }
                              
                              const currentFloorElement = renderFloor(currentFloor, bIdx);
                              
                              if (currentFloorElement) {
                                renderedFloors.push(
                                  <React.Fragment key={currentFloor}>
                                    {renderedFloors.length > 0 && (
                                      <div className="h-[2px] w-full bg-white" />
                                    )}
                                    {currentFloorElement}
                                  </React.Fragment>
                                );
                              }
                            }
                            
                            return renderedFloors;
                          })()}
                        </div>
                      </div>
                      
                      {/* Building Name - อยู่ด้านล่างของตึก */}
                      <div className="text-center font-bold text-lg text-[#222222] mt-3">
                        Building {buildings[bIdx]?.blockName || '-'}
                      </div>
                    </div>
                  </Col>
              {/* เพิ่มเส้นแบ่งหลังจากทุก 4 ตึก */}
              {(bIdx + 1) % 4 === 0 && bIdx < numberOfBuilding - 1 && (
                <Col span={24}>
                  <div className="w-full border-b-2 border-gray-300 my-4"></div>
                </Col>
              )}
            </React.Fragment>
            ))}
            </Row>
          </div>
        </Col>
      </Row> 
    </>
  );
};

export default BuildingCondo;
