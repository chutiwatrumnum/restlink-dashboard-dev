import { Button } from "antd";
import { useCondo } from "../../contexts/Condo";
import { useEffect, useState, useMemo } from "react";
import { getEventPending, getVillageData } from "../../service/api/SOSwarning";
import { useGlobal } from "../../contexts/Global";
import { dataAllMap } from "../../../../stores/interfaces/SosWarning";
import { useDispatch } from "react-redux";
import { sosWarning } from "../../../../stores/models/SosWarning";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";
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
    const projectData = useSelector((state: RootState) => state.setupProject.projectData);
    const { dataBuilding } = useCondo();
    const { loadFirst } = useGlobal();
    const dispatch = useDispatch();
    // จำนวนชั้นสูงสุดต่อคอลัมน์
    const MAX_FLOORS_PER_COLUMN = 20;
    
    // สร้าง state เก็บสีของแต่ละตึก
    const [buildingColors, setBuildingColors] = useState<Record<number, string>>({});
    
    // ฟังก์ชันสุ่มสี
    const getRandomColor = () => {
        // สุ่มสีพาสเทลอ่อนๆ
        const hue = Math.floor(Math.random() * 360);
        const saturation = 25 + Math.floor(Math.random() * 30); // 25-55%
        const lightness = 75 + Math.floor(Math.random() * 15); // 75-90%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const getPlanInfo = async (building: any, dataFloor: any) => {
        // console.log(buildingDisplay,'buildingDisplay') //ตึกทั้งหมด
        // console.log(building,'building'); //ตึกที่เลือกำ
        // console.log(dataFloor,'dataFloor'); // ชั้นที่เลือก
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
            floors: item.floors,
        }));
    }, [buildingDisplay]);



    
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
        setBuildingColors(colors);
    }, [buildings]);  // dependency บน buildings

        return (
        <div className="flex flex-wrap gap-10 p-5 justify-center">          
            {buildings.map((building: Building) => {
                // คำนวณจำนวนคอลัมน์ที่ต้องใช้
                const numberOfColumns = Math.ceil(building.floorsSize / MAX_FLOORS_PER_COLUMN);
                
                // สร้างอาเรย์ของคอลัมน์ (เริ่มจากซ้ายไปขวา)
                const columns = Array.from({ length: numberOfColumns }, (_, columnIndex) => {
                    // คำนวณชั้นเริ่มต้นและสิ้นสุดของคอลัมน์นี้
                    const startIndex = columnIndex * MAX_FLOORS_PER_COLUMN;
                    const endIndex = Math.min(startIndex + MAX_FLOORS_PER_COLUMN, building.floors.length);
                    
                    // ส่งคืนช่วงของชั้นในคอลัมน์นี้
                    return building.floors.slice(startIndex, endIndex);
                });

                // ใช้สีที่สุ่มได้หรือใช้สีเริ่มต้นถ้ายังไม่มีสี
                const buildingColor = buildingColors[building.id] || "#d7d5ca";

                return (
                    <div key={building.id} className="flex flex-col justify-end mt-auto relative  !cursor-pointer">
                        <div className="flex flex-col justify-end gap-5">
                            {columns.map((floors, columnIndex) => (
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
                                                className="w-[180px] h-full flex items-center justify-center 
                                                font-bold text-lg cursor-pointer"
                                                style={{ backgroundColor: buildingColor }}
                                            >
                                                <div className="flex items-center justify-start!py-2 ms-3 mr-auto">
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                    <div className="border-1 border-gray-300 w-[25px] h-[15px] bg-white flex items-center justify-center">
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {floor.isEvent && <AlarmIcon nameAlarm={floor.floorName} />}
                                                    {!floor.isEvent && floor.floorName}
                                                </div>
                                                <div className="flex items-center justify-start!py-2 mr-3 ms-auto">
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
