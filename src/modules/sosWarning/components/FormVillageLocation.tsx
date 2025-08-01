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
    onMarkerNameChange?: (markerId: number | string, newName: string) => void;
    onMarkerAddressChange?: (markerId: number | string, newAddress: string) => void;
    onMarkerTel1Change?: (markerId: number | string, newTel1: string) => void;
    onMarkerTel2Change?: (markerId: number | string, newTel2: string) => void;
    onMarkerTel3Change?: (markerId: number | string, newTel3: string) => void;
    onMarkerUpdate?: (markerId: string, updatedMarker: any) => void; // เพิ่ม callback สำหรับอัพเดท marker ทั้งหมด
    mapMode?: 'preview' | 'work-it';
    shouldFocusNameInput?: boolean;
    onFocusHandled?: () => void;
    dataSelectPlan?: dataSelectPlan;
    isCreatingMode?: boolean;
    planType: string;
    onMarkerDelete?: (markerId: number) => void;
    idVillage: string;
    setShouldShowVillageForm: (status: boolean) => void;
    setDataMapAll: (data: any) => void;
    onMarkerSelect?: (marker: any | null) => void;
    hasActiveMarker?: boolean; // เพิ่ม prop สำหรับตรวจสอบว่ามี active marker หรือไม่
    editMarkerData?: any;
    onEditMarkerData?: (data: any) => void;
}

const FormVillageLocation = ({ onCancel, onConfirm, latitude,
    longitude, selectedMarker, onMarkerNameChange,
    onMarkerAddressChange, onMarkerTel1Change, onMarkerTel2Change,
    onMarkerTel3Change, onMarkerUpdate, mapMode = 'work-it', shouldFocusNameInput,
    onFocusHandled, dataSelectPlan, isCreatingMode, planType,
    onMarkerDelete, idVillage, setDataMapAll, onMarkerSelect, hasActiveMarker,
    editMarkerData, onEditMarkerData, setShouldShowVillageForm }: FormVillageLocationProps) => {
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

    // Debug useEffect สำหรับ hasActiveMarker
    useEffect(() => {
        console.log('🔍 hasActiveMarker changed:', {
            hasActiveMarker,
            selectedMarker: !!selectedMarker,
            selectedMarkerID: selectedMarker?.id,
            timestamp: new Date().toISOString()
        });
    }, [hasActiveMarker, selectedMarker]);

    // อัพเดทค่า latitude และ longitude เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        console.log('FormVillageLocation useEffect - received props:', { latitude, longitude });
        if (latitude !== undefined && longitude !== undefined) {
            console.log('FormVillageLocation - updating form values:', { latitude, longitude });
            form.setFieldsValue({
                latitude: latitude,
                longitude: longitude
            });
        }
    }, [latitude, longitude, form]);

    // อัพเดทค่าชื่อ และ address ของ marker เมื่อมีการเลือก marker ใหม่
    useEffect(() => {
        console.log('🔍 useEffect triggered - checking if should update form');
        console.log('🔍 Current props:', {
            hasSelectedMarker: !!selectedMarker,
            selectedMarkerId: selectedMarker?.id,
            hasActiveMarker,
            isCancelling: isCancellingRef.current
        });

        // ถ้ากำลังอยู่ในสถานะ cancelling ให้ skip การ update
        if (isCancellingRef.current) {
            console.log('🚫 Form is cancelling, skipping useEffect update');
            return;
        }

        // ถ้า selectedMarker เป็น null ให้ skip การ update เพื่อป้องกันการ enable form อีกครั้ง
        if (!selectedMarker) {
            console.log('🚫 selectedMarker is null, skipping useEffect update to prevent re-enabling form');
            return;
        }

        // เพิ่มการตรวจสอบ hasActiveMarker - ถ้าไม่มี active marker ให้ผ่านไปได้ (เพื่อ unlock marker)
        if (!hasActiveMarker) {
            console.log('⚠️ hasActiveMarker is false - this could be unlock marker scenario, proceeding anyway');
        }

        // ตรวจสอบการเปลี่ยน marker หรือการ unlock marker เดิม
        const isMarkerChanged = selectedMarker && currentMarkerIdRef.current !== selectedMarker.id;
        // เพิ่มการตรวจสอบการ unlock marker: ถ้า marker ID เดิมแต่เป็นการเลือกใหม่หลังจาก clear หรือ cancel
        const isMarkerReselected = selectedMarker && (
            currentMarkerIdRef.current === null || // หลังจาก cancel
            (currentMarkerIdRef.current !== selectedMarker.id && lastFormUpdateTimeRef.current === 0) // หลังจาก reset
        );
        const now = Date.now();

        console.log('🔍 Current state:', {
            isMarkerChanged,
            isMarkerReselected,
            currentMarkerId: currentMarkerIdRef.current,
            newMarkerId: selectedMarker?.id,
            isUserInputting: isUserInputtingRef.current,
            isUserInteracting: isUserInteractingRef.current,
            isUserFocused: isUserFocusedRef.current,
            timeSinceLastUpdate: now - lastFormUpdateTimeRef.current,
            isCancelling: isCancellingRef.current
        });

        // ถ้า user กำลัง interact กับ form และไม่ใช่การเปลี่ยน marker หรือ reselect marker ให้ skip การ update
        const hasActiveElement = document.activeElement && document.activeElement.tagName.match(/input|select|textarea/i);
        const isUserCurrentlyActive = isUserInputtingRef.current || isUserInteractingRef.current || isUserFocusedRef.current || hasActiveElement;

        if (isUserCurrentlyActive && !isMarkerChanged && !isMarkerReselected) {
            console.log('🚫 User is actively interacting with form, BLOCKING useEffect updates (but allowing marker change)');
            console.log('🚫 Interaction state:', {
                isUserInputting: isUserInputtingRef.current,
                isUserInteracting: isUserInteractingRef.current,
                isUserFocused: isUserFocusedRef.current,
                hasActiveElement: hasActiveElement,
                activeElementTag: document.activeElement?.tagName,
                activeElementType: (document.activeElement as any)?.type,
                isMarkerChanged
            });
            return;
        }

        // หากเป็นการเปลี่ยน marker หรือ reselect marker ขณะที่ user กำลัง interact ให้ reset flags ก่อน
        if ((isMarkerChanged || isMarkerReselected) && isUserCurrentlyActive) {
            console.log('🔄 Marker changed/reselected while user interacting - resetting flags to allow update');
            setIsUserInputting(false);
            isUserInputtingRef.current = false;
            isUserFocusedRef.current = false;
            isUserInteractingRef.current = false;
        }

        // หากมีการ update form ไปแล้วใน 1 วินาที ให้ skip (ยกเว้นการเปลี่ยน marker หรือ reselect)
        if (now - lastFormUpdateTimeRef.current < 1000 && !isMarkerChanged && !isMarkerReselected) {
            console.log('🚫 Recent form update detected, skipping to prevent flicker');
            return;
        }

        console.log('✅ Proceeding with useEffect update');

        // รีเซ็ต lastUserSelectedAddress เมื่อเปลี่ยน marker ใหม่ หรือ reselect marker
        if ((isMarkerChanged || isMarkerReselected) && !isResetingMarkerRef.current) {
            console.log('🔄 Marker changed/reselected from', currentMarkerIdRef.current, 'to', selectedMarker?.id);

            // ไม่ต้อง reset marker ก่อนหน้าเพื่อป้องกัน race condition และความซับซ้อน
            // เฉพาะ reset ข้อมูลภายในนี้เท่านั้น
            lastUserSelectedAddress.current = null;
            currentMarkerIdRef.current = selectedMarker.id;

            console.log('✅ Updated currentMarkerIdRef to:', selectedMarker.id);

            // Reset interaction flags ทันทีเมื่อเปลี่ยน marker เพื่อให้ form อัพเดทได้
            console.log('🔓 Marker changed - resetting all interaction flags to allow form update');
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
                console.log('Stored original data for marker:', currentMarkerId, originalData);
            }

            // อัพเดท originalMarkerDataRef ให้ชี้ไปที่ข้อมูลของ marker ปัจจุบัน
            originalMarkerDataRef.current = allMarkersOriginalDataRef.current[currentMarkerId];
        }

        // Set ค่าจาก marker ลง form  
        if (selectedMarker) {
            console.log('📋 Processing selectedMarker:', {
                id: selectedMarker.id,
                name: selectedMarker.name,
                address: selectedMarker.address,
                unitID: (selectedMarker as any)?.unitID
            });

            // เก็บข้อมูลต้นฉบับของ marker ถ้ายังไม่เคยเก็บ
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
                console.log('Stored initial marker data:', currentMarkerId, originalData);
            }

            // อัพเดท originalMarkerDataRef ให้ชี้ไปที่ข้อมูลของ marker ปัจจุบัน
            originalMarkerDataRef.current = allMarkersOriginalDataRef.current[currentMarkerId];

            const updateFields: any = {};

            // Set address ถ้ามี
            const addressToUse = (selectedMarker as any)?.unitID || selectedMarker.address;
            if (addressToUse) {
                updateFields.address = addressToUse;
            }

            // เอาค่าจาก marker มาใส่ใน input ตรงๆ
            const markerAddressData = (selectedMarker as any)?.addressData;
            console.log('📊 Marker addressData:', markerAddressData);

            // ตรวจสอบ name: ใช้ addressData ก่อน (ข้อมูลจาก API) แล้วค่อยใช้ marker.name
            if (markerAddressData?.user?.givenName || markerAddressData?.givenName) {
                // มี name จาก addressData (API) ให้ใช้อันนี้ก่อน
                updateFields.name = markerAddressData.user?.givenName || markerAddressData.givenName;
                console.log('🎯 Using name from addressData:', updateFields.name);
            } else if (selectedMarker.name && selectedMarker.name.trim() !== '') {
                // ถ้าไม่มี name จาก API แต่ marker มี name อยู่แล้ว
                // ตรวจสอบว่า marker.name เป็น address หรือไม่ (ถ้าเป็นตัวเลขล้วน ๆ หรือมี pattern ของ address)
                const isAddressPattern = /^\d+\/\d+$|^\d+$/.test(selectedMarker.name.trim());
                if (!isAddressPattern) {
                    updateFields.name = selectedMarker.name;
                    console.log('🎯 Using marker name (not address pattern):', updateFields.name);
                } else {
                    updateFields.name = ''; // ถ้าเป็น address pattern ให้เว้นว่าง
                    console.log('🎯 Marker name looks like address, setting empty');
                }
            } else {
                updateFields.name = ''; // ไม่มีข้อมูล name ให้เว้นว่าง
                console.log('🎯 No name data available, setting empty');
            }

            // Set tel fields จาก addressData หรือ marker
            if (markerAddressData?.user && Object.keys(markerAddressData.user).length > 0) {
                // มี user data ใน addressData
                if (markerAddressData.user.contact) updateFields.tel1 = markerAddressData.user.contact;
                if (markerAddressData.user.contact2) updateFields.tel2 = markerAddressData.user.contact2;
                if (markerAddressData.user.contact3) updateFields.tel3 = markerAddressData.user.contact3;
            } else {
                // ใช้ข้อมูลจาก selectedMarker หรือเคลียร์
                console.log('else-empty')
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
                console.log('✅ Setting form values for marker:', selectedMarker.id);
                console.log('✅ Update fields:', updateFields);
                console.log('✅ Update reason:', 
                    isMarkerChanged ? 'Marker changed' : 
                    isMarkerReselected ? 'Marker reselected' : 
                    'Safe to update');

                // บังคับ update form ทันทีเมื่อเปลี่ยน marker
                form.setFieldsValue(updateFields);
                lastFormUpdateTimeRef.current = now;

                console.log('✅ Form updated successfully for marker:', selectedMarker.id);
            } else {
                console.log('🚫 User is interacting, skipping form update to prevent reset');
                console.log('🚫 Marker ID:', selectedMarker.id);
                console.log('🚫 Flags:', {
                    isUserFocused: isUserFocusedRef.current,
                    isUserInputting: isUserInputtingRef.current,
                    isUserInteracting: isUserInteractingRef.current,
                    activeElement: document.activeElement?.tagName,
                    isUserCurrentlyInteracting,
                    timeSinceLastUpdate: now - lastFormUpdateTimeRef.current,
                    isMarkerChanged
                });
            }
        }
        // ตรวจสอบ validation หลังอัพเดท form (เฉพาะเมื่อไม่ได้ cancel และมี active marker)
        if (!isCancellingRef.current && hasActiveMarker) {
            validateForm();
        } else {
            console.log('🚫 Skipping validation in useEffect:', { 
                isCancelling: isCancellingRef.current, 
                hasActiveMarker 
            });
        }
    }, [selectedMarker?.id, form]); // ลบ addressData ออกจาก deps เพื่อลดการ trigger ที่ไม่จำเป็น

    // useEffect สำหรับ focus ที่ input Name เมื่อสร้าง marker ใหม่
    useEffect(() => {
        if (shouldFocusNameInput && nameInputRef.current) {
            console.log('FormVillageLocation - Focusing on Name input');
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
            console.log('🚫 Skipping validation during cancel operation');
            return;
        }

        // ป้องกัน validation เมื่อไม่มี active marker - แต่อนุญาตถ้าเพิ่งปลดล็อค marker
        if (!hasActiveMarker && !selectedMarker) {
            console.log('🚫 Skipping validation - no active marker and no selected marker');
            setIsFormValid(false); // บังคับ disable เมื่อไม่มี active marker
            return;
        }

        const values = form.getFieldsValue();
        console.log('validateForm - current values:', values);

        // ตรวจสอบว่าช่อง address มีข้อมูลหรือไม่
        const hasAddress = values.address !== undefined && values.address !== null && values.address !== '';

        // อนุญาตให้ valid ถ้ามี selectedMarker หรือ hasActiveMarker
        const canValidate = hasActiveMarker || !!selectedMarker;

        console.log('validateForm - validation result:', {
            hasAddress,
            hasActiveMarker,
            selectedMarker: !!selectedMarker,
            canValidate,
            isValid: hasAddress && canValidate
        });

        // ตั้งค่า isFormValid เฉพาะเมื่อมี marker ที่เลือกและมี address
        setIsFormValid(hasAddress && canValidate);
    };

    // useEffect สำหรับเคลียร์ข้อมูลใน form เมื่อไม่มี marker ที่เลือก
    useEffect(() => {
        if (!hasActiveMarker && !selectedMarker && !isCancellingRef.current) {
            console.log('FormVillageLocation - No active marker and no selected marker, clearing form fields');
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
            console.log('🚫 Skipping form clear during cancel operation');
        } else if (selectedMarker || hasActiveMarker) {
            // เมื่อมี selectedMarker หรือ hasActiveMarker ให้เรียก validateForm เพื่อตรวจสอบความถูกต้อง
            console.log('FormVillageLocation - Have selectedMarker or hasActiveMarker, running validation');
            validateForm();
        }
    }, [hasActiveMarker, selectedMarker, form, validateForm]);

    // ฟังก์ชันรีเซ็ต marker กลับเป็นค่าเดิมจาก API
    const resetMarkerToOriginal = (markerId: number | string, originalData: any) => {
        console.log('Resetting marker', markerId, 'to original API data:', originalData);

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

        console.log('Reset marker to original values:', resetMarkerData);

        // ใช้ onMarkerUpdate เพื่ออัพเดท marker ในระบบ
        if (onMarkerUpdate) {
            onMarkerUpdate(markerId.toString(), resetMarkerData);
        }
    };

    // ฟังก์ชันจัดการเมื่อ focus/blur ที่ input fields
    const handleInputFocus = () => {
        console.log('🚫 User focused on input field - STRONGLY blocking all form updates');
        isUserFocusedRef.current = true;
        isUserInteractingRef.current = true;
        setIsUserInputting(true);
        isUserInputtingRef.current = true;
        lastFormUpdateTimeRef.current = Date.now(); // บันทึกเวลาที่ user เริ่ม focus
    };

    const handleInputBlur = () => {
        console.log('✅ User blurred from input field - will unlock after extended delay');
        // ใช้ delay ยาวขึ้นเพื่อป้องกันการ refresh เมื่อ click marker อื่น
        setTimeout(() => {
            isUserFocusedRef.current = false;
            setIsUserInputting(false);
            console.log('🔓 Focus flag unlocked');

            // รอเพิ่มอีกเยอะก่อน unlock interaction เพื่อป้องกัน race condition
            setTimeout(() => {
                isUserInputtingRef.current = false;
                setTimeout(() => {
                    isUserInteractingRef.current = false;
                    console.log('🔓 All form interaction flags fully unlocked');
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
        console.log('🚫 User typing name - BLOCKING all form updates');

        if (selectedMarker && onMarkerNameChange) {
            console.log('FormVillageLocation - name changed:', newName, 'for marker:', selectedMarker.id);
            onMarkerNameChange(selectedMarker.id, newName);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อแก้ไข address
    const handleAddressChange = async (value: string) => {
        console.log('🔍 handleAddressChange value:', value);
        console.log('🔍 dataSelectPlan:', dataSelectPlan);
        console.log('🔍 selectedMarker:', selectedMarker);

        try {
            if (selectedMarker && onMarkerAddressChange) {
                let storeAddress = await getAddress(Number(value))

                if (storeAddress.status) {
                    console.log('🎯 API Response Success:', storeAddress.result);

                    // เอาค่าจาก API
                    let apiName = storeAddress.result.user?.givenName || storeAddress.result.givenName || '';
                    let tel = storeAddress.result.user?.contact || storeAddress.result.contact || '';
                    let tel2 = storeAddress.result.user?.contact2 || storeAddress.result.contact2 || '';
                    let tel3 = storeAddress.result.user?.contact3 || storeAddress.result.contact3 || '';

                    // ดึง roomAddress จาก dataSelectPlan.unit
                    const selectedUnit = dataSelectPlan?.unit?.find((unit: any) => unit.id === Number(value));
                    console.log('🔍 Selected Unit:', selectedUnit);
                    console.log('🔍 Selected Unit ID:', Number(value));
                    
                    // ดึง roomAddress และตรวจสอบค่า
                    const roomAddressText = selectedUnit?.roomAddress || '';
                    console.log('🔍 roomAddressText:', roomAddressText);

                    // อัพเดท marker name ทันทีด้วย roomAddress
                    if (selectedMarker && onMarkerNameChange && roomAddressText) {
                        console.log('🎯 Updating marker name with roomAddress:', roomAddressText);
                        console.log('🎯 Marker ID:', selectedMarker.id);
                        onMarkerNameChange(selectedMarker.id, roomAddressText);
                    } else {
                        console.log('❌ Cannot update marker name:', {
                            hasSelectedMarker: !!selectedMarker,
                            hasOnMarkerNameChange: !!onMarkerNameChange,
                            hasRoomAddressText: !!roomAddressText
                        });
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
                        console.log('🎯 Updating marker address:', value);
                        onMarkerAddressChange(selectedMarker.id, value);
                    }
                } else {
                    console.log('❌ API Response Fail:', storeAddress.result);
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
            console.log('❌ catch error:', error)
            console.error('❌ Error in handleAddressChange:', error);
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
        console.log('🚫 User typing tel1 - BLOCKING all form updates');

        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel1Change) {
            console.log('FormVillageLocation - tel1 changed:', newTel1, 'for marker:', selectedMarker.id);
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
        console.log('🚫 User typing tel2 - BLOCKING all form updates');

        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel2Change) {
            console.log('FormVillageLocation - tel2 changed:', newTel2, 'for marker:', selectedMarker.id);
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
        console.log('🚫 User typing tel3 - BLOCKING all form updates');

        // ไม่ใช้ form.setFieldsValue เพื่อป้องกันการ reset ช่องอื่น
        // ให้ antd จัดการ value ผ่าน controlled component แทน

        if (selectedMarker && onMarkerTel3Change) {
            console.log('FormVillageLocation - tel3 changed:', newTel3, 'for marker:', selectedMarker.id);
            onMarkerTel3Change(selectedMarker.id, newTel3);
        }
        if (hasActiveMarker) {
            validateForm();
        }
    };

    // ฟังก์ชันจัดการเมื่อกด Submit (Confirm)
    const handleSubmit = async () => {
        ConfirmModal({
            title: "ยืนยันการสร้างหรือแก้ไขข้อมูล",
            message: "",
            okMessage: "ยืนยัน",
            cancelMessage: "ยกเลิก",
            onOk: async () => {
                // ตรวจสอบ validation ก่อน (เหลือแค่ address)
                const values = form.getFieldsValue();
                if (!values.address) {
                    return;
                }
                console.log(values, 'values-test')
                console.log(selectedMarker, 'selectedMarker-test')
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

                // console.log(selectedMarker,'selectedMarker')
                // return 
                // แสดงข้อความตามโหมด
                if (isCreateMode) {
                    const markerData: MarkerProcess = {
                        villageId: idVillage,
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
                        SuccessModal("สร้าง Marker สำเร็จ",900)
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
                                console.log('Found marker in data.result directly:', newMarkerData);
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

                                console.log('Updated marker with API data:', updatedMarker);

                                // อัพเดท marker ทั้งหมดก่อนปิด form
                                if (onMarkerUpdate) {
                                    // แปลง selectedMarker.id เป็น string เพื่อส่งไปยัง handleMarkerUpdate
                                    onMarkerUpdate(selectedMarker.id.toString(), updatedMarker);
                                }
                            } else {
                                console.log('Could not find marker data in API response');
                            }
                            if (data) {
                                console.log(data.result.marker,'data-marker')
                                // อัพเดท marker
                                if (data.result.marker && Array.isArray(data.result.marker)) {
                                  setDataMapAll((prev: any) => ({
                                    ...prev,
                                    marker: data.result.marker
                                  }));
                                }
                            }


                        } else {
                            console.log('No data.result or selectedMarker');
                        }
                    }

                    // Reset focus/input flags หลัง submit
                    isUserFocusedRef.current = false;
                    isUserInputtingRef.current = false;
                    isUserInteractingRef.current = false;
                    setIsUserInputting(false);
                    console.log('🔓 All form interaction flags reset after create submit');

                    // ยกเลิกการเลือก marker เพื่อลบขอบสีแดง
                    if (onMarkerSelect) {
                        onMarkerSelect(null);
                    }

                    if (onConfirm) {
                        onConfirm();
                    }
                } else if (isUpdateMode) {

                    const markerData: MarkerProcess = {
                        markerId: selectedMarker?.id?.toString() || "",
                        villageId: idVillage,
                        unitId: Number(values.address), // ใช้ค่าจาก form address ซึ่งจะเป็น unitID
                        markerType: "marker",
                        markerInfo: {
                            // id: selectedMarker?.id || "",
                            name: markerName, // ใช้ roomAddress แทน values.name
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


                    console.log(markerData, 'update marker data with unitId from form address:', markerData);

                    let data = await updateMarker(markerData)
                    if (data.status) {
                        console.log('update marker success')
                        SuccessModal("แก้ไข Marker สำเร็จ",900)
                        // สร้าง updatedMarker object ที่มีค่า originalX และ originalY เป็นตำแหน่งปัจจุบัน
                        if (selectedMarker && selectedMarker.x !== undefined && selectedMarker.y !== undefined) {
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
                                console.log('Updated original data for marker:', currentMarkerId, allMarkersOriginalDataRef.current[currentMarkerId]);
                            }

                            // อัพเดท marker ด้วยค่าใหม่
                            if (onMarkerUpdate) {
                                console.log('FormVillageLocation - Calling onMarkerUpdate with originalX/Y:', updatedMarker);
                                // ตรวจสอบว่ามี wrapper function หรือไม่
                                if ((window as any).villageMapOnMarkerUpdateRef?.current) {
                                    (window as any).villageMapOnMarkerUpdateRef.current(selectedMarker.id.toString(), updatedMarker);
                                } else {
                                    onMarkerUpdate(selectedMarker.id.toString(), updatedMarker);
                                }
                            }
                        }
                        if (data) {
                            console.log(data.result.marker,'data-marker')
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
                    console.log('🔓 All form interaction flags reset after update submit');

                    // ยกเลิกการเลือก marker เพื่อลบขอบสีแดง
                    if (onMarkerSelect) {
                        onMarkerSelect(null);
                    }

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
        console.log('🔍 useMemo addressDisabled calculation:', {
            hasActiveMarker,
            selectedMarker: !!selectedMarker,
            selectedMarkerID: selectedMarker?.id,
            isFormDisabled,
            isFormValid,
            isCancelling: isCancellingRef.current,
            disabled,
            timestamp: new Date().toISOString()
        });
        return disabled;
    }, [isFormDisabled, hasActiveMarker, selectedMarker, isFormValid]);

    // Debug การ disable address
    console.log('🔍 FormVillageLocation render - Address state:', {
        hasActiveMarker,
        selectedMarker: !!selectedMarker,
        selectedMarkerID: selectedMarker?.id,
        isFormDisabled,
        addressDisabled,
        timestamp: new Date().toISOString()
    });

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
                        placeholder={!hasActiveMarker ? "ไม่มี marker ที่ active" : "ค้นหาหรือเลือก address"}
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
                        placeholder="เช่น 0985574483 (ขึ้นต้นด้วย 0)"
                        disabled={isFormDisabled || true}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 2</span>} name="tel2">
                    <Input
                        onChange={handleTel2Change}
                        maxLength={10}
                        placeholder="เช่น 0985574484 (ขึ้นต้นด้วย 0)"
                        disabled={isFormDisabled || true}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 3</span>} name="tel3">
                    <Input
                        onChange={handleTel3Change}
                        maxLength={10}
                        placeholder="เช่น 0985574485 (ขึ้นต้นด้วย 0)"
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
                                console.log('🚫 FormVillageLocation - Cancel button clicked');
                                console.log('🚫 Before cancel - isCreatingMode:', isCreatingMode);
                                console.log('🚫 Before cancel - selectedMarker:', selectedMarker);
                                console.log('🚫 Before cancel - hasActiveMarker:', hasActiveMarker);

                                // ตั้ง flag เพื่อป้องกัน useEffect ทำงานขณะ cancel
                                isCancellingRef.current = true;

                                // เคลียร์ค่าในฟอร์มทั้งหมดก่อนอื่น
                                form.resetFields();
                                
                                // เคลียร์ state เพิ่มเติม - บังคับให้ form invalid เพื่อ disable Address
                                setIsFormValid(false);
                                console.log('🚫 Set isFormValid to false to ensure Address is disabled');
                                
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
                                
                                console.log('🧹 Cleared currentMarkerIdRef to enable marker reselection');
                                
                                console.log('🔓 All form interaction flags and data reset on cancel');

                                // ยกเลิกการเลือก marker ทันที
                                console.log('🚫 Calling onMarkerSelect(null) to clear active marker...');
                                if (onMarkerSelect) {
                                    onMarkerSelect(null);
                                }
                                
                                console.log('🚫 After onMarkerSelect(null) call');

                                // บังคับ disable form หลายครั้งเพื่อให้แน่ใจ
                                const forceDisableForm = () => {
                                    console.log('🚫 Force disabling form - round');
                                    setIsFormValid(false);
                                };

                                // เรียกใช้หลายครั้งด้วย delay เพื่อให้แน่ใจ
                                // setTimeout(forceDisableForm, 50);
                                // setTimeout(forceDisableForm, 100);
                                // setTimeout(forceDisableForm, 200);
                                setTimeout(forceDisableForm, 500);

                                // รีเซ็ต cancelling flag หลังจาก delay สั้น ๆ
                                setTimeout(() => {
                                    isCancellingRef.current = false;
                                    console.log('🔓 Cancelling flag reset');
                                    // บังคับ disable อีกครั้งหลังจาก cancel flag reset
                                    // setTimeout(() => {
                                    //     setIsFormValid(false);
                                    //     console.log('🚫 Final force disable after cancel flag reset');
                                    // }, 100);
                                }, 300); // เพิ่มเวลา delay เป็น 300ms เพื่อให้แน่ใจว่า state update เสร็จสิ้น

                                // แยกแยะ marker จำลอง (temporary) กับ marker ที่มีอยู่แล้ว (existing)
                                // Temporary marker จะมี ID เป็น timestamp (Date.now()) ซึ่งเป็นตัวเลขขนาดใหญ่ (13 หลัก)
                                // Existing marker จะมี ID จาก database ซึ่งเป็นตัวเลขปกติ (1-6 หลัก)
                                console.log(typeof selectedMarker?.id, 'typeof selectedMarker?.id')
                                const isTemporaryMarker = typeof selectedMarker?.id === 'number'

                                console.log('selectedMarker.id:', selectedMarker?.id);
                                console.log('isTemporaryMarker:', isTemporaryMarker);
                                console.log(onMarkerDelete, 'onMarkerDelete')
                                // ลบเฉพาะ marker จำลองเท่านั้น
                                
                                if (isTemporaryMarker && onMarkerDelete) {
                                    const markerId = typeof selectedMarker.id === 'string' ? parseInt(selectedMarker.id) : selectedMarker.id;
                                    onMarkerDelete(markerId);
                                } else {
                                    // สำหรับ existing marker ให้รีเซ็ตกลับเป็นค่าเดิมก่อน cancel
                                    if (selectedMarker && !isTemporaryMarker) {
                                        console.log('FormVillageLocation - Resetting marker to original position:', selectedMarker.id);
                                        const currentMarkerId = selectedMarker.id.toString();
                                        const originalData = allMarkersOriginalDataRef.current[currentMarkerId];
                                        if (originalData) {
                                            resetMarkerToOriginal(selectedMarker.id, originalData);
                                        }
                                    }

                                    if (onCancel) {
                                        console.log('FormVillageLocation - Calling onCancel');
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