import { Form, Input, Select, Button } from "antd";
import { useEffect, useState, useRef, useMemo } from "react";
import { dataSelectPlan } from "../../../stores/interfaces/SosWarning";
import { getAddress, createMarker, updateMarker } from "../service/api/SOSwarning";
import { MarkerProcess } from "../../../stores/interfaces/SosWarning";
import { dataAllMap } from "../../../stores/interfaces/SosWarning";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
interface FormVillageLocationProps {
    onCancel?: () => void;
    onConfirm?: () => void;
    latitude?: string;
    longitude?: string;
    selectedMarker?: {
        id: number | string;
        name: string;
        x: number;
        y: number;
        originalX: number;
        originalY: number;
        group: string;
        color: string;
        address?: string;
        tel1?: string;
        tel2?: string;
        tel3?: string;
        unitID?: number;

    } | null;
    mapMode?: 'preview' | 'work-it';
    shouldFocusNameInput?: boolean;    
    dataSelectPlan?: dataSelectPlan;
    isCreatingMode?: boolean;
    planType: string;
    idVillage: string;
    hasActiveMarker?: boolean; // เพิ่ม prop สำหรับตรวจสอบว่ามี active marker หรือไม่
    editMarkerData?: any;
    onMarkerNameChange?: (markerId: number | string, newName: string) => void;
    onMarkerAddressChange?: (markerId: number | string, newAddress: string) => void;
    onMarkerTel1Change?: (markerId: number | string, newTel1: string) => void;
    onMarkerTel2Change?: (markerId: number | string, newTel2: string) => void;
    onMarkerTel3Change?: (markerId: number | string, newTel3: string) => void;
    onMarkerUpdate?: (markerId: string, updatedMarker: any) => void; // เพิ่ม callback สำหรับอัพเดท marker ทั้งหมด
    onFocusHandled?: () => void;
    onMarkerDelete?: (markerId: number) => void;
    setShouldShowVillageForm: (status: boolean) => void;
    setDataMapAll: (data: any) => void;
    onMarkerSelect?: (marker: any | null) => void;
    onEditMarkerData?: (data: any) => void;
    dataAllMap: dataAllMap;
    floorIdGlobal: string;
}

const FormVillageLocation = ({ 
    latitude,
    longitude, 
    selectedMarker, 
    mapMode = 'work-it',
    shouldFocusNameInput,
    dataSelectPlan, 
    isCreatingMode,
    idVillage, 
    hasActiveMarker,
    dataAllMap,
    onMarkerNameChange,
    onMarkerAddressChange, 
    onMarkerTel1Change, 
    onMarkerTel2Change,
    onMarkerTel3Change, 
    onMarkerUpdate, 
    onCancel, 
    onConfirm, 
    onFocusHandled, 
    onMarkerDelete,
    setDataMapAll, 
    onMarkerSelect,
    floorIdGlobal,
    }: FormVillageLocationProps) => {
    const [form] = Form.useForm();
    const [isFormValid, setIsFormValid] = useState(false);
    const nameInputRef = useRef<any>(null);
    const [isUserInputting, setIsUserInputting] = useState(false);
    const lastUserSelectedAddress = useRef<string | null>(null);
    const currentMarkerIdRef = useRef<number | string | null>(null);
    const isUserInputtingRef = useRef<boolean>(false);
    const originalMarkerDataRef = useRef<any>(null); // เก็บข้อมูลต้นฉบับของ marker
    const allMarkersOriginalDataRef = useRef<{ [key: string]: any }>({}); // เก็บข้อมูลต้นฉบับของ marker ทั้งหมด
    const isResetingMarkerRef = useRef<boolean>(false); // flag เพื่อป้องกัน infinite loop
    const isUserFocusedRef = useRef<boolean>(false); // flag เพื่อตรวจสอบว่า user กำลัง focus ที่ input หรือเปล่า
    const isUserInteractingRef = useRef<boolean>(false); // flag รวม เพื่อตรวจสอบว่า user กำลัง interact กับ form หรือเปล่า
    const lastFormUpdateTimeRef = useRef<number>(0);
    const isCancellingRef = useRef<boolean>(false); // flag เพื่อป้องกัน useEffect ทำงานหลังจากกด cancel // เก็บเวลาล่าสุดที่ update form
    const isConfirmingRef = useRef<boolean>(false); // flag เพื่อป้องกัน racing condition หลัง confirm
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // สำหรับ debounce การอัปเดต form



    // อัพเดทค่า latitude และ longitude เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        if (latitude !== undefined && longitude !== undefined) {
            form.setFieldsValue({
                latitude: latitude,
                longitude: longitude
            });
        }
    }, [latitude, longitude, form]);

    // อัพเดทค่าชื่อ และ address ของ marker เมื่อมีการเลือก marker ใหม่
    useEffect(() => {
        // ถ้ากำลังอยู่ในสถานะ cancelling หรือ confirming ให้ skip การ update
        if (isCancellingRef.current || isConfirmingRef.current) {
            return;
        }

        // ถ้า selectedMarker เป็น null ให้ skip การ update เพื่อป้องกันการ enable form อีกครั้ง
        if (!selectedMarker) {
            return;
        }
            
            // เพิ่มการตรวจสอบ hasActiveMarker - ถ้าไม่มี active marker ให้ผ่านไปได้ (เพื่อ unlock marker)
        // if (!hasActiveMarker) {
        //     console.log('⚠️ hasActiveMarker is false - this could be unlock marker scenario, proceeding anyway');
        // }

        // ตรวจสอบการเปลี่ยน marker หรือการ unlock marker เดิม
        const isMarkerChanged = selectedMarker && currentMarkerIdRef.current !== selectedMarker.id;
        // เพิ่มการตรวจสอบการ unlock marker: ถ้า marker ID เดิมแต่เป็นการเลือกใหม่หลังจาก clear หรือ cancel
        const isMarkerReselected = selectedMarker && (
            currentMarkerIdRef.current === null || // หลังจาก cancel/confirm
            (currentMarkerIdRef.current !== selectedMarker.id && lastFormUpdateTimeRef.current === 0) // หลังจาก reset
        );
        
        
        const now = Date.now();
        // ถ้า user กำลัง interact กับ form และไม่ใช่การเปลี่ยน marker หรือ reselect marker ให้ skip การ update
        const hasActiveElement = document.activeElement && document.activeElement.tagName.match(/input|select|textarea/i);
        const isUserCurrentlyActive = isUserInputtingRef.current || isUserInteractingRef.current || isUserFocusedRef.current || hasActiveElement;

        if (isUserCurrentlyActive && !isMarkerChanged && !isMarkerReselected) {
            return;
        }

        // หากเป็นการเปลี่ยน marker หรือ reselect marker ขณะที่ user กำลัง interact ให้ reset flags ก่อน
        if ((isMarkerChanged || isMarkerReselected) && isUserCurrentlyActive) {
            setIsUserInputting(false);
            isUserInputtingRef.current = false;
            isUserFocusedRef.current = false;
            isUserInteractingRef.current = false;
        }

        // หากมีการ update form ไปแล้วใน 1 วินาที ให้ skip (ยกเว้นการเปลี่ยน marker หรือ reselect)
        if (now - lastFormUpdateTimeRef.current < 1000 && !isMarkerChanged && !isMarkerReselected) {
            return;
        }
        // รีเซ็ต lastUserSelectedAddress เมื่อเปลี่ยน marker ใหม่ หรือ reselect marker
        if ((isMarkerChanged || isMarkerReselected) && !isResetingMarkerRef.current) {
            // ไม่ต้อง reset marker ก่อนหน้าเพื่อป้องกัน race condition และความซับซ้อน
            // เฉพาะ reset ข้อมูลภายในนี้เท่านั้น
            lastUserSelectedAddress.current = null;
            currentMarkerIdRef.current = selectedMarker.id;
            // Reset interaction flags ทันทีเมื่อเปลี่ยน marker เพื่อให้ form อัพเดทได้
            setIsUserInputting(false);
            isUserInputtingRef.current = false;
            isUserFocusedRef.current = false;
            isUserInteractingRef.current = false;

            // เก็บข้อมูลต้นฉบับของ marker ใหม่ (ถ้ายังไม่เคยเก็บ)
            const currentMarkerId = selectedMarker.id.toString();
            if (!allMarkersOriginalDataRef.current[currentMarkerId]) {
                const markerAddressData = (selectedMarker as any)?.addressData;

                const originalData = {
                    // ถ้ามี addressData ใช้จาก API ถ้าไม่มีใช้ข้อมูลเดิมของ marker
                    originalName: markerAddressData?.user?.givenName || markerAddressData?.givenName || selectedMarker.name || '',
                    originalTel1: markerAddressData?.user?.contact || markerAddressData?.contact || selectedMarker.tel1 || '',
                    originalTel2: markerAddressData?.user?.contact2 || markerAddressData?.contact2 || selectedMarker.tel2 || '',
                    originalTel3: markerAddressData?.user?.contact3 || markerAddressData?.contact3 || selectedMarker.tel3 || '',
                    address: (selectedMarker as any)?.unitID || selectedMarker.address,
                    addressData: markerAddressData,
                    markerId: selectedMarker.id,
                    // เก็บข้อมูลเพิ่มเติมสำหรับการรีเซ็ต
                    x: selectedMarker.x,
                    y: selectedMarker.y,
                    originalX: selectedMarker.originalX,
                    originalY: selectedMarker.originalY,
                    group: selectedMarker.group,
                    color: selectedMarker.color,
                    unitID: (selectedMarker as any)?.unitID
                };
                allMarkersOriginalDataRef.current[currentMarkerId] = originalData;
            }

            // อัพเดท originalMarkerDataRef ให้ชี้ไปที่ข้อมูลของ marker ปัจจุบัน
            originalMarkerDataRef.current = allMarkersOriginalDataRef.current[currentMarkerId];
        }

        // Set ค่าจาก marker ลง form - ใช้ข้อมูลจาก selectedMarker โดยตรงเสมอ
        if (selectedMarker) {
            
            // เก็บข้อมูลต้นฉบับของ marker เฉพาะเมื่อจำเป็น (สำหรับ reset function)
            const currentMarkerId = selectedMarker.id.toString();
            if (!allMarkersOriginalDataRef.current[currentMarkerId]) {
                const initialAddressData = (selectedMarker as any)?.addressData;
                const originalData = {
                    // เก็บข้อมูลต้นฉบับ - ใช้ addressData ก่อน หากไม่มีใช้ข้อมูลเดิมของ marker
                    originalName: initialAddressData?.user?.givenName || initialAddressData?.givenName || selectedMarker.name || '',
                    originalTel1: initialAddressData?.user?.contact || initialAddressData?.contact || selectedMarker.tel1 || '',
                    originalTel2: initialAddressData?.user?.contact2 || initialAddressData?.contact2 || selectedMarker.tel2 || '',
                    originalTel3: initialAddressData?.user?.contact3 || initialAddressData?.contact3 || selectedMarker.tel3 || '',
                    address: (selectedMarker as any)?.unitID || selectedMarker.address,
                    addressData: initialAddressData,
                    markerId: selectedMarker.id,
                    // เก็บข้อมูลเพิ่มเติมสำหรับการรีเซ็ต
                    x: selectedMarker.x,
                    y: selectedMarker.y,
                    originalX: selectedMarker.originalX,
                    originalY: selectedMarker.originalY,
                    group: selectedMarker.group,
                    color: selectedMarker.color,
                    unitID: (selectedMarker as any)?.unitID
                };
                allMarkersOriginalDataRef.current[currentMarkerId] = originalData;
            }

            // อัพเดท originalMarkerDataRef ให้ชี้ไปที่ข้อมูลของ marker ปัจจุบัน (สำหรับ reset function)
            originalMarkerDataRef.current = allMarkersOriginalDataRef.current[currentMarkerId];

            const updateFields: any = {};

            // Set address ถ้ามี - ใช้ข้อมูลจาก selectedMarker ปัจจุบันโดยตรง (ไม่พึ่งพา cache)
            const markerUnitID = (selectedMarker as any)?.unitID || selectedMarker.address;
            
            if (markerUnitID) {
                // ตรวจสอบว่า unitID ของ marker ตรงกับ unit.id ใน options หรือไม่
                const matchingUnit = dataSelectPlan?.unit?.find(unit => unit.id == markerUnitID);
                
                if (matchingUnit) {
                    updateFields.address = matchingUnit.id;
                } else {
                    // ถ้าไม่เจอ matching unit ให้ลองใช้ unitID ตรงๆ
                    updateFields.address = markerUnitID;
                }
            }

            // เอาค่าจาก marker มาใส่ใน input ตรงๆ
            const markerAddressData = (selectedMarker as any)?.addressData;

            // ตรวจสอบ name: ใช้ข้อมูลจาก selectedMarker ปัจจุบันโดยตรง
            if (markerAddressData?.user?.givenName || markerAddressData?.givenName) {
                // มี name จาก addressData (API) ให้ใช้อันนี้ก่อน
                updateFields.name = markerAddressData.user?.givenName || markerAddressData.givenName;
            } else if (selectedMarker.name && selectedMarker.name.trim() !== '') {
                // ถ้าไม่มี name จาก API แต่ marker มี name อยู่แล้ว
                // ตรวจสอบว่า marker.name เป็น address หรือไม่ (ถ้าเป็นตัวเลขล้วน ๆ หรือมี pattern ของ address)
                const isAddressPattern = /^\d+\/\d+$|^\d+$/.test(selectedMarker.name.trim());
                if (!isAddressPattern) {
                    updateFields.name = selectedMarker.name;
                } else {
                    updateFields.name = ''; // ถ้าเป็น address pattern ให้เว้นว่าง
                }
            } else {
                updateFields.name = ''; // ไม่มีข้อมูล name ให้เว้นว่าง
            }

            // Set tel fields จาก selectedMarker ปัจจุบันโดยตรง
            if (markerAddressData?.user && Object.keys(markerAddressData.user).length > 0) {
                // มี user data ใน addressData
                if (markerAddressData.user.contact) updateFields.tel1 = markerAddressData.user.contact;
                if (markerAddressData.user.contact2) updateFields.tel2 = markerAddressData.user.contact2;
                if (markerAddressData.user.contact3) updateFields.tel3 = markerAddressData.user.contact3;
            } else {
                // ใช้ข้อมูลจาก selectedMarker ปัจจุบันโดยตรง
                updateFields.tel1 = selectedMarker.tel1 || '';
                updateFields.tel2 = selectedMarker.tel2 || '';
                updateFields.tel3 = selectedMarker.tel3 || '';
            }

            // Set ค่าลง form - อนุญาตการเปลี่ยน marker เสมอ, ป้องกันแค่การ reset ระหว่าง input
            const isUserCurrentlyInteracting = isUserFocusedRef.current ||
                isUserInputtingRef.current ||
                isUserInteractingRef.current ||
                (document.activeElement && document.activeElement.tagName.match(/input|select|textarea/i));

            const shouldUpdateForm = isMarkerChanged || isMarkerReselected || // อนุญาตการเปลี่ยน marker และ reselect เสมอ
                (!isUserCurrentlyInteracting && (now - lastFormUpdateTimeRef.current >= 2000));

            if (shouldUpdateForm) {
                // บังคับ update form ทันทีเมื่อเปลี่ยน marker
                form.setFieldsValue(updateFields);
                lastFormUpdateTimeRef.current = now;
                
                // Double-check address field specifically
                setTimeout(() => {
                    const currentAddress = form.getFieldValue('address');
                    if (updateFields.address && currentAddress !== updateFields.address) {
                        form.setFieldValue('address', updateFields.address);
                    }
                }, 50);
            }
        }
        // ตรวจสอบ validation หลังอัพเดท form (เฉพาะเมื่อไม่ได้ cancel และมี active marker)
        if (!isCancellingRef.current && hasActiveMarker) {
            validateForm();
        }
    }, [selectedMarker?.id, form]); // ลบ addressData ออกจาก deps เพื่อลดการ trigger ที่ไม่จำเป็น

    // useEffect สำหรับ focus ที่ input Name เมื่อสร้าง marker ใหม่
    useEffect(() => {
        if (shouldFocusNameInput && nameInputRef.current) {
            // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM ถูก render เสร็จแล้ว
            setTimeout(() => {
                nameInputRef.current?.focus();
                if (onFocusHandled) {
                    onFocusHandled();
                }
            }, 100);
        }
    }, [shouldFocusNameInput, onFocusHandled]);

    // ฟังก์ชันตรวจสอบ validation
    const validateForm = () => {
        // ป้องกัน validation ขณะ cancel
        if (isCancellingRef.current) {
            return;
        }

        // ป้องกัน validation เมื่อไม่มี active marker - แต่อนุญาตถ้าเพิ่งปลดล็อค marker
        if (!hasActiveMarker && !selectedMarker) {
            setIsFormValid(false); // บังคับ disable เมื่อไม่มี active marker
            return;
        }
        const values = form.getFieldsValue();
        // ตรวจสอบว่าช่อง address มีข้อมูลหรือไม่
        const hasAddress = values.address !== undefined && values.address !== null && values.address !== '';

        // อนุญาตให้ valid ถ้ามี selectedMarker หรือ hasActiveMarker
        const canValidate = hasActiveMarker || !!selectedMarker;
        // ตั้งค่า isFormValid เฉพาะเมื่อมี marker ที่เลือกและมี address
        setIsFormValid(hasAddress && canValidate);
    };

    // useEffect สำหรับเคลียร์ข้อมูลใน form เมื่อไม่มี marker ที่เลือก
    useEffect(() => {
        if (!hasActiveMarker && !selectedMarker && !isCancellingRef.current) {
            form.resetFields();
            // รีเซ็ต flags และ refs
            isUserInputtingRef.current = false;
            isUserFocusedRef.current = false;
            isUserInteractingRef.current = false;
            setIsUserInputting(false);
            lastUserSelectedAddress.current = null;
            currentMarkerIdRef.current = null;
            
            // บังคับ disable form เมื่อไม่มี marker เลย
            setIsFormValid(false);
        } else if (isCancellingRef.current) {
            // console.log('🚫 Skipping form clear during cancel operation');
        } else if (selectedMarker || hasActiveMarker) {
            // เมื่อมี selectedMarker หรือ hasActiveMarker ให้เรียก validateForm เพื่อตรวจสอบความถูกต้อง
            // console.log('FormVillageLocation - Have selectedMarker or hasActiveMarker, running validation');
            validateForm();
        }
    }, [hasActiveMarker, selectedMarker, form, validateForm]);

    // ฟังก์ชันรีเซ็ต marker กลับเป็นค่าเดิมจาก API
    const resetMarkerToOriginal = (markerId: number | string, originalData: any) => {
        // หา roomAddress จาก dataSelectPlan
        const selectedUnit = dataSelectPlan?.unit?.find((unit: any) => unit.id === Number(originalData.address));
        const roomAddressText = selectedUnit?.roomAddress || originalData.originalName || '';

        // สร้าง marker object ที่มีข้อมูลต้นฉบับ
        const resetMarkerData = {
            ...originalData, // ใช้ข้อมูลต้นฉบับทั้งหมด
            id: markerId,
            name: roomAddressText,
            tel1: originalData.originalTel1 || '',
            tel2: originalData.originalTel2 || '',
            tel3: originalData.originalTel3 || '',
            address: originalData.address || '',
            addressData: originalData.addressData,
            roomAddress: roomAddressText,
            // ใช้ค่า x, y จาก originalX, originalY
            x: originalData.originalX,
            y: originalData.originalY,
            // คงค่า originalX, originalY ไว้
            originalX: originalData.originalX,
            originalY: originalData.originalY,
            group: originalData.group,
            color: originalData.color,
            unitID: originalData.unitID
        };
        // ใช้ onMarkerUpdate เพื่ออัพเดท marker ในระบบ
        if (onMarkerUpdate) {
            onMarkerUpdate(markerId.toString(), resetMarkerData);
        }
    };

    // ฟังก์ชันจัดการเมื่อ focus/blur ที่ input fields
    const handleInputFocus = () => {
        isUserFocusedRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        isUserInputtingRef.current = true;
        lastFormUpdateTimeRef.current = Date.now(); // บันทึกเวลาที่ user เริ่ม focus
    };

    const handleInputBlur = () => {
        // ใช้ delay ยาวขึ้นเพื่อป้องกันการ refresh เมื่อ click marker อื่น
        setTimeout(() => {
            isUserFocusedRef.current = false;
            setIsUserInputting(false);
            // รอเพิ่มอีกเยอะก่อน unlock interaction เพื่อป้องกัน race condition
            setTimeout(() => {
                isUserInputtingRef.current = false;
                setTimeout(() => {
                    isUserInteractingRef.current = false;
                }, 100); // รอ 1 วินาทีเต็ม
            }, 100);
        }, 50);
    };

    // ฟังก์ชันจัดการเมื่อแก้ไขชื่อ
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;

        // Set strong protection flags เมื่อ user กำลังพิมพ์
        isUserInputtingRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        lastFormUpdateTimeRef.current = Date.now();

        if (selectedMarker && onMarkerNameChange) {
            onMarkerNameChange(selectedMarker.id, newName);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อแก้ไข address
    const handleAddressChange = async (value: string) => {
        try {
            if (selectedMarker && onMarkerAddressChange) {
                let storeAddress = await getAddress(Number(value))

                if (storeAddress.status) {
                    // เอาค่าจาก API
                    let apiName = storeAddress.result.user?.givenName || storeAddress.result.givenName || '';
                    let tel = storeAddress.result.user?.contact || storeAddress.result.contact || '';
                    let tel2 = storeAddress.result.user?.contact2 || storeAddress.result.contact2 || '';
                    let tel3 = storeAddress.result.user?.contact3 || storeAddress.result.contact3 || '';

                    // ดึง roomAddress จาก dataSelectPlan.unit
                    const selectedUnit = dataSelectPlan?.unit?.find((unit: any) => unit.id === Number(value));
                    // ดึง roomAddress และตรวจสอบค่า
                    const roomAddressText = selectedUnit?.roomAddress || '';
                    // อัพเดท marker name ทันทีด้วย roomAddress
                    if (selectedMarker && onMarkerNameChange && roomAddressText) {
                        onMarkerNameChange(selectedMarker.id, roomAddressText);
                    }
                    // อัพเดทข้อมูลใน form
                    const fieldsToUpdate = {
                        name: apiName,
                        tel1: tel,
                        tel2: tel2,
                        tel3: tel3,
                    };
                    form.setFieldsValue(fieldsToUpdate);

                    // อัพเดท address
                    if (selectedMarker && onMarkerAddressChange) {
                        onMarkerAddressChange(selectedMarker.id, value);
                    }
                } else {
                    // ถ้าไม่มีข้อมูลจาก API ให้เคลียร์ fields
                    const clearFields = {
                        name: '',
                        tel1: '',
                        tel2: '',
                        tel3: '',
                    };
                    form.setFieldsValue(clearFields);
                }
            }
        } catch (error) {
            // ถ้าเกิด error ให้เคลียร์ fields
            const clearFields = {
                name: '',
                tel1: '',
                tel2: '',
                tel3: '',
            };
            form.setFieldsValue(clearFields);
        }

        // เรียกใช้ validateForm หลังจากมีการเปลี่ยนแปลงค่า address (เฉพาะเมื่อมี active marker)
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อแก้ไข tel1
    const handleTel1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newTel1 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว

        // ถ้าไม่ขึ้นต้นด้วย 0 และมีตัวเลข ให้เพิ่ม 0 ข้างหน้า
        if (newTel1.length > 0 && !newTel1.startsWith('0')) {
            newTel1 = '0' + newTel1.slice(0, 9); // เพิ่ม 0 ข้างหน้า และตัดให้เหลือ 10 ตัว
        }

        // Set strong protection flags เมื่อ user กำลังพิมพ์
        isUserInputtingRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        lastFormUpdateTimeRef.current = Date.now();
        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel1Change) {
            onMarkerTel1Change(selectedMarker.id, newTel1);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อแก้ไข tel2
    const handleTel2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newTel2 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว

        // ถ้าไม่ขึ้นต้นด้วย 0 และมีตัวเลข ให้เพิ่ม 0 ข้างหน้า
        if (newTel2.length > 0 && !newTel2.startsWith('0')) {
            newTel2 = '0' + newTel2.slice(0, 9); // เพิ่ม 0 ข้างหน้า และตัดให้เหลือ 10 ตัว
        }

        // Set strong protection flags เมื่อ user กำลังพิมพ์
        isUserInputtingRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        lastFormUpdateTimeRef.current = Date.now();
        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel2Change) {
            onMarkerTel2Change(selectedMarker.id, newTel2);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อแก้ไข tel3
    const handleTel3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newTel3 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว

        // ถ้าไม่ขึ้นต้นด้วย 0 และมีตัวเลข ให้เพิ่ม 0 ข้างหน้า
        if (newTel3.length > 0 && !newTel3.startsWith('0')) {
            newTel3 = '0' + newTel3.slice(0, 9); // เพิ่ม 0 ข้างหน้า และตัดให้เหลือ 10 ตัว
        }

        // Set strong protection flags เมื่อ user กำลังพิมพ์
        isUserInputtingRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        lastFormUpdateTimeRef.current = Date.now();

        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel3Change) {
            onMarkerTel3Change(selectedMarker.id, newTel3);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อกด Submit (Confirm)
    const handleSubmit = async () => {
        ConfirmModal({
            title: "Confirm Update Data",
            message: "",
            okMessage: "Confirm",
            cancelMessage: "Cancel",
            onOk: async () => {
                // Set flag เพื่อป้องกัน racing condition
                isConfirmingRef.current = true;
                // ตรวจสอบ validation ก่อน (เหลือแค่ address)
                const values = form.getFieldsValue();
                if (!values.address) {
                    return;
                }
                // ดึงข้อมูล marker ที่กำลังสร้างหรือแก้ไขจาก form
                let colorStatus = {
                    "green": "normal",
                    "red": "emergency",
                    "yellow": "warning",
                }

                // หา roomAddress ที่ตรงกับ address ที่เลือก
                const selectedUnit = dataSelectPlan?.unit?.find((unit: any) => unit.id.toString() === values.address.toString());
                const markerName = selectedUnit?.roomAddress || values.name || '';

                // ตรวจสอบว่าเป็นการสร้างใหม่หรือแก้ไข โดยใช้ isCreatingMode prop
                const isCreateMode = isCreatingMode === true;
                const isUpdateMode = isCreatingMode === false;
                // แสดงข้อความตามโหมด
                if (isCreateMode) {
                    const markerData: MarkerProcess = {
                        // villageId: idVillage,
                        planInfoId:  dataAllMap?.planInfoId || '',
                        floorId: Number(floorIdGlobal)  || null,
                        unitId: Number(values.address), // ใช้ค่าจาก form address ซึ่งจะเป็น unitID
                        markerType: "marker",
                        markerInfo: {
                            // id: selectedMarker?.id?.toString() || "",
                            name: markerName, // ใช้ roomAddress แทน name จาก form
                            status: colorStatus[selectedMarker?.color as keyof typeof colorStatus],
                            position: {
                                x: selectedMarker?.x?.toFixed(2) || "",
                                y: selectedMarker?.y?.toFixed(2) || ""
                            },
                            size: 6,
                            rotationDegrees: "0°",
                            group: selectedMarker?.group || ""
                        },
                    };


                    let data = await createMarker(markerData)
                    if (data.status) {
                        SuccessModal("Marker created successfully", 900)
                        // อัพเดท marker ด้วยข้อมูลที่ได้จาก API
                        if (data.result && selectedMarker) {
                            // ตรวจสอบ structure ของ data.result
                            let newMarkerData = null;

                            // Case 1: data.result.marker เป็น array - ใช้ตัวสุดท้าย
                            if (data.result.marker && Array.isArray(data.result.marker) && data.result.marker.length > 0) {
                                newMarkerData = data.result.marker[data.result.marker.length - 1];
                            }
                            // Case 2: data.result เป็น marker object โดยตรง
                            else if (data.result.id) {
                                newMarkerData = data.result;
                            }
                            // Case 3: data.result เป็น array ของ markers - ใช้ตัวสุดท้าย
                            else if (Array.isArray(data.result) && data.result.length > 0) {
                                newMarkerData = data.result[data.result.length - 1];
                            }

                            if (newMarkerData) {
                                // สร้าง updated marker object ด้วยข้อมูลจาก API
                                const updatedMarker = {
                                    ...selectedMarker, // ใช้ข้อมูลเดิมของ selectedMarker เป็นฐาน
                                    id: newMarkerData.id ? (typeof newMarkerData.id === 'string' ? newMarkerData.id : newMarkerData.id.toString()) : selectedMarker.id, // แปลง id เป็น string หรือใช้ selectedMarker.id เดิม
                                    name: markerName, // ใช้ roomAddress แทน name จาก form
                                    unitID: newMarkerData.unitID || newMarkerData.address || values.address, // ใช้ unitID จาก API หรือจาก form
                                    address: values.address, // ใช้ address จาก form เสมอ
                                    roomAddress: newMarkerData.roomAddress || "",
                                    unitNo: newMarkerData.unitNo || "",
                                    tel1: values.tel1 || "", // ใช้ tel จาก form เสมอ
                                    tel2: values.tel2 || "",
                                    tel3: values.tel3 || ""
                                };
                                // อัพเดท marker ทั้งหมดก่อนปิด form
                                if (onMarkerUpdate) {
                                    // แปลง selectedMarker.id เป็น string เพื่อส่งไปยัง handleMarkerUpdate
                                    onMarkerUpdate(selectedMarker.id.toString(), updatedMarker);
                                }
                            }
                            if (data) {
                                // อัพเดท marker
                                if (data.result.marker && Array.isArray(data.result.marker)) {
                                  setDataMapAll((prev: any) => ({
                                    ...prev,
                                    marker: data.result.marker
                                  }));
                                }
                            }


                        } 
                    }

                    // Reset focus/input flags หลัง submit
                    isUserFocusedRef.current = false;
                    isUserInputtingRef.current = false;
                    isUserInteractingRef.current = false;
                    setIsUserInputting(false);
                    // ยกเลิกการเลือก marker เพื่อลบขอบสีแดง
                    if (onMarkerSelect) {
                        onMarkerSelect(null);
                    }
                    
                    // IMPORTANT: Reset currentMarkerIdRef และ clear cache หลังจาก create เพื่อให้ marker ใหม่ถูกตรวจจับว่าเป็นการเปลี่ยน marker
                    currentMarkerIdRef.current = null;
                    // Clear ข้อมูล cache ทั้งหมดเพื่อให้ marker ใหม่ใช้ข้อมูลจริง
                    allMarkersOriginalDataRef.current = {};
                    originalMarkerDataRef.current = null;
                    
                    // Clear confirming flag
                    setTimeout(() => {
                        isConfirmingRef.current = false;
                    }, 100);

                    if (onConfirm) {
                        onConfirm();
                    }
                } else if (isUpdateMode) {
                    const markerData: MarkerProcess = {
                        markerId: selectedMarker?.id?.toString() || "",
                        unitId: Number(values.address), // ใช้ค่าจาก form address ซึ่งจะเป็น unitID
                        // selectedMarker?.unitID || Number(values.address),
                        
                        floorId: Number(floorIdGlobal) || null,
                        markerType: "marker",
                        markerInfo: {
                            // id: selectedMarker?.id?.toString() || "",
                            name: markerName, // ใช้ roomAddress แทน name จาก form
                            status: colorStatus[selectedMarker?.color as keyof typeof colorStatus],
                            position: {
                                x: selectedMarker?.x?.toFixed(2) || "",
                                y: selectedMarker?.y?.toFixed(2) || ""
                            },
                            size: 6,
                            rotationDegrees: "0°",
                            group: selectedMarker?.group || ""
                        },
                    };

                    let data = await updateMarker(markerData)
                    if (data.status) {
                        SuccessModal("แก้ไข Marker สำเร็จ",900)
                        // สร้าง updatedMarker object ที่มีค่า originalX และ originalY เป็นตำแหน่งปัจจุบัน
                        if (selectedMarker && selectedMarker.x !== undefined && 
                            selectedMarker.y !== undefined) {
                            const updatedMarker = {
                                ...selectedMarker,
                                name: markerName, // อัพเดทชื่อด้วย
                                address: values.address, // อัพเดท address ด้วย
                                tel1: values.tel1 || "",
                                tel2: values.tel2 || "",
                                tel3: values.tel3 || "",
                                originalX: selectedMarker.x, // set ค่า originalX เป็นตำแหน่งปัจจุบัน
                                originalY: selectedMarker.y, // set ค่า originalY เป็นตำแหน่งปัจจุบัน
                            };

                            // อัพเดทค่าใน allMarkersOriginalDataRef ด้วย
                            const currentMarkerId = selectedMarker.id.toString();
                            if (allMarkersOriginalDataRef.current[currentMarkerId]) {
                                allMarkersOriginalDataRef.current[currentMarkerId] = {
                                    ...allMarkersOriginalDataRef.current[currentMarkerId],
                                    x: selectedMarker.x,
                                    y: selectedMarker.y,
                                    originalX: selectedMarker.x,
                                    originalY: selectedMarker.y
                                };
                            }

                            // อัพเดท marker ด้วยค่าใหม่
                            if (onMarkerUpdate) {
                                // ตรวจสอบว่ามี wrapper function หรือไม่
                                if ((window as any).villageMapOnMarkerUpdateRef?.current) {
                                    (window as any).villageMapOnMarkerUpdateRef.current(selectedMarker.id.toString(), updatedMarker);
                                } else {
                                    onMarkerUpdate(selectedMarker.id.toString(), updatedMarker);
                                }
                            }
                        }
                        if (data) {
                            // อัพเดท marker
                            if (data.result.marker && Array.isArray(data.result.marker)) {
                              setDataMapAll((prev: any) => ({
                                ...prev,
                                marker: data.result.marker
                              }));
                            }
                        }


                    }

                    // Reset focus/input flags หลัง submit
                    isUserFocusedRef.current = false;
                    isUserInputtingRef.current = false;
                    isUserInteractingRef.current = false;
                    setIsUserInputting(false);
                    // ยกเลิกการเลือก marker เพื่อลบขอบสีแดง
                    if (onMarkerSelect) {
                        onMarkerSelect(null);
                    }
                    
                    // IMPORTANT: Reset currentMarkerIdRef และ clear cache หลังจาก update เพื่อให้ marker ใหม่ถูกตรวจจับว่าเป็นการเปลี่ยน marker
                    currentMarkerIdRef.current = null;
                    // Clear ข้อมูล cache ทั้งหมดเพื่อให้ marker ใหม่ใช้ข้อมูลจริง
                    allMarkersOriginalDataRef.current = {};
                    originalMarkerDataRef.current = null;
                    // Clear confirming flag หลังจาก delay เล็กน้อย
                    setTimeout(() => {
                        isConfirmingRef.current = false;
                    }, 100);

                    if (onConfirm) {
                        onConfirm();
                    }
                }
            },
            onCancel: async () => {

            }
        });





    };

    // ตรวจสอบว่าควร disable ฟอร์มหรือไม่
    const isFormDisabled = mapMode === 'preview';

    // คำนวณ addressDisabled ด้วย useMemo เพื่อให้แน่ใจว่า update ทันที
    const addressDisabled = useMemo(() => {
        // แก้ไข: อนุญาตให้ enable ถ้ามี selectedMarker และ hasActiveMarker แม้ว่า isFormValid จะเป็น false
        // เพราะ isFormValid เป็น false เพราะยังไม่มี address แต่เราต้องให้ user เลือก address ได้
        const disabled = isFormDisabled || (!hasActiveMarker && !selectedMarker) || isCancellingRef.current;
        return disabled;
    }, [isFormDisabled, hasActiveMarker, selectedMarker, isFormValid]);
    return (
        <div className=" mx-auto bg-[#F6F6F6] p-6 mt-4 lg:mt-0 h-full">
            <div className="font-semibold text-xl text-center mb-6">
                Pin the village location on the map
            </div>
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label={<span className="text-[#002C55]">Address </span>}
                    name="address"
                    rules={[{ required: true, message: 'กรุณาเลือก Address' }]}
                >

                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)
                                ?.toLowerCase()
                                ?.includes(input.toLowerCase()) ?? false
                        }
                        onChange={handleAddressChange}
                        disabled={addressDisabled}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={!hasActiveMarker ? "No active marker" : "Search or select address"}
                    >
                        {dataSelectPlan?.unit?.map((unit: any) => (
                            <Select.Option key={unit.id} value={unit.id}>
                                {unit?.roomAddress}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={<span className="text-[#002C55]">Name </span>}
                    name="name"
                >
                    <Input
                        ref={nameInputRef}
                        disabled={true}
                        onChange={handleNameChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                <Form.Item
                    label={<span className="text-[#002C55]">Tel 1 </span>}
                    name="tel1"
                >
                    <Input
                        onChange={handleTel1Change}
                        maxLength={10}
                        placeholder="Tel. 0985574483 (starts with 0)"
                        disabled={isFormDisabled || true}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 2</span>} name="tel2">
                    <Input
                        onChange={handleTel2Change}
                        maxLength={10}
                        placeholder="Tel. 0985574484 (starts with 0)"
                        disabled={isFormDisabled || true}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 3</span>} name="tel3">
                    <Input
                        onChange={handleTel3Change}
                        maxLength={10}
                        placeholder="Tel. 0985574485 (starts with 0)"
                        disabled={isFormDisabled || true}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                {/* <Form.Item label={<span className="text-[#002C55] !hidden ">Latitude</span>} name="latitude">
                    <Input  className="!hidden" disabled />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55] !hidden ">Longitude</span>} name="longitude">
                    <Input className="!hidden" disabled />
                </Form.Item> */}
                <Form.Item>
                    <>
                        
                        {/* <div> AAA  {isFormDisabled.toString()} </div> */}
                        {/* <div> BBB {!(isFormDisabled || !isFormValid).toString()} </div> */}
                        <Button
                            type="primary"
                            block
                            style={{
                                marginBottom: 12,
                                ...(isFormDisabled || !isFormValid ? {
                                    backgroundColor: '#d1d5db',
                                    borderColor: '#d1d5db',
                                    color: '#6b7280'
                                } : {})
                            }}
                            className={`
                                ${(isFormDisabled || !isFormValid) ?
                                    'hover:!text-white hover:!bg-gray-400 hover:!border-gray-400' :
                                    ''
                                }
                            `}
                            onClick={handleSubmit}
                            disabled={isFormDisabled || !isFormValid}
                        >
                            Confirm
                        </Button>
                        <Button
                            type="default"
                            block
                            onClick={() => {
                                // ตั้ง flag เพื่อป้องกัน useEffect ทำงานขณะ cancel
                                isCancellingRef.current = true;
                                // เคลียร์ค่าในฟอร์มทั้งหมดก่อนอื่น
                                form.resetFields();
                                // เคลียร์ state เพิ่มเติม - บังคับให้ form invalid เพื่อ disable Address
                                setIsFormValid(false);
                                // Reset focus/input flags
                                isUserFocusedRef.current = false;
                                isUserInputtingRef.current = false;
                                isUserInteractingRef.current = false;
                                setIsUserInputting(false);
                                
                                // เคลียร์ ref data - รีเซ็ต currentMarkerIdRef เป็น null เพื่อให้ unlock marker ทำงาน
                                lastUserSelectedAddress.current = null;
                                currentMarkerIdRef.current = null; // สำคัญ: รีเซ็ตเป็น null เพื่อให้ isMarkerReselected = true
                                originalMarkerDataRef.current = null;
                                lastFormUpdateTimeRef.current = 0;
                                // ยกเลิกการเลือก marker ทันที
                                if (onMarkerSelect) {
                                    onMarkerSelect(null);
                                }
                                // บังคับ disable form หลายครั้งเพื่อให้แน่ใจ
                                const forceDisableForm = () => {
                                    setIsFormValid(false);
                                };
                                // เรียกใช้หลายครั้งด้วย delay เพื่อให้แน่ใจ
                                setTimeout(forceDisableForm, 500);

                                // รีเซ็ต cancelling flag หลังจาก delay สั้น ๆ
                                setTimeout(() => {
                                    isCancellingRef.current = false;
                                    // บังคับ disable อีกครั้งหลังจาก cancel flag reset
                                }, 300); // เพิ่มเวลา delay เป็น 300ms เพื่อให้แน่ใจว่า state update เสร็จสิ้น

                                // แยกแยะ marker จำลอง (temporary) กับ marker ที่มีอยู่แล้ว (existing)
                                // Temporary marker จะมี ID เป็น timestamp (Date.now()) ซึ่งเป็นตัวเลขขนาดใหญ่ (13 หลัก)
                                // Existing marker จะมี ID จาก database ซึ่งเป็นตัวเลขปกติ (1-6 หลัก)
                                const isTemporaryMarker = typeof selectedMarker?.id === 'number'
                                // ลบเฉพาะ marker จำลองเท่านั้น
                                
                                if (isTemporaryMarker && onMarkerDelete) {
                                    const markerId = typeof selectedMarker.id === 'string' ? parseInt(selectedMarker.id) : selectedMarker.id;
                                    onMarkerDelete(markerId);
                                } else {
                                    // สำหรับ existing marker ให้รีเซ็ตกลับเป็นค่าเดิมก่อน cancel
                                    if (selectedMarker && !isTemporaryMarker) {
                                        const currentMarkerId = selectedMarker.id.toString();
                                        const originalData = allMarkersOriginalDataRef.current[currentMarkerId];
                                        if (originalData) {
                                            resetMarkerToOriginal(selectedMarker.id, originalData);
                                        }
                                    }

                                    if (onCancel) {
                                        onCancel();
                                    }
                                }
                                
                            }}
                            disabled={isFormDisabled}
                        >
                            Cancel
                        </Button>
                    </>
                </Form.Item>
            </Form>
        </div>
    );
}

export default FormVillageLocation;