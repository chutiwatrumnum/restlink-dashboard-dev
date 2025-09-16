import { useState } from "react";
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




    // เพิ่มฟังก์ชันสำหรับแสดงผลชั้น (รองรับตัวเลข/ตัวอักษร/ผสม และกรณี Select All)
    const displayFloorText = (floors: string[]): string => {
        if (!floors || floors.length === 0) return '';
        if (floors.includes('all')) return 'All Floor';

        // ทำความสะอาดค่า: ให้เป็นสตริง, ตัด flag และคำว่า Floor ออก
        const cleaned = floors
            .map(f => String(f).trim())
            .filter(f => f !== 'all' && !f.startsWith('pre_select_all:'))
            .map(f => f.replace(/^floor\s*/i, ''));

        if (cleaned.length === 0) return '';

        // สร้างช่วงตัวเลขต่อเนื่อง
        const makeNumberRanges = (nums: number[]): string[] => {
            if (nums.length === 0) return [];
            const sorted = [...nums].sort((a, b) => a - b);
            const out: string[] = [];
            let start = sorted[0];
            let prev = sorted[0];
            for (let i = 1; i <= sorted.length; i++) {
                const cur = sorted[i];
                if (i < sorted.length && cur === prev + 1) {
                    prev = cur;
                    continue;
                }
                out.push(start === prev ? `${start}` : `${start}-${prev}`);
                start = cur;
                prev = cur;
            }
            return out;
        };

        const results: string[] = [];

        // 1) ตัวเลขล้วน
        const onlyNumbers = cleaned.filter(v => /^\d+$/.test(v)).map(Number);
        if (onlyNumbers.length) results.push(...makeNumberRanges(onlyNumbers));

        // 2) ตัวอักษรล้วน
        const onlyLetters = cleaned.filter(v => /^[A-Za-z]+$/.test(v)).sort();
        if (onlyLetters.length) results.push(...onlyLetters);

        // 3) ตัวอักษร+ตัวเลข (A1)
        const groupLN: Record<string, number[]> = {};
        cleaned.filter(v => /^[A-Za-z]+\d+$/.test(v)).forEach(v => {
            const letter = v.match(/^([A-Za-z]+)/)?.[1] || '';
            const num = Number(v.replace(/^[A-Za-z]+/, ''));
            if (!groupLN[letter]) groupLN[letter] = [];
            groupLN[letter].push(num);
        });
        Object.entries(groupLN)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([letter, nums]) => {
                results.push(...makeNumberRanges(nums).map(r => `${letter}${r}`));
            });

        // 4) ตัวเลข+ตัวอักษร (1A -> A1)
        const groupNL: Record<string, number[]> = {};
        cleaned.filter(v => /^\d+[A-Za-z]+$/.test(v)).forEach(v => {
            const letter = v.match(/[A-Za-z]+$/)?.[0] || '';
            const num = Number(v.match(/^\d+/)?.[0] || '');
            if (!groupNL[letter]) groupNL[letter] = [];
            groupNL[letter].push(num);
        });
        Object.entries(groupNL)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([letter, nums]) => {
                results.push(...makeNumberRanges(nums).map(r => `${letter}${r}`));
            });

        return results.length ? `Floor ${results.join(', ')}` : '';
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