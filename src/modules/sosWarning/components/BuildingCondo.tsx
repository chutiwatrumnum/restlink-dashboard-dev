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

interface BuildingCondoProps {
  buildingPlan: {
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  };
  showWarningCondo: boolean | null;
  handleCancelCondo: (e: React.MouseEvent<HTMLDivElement>) => void;
  projectName: string;
  dataMapAll: dataAllMap;
} 

const BuildingCondo: React.FC<BuildingCondoProps> = ({
  buildingPlan,
  showWarningCondo,
  handleCancelCondo,
  projectName,
  dataMapAll
}) => {
  if (!buildingPlan) return null;
  const { floor, numberOfBuilding } = buildingPlan;

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

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBuildingCondo, setSelectedBuildingCondo] =
    useState<{ floor: number ; numberOfBuilding: number  }>(
      { floor: 0, numberOfBuilding: 0 }
    );
  const [uploadImage, setUploadImage] = useState<string>("");
  const [minFloor, setMinFloor] = useState<number>(6);
  const [floorRange, setFloorRange] = useState<number>(3);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

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

  const openModal = (numberOfBuilding: number, floor: number) => {
    setSelectedBuildingCondo({
      numberOfBuilding: numberOfBuilding,
      floor: floor
    });
    setIsModalOpen(true);
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

  const renderFloor = (currentFloor: number, bIdx: number) => {
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

    const floorInfo = getFloorGroupInfo(currentFloor, floor);
    const totalFloorInfo = getFloorGroupInfo(floor, floor);
    const isHovered = hoveredBuilding === bIdx && hoveredFloor === currentFloor;
    const buildingColor = buildingColors[bIdx % buildingColors.length];
    const buildingBorderColor = buildingBorderColors[bIdx % buildingBorderColors.length];

    // ตรวจสอบว่าชั้นนี้ควรแสดงหรือไม่
    const shouldShowFloor = () => {
      // ชั้นที่ไม่อยู่ในกลุ่ม = แสดง
      if (!floorInfo.inGroup && !floorInfo.isRemainingFloor) return true;
      
      // ชั้นแรกของกลุ่ม = แสดง (จะเป็น dropdown)
      if (floorInfo.inGroup && floorInfo.isGroupStart) return true;
      
      // ชั้นที่เหลือ - ถ้ามีมากกว่า 1 ชั้น ให้แสดงเป็น dropdown
      if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1 && currentFloor === floor) return true;
      
      // ชั้นที่เหลือ - ถ้าเหลือแค่ 1 ชั้น ให้แสดงเป็นชั้นเดี่ยว
      if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) === 1) return true;
      
      return false;
    };

    if (!shouldShowFloor()) return null;

    // dropdown สำหรับชั้นที่เหลือ (มากกว่า 1 ชั้น)
    if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1 && currentFloor === floor) {
      const startFloor = minFloor + Math.floor((floor - minFloor + 1) / floorRange) * floorRange;
      
      return (
        <div 
          className="relative hover-container"
          style={{ height: '30px' }}
          onMouseEnter={() => handleMouseEnter(currentFloor, bIdx)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center px-4 h-full">
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-20 text-center font-bold text-[#222222] text-xl mx-auto">
              {`${startFloor}-${floor}`}
            </div>
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-4 h-4 bg-white border border-gray-300" />
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
                  onClick={() => {
                    openModal(bIdx + 1, startFloor + i);
                    setHoveredFloor(null);
                    setHoveredBuilding(null);
                    if (hoverTimeout) {
                      clearTimeout(hoverTimeout);
                      setHoverTimeout(null);
                    }
                  }}
                >
                      <div className="w-4 h-4 bg-white border border-gray-300" />
                      <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
                    {startFloor + i}
                  </div>
                      <div className="w-4 h-4 bg-white border border-gray-300" />
                      <div className="w-4 h-4 bg-white border border-gray-300" />
                    </div>
                ))}
              </div>
          )}
        </div>
      );
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
          <div className="flex items-center px-4 h-full">
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-20 text-center font-bold text-[#222222] text-xl mx-auto">
              {`${groupStartFloor}-${groupEndFloor}`}
            </div>
            <div className="w-4 h-4 bg-white border border-gray-300" />
            <div className="w-4 h-4 bg-white border border-gray-300" />
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
                  onClick={() => {
                    openModal(bIdx + 1, groupStartFloor + i);
                    setHoveredFloor(null);
                    setHoveredBuilding(null);
                    if (hoverTimeout) {
                      clearTimeout(hoverTimeout);
                      setHoverTimeout(null)                    }
                  }}
                >
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
                    {groupStartFloor + i}
                  </div>
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-4 h-4 bg-white border border-gray-300" />
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
          className="flex items-center px-4 w-full"
          style={{ height: '30px' }}
          onClick={() => openModal(bIdx + 1, currentFloor)}
        >
          <div className="w-4 h-4 bg-white border border-gray-300" />
          <div className="w-4 h-4 bg-white border border-gray-300" />
          <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">
            {currentFloor}
          </div>
          <div className="w-4 h-4 bg-white border border-gray-300" />
          <div className="w-4 h-4 bg-white border border-gray-300" />
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
      <button onClick={() => {
        console.log(dataMapAll,'dataMapAll')
      }}>
        dataMapAll
      </button>
      <div className="px-4 py-2 bg-white shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">กลุ่มที่ 1 เริ่มจากชั้น:</span>
            <Input
              type="number"
              value={minFloor}
              onChange={(e) => setMinFloor(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">ระยะชั้น:</span>
            <Input
              type="number"
              value={floorRange}
              onChange={(e) => setFloorRange(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>
        </div>
      </div>
      <div>
        floorRange: {floorRange}
        numberOfBuilding: {numberOfBuilding}
      </div>
      <Row gutter={0} className="min-h-screen bg-gray-100">
        <Col span={24} className="h-full bg-gray-100">
          <div className="py-4 min-h-screen px-6 sm:px-6 md:px-6 lg:px-8 xl:px-35 2xl:px-35 bg-gray-100">
            <Row gutter={[16, 16]} justify="start">
              {Array.from({ length: numberOfBuilding }).map((_, bIdx) => (
                <Col 
                  key={bIdx}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={6}
                  className="flex justify-center"
                >
                  <div className="flex flex-col items-center">
                <div
                  className="cursor-pointer h-auto"
                  style={{ 
                    backgroundColor: buildingColors[bIdx % buildingColors.length]
                  }}
                >
                  <div className="flex flex-col flex-wrap items-center">
                    {[...Array(floor)].map((_, i) => {
                      const currentFloor = floor - i;
                      
                      // ตรวจสอบว่าชั้นจะแสดงหรือไม่โดยใช้ logic เดียวกันกับ renderFloor
                      const willShowFloor = (checkFloor: number) => {
                        // ใช้ logic เดียวกันกับใน renderFloor
                        const getFloorGroupInfo = (floor: number, totalFloor: number) => {
                          if (floor < minFloor) return { inGroup: false, groupIndex: -1, isGroupStart: false, isRemainingFloor: false, remainingFloorCount: 0 };
                          
                          const floorFromMin = floor - minFloor;
                          const groupIndex = Math.floor(floorFromMin / floorRange);
                          const isGroupStart = floorFromMin % floorRange === 0;
                          
                          const totalAvailableFloors = totalFloor - minFloor + 1;
                          const totalGroupableFloors = Math.floor(totalAvailableFloors / floorRange) * floorRange;
                          const remainingAfterGroups = totalAvailableFloors - totalGroupableFloors;
                          
                          return {
                            inGroup: floorFromMin < totalGroupableFloors,
                            groupIndex,
                            isGroupStart: isGroupStart && floorFromMin < totalGroupableFloors,
                            isRemainingFloor: floor > minFloor + totalGroupableFloors - 1,
                            remainingFloorCount: remainingAfterGroups
                          };
                        };

                        const floorInfo = getFloorGroupInfo(checkFloor, floor);
                        const totalFloorInfo = getFloorGroupInfo(floor, floor);

                        // ชั้นที่ไม่อยู่ในกลุ่ม = แสดง
                        if (!floorInfo.inGroup && !floorInfo.isRemainingFloor) return true;
                        
                        // ชั้นแรกของกลุ่ม = แสดง (จะเป็น dropdown)
                        if (floorInfo.inGroup && floorInfo.isGroupStart) return true;
                        
                        // ชั้นที่เหลือ - ถ้ามีมากกว่า 1 ชั้น ให้แสดงเป็น dropdown
                        if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) > 1 && checkFloor === floor) return true;
                        
                        // ชั้นที่เหลือ - ถ้าเหลือแค่ 1 ชั้น ให้แสดงเป็นชั้นเดี่ยว
                        if (floorInfo.isRemainingFloor && (totalFloorInfo.remainingFloorCount || 0) === 1) return true;
                        
                        return false;
                      };

                      const currentFloorWillShow = willShowFloor(currentFloor);
                      
                      // หาชั้นถัดไปที่จะแสดงจริงๆ
                      let nextVisibleFloor = null;
                      for (let f = currentFloor - 1; f >= 1; f--) {
                        if (willShowFloor(f)) {
                          nextVisibleFloor = f;
                          break;
                        }
                      }
                      
                      const shouldShowDivider = currentFloorWillShow && nextVisibleFloor !== null;
                      
                      // Debug log
            
                      const currentFloorElement = renderFloor(currentFloor, bIdx);
                      
                      return (
                        <React.Fragment key={i}>
                          {currentFloorElement}
                          {shouldShowDivider  && (
                            <div className="h-[2px] w-full bg-white" />
                          )}
                        </React.Fragment>
                      );
                    })}
                                      </div>
                  </div>
                  <div className="text-center font-bold text-lg mt-2 text-[#222222]">
                    Building {bIdx + 1}
                  </div>
                </div>
              </Col>
            ))}
            </Row>
          </div>
        </Col>
      </Row> 
    </>
  );
};

export default BuildingCondo;
