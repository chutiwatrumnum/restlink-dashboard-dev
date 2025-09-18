
import { useCondo } from "../../contexts/Condo";
import { useEffect, useState, useMemo } from "react";
import { useGlobal } from "../../contexts/Global";
import { useDispatch } from "react-redux";
import AlarmIcon from "./Alarm";
import "./alarm.css";

// กำหนด interface สำหรับข้อมูลชั้น
interface Floor {
    floorId: number;
    floorName: string;
    isBasement: boolean;
    isEvent: boolean;
    numberOfFloor: number;
}

interface Building {
    id: number;
    name: string;
    floorsSize: number;
    floors: Floor[];
}

// คอมโพเนนต์ไอคอนสัญญาณเตือนภัยพร้อมแอนิเมชัน


const Building = ({ onDataFloorChange }: { onDataFloorChange?: (dataFloor: any) => void }) => {
    const { dataBuilding } = useCondo();
    const { loadFirst } = useGlobal();
    const dispatch = useDispatch();
    // จำนวนชั้นสูงสุดต่อคอลัมน์
    const MAX_FLOORS_PER_COLUMN = 20;
    
    // สร้าง state เก็บสีของแต่ละตึก
    
    // ฟังก์ชันสุ่มสี
    const getRandomColor = () => {
        // สุ่มสีพาสเทลอ่อนๆ
        const hue = Math.floor(Math.random() * 360);
        const saturation = 25 + Math.floor(Math.random() * 30); // 25-55%
        const lightness = 75 + Math.floor(Math.random() * 15); // 75-90%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    // ฟังก์ชันให้คะแนนลำดับชั้น (จัดเรียงจากเลขน้อยไปมาก)
    const floorOrderValue = (floor: any) => {
        const name = String(floor?.floorName || '').trim().toUpperCase();
        const n = typeof floor?.numberOfFloor === 'number' ? floor.numberOfFloor : parseInt(floor?.numberOfFloor, 10) || 0;
        if (floor?.isBasement) return -Math.abs(n); // B4 (-4) ก่อน B1 (-1)
        if (name === 'G' || name === 'GROUND') return 0;
        return n;
    };

    const getPlanInfo = async (building: any, dataFloor: any) => {
        let objFloor = {
            ...dataFloor,
            buildingName: building.name
        }
        dispatch.sosWarning.setDataFloor(objFloor);
        loadFirst(dataFloor.floorId.toString(),buildingDisplay);
        // แจ้ง parent เพื่ออัปเดต Topbar ผ่าน ref
        if (onDataFloorChange) {
            onDataFloorChange(objFloor);
        }
    }

    const buildingDisplay = useMemo(() => {
        return dataBuilding?.building || [];
    }, [dataBuilding]);
    
    const buildings = useMemo(() => {
        return buildingDisplay.map((item: any) => ({
            id: item.blockId,
            name: item.blockName,
            floorsSize: item.floors.length,
            // เรียงลำดับชั้นจากน้อยไปมากเพื่อให้แสดงผลชั้นล่างก่อน
            floors: [...item.floors].sort((a: any, b: any) => floorOrderValue(a) - floorOrderValue(b)),
        }));
    }, [buildingDisplay]);

    // จัดกึ่งกลางเมื่อจำนวนตึกไม่เกิน 3 ตึก
    const isThreeOrLess = buildings.length <= 3;
    // กำหนด class ของคอนเทนเนอร์ตามจำนวนตึก
    const containerClass = isThreeOrLess
        ? "flex flex-wrap justify-center gap-10 p-5"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 p-5 justify-items-center justify-center";

    // สุ่มสีเมื่อโหลดคอมโพเนนต์
    useEffect(() => {
        // ตรวจสอบว่า buildings มีข้อมูลหรือไม่
        if (buildings.length === 0) return;
        
        const colors: Record<number, string> = {};
        const usedColors = new Set<string>();
        
        buildings.forEach((building: Building) => {
            if (building.id) {
                // ตรวจสอบว่าเป็นตึกย่อยหรือไม่ (ID มากกว่า 100)
                const mainBuildingId = building.id > 100 ? Math.floor(building.id / 100) : building.id;
                
                // ถ้าตึกหลักยังไม่มีสี ให้สุ่มสีใหม่
                if (!colors[mainBuildingId]) {
                    let newColor;
                    do {
                        newColor = getRandomColor();
                    } while (usedColors.has(newColor));
                    
                    colors[mainBuildingId] = newColor;
                    usedColors.add(newColor);
                }
                
                // ใช้สีเดียวกันกับตึกหลัก
                colors[building.id] = colors[mainBuildingId];
            }
        });
    }, [buildings]);  // dependency บน buildings

        return (
        <div className={containerClass}>          
            {buildings.map((building: any) => {
                // คำนวณจำนวนคอลัมน์ที่ต้องใช้
                const numberOfColumns = Math.ceil(building.floorsSize / MAX_FLOORS_PER_COLUMN);
                
                // สร้างอาเรย์ของคอลัมน์ (เริ่มจากซ้ายไปขวา)
                const columns = Array.from({ length: numberOfColumns }, (_: any, columnIndex: number) => {
                    // คำนวณชั้นเริ่มต้นและสิ้นสุดของคอลัมน์นี้
                    const startIndex = columnIndex * MAX_FLOORS_PER_COLUMN;
                    const endIndex = Math.min(startIndex + MAX_FLOORS_PER_COLUMN, building.floors.length);
                    
                    // ส่งคืนช่วงของชั้นที่จัดเรียงแล้วในคอลัมน์นี้ (แสดงจากบนลงล่างเป็นชั้นสูง→ต่ำ เพื่อให้จากล่างขึ้นบนเป็น B1,G,2,3,...)
                    return [...building.floors.slice(startIndex, endIndex)].sort((a: any, b: any) => floorOrderValue(b) - floorOrderValue(a));
                });

                // ใช้สีที่สุ่มได้หรือใช้สีเริ่มต้นถ้ายังไม่มีสี
                const buildingColor = "#d7d5ca";

                return (
                    <div key={building.id} className="flex flex-col justify-end mt-auto relative  !cursor-pointer">
                        <div className="flex flex-row items-end gap-5">
                            {columns.map((floors: any[], columnIndex: number) => (
                                <div key={`${building.id}-column-${columnIndex}`} className="flex flex-col gap-1 justify-end">
                                    {floors.map((floor: Floor) => (
                                        <div 
                                            onClick={() => {
                                                getPlanInfo(building,floor)
                                            }}
                                            key={`${building.id}-floor-${floor.floorId}`} 
                                            className="flex items-center h-[30px] cursor-pointe relative"
                                        >
                                            <div 
                                                className="w-[230px] h-full flex items-center justify-between 
                                                font-bold  cursor-pointer"
                                                style={{ backgroundColor: buildingColor }}
                                            >
                                                <div className="flex items-center justify-start !py-2 ms-3">
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                </div>
                                                <div className="flex-1 px-2 flex items-center justify-center min-w-0">
                                                    {floor.isEvent  ? (
                                                        <AlarmIcon nameAlarm={floor.floorName} />
                                                    ) : (
                                                        <span className="truncate w-full text-center">{floor.floorName}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-start !py-2 me-3">
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="h-4"></div>
                         <div className="text-center !mt-auto">
                            <div className="font-bold text-sm">
                                {building.name}
                            </div>
                         </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Building;
