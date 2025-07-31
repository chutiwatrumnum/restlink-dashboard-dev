import { useState, useEffect } from "react";
import { Button } from "antd";
import UploadBuildingImage from "../../../../assets/images/setupProject/UploadBuildingImage.png";
import FormUploadPlan from "./FormUploadPlan";
interface PlanOnFloorProps {
    storeData: {
        fileList: File | null;
        fileName: string;
        selectedFloors: string[];
        imagePreview: string | null;
    } 
    floorOptions: { value: string, label: string, disabled: boolean }[];
    fileList: File[];
    selectedFloors: string[];
    indexEdit: number;
    storeDataAll: { fileList: File | null,fileName: string, selectedFloors: string[], imagePreview: string | null }[];
    storeDataOriginal: { fileList: File | null,fileName: string, selectedFloors: string[], imagePreview: string | null }[];
    onDelete: () => void;
    
    setFileList: (fileList: File[]) => void;
    setSelectedFloors: (selectedFloors: string[]) => void;
    handleRemoveFloor: (floor: string, indexEdit: number|null) => void;
    handleFloorSelect: (floor: string, indexEdit: number|null) => void;
    setStoreData: (storeData: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[]) => void;
    setStatusAddPlanFloor: (statusAddPlanFloor: boolean) => void;
    setStoreDataOriginal: (storeDataOriginal: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[]) => void;
    
}

const PlanOnFloor = ({ 
    storeData, 
    floorOptions, 
    fileList, 
    selectedFloors, 
    indexEdit, 
    storeDataAll, 
    storeDataOriginal, 
    onDelete, 
    setFileList, 
    setSelectedFloors, 
    handleRemoveFloor, 
    handleFloorSelect, 
    setStoreData, 
    setStatusAddPlanFloor, 
    setStoreDataOriginal,
     }: PlanOnFloorProps) => {
    const [isEditing, setIsEditing] = useState(false);



    const formatFloorNumbers = (floors: string[]) => {
        // ถ้าไม่มีข้อมูลหรือมีแค่ all ให้แสดง Select All
        if (!floors.length || floors.includes('all')) {
            return 'Select All';
        }

        // กรองเอาเฉพาะตัวเลข
        const numberFloors = floors.filter(floor => !isNaN(Number(floor)));
        if (!numberFloors.length) return '';

        // แปลง string[] เป็น number[] และเรียงลำดับ
        const sortedFloors = numberFloors.map(Number).sort((a, b) => a - b);
        const ranges: string[] = [];

        // ใช้ loop เดียวในการสร้าง ranges
        let i = 0;
        while (i < sortedFloors.length) {
            let start = sortedFloors[i];
            let end = start;
            
            // หาช่วงที่ต่อเนื่องกัน
            while (i + 1 < sortedFloors.length && sortedFloors[i + 1] === end + 1) {
                end = sortedFloors[i + 1];
                i++;
            }
            
            // เพิ่มช่วงที่พบ
            if (start === end) {
                ranges.push(start.toString());
            } else {
                ranges.push(`${start}-${end}`);
            }
            
            i++;
        }

        return ranges.join(', ');
    };

    // เพิ่มฟังก์ชันสำหรับแสดงผลชั้น
    const displayFloorText = (floors: string[]): string => {
        if (!floors || floors.length === 0) return '';
        if (floors.includes('all')) {
            // ถ้าเลือก Select All ให้แสดงชั้นที่ยังไม่ได้ใช้งาน
            const getAllUsedFloors = () => {
                const allUsedFloors = new Set<string>();
                
                // เพิ่มชั้นจากการ์ดอื่นๆ (ไม่รวมการ์ดปัจจุบัน)
                storeDataAll.forEach((data, index) => {
                    if (index !== indexEdit) {
                        data.selectedFloors.forEach(floor => {
                            if (floor !== 'all' && !floor.startsWith('pre_select_all:')) {
                                allUsedFloors.add(floor);
                            }
                        });
                    }
                });
                
                return allUsedFloors;
            }
            
            // หาชั้นที่ยังไม่ได้ใช้งาน
            const usedFloors = getAllUsedFloors();
            const availableFloors = floorOptions
                .filter(option => !option.disabled && !usedFloors.has(option.value))
                .map(option => option.value);

            return `Floor ${displayFloorText(availableFloors)}`;
        }

        // จัดกลุ่มชั้นตามประเภท
        const groups: { [key: string]: string[] } = {};

        floors.forEach(floor => {
            if (floor === 'all' || floor.startsWith('pre_select_all:')) return;

            // ตัวอักษรนำหน้าตัวเลข (A1, A2, max1, max2)
            if (/^[A-Za-z]+\d+$/.test(floor)) {
                const letter = floor.match(/^([A-Za-z]+)/)?.[1] || '';
                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(floor);
            }
            // ตัวเลขนำหน้าตัวอักษร (1A, 2A)
            else if (/^\d+[A-Za-z]+$/.test(floor)) {
                const letter = floor.match(/[A-Za-z]+$/)?.[0] || '';
                const number = floor.match(/^\d+/)?.[0] || '';
                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(`${letter}${number}`); // แปลง 1A เป็น A1
            }
            // ตัวเลขล้วน
            else if (!isNaN(Number(floor))) {
                if (!groups['number']) groups['number'] = [];
                groups['number'].push(floor);
            }
            // ตัวอักษรล้วน
            else if (/^[A-Za-z]+$/.test(floor)) {
                if (!groups['letter']) groups['letter'] = [];
                groups['letter'].push(floor);
            }
        });

        // แปลงตัวเลขเป็น range
        const makeRange = (numbers: string[]): string[] => {
            if (!numbers || numbers.length === 0) return [];
            
            const sorted = numbers.map(Number).sort((a, b) => a - b);
            const ranges: string[] = [];
            
            // ถ้ามีแค่ตัวเดียว
            if (sorted.length === 1) {
                ranges.push(`${sorted[0]}`);
                return ranges;
            }
            
            // ถ้ามีแค่ 2 ตัว ให้แสดงเป็น range ทันที
            if (sorted.length === 2) {
                ranges.push(`${sorted[0]}-${sorted[1]}`);
                return ranges;
            }
            
            let start = sorted[0];
            let prev = start;
            
            for (let i = 1; i <= sorted.length; i++) {
                if (i === sorted.length || sorted[i] !== prev + 1) {
                    // ถ้ามี 2 ตัวขึ้นไปที่ต่อเนื่องกัน
                    if (prev > start) {
                        ranges.push(`${start}-${prev}`);
                    } else {
                        ranges.push(`${start}`);
                    }
                    if (i < sorted.length) {
                        start = sorted[i];
                        prev = start;
                    }
                } else {
                    prev = sorted[i];
                }
            }
            
            return ranges;
        };

        const results: string[] = [];

        // จัดการตัวเลขล้วน
        if (groups['number']?.length > 0) {
            const ranges = makeRange(groups['number']);
            results.push(...ranges);
        }

        // จัดการตัวอักษรล้วน
        if (groups['letter']?.length > 0) {
            results.push(...groups['letter'].sort());
        }

        // จัดการตัวอักษรนำหน้าตัวเลข (A1, A2, max1, max2)
        Object.entries(groups)
            .filter(([key]) => key !== 'number' && key !== 'letter')
            .forEach(([letter, values]) => {
                // แยกตัวเลขออกจากตัวอักษร
                const numbers = values.map(v => v.replace(letter, '')).sort();
                
                // ถ้ามีแค่ตัวเดียว
                if (numbers.length === 1) {
                    results.push(`${letter}${numbers[0]}`);
                    return;
                }

                // แปลงเป็น range
                const ranges = makeRange(numbers);
                results.push(...ranges.map(range => `${letter}${range}`));
            });

        return results.length > 0 ? `Floor ${results.join(', ')}` : '';
    };

    return (
        <>
            <div>
                {/* <Button onClick={() => {
                    console.log(floorOptions,'floorOptions')
                }}>
                    floorOptions
                </Button> */}
            </div>
            {!isEditing && (
                <div className="border-1 border-gray-300 rounded-lg h-full flex flex-col">
                    <div className="p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                <span className="text-lg text-[#002C55] font-light">Assigned floor</span>
                                <span className="text-lg text-[#002C55] font-medium">
                                {displayFloorText(storeData.selectedFloors)}
                                </span>
                            </div>
                        <div className="border-1 border-gray-300 rounded-xl p-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden min-h-[200px]">
                                <img
                                    src={storeData.imagePreview || UploadBuildingImage}
                                    alt="Floor plan"
                                    className="w-full max-h-[200px] object-scale-down rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="flex items-center mt-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="mr-2 text-blue-500"
                            >
                                <path
                                    fill="currentColor"
                                    d="M6 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8.83a2 2 0 0 0-.59-1.41l-4.83-4.83A2 2 0 0 0 13.17 2H6zm7 1.5V8a1 1 0 0 0 1 1h4.5L13 3.5z"
                                />
                            </svg>
                            <span className="text-[#002C55] text-lg text-base">
                                {storeData.fileName || 'No file selected'}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 bg-[#ECF4FF] rounded-b-lg mt-auto">
                        <div className="flex items-center justify-start gap-2">
                            <span onClick={() => setIsEditing(true)}
                             className="text-lg text-[#4995FF] font-light cursor-pointer">Edit</span>
                            <div className="bg-[#CACACA] w-[1px] h-[16px]"></div>
                            <span
                                className="text-lg text-[#D73232] font-light cursor-pointer"
                                onClick={onDelete}
                            >
                                Delete
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {isEditing && (
                <FormUploadPlan
                    setIsEditing={setIsEditing}
                    statusEdit={isEditing}
                    floorOptions={floorOptions}
                    fileList={fileList}
                    setFileList={setFileList}
                    selectedFloors={selectedFloors}
                    setSelectedFloors={setSelectedFloors}
                    handleRemoveFloor={handleRemoveFloor}
                    handleFloorSelect={handleFloorSelect}
                    setStoreData={setStoreData}
                    setStatusAddPlanFloor={setStatusAddPlanFloor}
                    storeData={[storeData]}
                    storeDataAll={storeDataAll}
                    indexEdit={indexEdit}
                    storeDataOriginal={storeDataOriginal}
                    setStoreDataOriginal={setStoreDataOriginal}
                />
            )}
        </>
    );
};

export default PlanOnFloor;