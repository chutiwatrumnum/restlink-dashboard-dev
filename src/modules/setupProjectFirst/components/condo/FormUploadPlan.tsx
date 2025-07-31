import { Button, Select, Tag } from "antd";
import iconUpload from "../../../../assets/images/setupProject/Icon-upload.png";
import iconDelete from "../../../../assets/images/setupProject/IconDelete.png";
import { useState, useRef, useEffect } from "react";
import type { BaseSelectRef } from 'rc-select';

const FormUploadPlan = (
    {
        floorOptions,
        fileList,
        selectedFloors,
        storeData,
        statusEdit,
        indexEdit,
        storeDataAll,
        storeDataOriginal,
        setFileList,
        handleRemoveFloor,
        handleFloorSelect,
        setStoreData,
        setStatusAddPlanFloor,
        setIsEditing,
        setStoreDataOriginal,
        setSelectedFloors,
        
        
    }: {
        floorOptions: { value: string, label: string, disabled: boolean }[],
        fileList: File[],
        selectedFloors: string[],
        storeData: { fileList: File | null, fileName: string , selectedFloors: string[], imagePreview: string | null }[],
        statusEdit: boolean,
        indexEdit: number | null,
        storeDataAll?: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[],
        storeDataOriginal: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[],
        setStoreDataOriginal: (storeDataOriginal: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[]) => void,
        setFileList: (files: File[]) => void,
        setSelectedFloors: (floors: string[]) => void,
        handleRemoveFloor: (floor: string, indexEdit: number | null) => void,
        handleFloorSelect: (floor: string, indexEdit: number | null) => void,
        setStoreData: (data: { fileList: File | null, fileName: string, selectedFloors: string[], imagePreview: string | null }[]) => void,
        setStatusAddPlanFloor: (status: boolean) => void,
        setIsEditing?: (isEditing: boolean) => void,
    }
) => {
    const selectRef = useRef<BaseSelectRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [forceUpdate, setForceUpdate] = useState(0);
    // สำหรับเปิด select dropdown


    const handleClickSelect = (e: React.MouseEvent) => {
        // ถ้าคลิกที่ select, container หรือ tag ให้ return เพื่อให้ event ทำงานตามปกติ
        if ((e.target as HTMLElement).closest('.ant-select') ||
            (e.target as HTMLElement).closest('.select-container') ||
            (e.target as HTMLElement).closest('.ant-tag')) {
            return;
        }
        // เปิด dropdown เมื่อคลิกที่ block
        setIsSelectOpen(true);
    };

    const handleAdd = () => {
        let file = fileList[0];
        
        // ตรวจสอบว่ามี file จริงๆ
        if (!file || !(file instanceof File)) {
            return;
        }

        let base64 = URL.createObjectURL(file);
        let obj = {
            fileList: file,  // เก็บ File object โดยตรง
            fileName: file.name,
            selectedFloors: selectedFloors || [],
            imagePreview: base64,
        }
        


        setStatusAddPlanFloor(false);
        
        // ใช้ deep copy เพื่อแยก reference ระหว่าง storeData และ storeDataOriginal
        let data = [...storeData, obj];
        // สร้าง deep copy แต่เก็บ File object ไว้
        let objOriginal = {
            ...JSON.parse(JSON.stringify({
                fileName: obj.fileName,
                selectedFloors: obj.selectedFloors,
                imagePreview: obj.imagePreview
            })),
            fileList: obj.fileList // เก็บ File object ไว้
        };
        let dataOriginal = [...storeDataOriginal, objOriginal];
    
        setStoreData(data);
        setStoreDataOriginal(dataOriginal);


    }

    const handleEdit = () => {
        let file = fileList[0];
        if(statusEdit && !file){ 
            setIsEditing && setIsEditing(false);
        }
        let base64 = URL.createObjectURL(file);
        let obj = {
            fileList: file || null,
            selectedFloors: selectedFloors || [],
            imagePreview: base64 || null,
            fileName: file?.name || '',
        }
        if (indexEdit !== null && indexEdit !== undefined) {
            const newStoreData = [...(storeDataAll || [])];
            let newFileList = [...fileList];
            newFileList[indexEdit] = file;
            newStoreData[indexEdit].imagePreview = base64;
            newStoreData[indexEdit].fileList = file;
            newStoreData[indexEdit].fileName = file.name;
            // ใช้ deep copy เพื่อแยก reference ระหว่าง storeData และ storeDataOriginal
            setStoreData([...newStoreData]);
            // สร้าง deep copy ของ newStoreData แต่เก็บ File object ไว้
            const newStoreDataOriginalCopy = newStoreData.map(item => ({
                ...JSON.parse(JSON.stringify({
                    fileName: item.fileName,
                    selectedFloors: item.selectedFloors,
                    imagePreview: item.imagePreview
                })),
                fileList: item.fileList // เก็บ File object ไว้
            }));
            setStoreDataOriginal(newStoreDataOriginalCopy);
            setFileList(newFileList);
        }
        else {
            setStatusAddPlanFloor(false);
            setStoreData([...storeData, obj]);

        }
        setIsEditing && setIsEditing(false);
    }

    const handleCancel = () => {
        // ใช้ deep copy เพื่อ restore ข้อมูลจาก storeDataOriginal
        const restoredData = storeDataOriginal.map(item => ({
            ...JSON.parse(JSON.stringify({
                fileName: item.fileName,
                selectedFloors: item.selectedFloors,
                imagePreview: item.imagePreview
            })),
            fileList: item.fileList // เก็บ File object ไว้
        }));
        setStoreData(restoredData);
        // Restore selectedFloors ของ card ที่กำลัง edit กลับไปเป็นค่าเดิม
        // if (indexEdit !== null && indexEdit !== undefined && storeDataOriginal[indexEdit]) {
        //     setSelectedFloors([...storeDataOriginal[indexEdit].selectedFloors]);
        // }
        setIsEditing && setIsEditing(false);
    }

    // อัพเดท handleFloorSelect เพื่อปิด dropdown หลังเลือก
    const handleFloorSelectWithClose = (value: string, indexEdit: number | string | null) => {
        handleFloorSelect(value, indexEdit ? Number(indexEdit) : null);
        setIsSelectOpen(false); // ปิด dropdown หลังจากเลือกค่า
    };
    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>,index:any) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];  // เก็บ File object
            setFileList([file]);
            
            // สร้าง URL สำหรับแสดงรูปภาพ preview
            const previewURL = URL.createObjectURL(file);
            if (statusEdit) {
                const newStoreData = [...(storeDataAll || [])];
                if (indexEdit !== null && indexEdit !== undefined) {
                    // อัพเดท state ด้วย File object
                    newStoreData[indexEdit] = {
                        ...newStoreData[indexEdit],
                        imagePreview: previewURL,
                        fileName: file.name,
                        fileList: file  // เก็บ File object
                    };
                    setStoreData(newStoreData);
                }
            } else {
                setImagePreview(previewURL);
            }
        }
    };


    const handleRemoveFile = () => {
        setFileList([]);
        // ลบ URL ของรูปภาพ preview

        if (indexEdit !== null && indexEdit !== undefined) {
            const newStoreData = [...(storeDataAll || [])];
            newStoreData[indexEdit].imagePreview = null;
            newStoreData[indexEdit].fileList = null;
            setStoreData(newStoreData);
        }
        else if (imagePreview !== null && imagePreview !== undefined) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }

        // Reset input value
        const input = document.getElementById('upload-floor-plan-input') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    };

    // เพิ่มฟังก์ชันสำหรับหาชั้นที่ยังไม่ได้เลือก - ใช้ข้อมูลจาก floorOptions
    const getAvailableFloors = () => {
        const currentFloors = statusEdit && indexEdit !== null && storeDataAll 
            ? storeDataAll[indexEdit]?.selectedFloors || []
            : selectedFloors;
        
        const selectedSet = new Set(currentFloors);
        return floorOptions
            .filter(option => !option.disabled && !selectedSet.has(option.value))
            .map(option => option.value);
    };

    // เพิ่มฟังก์ชันสำหรับ handle Select All
    const handleSelectAll = () => {
        const availableFloors = getAvailableFloors();
        if (statusEdit && indexEdit !== null && indexEdit !== undefined) {
            const newStoreData = [...(storeDataAll || [])];
            const currentFloors = newStoreData[indexEdit].selectedFloors.filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:'));
            // เก็บเฉพาะชั้นที่เลือกไว้เดิม + flag 'all' + flag สำหรับชั้นที่เลือกก่อน select all (ไม่เก็บ availableFloors)
            newStoreData[indexEdit].selectedFloors = [
                ...currentFloors,
                'all',
                `pre_select_all:${currentFloors.join(',')}`
            ];
            setStoreData(newStoreData);
        } else {
            const currentFloors = selectedFloors.filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:'));
            // เก็บเฉพาะชั้นที่เลือกไว้เดิม + flag 'all' + flag สำหรับชั้นที่เลือกก่อน select all (ไม่เก็บ availableFloors)
            setSelectedFloors([
                ...currentFloors,
                'all',
                `pre_select_all:${currentFloors.join(',')}`
            ]);
        }
        setIsSelectOpen(false);
    };

    // เพิ่มฟังก์ชันเช็คว่าเลือกครบทุกชั้นหรือยัง
    const isAllFloorsSelected = () => {
        const currentFloors = statusEdit && indexEdit !== null && storeDataAll 
            ? storeDataAll[indexEdit]?.selectedFloors || []
            : selectedFloors;
        const availableFloors = getAvailableFloors();
        // เช็คเฉพาะกรณีที่มี flag 'all' เท่านั้น
        return currentFloors.includes('all');
    };

    // เพิ่มฟังก์ชันสำหรับแสดง tag
    const renderTags = () => {
        const currentFloors = statusEdit && indexEdit !== null && storeDataAll 
            ? storeDataAll[indexEdit]?.selectedFloors || []
            : selectedFloors;
        

        
        // ถ้ามี flag 'all' แสดง Select All
        if (currentFloors.includes('all')) {
            return (
                <Tag
                    closable
                    onClose={() => {
                        // ใช้ handleRemoveFloor เพื่อให้ floorOptions ถูกอัพเดทด้วย
                        handleRemoveFloor('all', statusEdit ? indexEdit : null);
                    }}
                    className="m-0.5 px-2 py-1 rounded-full !bg-[#ebf4ff] !border-[#A6CBFF] !text-[#002C55] flex items-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    Select All
                </Tag>
            );
        }

        // แสดง tag ตามชั้นที่เลือก
        return currentFloors
            .filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:')) // กรองเอาเฉพาะชั้นที่ไม่ใช่ flag 'all' และ 'pre_select_all'
            .map((floor) => (
                <Tag
                    key={floor}
                    closable
                    onClose={() => {
                        handleRemoveFloor(floor, statusEdit ? indexEdit : null)
                    }}
                    className="m-0.5 px-2 py-1 rounded-full !bg-[#ebf4ff] !border-[#A6CBFF] !text-[#002C55] flex items-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    {floor}
                </Tag>
            ));
    };

    // แก้ไขฟังก์ชัน displayFloorText
    const displayFloorText = (floors: string[]) => {
        if (!floors || floors.length === 0) return '';
        if (floors.includes('all')) return 'Select All';

        // Debug

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
                const transformed = `${letter}${number}`;
                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(transformed); // แปลง 1A เป็น A1
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
                const range = `${sorted[0]}-${sorted[1]}`;
                ranges.push(range);
                return ranges;
            }
            
            let start = sorted[0];
            let prev = start;
            
            for (let i = 1; i <= sorted.length; i++) {
                if (i === sorted.length || sorted[i] !== prev + 1) {
                    // ถ้ามี 2 ตัวขึ้นไปที่ต่อเนื่องกัน
                    if (prev > start) {
                        const range = `${start}-${prev}`;
                        ranges.push(range);
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

        // Debug

        return results.join(', ');
    };

    // เพิ่มฟังก์ชันสำหรับ get floor options
    const getFloorOptions = () => {
        // Card Edit ใช้ storeDataAll, Card Add ใช้ selectedFloors
        const currentFloors = indexEdit !== null && storeDataAll && storeDataAll[indexEdit] 
            ? storeDataAll[indexEdit].selectedFloors || []
            : selectedFloors;

        // เช็คว่ามีการ์ดไหนมี "Select All" tag อยู่หรือไม่
        let hasSelectAllTag = false;
        let currentCardHasSelectAll = currentFloors.includes('all');
        
        // เช็ค Select All จาก saved state เท่านั้น
        hasSelectAllTag = storeDataOriginal.some(data => data.selectedFloors.includes('all'));
        
        // สำหรับ Card Add ให้เช็ค selectedFloors ด้วย
        if (indexEdit === null && selectedFloors.includes('all')) {
            hasSelectAllTag = true;
        }
        
        // ถ้าการ์ดปัจจุบันมี Select All → แสดง No data
        if (currentCardHasSelectAll) {
            return [];
        }

        // หาชั้นที่ถูกใช้ - ใช้ saved state เท่านั้น (ไม่ใช้ current editing state)
        const usedFloors: string[] = [];
        
        // สำหรับ Edit mode เท่านั้น:
        if (indexEdit !== null) {
            // สำหรับ Edit mode: ใช้เฉพาะ floors ที่ยังคงอยู่ใน current state
            if (storeDataOriginal[indexEdit]) {
                const savedFloors = storeDataOriginal[indexEdit].selectedFloors
                    .filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:'));
                const currentEditingFloors = currentFloors
                    .filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:'));
                
                // *** KEY FIX: ใช้เฉพาะ saved floors ที่ยังคงอยู่ใน current state ***
                // ถ้า saved floors ถูกลบออกจาก current state → ไม่นับเป็น used (จะขึ้นใน dropdown)
                const savedFloorsStillInUse = savedFloors.filter(floor => 
                    currentEditingFloors.includes(floor)
                );
                
                savedFloorsStillInUse.forEach(floor => {
                    if (!usedFloors.includes(floor)) {
                        usedFloors.push(floor);
                    }
                });
                
                // 2. New floors (tag ใหม่) - ส่งผลกับ card อื่นทันที
                const newFloors = currentEditingFloors.filter(floor => !savedFloors.includes(floor));
                newFloors.forEach(floor => {
                    if (!usedFloors.includes(floor)) {
                        usedFloors.push(floor);
                    }
                });
            }
        }

        // 1. เพิ่มชั้นจาก saved state ของทุก card (ยกเว้น editing card)
        storeDataOriginal.forEach((data, idx) => {
            if (idx !== indexEdit) {
                data.selectedFloors
                    .filter(
                    floor => floor !== 'all' && 
                    !floor.startsWith('pre_select_all:'))
                    .forEach(floor => {
                        if (!usedFloors.includes(floor)) {
                            usedFloors.push(floor);
                        }
                    });
            }
        });

        // 2. เพิ่มชั้นจาก current state ของทุก card (real time sync)
        storeDataAll?.forEach((data, idx) => {
            // ข้าม card ที่กำลังดูอยู่
            if (idx !== indexEdit) {
                const savedFloorsForThisCard = storeDataOriginal[idx]?.selectedFloors || [];
                const currentFloorsForThisCard = data.selectedFloors || [];
                
                // หา floors ใหม่ที่เพิ่มเข้ามาใน card นี้
                const newFloorsFromThisCard = currentFloorsForThisCard.filter(floor => 
                    floor !== 'all' && 
                    !floor.startsWith('pre_select_all:') && 
                    !savedFloorsForThisCard.includes(floor)
                );
                
                // เพิ่ม new floors เข้า usedFloors (real time sync)
                newFloorsFromThisCard.forEach(floor => {
                    if (!usedFloors.includes(floor)) {
                        usedFloors.push(floor);
                    }
                });
            }
        });

        // 3. เพิ่มชั้นจาก Add form (เสมอ - เพื่อให้ card อื่นเห็นว่า floor นี้ถูกใช้แล้ว)
        selectedFloors
            .filter(floor => floor !== 'all' && !floor.startsWith('pre_select_all:'))
            .forEach(floor => {
                if (!usedFloors.includes(floor)) {
                    usedFloors.push(floor);
                }
            });
        
        // กรองตัวเลือกที่สามารถเลือกได้
        const availableOptions = floorOptions.filter(option => {
            const isUsed = usedFloors.includes(option.value);
            return !isUsed && !option.disabled;
        });
        // ถ้าไม่มีชั้นให้เลือก
        if (availableOptions.length === 0) {
            return [];
        }

        // สร้างตัวเลือกสุดท้าย
        let finalOptions = [];
        if (!hasSelectAllTag) {
            finalOptions.push({ value: 'all', label: 'Select All' });
        }
        finalOptions.push(...availableOptions);
        return finalOptions;
    };

    // Force re-render เมื่อข้อมูลเปลี่ยน
    useEffect(() => {
        // เมื่อ selectedFloors เปลี่ยน (Card Add) → อัพเดท dropdown ของ Card Edit
        setForceUpdate(prev => prev + 1);
    }, [selectedFloors]);

    useEffect(() => {
        // เมื่อ storeDataAll เปลี่ยน (Card Edit) → อัพเดท dropdown ของ Card Add
        setForceUpdate(prev => prev + 1);
    }, [storeDataAll]);

    useEffect(() => {
        // เมื่อ floorOptions เปลี่ยน (เมื่อลบ tag) → อัพเดท dropdown ของทุก card
        setForceUpdate(prev => prev + 1);
    }, [floorOptions]);

    useEffect(() => {
        // เมื่อ storeData เปลี่ยน → อัพเดท dropdown
        setForceUpdate(prev => prev + 1);
    }, [storeData]);

    return (
        <>

            <div className="border-1 border-gray-300 rounded-lg h-full flex flex-col p-4">
                <div className="">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg text-[#002C55] font-light">Assigned floor</span>
                        <span className="text-lg text-[#002C55] font-medium">
                            {(() => {
                                const currentFloors = statusEdit && indexEdit !== null && storeDataAll 
                                    ? storeDataAll[indexEdit]?.selectedFloors || []
                                    : selectedFloors;
                                return isAllFloorsSelected() ? 'Select All' : `Floor ${displayFloorText(currentFloors)}`;
                            })()}
                        </span>
                    </div>
                    <div className="relative">
                        <div
                            className="min-h-[40px] p-2 rounded-lg border border-gray-200 bg-white cursor-pointer"
                            onClick={handleClickSelect}
                        >
                            <div className="flex flex-wrap items-center">
                                {renderTags()}
                                <div
                                    className="!min-w-[120px] cursor-pointer px-2 select-container"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Select
                                        key={forceUpdate}
                                        ref={selectRef}
                                        placeholder={"Select Floor"}
                                        className="!w-full [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!p-0 [&_.ant-select-selector]:!m-0"
                                        options={getFloorOptions()}
                                        onChange={(value) => {
                                            if (value === 'all') {
                                                handleSelectAll();
                                            } else {
                                                handleFloorSelectWithClose(value || '', statusEdit ? indexEdit?.toString() || null : null);
                                            }
                                        }}
                                        value={null}
                                        popupMatchSelectWidth={false}
                                        suffixIcon={null}
                                        open={isSelectOpen}
                                        onOpenChange={setIsSelectOpen}
                                        notFoundContent="No data"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-[#218DC7] border-1 border-[#218DC7] rounded-lg py-1 px-2 mb-4 mt-2">
                            You can select multiple floors to upload a single plan that will automatically apply to all selected floors.
                        </div>
                    </div>
                </div>
                <div className="border-1 border-gray-300 rounded-lg p-4">
                    <div
                        className="border-1 border-dashed border-gray-300 min-h-[200px] rounded-xl p-8 cursor-pointer transition hover:bg-blue-50 bg-[#FAFAFA]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden upload-floor-plan-input"
                            onChange={(e) => handleUpload(e,indexEdit)}
                            multiple={false}
                            accept="image/*"
                        />
                        {

                            (
                                (statusEdit && (storeData[0].imagePreview == "" || storeData[0].imagePreview == null)) ||
                                (!statusEdit && (imagePreview == "" || imagePreview == null))
                            )

                                ? (
                                    <div className="text-center">
                                        <div className="mb-4 flex justify-center">
                                            <img src={iconUpload} alt="icon-upload" />
                                        </div>
                                        <div className="text-lg font-normal mb-2 text-[#002C55] text-center">
                                            Click or drag file to this area to upload
                                        </div>
                                        <div className="text-md font-extralight text-gray-500 text-[#999999] text-center">
                                            Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">

                                        {(statusEdit ? storeData[0].imagePreview || '' : imagePreview) && (
                                            <div className="w-full  relative">
                                                <img
                                                    src={statusEdit ? storeData[0].imagePreview || '' : imagePreview || ''}
                                                    alt="Floor plan preview"
                                                    className="w-full h-full max-h-[200px] object-scale-down"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                    </div>
                    {
                        fileList.length > 0 && indexEdit !== null && indexEdit !== undefined && (
                            <div className="w-full flex items-center justify-between mt-4">
                                <span className="text-md font-normal text-[#002C55]">
                                    { statusEdit ? storeData[0]?.fileName || '' : fileList[0].name }
                                </span>
                                <img src={iconDelete} alt="icon-delete" className="cursor-pointer w-[20px] h-[20px]"
                                    onClick={handleRemoveFile} 
                                />
                            </div>
                        )
                    }
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        onClick={statusEdit ? handleEdit : handleAdd}
                        type="default"
                        className="px-8 rounded-full w-[100px]"
                        disabled={
                            (!statusEdit && (fileList.length === 0 || selectedFloors.length === 0)) ||
                            (statusEdit && (
                                (indexEdit !== null && storeDataAll && storeDataAll[indexEdit]?.selectedFloors?.length === 0) ||
                                (indexEdit === null && selectedFloors.length === 0)
                            ))
                        }
                    >
                        {statusEdit ? 'Edit' : 'Add'}
                    </Button>
                    {statusEdit && (
                        <Button
                            onClick={handleCancel}
                            type="default"
                            className="px-8 rounded-full w-[100px]"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default FormUploadPlan;
