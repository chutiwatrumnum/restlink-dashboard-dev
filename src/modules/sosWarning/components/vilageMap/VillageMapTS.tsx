"use client";
import React, { useEffect, useRef, useState, MouseEvent, FormEvent, DragEvent, WheelEvent } from "react";
import { createPortal } from "react-dom";
import { getAddress } from "../../service/api/SOSwarning";
import { dataAllMap } from "../../../../stores/interfaces/SosWarning";
import { dataSelectPlan } from "../../../../stores/interfaces/SosWarning";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import { deleteMarker } from "../../service/api/SOSwarning";
import SuccessModal from "../../../../components/common/SuccessModal";
import FailedModal from "../../../../components/common/FailedModal";
import undoIcon from "../../../../assets/icons/undo.svg";
import fullScreenIcon from "../../../../assets/icons/fullScreen.png";
import { usePermission } from "../../../../utils/hooks/usePermission";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { message } from "antd";
import {  ZoomInIcon, ZoomOutIcon } from "../../../../assets/icons/Icons";
import TrashIcon from "../../../../assets/icons/TrashIcon.png";
import { useGlobal } from "../../contexts/Global";
import UndoIcon from "../../../../assets/icons/Undo.png";
import RedoIcon from "../../../../assets/icons/Redo.png";
// import { ModalFormUpdate } from "../ModalFormUplodateImagePlan";

// TypeScript Types and Interfaces
interface Position {
  x: number;
  y: number;
}

interface ColorOption {
  value: string;
  label: string;
  bg: string;
  hover: string;
}



interface ZoneShapeOption {
  value: "rectangle" | "circle" | "triangle";
  label: string;
  icon: string;
}

interface Marker {
  id: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  name: string;
  group: string;
  color: string;
  address?: string;
  tel1?: string;
  tel2?: string;
  tel3?: string;
  unitID?: number;
  roomAddress?: string;
  unitNo?: string;
  status?: string;
  addressData?: any; // ข้อมูลจาก getAddress API
  isLocked?: boolean; // เพิ่ม property สำหรับเก็บสถานะการล็อค
  floorName?: string; // ชื่อชั้นสำหรับ tooltip
}

interface Zone {
  id: number;
  name: string;
  color: string;
  shape?: "rectangle" | "circle" | "triangle";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
  originalRotation?: number;
  isDefault?: boolean;
}

interface FormData {
  name: string;
  group: string;
  color: string;
  address?: string;
  tel1?: string;
  tel2?: string;
  tel3?: string;
}

interface ZoneFormData {
  name: string;
  color: string;
}

interface EditMarkerData {
  id: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  name: string;
  group: string;
  color: string;
  size: number;
  address?: string;
  tel1?: string;
  tel2?: string;
  tel3?: string;
  unitID?: number;
  roomAddress?: string;
  unitNo?: string;
  status?: string;
  addressData?: any;
  isLocked?: boolean;
  floorName?: string; // ชื่อชั้นสำหรับ tooltip
}

interface Selection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface HistoryAction {
  type: string;
  data: any;
  timestamp: number;
}

interface PixelColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface VisibleZones {
  [key: number]: boolean;
}

interface MarkerSizes {
  [key: number]: number;
}

interface DragOffset {
  x: number;
  y: number;
}

interface OriginalZoneState {
  offsetX: number;
  offsetY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  rotation: number;
}

interface DragReference {
  x: number;
  y: number;
  type: "marker" | "zone";
  id: number;
}

interface ConnectedRegion {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pixelCount: number;
  width: number;
  height: number;
}

interface AreaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  areaType?: string;
  pixelCount?: number;
}

interface CombinedBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pixelCount: number;
  width: number;
  height: number;
}

// เพิ่ม type สำหรับ action history
const ACTION_TYPES = {
  ADD_MARKER: "ADD_MARKER",
  REMOVE_MARKER: "REMOVE_MARKER",
  MOVE_MARKER: "MOVE_MARKER",
  RESET_MARKER: "RESET_MARKER",
  ADD_ZONE: "ADD_ZONE",
  REMOVE_ZONE: "REMOVE_ZONE",
  EDIT_MARKER: "EDIT_MARKER",
  EDIT_ZONE: "EDIT_ZONE",
  MOVE_GROUP: "MOVE_GROUP",
  MOVE_ZONE_GROUP: "MOVE_ZONE_GROUP",
  MOVE_MIXED_GROUP: "MOVE_MIXED_GROUP"
};

interface VillageMapProps {
  uploadedImage?: string;
  setStatusClickMap?: (status: boolean) => void;
  statusClickMap?: boolean;
  showWarningVillage?: boolean;
  setShowWarningVillage?: (() => void) | ((showWarningVillage: boolean) => void);
  onItemCreated?: (type: 'marker' | 'zone', data: any) => void;
  onLastCreatedItemChange?: (item: { type: 'marker' | 'zone', data: any } | null) => void;
  onImageClick?: () => void;
  dataMapAll?: dataAllMap;
  dataSelectPlan?: dataSelectPlan;
  onLatLngChange?: (latitude: number, longitude: number) => void;
  onMarkerSelect?: (marker: Marker | null, isNewMarker?: boolean) => void;
  onMarkerNameChange?: (markerId: number | string, newName: string) => void;
  onMarkerAddressChange?: (markerId: number | string, newAddress: string) => void;
  onMarkerUpdate?: (markerId: number | string, updatedMarker: any) => void;
  selectedMarkerUpdate?: {
    id: number | string;
    name: string;
  } | null;
  villageMapResetRef?: React.MutableRefObject<((markerId: number | string) => void) | null>;
  villageMapUpdateAddressRef?: React.MutableRefObject<((markerId: number | string, newAddress: string) => void) | null>;
  villageMapUpdateTelRef?: React.MutableRefObject<((markerId: number | string, telType: 'tel1' | 'tel2' | 'tel3', newTel: string) => void) | null>;
  villageMapConfirmRef?: React.MutableRefObject<((markerId: number | string, markerData: any) => void) | null>;
  villageMapRefreshRef?: React.MutableRefObject<(() => void) | null>;
  mapMode?: 'preview' | 'work-it';
  onMarkerDeleted?: (deletedMarker?: any) => void;
  onZoneCreated?: () => void;
  onZoneEdited?: () => void;
  onZoneEditStarted?: () => void;
  onNewMarkerCreated?: () => void;
  onUploadImage?: (file: File) => void;
  onAlertMarkersChange?: (alertMarkers: { red: any[], yellow: any[] }) => void;
  markersFullOpacity?: boolean;
  setDataMapAll: (data: any) => void,
  setDataEmergency: (data: any) => void,
  setUnitHover: (unitHover: number | null) => void,
  setUnitClick?: (unitClick: number | null) => void,
  onActiveMarkerChange?: (hasActiveMarker: boolean) => void;
  onMarkersChange?: (markers: Marker[]) => void; // เพิ่ม callback สำหรับส่ง markers ออกไป
}

const VillageMap: React.FC<VillageMapProps> = ({
  uploadedImage: propUploadedImage, setStatusClickMap,
  statusClickMap, showWarningVillage, setShowWarningVillage, onItemCreated,
  onLastCreatedItemChange, onImageClick, dataMapAll, dataSelectPlan, onLatLngChange,
  onMarkerSelect, onMarkerNameChange, onMarkerAddressChange, onMarkerUpdate,
  selectedMarkerUpdate, villageMapResetRef, villageMapUpdateAddressRef,
  villageMapUpdateTelRef, villageMapConfirmRef, villageMapRefreshRef, mapMode = 'work-it',
  onMarkerDeleted, onZoneCreated, onZoneEdited, onZoneEditStarted,
  onNewMarkerCreated, onUploadImage, onAlertMarkersChange,
  markersFullOpacity = false, setDataMapAll, setDataEmergency, setUnitHover,
  setUnitClick, onActiveMarkerChange, onMarkersChange }) => {
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);
  const ENABLE_ZONE_CREATION = false;
  // เพิ่มฟังก์ชันสำหรับการล็อค/ปลดล็อค marker
  // ฟังก์ชันสำหรับ unlock markers ทั้งหมด
  const unlockAllMarkers = () => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => ({ ...marker, isLocked: false }))
    );

    // แจ้ง parent component ว่าไม่มี active marker
    if (onActiveMarkerChange) {
      onActiveMarkerChange(false);
    }
  };

  // ฟังก์ชันสำหรับ lock markers ที่เหลือ เฉพาะ marker ที่ระบุไม่ถูก lock
  const lockOtherMarkers = (activeMarkerId: number) => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => ({
        ...marker,
        isLocked: marker.id === activeMarkerId ? false : true
      }))
    );
  };

  const toggleMarkerLock = (markerId: number) => {
    const targetMarker = markers.find(m => m.id === markerId);
    const willBeLocked = targetMarker ? !targetMarker.isLocked : false;

    // อัพเดทสถานะ locked ของ marker
    setMarkers(prevMarkers =>
      prevMarkers.map(marker =>
        marker.id === markerId
          ? { ...marker, isLocked: !marker.isLocked }
          : marker
      )
    );

    // ถ้าเป็น marker ที่กำลัง active อยู่และจะถูก lock
    if (clickedMarker && clickedMarker.id === markerId && willBeLocked) {
      // รีเซ็ตตำแหน่ง marker กลับไปตำแหน่งก่อนเริ่มลาก (ถ้ายังไม่ confirm)
      let resetX = targetMarker ? targetMarker.x : 0;
      let resetY = targetMarker ? targetMarker.y : 0;
      if (originalMarkerBeforeEdit && originalMarkerBeforeEdit.id === markerId) {
        resetX = originalMarkerBeforeEdit.x;
        resetY = originalMarkerBeforeEdit.y;
      } else if (targetMarker) {
        resetX = targetMarker.originalX ?? targetMarker.x;
        resetY = targetMarker.originalY ?? targetMarker.y;
      }

      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker.id === markerId
            ? { ...marker, x: resetX, y: resetY, isLocked: true }
            : marker
        )
      );

      // ยกเลิกการ active marker
      setClickedMarker(null);
      setHasActiveMarker(false);

      // ส่งสัญญาณไปยัง parent component ว่ายกเลิกการเลือก marker
      if (onMarkerSelect) {
        onMarkerSelect(null);
      }

      // แจ้ง parent component ว่าไม่มี active marker
      if (onActiveMarkerChange) {
        onActiveMarkerChange(false);
      }

      return;
    }
    else if (!willBeLocked && targetMarker) {
      // ถ้าเป็นการปลดล็อค (unlock) ให้ active marker ตัวนั้นทันที

      // ถ้ามี marker active อยู่และเป็นตัวอื่น ให้ reset ตำแหน่งก่อน
      if (clickedMarker && clickedMarker.id !== markerId) {

        // ใช้ originalMarkerBeforeEdit เพื่อ reset กลับไปยังตำแหน่งก่อนเริ่มลาก
        if (originalMarkerBeforeEdit && originalMarkerBeforeEdit.id === clickedMarker.id) {
          // reset marker กลับไปยังตำแหน่งก่อนเริ่มลาก
          setMarkers(prevMarkers =>
            prevMarkers.map(m =>
              m.id === clickedMarker.id
                ? { ...m, x: originalMarkerBeforeEdit.x, y: originalMarkerBeforeEdit.y }
                : m
            )
          );
        } else {
          // fallback: ใช้ originalX/Y
          const previousMarker = markers.find(m => m.id === clickedMarker.id);
          if (previousMarker) {
            const hasBeenMoved = previousMarker.x !== previousMarker.originalX || previousMarker.y !== previousMarker.originalY;

            if (hasBeenMoved) {
              setMarkers(prevMarkers =>
                prevMarkers.map(m =>
                  m.id === clickedMarker.id
                    ? { ...m, x: m.originalX, y: m.originalY }
                    : m
                )
              );
            }
          }
        }
      }

      const unlockedMarker = { ...targetMarker, isLocked: false };

      // ตั้งให้เป็น active marker (เฉพาะในโหมด work-it)
      setClickedMarker(unlockedMarker);
      if (mapMode === 'work-it') {
        setHasActiveMarker(true);

        // แจ้ง parent component ว่ามี active marker
        if (onActiveMarkerChange) {
          onActiveMarkerChange(true);
        }

        // Lock markers ที่เหลือเมื่อ unlock marker เดี่ยว
        lockOtherMarkers(markerId);
      }

      // อัพเดทตำแหน่ง Lat/Lng
      updateLatLngDisplay(targetMarker.x, targetMarker.y, unlockedMarker);

      // ส่งสัญญาณไปยัง parent component ว่ามี marker ใหม่ถูกเลือก พร้อมข้อมูลครบถ้วน
      if (onMarkerSelect) {
        // ใช้ setTimeout เล็กน้อยเพื่อให้ lockOtherMarkers ทำงานเสร็จก่อน แล้วค่อยส่งข้อมูลล่าสุด
        setTimeout(() => {
          setMarkers(currentMarkers => {
            const latestMarker = currentMarkers.find(m => m.id === markerId);
            if (latestMarker) {
              // ใช้ข้อมูลจาก originalMarkerBeforeEdit หรือ latestMarker
              const markerDataToSend = originalMarkerBeforeEdit || latestMarker;
              const markerToSend = {
                ...latestMarker,
                name: (markerDataToSend as any).originalName || markerDataToSend.name,
                roomAddress: (markerDataToSend as any).originalRoomAddress || markerDataToSend.roomAddress,
                address: (markerDataToSend as any).originalAddress || markerDataToSend.address,
                tel1: (markerDataToSend as any).originalTel1 || markerDataToSend.tel1,
                tel2: (markerDataToSend as any).originalTel2 || markerDataToSend.tel2,
                tel3: (markerDataToSend as any).originalTel3 || markerDataToSend.tel3,
                addressData: (markerDataToSend as any).originalAddressData || markerDataToSend.addressData,
                // เพิ่ม unitID สำหรับ form address
                unitID: markerDataToSend.unitID || (markerDataToSend.address ? Number(markerDataToSend.address) : undefined)
              };
              onMarkerSelect(markerToSend, false); // false = ไม่ใช่ marker ใหม่
            }
            return currentMarkers; // ไม่เปลี่ยนแปลง state
          });
        }, 15);
      }
    } else if (clickedMarker && clickedMarker.id === markerId) {
      // อัพเดทสถานะ locked ของ marker ที่ active อยู่
      setClickedMarker(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
    }
  };

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // useEffect เพื่อส่ง markers ออกไปเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onMarkersChange) {
      onMarkersChange(markers);
    }
  }, [markers, onMarkersChange]);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [hasImageData, setHasImageData] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showZoneModal, setShowZoneModal] = useState<boolean>(false);
  const [showEditMarkerModal, setShowEditMarkerModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [formData, setFormData] = useState<FormData>({ name: "", group: "", color: "green", address: "", tel1: "", tel2: "", tel3: "" });
  const [editMarkerData, setEditMarkerData] = useState<EditMarkerData | null>(null);
  const [originalMarkerData, setOriginalMarkerData] = useState<EditMarkerData | null>(null);
  const [zoneFormData, setZoneFormData] = useState<ZoneFormData>({ name: "", color: "blue" });
  const [selectedZoneShape, setSelectedZoneShape] = useState<"rectangle" | "circle" | "triangle">("rectangle");
  const [draggedMarker, setDraggedMarker] = useState<Marker | null>(null);
  const [originalMarkerPosition, setOriginalMarkerPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSelectingZone, setIsSelectingZone] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<Position | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Position | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  const [mouseDownStart, setMouseDownStart] = useState<Position | null>(null);
  const [mouseDownTime, setMouseDownTime] = useState<number | null>(null);
  const [hasDragged, setHasDragged] = useState<boolean>(false);
  const [visibleZones, setVisibleZones] = useState<VisibleZones>({});
  const [draggedZone, setDraggedZone] = useState<Zone | null>(null);
  const [isDraggingZone, setIsDraggingZone] = useState<boolean>(false);
  const [isResizingZone, setIsResizingZone] = useState<boolean>(false);
  const [isRotatingZone, setIsRotatingZone] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [originalZoneState, setOriginalZoneState] = useState<OriginalZoneState | null>(null);
  const [rotationStartAngle, setRotationStartAngle] = useState<number>(0);
  const [draggedListMarker, setDraggedListMarker] = useState<Marker | null>(null);
  const [dragOverZoneId, setDragOverZoneId] = useState<number | null>(null);
  const [markerSizes, setMarkerSizes] = useState<MarkerSizes>({});
  const imageRef = useRef<HTMLImageElement>(null);
  const [showEditZoneModal, setShowEditZoneModal] = useState<boolean>(false);
  const [editZoneData, setEditZoneData] = useState<Zone | null>(null);
  const [originalZoneData, setOriginalZoneData] = useState<Zone | null>(null);
  // เพิ่ม state สำหรับเก็บประวัติการกระทำ
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  // เพิ่ม state สำหรับเก็บประวัติการเคลื่อนไหว
  const [moveHistory, setMoveHistory] = useState<HistoryAction[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  // เพิ่ม state สำหรับการเลือกแบบกลุ่ม
  const [isGroupSelecting, setIsGroupSelecting] = useState<boolean>(false);
  const [selectedMarkers, setSelectedMarkers] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [groupSelectionStart, setGroupSelectionStart] = useState<Position | null>(null);
  const [groupSelectionEnd, setGroupSelectionEnd] = useState<Position | null>(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const [isDraggingZoneGroup, setIsDraggingZoneGroup] = useState<boolean>(false);
  const [isDraggingMixed, setIsDraggingMixed] = useState<boolean>(false);
  const [groupDragOffset, setGroupDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [dragReference, setDragReference] = useState<DragReference | null>(null);
  const [justFinishedGroupSelection, setJustFinishedGroupSelection] = useState<boolean>(false);
  // เพิ่ม state สำหรับการเลือก object เดี่ยว
  const [clickedMarker, setClickedMarker] = useState<Marker | null>(null);
  const [clickedZone, setClickedZone] = useState<Zone | null>(null);
  // เพิ่ม state สำหรับ zoom
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<Position>({ x: 0, y: 0 });
  // Refs เพื่อเก็บค่าปัจจุบันของ zoom และ pan สำหรับการคำนวณ
  const zoomLevelRef = useRef<number>(1);
  const panOffsetRef = useRef<Position>({ x: 0, y: 0 });

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState<boolean>(false);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [justFinishedPanning, setJustFinishedPanning] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // เพิ่ม state สำหรับ copy/paste zone และ marker
  const [copiedZones, setCopiedZones] = useState<Zone[]>([]);
  const [copiedMarkers, setCopiedMarkers] = useState<Marker[]>([]);
  // เพิ่ม state สำหรับ force re-render
  const [forceRenderKey, setForceRenderKey] = useState<number>(0);
  // เพิ่ม state สำหรับเก็บข้อมูล item ที่เพิ่งสร้าง (สำหรับฝั่ง Village)
  const [lastCreatedItem, setLastCreatedItem] = useState<{ type: 'marker' | 'zone', data: any } | null>(null);
  // เพิ่ม state สำหรับควบคุม tooltip แบบ manual
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);
  const isHoveringTooltipRef = useRef<boolean>(false);

  // เพิ่ม state สำหรับเก็บข้อมูล marker เดิมเพื่อใช้ restore เมื่อ cancel
  const [originalMarkerBeforeEdit, setOriginalMarkerBeforeEdit] = useState<Marker | null>(null);

  // เพิ่ม state สำหรับตรวจสอบว่ามี active marker หรือไม่
  const [hasActiveMarker, setHasActiveMarker] = useState<boolean>(false);

  // เพิ่ม state สำหรับ pending marker ที่ยังไม่ได้ยืนยัน
  const [pendingMarker, setPendingMarker] = useState<Marker | null>(null);

  // เพิ่ม state สำหรับป้องกันการส่งข้อมูล marker ซ้ำ ๆ
  const [lastSelectedMarkerId, setLastSelectedMarkerId] = useState<number | null>(null);
  const lastMarkerSelectTimeRef = useRef<number>(0);

  // เพิ่ม ref สำหรับเก็บ clickedMarker เพื่อใช้ใน useEffect โดยไม่ต้องเป็น dependency
  const clickedMarkerRef = useRef<Marker | null>(null);

  const [statusQueryString, setStatusQueryString] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { isRightPanelCollapsed, syncToggleButtonRef } = useGlobal();

  // sync clickedMarker กับ ref
  useEffect(() => {
    clickedMarkerRef.current = clickedMarker;
  }, [clickedMarker]);

  // เพิ่ม useEffect สำหรับจัดการ marker lock status เมื่อ mode เปลี่ยน
  useEffect(() => {
    if (mapMode === 'preview') {
      // ปลดล็อคทุก marker ในโหมด preview
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => ({
          ...marker,
          isLocked: false
        }))
      );
    } else {
      // ล็อคทุก marker ในโหมด work-it
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => ({
          ...marker,
          isLocked: true
        }))
      );
    }
  }, [mapMode]);

  // เพิ่ม useEffect เพื่อส่งสถานะ hasActiveMarker ไปยัง parent
  useEffect(() => {
    if (onActiveMarkerChange) {
      // เฉพาะในโหมด work-it เท่านั้นที่ส่งสถานะ active marker
      // โหมด preview ไม่ควรส่งสถานะใด ๆ เพื่อป้องกันการรบกวน
      if (mapMode === 'work-it') {
        const isActive = hasActiveMarker || !!draggedMarker || isDragging;
        onActiveMarkerChange(isActive);
      }
      // ในโหมด preview ไม่ส่งสถานะใด ๆ เลย เพื่อไม่รบกวนการแสดงผล
    }
  }, [hasActiveMarker, draggedMarker, isDragging, onActiveMarkerChange, mapMode]);




  // เพิ่ม ref สำหรับ onMarkerUpdate callback
  const onMarkerUpdateRef = useRef<((markerId: number | string, updatedMarker: any) => void) | null>(null);

  // เพิ่ม state สำหรับแสดงตำแหน่ง Latitude Longitude


  // สีและชื่อสี (TypeScript typed)
  const colorOptions: ColorOption[] = [
    { value: "red", label: "Red", bg: "bg-red-500", hover: "hover:bg-red-600" },
    { value: "yellow", label: "Yellow", bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
    { value: "green", label: "Green", bg: "bg-green-500", hover: "hover:bg-green-600" },
    // { value: "blue", label: "น้ำเงิน", bg: "bg-blue-500", hover: "hover:bg-blue-600" },
    // { value: "pink", label: "ชมพู", bg: "bg-pink-500", hover: "hover:bg-pink-600" },
    // { value: "indigo", label: "คราม", bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
    // { value: "teal", label: "เขียวหัวเป็ด", bg: "bg-teal-500", hover: "hover:bg-teal-600" }
  ];

  const zoneColorOptions = [
    { value: "blue", label: "Blue", bg: "bg-blue-500", border: "border-blue-500", bgOpacity: "bg-blue-200" },
    { value: "purple", label: "Purple", bg: "bg-purple-500", border: "border-purple-500", bgOpacity: "bg-purple-200" },
    { value: "orange", label: "Orange", bg: "bg-orange-500", border: "border-orange-500", bgOpacity: "bg-orange-200" },
    { value: "emerald", label: "Emerald", bg: "bg-emerald-500", border: "border-emerald-500", bgOpacity: "bg-emerald-200" },
    { value: "rose", label: "Rose", bg: "bg-rose-500", border: "border-rose-500", bgOpacity: "bg-rose-200" },
    { value: "cyan", label: "Cyan", bg: "bg-cyan-500", border: "border-cyan-500", bgOpacity: "bg-cyan-200" },
  ];

  // เพิ่มตัวเลือกรูปทรง zone
  const zoneShapeOptions: ZoneShapeOption[] = [
    { value: "rectangle", label: "", icon: "⬛" },
    { value: "circle", label: "", icon: "🔵" },
    { value: "triangle", label: "", icon: "🔺" }
  ];

  // ระยะทางขั้นต่ำที่ถือว่าเป็นการลาก (pixels)
  const DRAG_THRESHOLD = 15; // เพิ่มขนาดเพื่อป้องกันการตรวจจับการลากจากการคลิกธรรมดา

  // เพิ่มค่าเริ่มต้นขนาด marker - ลดขนาดลง
  const DEFAULT_MARKER_SIZE = 3; // ขนาดเริ่มต้น 10px (2 * 5)
  const MIN_MARKER_SIZE = 3; // ขนาดต่ำสุด 5px
  const MAX_MARKER_SIZE = 6; // ขนาดสูงสุด 30px

  // ตรวจสอบว่าจุดอยู่ในกลุ่มหรือไม่ (รองรับการหมุน)
  const isPointInZone = (x: number, y: number, zone: Zone): boolean => {
    const { shape = "rectangle", x: zx, y: zy, width, height, rotation = 0 } = zone;

    // คำนวณตำแหน่งและขนาดจริงของ zone โดยรองรับขนาดลบ
    const actualX = width < 0 ? zx + width : zx;
    const actualY = height < 0 ? zy + height : zy;
    const actualWidth = Math.abs(width);
    const actualHeight = Math.abs(height);

    // หาจุดกึ่งกลางของ zone
    const centerX = actualX + actualWidth / 2;
    const centerY = actualY + actualHeight / 2;

    // ถ้ามีการหมุน ต้องแปลงพิกัดจุดกลับไปเป็นพิกัดเดิมก่อนการหมุน
    let testX = x;
    let testY = y;

    if (rotation !== 0) {
      // แปลงองศาเป็นเรเดียน
      const rad = (-rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // แปลงพิกัดให้สัมพันธ์กับจุดกึ่งกลาง
      const relativeX = x - centerX;
      const relativeY = y - centerY;

      // หมุนจุดกลับไปตำแหน่งเดิม (inverse rotation)
      testX = centerX + (relativeX * cos - relativeY * sin);
      testY = centerY + (relativeX * sin + relativeY * cos);
    }

    switch (shape) {
      case "circle":
        // สำหรับวงกลม: ตรวจสอบระยะห่างจากจุดกึ่งกลาง
        const radiusX = actualWidth / 2;
        const radiusY = actualHeight / 2;
        const dx = (testX - centerX) / radiusX;
        const dy = (testY - centerY) / radiusY;
        return dx * dx + dy * dy <= 1;

      case "triangle":
        // สำหรับสามเหลี่ยม: ใช้ point-in-triangle algorithm
        const x1 = actualX + actualWidth / 2; // จุดยอดบน
        const y1 = actualY;
        const x2 = actualX; // จุดซ้ายล่าง
        const y2 = actualY + actualHeight;
        const x3 = actualX + actualWidth; // จุดขวาล่าง
        const y3 = actualY + actualHeight;

        const sign = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
          return (px - bx) * (ay - by) - (ax - bx) * (py - by);
        };

        const d1 = sign(testX, testY, x1, y1, x2, y2);
        const d2 = sign(testX, testY, x2, y2, x3, y3);
        const d3 = sign(testX, testY, x3, y3, x1, y1);

        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

        return !(hasNeg && hasPos);

      default:
        // rectangle
        return testX >= actualX && testX <= actualX + actualWidth && testY >= actualY && testY <= actualY + actualHeight;
    }
  };

  // หากลุ่มที่ marker อยู่
  const findMarkerZone = (marker: Marker): Zone | undefined => {
    return zones.find(zone => isPointInZone(marker.x, marker.y, zone));
  };

  // ฟังก์ชันสำหรับอัพเดทกลุ่มของ markers ทันทีหลังจากการเปลี่ยนแปลง zone
  const updateMarkersGroup = () => {
    setMarkers(prevMarkers => {
      let hasChanges = false;
      const updatedMarkers = prevMarkers.map(marker => {
        const zone = findMarkerZone(marker);
        const newGroup = zone ? zone.name : "Marker";
        if (marker.group !== newGroup) {
          hasChanges = true;
        }
        return { ...marker, group: newGroup };
      });



      return updatedMarkers;
    });
  };

  // ฟังก์ชันแปลงตำแหน่ง x,y เป็น lat,lng (เป็นตัวอย่าง - ต้องใช้จริงตาม project coordinates)
  const convertToLatLng = (x: number, y: number) => {
    // สูตรแปลงตำแหน่งขึ้นอยู่กับระบบพิกัดของโปรเจ็ค
    // นี่เป็นตัวอย่างที่จำลองการแปลง (ต้องปรับให้เหมาะสมกับโปรเจ็คจริง)
    const baseLatitude = 13.7563; // ละติจูดฐาน (กรุงเทพฯ)
    const baseLongitude = 100.5018; // ลองติจูดฐาน (กรุงเทพฯ)
    const scaleX = 0.0001; // ค่าแปลงสำหรับ X
    const scaleY = 0.0001; // ค่าแปลงสำหรับ Y

    const latitude = baseLatitude + (y * scaleY);
    const longitude = baseLongitude + (x * scaleX);

    return {
      lat: latitude.toFixed(8),
      lng: longitude.toFixed(8)
    };
  };

  // ฟังก์ชันอัพเดทตำแหน่ง Lat/Lng  
  const updateLatLngDisplay = (x: number, y: number, marker?: Marker) => {
    const { lat, lng } = convertToLatLng(x, y);
    // ส่งค่าไปยัง parent component (sosWarning.tsx)
    if (onLatLngChange) {
      onLatLngChange(parseFloat(lat), parseFloat(lng));
    }
    // ส่งข้อมูล marker ที่เลือกไปยัง parent component เฉพาะเมื่อไม่ได้ลาก
    // ป้องกันการส่ง marker data ซ้ำๆ ขณะลากที่อาจทำให้ FormVillageLocation สับสน
    if (onMarkerSelect && marker && !isDragging) {
      onMarkerSelect(marker);
    }
  };

  // ฟังก์ชันสำหรับแก้ไขชื่อ marker
  const updateMarkerName = (markerId: number, newName: string) => {
    // อัพเดท markers state
    setMarkers(prevMarkers => {
      const updatedMarkers = prevMarkers.map(marker => {
        if (marker.id === markerId) {
          const updatedMarker = {
            ...marker,
            name: newName
          };

          // ส่งข้อมูล marker ที่อัพเดทแล้วไปยัง parent component
          if (onMarkerSelect) {
            onMarkerSelect(updatedMarker);
          }

          // เรียกใช้ callback onMarkerNameChange
          if (onMarkerNameChange) {
            onMarkerNameChange(markerId, newName);
          }
          return updatedMarker;
        }
        return marker;
      });

      // อัพเดท clickedMarker ถ้ามี marker ที่ถูกเลือกอยู่
      const updatedClickedMarker = clickedMarker && clickedMarker.id === markerId
        ? { ...clickedMarker, name: newName }
        : clickedMarker;
      setClickedMarker(updatedClickedMarker);
      return updatedMarkers;
    });

    // อัพเดท editMarkerData ถ้ามีการแก้ไข marker อยู่
    if (editMarkerData && editMarkerData.id === markerId) {
      setEditMarkerData({
        ...editMarkerData,
        name: newName
      });
    }
  };

  // ฟังก์ชันสำหรับแก้ไข address ของ marker
  const updateMarkerAddress = (markerId: number, newAddress: string) => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker =>
        marker.id === markerId ? { ...marker, address: newAddress } : marker
      )
    );

    // ไม่เรียก onMarkerAddressChange ที่นี่เพื่อป้องกัน infinite loop
    // เพราะ onMarkerAddressChange จะเรียก updateMarkerAddress กลับมาอีก
  };

  // ฟังก์ชันสำหรับแก้ไข tel1 ของ marker
  const updateMarkerTel1 = (markerId: number, newTel1: string) => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === markerId) {
          // preserve ข้อมูล tel2 และ tel3 เดิม
          const updatedMarker = {
            ...marker,
            tel1: newTel1,
            tel2: marker.tel2 || "",
            tel3: marker.tel3 || ""
          };
          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // ฟังก์ชันสำหรับแก้ไข tel2 ของ marker
  const updateMarkerTel2 = (markerId: number, newTel2: string) => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === markerId) {
          // preserve ข้อมูล tel1 และ tel3 เดิม
          const updatedMarker = {
            ...marker,
            tel1: marker.tel1 || "",
            tel2: newTel2,
            tel3: marker.tel3 || ""
          };
          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // ฟังก์ชันสำหรับแก้ไข tel3 ของ marker
  const updateMarkerTel3 = (markerId: number, newTel3: string) => {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === markerId) {
          // preserve ข้อมูล tel1 และ tel2 เดิม
          const updatedMarker = {
            ...marker,
            tel1: marker.tel1 || "",
            tel2: marker.tel2 || "",
            tel3: newTel3
          };
          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // useEffect เพื่ออัพเดท refs เมื่อ state เปลี่ยน
  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // useEffect สำหรับอัพเดท marker เมื่อได้รับข้อมูลจาก parent
  useEffect(() => {
    if (selectedMarkerUpdate && selectedMarkerUpdate.id && selectedMarkerUpdate.name) {

      // เพิ่ม debounce เพื่อป้องกันการอัพเดทซ้ำ ๆ และให้เวลา form ในการตอบสนอง
      const timeoutId = setTimeout(() => {
        // ตรวจสอบว่า marker ที่จะอัพเดทเป็นตัวเดียวกันกับที่กำลัง click อยู่หรือไม่
        const isCurrentlySelected = lastSelectedMarkerId === selectedMarkerUpdate.id;
        // อัพเดททั้ง name และ roomAddress โดยไม่เรียก onMarkerSelect เพื่อป้องกัน cycle
        setMarkers(prevMarkers =>
          prevMarkers.map(marker =>
            marker.id === selectedMarkerUpdate.id
              ? {
                ...marker,
                name: selectedMarkerUpdate.name,
                roomAddress: selectedMarkerUpdate.name, // อัพเดท roomAddress ด้วย
                // อัพเดท originalX และ originalY ด้วยค่าปัจจุบัน หลังจาก confirm
                originalX: (selectedMarkerUpdate as any).originalX !== undefined ? (selectedMarkerUpdate as any).originalX : marker.originalX,
                originalY: (selectedMarkerUpdate as any).originalY !== undefined ? (selectedMarkerUpdate as any).originalY : marker.originalY
              }
              : marker
          )
        );
        // ไม่เรียก onMarkerSelect อีกครั้งเพื่อป้องกันการ loop และ form refresh
      }, 100); // เพิ่ม delay เล็กน้อยเพื่อให้ form ประมวลผลเสร็จ

      return () => clearTimeout(timeoutId);
    }
  }, [selectedMarkerUpdate]);

  // useEffect สำหรับเชื่อมต่อ address callback
  useEffect(() => {
    if (onMarkerAddressChange) {
      // เพิ่ม marker address change handler ไปใน window หรือใช้วิธีอื่น
    }
  }, [onMarkerAddressChange]);

  // useEffect สำหรับติดตาม markers ที่เป็นสีแดงและสีเหลือง
  useEffect(() => {
    if (onAlertMarkersChange) {
      const redMarkers = markers.filter(marker => marker.color === 'red' || marker.status === 'emergency');
      const yellowMarkers = markers.filter(marker => marker.color === 'yellow' || marker.status === 'warning');


      // ส่งข้อมูล alert markers ไปยัง parent component
      onAlertMarkersChange({
        red: redMarkers,
        yellow: yellowMarkers
      });
    }
  }, [markers, onAlertMarkersChange]);

  // ฟังก์ชัน cancel สำหรับคืนค่า marker กลับสู่สภาพเดิม
  const cancelMarkerEdit = (options?: { unlockAll?: boolean }) => {
    // หาข้อมูล marker ที่จะ cancel
    const markerToCancel = clickedMarker || editMarkerData;
    if (!markerToCancel) {
      return;
    }

    // ตรวจสอบว่าเป็น temporary marker หรือไม่
    // Temporary marker จะมี ID เป็นตัวเลขขนาดใหญ่ (มากกว่า 1000000)
    const isTemporaryMarker = typeof markerToCancel.id === 'number' && markerToCancel.id > 1000000;
    
    if (isTemporaryMarker) {
      // สำหรับ temporary marker ให้ลบออกแทนที่จะคืนค่า
      setMarkers(prevMarkers => {
        return prevMarkers.filter(marker => marker.id !== markerToCancel.id);
      });

      // รีเซ็ตสถานะต่างๆ
      setClickedMarker(null);
      setHasActiveMarker(false);
      setEditMarkerData(null);
      setShowPopup(false);
      setDraggedMarker(null);
      setIsDragging(false);
      setOriginalMarkerPosition(null);
      setOriginalMarkerBeforeEdit(null); // เพิ่มการ reset นี้

      // Unlock markers ทั้งหมดเมื่อ cancel
      if (!options || options.unlockAll !== false) {
        unlockAllMarkers();
      }

      // แจ้งไปยัง parent component ว่าไม่มี active marker แล้ว
      if (onActiveMarkerChange) {
        onActiveMarkerChange(false);
      }

      // Clear setUnitClick ถ้าอยู่ใน preview mode
      if (mapMode === 'preview' && setUnitClick) {
        setUnitClick(null);
      }

      // ส่งสัญญาณไปยัง parent component ว่ายกเลิกการแก้ไข
      setTimeout(() => {
        if (onMarkerSelect) {
          onMarkerSelect(null);
        }
      }, 150);

      return; // จบการทำงานสำหรับ temporary marker
    }

    // คืนค่า marker กลับไปตำแหน่งเดิม (ก่อนเริ่มลาก)
    setMarkers(prevMarkers => {
      return prevMarkers.map(marker => {
        if (marker.id === markerToCancel.id) {
          // ใช้ originalMarkerBeforeEdit ถ้ามี (ตำแหน่งก่อนเริ่มลาก) หรือ originalX/originalY
          let targetX, targetY;

          if (originalMarkerBeforeEdit && originalMarkerBeforeEdit.id === marker.id) {
            // กรณีลาก marker - ใช้ตำแหน่งก่อนเริ่มลาก
            targetX = originalMarkerBeforeEdit.x;
            targetY = originalMarkerBeforeEdit.y;
          } else {
            // กรณีแก้ไขข้อมูล - ใช้ตำแหน่งล่าสุดที่ update
            targetX = marker.originalX || marker.x;
            targetY = marker.originalY || marker.y;
          }

          // ถ้ามี editMarkerData ให้คืนค่าข้อมูลอื่นๆ ด้วย
          if (editMarkerData && editMarkerData.id === marker.id) {
            const originalName = (editMarkerData as any).originalName || editMarkerData.name;
            const originalRoomAddress = (editMarkerData as any).originalRoomAddress || editMarkerData.roomAddress;
            const originalAddress = (editMarkerData as any).originalAddress || editMarkerData.address;
            const originalTel1 = (editMarkerData as any).originalTel1 || editMarkerData.tel1;
            const originalTel2 = (editMarkerData as any).originalTel2 || editMarkerData.tel2;
            const originalTel3 = (editMarkerData as any).originalTel3 || editMarkerData.tel3;
            const originalAddressData = (editMarkerData as any).originalAddressData || editMarkerData.addressData;

            return {
              ...marker,
              x: targetX,
              y: targetY,
              name: originalName,
              roomAddress: originalRoomAddress,
              address: originalAddress,
              tel1: originalTel1,
              tel2: originalTel2,
              tel3: originalTel3,
              addressData: originalAddressData
            };
          } else {
            // เฉพาะกรณีลาก marker - คืนตำแหน่งอย่างเดียว
            return {
              ...marker,
              x: targetX,
              y: targetY
            };
          }
        }
        return marker;
      });
    });

    // แจ้ง parent component
    if (onMarkerSelect) {
      const targetMarker = markers.find(m => m.id === markerToCancel.id);
      if (targetMarker) {
        // ใช้ originalMarkerBeforeEdit ถ้ามี หรือ originalX/originalY
        let resetX, resetY;
        if (originalMarkerBeforeEdit && originalMarkerBeforeEdit.id === targetMarker.id) {
          resetX = originalMarkerBeforeEdit.x;
          resetY = originalMarkerBeforeEdit.y;
        } else {
          resetX = targetMarker.originalX || targetMarker.x;
          resetY = targetMarker.originalY || targetMarker.y;
        }

        const updatedMarker = {
          ...targetMarker,
          x: resetX,
          y: resetY
        };

        setTimeout(() => {
          onMarkerSelect(updatedMarker);

          // อัพเดทชื่อ marker ถ้าจำเป็น
          if (editMarkerData && onMarkerNameChange) {
            const originalName = (editMarkerData as any).originalName || editMarkerData.name;
            onMarkerNameChange(markerToCancel.id, originalName);
          }
        }, 100);
      }
    }

    // รีเซ็ตสถานะต่างๆ
    setClickedMarker(null);
    setHasActiveMarker(false);
    setEditMarkerData(null);
    setShowPopup(false);
    setDraggedMarker(null);
    setIsDragging(false);
    setOriginalMarkerPosition(null);

    // Unlock markers ทั้งหมดเมื่อ cancel (ค่าเริ่มต้น true เว้นแต่ส่ง flag เป็น false)
    if (!options || options.unlockAll !== false) {
      unlockAllMarkers();
    }

    // รีเซ็ตสถานะ active marker (รวมกรณี active จาก query string)
    setMarkers(prevMarkers =>
      prevMarkers.map(m => ({
        ...m,
        isActive: false
      }))
    );

    // หาก marker นี้ active มาจาก query string ให้ reset query string state
    const urlParams = new URLSearchParams(window.location.search);
    const unitIdFromQuery = urlParams.get('unitId');
    // if (unitIdFromQuery && markerToCancel && markerToCancel.unitID === parseInt(unitIdFromQuery)) {
    //   setHasProcessedQueryString(false); // รีเซ็ตเพื่อให้สามารถ process query string ใหม่ได้
    // }

    // แจ้งไปยัง parent component ว่าไม่มี active marker แล้ว
    if (onActiveMarkerChange) {
      onActiveMarkerChange(false);
    }

    // Clear setUnitClick ถ้าอยู่ใน preview mode
    if (mapMode === 'preview' && setUnitClick) {
      setUnitClick(null);
    }

    // ส่งสัญญาณไปยัง parent component ว่ายกเลิกการแก้ไข
    setTimeout(() => {
      if (onMarkerSelect) {
        onMarkerSelect(null);
      }
    }, 150);
  };

  // useEffect สำหรับตั้งค่า reset function ให้ parent เรียกใช้
  useEffect(() => {
    if (villageMapResetRef) {
      villageMapResetRef.current = (markerId: number | string) => {
        // ถ้าไม่ได้ส่ง markerId มา หรือ markerId เป็น "cancel" ให้ใช้ cancelMarkerEdit
        if (!markerId || markerId === "cancel") {
          cancelMarkerEdit({ unlockAll: false });
          return;
        }

        // ถ้ามี clickedMarker และ markerId ตรงกัน ให้ใช้ cancelMarkerEdit แทนการลบ
        if (clickedMarker && (clickedMarker.id === markerId || clickedMarker.id.toString() === markerId.toString())) {
          cancelMarkerEdit({ unlockAll: false });
          return;
        }

        // หา marker ใน state ปัจจุบัน
        const targetMarker = markers.find(m => m.id === markerId);

        if (targetMarker) {
          // ลบ marker ออกจาก state โดยตรง (ไม่ต้องเช็คว่าเป็น pending หรือไม่)
          setMarkers(prevMarkers => {
            const filtered = prevMarkers.filter(marker => marker.id !== markerId);
            return filtered;
          });

          // ล้าง pendingMarker state ถ้า markerId ตรงกัน
          if (pendingMarker?.id === markerId) {
            // console.log('🎯 VillageMapTS - Clearing pendingMarker state');
            // setPendingMarker(null);
          }

          // แจ้ง parent component ว่า marker ถูกยกเลิกแล้ว
          if (onMarkerSelect) {
            onMarkerSelect(null);
          }
        }
      };
    }
    return () => {
      if (villageMapResetRef) {
        villageMapResetRef.current = null;
      }
    };
  }, [villageMapResetRef, markers, cancelMarkerEdit]);

  // useEffect สำหรับตั้งค่า updateMarkerAddress function ให้ parent เรียกใช้
  useEffect(() => {
    if (villageMapUpdateAddressRef) {
      villageMapUpdateAddressRef.current = (markerId: number | string, newAddress: string) => {
        updateMarkerAddress(typeof markerId === 'string' ? parseInt(markerId) : markerId, newAddress);
      };
    }
    return () => {
      if (villageMapUpdateAddressRef) {
        villageMapUpdateAddressRef.current = null;
      }
    };
  }, [villageMapUpdateAddressRef]);

  // useEffect สำหรับตั้งค่า updateMarkerTel function ให้ parent เรียกใช้
  useEffect(() => {
    if (villageMapUpdateTelRef) {
      villageMapUpdateTelRef.current = (markerId: number | string, telType: 'tel1' | 'tel2' | 'tel3', newTel: string) => {
        const numericMarkerId = typeof markerId === 'string' ? parseInt(markerId) : markerId;

        switch (telType) {
          case 'tel1':
            updateMarkerTel1(numericMarkerId, newTel);
            break;
          case 'tel2':
            updateMarkerTel2(numericMarkerId, newTel);
            break;
          case 'tel3':
            updateMarkerTel3(numericMarkerId, newTel);
            break;
        }
      };
    }
    return () => {
      if (villageMapUpdateTelRef) {
        villageMapUpdateTelRef.current = null;
      }
    };
  }, [villageMapUpdateTelRef]);

  // useEffect สำหรับตั้งค่า confirm marker function ให้ parent เรียกใช้
  useEffect(() => {
    if (villageMapConfirmRef) {
      villageMapConfirmRef.current = (markerId: number | string, markerData: any) => {
        const numericMarkerId = typeof markerId === 'string' ? parseInt(markerId) : markerId;
        // อัพเดท marker ด้วยข้อมูลครบถ้วนจาก API
        setMarkers(prevMarkers => {
          const updatedMarkers = prevMarkers.map(marker => {
            if (marker.id === numericMarkerId) {
              // สร้าง updated marker ด้วยข้อมูลจาก API response
              const updatedMarker = {
                ...marker,
                // อัพเดท id ใหม่จาก API (ถ้ามี)
                id: markerData.id !== undefined ? markerData.id : marker.id,
                // อัพเดทข้อมูลพื้นฐาน - ใช้จาก markerData เสมอถ้ามีค่า
                name: markerData.name || marker.name,
                address: markerData.address || marker.address,
                tel1: markerData.tel1 || marker.tel1 || "",
                tel2: markerData.tel2 || marker.tel2 || "",
                tel3: markerData.tel3 || marker.tel3 || "",
                group: markerData.group || marker.group,
                color: markerData.color || marker.color,
                // อัพเดทข้อมูลตำแหน่ง (ถ้ามี)
                x: markerData.x !== undefined ? markerData.x : marker.x,
                y: markerData.y !== undefined ? markerData.y : marker.y,
                // หลังจาก confirm ให้ originalX/Y เป็นตำแหน่งปัจจุบันของ marker (ไม่ใช่จาก markerData)
                originalX: marker.x, // ใช้ตำแหน่งปัจจุบันของ marker ใน state
                originalY: marker.y, // ใช้ตำแหน่งปัจจุบันของ marker ใน state
                // อัพเดทข้อมูลเพิ่มเติมจาก API
                unitID: markerData.unitID || marker.unitID,
                roomAddress: markerData.roomAddress || marker.roomAddress || "",
                unitNo: markerData.unitNo || marker.unitNo || ""
              };
              return updatedMarker;
            }
            return marker;
          });
          return updatedMarkers;
        });

        // เคลียร์ pending marker state
        setPendingMarker(null);

        // บันทึกประวัติ
        addToHistory(ACTION_TYPES.ADD_MARKER, markerData);

        // อัปเดต originalMarkerBeforeEdit ให้เป็นตำแหน่งล่าสุดหลังจาก confirm
        // เพื่อให้การ cancel ครั้งต่อไปกลับไปตำแหน่งที่ถูกต้อง
        setOriginalMarkerBeforeEdit(prev => {
          if (prev && prev.id === numericMarkerId) {
            const updatedMarker = {
              ...prev,
              x: markerData.x !== undefined ? markerData.x : prev.x,
              y: markerData.y !== undefined ? markerData.y : prev.y,
              name: markerData.name || prev.name,
              address: markerData.address || prev.address,
              tel1: markerData.tel1 || prev.tel1 || "",
              tel2: markerData.tel2 || prev.tel2 || "",
              tel3: markerData.tel3 || prev.tel3 || "",
              roomAddress: markerData.roomAddress || prev.roomAddress || "",
              unitID: markerData.unitID || prev.unitID,
              unitNo: markerData.unitNo || prev.unitNo || ""
            };
            return updatedMarker;
          }
          return prev;
        });
        // ยกเลิกการ active marker หลังจาก confirm
        setClickedMarker(null);
        setHasActiveMarker(false);
        setShowPopup(false);
        setEditMarkerData(null);

        // แจ้ง parent component ว่าไม่มี marker ที่เลือกแล้ว
        if (onMarkerSelect) {
          setTimeout(() => {
            onMarkerSelect(null);
          }, 100);
        }
        // Force re-render เพื่อให้แน่ใจว่า marker แสดงผลข้อมูลใหม่
        setForceRenderKey(prev => prev + 1);
      };
    }
    return () => {
      if (villageMapConfirmRef) {
        villageMapConfirmRef.current = null;
      }
    };
  }, [villageMapConfirmRef]);

  // useEffect สำหรับตั้งค่า refresh function ให้ parent เรียกใช้
  useEffect(() => {
    if (villageMapRefreshRef) {
      villageMapRefreshRef.current = () => {
        
        // Force re-render เพื่อให้ marker กลับไปตำแหน่งที่ถูกต้อง
        setForceRenderKey(prev => prev + 1);

        // ปิดการรีเซ็ต zoom และ pan เมื่อ refresh เพื่อไม่ให้เด้งหลังสร้าง marker
        // setZoomLevel(1);
        // setPanOffset({ x: 0, y: 0 });

        // Force re-calculate marker positions
        setTimeout(() => {
          setMarkers(prevMarkers => [...prevMarkers]);
          setZones(prevZones => [...prevZones]);
        }, 50);

        // อีกครั้งหลังจาก DOM stable
        setTimeout(() => {
          setForceRenderKey(prev => prev + 1);
        }, 100);

      };
    }
    return () => {
      if (villageMapRefreshRef) {
        villageMapRefreshRef.current = null;
      }
    };
  }, [villageMapRefreshRef]);

  // useEffect สำหรับจัดการ onMarkerUpdate callback
  useEffect(() => {
    if (onMarkerUpdate) {
      // เก็บ original callback ใน ref
      onMarkerUpdateRef.current = (markerId: number | string, updatedMarker: any) => {
        // อัพเดท marker ใน state ก่อน
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (marker.id === markerId || marker.id.toString() === markerId.toString()) {
              const newMarker = {
                ...marker,
                ...updatedMarker,
                // อัพเดท originalX และ originalY ด้วยค่าปัจจุบัน หลังจาก confirm
                originalX: updatedMarker.originalX !== undefined ? updatedMarker.originalX : marker.originalX,
                originalY: updatedMarker.originalY !== undefined ? updatedMarker.originalY : marker.originalY
              };
              return newMarker;
            }
            return marker;
          })
        );

        // อัพเดท clickedMarker ถ้าเป็น marker ที่กำลังเลือกอยู่
        if (clickedMarker && (clickedMarker.id === markerId || clickedMarker.id.toString() === markerId.toString())) {
          const newClickedMarker = {
            ...clickedMarker,
            ...updatedMarker,
            originalX: updatedMarker.originalX !== undefined ? updatedMarker.originalX : clickedMarker.originalX,
            originalY: updatedMarker.originalY !== undefined ? updatedMarker.originalY : clickedMarker.originalY
          };
          setClickedMarker(newClickedMarker);
        }

        // อัปเดต originalMarkerBeforeEdit ถ้าเป็น marker เดียวกับที่กำลัง update
        setOriginalMarkerBeforeEdit(prev => {
          if (prev && (prev.id === markerId || prev.id.toString() === markerId.toString())) {
            const updatedOriginal = {
              ...prev,
              ...updatedMarker,
              // อัปเดตตำแหน่งเป็นตำแหน่งล่าสุดที่ update
              x: updatedMarker.x !== undefined ? updatedMarker.x : prev.x,
              y: updatedMarker.y !== undefined ? updatedMarker.y : prev.y
            };
            return updatedOriginal;
          }
          return prev;
        });
        // เรียก original callback
        onMarkerUpdate(markerId, updatedMarker);
      };

      // เก็บ ref ไว้ใน window object เพื่อให้ FormVillageLocation เข้าถึงได้
      (window as any).villageMapOnMarkerUpdateRef = onMarkerUpdateRef;

    }
  }, [onMarkerUpdate, clickedMarker]);

  // คำนวณระยะทางระหว่างสองจุด
  const getDistance = (point1: Position, point2: Position): number => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // อัพเดทกลุ่มของ marker เมื่อตำแหน่งเปลี่ยน (ปิดการใช้งานเพื่อไม่ให้สร้าง marker ใหม่)
  // useEffect(
  //   () => {
  //     setMarkers(prevMarkers =>
  //       prevMarkers.map(marker => {
  //         const zone = findMarkerZone(marker);
  //         const newGroup = zone ? zone.name : "Marker";
  //         // อัพเดทเฉพาะเมื่อกลุ่มเปลี่ยนแปลง
  //         if (marker.group !== newGroup) {
  //           return { ...marker, group: newGroup };
  //         }
  //         return marker;
  //       })
  //     );
  //   },
  //   [zones, markers.length] // เพิ่ม markers.length เพื่อให้อัพเดทเมื่อมี marker ใหม่
  // );


  // เมื่อสร้างกลุ่มใหม่ให้กำหนดค่าเริ่มต้นเป็นแสดง
  useEffect(
    () => {
      const newVisibleZones: VisibleZones = {};
      zones.forEach(zone => {
        if (visibleZones[zone.id] === undefined) {
          newVisibleZones[zone.id] = true;
        }
      });
      setVisibleZones({ ...visibleZones, ...newVisibleZones });
    },
    [zones]
  );

  // หาจุดกึ่งกลางของกลุ่ม
  const getZoneCenter = (zone: Zone): Position => {
    return {
      x: zone.x + zone.width / 2,
      y: zone.y + zone.height / 2
    };
  };

  // ฟังก์ชันตรวจจับรูปแบบพื้นที่ (ปรับปรุงใหม่)
  const analyzeAreaPattern = (imageData: ImageData, x: number, y: number) => {
    const width = imageData.width;
    const height = imageData.height;
    const targetColor = getPixelColor(imageData, x, y);

    // ตรวจสอบว่าเป็นสีขอบหรือไม่
    if (isEdgeColor(targetColor)) {
      return { type: "edge", direction: null };
    }

    // ตรวจสอบรูปแบบการกระจายตัวของสีเดียวกัน
    const scanRadius = 50;
    const directions = {
      horizontal: { count: 0, maxStreak: 0, currentStreak: 0 },
      vertical: { count: 0, maxStreak: 0, currentStreak: 0 }
    };

    // สแกนแนวนอน
    for (let dx = -scanRadius; dx <= scanRadius; dx++) {
      const checkX = x + dx;
      if (checkX >= 0 && checkX < width) {
        const color = getPixelColor(imageData, checkX, y);
        if (colorsSimilar(color, targetColor, 15)) {
          directions.horizontal.count++;
          directions.horizontal.currentStreak++;
          directions.horizontal.maxStreak = Math.max(directions.horizontal.maxStreak, directions.horizontal.currentStreak);
        } else {
          directions.horizontal.currentStreak = 0;
        }
      }
    }

    // สแกนแนวตั้ง
    directions.vertical.currentStreak = 0;
    for (let dy = -scanRadius; dy <= scanRadius; dy++) {
      const checkY = y + dy;
      if (checkY >= 0 && checkY < height) {
        const color = getPixelColor(imageData, x, checkY);
        if (colorsSimilar(color, targetColor, 15)) {
          directions.vertical.count++;
          directions.vertical.currentStreak++;
          directions.vertical.maxStreak = Math.max(directions.vertical.maxStreak, directions.vertical.currentStreak);
        } else {
          directions.vertical.currentStreak = 0;
        }
      }
    }

    // วิเคราะห์รูปแบบ
    const hRatio = directions.horizontal.count / (scanRadius * 2 + 1);
    const vRatio = directions.vertical.count / (scanRadius * 2 + 1);
    const hStreak = directions.horizontal.maxStreak;
    const vStreak = directions.vertical.maxStreak;

    // ตรวจจับประเภทพื้นที่
    if (hRatio > 0.7 && hStreak > scanRadius * 0.6) {
      return { type: "corridor", direction: "horizontal", strength: hRatio };
    } else if (vRatio > 0.7 && vStreak > scanRadius * 0.6) {
      return { type: "corridor", direction: "vertical", strength: vRatio };
    } else if (hRatio > 0.4 && vRatio > 0.4) {
      return { type: "room", direction: "both", strength: (hRatio + vRatio) / 2 };
    } else {
      return { type: "irregular", direction: null, strength: Math.max(hRatio, vRatio) };
    }
  };

  // ฟังก์ชันสร้างขอบเขตสำหรับถนน/ทางเดิน
  const createCorridorBounds = (imageData: ImageData, x: number, y: number, direction: string, targetColor: PixelColor) => {
    const width = imageData.width;
    const height = imageData.height;

    let minX = x,
      maxX = x,
      minY = y,
      maxY = y;

    if (direction === "horizontal") {
      // ขยายไปทางซ้าย
      for (let checkX = x - 1; checkX >= 0; checkX--) {
        const color = getPixelColor(imageData, checkX, y);
        if (!colorsSimilar(color, targetColor, 12)) break;
        minX = checkX;
      }

      // ขยายไปทางขวา
      for (let checkX = x + 1; checkX < width; checkX++) {
        const color = getPixelColor(imageData, checkX, y);
        if (!colorsSimilar(color, targetColor, 12)) break;
        maxX = checkX;
      }

      // หาความกว้างในแนวตั้ง
      for (let checkY = y - 1; checkY >= 0; checkY--) {
        const color = getPixelColor(imageData, x, checkY);
        if (!colorsSimilar(color, targetColor, 12)) break;
        minY = checkY;
      }

      for (let checkY = y + 1; checkY < height; checkY++) {
        const color = getPixelColor(imageData, x, checkY);
        if (!colorsSimilar(color, targetColor, 12)) break;
        maxY = checkY;
      }
    } else if (direction === "vertical") {
      // ขยายไปทางบน
      for (let checkY = y - 1; checkY >= 0; checkY--) {
        const color = getPixelColor(imageData, x, checkY);
        if (!colorsSimilar(color, targetColor, 12)) break;
        minY = checkY;
      }

      // ขยายไปทางล่าง
      for (let checkY = y + 1; checkY < height; checkY++) {
        const color = getPixelColor(imageData, x, checkY);
        if (!colorsSimilar(color, targetColor, 12)) break;
        maxY = checkY;
      }

      // หาความกว้างในแนวนอน
      for (let checkX = x - 1; checkX >= 0; checkX--) {
        const color = getPixelColor(imageData, checkX, y);
        if (!colorsSimilar(color, targetColor, 12)) break;
        minX = checkX;
      }

      for (let checkX = x + 1; checkX < width; checkX++) {
        const color = getPixelColor(imageData, checkX, y);
        if (!colorsSimilar(color, targetColor, 12)) break;
        maxX = checkX;
      }
    }

    return { minX, maxX, minY, maxY };
  };

  // ฟังก์ชันตรวจจับขอบเขตพื้นที่อัตโนมัติ (ปรับปรุงใหม่)
  const detectAreaBounds = (x: number, y: number): Promise<AreaBounds | null> => {
    return new Promise(resolve => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = imageRef.current;

      if (!image) {
        resolve(null);
        return;
      }
      // ตั้งค่าขนาด canvas ให้เท่ากับรูปภาพ
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      // วาดรูปภาพลงใน canvas
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(image, 0, 0);

      // แปลงตำแหน่งจาก display coordinates เป็น natural image coordinates
      const scaleX = image.naturalWidth / image.offsetWidth;
      const scaleY = image.naturalHeight / image.offsetHeight;
      const imageX = Math.floor(x * scaleX);
      const imageY = Math.floor(y * scaleY);
      try {
        // ดึงข้อมูลสีที่จุดที่คลิก
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // ประกาศตัวแปรสีเป้าหมาย (ใช้ let เพื่อให้สามารถ reassign ได้)
        let targetPixel = getPixelColor(imageData, imageX, imageY);

        // ตรวจสอบว่าเป็นสีขอบหรือไม่ (แต่ยืดหยุ่นขึ้น)
        if (isEdgeColor(targetPixel)) {
          // ลองหาสีที่ไม่ใช่ขอบในรัศมี 5 pixels
          let alternativeColor = null;
          for (let dy = -5; dy <= 5 && !alternativeColor; dy++) {
            for (let dx = -5; dx <= 5 && !alternativeColor; dx++) {
              const checkX = imageX + dx;
              const checkY = imageY + dy;
              if (checkX >= 0 && checkX < canvas.width && checkY >= 0 && checkY < canvas.height) {
                const checkColor = getPixelColor(imageData, checkX, checkY);
                if (!isEdgeColor(checkColor)) {
                  alternativeColor = checkColor;
                }
              }
            }
          }

          if (alternativeColor) {
            targetPixel = alternativeColor;
          } else {
            resolve(null);
            return;
          }
        }


        // ใช้ flood fill เฉพาะพื้นที่ที่เชื่อมต่อกันจากจุดคลิก (วิธีเดิมที่ทำงานได้ดี)
        const connectedRegion = floodFillFromPoint(imageData, imageX, imageY, targetPixel, 15);

        if (!connectedRegion || connectedRegion.pixelCount < 1) {
          resolve(null);
          return;
        }
        // ปรับปรุงขอบเขตให้แม่นยำ
        const optimizedBounds = optimizeBounds(imageData, connectedRegion, targetPixel, 15);
        const bestRegion = {
          minX: optimizedBounds.minX,
          maxX: optimizedBounds.maxX,
          minY: optimizedBounds.minY,
          maxY: optimizedBounds.maxY,
          width: optimizedBounds.maxX - optimizedBounds.minX + 1,
          height: optimizedBounds.maxY - optimizedBounds.minY + 1,
          pixelCount: connectedRegion.pixelCount,
          areaType: "connected"
        };
        // แปลงกลับเป็น display coordinates
        const displayBounds = {
          x: bestRegion.minX / scaleX,
          y: bestRegion.minY / scaleY,
          width: bestRegion.width / scaleX,
          height: bestRegion.height / scaleY,
          areaType: "complete", // บอกว่าเป็นการตรวจจับแบบครบถ้วน
          pixelCount: bestRegion.pixelCount
        };

        // ตรวจสอบขนาดขั้นต่ำและสูงสุด
        const area = displayBounds.width * displayBounds.height;
        const imageArea = image.offsetWidth * image.offsetHeight;
        const areaRatio = area / imageArea;
        // เกณฑ์การยอมรับ - ยอมรับทุกขนาด ไม่มีขีดจำกัดขั้นต่ำ
        const maxRatio = 0.5; // จำกัดเฉพาะขนาดสูงสุดเพื่อป้องกัน zone ใหญ่เกินไป

        if (displayBounds.width > 0 && displayBounds.height > 0 && areaRatio <= maxRatio) {
          resolve(displayBounds);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.log("❌ ข้อผิดพลาดในการตรวจจับพื้นที่:", error);
        resolve(null);
      }
    });
  };

  // ฟังก์ชันดึงสีของ pixel
  const getPixelColor = (imageData: ImageData, x: number, y: number): PixelColor => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };

  // ฟังก์ชันตรวจจับว่าสีเหมือนกันหรือไม่ (ปรับให้ยืดหยุ่นขึ้น)
  const colorsSimilar = (color1: PixelColor, color2: PixelColor, tolerance = 12): boolean => {
    // ใช้ Euclidean distance สำหรับความแม่นยำที่ดีขึ้น
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    // ปรับ tolerance ให้เหมาะสมกับ euclidean distance
    const euclideanTolerance = tolerance * 1.732; // sqrt(3) สำหรับ 3D space

    return distance <= euclideanTolerance;
  };

  // ฟังก์ชันตรวจจับว่าเป็นสีขอบ (เส้นแบ่ง) หรือไม่
  const isEdgeColor = (color: PixelColor): boolean => {
    // ตรวจจับสีที่เป็นเส้นขอบ เช่น สีดำ สีเทาเข้ม หรือสีที่ใกล้เคียง
    const isDark = color.r < 80 && color.g < 80 && color.b < 80;
    const isGray = Math.abs(color.r - color.g) < 20 && Math.abs(color.g - color.b) < 20 && Math.abs(color.r - color.b) < 20;
    return isDark || (isGray && color.r < 120);
  };

  // ฟังก์ชันตรวจจับว่าควรหยุดการขยายหรือไม่
  const shouldStopExpansion = (currentColor: PixelColor, targetColor: PixelColor, neighborColor: PixelColor): boolean => {
    // หยุดถ้าสีปัจจุบันไม่เหมือนสีเป้าหมาย
    if (!colorsSimilar(currentColor, targetColor)) {
      return true;
    }

    // หยุดถ้าเจอสีขอบ
    if (isEdgeColor(currentColor)) {
      return true;
    }

    // หยุดถ้าเจอสีที่แตกต่างมากจากสีเป้าหมาย
    const colorDifference =
      Math.abs(currentColor.r - targetColor.r) +
      Math.abs(currentColor.g - targetColor.g) +
      Math.abs(currentColor.b - targetColor.b);

    return colorDifference > 25; // หยุดถ้าผลรวมความแตกต่างสีมากกว่า 25
  };

  // ฟังก์ชัน flood fill แบบ Smart สำหรับห้อง/บล็อก
  const smartFloodFill = (imageData: ImageData, startX: number, startY: number, targetColor: PixelColor, areaType: any) => {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Set<string>();
    const stack = [{ x: startX, y: startY }];

    let minX = startX,
      maxX = startX;
    let minY = startY,
      maxY = startY;
    let pixelCount = 0;

    // ปรับ parameters ตามประเภทพื้นที่
    let maxPixels: number, tolerance: number;
    switch (areaType.type) {
      case "corridor":
        maxPixels = 50000;
        tolerance = 15;
        break;
      case "room":
        maxPixels = 25000;
        tolerance = 10;
        break;
      default:
        maxPixels = 15000;
        tolerance = 8;
    }

    while (stack.length > 0 && pixelCount < maxPixels) {
      const item = stack.pop();
      if (!item) continue;
      const { x, y } = item;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const currentColor = getPixelColor(imageData, x, y);

      // ใช้ tolerance ที่เหมาะสมกับประเภทพื้นที่
      if (!colorsSimilar(currentColor, targetColor, tolerance)) {
        continue;
      }

      // ตรวจสอบว่าเป็นขอบเขตหรือไม่
      if (isEdgeColor(currentColor)) {
        continue;
      }

      visited.add(key);
      pixelCount++;

      // อัพเดทขอบเขต
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // เพิ่มจุดข้างเคียง
      const neighbors = [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];

      for (const neighbor of neighbors) {
        if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
          stack.push(neighbor);
        }
      }
    }

    return { minX, maxX, minY, maxY, pixelCount };
  };

  // ฟังก์ชันหาขอบเขตที่แม่นยำสำหรับห้อง/บล็อก
  const findRoomBounds = (imageData: ImageData, x: number, y: number, targetColor: PixelColor) => {
    const width = imageData.width;
    const height = imageData.height;

    // หาขอบเขตด้วยการสแกนจากจุดกลาง
    let minX = x,
      maxX = x,
      minY = y,
      maxY = y;

    // สแกนหาขอบซ้าย
    for (let checkX = x - 1; checkX >= 0; checkX--) {
      let shouldStop = false;

      // ตรวจสอบแนวตั้งที่ตำแหน่งนี้
      for (let scanY = Math.max(0, y - 10); scanY <= Math.min(height - 1, y + 10); scanY++) {
        const color = getPixelColor(imageData, checkX, scanY);
        if (isEdgeColor(color) || !colorsSimilar(color, targetColor, 12)) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop) break;
      minX = checkX;
    }

    // สแกนหาขอบขวา
    for (let checkX = x + 1; checkX < width; checkX++) {
      let shouldStop = false;

      for (let scanY = Math.max(0, y - 10); scanY <= Math.min(height - 1, y + 10); scanY++) {
        const color = getPixelColor(imageData, checkX, scanY);
        if (isEdgeColor(color) || !colorsSimilar(color, targetColor, 12)) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop) break;
      maxX = checkX;
    }

    // สแกนหาขอบบน
    for (let checkY = y - 1; checkY >= 0; checkY--) {
      let shouldStop = false;

      for (let scanX = Math.max(0, minX); scanX <= Math.min(width - 1, maxX); scanX++) {
        const color = getPixelColor(imageData, scanX, checkY);
        if (isEdgeColor(color) || !colorsSimilar(color, targetColor, 12)) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop) break;
      minY = checkY;
    }

    // สแกนหาขอบล่าง
    for (let checkY = y + 1; checkY < height; checkY++) {
      let shouldStop = false;

      for (let scanX = Math.max(0, minX); scanX <= Math.min(width - 1, maxX); scanX++) {
        const color = getPixelColor(imageData, scanX, checkY);
        if (isEdgeColor(color) || !colorsSimilar(color, targetColor, 12)) {
          shouldStop = true;
          break;
        }
      }

      if (shouldStop) break;
      maxY = checkY;
    }

    return { minX, maxX, minY, maxY };
  };

  // ฟังก์ชันหาพื้นที่สีเดียวกันทั้งหมดในภาพ (Complete Area Detection)
  const findAllColorRegions = (imageData: ImageData, targetColor: PixelColor, tolerance = 12) => {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Array(width * height).fill(false);
    const regions: ConnectedRegion[] = [];


    // สแกนทุก pixel ในภาพ
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;

        if (visited[index]) continue;

        const currentColor = getPixelColor(imageData, x, y);

        // ตรวจสอบว่าสีตรงกับที่ต้องการหรือไม่
        if (!colorsSimilar(currentColor, targetColor, tolerance) || isEdgeColor(currentColor)) {
          continue;
        }

        // เริ่ม flood fill จากจุดนี้
        const region = floodFillRegion(imageData, x, y, targetColor, visited, tolerance);

        // เก็บเฉพาะ region ที่มีขนาดเหมาะสม
        if (region && region.pixelCount >= 50) {
          regions.push(region);
        }
      }
    }
    return regions;
  };

  // ฟังก์ชัน flood fill สำหรับหา region เดียว
  const floodFillRegion = (imageData: ImageData, startX: number, startY: number, targetColor: PixelColor, visited: boolean[], tolerance: number) => {
    const width = imageData.width;
    const height = imageData.height;
    const stack = [{ x: startX, y: startY }];

    let minX = startX,
      maxX = startX;
    let minY = startY,
      maxY = startY;
    let pixelCount = 0;
    const pixels: Array<{ x: number, y: number }> = [];

    while (stack.length > 0 && pixelCount < 100000) {
      // จำกัดขนาดสูงสุด
      const item = stack.pop();
      if (!item) continue;
      const { x, y } = item;
      const index = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
        continue;
      }

      const currentColor = getPixelColor(imageData, x, y);

      if (!colorsSimilar(currentColor, targetColor, tolerance) || isEdgeColor(currentColor)) {
        continue;
      }

      visited[index] = true;
      pixelCount++;
      pixels.push({ x, y });

      // อัพเดทขอบเขต
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // เพิ่มจุดข้างเคียง (4-connected)
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixelCount,
      pixels,
      centerX: Math.floor((minX + maxX) / 2),
      centerY: Math.floor((minY + maxY) / 2)
    };
  };

  // ฟังก์ชันปรับขอบเขตให้แม่นยำขึ้น
  const optimizeBounds = (imageData: ImageData, region: ConnectedRegion, targetColor: PixelColor, tolerance = 12) => {
    let { minX, maxX, minY, maxY } = region;

    // ปรับขอบเขตให้กระชับขึ้นโดยตรวจสอบขอบ
    let hasContent = false;

    // ตรวจสอบขอบซ้าย
    for (let x = minX; x <= maxX; x++) {
      hasContent = false;
      for (let y = minY; y <= maxY; y++) {
        const color = getPixelColor(imageData, x, y);
        if (colorsSimilar(color, targetColor, tolerance) && !isEdgeColor(color)) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        minX = x;
        break;
      }
    }

    // ตรวจสอบขอบขวา
    for (let x = maxX; x >= minX; x--) {
      hasContent = false;
      for (let y = minY; y <= maxY; y++) {
        const color = getPixelColor(imageData, x, y);
        if (colorsSimilar(color, targetColor, tolerance) && !isEdgeColor(color)) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        maxX = x;
        break;
      }
    }

    // ตรวจสอบขอบบน
    for (let y = minY; y <= maxY; y++) {
      hasContent = false;
      for (let x = minX; x <= maxX; x++) {
        const color = getPixelColor(imageData, x, y);
        if (colorsSimilar(color, targetColor, tolerance) && !isEdgeColor(color)) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        minY = y;
        break;
      }
    }

    // ตรวจสอบขอบล่าง
    for (let y = maxY; y >= minY; y--) {
      hasContent = false;
      for (let x = minX; x <= maxX; x++) {
        const color = getPixelColor(imageData, x, y);
        if (colorsSimilar(color, targetColor, tolerance) && !isEdgeColor(color)) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        maxY = y;
        break;
      }
    }

    return { minX, maxX, minY, maxY };
  };

  // ฟังก์ชัน flood fill จากจุดเฉพาะ (เชื่อมต่อกันเท่านั้น)
  const floodFillFromPoint = (imageData: ImageData, startX: number, startY: number, targetColor: PixelColor, tolerance = 25) => {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Set<string>();
    const stack = [{ x: startX, y: startY }];

    let minX = startX,
      maxX = startX;
    let minY = startY,
      maxY = startY;
    let pixelCount = 0;


    // ตัวอย่างสีที่จะ accept/reject เพื่อ debug
    const sampleColors: Array<{
      pos: string;
      color: string;
      similar: boolean;
      edge: boolean;
      accepted: boolean;
    }> = [];

    while (stack.length > 0 && pixelCount < 50000) {
      // จำกัดขนาดสูงสุดเพื่อป้องกัน zone ใหญ่เกินไป
      const item = stack.pop();
      if (!item) continue;
      const { x, y } = item;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const currentColor = getPixelColor(imageData, x, y);

      // เก็บตัวอย่างสีเพื่อ debug (เฉพาะ 10 ตัวแรก)
      if (sampleColors.length < 10) {
        const isSimilar = colorsSimilar(currentColor, targetColor, tolerance);
        const isEdge = isEdgeColor(currentColor);
        sampleColors.push({
          pos: `(${x},${y})`,
          color: `RGB(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
          similar: isSimilar,
          edge: isEdge,
          accepted: isSimilar && !isEdge
        });
      }

      // ตรวจสอบความใกล้เคียงของสี (ยืดหยุ่นขึ้น)
      if (!colorsSimilar(currentColor, targetColor, tolerance)) {
        continue;
      }

      // ตรวจสอบว่าเป็นขอบเขตหรือไม่ (ยืดหยุ่นมากขึ้นสำหรับพื้นที่เล็ก)
      if (isEdgeColor(currentColor)) {
        // อนุญาตสีที่ไม่เข้มมากผ่านได้ (เพิ่มความยืดหยุ่น)
        const avgColor = (currentColor.r + currentColor.g + currentColor.b) / 3;
        if (avgColor < 80) {
          // ลดเกณฑ์สีเข้มลงเพื่อให้พื้นที่เล็กผ่านได้ง่ายขึ้น
          continue;
        }
      }

      visited.add(key);
      pixelCount++;

      // อัพเดทขอบเขต
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // เพิ่มจุดข้างเคียง (4-connected สำหรับความแม่นยำ)
      const neighbors = [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];

      for (const neighbor of neighbors) {
        if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
          stack.push(neighbor);
        }
      }
    }

    // if (pixelCount >= 50000) {
    //   console.log("⚠️ หยุด flood fill เนื่องจากขนาดใหญ่เกินไป");
    // }

    // แสดง debug information
    // sampleColors.forEach(sample => {
    //   const status = sample.accepted ? "✅" : sample.similar ? "🚫(edge)" : "❌(different color)";
    //   console.log(`  ${status} ${sample.pos} ${sample.color}`);
    // });


    return {
      minX,
      maxX,
      minY,
      maxY,
      pixelCount,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  };

  // ฟังก์ชัน flood fill จากจุดเฉพาะ (ปรับปรุงให้ยืดหยุ่นกับสิ่งกีดขวาง)
  const floodFillFromPointAdvanced = (imageData: ImageData, startX: number, startY: number, targetColor: PixelColor, tolerance = 15) => {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Set<string>();
    const stack = [{ x: startX, y: startY }];
    const pixels: Array<{ x: number, y: number }> = [];

    let minX = startX,
      maxX = startX;
    let minY = startY,
      maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0 && pixelCount < 30000) {
      // จำกัดขนาดให้เหมาะสม
      const item = stack.pop();
      if (!item) continue;
      const { x, y } = item;
      const key = `${x},${y}`;

      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }

      const currentColor = getPixelColor(imageData, x, y);

      // ตรวจสอบความใกล้เคียงของสี (ยืดหยุ่นขึ้นเล็กน้อย)
      if (!colorsSimilar(currentColor, targetColor, tolerance + 2)) {
        continue;
      }

      // ข้ามสีขอบแต่ยังคงสแกนต่อ (ยืดหยุ่นกับสิ่งกีดขวาง)
      if (isEdgeColor(currentColor)) {
        // ลองสแกนจุดข้างเคียงต่อ แต่ไม่นับ pixel นี้
        const neighbors = [{ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];

        for (const neighbor of neighbors) {
          if (
            !visited.has(`${neighbor.x},${neighbor.y}`) &&
            neighbor.x >= 0 &&
            neighbor.x < width &&
            neighbor.y >= 0 &&
            neighbor.y < height
          ) {
            const neighborColor = getPixelColor(imageData, neighbor.x, neighbor.y);
            if (colorsSimilar(neighborColor, targetColor, tolerance) && !isEdgeColor(neighborColor)) {
              stack.push(neighbor);
            }
          }
        }
        visited.add(key);
        continue;
      }

      visited.add(key);
      pixelCount++;
      pixels.push({ x, y });

      // อัพเดทขอบเขต
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // เพิ่มจุดข้างเคียง (ลองทั้ง 4 และ 8 directions สำหรับการเชื่อมต่อที่ดีขึ้น)
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
        // เพิ่มมุมเฉียงสำหรับการตรวจจับที่ดีขึ้น
        { x: x + 1, y: y + 1 },
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 }
      ];

      for (const neighbor of neighbors) {
        if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
          stack.push(neighbor);
        }
      }
    }

    // if (pixelCount >= 30000) {
    //   console.log("⚠️ หยุด flood fill เนื่องจากขนาดใหญ่เกินไป");
    // }

    // console.log(`📈 Advanced flood fill เสร็จ: ${pixelCount} pixels, ขอบเขต: ${maxX - minX + 1}x${maxY - minY + 1}`);

    return {
      minX,
      maxX,
      minY,
      maxY,
      pixelCount,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixels
    };
  };

  // ฟังก์ชันหา rotated bounding box ที่ดีที่สุด (แบบง่าย)
  const findBestRotatedBox = (pixels: Array<{ x: number, y: number }>, imageData: ImageData, targetColor: PixelColor) => {
    if (!pixels || pixels.length < 10) return null;
    // ทดลองมุมหลักๆ
    const angles = [0, 15, 30, 45, 60, 75, 90];
    let bestScore = 0;
    let bestBox: any = null;

    for (const angle of angles) {
      const box = calculateSimpleRotatedBox(pixels, angle);
      if (box) {
        // คำนวณคะแนนจากการใช้พื้นที่
        const utilization = pixels.length / box.area;
        const aspectScore = Math.min(box.aspectRatio, 1 / box.aspectRatio);
        const score = utilization * aspectScore;

        if (score > bestScore && utilization > 0.3) {
          bestScore = score;
          bestBox = { ...box, score };
        }
      }
    }
    return bestBox;
  };

  // ฟังก์ชันคำนวณ rotated box แบบง่าย
  const calculateSimpleRotatedBox = (pixels: Array<{ x: number, y: number }>, angleDegrees: number) => {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // หาจุดศูนย์กลาง
    const centerX = pixels.reduce((sum: number, p: { x: number, y: number }) => sum + p.x, 0) / pixels.length;
    const centerY = pixels.reduce((sum: number, p: { x: number, y: number }) => sum + p.y, 0) / pixels.length;

    // หมุนจุดและหาขอบเขต
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const pixel of pixels) {
      const dx = pixel.x - centerX;
      const dy = pixel.y - centerY;

      const rotX = centerX + dx * cos - dy * sin;
      const rotY = centerY + dx * sin + dy * cos;

      minX = Math.min(minX, rotX);
      maxX = Math.max(maxX, rotX);
      minY = Math.min(minY, rotY);
      maxY = Math.max(maxY, rotY);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      angle: angleDegrees,
      width,
      height,
      area: width * height,
      aspectRatio: width / height,
      corners: [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY }, { x: minX, y: maxY }]
    };
  };

  // ฟังก์ชันเชื่อม region ที่อยู่ใกล้กันและเป็นสีเดียวกัน
  const connectNearbyRegions = (regions: ConnectedRegion[], maxDistance = 15): ConnectedRegion[] => {
    if (regions.length <= 1) return regions;

    const connected: ConnectedRegion[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < regions.length; i++) {
      if (processed.has(i)) continue;

      const group = [regions[i]];
      processed.add(i);

      // หา regions ที่อยู่ใกล้กัน
      for (let j = i + 1; j < regions.length; j++) {
        if (processed.has(j)) continue;

        const distance = Math.min(
          Math.abs(regions[i].minX + regions[i].width / 2 - (regions[j].minX + regions[j].width / 2)),
          Math.abs(regions[i].minY + regions[i].height / 2 - (regions[j].minY + regions[j].height / 2))
        );

        if (distance <= maxDistance) {
          group.push(regions[j]);
          processed.add(j);
        }
      }

      // รวม bounds ของ group
      if (group.length > 1) {
        const combinedBounds: CombinedBounds = {
          minX: Math.min(...group.map(r => r.minX)),
          maxX: Math.max(...group.map(r => r.maxX)),
          minY: Math.min(...group.map(r => r.minY)),
          maxY: Math.max(...group.map(r => r.maxY)),
          pixelCount: group.reduce((sum, r) => sum + r.pixelCount, 0),
          width: 0,
          height: 0
        };
        combinedBounds.width = combinedBounds.maxX - combinedBounds.minX + 1;
        combinedBounds.height = combinedBounds.maxY - combinedBounds.minY + 1;
        connected.push(combinedBounds as ConnectedRegion);
      } else {
        connected.push(group[0]);
      }
    }

    return connected;
  };

  // จัดการการคลิกที่ภาพ (สร้าง marker หรือ zone อัตโนมัติ)
  const handleImageClick = async (e: MouseEvent) => {
    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้วาง marker หรือ zone
    if (!access('sos_security', 'create')) {
      message.error('You do not have permission to create marker')
      return;
    }
    if (mapMode === 'preview') {
      return;
    }

    // ตรวจสอบว่ามี active marker อยู่หรือไม่
    if (clickedMarker || hasActiveMarker) {
      return;
    }

    // ตรวจสอบว่ามี pending marker อยู่หรือไม่
    const hasPendingMarker = markers.some(marker => marker.name === "");
    if (hasPendingMarker) {
      return;
    }

    // ถ้าเพิ่งจบการลาก หรือกำลังลาก (panning) ไม่สร้าง marker จำลอง
    if (isPanning || justFinishedPanning) {
      return;
    }
    // ถ้าเป็นการลากด้วย Shift เมื่อซูม > 100% ไม่สร้าง marker จำลอง
    if (zoomLevel > 1 && ((e as any).shiftKey || isShiftPressed)) {
      return;
    }

    // เรียก setStatusClickMap(true) เมื่อคลิกที่รูป (สำหรับฝั่ง Condo เท่านั้น)
    if (setStatusClickMap) {
      setStatusClickMap(true);
    }
    // สำหรับฝั่ง Village: ไม่แสดง form เมื่อคลิก (จะแสดงเฉพาะหลังสร้าง marker/zone เสร็จ)
    // ไม่ต้องทำอะไรเพิ่มเติม

    if (
      isDragging ||
      hasDragged ||
      isGroupSelecting ||
      isDraggingGroup ||
      isDraggingZoneGroup ||
      isDraggingMixed ||
      selectedMarkers.length > 0 ||
      selectedZones.length > 0 ||
      justFinishedGroupSelection
    ) {
      setHasDragged(false);
      setJustFinishedGroupSelection(false);
      return;
    }

    // ถ้ามี marker active อยู่ ให้ reset ตำแหน่งก่อนที่จะล้างการเลือก
    if (clickedMarker) {

      // ใช้ originalMarkerBeforeEdit เพื่อ reset กลับไปยังตำแหน่งก่อนเริ่มลาก
      if (originalMarkerBeforeEdit && originalMarkerBeforeEdit.id === clickedMarker.id) {

        // reset marker กลับไปยังตำแหน่งก่อนเริ่มลาก
        setMarkers(prevMarkers =>
          prevMarkers.map(m =>
            m.id === clickedMarker.id
              ? { ...m, x: originalMarkerBeforeEdit.x, y: originalMarkerBeforeEdit.y }
              : m
          )
        );
      }
    }

    // ล้างการเลือก object เดี่ยว
    setClickedMarker(null);
    setClickedZone(null);
    setHasActiveMarker(false);

    // Unlock markers ทั้งหมดเมื่อคลิกนอกพื้นที่
    unlockAllMarkers();

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพ
    const currentImageElement = imageRef.current;
    const currentContainerElement = containerRef.current;
    if (!currentImageElement || !currentContainerElement) return;

    const currentImageRect = currentImageElement.getBoundingClientRect();
    const currentContainerRect = currentContainerElement.getBoundingClientRect();

    // คำนวณ offset ของรูปภาพจาก container
    const imageOffsetX = currentImageRect.left - currentContainerRect.left;
    const imageOffsetY = currentImageRect.top - currentContainerRect.top;

    // คำนวณตำแหน่งเมาส์ที่ถูกต้องโดยคำนึงถึง zoom และ pan
    const mouseX = e.clientX - currentContainerRect.left;
    const mouseY = e.clientY - currentContainerRect.top;

    // แปลงเป็นตำแหน่งจริงบนรูปภาพก่อน transform (อิง matrix transform ของรูป)
    const baseX = (mouseX - panOffset.x) / zoomLevel;
    const baseY = (mouseY - panOffset.y) / zoomLevel;

    // คำนวณขนาดฐานและขนาดแสดงผลจริงของรูป พร้อม offset การจัดวาง (รองรับ object-fit: scale-down)
    const baseWidth_click = currentImageRect.width / zoomLevel;
    const baseHeight_click = currentImageRect.height / zoomLevel;

    const naturalWidth = currentImageElement.naturalWidth;
    const naturalHeight = currentImageElement.naturalHeight;

    const imageAspect_click = naturalWidth / naturalHeight;
    const containerAspect_click = baseWidth_click / baseHeight_click;

    let displayWidth_click: number, displayHeight_click: number, offsetX_click: number, offsetY_click: number;
    if (imageAspect_click > containerAspect_click) {
      // รูปกว้างกว่า container - จำกัดด้วยความกว้าง
      displayWidth_click = baseWidth_click;
      displayHeight_click = baseWidth_click / imageAspect_click;
      offsetX_click = 0;
      offsetY_click = (baseHeight_click - displayHeight_click) / 2;
    } else {
      // รูปสูงกว่า container - จำกัดด้วยความสูง
      displayWidth_click = baseHeight_click * imageAspect_click;
      displayHeight_click = baseHeight_click;
      offsetX_click = (baseWidth_click - displayWidth_click) / 2;
      offsetY_click = 0;
    }

    // จำกัดพิกัดให้อยู่ในพื้นที่รูปที่แสดงจริง โดยหัก offset ของการจัดวางก่อน
    const withinX = Math.max(0, Math.min(baseX - offsetX_click, displayWidth_click));
    const withinY = Math.max(0, Math.min(baseY - offsetY_click, displayHeight_click));

    // แปลงเป็นเปอร์เซ็นต์ตามพื้นที่รูปที่แสดงจริง
    const relativeX_click = (withinX / displayWidth_click) * 100;
    const relativeY_click = (withinY / displayHeight_click) * 100;

    // ถ้ากด Ctrl+Click ให้ลองตรวจจับขอบเขตพื้นที่อัตโนมัติ
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault(); // ป้องกัน default behavior
      try {
        const bounds = await detectAreaBounds(withinX, withinY);
        // ไม่มีขีดจำกัดขนาดขั้นต่ำ - สร้าง zone ได้ทุกขนาด
        const isValidSize = bounds && bounds.width > 0 && bounds.height > 0;
        if (isValidSize) {
          // สร้าง zone อัตโนมัติ
          setCurrentSelection({
            startX: bounds.x,
            startY: bounds.y,
            endX: bounds.x + bounds.width,
            endY: bounds.y + bounds.height
          });

          // สร้างชื่อ Zone สำหรับการตรวจจับแบบครบถ้วน
          const generateZoneName = (areaType: string, bounds: AreaBounds) => {
            const zoneNumber = zones.length + 1;
            const aspectRatio = bounds.width / bounds.height;
            const area = bounds.width * bounds.height;

            if (areaType === "complete" || areaType === "connected") {
              // Name the zone based on the characteristics of the connected area (supports very small areas)
              if (aspectRatio > 3) {
                return `Horizontal Strip ${zoneNumber}`;
              } else if (aspectRatio < 0.33) {
                return `Vertical Strip ${zoneNumber}`;
              } else if (area > 8000) {
                return `Large Block ${zoneNumber}`;
              } else if (area > 2000) {
                return `Medium Block ${zoneNumber}`;
              } else if (area > 200) {
                return `Small Block ${zoneNumber}`;
              } else {
                return `Tiny Cell ${zoneNumber}`; // For very small areas
              }
            }

            // สำหรับ areaType อื่นๆ (fallback)
            if (aspectRatio > 3) {
              return `Horizontal Area ${zoneNumber}`;
            } else if (aspectRatio < 0.33) {
              return `Vertical Area ${zoneNumber}`;
            } else {
              return `Area ${zoneNumber}`;
            }

            // Fallback สำหรับ areaType อื่นๆ
            switch (areaType) {
              case "corridor":
                if (aspectRatio > 2) {
                  return `Horizontal Corridor ${zoneNumber}`;
                } else if (aspectRatio < 0.5) {
                  return `Vertical Corridor ${zoneNumber}`;
                } else {
                  return `Corridor ${zoneNumber}`;
                }
              case "room":
                if (bounds.width > 80 && bounds.height > 80) {
                  return `Block ${zoneNumber}`;
                } else {
                  return `Room ${zoneNumber}`;
                }
              default:
                return `Same Color Area ${zoneNumber}`;
            }
          };

          // ใช้ข้อมูลประเภทพื้นที่จาก bounds
          const detectedAreaType = bounds.areaType || "complete"; 
          const zoneName = generateZoneName(detectedAreaType, bounds);
          const pixelInfo = bounds.pixelCount ? ` (${bounds.pixelCount.toLocaleString()} pixels)` : "";


          // เลือกสีตามลักษณะของพื้นที่ (รองรับพื้นที่เล็กมาก)
          let zoneColor = "blue"; // สีเริ่มต้น
          const aspectRatio = bounds.width / bounds.height;
          const area = bounds.width * bounds.height;

          if (aspectRatio > 3 || aspectRatio < 0.33) {
            zoneColor = "cyan"; // สำหรับแถบยาว
          } else if (area > 5000) {
            zoneColor = "emerald"; // สำหรับพื้นที่ใหญ่
          } else if (area < 200) {
            zoneColor = "yellow"; // สำหรับช่องเล็กมากๆ
          } else {
            zoneColor = "blue"; // สำหรับพื้นที่ปกติ
          }

          setZoneFormData({
            name: zoneName,
            color: zoneColor
          });
          setShowZoneModal(true);
          return;
        }
      } catch (error) {
        console.log("❌ Auto-detection failed:", error);
      }
    }

    // ตรวจสอบว่าจุดที่คลิกอยู่ในกลุ่มใดหรือไม่
    const clickedZone = zones.find(zone => !zone.isDefault && isPointInZone(withinX, withinY, zone));

    // คำนวณตำแหน่งให้สอดคล้องกับ renderMarker
    const imageNaturalWidth = currentImageElement.naturalWidth;
    const imageNaturalHeight = currentImageElement.naturalHeight;
    
    // ใช้ขนาดก่อน transform เพื่อให้ตำแหน่ง marker ตรงกับ overlay ที่ถูก transform เท่ากัน
    const baseWidth = currentImageRect.width / zoomLevel;
    const baseHeight = currentImageRect.height / zoomLevel;
    
    // คำนวณขนาดที่รูปจะแสดงจริง (รองรับ object-scale-down) บน space ก่อน transform
    let displayWidth, displayHeight, offsetX, offsetY;
    
    const imageAspect = imageNaturalWidth / imageNaturalHeight;
    const containerAspect = baseWidth / baseHeight;
    
    if (imageAspect > containerAspect) {
      // รูปกว้างกว่า container - จำกัดด้วยความกว้าง
      displayWidth = baseWidth;
      displayHeight = baseWidth / imageAspect;
      offsetX = 0;
      offsetY = (baseHeight - displayHeight) / 2;
    } else {
      // รูปสูงกว่า container - จำกัดด้วยความสูง
      displayWidth = baseHeight * imageAspect;
      displayHeight = baseHeight;
      offsetX = (baseWidth - displayWidth) / 2;
      offsetY = 0;
    }
    
    // คำนวณตำแหน่งที่แท้จริงบนรูปภาพ (หักลบ offset)
    const imageX = withinX - offsetX;
    const imageY = withinY - offsetY;
    
    // ตรวจสอบว่าคลิกภายในรูปภาพจริงหรือไม่
    if (imageX < 0 || imageX > displayWidth || imageY < 0 || imageY > displayHeight) {
      return;
    }

    // คำนวณ relative coordinates บนรูปภาพ
    const relativeX = (imageX / displayWidth) * 100;
    const relativeY = (imageY / displayHeight) * 100;

    // สร้าง pending marker ทันทีเมื่อคลิก
    // หากกำลังกด Shift และซูม > 100% (โหมดลาก) ให้ยกเลิกการสร้าง marker จำลอง
    if (isPanning || (zoomLevel > 1 && isShiftPressed)) {
      return;
    }
    const tempMarker: Marker = {
      id: Date.now(),
      x: relativeX_click,
      y: relativeY_click,
      originalX: relativeX_click,
      originalY: relativeY_click,
      name: "",
      group: clickedZone ? clickedZone.name : "Marker",
      color: "green",
      status: "normal",
      address: "",
      tel1: "",
      tel2: "",
      tel3: "",
      isLocked: true // ตั้งค่าเริ่มต้นให้ marker ถูกล็อค
    };

    // เพิ่ม pending marker เข้าไปในรายการ marker แต่ยังไม่บันทึกประวัติ
    setPendingMarker(tempMarker);
    setMarkers(prevMarkers => [...prevMarkers, tempMarker]);

    // ไม่แสดง modal form แต่ส่งข้อมูลไปยัง form ด้านขวาแทน
    setCurrentPosition({ x: withinX, y: withinY });

    // คำนวณ lat/lng จากตำแหน่งที่คลิก และส่งไปยัง parent
    const { lat, lng } = convertToLatLng(withinX, withinY);
    if (onLatLngChange) {
      onLatLngChange(parseFloat(lat), parseFloat(lng));
    }

    // เลือก marker ที่สร้างใหม่และส่งข้อมูลไปยัง parent component
    if (onMarkerSelect) {
      onMarkerSelect(tempMarker, true); // ส่ง isNewMarker: true สำหรับ marker ใหม่
    }

    // ส่ง signal ว่าสร้าง marker ใหม่แล้ว เพื่อให้ focus ที่ input Name
    if (onNewMarkerCreated) {
      onNewMarkerCreated();
    }

    setFormData({
      name: "",
      group: clickedZone ? clickedZone.name : "Marker",
      color: "green",
      address: "",
      tel1: "",
      tel2: "",
      tel3: ""
    });
  };

  // เพิ่มฟังก์ชันสำหรับเพิ่มประวัติการกระทำ
  const addToHistory = (actionType: string, data: any) => {
    const newAction = {
      type: actionType,
      data: data,
      timestamp: Date.now()
    };

    // ตัดประวัติที่อยู่หลังตำแหน่งปัจจุบันออก
    const newHistory = history.slice(0, currentIndex + 1);

    setHistory([...newHistory, newAction]);
    setCurrentIndex(currentIndex + 1);
  };

  // เพิ่มฟังก์ชัน undo
  const undo = () => {
    if (currentIndex >= 0) {
      const action = history[currentIndex];

      switch (action.type) {
        case ACTION_TYPES.ADD_MARKER:
          setMarkers(prevMarkers => prevMarkers.filter(m => m.id !== action.data.id));
          break;
        case ACTION_TYPES.REMOVE_MARKER:
          setMarkers(prevMarkers => [...prevMarkers, action.data]);
          break;
        case ACTION_TYPES.MOVE_MARKER:
          setMarkers(prevMarkers =>
            prevMarkers.map(m => (m.id === action.data.id ? { ...m, x: action.data.previousX, y: action.data.previousY } : m))
          );
          break;
        case ACTION_TYPES.RESET_MARKER:
          setMarkers(prevMarkers =>
            prevMarkers.map(m => (m.id === action.data.id ? { ...m, x: action.data.x, y: action.data.y } : m))
          );
          break;
        case ACTION_TYPES.ADD_ZONE:
          setZones(prevZones => prevZones.filter(z => z.id !== action.data.id));
          // ลบ zone ออกจาก visibleZones ด้วย
          setVisibleZones(prevVisible => {
            const newVisible = { ...prevVisible };
            delete newVisible[action.data.id];
            return newVisible;
          });
          break;
        case ACTION_TYPES.REMOVE_ZONE:
          setZones(prevZones => [...prevZones, action.data]);
          // เพิ่ม zone กลับเข้า visibleZones ด้วย
          setVisibleZones(prevVisible => ({ ...prevVisible, [action.data.id]: true }));
          break;
        case ACTION_TYPES.EDIT_ZONE:
          setZones(prevZones => prevZones.map(z => (z.id === action.data.id ? { ...z, ...action.data.previous } : z)));
          break;
        case ACTION_TYPES.EDIT_MARKER:
          setMarkers(prevMarkers => prevMarkers.map(m => (m.id === action.data.id ? { ...m, ...action.data.previous } : m)));
          break;
        case ACTION_TYPES.MOVE_GROUP:
          setMarkers(prevMarkers =>
            prevMarkers.map(marker => {
              const originalMarker = action.data.markers.find((m: any) => m.id === marker.id);
              if (originalMarker) {
                return {
                  ...marker,
                  x: originalMarker.originalX,
                  y: originalMarker.originalY
                };
              }
              return marker;
            })
          );
          break;
        case ACTION_TYPES.MOVE_ZONE_GROUP:
          setZones(prevZones =>
            prevZones.map(zone => {
              const originalZone = action.data.zones.find((z: any) => z.id === zone.id);
              if (originalZone) {
                return {
                  ...zone,
                  x: originalZone.originalX,
                  y: originalZone.originalY
                };
              }
              return zone;
            })
          );
          break;
        case ACTION_TYPES.MOVE_MIXED_GROUP:
          // undo สำหรับ markers
          if (action.data.markers) {
            setMarkers(prevMarkers =>
              prevMarkers.map(marker => {
                const originalMarker = action.data.markers.find((m: any) => m.id === marker.id);
                if (originalMarker) {
                  return {
                    ...marker,
                    x: originalMarker.originalX,
                    y: originalMarker.originalY
                  };
                }
                return marker;
              })
            );
          }
          // undo สำหรับ zones
          if (action.data.zones) {
            setZones(prevZones =>
              prevZones.map(zone => {
                const originalZone = action.data.zones.find((z: any) => z.id === zone.id);
                if (originalZone) {
                  return {
                    ...zone,
                    x: originalZone.originalX,
                    y: originalZone.originalY
                  };
                }
                return zone;
              })
            );
          }
          break;
      }

      setCurrentIndex(currentIndex - 1);
    }
  };

  // เพิ่มฟังก์ชัน redo
  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      const action = history[nextIndex];

      switch (action.type) {
        case ACTION_TYPES.ADD_MARKER:
          setMarkers(prevMarkers => [...prevMarkers, action.data]);
          break;
        case ACTION_TYPES.REMOVE_MARKER:
          setMarkers(prevMarkers => prevMarkers.filter(m => m.id !== action.data.id));
          break;
        case ACTION_TYPES.MOVE_MARKER:
          setMarkers(prevMarkers =>
            prevMarkers.map(m => (m.id === action.data.id ? { ...m, x: action.data.x, y: action.data.y } : m))
          );
          break;
        case ACTION_TYPES.RESET_MARKER:
          setMarkers(prevMarkers =>
            prevMarkers.map(m => (m.id === action.data.id ? { ...m, x: action.data.originalX, y: action.data.originalY } : m))
          );
          break;
        case ACTION_TYPES.ADD_ZONE:
          setZones(prevZones => [...prevZones, action.data]);
          // เพิ่ม zone กลับเข้า visibleZones ด้วย
          setVisibleZones(prevVisible => ({ ...prevVisible, [action.data.id]: true }));
          break;
        case ACTION_TYPES.REMOVE_ZONE:
          setZones(prevZones => prevZones.filter(z => z.id !== action.data.id));
          // ลบ zone ออกจาก visibleZones ด้วย
          setVisibleZones(prevVisible => {
            const newVisible = { ...prevVisible };
            delete newVisible[action.data.id];
            return newVisible;
          });
          break;
        case ACTION_TYPES.EDIT_ZONE:
          setZones(prevZones => prevZones.map(z => (z.id === action.data.id ? { ...z, ...action.data.current } : z)));
          break;
        case ACTION_TYPES.EDIT_MARKER:
          setMarkers(prevMarkers => prevMarkers.map(m => (m.id === action.data.id ? { ...m, ...action.data.current } : m)));
          break;
        case ACTION_TYPES.MOVE_GROUP:
          setMarkers(prevMarkers =>
            prevMarkers.map(marker => {
              const movedMarker = action.data.markers.find((m: any) => m.id === marker.id);
              if (movedMarker) {
                return {
                  ...marker,
                  x: movedMarker.currentX,
                  y: movedMarker.currentY
                };
              }
              return marker;
            })
          );
          break;
        case ACTION_TYPES.MOVE_ZONE_GROUP:
          setZones(prevZones =>
            prevZones.map(zone => {
              const movedZone = action.data.zones.find((z: any) => z.id === zone.id);
              if (movedZone) {
                return {
                  ...zone,
                  x: movedZone.currentX,
                  y: movedZone.currentY
                };
              }
              return zone;
            })
          );
          break;
        case ACTION_TYPES.MOVE_MIXED_GROUP:
          // redo สำหรับ markers
          if (action.data.markers) {
            setMarkers(prevMarkers =>
              prevMarkers.map(marker => {
                const movedMarker = action.data.markers.find((m: any) => m.id === marker.id);
                if (movedMarker) {
                  return {
                    ...marker,
                    x: movedMarker.currentX,
                    y: movedMarker.currentY
                  };
                }
                return marker;
              })
            );
          }
          // redo สำหรับ zones
          if (action.data.zones) {
            setZones(prevZones =>
              prevZones.map(zone => {
                const movedZone = action.data.zones.find((z: any) => z.id === zone.id);
                if (movedZone) {
                  return {
                    ...zone,
                    x: movedZone.currentX,
                    y: movedZone.currentY
                  };
                }
                return zone;
              })
            );
          }
          break;
      }

      setCurrentIndex(nextIndex);
    }
  };

  // เพิ่ม useEffect สำหรับจัดการ wheel event บน container
  useEffect(
    () => {
      const container = containerRef.current;
      if (container) {
        // เพิ่ม passive: false เพื่อให้สามารถ preventDefault ได้
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
          container.removeEventListener("wheel", handleWheel);
        };
      }
    },
    [zoomLevel, panOffset]
  );

  // เพิ่ม event listener สำหรับ keyboard shortcuts
  useEffect(
    () => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
          e.preventDefault();
          redo();
        }
        if (e.key === "Escape") {
          // ถ้ามี pending marker และ popup เปิดอยู่ ให้ยกเลิกการสร้าง marker
          if (pendingMarker && showPopup) {
            e.preventDefault();
            closePopup();
          } else {
            clearSelection();
          }
        }
        // เพิ่ม shortcut สำหรับรีเซ็ต zoom
        if ((e.ctrlKey || e.metaKey) && e.key === "0") {
          e.preventDefault();
          onImageClick ? resetZoomAndPan() : resetZoomAndPanVillage();
        }
        // เพิ่ม shortcut สำหรับ zoom in (Ctrl + Plus หรือ Ctrl + =)
        if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
          e.preventDefault();
          zoomIn();
        }
        // เพิ่ม shortcut สำหรับ zoom out (Ctrl + Minus)
        if ((e.ctrlKey || e.metaKey) && e.key === "-") {
          e.preventDefault();
          zoomOut();
        }
        // เพิ่ม shortcut สำหรับ copy zones/markers
        if ((e.ctrlKey || e.metaKey) && e.key === "c" && (selectedZones.length > 0 || selectedMarkers.length > 0)) {
          e.preventDefault();
          if (selectedZones.length > 0) {
            copySelectedZones();
          }
          if (selectedMarkers.length > 0) {
            copySelectedMarkers();
          }
        }



        // เพิ่ม shortcut สำหรับ paste zones/markers
        if ((e.ctrlKey || e.metaKey) && e.key === "v" && (copiedZones.length > 0 || copiedMarkers.length > 0)) {
          e.preventDefault();
          if (copiedZones.length > 0) {
            pasteZones();
          }
          if (copiedMarkers.length > 0) {
            pasteMarkers();
          }
        }
        // เพิ่ม shortcut สำหรับลบ objects ที่เลือก
        if (e.key === "Delete" && (selectedMarkers.length > 0 || selectedZones.length > 0 || clickedMarker || clickedZone)) {
          if (!access('sos_security', 'delete')) {
            message.error('You do not have permission to delete')
            return
          }
          e.preventDefault();
          deleteSelectedObjects();
        }
        // ติดตาม ctrl key
        if (e.ctrlKey || e.metaKey) {
          setIsCtrlPressed(true);
        }
        // ติดตาม shift key
        if (e.shiftKey) {
          setIsShiftPressed(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (!e.ctrlKey && !e.metaKey) {
          setIsCtrlPressed(false);
        }
        if (!e.shiftKey) {
          setIsShiftPressed(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    },
    [currentIndex, history, selectedZones, selectedMarkers, copiedZones, copiedMarkers, clickedMarker, clickedZone, pendingMarker, showPopup, zoomLevel]
  );

  // เพิ่ม effect สำหรับ click outside image
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        setStatusClickMap
      ) {
        setStatusClickMap(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setStatusClickMap]);

  // อัพเดทฟังก์ชันที่เกี่ยวข้องกับการเปลี่ยนแปลง state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && pendingMarker) {
      // อัพเดท pending marker ด้วยข้อมูลจากฟอร์ม
      const confirmedMarker = {
        ...pendingMarker,
        name: formData.name,
        group: formData.group,
        color: formData.color,
        address: formData.address || "",
        tel1: formData.tel1 || "",
        tel2: formData.tel2 || "",
        tel3: formData.tel3 || ""
      };

      // อัพเดท marker ใน state และบันทึกประวัติ
      setMarkers(prevMarkers =>
        prevMarkers.map(m => m.id === pendingMarker.id ? confirmedMarker : m)
      );
      addToHistory(ACTION_TYPES.ADD_MARKER, confirmedMarker);

      // ล้าง pending marker
      setPendingMarker(null);
      setShowPopup(false);
      setFormData({ name: "", group: "", color: "red", address: "", tel1: "", tel2: "", tel3: "" });

      // แจ้งเตือนเมื่อสร้าง marker เสร็จ
      if (onItemCreated) {
        onItemCreated('marker', confirmedMarker);
      }

      // ส่งข้อมูล marker ที่สร้างใหม่ไปยัง parent component และอัพเดทตำแหน่ง
      if (onMarkerSelect) {
        onMarkerSelect(confirmedMarker);
      }

      // อัพเดทตำแหน่ง Lat/Lng เมื่อสร้าง marker ใหม่
      // แปลงจาก relative coordinates กลับเป็น absolute coordinates สำหรับ updateLatLngDisplay
      const imageElement = imageRef.current;
      const containerElement = containerRef.current;

      if (imageElement && containerElement) {
        const imageRect = imageElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        // คำนวณตำแหน่งสัมพัทธ์บนรูปภาพ (ไม่รวม offset)
        const absoluteX = (confirmedMarker.x / 100) * imageRect.width;
        const absoluteY = (confirmedMarker.y / 100) * imageRect.height;

        updateLatLngDisplay(absoluteX, absoluteY, confirmedMarker);
      }

      // สำหรับฝั่ง Village: แสดง FormVillageLocation หลังสร้าง marker เสร็จ
      if (setShowWarningVillage && showWarningVillage !== undefined && !setStatusClickMap) {
        const createdItem = { type: 'marker' as const, data: confirmedMarker };
        setLastCreatedItem(createdItem);
        if (onLastCreatedItemChange) {
          onLastCreatedItemChange(createdItem);
        }
        // เรียก callback เพื่อแสดง FormVillageLocation
        if (typeof setShowWarningVillage === 'function') {
          if (setShowWarningVillage.length === 0) {
            // ฝั่ง Village: เรียกแบบไม่มี parameter
            (setShowWarningVillage as () => void)();
          } else {
            // ฝั่ง Condo: เรียกแบบมี parameter
            (setShowWarningVillage as (showWarningVillage: boolean) => void)(true);
          }
        }
      }
    }
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้สร้าง zone
    if (mapMode === 'preview') {
      return;
    }

    if (zoneFormData.name && currentSelection) {
      // สร้าง zone ตามทิศทางการลาก โดยไม่ normalize
      const x = currentSelection.startX;
      const y = currentSelection.startY;
      const width = currentSelection.endX - currentSelection.startX;
      const height = currentSelection.endY - currentSelection.startY;

      // แปลงจาก pixel เป็น percentage coordinates ให้สอดคล้องกับ CSS matrix transform
      const imageElement = imageRef.current;
      if (!imageElement) return;

      const imageRect = imageElement.getBoundingClientRect();

      // ขนาดฐานของรูปภาพ (หลังหาร zoom) สำหรับการคำนวณ percentage
      const baseWidth = imageRect.width / zoomLevel;
      const baseHeight = imageRect.height / zoomLevel;

      // แปลงจาก pixel coordinates เป็น percentage ของรูปภาพ (สอดคล้องกับ matrix transform)
      const relativeX = (x / baseWidth) * 100;
      const relativeY = (y / baseHeight) * 100;
      const relativeWidth = (width / baseWidth) * 100;
      const relativeHeight = (height / baseHeight) * 100;

      const newZone = {
        id: Date.now(),
        name: zoneFormData.name,
        color: zoneFormData.color,
        shape: selectedZoneShape,
        x: relativeX,
        y: relativeY,
        width: relativeWidth,
        height: relativeHeight,
        rotation: 0,
        // บันทึกตำแหน่งเดิมสำหรับการรีเซ็ต
        originalX: relativeX,
        originalY: relativeY,
        originalWidth: relativeWidth,
        originalHeight: relativeHeight,
        originalRotation: 0
      };

      setZones([...zones, newZone]);
      addToHistory(ACTION_TYPES.ADD_ZONE, newZone);
      setShowZoneModal(false);
      setZoneFormData({ name: "", color: "blue" });
      // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
      setVisibleZones({ ...visibleZones, [newZone.id]: true });

      // แจ้งเตือนเมื่อสร้าง zone เสร็จ
      if (onItemCreated) {
        onItemCreated('zone', newZone);
      }

      // เรียก callback เมื่อสร้าง zone สำเร็จ
      if (onZoneCreated) {
        onZoneCreated();
      }

      // อัพเดทกลุ่มของ markers หลังจากสร้าง zone ใหม่
      setTimeout(() => {
        updateMarkersGroup();
      }, 50);
    }
  };

  const removeMarker = async (markerId: number) => {
    const markerToRemove = markers.find(m => m.id === markerId);
    if (markerToRemove) {
      const title = "Confirm Delete Marker";
      const unitName = markerToRemove.name ? `"${markerToRemove.name}"` : '';
      const message = `Are you sure you want to delete the Marker ${unitName}`;
      showDeleteConfirmation(title, message, async () => {
        // ลบ marker จาก state ซึ่งจะ trigger useEffect ที่ track alert markers
        setMarkers(prevMarkers => {
          const filteredMarkers = prevMarkers.filter(marker => marker.id !== markerId);
          return filteredMarkers;
        });

        addToHistory(ACTION_TYPES.REMOVE_MARKER, markerToRemove);
        if(!unitName) {
          window.dispatchEvent(new Event('sos:village-form-cancel'));

          // รีเซ็ตสถานะปุ่ม/การเลือก ให้กลับเหมือนตอน lock marker (รองรับกรณี marker จำลอง)
          setClickedMarker(null);
          setSelectedMarkers([]);
          setHasActiveMarker(false);
          if (onActiveMarkerChange) {
            onActiveMarkerChange(false);
          }
          // ล็อกมาร์กเกอร์ทั้งหมดเหมือนสถานะเริ่มต้นของโหมด work-it
          setMarkers(prev => prev.map(m => ({ ...m, isLocked: true })));

          return
        } 
        // เรียก callback เมื่อลบ marker สำเร็จ
        if (onMarkerDeleted) {
          let dataDelete = await deleteMarker(markerId)
          // แสดง confirm dialog
          if (dataDelete.status) {
            SuccessModal("Delete data success", 900)
            window.dispatchEvent(new Event('sos:village-form-cancel'));
            onMarkerDeleted(markerToRemove);
            if (dataDelete.result) {
              // อัพเดท marker
              if (dataDelete.result.marker && Array.isArray(dataDelete.result.marker)) {
                setDataMapAll((prev: any) => ({
                  ...prev,
                  marker: dataDelete.result.marker
                }));
              }
              // อัพเดท emergency
              if (dataDelete.result.emergency) {
                setDataEmergency((prev: any) => ({
                  ...prev,
                  emergency: dataDelete.result.emergency,
                  deviceWarning: dataDelete.result.deviceWarning || []
                }));
              }
            }

            // รีเซ็ตสถานะปุ่ม/การเลือก ให้กลับเหมือนตอน lock marker
            setClickedMarker(null);
            setSelectedMarkers([]);
            setHasActiveMarker(false);
            if (onActiveMarkerChange) {
              onActiveMarkerChange(false);
            }
            // ล็อกมาร์กเกอร์ทั้งหมดเหมือนสถานะเริ่มต้นของโหมด work-it
            setMarkers(prev => prev.map(m => ({ ...m, isLocked: true })));
          }
          else {
            FailedModal("Delete data failed", 900)
          }
        }
      });
    }
  };

  const removeZone = (zoneId: number) => {
    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้ลบ zone
    if (mapMode === 'preview') {
      return;
    }

    const zoneToRemove = zones.find(z => z.id === zoneId);
    if (zoneToRemove) {
      const title = "Confirm Deletion of Zone";
      const message = `Are you sure you want to delete Zone "${zoneToRemove.name}"?\n\nThis action cannot be undone.`;

      showDeleteConfirmation(title, message, () => {
        setZones(zones.filter(zone => zone.id !== zoneId));
        addToHistory(ACTION_TYPES.REMOVE_ZONE, zoneToRemove);
      });
    }
  };

  // เพิ่มฟังก์ชันปิด popup กลับมา
  const closePopup = () => {
    // ถ้ามี pending marker ให้ลบออกจาก markers
    if (pendingMarker) {
      setMarkers(prevMarkers =>
        prevMarkers.filter(m => m.id !== pendingMarker.id)
      );
      setPendingMarker(null);
    }

    setShowPopup(false);
    setFormData({ name: "", group: "", color: "red", address: "", tel1: "", tel2: "", tel3: "" });
    setHasActiveMarker(false);
    // ล้างข้อมูล lastCreatedItem เมื่อปิด popup
    setLastCreatedItem(null);
    if (onLastCreatedItemChange) {
      onLastCreatedItemChange(null);
    }
  };

  // เพิ่มฟังก์ชันปิด zone modal กลับมา
  const closeZoneModal = () => {
    setShowZoneModal(false);
    setZoneFormData({ name: "", color: "blue" });
    setHasActiveMarker(false);
    // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
    // ล้างข้อมูล lastCreatedItem เมื่อปิด zone modal
    setLastCreatedItem(null);
    if (onLastCreatedItemChange) {
      onLastCreatedItemChange(null);
    }
  };

  // reset marker กลับตำแหน่งเดิม หรือลบ pending marker
  const resetMarkerPosition = (markerId: number) => {
    const targetMarker = markers.find(m => m.id === markerId);
    if (!targetMarker) return;

    // ใช้ค่า originalX, originalY ที่เป็นตำแหน่งล่าสุดที่ update แล้ว
    const resetX = targetMarker.originalX || targetMarker.x;
    const resetY = targetMarker.originalY || targetMarker.y;

    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === markerId) {
          return {
            ...marker,
            x: resetX,
            y: resetY
          };
        }
        return marker;
      })
    );

    // อัพเดท marker ที่ถูกเลือกด้วย
    if (onMarkerSelect) {
      const resetMarker = {
        ...targetMarker,
        x: resetX,
        y: resetY
      };
      onMarkerSelect(resetMarker);
    }

    // เคลียร์ประวัติการแก้ไข marker นี้
    addToHistory(ACTION_TYPES.RESET_MARKER, {
      id: markerId,
      position: { x: resetX, y: resetY }
    });
  };

  // เพิ่มฟังก์ชันรีเซ็ตตำแหน่ง zone
  const resetZonePosition = (zoneId: number) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone && zone.originalX !== undefined && zone.originalY !== undefined) {
      // บันทึกประวัติการเปลี่ยนแปลง
      addToHistory(ACTION_TYPES.EDIT_ZONE, {
        id: zoneId,
        previous: {
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          rotation: zone.rotation || 0
        },
        current: {
          x: zone.originalX,
          y: zone.originalY,
          width: zone.originalWidth || zone.width,
          height: zone.originalHeight || zone.height,
          rotation: zone.originalRotation || 0
        }
      });

      setZones(prevZones =>
        prevZones.map(z =>
          z.id === zoneId
            ? {
              ...z,
              x: z.originalX || z.x,
              y: z.originalY || z.y,
              width: z.originalWidth || z.width,
              height: z.originalHeight || z.height,
              rotation: z.originalRotation || 0
            }
            : z
        )
      );
    }
  };

  // จัดการการ mouse down ที่ marker
  const handleMarkerMouseDown = (e: React.MouseEvent, marker: Marker) => {
    // ถ้าเป็น double click ไม่ต้องเริ่มการลาก
    if (e.detail === 2) {
      return;
    }

    // ถ้า marker ถูกล็อคอยู่ ไม่ให้เคลื่อนย้าย
    if (marker.isLocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้ลาก marker
    if (mapMode === 'preview') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // ตั้งค่า active marker (เฉพาะในโหมด work-it)
    if (mapMode === 'work-it') {
      setHasActiveMarker(true);
    }
    setClickedMarker(marker);

    // ตรวจสอบว่า marker นี้อยู่ในกลุ่มที่เลือกหรือไม่
    if (selectedMarkers.includes(marker.id) && selectedMarkers.length > 0) {
      // ถ้าอยู่ในกลุ่มที่เลือก ให้ใช้การลากกลุ่มแทน
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // แปลงเป็นตำแหน่งจริงบนรูปภาพ
      const x = (mouseX - panOffset.x) / zoomLevel;
      const y = (mouseY - panOffset.y) / zoomLevel;

      // แปลง mouse coordinates เป็น percentage สำหรับการลาก group
      const imageElement = imageRef.current;
      if (!imageElement) return;
      const imageRect = imageElement.getBoundingClientRect();
      const imageOffsetX = imageRect.left - containerRect.left;
      const imageOffsetY = imageRect.top - containerRect.top;

      const mouseXPercent = ((mouseX - imageOffsetX) / imageRect.width) * 100;
      const mouseYPercent = ((mouseY - imageOffsetY) / imageRect.height) * 100;

      // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลากแบบผสม
      if (selectedZones.length > 0) {
        // บันทึก original positions สำหรับทั้ง markers และ zones - ไม่ต้องอัพเดท originalX/Y
        setMarkers(prevMarkers =>
          prevMarkers.map(m => {
            if (selectedMarkers.includes(m.id)) {
              return m;
            }
            return m;
          })
        );

        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              return { ...zone, originalX: zone.x, originalY: zone.y };
            }
            return zone;
          })
        );

        setIsDraggingMixed(true);

        // เก็บ reference point และ offset (ใช้ percentage coordinates)
        const referencePoint: DragReference = { x: marker.x, y: marker.y, type: "marker" as const, id: marker.id };
        setDragReference(referencePoint);
        setGroupDragOffset({
          x: mouseXPercent - marker.x,
          y: mouseYPercent - marker.y
        });
        return;
      }

      // ถ้าเลือกเฉพาะ markers - ไม่ต้องอัพเดท originalX/Y เพราะจะทำให้ค่าเดิมหายไป
      setMarkers(prevMarkers =>
        prevMarkers.map(m => {
          if (selectedMarkers.includes(m.id)) {
            return m;
          }
          return m;
        })
      );

      setIsDraggingGroup(true);
      setGroupDragOffset({
        x: mouseXPercent - marker.x,
        y: mouseYPercent - marker.y
      });
      return;
    }

    // บันทึกข้อมูลเดิมของ marker ก่อนเริ่มลาก (สำหรับ cancel)
    if (!originalMarkerBeforeEdit || originalMarkerBeforeEdit.id !== marker.id) {
      setOriginalMarkerBeforeEdit({ ...marker });
    }

    // บันทึกตำแหน่งเดิมสำหรับ originalMarkerPosition
    setOriginalMarkerPosition({ x: marker.x, y: marker.y });

    // เริ่มการลาก marker ทันที
    setDraggedMarker(marker);
    setIsDragging(true);

    // บันทึกตำแหน่งเดิมถ้ายังไม่ได้บันทึก
    setMarkers(prevMarkers =>
      prevMarkers.map(m => (m.id === marker.id ? { ...m, originalX: m.originalX || m.x, originalY: m.originalY || m.y } : m))
    );

    // เริ่มการติดตามตำแหน่ง
    updateLatLngDisplay(marker.x, marker.y, marker);
  };

  // Utility: อัปเดตการลาก marker จากตำแหน่งเมาส์แบบ client (ใช้กับ window-level listeners)
  const updateMarkerDragByClient = (clientX: number, clientY: number) => {
    if (!draggedMarker || !isDragging) {
      return;
    }

    if (setStatusClickMap) {
      setStatusClickMap(true);
    }

    const imageElement = imageRef.current;
    const containerElement = containerRef.current;

    if (!imageElement || !containerElement) return;

    // คำนวณตำแหน่งของรูปภาพใน container
    const imageRect = imageElement.getBoundingClientRect();
    const containerBounds = containerElement.getBoundingClientRect();

    // แปลงเป็นตำแหน่งจริงบนรูปภาพก่อน transform (อิง matrix transform ของรูป)
    const baseX = ((clientX - containerBounds.left) - panOffset.x) / zoomLevel;
    const baseY = ((clientY - containerBounds.top) - panOffset.y) / zoomLevel;

    // คำนวณขนาดฐานและขนาดแสดงผลจริงของรูป พร้อม offset การจัดวาง (รองรับ object-fit: contain)
    const baseWidth = imageRect.width / zoomLevel;
    const baseHeight = imageRect.height / zoomLevel;

    const naturalWidth = imageElement.naturalWidth;
    const naturalHeight = imageElement.naturalHeight;

    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = baseWidth / baseHeight;

    let displayWidth: number, displayHeight: number, offsetX: number, offsetY: number;
    if (imageAspect > containerAspect) {
      displayWidth = baseWidth;
      displayHeight = baseWidth / imageAspect;
      offsetX = 0;
      offsetY = (baseHeight - displayHeight) / 2;
    } else {
      displayWidth = baseHeight * imageAspect;
      displayHeight = baseHeight;
      offsetX = (baseWidth - displayWidth) / 2;
      offsetY = 0;
    }

    // จำกัดพิกัดให้อยู่ในพื้นที่รูปที่แสดงจริง โดยหัก offset ของการจัดวางก่อน
    const withinX = Math.max(0, Math.min(baseX - offsetX, displayWidth));
    const withinY = Math.max(0, Math.min(baseY - offsetY, displayHeight));

    // แปลงเป็นเปอร์เซ็นต์ตามพื้นที่รูปที่แสดงจริง
    const relativeX = (withinX / displayWidth) * 100;
    const relativeY = (withinY / displayHeight) * 100;

    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === draggedMarker.id) {
          const updatedMarker = { ...marker, x: relativeX, y: relativeY };

          // คำนวณพิกัด absolute ภายในพื้นที่รูปที่แสดงจริง (ก่อนบวก offset การจัดวาง)
          const absoluteX = (relativeX / 100) * displayWidth;
          const absoluteY = (relativeY / 100) * displayHeight;

          // อัพเดทตำแหน่ง Lat/Lng ขณะลาก และส่งข้อมูล marker ที่อัพเดท
          updateLatLngDisplay(absoluteX, absoluteY, updatedMarker);

          // หา zone ใหม่ด้วยพิกัด absolute ที่รวม offset การจัดวาง เพื่อให้สอดคล้องกับฐานของ zone
          const zone = zones.find(z => !z.isDefault && isPointInZone(absoluteX + offsetX, absoluteY + offsetY, z));
          if (zone) {
            updatedMarker.group = zone.name;
          }
          return updatedMarker;
        }
        return marker;
      })
    );
  };

  // จัดการการเคลื่อนไหวของเมาส์สำหรับลาก marker
  const handleMarkerMove = (e: React.MouseEvent) => {
    if (!draggedMarker || !isDragging) {
      return;
    }

    // เรียก helper เพื่ออัปเดตจาก client coordinates
    updateMarkerDragByClient(e.clientX, e.clientY);
  };

  // เพิ่ม event listener ระดับ window ระหว่างกำลังลาก marker เพื่อไม่ให้หลุดเมื่อออกนอกขอบ
  useEffect(() => {
    if (!isDragging || !draggedMarker) return;

    const onMouseMove = (e: globalThis.MouseEvent) => {
      updateMarkerDragByClient(e.clientX, e.clientY);
    };

    const onMouseUp = (_e: globalThis.MouseEvent) => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, draggedMarker]);

  // เริ่มการตรวจจับการลาง
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (isDragging || isPanning) return;

    // ตรวจสอบว่ากด middle click หรือ Alt+click สำหรับ panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // กด Shift + ซูม > 100% เพื่อ panning ด้วยซ้าย
    if (e.button === 0 && e.shiftKey && zoomLevel > 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // ตรวจสอบโมด - ถ้าเป็น preview อนุญาตเฉพาะ panning และล้าง marker selection
    if (mapMode === 'preview') {
      // ล้าง marker selection เมื่อ click นอกพื้นที่ marker ในโหมด preview
      if (clickedMarker && setUnitClick) {
        setClickedMarker(null);
        // ในโหมด preview ไม่ต้องเปลี่ยน hasActiveMarker เพื่อไม่รบกวนการส่งสถานะ
        setUnitClick(null);
      }

      return;
    }

    // ตรวจสอบว่ามี active marker อยู่หรือไม่ (ป้องกันการสร้าง zone เมื่อมี active marker)
    if (clickedMarker || hasActiveMarker) {
      return;
    }

    // ตรวจสอบว่ามี pending marker อยู่หรือไม่
    const hasPendingMarker = markers.some(marker => marker.name === "");
    if (hasPendingMarker) {
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
    const imageElement = imageRef.current;
    const containerElement = containerRef.current;

    if (!imageElement || !containerElement) return;

    // คำนวณตำแหน่งของรูปภาพใน container
    const imageRect = imageElement.getBoundingClientRect();
    const containerBounds = containerElement.getBoundingClientRect();

    // คำนวณ offset ของรูปภาพจาก container
    const imageOffsetX = imageRect.left - containerBounds.left;
    const imageOffsetY = imageRect.top - containerBounds.top;

    const mouseX = e.clientX - containerBounds.left;
    const mouseY = e.clientY - containerBounds.top;

    // แปลงเป็นตำแหน่งจริงในระบบ CSS matrix transform (เหมือน handleImageClick)
    const x = (mouseX - panOffset.x) / zoomLevel;
    const y = (mouseY - panOffset.y) / zoomLevel;

    // ตรวจสอบว่าอยู่ในขอบเขตรูปภาพหรือไม่
    const imageBaseWidth = imageRect.width / zoomLevel;
    const imageBaseHeight = imageRect.height / zoomLevel;
    if (x < 0 || x > imageBaseWidth || y < 0 || y > imageBaseHeight) {
      return;
    }

    // ตรวจสอบว่ากด Shift หรือไม่สำหรับการเลือกแบบกลุ่ม
    if (e.shiftKey) {
      // ล้างค่าที่เกี่ยวข้องกับการสร้าง zone
      setMouseDownStart(null);
      setMouseDownTime(null);
      setHasDragged(false);
      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);

      // เริ่ม group selection
      setIsGroupSelecting(true);
      setGroupSelectionStart({ x, y });
      setGroupSelectionEnd({ x, y });
      setSelectedMarkers([]);
      setSelectedZones([]);
      return;
    }

    // ตรวจสอบว่าคลิกที่ marker ที่เลือกไว้หรือไม่
    const selectedClickedMarker = markers.find(marker => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
      return distance <= 15 && selectedMarkers.includes(marker.id);
    });

    // ตรวจสอบว่าคลิกที่ zone ที่เลือกไว้หรือไม่
    const selectedClickedZone = zones.find(zone => {
      return isPointInZone(x, y, zone) && selectedZones.includes(zone.id);
    });

    // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลางแบบผสม
    if ((selectedClickedMarker || selectedClickedZone) && selectedMarkers.length > 0 && selectedZones.length > 0) {
      // บันทึก original positions สำหรับทั้ง markers และ zones
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (selectedMarkers.includes(marker.id)) {
            return { ...marker, originalX: marker.x, originalY: marker.y };
          }
          return marker;
        })
      );

      setZones(prevZones =>
        prevZones.map(zone => {
          if (selectedZones.includes(zone.id)) {
            return { ...zone, originalX: zone.x, originalY: zone.y };
          }
          return zone;
        })
      );

      setIsDraggingMixed(true);

      // เก็บ reference point และ offset
      const referencePoint: DragReference = selectedClickedMarker
        ? { x: selectedClickedMarker.x, y: selectedClickedMarker.y, type: "marker" as const, id: selectedClickedMarker.id }
        : selectedClickedZone
          ? { x: selectedClickedZone.x, y: selectedClickedZone.y, type: "zone" as const, id: selectedClickedZone.id }
          : { x: 0, y: 0, type: "marker" as const, id: 0 };

      setDragReference(referencePoint);
      setGroupDragOffset({
        x: x - referencePoint.x,
        y: y - referencePoint.y
      });
      return;
    }

    // ถ้าเลือกเฉพาะ markers
    if (selectedClickedMarker && selectedMarkers.length > 0 && selectedZones.length === 0) {
      // บันทึก original positions ก่อนเริ่มลาก
      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (selectedMarkers.includes(marker.id)) {
            return { ...marker, originalX: marker.x, originalY: marker.y };
          }
          return marker;
        })
      );

      setIsDraggingGroup(true);
      setGroupDragOffset({
        x: x - selectedClickedMarker.x,
        y: y - selectedClickedMarker.y
      });
      return;
    }

    // ถ้าเลือกเฉพาะ zones
    if (selectedClickedZone && selectedZones.length > 0 && selectedMarkers.length === 0) {
      // บันทึก original positions ก่อนเริ่มลาก zones
      setZones(prevZones =>
        prevZones.map(zone => {
          if (selectedZones.includes(zone.id)) {
            return { ...zone, originalX: zone.x, originalY: zone.y };
          }
          return zone;
        })
      );

      setIsDraggingZoneGroup(true);
      setGroupDragOffset({
        x: x - selectedClickedZone.x,
        y: y - selectedClickedZone.y
      });
      return;
    }

    // ล้างการเลือกถ้าคลิกที่พื้นที่ว่าง
    if (selectedMarkers.length > 0 || selectedZones.length > 0) {
      setSelectedMarkers([]);
      setSelectedZones([]);
    }

    if (!ENABLE_ZONE_CREATION) {
      return;
    }

    // ตั้งค่า mouseDownStart เฉพาะถ้าไม่ได้ทำ group selection
    setMouseDownStart({ x, y });
    setMouseDownTime(Date.now());
    setHasDragged(false);
  };

  // ตรวจจับว่า marker เป็นสถานะฉุกเฉินหรือไม่
  const isEmergencyMarker = (marker: Marker): boolean => {
    return marker.color === "red" ||
      marker.status === 'emergency';
  };

  // หาสีของ marker
  const getMarkerColors = (color: string) => {
    const colorMap: Record<string, { bg: string, hover: string }> = {
      red: { bg: "bg-red-500", hover: "hover:bg-red-600" },
      yellow: { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
      green: { bg: "bg-green-500", hover: "hover:bg-green-600" },
      blue: { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
      pink: { bg: "bg-pink-500", hover: "hover:bg-pink-600" },
      indigo: { bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
      teal: { bg: "bg-teal-500", hover: "hover:bg-teal-600" }
    };
    return colorMap[color] || colorMap.red;
  };

  // แปลงสี Tailwind เป็นสี RGB
  const colorMap: Record<string, string> = {
    red: "#EF4444", // bg-red-500
    yellow: "#F59E0B", // bg-yellow-500
    green: "#22c55e", // bg-green-500
    blue: "#3B82F6", // bg-blue-500
    pink: "#EC4899", // bg-pink-500
    indigo: "#6366F1", // bg-indigo-500
    teal: "#14B8A6" // bg-teal-500
  };

  // แปลงสี Tailwind เป็นสี Ring (สำหรับวงแหวน)
  const ringColorMap: Record<string, string> = {
    red: "ring-red-400",
    yellow: "ring-yellow-400",
    green: "ring-green-400",
    blue: "ring-blue-400",
    pink: "ring-pink-400",
    indigo: "ring-indigo-400",
    teal: "ring-teal-400"
  };

  // หาสีของกลุ่ม
  const getZoneColors = (color: string) => {
    const colorMap: Record<string, { bg: string, border: string, bgOpacity: string }> = {
      blue: { bg: "bg-blue-500", border: "border-blue-500", bgOpacity: "bg-blue-200" },
      purple: { bg: "bg-purple-500", border: "border-purple-500", bgOpacity: "bg-purple-200" },
      orange: { bg: "bg-orange-500", border: "border-orange-500", bgOpacity: "bg-orange-200" },
      emerald: { bg: "bg-emerald-500", border: "border-emerald-500", bgOpacity: "bg-emerald-200" },
      rose: { bg: "bg-rose-500", border: "border-rose-500", bgOpacity: "bg-rose-200" },
      cyan: { bg: "bg-cyan-500", border: "border-cyan-500", bgOpacity: "bg-cyan-200" },
      amber: { bg: "bg-amber-500", border: "border-amber-500", bgOpacity: "bg-amber-200" }
    };
    return colorMap[color] || colorMap.blue;
  };

  // สลับการแสดง/ซ่อนกลุ่ม
  const toggleZoneVisibility = (zoneId: number) => {
    setVisibleZones({
      ...visibleZones,
      [zoneId]: !visibleZones[zoneId]
    });
  };

  // บันทึกการแก้ไข marker
  const handleEditMarkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMarkerData && originalMarkerData) {
      // บันทึกประวัติการแก้ไข marker
      addToHistory(ACTION_TYPES.EDIT_MARKER, {
        id: editMarkerData.id,
        previous: originalMarkerData,
        current: editMarkerData
      });

      setMarkers(prevMarkers =>
        prevMarkers.map(marker => {
          if (marker.id === editMarkerData.id) {
            if (marker.group !== editMarkerData.group) {
              const newZone = zones.find(zone => zone.name === editMarkerData.group);
              if (newZone) {
                const center = getZoneCenter(newZone);
                return {
                  ...marker,
                  ...editMarkerData,
                  x: center.x,
                  y: center.y,
                  originalX: center.x, // อัพเดท originalX เป็นตำแหน่งใหม่
                  originalY: center.y, // อัพเดท originalY เป็นตำแหน่งใหม่
                  address: editMarkerData.address
                };
              }
            }
            return {
              ...marker,
              ...editMarkerData,
              originalX: editMarkerData.x, // อัพเดท originalX เป็นตำแหน่งปัจจุบัน
              originalY: editMarkerData.y, // อัพเดท originalY เป็นตำแหน่งปัจจุบัน
              address: editMarkerData.address
            };
          }
          return marker;
        })
      );

      // อัพเดท marker ที่ถูกเลือกด้วย
      if (onMarkerSelect) {
        const updatedMarker = {
          ...editMarkerData,
          originalX: editMarkerData.x, // อัพเดท originalX เป็นตำแหน่งปัจจุบัน
          originalY: editMarkerData.y, // อัพเดท originalY เป็นตำแหน่งปัจจุบัน
        };
        onMarkerSelect(updatedMarker);
      }

      setEditMarkerData(null);
      setOriginalMarkerData(null);
      setShowEditMarkerModal(false);
    }
  };

  // เพิ่มฟังก์ชันสำหรับการลากกลุ่ม
  const handleZoneMouseDown = (e: React.MouseEvent, zone: Zone, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้ลาก หรือปรับขนาด zone
    if (mapMode === 'preview') {
      return;
    }

    // เรียก setStatusClickMap(true) เมื่อเริ่มโยกย้าย zone
    if (setStatusClickMap) {
      setStatusClickMap(true);
    }

    // ป้องกันการลากถ้ากำลังทำ group selection
    if (isGroupSelecting) {
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว
    const rect = imageRef.current?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!rect || !containerRect) return;

    // คำนวณ offset ของรูปภาพจาก container
    const imageOffsetX = rect.left - containerRect.left;
    const imageOffsetY = rect.top - containerRect.top;

    const rawMouseX = e.clientX - containerRect.left;
    const rawMouseY = e.clientY - containerRect.top;

    // คำนวณตำแหน่งจริงบนรูปภาพ (CSS matrix transform)
    const mouseX = Math.max(0, Math.min((rawMouseX - panOffset.x) / zoomLevel, rect.width / zoomLevel));
    const mouseY = Math.max(0, Math.min((rawMouseY - panOffset.y) / zoomLevel, rect.height / zoomLevel));

    // ตรวจสอบว่า zone นี้อยู่ในกลุ่มที่เลือกหรือไม่ และไม่มี handle
    if (selectedZones.includes(zone.id) && selectedZones.length > 0 && !handle) {
      // ถ้ามีทั้ง markers และ zones ที่เลือกไว้ ให้ใช้การลากแบบผสม
      if (selectedMarkers.length > 0) {
        // บันทึก original positions สำหรับทั้ง markers และ zones
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              return { ...marker, originalX: marker.x, originalY: marker.y };
            }
            return marker;
          })
        );

        setZones(prevZones =>
          prevZones.map(z => {
            if (selectedZones.includes(z.id)) {
              return { ...z, originalX: z.x, originalY: z.y };
            }
            return z;
          })
        );

        setIsDraggingMixed(true);

        // เก็บ reference point และ offset
        const referencePoint: DragReference = { x: zone.x, y: zone.y, type: "zone" as const, id: zone.id };
        setDragReference(referencePoint);
        // แปลง mouse coordinates เป็น percentage สำหรับ mixed dragging
        const imageElement = imageRef.current;
        if (!imageElement) return;
        const imageRect = imageElement.getBoundingClientRect();
        const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
        const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

        setGroupDragOffset({
          x: mouseXPercent - zone.x,
          y: mouseYPercent - zone.y
        });
        return;
      }

      // ถ้าเลือกเฉพาะ zones
      setZones(prevZones =>
        prevZones.map(z => {
          if (selectedZones.includes(z.id)) {
            return { ...z, originalX: z.x, originalY: z.y };
          }
          return z;
        })
      );

      // แปลง mouse coordinates เป็น percentage สำหรับ zone group dragging
      const imageElement = imageRef.current;
      if (!imageElement) return;
      const imageRect = imageElement.getBoundingClientRect();
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      setIsDraggingZoneGroup(true);
      setGroupDragOffset({
        x: mouseXPercent - zone.x,
        y: mouseYPercent - zone.y
      });
      return;
    }

    // ล้างการเลือกเก่าถ้าคลิกที่ zone ที่ไม่ได้เลือก
    if (selectedZones.length > 0 && !selectedZones.includes(zone.id)) {
      setSelectedZones([]);
      setSelectedMarkers([]);
    }

    if (handle === "rotate") {
      setIsRotatingZone(true);
      const center = {
        x: zone.x + zone.width / 2,
        y: zone.y + zone.height / 2
      };
      setRotationStartAngle(calculateAngle(center, { x: mouseX, y: mouseY }) - (zone.rotation || 0));
    } else {
      // แปลง mouse coordinates เป็น percentage เหมือน zone
      const imageElement = imageRef.current;
      if (!imageElement) return;
      const imageRect = imageElement.getBoundingClientRect();
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      setOriginalZoneState({
        offsetX: mouseXPercent - zone.x,
        offsetY: mouseYPercent - zone.y,
        initialX: zone.x,
        initialY: zone.y,
        initialWidth: zone.width,
        initialHeight: zone.height,
        rotation: zone.rotation || 0
      });

      if (handle) {
        setIsResizingZone(true);
        setResizeHandle(handle);
      } else {
        setIsDraggingZone(true);

        // เริ่มการติดตามตำแหน่งสำหรับ zone (แปลงเป็น pixel สำหรับการแสดงผล)
        const displayX = (zone.x / 100) * (imageRect.width / zoomLevel);
        const displayY = (zone.y / 100) * (imageRect.height / zoomLevel);
        updateLatLngDisplay(displayX, displayY);
      }
    }
    setDraggedZone(zone);
  };

  // อัพเดทการจัดการ mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    // จัดการ panning
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isDragging) {
      handleMarkerMove(e);
      return;
    }

    // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว (ใช้การคำนวณเดียวกับ handleImageMouseDown)
    const imageElement = imageRef.current;
    const containerElement = containerRef.current;
    if (!imageElement || !containerElement) return;

    // คำนวณตำแหน่งของรูปภาพใน container
    const imageRect = imageElement.getBoundingClientRect();
    const containerBounds = containerElement.getBoundingClientRect();

    // คำนวณ offset ของรูปภาพจาก container
    const imageOffsetX = imageRect.left - containerBounds.left;
    const imageOffsetY = imageRect.top - containerBounds.top;

    const rawMouseX = e.clientX - containerBounds.left;
    const rawMouseY = e.clientY - containerBounds.top;

    // แปลงเป็นตำแหน่งจริงในระบบ CSS matrix transform (เหมือน handleImageClick)
    const mouseX = Math.max(0, Math.min((rawMouseX - panOffset.x) / zoomLevel, imageRect.width / zoomLevel));
    const mouseY = Math.max(0, Math.min((rawMouseY - panOffset.y) / zoomLevel, imageRect.height / zoomLevel));

    if (isRotatingZone && draggedZone) {
      // เรียก setStatusClickMap(true) เมื่อกำลัง rotate zone
      if (setStatusClickMap) {
        setStatusClickMap(true);
      }

      // แปลงตำแหน่งเมาส์เป็น percentage coordinates สำหรับ zone
      const imageElement = imageRef.current;
      if (!imageElement) return;

      const imageRect = imageElement.getBoundingClientRect();
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      const center = {
        x: draggedZone.x + draggedZone.width / 2,
        y: draggedZone.y + draggedZone.height / 2
      };
      const currentAngle = calculateAngle(center, { x: mouseXPercent, y: mouseYPercent }) - rotationStartAngle;

      setZones(prevZones => prevZones.map(zone => (zone.id === draggedZone.id ? { ...zone, rotation: currentAngle } : zone)));
      return;
    }

    if (isDraggingZone && draggedZone && originalZoneState) {
      // เรียก setStatusClickMap(true) เมื่อกำลังโยกย้าย zone
      if (setStatusClickMap) {
        setStatusClickMap(true);
      }

      // แปลงตำแหน่งเมาส์เป็นตำแหน่งบนรูปภาพที่ zoom แล้ว (ใช้การคำนวณเดียวกับ handleImageMouseDown)
      const imageElement = imageRef.current;
      const containerElement = containerRef.current;
      if (!imageElement || !containerElement) return;

      // คำนวณตำแหน่งของรูปภาพใน container
      const imageRect = imageElement.getBoundingClientRect();
      const containerBounds = containerElement.getBoundingClientRect();

      // คำนวณ offset ของรูปภาพจาก container
      const imageOffsetX = imageRect.left - containerBounds.left;
      const imageOffsetY = imageRect.top - containerBounds.top;

      const rawMouseX = e.clientX - containerBounds.left;
      const rawMouseY = e.clientY - containerBounds.top;

      // คำนวณตำแหน่งจริงบนรูปภาพ (CSS matrix transform)
      const mouseX = Math.max(0, Math.min((rawMouseX - panOffset.x) / zoomLevel, imageRect.width / zoomLevel));
      const mouseY = Math.max(0, Math.min((rawMouseY - panOffset.y) / zoomLevel, imageRect.height / zoomLevel));

      // แปลงเป็น percentage coordinates สำหรับ zone
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      setZones(prevZones =>
        prevZones.map(zone => {
          if (zone.id === draggedZone.id) {
            let newZone = { ...zone };
            const minSize = 1; // เปลี่ยนจาก 50 เป็น 1 เพื่อให้ resize เล็กได้ตามต้องการ

            // คำนวณขอบเขตสูงสุดและต่ำสุด
            const originalLeft = originalZoneState.initialX;
            const originalTop = originalZoneState.initialY;
            const originalRight = originalLeft + originalZoneState.initialWidth;
            const originalBottom = originalTop + originalZoneState.initialHeight;

            // ฟังก์ชันสำหรับคำนวณการย่อขยายและกลับด้าน
            const calculateReversibleDimension = (mousePos: number, fixedPos: number, isStart: boolean) => {
              const distance = mousePos - fixedPos;
              const isReversed = isStart ? distance < 0 : distance < minSize;

              if (isReversed) {
                // กลับด้าน
                return {
                  start: isStart ? fixedPos + distance : fixedPos,
                  size: Math.abs(distance)
                };
              } else {
                // ปกติ
                return {
                  start: isStart ? mousePos : fixedPos,
                  size: Math.abs(distance)
                };
              }
            };

            switch (resizeHandle) {
              case "n": {
                const result = calculateReversibleDimension(mouseYPercent, originalBottom, true);
                newZone.y = result.start;
                newZone.height = result.size;
                break;
              }
              case "s": {
                const result = calculateReversibleDimension(mouseYPercent, originalTop, false);
                newZone.y = result.start;
                newZone.height = result.size;
                break;
              }
              case "e": {
                const result = calculateReversibleDimension(mouseXPercent, originalLeft, false);
                newZone.x = result.start;
                newZone.width = result.size;
                break;
              }
              case "w": {
                const result = calculateReversibleDimension(mouseXPercent, originalRight, true);
                newZone.x = result.start;
                newZone.width = result.size;
                break;
              }
              case "ne": {
                const vertical = calculateReversibleDimension(mouseYPercent, originalBottom, true);
                const horizontal = calculateReversibleDimension(mouseXPercent, originalLeft, false);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "nw": {
                const vertical = calculateReversibleDimension(mouseYPercent, originalBottom, true);
                const horizontal = calculateReversibleDimension(mouseXPercent, originalRight, true);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "se": {
                const vertical = calculateReversibleDimension(mouseYPercent, originalTop, false);
                const horizontal = calculateReversibleDimension(mouseXPercent, originalLeft, false);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
              case "sw": {
                const vertical = calculateReversibleDimension(mouseYPercent, originalTop, false);
                const horizontal = calculateReversibleDimension(mouseXPercent, originalRight, true);
                newZone.y = vertical.start;
                newZone.height = vertical.size;
                newZone.x = horizontal.start;
                newZone.width = horizontal.size;
                break;
              }
            }

            // ตรวจสอบขนาดขั้นต่ำ - อนุญาตให้เล็กได้ตามต้องการ
            if (newZone.width < minSize || newZone.height < minSize) {
              return zone;
            }

            return newZone;
          }
          return zone;
        })
      );
      return;
    }

    // จัดการการเลือกกลุ่มใหม่ (สร้าง zone) - แต่ไม่ให้ทำถ้ากำลัง group selecting
    if (mouseDownStart && !isGroupSelecting) {
      if (!ENABLE_ZONE_CREATION) {
        return;
      }

      // คำนวณพิกัดบนรูปภาพให้ตรงกับ handleImageMouseDown
      const imageElement = imageRef.current;
      const containerElement = containerRef.current;
      if (!imageElement || !containerElement) return;

      const imageRect = imageElement.getBoundingClientRect();
      const containerBounds = containerElement.getBoundingClientRect();

      const imageOffsetX = imageRect.left - containerBounds.left;
      const imageOffsetY = imageRect.top - containerBounds.top;

      const rawMouseX = e.clientX - containerBounds.left;
      const rawMouseY = e.clientY - containerBounds.top;

      // แปลงเป็นตำแหน่งจริงในระบบ CSS matrix transform
      const currentX = (rawMouseX - panOffset.x) / zoomLevel;
      const currentY = (rawMouseY - panOffset.y) / zoomLevel;

      const distance = getDistance(mouseDownStart, { x: currentX, y: currentY });
      const timeDiff = mouseDownTime ? Date.now() - mouseDownTime : 0;

      // ตั้งให้เป็น zone selection เฉพาะเมื่อลากระยะทางและเวลาเพียงพอ
      if (distance >= DRAG_THRESHOLD && timeDiff > 100 && !isSelectingZone && !isGroupSelecting) {
        setIsSelectingZone(true);
        setSelectionStart(mouseDownStart);
        setHasDragged(true);
      }

      if (isSelectingZone) {
        // ใช้ขอบเขตของรูปภาพจาก imageRect ที่คำนวณที่ต้นฟังก์ชัน
        const imageSelectionWidth = imageRect.width / zoomLevel;
        const imageSelectionHeight = imageRect.height / zoomLevel;
        const x = Math.max(0, Math.min(currentX, imageSelectionWidth));
        const y = Math.max(0, Math.min(currentY, imageSelectionHeight));
        setSelectionEnd({ x, y });
      }
    }

    // จัดการการเลือกแบบกลุ่ม
    if (isGroupSelecting && groupSelectionStart) {
      // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้เลือกกลุ่ม
      if (mapMode === 'preview') {
        return;
      }

      setGroupSelectionEnd({ x: mouseX, y: mouseY });

      // หา markers ที่อยู่ในพื้นที่เลือก
      const markersInSelection = markers
        .filter(marker => isMarkerInSelection(marker, groupSelectionStart, { x: mouseX, y: mouseY }))
        .map(marker => marker.id);

      // หา zones ที่อยู่ในพื้นที่เลือก
      const zonesInSelection = zones
        .filter(zone => isZoneInSelection(zone, groupSelectionStart, { x: mouseX, y: mouseY }))
        .map(zone => zone.id);

      setSelectedMarkers(markersInSelection);
      setSelectedZones(zonesInSelection);
      return;
    }

    // จัดการการลากกลุ่ม (markers ใช้ percentage coordinates)
    if (isDraggingGroup && selectedMarkers.length > 0) {
      // เรียก setStatusClickMap(true) เมื่อกำลังโยกย้าย marker group
      if (setStatusClickMap) {
        setStatusClickMap(true);
      }

      // แปลงตำแหน่งเมาส์เป็น percentage coordinates สำหรับ marker
      const imageElement = imageRef.current;
      if (!imageElement) return;

      const imageRect = imageElement.getBoundingClientRect();
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      // คำนวณตำแหน่งใหม่จากตำแหน่ง mouse ปัจจุบัน (percentage)
      const targetX = mouseXPercent - groupDragOffset.x;
      const targetY = mouseYPercent - groupDragOffset.y;

      // หา marker หลักที่ใช้เป็นจุดอ้างอิง (marker ตัวแรกที่ถูกเลือก)
      const referenceMarker = markers.find(m => selectedMarkers.includes(m.id));
      if (referenceMarker && referenceMarker.originalX !== undefined && referenceMarker.originalY !== undefined) {
        // คำนวณการเปลี่ยนแปลงตำแหน่งจากตำแหน่งเดิมของ reference marker (percentage)
        const deltaX = targetX - referenceMarker.originalX;
        const deltaY = targetY - referenceMarker.originalY;

        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id) && marker.originalX !== undefined && marker.originalY !== undefined) {
              // ใช้ตำแหน่งเดิม + delta เพื่อให้การเคลื่อนที่นุ่มนวลและแม่นยำ (percentage)
              const newMarkerX = Math.max(0, Math.min(marker.originalX + deltaX, 100));
              const newMarkerY = Math.max(0, Math.min(marker.originalY + deltaY, 100));
              return { ...marker, x: newMarkerX, y: newMarkerY };
            }
            return marker;
          })
        );
      }
      return;
    }

    // จัดการการลากแบบผสม (markers และ zones พร้อมกัน)
    if (isDraggingMixed && dragReference && (selectedMarkers.length > 0 || selectedZones.length > 0)) {
      // เรียก setStatusClickMap(true) เมื่อกำลังโยกย้าย mixed group
      if (setStatusClickMap) {
        setStatusClickMap(true);
      }

      // อัพเดท markers (ใช้ percentage coordinates)
      if (selectedMarkers.length > 0) {
        // แปลงตำแหน่งเมาส์เป็น percentage coordinates สำหรับ marker
        const imageElement = imageRef.current;
        if (!imageElement) return;

        const imageRect = imageElement.getBoundingClientRect();
        const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
        const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

        // คำนวณตำแหน่งใหม่ของจุดอ้างอิงจาก mouse position (percentage)
        const newReferenceX = mouseXPercent - groupDragOffset.x;
        const newReferenceY = mouseYPercent - groupDragOffset.y;

        // คำนวณ offset จากตำแหน่งเดิมของจุดอ้างอิง (marker reference เป็น percentage)
        const offsetX = newReferenceX - dragReference.x;
        const offsetY = newReferenceY - dragReference.y;

        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              const originalX = marker.originalX || marker.x;
              const originalY = marker.originalY || marker.y;
              const newMarkerX = Math.max(0, Math.min(originalX + offsetX, 100));
              const newMarkerY = Math.max(0, Math.min(originalY + offsetY, 100));
              return { ...marker, x: newMarkerX, y: newMarkerY };
            }
            return marker;
          })
        );
      }

      // อัพเดท zones (ใช้ percentage coordinates)
      if (selectedZones.length > 0) {
        // แปลงตำแหน่งเมาส์เป็น percentage coordinates สำหรับ zone
        const imageElement = imageRef.current;
        if (!imageElement) return;

        const imageRect = imageElement.getBoundingClientRect();
        const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
        const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

        // คำนวณตำแหน่งใหม่ของจุดอ้างอิงจาก mouse position
        const newReferenceX = mouseXPercent - groupDragOffset.x;
        const newReferenceY = mouseYPercent - groupDragOffset.y;

        // dragReference เป็น percentage coordinates เสมอ (ทั้ง marker และ zone)
        const referenceXPercent = dragReference.x;
        const referenceYPercent = dragReference.y;

        const offsetX = newReferenceX - referenceXPercent;
        const offsetY = newReferenceY - referenceYPercent;

        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              const originalX = zone.originalX || zone.x;
              const originalY = zone.originalY || zone.y;
              const newZoneX = Math.max(0, Math.min(originalX + offsetX, 100 - zone.width));
              const newZoneY = Math.max(0, Math.min(originalY + offsetY, 100 - zone.height));
              return { ...zone, x: newZoneX, y: newZoneY };
            }
            return zone;
          })
        );
      }
      return;
    }

    // จัดการการลากกลุ่ม zones
    if (isDraggingZoneGroup && selectedZones.length > 0) {
      // เรียก setStatusClickMap(true) เมื่อกำลังโยกย้าย zone group
      if (setStatusClickMap) {
        setStatusClickMap(true);
      }

      // แปลงตำแหน่งเมาส์เป็น percentage coordinates สำหรับ zone
      const imageElement = imageRef.current;
      if (!imageElement) return;

      const imageRect = imageElement.getBoundingClientRect();
      const mouseXPercent = (mouseX / (imageRect.width / zoomLevel)) * 100;
      const mouseYPercent = (mouseY / (imageRect.height / zoomLevel)) * 100;

      // คำนวณตำแหน่งใหม่จากตำแหน่ง mouse ปัจจุบัน
      const newX = mouseXPercent - groupDragOffset.x;
      const newY = mouseYPercent - groupDragOffset.y;

      // หา zone หลักที่ใช้เป็นจุดอ้างอิง (zone ตัวแรกที่ถูกเลือก)
      const referenceZone = zones.find(z => selectedZones.includes(z.id));
      if (referenceZone) {
        // คำนวณการเปลี่ยนแปลงตำแหน่งจาก reference zone
        const offsetX = newX - referenceZone.x;
        const offsetY = newY - referenceZone.y;

        setZones(prevZones =>
          prevZones.map(zone => {
            if (selectedZones.includes(zone.id)) {
              const newZoneX = Math.max(0, Math.min(zone.x + offsetX, 100 - zone.width));
              const newZoneY = Math.max(0, Math.min(zone.y + offsetY, 100 - zone.height));
              return { ...zone, x: newZoneX, y: newZoneY };
            }
            return zone;
          })
        );
      }
      return;
    }

    if (isRotatingZone && draggedZone) {
      const center = {
        x: draggedZone.x + draggedZone.width / 2,
        y: draggedZone.y + draggedZone.height / 2
      };
      const currentAngle = calculateAngle(center, { x: mouseX, y: mouseY }) - rotationStartAngle;

      setZones(prevZones => prevZones.map(zone => (zone.id === draggedZone.id ? { ...zone, rotation: currentAngle } : zone)));
      return;
    }
  };

  // อัพเดทการจัดการ mouse up
  const handleMouseUp = () => {
    // จัดการ panning
    if (isPanning) {
      setIsPanning(false);
      setJustFinishedPanning(true);
      setTimeout(() => setJustFinishedPanning(false), 100);
      return;
    }

    // จัดการการเลือกแบบกลุ่ม
    if (isGroupSelecting) {
      setIsGroupSelecting(false);
      setGroupSelectionStart(null);
      setGroupSelectionEnd(null);
      // ล้างค่าที่เกี่ยวข้องกับการสร้าง zone เพื่อป้องกันการแสดง modal
      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setHasDragged(false);
      // ตั้งค่าเพื่อป้องกันการเปิด popup ทันทีหลังจาก group selection
      setJustFinishedGroupSelection(true);
      setTimeout(() => setJustFinishedGroupSelection(false), 100);
      return;
    }

    // จัดการการลากกลุ่ม
    if (isDraggingGroup && selectedMarkers.length > 0) {
      // บันทึกประวัติการเคลื่อนย้ายกลุ่ม
      const movedMarkers = markers.filter(m => selectedMarkers.includes(m.id));
      const originalPositions = movedMarkers.map(m => ({
        id: m.id,
        originalX: m.originalX,
        originalY: m.originalY,
        currentX: m.x,
        currentY: m.y
      }));

      // บันทึกประวัติการเคลื่อนย้ายเฉพาะถ้ามีการเปลี่ยนแปลงตำแหน่ง
      const hasPositionChanged = originalPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_GROUP, {
          markers: originalPositions
        });

        // อัพเดทกลุ่มของ markers หลังจากลาก และ lock markers ทั้งหมด
        setMarkers(prevMarkers =>
          prevMarkers.map(marker => {
            if (selectedMarkers.includes(marker.id)) {
              const newZone = zones.find(zone => isPointInZone(marker.x, marker.y, zone));
              return {
                ...marker,
                group: newZone ? newZone.name : "Marker",
                // ถ้าเป็น active marker (clickedMarker) ไม่ต้อง lock หลังจาก group drag
                isLocked: clickedMarker && clickedMarker.id === marker.id ? false : true
              };
            }
            return marker;
          })
        );
      }

      setIsDraggingGroup(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    // จัดการการลากแบบผสม
    if (isDraggingMixed && (selectedMarkers.length > 0 || selectedZones.length > 0)) {
      let hasPositionChanged = false;
      const historyData: {
        markers?: Array<{
          id: number;
          originalX: number;
          originalY: number;
          currentX: number;
          currentY: number;
        }>;
        zones?: Array<{
          id: number;
          originalX: number;
          originalY: number;
          currentX: number;
          currentY: number;
        }>;
      } = {};

      // จัดการ markers
      if (selectedMarkers.length > 0) {
        const movedMarkers = markers.filter(m => selectedMarkers.includes(m.id));
        const markerPositions = movedMarkers.map(m => ({
          id: m.id,
          originalX: m.originalX,
          originalY: m.originalY,
          currentX: m.x,
          currentY: m.y
        }));

        const markerChanged = markerPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

        if (markerChanged) {
          hasPositionChanged = true;
          historyData.markers = markerPositions;

          // อัพเดทกลุ่มของ markers หลังจากลาก และ lock markers ทั้งหมด
          setMarkers(prevMarkers =>
            prevMarkers.map(marker => {
              if (selectedMarkers.includes(marker.id)) {
                const newZone = zones.find(zone => isPointInZone(marker.x, marker.y, zone));
                return {
                  ...marker,
                  group: newZone ? newZone.name : "Marker",
                  // ถ้าเป็น active marker (clickedMarker) ไม่ต้อง lock หลังจาก mixed drag
                  isLocked: clickedMarker && clickedMarker.id === marker.id ? false : true
                };
              }
              return marker;
            })
          );
        }
      }

      // จัดการ zones
      if (selectedZones.length > 0) {
        const movedZones = zones.filter(z => selectedZones.includes(z.id));
        const zonePositions = movedZones.map(z => ({
          id: z.id,
          originalX: z.originalX || z.x,
          originalY: z.originalY || z.y,
          currentX: z.x,
          currentY: z.y
        }));

        const zoneChanged = zonePositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

        if (zoneChanged) {
          hasPositionChanged = true;
          historyData.zones = zonePositions;
        }
      }

      // บันทึกประวัติถ้ามีการเปลี่ยนแปลง
      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_MIXED_GROUP, historyData);

        // อัพเดทกลุ่มของ markers หลังจากย้าย objects แบบผสม
        if (historyData.zones) {
          setTimeout(() => {
            updateMarkersGroup();
          }, 50);
        }
      }

      setIsDraggingMixed(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    // จัดการการลากกลุ่ม zones
    if (isDraggingZoneGroup && selectedZones.length > 0) {
      // บันทึกประวัติการเคลื่อนย้ายกลุ่ม zones
      const movedZones = zones.filter(z => selectedZones.includes(z.id));
      const originalPositions = movedZones.map(z => ({
        id: z.id,
        originalX: z.originalX,
        originalY: z.originalY,
        currentX: z.x,
        currentY: z.y
      }));

      // บันทึกประวัติการเคลื่อนย้ายเฉพาะถ้ามีการเปลี่ยนแปลงตำแหน่ง
      const hasPositionChanged = originalPositions.some(p => p.originalX !== p.currentX || p.originalY !== p.currentY);

      if (hasPositionChanged) {
        addToHistory(ACTION_TYPES.MOVE_ZONE_GROUP, {
          zones: originalPositions
        });

        // อัพเดทกลุ่มของ markers หลังจากย้าย zones
        setTimeout(() => {
          updateMarkersGroup();
        }, 50);
      }

      setIsDraggingZoneGroup(false);
      setGroupDragOffset({ x: 0, y: 0 });
      setDragReference(null);
      return;
    }

    if (isDraggingZone || isResizingZone || isRotatingZone) {
      // บันทึกประวัติการเปลี่ยนแปลงของ zone
      if (draggedZone && originalZoneState) {
        const currentZone = zones.find(z => z.id === draggedZone.id);
        if (currentZone) {
          addToHistory(ACTION_TYPES.EDIT_ZONE, {
            id: draggedZone.id,
            previous: {
              x: originalZoneState.initialX,
              y: originalZoneState.initialY,
              width: originalZoneState.initialWidth,
              height: originalZoneState.initialHeight,
              rotation: originalZoneState.rotation
            },
            current: {
              x: currentZone.x,
              y: currentZone.y,
              width: currentZone.width,
              height: currentZone.height,
              rotation: currentZone.rotation
            }
          });
        }
      }
      setIsDraggingZone(false);
      setIsResizingZone(false);
      setIsRotatingZone(false);
      setDraggedZone(null);
      setResizeHandle(null);
      setOriginalZoneState(null);
      setRotationStartAngle(0);

      // อัพเดทกลุ่มของ markers หลังจากการหมุนหรือปรับขนาด zone
      setTimeout(() => {
        updateMarkersGroup();
      }, 50);
    }

    if (isDragging && draggedMarker) {
      const draggedMarkerData = markers.find(m => m.id === draggedMarker.id);
      if (draggedMarkerData) {
        // บันทึกประวัติการเคลื่อนย้าย marker ถ้ามีการเปลี่ยนแปลงตำแหน่ง
        if (draggedMarkerData.originalX !== draggedMarkerData.x || draggedMarkerData.originalY !== draggedMarkerData.y) {
          addToHistory(ACTION_TYPES.MOVE_MARKER, {
            id: draggedMarker.id,
            previousX: draggedMarkerData.originalX,
            previousY: draggedMarkerData.originalY,
            x: draggedMarkerData.x,
            y: draggedMarkerData.y
          });
        }

        // ตรวจสอบว่า marker อยู่ในพื้นที่ของกลุ่มใดหรือไม่
        const newZone = zones.find(zone => isPointInZone(draggedMarkerData.x, draggedMarkerData.y, zone));

        // อัพเดทกลุ่มของ marker และ update originalX, originalY เป็นตำแหน่งใหม่
        setMarkers(prevMarkers => {
          const updatedMarkers = prevMarkers.map(marker =>
            marker.id === draggedMarker.id ? {
              ...marker,
              group: newZone ? newZone.name : "Marker",
              originalX: marker.x, // อัพเดทตำแหน่งเดิมเป็นตำแหน่งปัจจุบัน
              originalY: marker.y,
              // ถ้าเป็น active marker (clickedMarker) ไม่ต้อง lock หลังจาก drag
              isLocked: clickedMarker && clickedMarker.id === draggedMarker.id ? false : true
            } : marker
          );

          // ส่งข้อมูล marker ที่อัปเดตแล้วไปยัง FormVillageLocation หลังจากลากเสร็จ
          const updatedMarker = updatedMarkers.find(m => m.id === draggedMarker.id);
          if (updatedMarker && onMarkerSelect) {
            // ใช้ setTimeout เพื่อให้ setIsDragging(false) ทำงานก่อน
            setTimeout(() => {
              onMarkerSelect(updatedMarker);
            }, 100); // ลด delay เหลือ 100ms
          }

          return updatedMarkers;
        });
      }
      setDraggedMarker(null);
      setIsDragging(false);
    }

    if (isSelectingZone && selectionStart && selectionEnd && hasDragged && !isGroupSelecting) {
      const distance = getDistance(selectionStart, selectionEnd);
      const timeDiff = mouseDownTime ? Date.now() - mouseDownTime : 0;

      // ตรวจสอบว่าเป็นการลางจริงหรือการคลิกที่มีการเคลื่อนไหวเล็กน้อย
      const isRealDrag = distance >= DRAG_THRESHOLD && timeDiff > 150; // ต้องลากระยะทางมากกว่า 15px และใช้เวลามากกว่า 150ms

      if (isRealDrag) {
        setCurrentSelection({
          startX: selectionStart.x,
          startY: selectionStart.y,
          endX: selectionEnd.x,
          endY: selectionEnd.y
        });
        setShowZoneModal(true);
      }

      setIsSelectingZone(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }

    // ล้างค่าต่างๆ
    setMouseDownStart(null);
    setMouseDownTime(null);

    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  // เพิ่มฟังก์ชันสำหรับการลาก marker ในรายการ
  const handleMarkerDragStart = (e: React.DragEvent, marker: Marker) => {
    e.stopPropagation();
    setDraggedListMarker(marker);
  };

  const handleMarkerDragEnd = () => {
    setDraggedListMarker(null);
    setDragOverZoneId(null);
  };

  const handleZoneDragOver = (e: React.DragEvent, zone: Zone) => {
    e.preventDefault();
    setDragOverZoneId(zone.id);
  };

  const handleZoneDragLeave = () => {
    setDragOverZoneId(null);
  };

  const handleZoneDrop = (e: React.DragEvent, targetZone: Zone) => {
    e.preventDefault();
    if (draggedListMarker && targetZone.name !== draggedListMarker.group) {
      // คำนวณจุดกึ่งกลางของกลุ่มเป้าหมาย
      const center = getZoneCenter(targetZone);

      // อัพเดท marker
      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker.id === draggedListMarker.id
            ? {
              ...marker,
              group: targetZone.name,
              x: center.x,
              y: center.y,
              originalX: center.x,
              originalY: center.y
            }
            : marker
        )
      );
    }
    setDraggedListMarker(null);
    setDragOverZoneId(null);
  };

  // เพิ่มฟังก์ชันสำหรับการปรับขนาด marker
  const handleMarkerSizeChange = (markerId: number, newSize: number) => {
    setMarkerSizes(prev => ({
      ...prev,
      [markerId]: Math.max(MIN_MARKER_SIZE, Math.min(MAX_MARKER_SIZE, newSize))
    }));
  };

  // เพิ่ม Component สำหรับวาดรูปทรงด้วย Canvas
  const MarkerShape = ({ shape, color, size, className = "" }: {
    shape: string;
    color: string;
    size: number;
    className?: string;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(
      () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const scale = window.devicePixelRatio || 1;

        // กำหนดขนาด canvas ตาม scale เพื่อความคมชัด
        canvas.width = size * scale;
        canvas.height = size * scale;
        ctx.scale(scale, scale);

        // ตั้งค่าสไตล์พื้นฐาน
        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        // ล้าง canvas
        ctx.clearRect(0, 0, size, size);

        // วาดรูปทรงตามที่กำหนด
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size - 4) / 2; // ลดขนาดเล็กน้อยเพื่อให้มีขอบ

        switch (shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;

          case "square":
            ctx.beginPath();
            ctx.rect(2, 2, size - 4, size - 4);
            ctx.fill();
            ctx.stroke();
            break;

          case "triangle":
            ctx.beginPath();
            ctx.moveTo(centerX, 2);
            ctx.lineTo(size - 2, size - 2);
            ctx.lineTo(2, size - 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case "star":
            ctx.beginPath();
            const outerRadius = radius;
            const innerRadius = radius * 0.4;

            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const x = centerX + r * Math.cos(angle);
              const y = centerY + r * Math.sin(angle);

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }

        // เพิ่มเงา
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      },
      [shape, color, size]
    );

    return (
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`${className} transition-transform duration-200`}
        style={{
          width: size,
          height: size
        }}
      />
    );
  };

  // อัพเดตฟังก์ชัน renderMarker
  const renderMarker = (marker: Marker, isOnMap = true) => {
    const isEditing = editMarkerData?.id === marker.id;
    const displayMarker = isEditing ? editMarkerData : marker;
    const markerColors = getMarkerColors(displayMarker.color);
    const size = isEditing && editMarkerData ? editMarkerData.size : markerSizes[displayMarker.id] || DEFAULT_MARKER_SIZE;
    const sizeInPixels = size * (isOnMap ? 5 : 4); // ลบ zoomLevel ออกเพื่อให้ marker มีขนาดคงที่
    const markerColor = colorMap[displayMarker.color] || colorMap.red;
    const isSelected = selectedMarkers.includes(displayMarker.id);
    const isClickedSingle = clickedMarker?.id === displayMarker.id;
    const isPending = pendingMarker?.id === displayMarker.id;

    if (isOnMap) {
      // ใช้ percentage coordinates โดยตรงเหมือน zone 
      // ไม่ต้องคำนวณ pixel เพราะอยู่ใน transform container แล้ว
      const imageElement = imageRef.current;
      if (!imageElement) {
        return null;
      }
      // เพิ่มสไตล์เมื่อ marker ถูกล็อค
      const lockedStyle = displayMarker.isLocked ? {
        cursor: 'not-allowed',
        opacity: 0.7,
        filter: 'grayscale(30%)'
      } : {};
      // คำนวณตำแหน่งจริงของรูปภาพหลัง object-scale-down และ max-height
    const imageRect = imageElement.getBoundingClientRect();
      const naturalWidth = imageElement.naturalWidth;
      const naturalHeight = imageElement.naturalHeight;
      
      // ใช้ขนาดก่อน transform เพื่อให้ตำแหน่ง marker ตรงกับ overlay ที่ถูก transform เท่ากัน
    const baseWidth = imageRect.width / zoomLevel;
    const baseHeight = imageRect.height / zoomLevel;

      // คำนวณขนาดที่รูปจะแสดงจริง (รองรับ object-scale-down) บน space ก่อน transform


      let displayWidth, displayHeight, offsetX, offsetY;

    const imageAspect = naturalWidth / naturalHeight;
    const containerAspect = baseWidth / baseHeight;

    if (imageAspect > containerAspect) {
      // รูปกว้างกว่า container - จำกัดด้วยความกว้าง
      displayWidth = baseWidth;
      displayHeight = baseWidth / imageAspect;
      offsetX = 0;
      offsetY = (baseHeight - displayHeight) / 2;
    } else {
      // รูปสูงกว่า container - จำกัดด้วยความสูง
      displayWidth = baseHeight * imageAspect;
      displayHeight = baseHeight;
      offsetX = (baseWidth - displayWidth) / 2;
      offsetY = 0;
    }

      const percentX = displayMarker.x;
      const percentY = displayMarker.y;
      
      // คำนวณตำแหน่ง pixel จริงบนรูปภาพ + offset จากการ center
      const pixelX = offsetX + (percentX / 100) * displayWidth;
      const pixelY = offsetY + (percentY / 100) * displayHeight;

      return (
        <div
          key={marker.id}
          className={`absolute group ${isSelected && selectedMarkers.length > 1 ? "cursor-move" : "cursor-pointer"
            }`}
          style={{
            left: pixelX,
            top: pixelY,
            zIndex: draggedMarker?.id === displayMarker.id || isDraggingGroup ? 1000 : hoveredMarkerId === displayMarker.id ? 5000 : 100,
            pointerEvents: "auto",
            transform: `translate(-50%, -50%) scale(${1 / zoomLevel})`
          }}
          onMouseDown={e => handleMarkerMouseDown(e, marker)}
          onMouseEnter={() => setHoveredMarkerId(displayMarker.id)}
          onMouseLeave={() => setHoveredMarkerId(null)}
          onClick={e => {
            e.stopPropagation();

            // ในโหมด preview อนุญาตให้ click marker สีแดง/สีเหลือง เพื่อ filter
            if (mapMode === 'preview') {
              // ตรวจสอบว่าเป็น marker emergency/warning - ขยายเงื่อนไขให้ครอบคลุมมากขึ้น
              const isClickableInPreview = marker.color === 'red' || marker.color === 'yellow' ||
                marker.status === 'emergency' || marker.status === 'warning' ||
                isEmergencyMarker(marker); // ใช้ฟังก์ชัน isEmergencyMarker เพิ่มเติม

              if (isClickableInPreview) {

                // ถ้า marker นี้ถูก click อยู่แล้ว ให้ยกเลิก filter
                if (clickedMarker && clickedMarker.id === marker.id) {
                  setClickedMarker(null);
                  // ในโหมด preview ไม่ต้องเปลี่ยน hasActiveMarker เพื่อไม่รบกวนการส่งสถานะ
                  if (setUnitClick) {
                    setUnitClick(null);
                  }
                  return;
                }

                // เลือก marker ใหม่และตั้งค่า filter
                setClickedMarker(marker);
                // ในโหมด preview ไม่ต้องเปลี่ยน hasActiveMarker เพื่อไม่รบกวนการส่งสถานะ
                if (setUnitClick) {
                  setUnitClick(marker.unitID || null);
                }
                return;
              } else {
                return;
              }
            }

            // ในโหมด work-it ใช้ตรรกะเดิม
            // ตรวจสอบว่า marker ถูกล็อคอยู่หรือไม่
            if (marker.isLocked) {
              return;
            }

            // ตรวจสอบว่ามี pending marker อยู่หรือไม่
            const hasPendingMarker = markers.some(m => m.name === "");
            if (hasPendingMarker) {
              return;
            }

            // ถ้ามี marker active อยู่และเป็นตัวอื่น ให้ reset ตำแหน่งก่อน
            if (hasActiveMarker && clickedMarker && clickedMarker.id !== marker.id) {

              // ทำการ reset marker ก่อนหน้าทันที โดยใช้ข้อมูลจาก clickedMarker ที่มีอยู่

              // หา marker ก่อนหน้าใน markers array เพื่อเทียบ
              const previousMarkerInArray = markers.find(m => m.id === clickedMarker.id);
              if (previousMarkerInArray) {

                // ตรวจสอบว่า marker ถูกลากจากตำแหน่งเดิมหรือไม่
                const hasBeenMoved = previousMarkerInArray.x !== previousMarkerInArray.originalX || previousMarkerInArray.y !== previousMarkerInArray.originalY;

                if (hasBeenMoved) {

                  // reset marker ใช้ originalX/Y ของตัวเอง
                  setMarkers(prevMarkers =>
                    prevMarkers.map(m =>
                      m.id === clickedMarker.id
                        ? { ...m, x: m.originalX, y: m.originalY }
                        : m
                    )
                  );
                }
              }

              // ตอนนี้ให้ผ่านไปยัง active marker ใหม่ได้ แทนที่จะ return
              // ไม่ return เพื่อให้สามารถ active marker ใหม่ได้
            }

            // ถ้าไม่ได้กำลังลาก ให้เลือก marker นี้ (เฉพาะโหมด work-it)
            if (!isDragging && !hasDragged) {

              // เก็บข้อมูลเดิมของ marker ใหม่ที่กำลังจะ active
              setOriginalMarkerBeforeEdit({ ...marker });

              // เฉพาะในโหมด work-it เท่านั้นที่ตั้งค่า hasActiveMarker
              if (mapMode === 'work-it') {
                setHasActiveMarker(true);

                // แจ้ง parent component ว่ามี active marker
                if (onActiveMarkerChange) {
                  onActiveMarkerChange(true);
                }

                // Lock marker ที่เหลือทั้งหมด เมื่อ active marker ใหม่
                lockOtherMarkers(marker.id);
              }
              // ล้างการเลือกแบบกลุ่ม
              setSelectedMarkers([]);
              setSelectedZones([]);

              // อัพเดทตำแหน่ง Lat/Lng เมื่อคลิก marker (แปลงจาก percentage เป็น pixel)
              const imageRect = imageElement.getBoundingClientRect();
              const pixelX = (percentX / 100) * imageRect.width;
              const pixelY = (percentY / 100) * imageRect.height;
              updateLatLngDisplay(pixelX, pixelY, marker);

              // ใช้ setTimeout เพื่อให้การ set state เสร็จก่อน แล้วค่อยส่งข้อมูลไป pare nt
              setTimeout(() => {
                const now = Date.now();
                // ป้องกันการส่งข้อมูล marker เดิมซ้ำ ๆ ในเวลาสั้น ๆ
                if (lastSelectedMarkerId === marker.id && now - lastMarkerSelectTimeRef.current < 500) {
                  return;
                }

                // ส่งข้อมูล marker ที่คลิกไปยัง parent component
                if (onMarkerSelect) {
                  // ดึงข้อมูล marker ล่าสุดจาก markers state แทนการใช้ parameter marker
                  setTimeout(() => {
                    setMarkers(currentMarkers => {
                      const latestMarker = currentMarkers.find(m => m.id === marker.id);
                      if (latestMarker) {
                        onMarkerSelect(latestMarker, false); // ส่งข้อมูล marker ล่าสุดจาก state
                      } else {
                        onMarkerSelect(marker, false); // fallback
                      }
                      return currentMarkers; // ไม่เปลี่ยนแปลง state
                    });
                  }, 10); // delay เล็กน้อยเพื่อให้ lockOtherMarkers ทำงานเสร็จก่อน

                  setLastSelectedMarkerId(marker.id);
                  lastMarkerSelectTimeRef.current = now;
                }

                // แสดง FormVillageLocation เมื่อคลิก marker
                if (setShowWarningVillage && showWarningVillage !== undefined && !setStatusClickMap) {
                  const clickedItem = { type: 'marker' as const, data: marker };
                  setLastCreatedItem(clickedItem);
                  if (onLastCreatedItemChange) {
                    onLastCreatedItemChange(clickedItem);
                  }
                  // เรียก callback เพื่อแสดง FormVillageLocation
                  if (typeof setShowWarningVillage === 'function') {
                    if (setShowWarningVillage.length === 0) {
                      // ฝั่ง Village: เรียกแบบไม่มี parameter
                      (setShowWarningVillage as () => void)();
                    } else {
                      // ฝั่ง Condo: เรียกแบบมี parameter
                      (setShowWarningVillage as (showWarningVillage: boolean) => void)(true);
                    }
                  }
                }
              }, 50); // เพิ่ม small delay เพื่อให้ state update เสร็จ
            }
          }}
        >
          <div className={`relative ${draggedMarker?.id === displayMarker.id ? "scale-110" : ""}`}>
            <div
              className={`rounded-full transition-all duration-200 
                                   ${isClickedSingle ?
                  mapMode === 'preview'
                    ? "!ring-2 !ring-blue-500 ring-opacity-50"
                    : "!ring-2 !ring-blue-500 ring-opacity-50"
                  : ""} 
                  ${isPending ? "ring-2 ring-green-400 ring-opacity-75 animate-pulse" : ""}
                  ${isEmergencyMarker(displayMarker) && !isPending ? "emergency-marker-glow" : ""}`}
              style={{
                width: `${sizeInPixels}px`,
                height: `${sizeInPixels}px`,
                backgroundColor: isPending ? "rgba(34, 197, 94, 0.8)" : markerColor, // สีเขียวโปร่งใสถ้าเป็น pending
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: mapMode === 'preview' ? 'not-allowed' : displayMarker.isLocked ? 'not-allowed' : 'pointer',
                opacity: mapMode === 'preview' ? 1 : displayMarker.isLocked ? 0.7 : 1,
                filter: mapMode === 'preview' ? 'none' : displayMarker.isLocked ? 'grayscale(30%)' : 'none',
              }}
            >
              {/* Emergency Alert Animation - เฉพาะ marker สีแดงหรือสถานะฉุกเฉิน */}
              {isEmergencyMarker(displayMarker) && !isPending && (
                <>
                  {/* รัศมีแผ่ออกมา - ชั้นที่ 1 */}
                  <div
                    className="absolute rounded-full border border-red-400 animate-emergency-ripple-1"
                    style={{
                      width: `${sizeInPixels * 1.5}px`,
                      height: `${sizeInPixels * 1.5}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '1px',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />
                  {/* รัศมีแผ่ออกมา - ชั้นที่ 2 */}
                  <div
                    className="absolute rounded-full border border-red-300 animate-emergency-ripple-2"
                    style={{
                      width: `${sizeInPixels * 1.8}px`,
                      height: `${sizeInPixels * 1.8}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '1px',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />
                  {/* รัศมีแผ่ออกมา - ชั้นที่ 3 */}
                  <div
                    className="absolute rounded-full border border-red-200 animate-emergency-ripple-3"
                    style={{
                      width: `${sizeInPixels * 2.1}px`,
                      height: `${sizeInPixels * 2.1}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '1px',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />
                </>
              )}

              {/* Warning Alert Animation - เฉพาะ marker สีเหลืองหรือสถานะ warning */}
              {(displayMarker.color === 'yellow' || displayMarker.status === 'warning') && !isPending && (
                <>
                  {/* รัศมีแผ่ออกมา - ชั้นที่ 1 (ใหญ่) */}
                  <div
                    className="absolute rounded-full border border-yellow-400 animate-warning-ripple-1"
                    style={{
                      width: `${sizeInPixels * 1.5}px`,
                      height: `${sizeInPixels * 1.5}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '1px',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />
                  {/* รัศมีแผ่ออกมา - ชั้นที่ 2 (เล็ก) */}
                  <div
                    className="absolute rounded-full border border-yellow-300 animate-warning-ripple-2"
                    style={{
                      width: `${sizeInPixels * 1.8}px`,
                      height: `${sizeInPixels * 1.8}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderWidth: '1px',
                      pointerEvents: 'none',
                      zIndex: -1
                    }}
                  />
                </>
              )}
              {/* ไม่แสดงข้อความบน marker */}
            </div>

          </div>
          {/* Tooltip - ซ่อนเมื่อกำลังลาก marker */}
          {hoveredMarkerId === displayMarker.id && !isDragging && draggedMarker?.id !== displayMarker.id && (
            <>
              {/* Invisible bridge area เพื่อเพิ่มพื้นที่ hover */}
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto"
                style={{
                  width: '60px',
                  height: '20px',
                  zIndex: 9999
                }}
                onMouseEnter={() => {
                  setHoveredMarkerId(displayMarker.id);
                  // ส่ง unitHover เฉพาะ marker สีแดงและสีเหลืองในโหมด preview
                  if (mapMode === 'preview') {
                    // ตรวจสอบว่าเป็น marker สีแดงหรือสีเหลือง
                    if (displayMarker.color === 'red' || displayMarker.color === 'yellow' ||
                      displayMarker.status === 'emergency' || displayMarker.status === 'warning') {
                      setUnitHover(displayMarker.unitID || null);
                    }
                  }
                }}
                onMouseLeave={() => {
                  setHoveredMarkerId(null);
                  if (mapMode === 'preview') {
                    setUnitHover(null);
                  }
                }}
              />
              {createPortal(
                <div
                  className="fixed bg-[#002c55] bg-opacity-75 text-white text-xs rounded-md px-5 py-2 transition-opacity whitespace-nowrap pointer-events-auto shadow-lg shadow-blue-800/40"
                  style={{
                    zIndex: 999999,
                    left: `${(() => { const c = containerRef.current?.getBoundingClientRect(); return c ? c.left + (pixelX * zoomLevel) + panOffset.x : 0; })()}px`,
                    top: `${(() => { const c = containerRef.current?.getBoundingClientRect(); return c ? c.top + (pixelY * zoomLevel) + panOffset.y + 8 : 0; })()}px`,
                    transform: 'translate(-50%, calc(-100% - 20px))'
                  }}
                  onMouseEnter={() => {
                    isHoveringTooltipRef.current = true;
                    setHoveredMarkerId(displayMarker.id);
                    if (mapMode === 'preview') {
                      if (displayMarker.color === 'red' || displayMarker.color === 'yellow' || displayMarker.status === 'emergency' || displayMarker.status === 'warning') {
                        setUnitHover(displayMarker.unitID || null);
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    isHoveringTooltipRef.current = false;
                    setHoveredMarkerId(null);
                    if (mapMode === 'preview') {
                      setUnitHover(null);
                    }
                  }}
                >
                {/* ลูกศรชี้ลงมาที่ marker */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#002c55]"></div>
                <div className="font-semibold"> Room : {displayMarker.roomAddress || '-'}</div>
                <div className="font-semibold" onClick={()=>{
                  console.log(displayMarker,'displayMarker')
                }}>
                  Name:
                  <span className="ml-2">{displayMarker.addressData?.floor?.floorName || displayMarker.floorName || '-'}</span>
                </div>
                <div className="font-semibold" >Tel:
                  <span className="ml-2">
                    {
                      (displayMarker.addressData?.user?.contact ||
                        displayMarker.addressData?.user?.contact2 ||
                        displayMarker.addressData?.user?.contact3
                      )
                      || '-'
                    }
                  </span>
                </div>
                {/* <div> { JSON.stringify(displayMarker) } </div> */}
                <div className="flex space-x-1 mt-1 gap-2">
                  <button
                    disabled={!access('sos_security', 'edit')}
                    className={`text-blue-300 text-xs hover:text-white 
                    hover:cursor-pointer transition-colors
                    ${!access('sos_security', 'edit') ? 'opacity-50' : ''}`}

                    title={displayMarker.isLocked ? "Unlock Marker" : "Lock Marker"}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMarkerLock(displayMarker.id);
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {displayMarker.isLocked ? "🔒" : "🔓"}
                  </button>
                  {/* <button 
                      disabled={
                        !access('sos_security', 'delete') && 
                        !access('sos_security', 'edit')
                      }
                      className={`text-blue-300 text-xs hover:text-white 
                      hover:cursor-pointer transition-colors
                      ${
                        !access('sos_security', 'delete') && 
                        !access('sos_security', 'edit')
                        ? 'opacity-50'
                        : ''
                      }
                      `}
                    title="Reset Marker Position"
                    onMouseDown={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation();
                      // ไม่ปลดล็อก marker อื่นเมื่อกดปุ่มรีเซ็ตจาก tooltip
                      cancelMarkerEdit({ unlockAll: false });
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();   
                    }}
                  >
                    🔄
                  </button> */}
                  <button

                    disabled={
                      !access('sos_security', 'delete')
                    }
                    className={`text-red-300 text-xs hover:text-red-100 
                    hover:cursor-pointer transition-colors
                    ${!access('sos_security', 'delete') ? 'opacity-50' : ''}
                    `}
                    title="Delete Marker"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeMarker(displayMarker.id);
                      setHoveredMarkerId(null);
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <img src={TrashIcon} alt="Trash" className="w-4 h-4" />
                    {/* <TrashIcon color="#FFFFFF" className="w-3 h-3" /> */}
                  </button>
                </div>
              </div>, document.body)}
            </>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={marker.id}
          className={`rounded-full transition-all duration-200 flex items-center justify-center relative`}
          style={{
            width: `${sizeInPixels}px`,
            height: `${sizeInPixels}px`,
            backgroundColor: markerColor
          }}
        >
          {/* ไม่แสดงข้อความบน marker ใน list */}
        </div>
      );
    }
  };

  // เพิ่มฟังก์ชันคำนวณมุม
  const calculateAngle = (center: Position, point: Position) => {
    return Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI);
  };

  // อัพเดท JSX สำหรับแสดงกลุ่ม
  const renderZone = (zone: Zone) => {
    const isVisible = visibleZones[zone.id];

    if (!isVisible) {
      return null;
    }
    // ถ้ากำลังแก้ไขกลุ่มนี้ ให้ใช้ข้อมูลจาก editZoneData แทน
    const displayZone = editZoneData?.id === zone.id ? editZoneData : zone;
    const zoneColors = getZoneColors(displayZone.color);
    const isBeingDragged = draggedZone?.id === zone.id;
    const isSelected = selectedZones.includes(zone.id);
    const isClickedSingle = clickedZone?.id === zone.id;

    // กำหนดรูปทรง CSS ตาม shape
    const getShapeStyles = (shape: string) => {
      const colorMapping: Record<string, string> = {
        blue: "rgba(59, 130, 246, 0.3)",
        purple: "rgba(147, 51, 234, 0.3)",
        orange: "rgba(249, 115, 22, 0.3)",
        emerald: "rgba(16, 185, 129, 0.3)",
        rose: "rgba(244, 63, 94, 0.3)",
        cyan: "rgba(6, 182, 212, 0.3)",
        amber: "rgba(245, 158, 11, 0.3)"
      };

      // สีขอบที่ตรงกับสีของ zone
      const borderColorMapping: Record<string, string> = {
        blue: "#3B82F6",
        purple: "#9333EA",
        orange: "#F97316",
        emerald: "#10B981",
        rose: "#F43F5E",
        cyan: "#06B6D4",
        amber: "#F59E0B"
      };

      const currentBorderColor = isSelected
        ? "#3B82F6"
        : isClickedSingle
          ? "#EF4444"
          : borderColorMapping[displayZone.color] || borderColorMapping.blue;

      const borderWidth = "2px";
      const borderStyle = isSelected || isClickedSingle ? "solid" : "dashed";

      switch (shape) {
        case "circle":
          return {
            borderRadius: "50%",
            borderWidth: borderWidth,
            borderStyle: borderStyle,
            borderColor: currentBorderColor
          };
        case "triangle":
          return {
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            backgroundColor: colorMapping[displayZone.color] || colorMapping["blue"]
          };
        default:
          // rectangle
          return {
            borderWidth: borderWidth,
            borderStyle: borderStyle,
            borderColor: currentBorderColor
          };
      }
    };

    // สร้างจุดจับสำหรับปรับขนาด
    const resizeHandles = [
      { position: "nw", cursor: "nw-resize", style: { top: -5, left: -5 } },
      { position: "n", cursor: "n-resize", style: { top: -5, left: "50%", transform: "translateX(-50%)" } },
      { position: "ne", cursor: "ne-resize", style: { top: -5, right: -5 } },
      { position: "w", cursor: "w-resize", style: { top: "50%", left: -5, transform: "translateY(-50%)" } },
      { position: "e", cursor: "e-resize", style: { top: "50%", right: -5, transform: "translateY(-50%)" } },
      { position: "sw", cursor: "sw-resize", style: { bottom: -5, left: -5 } },
      { position: "s", cursor: "s-resize", style: { bottom: -5, left: "50%", transform: "translateX(-50%)" } },
      { position: "se", cursor: "se-resize", style: { bottom: -5, right: -5 } }
    ];

    // คำนวณตำแหน่งปุ่มหมุนที่ไม่ได้รับผลกระทบจากการหมุน zone
    const rotateButtonDistance =
      displayZone.shape === "triangle"
        ? zoomLevel >= 2
          ? Math.max(36, 48 / zoomLevel)
          : Math.max(48, Math.min(64, 54 * zoomLevel))
        : zoomLevel >= 2
          ? Math.max(24, 32 / zoomLevel)
          : Math.max(32, Math.min(48, 36 * zoomLevel));

    const rotateButtonSize = zoomLevel >= 2 ? Math.max(24, 32 / zoomLevel) : Math.max(28, Math.min(40, 32 * zoomLevel));
    const finalRotateButtonSize = Math.max(24, Math.min(40, rotateButtonSize));

    // ใช้ display size หารด้วย zoom เพื่อให้ responsive กับขนาดจอแต่ไม่ได้รับผลจาก zoom
    const imageElement = imageRef.current;

    if (!imageElement) {
      return null;
    }

    // ใช้ขนาด container หารด้วย zoomLevel เพื่อได้ขนาดฐาน (สอดคล้องกับ matrix transform)
    const imageRect = imageElement.getBoundingClientRect();
    const containerWidth = imageRect.width / zoomLevel;
    const containerHeight = imageRect.height / zoomLevel;

    // คำนวณตำแหน่งจริงสำหรับการแสดงผล (zone.x, zone.y เป็น % แล้ว)
    const pixelX = (zone.x / 100) * containerWidth;
    const pixelY = (zone.y / 100) * containerHeight;
    const pixelWidth = (Math.abs(zone.width) / 100) * containerWidth;
    const pixelHeight = (Math.abs(zone.height) / 100) * containerHeight;

    // คำนวณตำแหน่งปุ่มหมุนโดยไม่ให้หมุนตาม zone (อยู่ใน transform container)
    const zoneCenterX = pixelX + pixelWidth / 2;
    const zoneCenterY = pixelY + pixelHeight / 2;
    const rotateButtonX = zoneCenterX - finalRotateButtonSize / 2;
    const rotateButtonY = zoneCenterY - pixelHeight / 2 - rotateButtonDistance - finalRotateButtonSize / 2;

    return (
      <div key={zone.id} className="group">
        {/* Zone หลัก */}

        <div
          className={`absolute ${displayZone.shape !== "triangle" ? zoneColors.bgOpacity : "bg-transparent"} ${displayZone.shape !== "triangle" ? zoneColors.border : ""
            } 
            ${isBeingDragged || isDraggingZoneGroup ? "opacity-80" : "opacity-60"} 
            transition-opacity cursor-move
            ${isSelected && selectedZones.length > 1 ? "cursor-move" : ""}`}
          style={{
            left: zone.width < 0
              ? pixelX + pixelWidth
              : pixelX,
            top: zone.height < 0
              ? pixelY + pixelHeight
              : pixelY,
            width: pixelWidth,
            height: pixelHeight,
            zIndex: isBeingDragged || isDraggingZoneGroup ? 1000 : 5,
            transform: `rotate(${zone.rotation || 0}deg)`,
            transformOrigin: "center",
            pointerEvents: "auto", // เพิ่ม pointerEvents auto เพื่อให้คลิกได้แม้ parent จะเป็น pointer-events none
            ...getShapeStyles(displayZone.shape || "rectangle"),
            ...((isSelected || isClickedSingle) && {
              boxShadow: `0 0 0 2px ${isSelected ? "rgba(59, 130, 246, 0.7)" : "rgba(239, 68, 68, 0.7)"}`
            })
          }}
          onMouseDown={e => handleZoneMouseDown(e, zone)}
          onDoubleClick={e => handleZoneDoubleClick(e, zone)}
          onClick={e => {
            e.stopPropagation();
            // ถ้าไม่ได้กำลังลาก ให้เลือก zone นี้
            if (!isDraggingZone && !isResizingZone && !isRotatingZone) {
              setClickedZone(zone);
              setClickedMarker(null);
              // ล้างการเลือกแบบกลุ่ม
              setSelectedMarkers([]);
              setSelectedZones([]);
            }
          }}
        >
          <div
            className={`absolute rounded font-medium ${displayZone.shape === "triangle"
              ? "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              : displayZone.shape === "circle"
                ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                : "top-1 left-1"
              }`}
            style={{
              fontSize: (() => {
                const zoneSize = Math.min(pixelWidth, pixelHeight);
                const baseFontSize = Math.max(6, Math.min(18, zoneSize / 6));
                return `${Math.max(6, Math.min(baseFontSize, 16))}px`;
              })(),
              padding: (() => {
                const zoneSize = Math.min(pixelWidth, pixelHeight);
                if (zoneSize < 40) return "0px 1px";
                if (zoneSize < 80) return "1px 2px";
                if (zoneSize < 120) return "2px 4px";
                return "4px 8px";
              })(),
              display: Math.min(pixelWidth, pixelHeight) < 25 ? "none" : "block",
              maxWidth: `${Math.max(0, pixelWidth - 8)}px`,
              maxHeight: `${Math.max(0, pixelHeight - 8)}px`,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              backgroundColor: (() => {
                const colorMapping: Record<string, string> = {
                  blue: "rgba(59, 130, 246, 0.9)",
                  purple: "rgba(147, 51, 234, 0.9)",
                  orange: "rgba(249, 115, 22, 0.9)",
                  emerald: "rgba(16, 185, 129, 0.9)",
                  rose: "rgba(244, 63, 94, 0.9)",
                  cyan: "rgba(6, 182, 212, 0.9)",
                  amber: "rgba(245, 158, 11, 0.9)"
                };
                return colorMapping[displayZone.color] || colorMapping["blue"];
              })(),
              color: "white",
              textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
              lineHeight: "1.2"
            }}
            title={displayZone.name}
          >
            {displayZone.name}
          </div>

          {/* เส้นขอบสำหรับสามเหลี่ยม */}
          {displayZone.shape === "triangle" && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                width: "100%",
                height: "100%"
              }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon
                points="50,0 0,100 100,100"
                fill={(() => {
                  const colorMapping: Record<string, string> = {
                    blue: "rgba(59, 130, 246, 0.3)",
                    purple: "rgba(147, 51, 234, 0.3)",
                    orange: "rgba(249, 115, 22, 0.3)",
                    emerald: "rgba(16, 185, 129, 0.3)",
                    rose: "rgba(244, 63, 94, 0.3)",
                    cyan: "rgba(6, 182, 212, 0.3)",
                    amber: "rgba(245, 158, 11, 0.3)"
                  };
                  return colorMapping[displayZone.color] || colorMapping["blue"];
                })()}
                stroke={
                  isSelected
                    ? "#3B82F6"
                    : isClickedSingle
                      ? "#EF4444"
                      : (() => {
                        const strokeColorMapping: Record<string, string> = {
                          blue: "#3B82F6",
                          purple: "#9333EA",
                          orange: "#F97316",
                          emerald: "#10B981",
                          rose: "#F43F5E",
                          cyan: "#06B6D4",
                          amber: "#F59E0B"
                        };
                        return strokeColorMapping[displayZone.color] || "#3B82F6";
                      })()
                }
                strokeWidth="2"
                strokeDasharray={isSelected || isClickedSingle ? "0" : "4,2"}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}

          {/* จุดจับสำหรับปรับขนาด */}
          {resizeHandles.map(handle => {
            // คำนวณขนาดจุดจับที่เหมาะสม - ใช้ขนาดจริงของ zone
            const zoneDisplaySize = Math.max(pixelWidth, pixelHeight);
            let handleSize;

            if (zoomLevel >= 2) {
              // เมื่อ zoom มาก ให้จุดจับมีขนาดคงที่เพื่อให้คลิกได้ง่าย
              handleSize = Math.max(16, Math.min(20, zoneDisplaySize / 10));
            } else {
              // zoom ปกติ
              handleSize = zoneDisplaySize > 200 ? 20 : Math.max(12, 16 * zoomLevel);
            }

            handleSize = Math.max(12, Math.min(24, handleSize)); // จำกัดขนาดขั้นต่ำและสูงสุด
            const handleOffset = handleSize / 2;

            return (
              <div
                key={handle.position}
                className={`absolute bg-white rounded-full 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl ring-1 ring-gray-300`}
                style={{
                  ...handle.style,
                  // ปรับตำแหน่งให้ถูกต้องตามขนาดจุดจับ
                  ...(handle.style.top === -5 && { top: -handleOffset }),
                  ...(handle.style.bottom === -5 && { bottom: -handleOffset }),
                  ...(handle.style.left === -5 && { left: -handleOffset }),
                  ...(handle.style.right === -5 && { right: -handleOffset }),
                  width: `${handleSize}px`,
                  height: `${handleSize}px`,
                  cursor: handle.cursor,
                  zIndex: 1001,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px white",
                  borderWidth: "3px",
                  borderStyle: "solid",
                  borderColor: isSelected ? "#3B82F6" : isClickedSingle ? "#EF4444" : "#D1D5DB"
                }}
                onMouseDown={e => handleZoneMouseDown(e, zone, handle.position)}
              />
            );
          })}
        </div>

        {/* ปุ่มหมุนแยกต่างหาก - ไม่ได้รับผลกระทบจากการหมุน zone */}
        <div
          key={`${zone.id}-rotate`}
          className={`absolute bg-white rounded-full shadow-xl border-2 border-gray-300 flex items-center justify-center cursor-pointer transition-opacity duration-200
            opacity-0 group-hover:opacity-100`}
          style={{
            left: rotateButtonX,
            top: rotateButtonY,
            width: `${finalRotateButtonSize}px`,
            height: `${finalRotateButtonSize}px`,
            zIndex: 1002, // สูงกว่า resize handles
            pointerEvents: "auto",
            background: "linear-gradient(180deg, #fff 80%, #e0e7ef 100%)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 2px white"
          }}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
            handleZoneMouseDown(e, zone, "rotate");
          }}
          title="Rotate Area"
        >
          <svg
            className="text-gray-600"
            style={{
              width: `${Math.max(14, Math.min(20, finalRotateButtonSize * 0.6))}px`,
              height: `${Math.max(14, Math.min(20, finalRotateButtonSize * 0.6))}px`
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>
    );
  };

  // จัดการ double click ที่กลุ่ม
  const handleZoneDoubleClick = (e: React.MouseEvent, zone: Zone) => {
    e.preventDefault();
    e.stopPropagation();

    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้แก้ไข zone
    if (mapMode === 'preview') {
      return;
    }

    // ปิด form อื่นๆ ก่อนเปิด edit zone modal
    setShowPopup(false);
    setShowZoneModal(false);
    setShowEditMarkerModal(false);
    setCurrentSelection(null);
    setFormData({ name: "", group: "", color: "red" });
    setZoneFormData({ name: "", color: "blue" });
    setEditMarkerData(null);
    setOriginalMarkerData(null);

    setOriginalZoneData({ ...zone }); // เก็บข้อมูลเดิมไว้
    setEditZoneData({ ...zone });
    setShowEditZoneModal(true);

    // เรียก callback เมื่อเริ่มแก้ไข zone
    if (onZoneEditStarted) {
      onZoneEditStarted();
    }
  };

  // บันทึกการแก้ไขกลุ่ม
  const handleEditZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้แก้ไข zone
    if (mapMode === 'preview') {
      return;
    }

    if (editZoneData && originalZoneData) {
      // บันทึกประวัติการแก้ไขกลุ่ม
      addToHistory(ACTION_TYPES.EDIT_ZONE, {
        id: editZoneData.id,
        previous: originalZoneData,
        current: editZoneData
      });

      setZones(prevZones =>
        prevZones.map(zone =>
          zone.id === editZoneData.id ? { ...zone, name: editZoneData.name, color: editZoneData.color } : zone
        )
      );
      setShowEditZoneModal(false);
      setEditZoneData(null);
      setOriginalZoneData(null);

      // อัพเดทกลุ่มของ markers หลังจากแก้ไข zone (อัพเดทชื่อกลุ่ม)
      setTimeout(() => {
        updateMarkersGroup();
      }, 50);

      // เรียก callback เมื่อแก้ไข zone สำเร็จ
      if (onZoneEdited) {
        onZoneEdited();
      }
    }
  };



  // useEffect สำหรับจัดการข้อมูลจาก props dataMapAll
  useEffect(() => {
    const loadMarkersWithAddressData = async () => {
      if (dataMapAll && dataMapAll.planImg) {
        setUploadedImage(dataMapAll.planImg);
        setHasImageData(true);

        // แปลงข้อมูล markers จาก dataMapAll
        const fetchedMarkers: any[] = [];
        const fetchedZones: any[] = [];

        // Process zones first
        (dataMapAll.zone || []).forEach((item: any, index: number) => {
          const rotation = item.rotationDegrees ? parseFloat(item.rotationDegrees.replace('°', '')) : 0;
          fetchedZones.push({
            id: item.id || `zone-${index + 1}`,
            name: item.name || `zone-${index + 1}`,
            x: parseFloat(item.position?.x || 0),
            y: parseFloat(item.position?.y || 0),
            width: parseFloat(item.position?.width || 50),
            height: parseFloat(item.position?.height || 50),
            color: item.color || 'blue',
            shape: item.shape || 'rectangle',
            rotation: rotation,
            originalX: parseFloat(item.position?.x || 0),
            originalY: parseFloat(item.position?.y || 0),
            originalWidth: parseFloat(item.position?.width || 50),
            originalHeight: parseFloat(item.position?.height || 50),
            originalRotation: rotation,
            status: item.status || 'normal',
            isDefault: false
          });
        });

        // Process markers with address data
        const markersWithAddressPromises = (dataMapAll?.marker || [])?.map(async (item: any, index: number) => {

          const baseMarker = {
            id: item.id || index + 1,
            name: item.markerInfo.name || `marker-const markersWithAddressPromises = (dataMapAll.marker || []${index + 1}`,
            x: parseFloat(item.markerInfo.position?.x || 0),
            y: parseFloat(item.markerInfo.position?.y || 0),
            originalX: parseFloat(item.markerInfo.position?.x || 0),
            originalY: parseFloat(item.markerInfo.position?.y || 0),
            group: item.markerInfo.group || "Marker",
            color: item.status === 'emergency' ? 'red' :
              item.status === 'warning' ? 'yellow' : 'green',
            rotationDegrees: item.markerInfo.rotationDegrees || "0°",
            size: item.markerInfo.size || 2,
            status: item.status || 'normal',
            address: item?.address || "",
            tel1: item.tel1 || "",
            tel2: item.tel2 || "",
            tel3: item.tel3 || "",
            unitID: item.unitId ?? item.unitID ?? null,
            roomAddress: item.roomAddress,
            unitNo: item.unitNo,
            addressData: null,
            isLocked: true,
            floorName: item.floorName || "",
            display:item
          };

          // ถ้ามี unitId/unitID ให้เรียก getAddress
          const unitIdToFetch = item.unitID ?? item.unitId ?? baseMarker.unitID;
          if (unitIdToFetch) {
            try {
              const addressResult = await getAddress(Number(unitIdToFetch));
              if (addressResult && addressResult.status) {
                baseMarker.addressData = addressResult.result;

                // ตั้งค่า roomAddress, unitNo และ name จาก API
                baseMarker.roomAddress = addressResult.result.roomAddress || "";
                baseMarker.unitNo = addressResult.result.unitNo || "";
                baseMarker.floorName = addressResult.result?.floor?.floorName || baseMarker.floorName || "";
                if (addressResult.result?.floor?.floorName) {
                  baseMarker.name = addressResult.result.floor.floorName;
                } else if (addressResult.result?.user?.givenName) {
                  baseMarker.name = addressResult.result.user.givenName;
                }

              }
            } catch (error) {
              console.error(`❌ Error fetching address for unitID ${unitIdToFetch}:`, error);
            }
          }

          return baseMarker;
        });

        // รอให้ทั้งหมดเสร็จ
        const markersWithAddress = await Promise.all(markersWithAddressPromises);

        setMarkers(markersWithAddress);
        setZones(fetchedZones);
      } else if (propUploadedImage) {
        // fallback ถ้าไม่มี dataMapAll แต่มี propUploadedImage
        setUploadedImage(propUploadedImage);
        setHasImageData(true);
      } else {
        setHasImageData(false);
      }


    };

    (async () => {
      await loadMarkersWithAddressData();

      const waitForImageReady = () => new Promise<void>((resolve) => {
        const img = imageRef.current;
        if (!img) return resolve();
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      await waitForImageReady();

      setIsLoading(false);

      const refresh = () => {
        setMarkers(prev => [...prev]);
        setZones(prev => [...prev]);
        setForceRenderKey(prev => prev + 1);
      };
      setTimeout(refresh, 0);
      setTimeout(refresh, 150);
      setTimeout(refresh, 350);
    })();
  }, [dataMapAll, propUploadedImage]);

  // เพิ่ม useEffect สำหรับ sync emergency data กับ map markers
  useEffect(() => {
    if (!setDataEmergency || !dataMapAll) return;
    // ดึงข้อมูล emergency/warning จาก dataMapAll
    const emergencyMarkers = (dataMapAll.marker || []).filter((item: any) =>
      item.status === 'emergency' || item.status === 'warning'
    );
    if (emergencyMarkers.length > 0) {
      // อัพเดท markers ที่มี emergency/warning status
      setMarkers(prevMarkers => {
        const updatedMarkers = prevMarkers.map(marker => {
          const emergencyData = emergencyMarkers.find((em: any) =>
            em.unitID === marker.unitID && em.unitID !== null
          );

          if (emergencyData) {
            return {
              ...marker,
              color: emergencyData.status === 'emergency' ? 'red' : 'yellow',
              status: emergencyData.status
            } as any;
          }
          return marker;
        });

        return updatedMarkers;
      });
    }
  }, [dataMapAll, setDataEmergency]);

  // useEffect สำหรับ component initialization
  useEffect(() => {

    const initializeComponent = async () => {
      try {
        // รอให้ component ถูก mount และ state เริ่มต้นถูกตั้งค่า
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 10)),
          new Promise<void>(resolve => {
            if (imageRef.current) {
              if (imageRef.current.complete) {
                resolve();
              } else {
                imageRef.current.onload = () => resolve();
              }
            } else {
              resolve();
            }
          })
        ]);
        // เรียก resetZoomAndPan หลังจาก component พร้อม (เฉพาะกรณี Condo)
        if (onImageClick) {
          resetZoomAndPan();
        }

      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดใน Component initialization:", error);
      }
    }

    if (!isLoading) {
      initializeComponent();
    }
  }, [isLoading]);

  // Debug useEffect เพื่อติดตาม state changes

  // เพิ่ม useEffect เพื่อบังคับ reset หลังจาก component mount เสร็จสิ้น
  useEffect(() => {
    // รอ component mount เสร็จสิ้นแล้วค่อย reset เพื่อให้ปุ่มบ้านทำงานทันที
    if (!isLoading) {
      const timer = setTimeout(() => {
        onImageClick ? resetZoomAndPan() : resetZoomAndPanVillage();
      }, 100); // รอ 100ms เพื่อให้ component เสถียร

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // เพิ่ม useEffect เพื่อบังคับ panOffset เป็น 0 เมื่อ zoom จาก level 1
  useEffect(() => {
    // ถ้า zoom เปลี่ยนจาก 1 เป็นค่าอื่น และ panOffset ไม่ใช่ 0
    // ให้ force panOffset เป็น 0 เพื่อป้องกัน marker เคลื่อนที่
    if (zoomLevel > 1 && zoomLevel < 1.2 && (panOffset.x !== 0 || panOffset.y !== 0)) {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel, panOffset]);

  // เพิ่ม ResizeObserver เพื่อจับการเปลี่ยนข้อมูลของ container และ image
  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (!container || !image) return;

    const resizeObserver = new ResizeObserver(() => {
      // Force re-render เมื่อขนาดเปลี่ยน เพื่อให้ marker คำนวณตำแหน่งใหม่ตาม offset ของรูปภาพ
      setMarkers(prevMarkers => [...prevMarkers]);
      setZones(prevZones => [...prevZones]);

      // ปิดการรีเซ็ต zoom/pan เมื่อ resize เพื่อรักษาระดับซูมหลังสร้าง marker
      // setZoomLevel(1);
      // setPanOffset({ x: 0, y: 0 });
    });

    resizeObserver.observe(container);
    resizeObserver.observe(image);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // เพิ่ม event listener สำหรับ window resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render เมื่อขนาดหน้าจอเปลี่ยน เพื่อให้ marker คำนวณตำแหน่งใหม่
      setMarkers(prevMarkers => [...prevMarkers]);
      setZones(prevZones => [...prevZones]);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // รีเฟรชตำแหน่ง marker ระหว่างการเลื่อนแถบเมนู (แฮมเบอร์เกอร์)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const forceRefresh = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setMarkers(prev => [...prev]);
        setZones(prev => [...prev]);
      });
    };

    const onTransition = (e: Event) => {
      const target = e.target as Element;
      if (!target) return;
      if (
        target === container ||
        container.contains(target) ||
        (container.parentElement && (target === container.parentElement || target.contains(container.parentElement)))
      ) {
        forceRefresh();
      }
    };

    window.addEventListener('transitionrun', onTransition);
    window.addEventListener('transitionstart', onTransition);
    window.addEventListener('transitionend', onTransition);

    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'style')) {
          forceRefresh();
          break;
        }
      }
    });

    if (container.parentElement) {
      mo.observe(container.parentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    return () => {
      window.removeEventListener('transitionrun', onTransition);
      window.removeEventListener('transitionstart', onTransition);
      window.removeEventListener('transitionend', onTransition);
      mo.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  // เพิ่ม useEffect สำหรับการยกเลิก filter เมื่อ click นอกพื้นที่ในโหมด preview
  useEffect(() => {
    const handleClickOutsideForPreview = (event: Event) => {
      const currentClickedMarker = clickedMarkerRef.current;
      if (mapMode === 'preview' && currentClickedMarker && setUnitClick) {
        const target = event.target as Element;
        const containerElement = containerRef.current;

        // ตรวจสอบว่า click นอกพื้นที่ map และไม่ใช่ในส่วน FormWarningSOS
        if (containerElement && !containerElement.contains(target) &&
          !target.closest('.form-warning-sos')) {
          setClickedMarker(null);
          // ในโหมด preview ไม่ต้องเปลี่ยน hasActiveMarker เพื่อไม่รบกวนการส่งสถานะ
          setUnitClick(null);
        }
      }
    };

    if (mapMode === 'preview' && clickedMarkerRef.current) {
      document.addEventListener('mousedown', handleClickOutsideForPreview);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideForPreview);
    };
  }, [mapMode, setUnitClick]);

  // เพิ่ม state สำหรับติดตามการประมวลผล query string
  const [hasProcessedQueryString, setHasProcessedQueryString] = useState(false);

  // เพิ่ม useEffect เพื่อตรวจสอบ query string และ unlock + active marker ตาม unitId (ทำงานครั้งเดียวพอ)
  useEffect(() => {
    // ทำงานเฉพาะเมื่อ markers โหลดเสร็จแล้ว, ไม่อยู่ใน loading state, และยังไม่ได้ประมวลผล query string
    if (markers.length > 0 && !isLoading && !hasProcessedQueryString) {
      const urlParams = new URLSearchParams(window.location.search);
      const unitIdFromQuery = urlParams.get('unitId');

      if (unitIdFromQuery) {
        const targetUnitId = parseInt(unitIdFromQuery);
        // หา marker ที่มี unitID ตรงกัน
        const targetMarker = markers.find(marker =>
          marker.unitID === targetUnitId
        );
        if (targetMarker) {
          // ถ้า marker ยัง locked อยู่ ให้ unlock มัน
          if (targetMarker.isLocked) {
            let dataMarker = [...markers]
            setTimeout(async () => {
              await toggleMarkerLock(targetMarker.id);
            }, 600);

          }
          else {
            // ถ้า unlock แล้ว ให้ active โดยตรง
            setClickedMarker({ ...targetMarker, isLocked: false });
            if (mapMode === 'work-it') {
              setHasActiveMarker(true);
            }
            updateLatLngDisplay(targetMarker.x, targetMarker.y, targetMarker);

            if (onMarkerSelect) {
              onMarkerSelect({ ...targetMarker, isLocked: false }, false);
            }

            if (mapMode === 'preview' && setUnitClick) {
              setUnitClick(targetMarker.unitID || null);
            }
          }
        }
      }
      setHasProcessedQueryString(true);
    }


  }, [markers, hasProcessedQueryString]);

  // เพิ่ม useEffect เพื่อจัดการเมื่อเปลี่ยนโหมด
  useEffect(() => {
    const currentClickedMarker = clickedMarkerRef.current;
    // เมื่อเปลี่ยนไป preview mode จาก work-it
    if (mapMode === 'preview') {
      // ถ้ามี marker ที่กำลังถูกแก้ไข (active + dragged) ให้ cancel และคืนตำแหน่งเดิม
      if (currentClickedMarker && (draggedMarker || isDragging)) {
        // คืนตำแหน่งเดิมของ marker ที่ถูกลาก
        if (originalMarkerPosition && draggedMarker) {
    setMarkers(prevMarkers =>
      prevMarkers.map(marker => {
        if (marker.id === draggedMarker.id) {
                return { ...marker, x: originalMarkerPosition.x, y: originalMarkerPosition.y };
              }
              return marker;
            })
          );
        }
        // ล้าง drag state
        setDraggedMarker(null);
        setIsDragging(false);
        setOriginalMarkerPosition(null);
      }

      // ล้าง clicked marker selection สำหรับโหมด preview
      if (currentClickedMarker) {
        setClickedMarker(null);
        // ไม่ต้องเปลี่ยน hasActiveMarker เมื่อเปลี่ยนไปโหมด preview
        if (setUnitClick) {
          setUnitClick(null);
        }
      }
    }

    // เมื่อเปลี่ยนไป work-it mode จาก preview - ล้าง unit filter เท่านั้น
    if (mapMode === 'work-it') {
      if (setUnitClick) {
        setUnitClick(null);
      }
      // ไม่ล้าง clickedMarker ในโหมด work-it เพื่อให้ขอบสีแดงยังคงอยู่
    }
  }, [mapMode, draggedMarker, isDragging, originalMarkerPosition]);

  // เพิ่มฟังก์ชันยกเลิกการเลือก
  const clearSelection = () => {
    setSelectedMarkers([]);
    setSelectedZones([]);
    setClickedMarker(null);
    setClickedZone(null);
    setHasActiveMarker(false);
    setIsGroupSelecting(false);
    setGroupSelectionStart(null);
    setGroupSelectionEnd(null);
    setJustFinishedGroupSelection(false);
    setDragReference(null);

    // Unlock markers ทั้งหมดเมื่อ clear selection
    unlockAllMarkers();
  };

  // เพิ่มฟังก์ชันตรวจสอบว่า marker อยู่ในพื้นที่เลือกหรือไม่
  const isMarkerInSelection = (marker: Marker, selectionStart: Position, selectionEnd: Position) => {
    // แปลง pixel coordinates เป็น percentage coordinates สำหรับการเปรียบเทียบ
    const imageElement = imageRef.current;
    if (!imageElement) return false;

    const imageRect = imageElement.getBoundingClientRect();
    const baseWidth = imageRect.width / zoomLevel;
    const baseHeight = imageRect.height / zoomLevel;

    // แปลง selection coordinates เป็น percentage
    const startXPercent = (selectionStart.x / baseWidth) * 100;
    const startYPercent = (selectionStart.y / baseHeight) * 100;
    const endXPercent = (selectionEnd.x / baseWidth) * 100;
    const endYPercent = (selectionEnd.y / baseHeight) * 100;

    const minX = Math.min(startXPercent, endXPercent);
    const maxX = Math.max(startXPercent, endXPercent);
    const minY = Math.min(startYPercent, endYPercent);
    const maxY = Math.max(startYPercent, endYPercent);

    return marker.x >= minX && marker.x <= maxX && marker.y >= minY && marker.y <= maxY;
  };

  // เพิ่มฟังก์ชันตรวจสอบว่า zone อยู่ในพื้นที่เลือกหรือไม่
  const isZoneInSelection = (zone: Zone, selectionStart: Position, selectionEnd: Position) => {
    // แปลง pixel coordinates เป็น percentage coordinates สำหรับการเปรียบเทียบ
    const imageElement = imageRef.current;
    if (!imageElement) return false;

    const imageRect = imageElement.getBoundingClientRect();
    const baseWidth = imageRect.width / zoomLevel;
    const baseHeight = imageRect.height / zoomLevel;

    // แปลง selection coordinates เป็น percentage
    const startXPercent = (selectionStart.x / baseWidth) * 100;
    const startYPercent = (selectionStart.y / baseHeight) * 100;
    const endXPercent = (selectionEnd.x / baseWidth) * 100;
    const endYPercent = (selectionEnd.y / baseHeight) * 100;

    const minX = Math.min(startXPercent, endXPercent);
    const maxX = Math.max(startXPercent, endXPercent);
    const minY = Math.min(startYPercent, endYPercent);
    const maxY = Math.max(startYPercent, endYPercent);

    // ตรวจสอบว่าจุดกึ่งกลางของ zone อยู่ในพื้นที่เลือกหรือไม่
    const zoneCenterX = zone.x + zone.width / 2;
    const zoneCenterY = zone.y + zone.height / 2;

    return zoneCenterX >= minX && zoneCenterX <= maxX && zoneCenterY >= minY && zoneCenterY <= maxY;
  };

  // เพิ่มฟังก์ชันจัดการ zoom ที่สอดคล้องกับ CSS matrix transform
  const handleWheel = (e: any) => {
    // ตรวจสอบว่ากด Ctrl หรือ Cmd หรือไม่
    if (!e.ctrlKey && !e.metaKey) {
      // ถ้าไม่กด Ctrl ให้ปล่อยให้ scroll ปกติ
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    // ใช้ ref เพื่อให้ได้ค่าล่าสุดของ zoomLevel
    const currentZoom = zoomLevelRef.current;
    const newZoom = Math.max(0.5, Math.min(3, currentZoom + delta));

    if (newZoom !== currentZoom) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // คำนวณตำแหน่งเมาส์ใน container
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // สำหรับ CSS matrix transform
      // matrix(scaleX, 0, 0, scaleY, translateX, translateY)
      // จุดที่เมาส์ชี้ต้องอยู่ที่เดิมหลัง zoom

      const currentPanOffset = panOffsetRef.current;

      // คำนวณจุดใน coordinate space ของ image (ก่อน transform)
      const imagePointX = (mouseX - currentPanOffset.x) / currentZoom;
      const imagePointY = (mouseY - currentPanOffset.y) / currentZoom;

      // คำนวณ pan offset ใหม่เพื่อให้จุดเดิมยังอยู่ที่เมาส์ชี้
      const newPanX = mouseX - imagePointX * newZoom;
      const newPanY = mouseY - imagePointY * newZoom;
      // อัพเดท refs ทันที
      zoomLevelRef.current = newZoom;
      panOffsetRef.current = { x: newPanX, y: newPanY };

      // อัพเดท state สำหรับ UI
      setZoomLevel(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    }
  };

  // เพิ่มฟังก์ชันป้องกันการ scroll ของหน้า page
  const preventPageScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ฟังก์ชันรีเซ็ต zoom และ pan สำหรับฝั่ง Village (ไม่ปิด form)
  const resetZoomAndPanVillage = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    // อัพเดท refs ทันทีเพื่อป้องกันการคำนวณที่ผิดพลาด
    zoomLevelRef.current = 1;
    panOffsetRef.current = { x: 0, y: 0 };

    // บังคับ re-render เพื่อให้ marker และ zone แสดงผลถูกต้องทันที
    setForceRenderKey(prev => prev + 1);

    // Force re-render อีกครั้งใน next tick เพื่อให้แน่ใจ
    setTimeout(() => {
      setForceRenderKey(prev => prev + 1);
    }, 10);

  };

  // ฟังก์ชัน Zoom In
  const zoomIn = () => {
    const currentZoom = zoomLevelRef.current;
    const newZoom = Math.min(3, currentZoom + 0.2); // เพิ่ม 20% ต่อครั้ง, สูงสุด 3x

    if (newZoom !== currentZoom) {
      // อัพเดท refs ทันที
      zoomLevelRef.current = newZoom;

      // อัพเดท state สำหรับ UI
      setZoomLevel(newZoom);

      // Force re-render หลังจาก zoom เพื่อให้ marker และ zone แสดงผลถูกต้อง
      setTimeout(() => {
        setForceRenderKey(prev => prev + 1);
      }, 100);
    }
  };

  // ฟังก์ชัน Zoom Out
  const zoomOut = () => {
    const currentZoom = zoomLevelRef.current;
    const newZoom = Math.max(0.5, currentZoom - 0.2); // ลด 20% ต่อครั้ง, ต่ำสุด 0.5x

    if (newZoom !== currentZoom) {
      // อัพเดท refs ทันที
      zoomLevelRef.current = newZoom;

      // อัพเดท state สำหรับ UI
      setZoomLevel(newZoom);

      // Force re-render หลังจาก zoom เพื่อให้ marker และ zone แสดงผลถูกต้อง
      setTimeout(() => {
        setForceRenderKey(prev => prev + 1);
      }, 100);
    }
  };

  // ฟังก์ชันรีเซ็ต zoom และ pan สำหรับฝั่ง Condo (เรียก onImageClick)
  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    // อัพเดท refs ทันทีเพื่อป้องกันการคำนวณที่ผิดพลาด
    zoomLevelRef.current = 1;
    panOffsetRef.current = { x: 0, y: 0 };

    // บังคับ re-render เพื่อให้ marker และ zone แสดงผลถูกต้องทันที
    setForceRenderKey(prev => prev + 1);

    // Force re-render อีกครั้งใน next tick เพื่อให้แน่ใจ
    setTimeout(() => {
      setForceRenderKey(prev => prev + 1);
    }, 10);
    // สำหรับฝั่ง Condo: เรียก onImageClick เพื่อรีเซ็ต state
    if (onImageClick) {
      onImageClick();
    }
  };

  // ฟังก์ชัน copy zones ที่เลือก
  const copySelectedZones = () => {
    if (selectedZones.length === 0) return;

    const zonesToCopy = zones.filter(zone => selectedZones.includes(zone.id));
    setCopiedZones(zonesToCopy);
  };

  // ฟังก์ชัน paste zones
  const pasteZones = () => {
    if (copiedZones.length === 0) return;

    const newZones = copiedZones.map(originalZone => {
      const newZone = {
        ...originalZone,
        id: Date.now() + Math.random(), // สร้าง id ใหม่
        name: `${originalZone.name} (Copy)`, // เพิ่ม (Copy) ในชื่อ
        // เลื่อนตำแหน่งเล็กน้อยเพื่อไม่ให้ซ้อนทับกัน
        x: originalZone.x + 20,
        y: originalZone.y + 20,
        originalX: originalZone.x + 20,
        originalY: originalZone.y + 20
      };
      return newZone;
    });

    // เพิ่ม zones ใหม่
    setZones(prevZones => [...prevZones, ...newZones]);

    // บันทึกประวัติสำหรับแต่ละ zone ที่สร้าง
    newZones.forEach(zone => {
      addToHistory(ACTION_TYPES.ADD_ZONE, zone);
    });

    // ตั้งค่าการมองเห็นสำหรับ zones ใหม่
    const newVisibleZones: VisibleZones = {};
    newZones.forEach(zone => {
      newVisibleZones[zone.id] = true;
    });
    setVisibleZones(prev => ({ ...prev, ...newVisibleZones }));

    // เลือก zones ใหม่ที่เพิ่งวาง
    setSelectedZones(newZones.map(zone => zone.id));
    setSelectedMarkers([]); // ล้างการเลือก markers
  };

  // ฟังก์ชัน copy markers ที่เลือก
  const copySelectedMarkers = () => {
    if (selectedMarkers.length === 0) return;
    const markersToCopy = markers.filter(marker => selectedMarkers.includes(marker.id));
    setCopiedMarkers(markersToCopy);
  };

  // ฟังก์ชัน paste markers
  const pasteMarkers = () => {
    if (copiedMarkers.length === 0) return;

    const newMarkers = copiedMarkers.map(originalMarker => {
      const newMarker = {
        ...originalMarker,
        id: Date.now() + Math.random(), // สร้าง id ใหม่
        name: `${originalMarker.name} (Copy)`, // เพิ่ม (Copy) ในชื่อ
        // เลื่อนตำแหน่งเล็กน้อยเพื่อไม่ให้ซ้อนทับกัน
        x: originalMarker.x + 20,
        y: originalMarker.y + 20,
        originalX: originalMarker.x + 20,
        originalY: originalMarker.y + 20
      };
      return newMarker;
    });

    // เพิ่ม markers ใหม่
    setMarkers(prevMarkers => [...prevMarkers, ...newMarkers]);

    // บันทึกประวัติสำหรับแต่ละ marker ที่สร้าง
    newMarkers.forEach(marker => {
      addToHistory(ACTION_TYPES.ADD_MARKER, marker);
    });
    // เลือก markers ใหม่ที่เพิ่งวาง
    setSelectedMarkers(newMarkers.map(marker => marker.id));
    setSelectedZones([]); // ล้างการเลือก zones
  };

  // ฟังก์ชัน helper สำหรับแสดง confirm dialog
  const showDeleteConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    ConfirmModal({
      title,
      message,
      okMessage: "Delete",
      cancelMessage: "Cancel",
      onOk: onConfirm,
      onCancel: () => { }
    });
  };

  // ฟังก์ชันลบ objects ที่เลือก (แบบมี confirm)
  const deleteSelectedObjects = async () => {
    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้ลบ objects
    if (mapMode === 'preview') {
      return;
    }

    const deletedMarkers: Marker[] = [];
    const deletedZones: Zone[] = [];

    // เช็คว่าจะลบอะไรบ้าง
    if (clickedMarker) {
      deletedMarkers.push(clickedMarker);
    }
    if (clickedZone) {
      deletedZones.push(clickedZone);
    }
    if (selectedMarkers.length > 0) {
      const markersToDelete = markers.filter(marker => selectedMarkers.includes(marker.id));
      deletedMarkers.push(...markersToDelete);
    }
    if (selectedZones.length > 0) {
      const zonesToDelete = zones.filter(zone => selectedZones.includes(zone.id));
      deletedZones.push(...zonesToDelete);
    }

    // สร้างข้อความแจ้งเตือน
    const deletedItems: string[] = [];
    if (deletedMarkers.length > 0) deletedItems.push(`${deletedMarkers.length} markers`);
    if (deletedZones.length > 0) deletedItems.push(`${deletedZones.length} zones`);

    if (deletedItems.length === 0) return;

    const title = "Confirm Deletion";
    const message = `Do you want to delete ${deletedItems.join(" and ")}?\n\nThis action cannot be undone.`;


    showDeleteConfirmation(title, message, async () => {
      let deletedCount = 0;
      let hasDeletedMarker = false;

      // ลบ marker ที่คลิกเดี่ยว
      if (clickedMarker) {
        setMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== clickedMarker.id));
        addToHistory(ACTION_TYPES.REMOVE_MARKER, clickedMarker);
        deletedCount += 1;
        hasDeletedMarker = true;
      }

      // ลบ zone ที่คลิกเดี่ยว
      if (clickedZone) {
        setZones(prevZones => prevZones.filter(zone => zone.id !== clickedZone.id));
        addToHistory(ACTION_TYPES.REMOVE_ZONE, clickedZone);
        deletedCount += 1;
      }

      // ลบ markers ที่เลือกแบบกลุ่ม
      if (selectedMarkers.length > 0) {
        const markersToDelete = markers.filter(marker => selectedMarkers.includes(marker.id));
        setMarkers(prevMarkers => prevMarkers.filter(marker => !selectedMarkers.includes(marker.id)));
        markersToDelete.forEach(marker => {
          addToHistory(ACTION_TYPES.REMOVE_MARKER, marker);
        });
        deletedCount += markersToDelete.length;
        hasDeletedMarker = true;
      }

      // ลบ zones ที่เลือกแบบกลุ่ม
      if (selectedZones.length > 0) {
        const zonesToDelete = zones.filter(zone => selectedZones.includes(zone.id));
        setZones(prevZones => prevZones.filter(zone => !selectedZones.includes(zone.id)));
        zonesToDelete.forEach(zone => {
          addToHistory(ACTION_TYPES.REMOVE_ZONE, zone);
        });
        deletedCount += zonesToDelete.length;
      }

      // ล้างการเลือกทั้งหมด
      clearSelection();

      // เรียก callback เมื่อลบ marker สำเร็จ
      if (hasDeletedMarker && onMarkerDeleted) {
        let deletedMarkerId = deletedMarkers[0].id
        let dataDelete = await deleteMarker(deletedMarkerId)
        // แสดง confirm dialog
        if (dataDelete.status) {
          SuccessModal("Data deleted successfully", 900)
          onMarkerDeleted(deletedMarkers);


          if (dataDelete.result) {
            // อัพเดท marker
            if (dataDelete.result.marker && Array.isArray(dataDelete.result.marker)) {
              setDataMapAll((prev: any) => ({
                ...prev,
                marker: dataDelete.result.marker
              }));
            }
            // อัพเดท emergency
            if (dataDelete.result.emergency) {
              setDataEmergency((prev: any) => ({
                ...prev,
                emergency: dataDelete.result.emergency,
                deviceWarning: dataDelete.result.deviceWarning || []
              }));
            }
          }

          // รีเซ็ตสถานะปุ่ม/การเลือก ให้กลับเหมือนตอน lock marker
          setClickedMarker(null);
          setSelectedMarkers([]);
          setHasActiveMarker(false);
          if (onActiveMarkerChange) {
            onActiveMarkerChange(false);
          }
          // ล็อกมาร์กเกอร์ทั้งหมดเหมือนสถานะเริ่มต้นของโหมด work-it
          setMarkers(prev => prev.map(m => ({ ...m, isLocked: true })));
        }
        else {
          FailedModal("Delete data failed", 900)
        }
      }


    });
  };

  // ฟังก์ชันรีเซ็ต marker ทั้งหมด (แบบมี confirm)
  const resetAllMarkers = () => {
    const markerCount = markers.length;

    if (markerCount === 0) {
      return;
    }

    const title = "Confirm Deletion of All Markers";
    const message = `Are you sure you want to delete all Markers (${markerCount} items)?\n\nThis action cannot be undone.`;

    showDeleteConfirmation(title, message, () => {
      // บันทึกประวัติการลบ markers ทั้งหมด (ถ้ามี)
      if (markers.length > 0) {
        const currentMarkers = [...markers];
        currentMarkers.forEach(marker => {
          addToHistory(ACTION_TYPES.REMOVE_MARKER, marker);
        });
      }
      // บังคับลบ markers ทั้งหมด
      setMarkers([]);

      // ล้างการเลือกและ state ที่เกี่ยวข้องทั้งหมด
      setSelectedMarkers([]);
      setClickedMarker(null);
      setDraggedMarker(null);
      setDraggedListMarker(null);

      // ปิด popup และ modal ที่เกี่ยวข้องกับ marker
      setShowPopup(false);
      setShowEditMarkerModal(false);
      setEditMarkerData(null);
      setOriginalMarkerData(null);

      // ล้าง marker sizes
      setMarkerSizes({});

      // Force re-render หลายครั้งเพื่อให้แน่ใจ
      setForceRenderKey(prev => {
        const newKey = prev + 1;
        return newKey;
      });

      // Async force re-render
      setTimeout(() => {
        setForceRenderKey(prev => prev + 1);

        // ลบซ้ำอีกครั้งใน async
        setMarkers([]);
      }, 50);
    });
  };

  // ฟังก์ชันลบ zones ทั้งหมด (แบบมี confirm)
  const deleteAllZones = () => {
    // ตรวจสอบโมด - ถ้าเป็น preview ไม่อนุญาตให้ลบ zones
    if (mapMode === 'preview') {
      return;
    }

    const zoneCount = zones.length;

    if (zoneCount === 0) {
      return;
    }

    const title = "Confirm Deletion of All Zones";
    const message = `Do you want to delete all Zones (${zoneCount} items)?\n\nThis action cannot be undone.`;

    showDeleteConfirmation(title, message, () => {
      // บันทึกประวัติการลบ zones ทั้งหมด (ถ้ามี)
      if (zones.length > 0) {
        const currentZones = [...zones];
        currentZones.forEach(zone => {
          addToHistory(ACTION_TYPES.REMOVE_ZONE, zone);
        });
      }
      // บังคับลบ zones ทั้งหมด
      setZones([]);
      setVisibleZones({});

      // ล้างการเลือกและ state ที่เกี่ยวข้องทั้งหมด
      setSelectedZones([]);
      setClickedZone(null);
      setDraggedZone(null);

      // ปิด modal ที่เกี่ยวข้องกับ zone
      setShowZoneModal(false);
      setZoneFormData({ name: "", color: "blue" });
      setCurrentSelection(null);

      // Force re-render หลายครั้งเพื่อให้แน่ใจ
      setForceRenderKey(prev => {
        const newKey = prev + 1;
        return newKey;
      });

      // Async force re-render
      setTimeout(() => {
        setForceRenderKey(prev => prev + 1);
        // ลบซ้ำอีกครั้งใน async
        setZones([]);
        setVisibleZones({});
      }, 50);
    });
  };

  // ฟังก์ชันรีเซ็ตทุกอย่าง (แบบมี confirm)
  const resetEverything = () => {
    const markerCount = markers.length;
    const zoneCount = zones.length;

    if (markerCount === 0 && zoneCount === 0) {
      return;
    }

    const title = "Confirm Deletion of All Data";
    const message = `Are you sure you want to delete all data (${markerCount} markers and ${zoneCount} zones)?\n\nThis action cannot be undone.`;

    showDeleteConfirmation(title, message, () => {
      // บันทึกประวัติการลบทุกอย่าง (ถ้ามี)
      if (markers.length > 0) {
        markers.forEach(marker => {
          addToHistory(ACTION_TYPES.REMOVE_MARKER, marker);
        });
      }

      if (zones.length > 0) {
        zones.forEach(zone => {
          addToHistory(ACTION_TYPES.REMOVE_ZONE, zone);
        });
      }

      // บังคับลบทุกอย่าง
      setMarkers([]);
      setZones([]);
      setVisibleZones({});

      // ล้างการเลือกทั้งหมด
      setSelectedMarkers([]);
      setSelectedZones([]);
      setClickedMarker(null);
      setClickedZone(null);

      // ล้าง copy/paste
      setCopiedMarkers([]);
      setCopiedZones([]);

      // Force re-render หลายครั้ง
      setForceRenderKey(prev => prev + 1);

      // Async force re-render
      setTimeout(() => {
        setForceRenderKey(prev => prev + 1);

        // ลบซ้ำอีกครั้งใน async
        setMarkers([]);
        setZones([]);
        setVisibleZones({});
      }, 50);
    });
  };



  return (
    <div className="relative w-full mx-auto">

      {/* <ModalFormUpdate isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} onClose={() => setIsModalOpen(false)} /> */}

      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2" />
            <div className="text-gray-600">กำลังโหลด...</div>
          </div>
        </div>
      ) : !hasImageData || !uploadedImage ? (
        // แสดง form upload ถ้าไม่มีข้อมูลรูปภาพ
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <p className="text-lg font-semibold mb-4">No village plan found</p>
            <p className="text-sm text-gray-600 mb-4">Please upload a plan to start using</p>
            {onUploadImage && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadImage) {
                      onUploadImage(file);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  Upload plan
                </label>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* แผนที่หลัก */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 hidden">Village plan - Click to add important points</h2>







            {mapMode === 'work-it' && (
              <div className=" p-2 bg-gray-50 text-sm text-blue-700">

                <div className="flex justify-center items-center">

                  <div className="flex items-center justify-center ">

                    <div className="flex  justify-center !gap-2">

                      <div className="relative group cursor-pointer">
                          <div className="relative group cursor-pointer">
                            <button
                              onClick={onImageClick ? resetZoomAndPan : resetZoomAndPanVillage}
                              className="w-8 h-8 bg-white-500 !text-black p-1 rounded-full !text-lg  transition-all 
                          duration-200   cursor-pointer 
                          flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
                            >
                              <img src={fullScreenIcon} alt="home" />
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              <div className="font-semibold">Reset (Home)</div>
                            </div>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 
                        bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 
                        group-hover:opacity-100 transition-opacity whitespace-nowrap z-20"

                          >
                            <div className="font-semibold">Reset view</div>
                          </div>
                      </div>




                      <div className="relative group cursor-pointer">
                        <button
                          onClick={zoomIn}
                          disabled={zoomLevel >= 3}
                          className="w-8 h-8 bg-white-500 !text-black   rounded-full !text-lg  transition-all 
                        duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                        flex items-center justify-center shadow-md hover:shadow-lg "

                        >
                          <ZoomInIcon color="#000000" className="w-4 h-4" />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          <div className="font-semibold">Zoom In</div>
                        </div>
                      </div>


                      <div className="flex justify-center items-center">
                        {Math.round(zoomLevel * 100)}%
                      </div>



                      <div className="relative group cursor-pointer">
                        <button
                          onClick={zoomOut}
                          disabled={zoomLevel <= 0.5}
                          className="w-8 h-8 bg-white-500 !text-black   rounded-full !text-lg  transition-all 
                        duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                        flex items-center justify-center shadow-md hover:shadow-lg"

                        >
                          <ZoomOutIcon color="#000000" className="w-4 h-4" />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          <div className="font-semibold">Zoom Out</div>
                        </div>
                      </div>



                      {/* setIsRightPanelCollapsed() */}
                      <div className="relative group cursor-pointer">
                        <div className="relative group cursor-pointer">
                          <button
                            className="w-8 h-8 bg-white-500 !text-black p-1 rounded-full !text-lg  transition-all 
                          duration-200   cursor-pointer 
                          flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
                            onClick={() => {
                              if (syncToggleButtonRef && syncToggleButtonRef.current) {
                                syncToggleButtonRef.current.click();
                              }
                            }}
                            title={isRightPanelCollapsed ? 'Show panel' : 'Hide panel'}
                            aria-label={isRightPanelCollapsed ? 'Close panel' : 'Open panel'}
                          >
                            <span className="relative inline-block w-6 h-6 px-2">
                              <span className={`absolute left-1/2 -translate-x-1/2 block h-[2px] w-3 bg-gray-700 rounded transition-all duration-300 ease-in-out origin-center ${isRightPanelCollapsed ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[4px] rotate-0'}`}></span>
                              <span className={`absolute left-1/2 -translate-x-1/2 block h-[2px] w-3 bg-gray-700 rounded transition-all duration-300 ease-in-out origin-center ${isRightPanelCollapsed ? 'opacity-0 top-1/2 -translate-y-1/2' : 'opacity-100 top-1/2 -translate-y-1/2'}`}></span>
                              <span className={`absolute left-1/2 -translate-x-1/2 block h-[2px] w-3 bg-gray-700 rounded transition-all duration-300 ease-in-out origin-center ${isRightPanelCollapsed ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[4px] rotate-0'}`}></span>
                            </span>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            <div className="font-semibold">Reset (Home)</div>
                          </div>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 
                                        bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 
                                        group-hover:opacity-100 transition-opacity whitespace-nowrap z-20"

                        >
                          <div className="font-semibold">Reset view</div>
                        </div>
                      </div>


                      {/* <div className="relative group cursor-pointer">
                        <button
                          onClick={undo}
                          disabled={currentIndex < 0}
                          className="w-8 h-8 bg-white-500 !text-white rounded-full text-sm  transition-all 
                        duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                        flex items-center justify-center shadow-md hover:shadow-lg"
                        >
                          <img src={UndoIcon} alt="undo" />
                        </button>
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          <div className="font-semibold">Undo</div>
                        </div>
                      </div>




                      <div className="relative group cursor-pointer">
                        <button
                          onClick={redo}
                          disabled={currentIndex >= history.length - 1}
                          className="w-8 h-8 bg-white-500 !text-white rounded-full text-sm 
                        transition-all duration-200 disabled:opacity-50 
                        disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg
                        text-black
                        "
                        >
                          <img
                            src={UndoIcon}
                            alt="redo"
                            className="transform rotate-180 object-contain filter  "
                            style={{ transform: 'scaleX(-1) rotate(180deg)' }}
                          />
                        </button>
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          <div className="font-semibold">Redo</div>
                        </div>
                      </div> */}




                      {(copiedZones.length > 0 || copiedMarkers.length > 0) && (
                        <div className="relative group">
                          <button
                            onClick={() => {
                              if (copiedZones.length > 0) pasteZones();
                              if (copiedMarkers.length > 0) pasteMarkers();
                            }}
                            className="w-8 h-8 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg"
                          >
                            📋
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            <div className="font-semibold">วางรายการ (Paste)</div>
                            <div className="text-gray-300">
                              {(() => {
                                const items = [];
                                if (copiedZones.length > 0) items.push(`${copiedZones.length} Zones`);
                                if (copiedMarkers.length > 0) items.push(`${copiedMarkers.length} Markers`);
                                return `Paste ${items.join(" and ")}`;
                              })()}
                            </div>
                            <div className="text-gray-300">Ctrl/Cmd + V</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>



                <div className="mb-2 hidden">
                  <label className="block text-sm font-medium text-blue-800 mb-1">Group shape:</label>
                  <div className="flex !gap-2">
                    {zoneShapeOptions.map(shape => (
                      <button
                        key={shape.value}
                        onClick={() => setSelectedZoneShape(shape.value as "rectangle" | "circle" | "triangle")}
                        className={`px-2 py-1 rounded text-xs transition-colors ${selectedZoneShape === shape.value
                          ? "bg-blue-500 text-white"
                          : "bg-white text-blue-700 hover:bg-blue-100"
                          }`}
                        title={shape.label}
                      >
                        {shape.icon} {shape.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            )}




            {mapMode === 'preview' && (
              <div className="mb-4 p-2 bg-gray-50 text-sm text-blue-700">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="text-lg">
                    Alert Status
                  </div>
                  <div className="flex justify-start gap-2 items-center">
                    <span className="size-5 bg-red-500 rounded-full" />
                    <span className="leading-normal">Emergency</span>
                  </div>

                  <div className="flex justify-start gap-2 items-center">
                    <span className="size-5 bg-yellow-500 rounded-full" />
                    <span className="leading-normal">The device has a problem.</span>
                  </div>

                  <div className="flex justify-start gap-2 items-center">
                    <span className="size-5 bg-green-500 rounded-full" />
                    <span className="leading-normal">Normal</span>
                  </div>


                </div>
              </div>
            )}

            {/* ภาพหมู่บ้าน */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden flex justify-center items-center "
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={(e) => { if (!isDragging) handleMouseUp(); }}
              onWheel={handleWheel}
              style={{
                cursor: isPanning ? "grabbing" : (isShiftPressed && zoomLevel > 1) ? "grab" : isCtrlPressed ? "copy" : "crosshair"
              }}
            >
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Village Map"
                className="relative w-full overflow-hidden flex justify-center items-center max-h-[600px]"
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0",
                  objectFit: "scale-down"
                }}
                onLoad={() => {
                  // เตรียม bounding rect/padding ให้พร้อมก่อนคำนวณ marker แรก
                  setTimeout(() => setForceRenderKey(prev => prev + 1), 0);
                }}
                onClick={handleImageClick}
                onMouseDown={handleImageMouseDown}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const nextSibling = target.nextSibling as HTMLElement;
                  target.style.display = "none";
                  if (nextSibling) {
                    nextSibling.style.display = "flex";
                  }
                }}
                draggable={false}
              />

              {/* พื้นหลังทดแทนถ้าไม่มีรูป */}
              <div
                className="w-full h-96 bg-gradient-to-br from-green-200 to-green-400 hidden items-center justify-center select-none"
                onClick={handleImageClick}
                onMouseDown={handleImageMouseDown}
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0"
                }}
              >
                <div className="text-center text-gray-700">
                  <div className="text-6xl mb-4">🏘️</div>
                  <p className="text-lg font-semibold">Village plan</p>
                  <p className="text-sm">Click to add important points</p>
                </div>
              </div>

              {/* แสดงกลุ่มที่มีการเปิดการแสดงผล - ใช้ transform เหมือนรูปภาพ */}
              <div
                key={`zones-${forceRenderKey}`}
                className="absolute inset-0"
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0",
                  pointerEvents: "none"
                }}
              >
                {(() => {
                  return zones.map(zone => renderZone(zone));
                })()}
              </div>

              {/* แสดงพรีวิวกลุ่มขณะลาก - ใช้ transform เหมือนรูปภาพ */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0",
                  pointerEvents: "none"
                }}
              >
                {(isSelectingZone || (showZoneModal && currentSelection)) &&
                  ((isSelectingZone && selectionStart && selectionEnd) || (!isSelectingZone && currentSelection)) &&
                  (() => {
                    // กำหนดสีตาม zoneFormData.color
                    const previewColors: Record<string, { bg: string, border: string }> = {
                      blue: { bg: "bg-blue-200", border: "border-blue-500" },
                      purple: { bg: "bg-purple-200", border: "border-purple-500" },
                      orange: { bg: "bg-orange-200", border: "border-orange-500" },
                      emerald: { bg: "bg-emerald-200", border: "border-emerald-500" },
                      rose: { bg: "bg-rose-200", border: "border-rose-500" },
                      cyan: { bg: "bg-cyan-200", border: "border-cyan-500" },
                      amber: { bg: "bg-amber-200", border: "border-amber-500" }
                    };

                    const currentColors = previewColors[zoneFormData.color] || previewColors.blue;

                    // คำนวณตำแหน่งและขนาดตามทิศทางการลาก
                    let left, top, width, height;

                    if (isSelectingZone && selectionStart && selectionEnd) {
                      // ขณะลาก - แสดงตามทิศทางการลากจริง
                      left = selectionStart.x;
                      top = selectionStart.y;
                      width = selectionEnd.x - selectionStart.x;
                      height = selectionEnd.y - selectionStart.y;
                    } else if (currentSelection) {
                      // เมื่อแสดง modal - แสดงตามการเลือกเดิม
                      left = currentSelection.startX;
                      top = currentSelection.startY;
                      width = currentSelection.endX - currentSelection.startX;
                      height = currentSelection.endY - currentSelection.startY;
                    } else {
                      left = top = width = height = 0;
                    }

                    // สีของเส้นขอบ
                    const borderColor =
                      {
                        blue: "#3B82F6",
                        purple: "#9333EA",
                        orange: "#F97316",
                        emerald: "#10B981",
                        rose: "#F43F5E",
                        cyan: "#06B6D4",
                        amber: "#F59E0B"
                      }[zoneFormData.color] || "#3B82F6";

                    // สีพื้นหลัง
                    const bgColor =
                      {
                        blue: "rgba(59, 130, 246, 0.3)",
                        purple: "rgba(147, 51, 234, 0.3)",
                        orange: "rgba(249, 115, 22, 0.3)",
                        emerald: "rgba(16, 185, 129, 0.3)",
                        rose: "rgba(244, 63, 94, 0.3)",
                        cyan: "rgba(6, 182, 212, 0.3)",
                        amber: "rgba(245, 158, 11, 0.3)"
                      }[zoneFormData.color] || "rgba(59, 130, 246, 0.3)";

                    return (
                      <div
                        className="absolute opacity-50 pointer-events-none"
                        style={{
                          left: width < 0 ? left + width : left,
                          top: height < 0 ? top + height : top,
                          width: Math.abs(width),
                          height: Math.abs(height)
                        }}
                      >
                        {selectedZoneShape === "triangle" ? (
                          <>
                            {/* พื้นหลังสามเหลี่ยม */}
                            <div
                              className="absolute inset-0"
                              style={{
                                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                                backgroundColor: bgColor
                              }}
                            />
                            {/* เส้นขอบสามเหลี่ยม */}
                            <svg
                              className="absolute inset-0"
                              style={{ width: "100%", height: "100%" }}
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              <polygon
                                points="50,0 0,100 100,100"
                                fill={(() => {
                                  const colorMapping: Record<string, string> = {
                                    blue: "rgba(59, 130, 246, 0.3)",
                                    purple: "rgba(147, 51, 234, 0.3)",
                                    orange: "rgba(249, 115, 22, 0.3)",
                                    emerald: "rgba(16, 185, 129, 0.3)",
                                    rose: "rgba(244, 63, 94, 0.3)",
                                    cyan: "rgba(6, 182, 212, 0.3)",
                                    amber: "rgba(245, 158, 11, 0.3)"
                                  };
                                  return colorMapping[zoneFormData.color] || colorMapping["blue"];
                                })()}
                                stroke={
                                  {
                                    blue: "#3B82F6",
                                    purple: "#9333EA",
                                    orange: "#F97316",
                                    emerald: "#10B981",
                                    rose: "#F43F5E",
                                    cyan: "#06B6D4",
                                    amber: "#F59E0B"
                                  }[zoneFormData.color] || "#3B82F6"
                                }
                                strokeWidth="2"
                                strokeDasharray="4,2"
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          </>
                        ) : selectedZoneShape === "circle" ? (
                          <div
                            className={`${currentColors.bg} border-2 ${currentColors.border
                              } border-dashed rounded-full w-full h-full`}
                          />
                        ) : (
                          <div className={`${currentColors.bg} border-2 ${currentColors.border} border-dashed w-full h-full`} />
                        )}
                      </div>
                    );
                  })()}
              </div>

              {/* แสดงพื้นที่เลือกแบบกลุ่ม - ใช้ transform เหมือนรูปภาพ */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0",
                  pointerEvents: "none"
                }}
              >
                {isGroupSelecting && groupSelectionStart && groupSelectionEnd && (
                  <div
                    className="absolute bg-green-200 border-2 border-green-500 border-dashed opacity-50 pointer-events-none"
                    style={{
                      left: Math.min(groupSelectionStart.x, groupSelectionEnd.x),
                      top: Math.min(groupSelectionStart.y, groupSelectionEnd.y),
                      width: Math.abs(groupSelectionEnd.x - groupSelectionStart.x),
                      height: Math.abs(groupSelectionEnd.y - groupSelectionStart.y)
                    }}
                  />
                )}
              </div>

              {/* Markers - ใช้ transform เหมือนรูปภาพ */}
              <div
                key={`markers-${forceRenderKey}`}
                className="absolute inset-0"
                style={{
                  transform: `matrix(${zoomLevel}, 0, 0, ${zoomLevel}, ${panOffset.x}, ${panOffset.y})`,
                  transformOrigin: "0 0",
                  pointerEvents: "none"
                }}
              >
                {(() => {
                  return markers.map(marker => renderMarker(marker, true));
                })()}
              </div>
            </div>

            <div className={`${showWarningVillage ? "block" : "hidden"}`}>
              {/* Alert Status - แสดงเฉพาะใน preview mode */}
            </div>







            {/* คำแนะนำการใช้งาน */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700  hidden ">
              <div className="font-medium mb-1">How to use:</div>
              <ul className="space-y-1 text-xs">
                <li>
                  • <span className="font-semibold">Click</span> on the image to add a new important point
                </li>
                <li>
                  • <span className="font-semibold">Hold and drag</span> to create a new group
                </li>
                <li>
                  • <span className="font-semibold text-green-600">🆕 Ctrl+Click</span> on any point on the image to create a Zone automatically
                  <span className="text-green-800 font-semibold">Cover the same color area connected to the clicked point</span>
                </li>
                <li>• Drag the point to move the position</li>
                <li>
                  • <span className="font-semibold">Ctrl+Mouse wheel</span> to Zoom in/out
                </li>
                <li>
                  • <span className="font-semibold">Alt+Click and drag</span> or{" "}
                  <span className="font-semibold">Middle click and drag</span> to Pan the image
                </li>
                <li>
                  • <span className="font-semibold">Ctrl+0</span> to reset Zoom and Pan
                </li>
                <li>
                  • <span className="font-semibold">Click</span> on a marker/zone to select it (show border)
                </li>
                <li>
                  • <span className="font-semibold">Shift+Drag</span> to select multiple markers and zones
                </li>
                <li>
                  • <span className="font-semibold">Click</span> on a selected marker/zone and drag to move the whole group together
                </li>
                <li>• Drag a marker into a group to automatically change the group</li>
                <li>• Press ESC to cancel the selection</li>
                <li>• Press Ctrl+Z to undo the action, Ctrl+Shift+Z to redo</li>
                <li>
                  • <span className="font-semibold">Ctrl+C</span> to copy the selected zones/markers,{" "}
                  <span className="font-semibold">Ctrl+V</span> to paste the copied zones/markers
                </li>
                <li>
                  • <span className="font-semibold">Delete</span> to delete the selected zones/markers
                </li>
                <li>• Use the Show/Hide button to manage the display of groups</li>
                <li>
                  • <span className="font-semibold">Select shape</span> before dragging to create different shapes
                </li>
                <li>• Markers will be grouped automatically based on their position within the Zone (supports rotation)</li>
              </ul>
            </div>

            {/* แสดงข้อมูลการเลือก */}
            {(selectedMarkers.length > 0 || selectedZones.length > 0 || clickedMarker || clickedZone) && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700 hidden">
                <div className="font-medium">
                  {clickedMarker || clickedZone ? (
                    <>เลือก: {clickedMarker ? `Marker "${clickedMarker.name}"` : clickedZone ? `Zone "${clickedZone.name}"` : ""}</>
                  ) : (
                    <>
                      เลือกแล้ว: {selectedMarkers.length} markers
                      {selectedZones.length > 0 && `, ${selectedZones.length} zones`}
                    </>
                  )}
                </div>
                <div className="text-xs mt-1">
                  {clickedMarker || clickedZone
                    ? "Press Delete to delete this object or ESC to cancel the selection"
                    : isDraggingGroup
                      ? "Dragging group markers..."
                      : isDraggingZoneGroup
                        ? "Dragging group zones..."
                        : isDraggingMixed
                          ? "Dragging mixed group (markers and zones)..."
                          : selectedMarkers.length > 0 && selectedZones.length > 0
                            ? "Click on a selected marker/zone and drag to move the whole group together"
                            : selectedMarkers.length > 0
                              ? "Click on any selected marker and drag to move the whole group"
                              : "Click on any selected zone and drag to move the whole group"}
                </div>
                <div className="text-xs mt-1 font-medium text-gray-600">
                  {clickedMarker || clickedZone
                    ? "Press Delete to delete, ESC to cancel the selection"
                    : "Ctrl+C to copy, Delete to delete, ESC to cancel the selection"}
                </div>
              </div>
            )}

            {/* แสดงข้อมูล Copy/Paste */}
            {(copiedZones.length > 0 || copiedMarkers.length > 0) && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                <div className="font-medium">
                  Clipboard:{" "}
                  {(() => {
                    const items = [];
                    if (copiedZones.length > 0) items.push(`${copiedZones.length} zones`);
                    if (copiedMarkers.length > 0) items.push(`${copiedMarkers.length} markers`);
                    return items.join(" และ ");
                  })()}{" "}
                  พร้อมวาง
                </div>
                <div className="text-xs mt-1">
                  Press Ctrl+V to paste{" "}
                  {(() => {
                    const items = [];
                    if (copiedZones.length > 0) items.push("zones");
                    if (copiedMarkers.length > 0) items.push("markers");
                    return items.join(" และ ");
                  })()}{" "}
                  copied
                </div>
              </div>
            )}

            {/* แสดงข้อมูล Zoom */}
          </div>

          {/* รายการกลุ่มด้านขวา */}
          <div className="w-80 hidden">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">All groups ({zones.length})</h3>
              <div className="space-y-4">
                {/* แสดงกลุ่ม Marker สำหรับ marker ที่ไม่ได้อยู่ในกลุ่มใดๆ */}
                <div className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
                      <span className="font-medium text-gray-800">Marker</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        ({markers.filter(marker => !zones.some(zone => isPointInZone(marker.x, marker.y, zone))).length} จุด)
                      </span>
                    </div>
                  </div>
                  {/* รายการ Markers ที่ไม่ได้อยู่ในกลุ่มใดๆ */}
                  <div className="mt-2 space-y-1">
                    {markers
                      .filter(marker => !zones.some(zone => isPointInZone(marker.x, marker.y, zone)))
                      .map(marker => {
                        const markerColors = getMarkerColors(marker.color);
                        const currentSize = markerSizes[marker.id] || DEFAULT_MARKER_SIZE;
                        const isDragging = draggedListMarker?.id === marker.id;

                        return (
                          <div
                            key={marker.id}
                            className={`flex items-center justify-between bg-white p-2 rounded border text-sm cursor-move transition-all duration-200 ${isDragging ? "opacity-50" : "hover:shadow-md"
                              }`}
                            draggable
                            onDragStart={e => handleMarkerDragStart(e, marker)}
                            onDragEnd={handleMarkerDragEnd}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`${markerColors.bg} `}
                                style={{
                                  width: `40px`,
                                  height: `40px`
                                }}
                              />
                              <span>{marker.name}</span>
                            </div>
                            <div className="flex space-x-1">
                              {!isDragging && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    resetMarkerPosition(marker.id);
                                  }}
                                  className="text-blue-500 hover:text-blue-700"
                                  onMouseDown={e => e.stopPropagation()}
                                  onDragStart={e => e.preventDefault()}
                                >
                                  ↺
                                </button>
                              )}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  removeMarker(marker.id);
                                }}
                                className="text-red-500 hover:text-red-700"
                                onMouseDown={e => e.stopPropagation()}
                                onDragStart={e => e.preventDefault()}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* แสดงรายการกลุ่มอื่นๆ */}
                {zones.map(zone => {
                  const zoneColors = getZoneColors(zone.color);
                  const markersInZone = markers.filter(marker => isPointInZone(marker.x, marker.y, zone));
                  const isDropTarget = dragOverZoneId === zone.id;
                  return (
                    <div
                      key={zone.id}
                      className={`bg-gray-50 p-4 rounded-lg border transition-all duration-200 ${isDropTarget ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100 border-gray-200"
                        }`}
                      onDragOver={e => handleZoneDragOver(e, zone)}
                      onDragLeave={handleZoneDragLeave}
                      onDrop={e => handleZoneDrop(e, zone)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 ${zoneColors.bgOpacity} ${zoneColors.border} border rounded`} />
                          <span className="font-medium text-gray-800">{zone.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">({markersInZone.length} จุด)</span>
                          <button onClick={() => removeZone(zone.id)} className="text-red-500 hover:text-red-700 text-sm">
                            ลบ
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <button
                          onClick={() => toggleZoneVisibility(zone.id)}
                          className={`px-2 py-1 rounded ${visibleZones[zone.id]
                            ? "bg-blue-500 hover:bg-blue-600 !text-white"
                            : "bg-gray-600 hover:bg-gray-700 !text-white"
                            } transition-colors`}
                        >
                          {visibleZones[zone.id] ? "Hide group" : "Show group"}
                        </button>
                      </div>
                      {/* รายการ Markers ในกลุ่ม */}
                      {markersInZone.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm font-medium text-gray-700 mb-1">Points in the group:</div>
                          {markersInZone.map(marker => {
                            const markerColors = getMarkerColors(marker.color);
                            const isInOriginalPosition = marker.x === marker.originalX && marker.y === marker.originalY;
                            const isDragging = draggedListMarker?.id === marker.id;
                            const currentSize = markerSizes[marker.id] || DEFAULT_MARKER_SIZE;

                            return (
                              <div
                                key={marker.id}
                                className={`flex items-center justify-between bg-white p-2 rounded border text-sm cursor-move transition-all duration-200 ${isDragging ? "opacity-50" : "hover:shadow-md"
                                  }`}
                                draggable
                                onDragStart={e => handleMarkerDragStart(e, marker)}
                                onDragEnd={handleMarkerDragEnd}
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`${markerColors.bg} rounded-full transition-all duration-200`}
                                    style={{
                                      width: `40px`,
                                      height: `40px`
                                    }}
                                  />
                                  <span>{marker.name}</span>
                                  {!isInOriginalPosition && <span className="text-xs text-orange-500">(ย้ายแล้ว)</span>}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {!isInOriginalPosition && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          resetMarkerPosition(marker.id);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                        onMouseDown={e => e.stopPropagation()}
                                        onDragStart={e => e.preventDefault()}
                                      >
                                        ↺
                                      </button>
                                    )}
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        removeMarker(marker.id);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                      onMouseDown={e => e.stopPropagation()}
                                      onDragStart={e => e.preventDefault()}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip Form สำหรับสร้างกลุ่ม */}
      {showZoneModal && currentSelection && (
        <div
          className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 ${showWarningVillage ? 'w-80' : 'w-72'}`}
          style={showWarningVillage ? {
            left:
              Math.max(currentSelection.startX, currentSelection.endX) * zoomLevel +
              panOffset.x + 40
            ,
            top: Math.max(20, ((currentSelection.startY + currentSelection.endY) / 2) * zoomLevel + panOffset.y - 200)
          } : {
            left:
              Math.max(currentSelection.startX, currentSelection.endX) * zoomLevel +
              panOffset.x + 40,
            top: ((currentSelection.startY + currentSelection.endY) / 2) * zoomLevel + panOffset.y - 100,
            transform: "translate(0, -50%)"
          }}
        >
          <div className="relative">
            {showWarningVillage && (
              <div className="mb-4 pb-3 border-b border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneModal(false);
                    setZoneFormData({ name: "", color: "blue" });
                    setCurrentSelection(null);
                    setIsSelectingZone(false);
                    setSelectionStart(null);
                    setSelectionEnd(null);
                    // ไม่ปิด showWarningVillage เพื่อให้ Monitoring ยังคงแสดงอยู่
                  }}
                  className="absolute !text-3xl !cursor-pointer right-0 -top-1 text-gray-400 hover:text-gray-600 font-bold !leading-[14.5px]"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Create new Zone</h3>
                <p className="text-sm text-gray-600">Set the area and name</p>
              </div>
            )}
            {!showWarningVillage && lastCreatedItem && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
                <div className="text-sm text-green-800">
                  ✅ {lastCreatedItem?.data?.id && (lastCreatedItem.type === 'marker' ? markers.find(m => m.id === lastCreatedItem.data?.id) : zones.find(z => z.id === lastCreatedItem.data?.id)) ?
                    `กำลังแก้ไข ${lastCreatedItem.type === 'marker' ? 'Marker' : 'Zone'} "${lastCreatedItem.data?.name}"` :
                    `สร้าง ${lastCreatedItem.type === 'marker' ? 'Marker' : 'Zone'} "${lastCreatedItem.data?.name}" เรียบร้อยแล้ว`
                  }
                </div>
              </div>
            )}
            <form onSubmit={handleZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group name:</label>
                <input
                  type="text"
                  value={zoneFormData.name}
                  onChange={e => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บริเวณสำนักงาน"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape :</label>
                <div className="flex !gap-4">
                  {zoneShapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setSelectedZoneShape(shape.value as "rectangle" | "circle" | "triangle")}
                      className={`flex-1 py-2 px-3 text-xs rounded border transition-all duration-200 ${selectedZoneShape === shape.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                    >
                      {shape.icon} {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Select group color :</label>
                <div className="flex items-center justify-center !gap-3">
                  {zoneColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setZoneFormData({ ...zoneFormData, color: color.value })}
                      className={`w-8 h-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${zoneFormData.color === color.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                          : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex !gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 py-2 px-4 rounded-md text-sm hover:bg-blue-600 transition-all duration-200 !text-white"
                >
                  Create group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowZoneModal(false);
                    setZoneFormData({ name: "", color: "blue" });
                    // ไม่รีเซ็ต selectedZoneShape เพื่อให้คงรูปทรงปัจจุบันไว้
                    setCurrentSelection(null);
                    setIsSelectingZone(false);
                    setSelectionStart(null);
                    setSelectionEnd(null);
                    // ไม่ปิด showWarningVillage เพื่อให้ Monitoring ยังคงแสดงอยู่
                  }}
                  className="flex-1 bg-gray-500  py-2 px-4 
                  rounded-md text-sm hover:bg-gray-600 transition-all duration-200 cursor-pointer !text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับสร้าง Marker - ปิดใช้งานแล้ว เพื่อใช้ form ด้านขวาแทน */}
      {false && showPopup && (
        <div
          className={`absolute  bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 ${showWarningVillage ? 'w-80' : 'w-72'}`}
          style={showWarningVillage ? {
            left: Math.min(currentPosition.x * zoomLevel + panOffset.x + 40),
            top: currentPosition.y * zoomLevel + panOffset.y - 250
          } : {
            left: currentPosition.x * zoomLevel + panOffset.x + 40, // วางทางขวาของตำแหน่งที่คลิก
            top: currentPosition.y * zoomLevel + panOffset.y - 250, // ขึ้นมาให้อยู่ระดับเดียวกัน

          }}
        >
          <div className="relative">
            {showWarningVillage && (
              <div className="mb-4 pb-3 border-b border-gray-200 relative">
                <button
                  type="button"
                  onClick={closePopup}
                  className="absolute !text-3xl !cursor-pointer right-0 -top-1 text-gray-400 hover:text-gray-600 font-bold !leading-[14.5px]"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Create new Marker</h3>
                <p className="text-sm text-gray-600">Enter the data to create a new important point</p>
              </div>
            )}
            {!showWarningVillage && lastCreatedItem && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
                <div className="text-sm text-green-800">
                  ✅ {lastCreatedItem?.data?.id && (lastCreatedItem?.type === 'marker' ? markers.find(m => m.id === lastCreatedItem?.data?.id) : zones.find(z => z.id === lastCreatedItem?.data?.id)) ?
                    `กำลังแก้ไข ${lastCreatedItem?.type === 'marker' ? 'Marker' : 'Zone'} "${lastCreatedItem?.data?.name}"` :
                    `สร้าง ${lastCreatedItem?.type === 'marker' ? 'Marker' : 'Zone'} "${lastCreatedItem?.data?.name}" เรียบร้อยแล้ว`
                  }
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บ้านนายสมชาย"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                <select
                  value={formData.address || ""}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select address</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 1:</label>
                <input
                  type="text"
                  value={formData.tel1 || ""}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    setFormData({ ...formData, tel1: value });
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574483"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 2:</label>
                <input
                  type="text"
                  value={formData.tel2 || ""}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    setFormData({ ...formData, tel2: value });
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574483"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 3:</label>
                <input
                  type="text"
                  value={formData.tel3 || ""}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    setFormData({ ...formData, tel3: value });
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574483"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Select color:</label>
                <div className="flex items-center justify-start !gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${formData.color === color.value ? "ring-2 ring-offset-2 ring-gray-400 scale-125" : "hover:scale-110"}`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex !gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white 
                  py-2 px-4 rounded-md text-sm hover:bg-blue-600 transition-all 
                  duration-200 !text-white"
                >
                  Create Marker
                </button>
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-600 transition-all duration-200 cursor-pointer !text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับแก้ไข Marker - ปิดใช้งานแล้ว เพื่อใช้ form ด้านขวาแทน */}
      {false && showEditMarkerModal && editMarkerData && (
        <div
          className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 ${showWarningVillage ? 'w-80' : 'w-72'}`}
          style={showWarningVillage ? {
            left: (editMarkerData?.x || 0) * zoomLevel + panOffset.x + 40,
            top: (editMarkerData?.y || 0) * zoomLevel + panOffset.y - 350
          } : {
            left: (editMarkerData?.x || 0) * zoomLevel + panOffset.x + 40, // วางทางขวาของ marker
            top: (editMarkerData?.y || 0) * zoomLevel + panOffset.y - 50, // ขึ้นมาให้อยู่ระดับเดียวกับ marker
            transform: "translate(0, -50%)" // จัดกลางตามแนวตั้ง
          }}
        >
          <div className="relative">
            {showWarningVillage && (
              <div className="mb-4 pb-3 border-b border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => {
                    if (originalMarkerData) {
                      setMarkerSizes(prev => ({
                        ...prev,
                        [originalMarkerData.id]: originalMarkerData.size
                      }));
                    }
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="absolute !text-3xl !cursor-pointer right-0 -top-1 text-gray-400 hover:text-gray-600 font-bold !leading-[14.5px]"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Edit Marker</h3>
                <p className="text-sm text-gray-600">Adjust the data of the important point</p>
              </div>
            )}
            <form onSubmit={handleEditMarkerSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสถานที่:</label>
                <input
                  type="text"
                  value={editMarkerData?.name || ''}
                  onChange={e => {
                    if (!editMarkerData) return;
                    const newName = e.target.value;
                    const updatedMarkerData = { ...editMarkerData, name: newName } as EditMarkerData;
                    setEditMarkerData(updatedMarkerData);

                    // อัพเดท marker ใน state เฉพาะที่นี่
                    setMarkers(prevMarkers =>
                      prevMarkers.map(marker =>
                        marker.id === editMarkerData.id ? { ...marker, name: newName } : marker
                      )
                    );

                    // ส่งข้อมูล marker ที่อัพเดทไปยัง parent ทันที
                    if (onMarkerSelect) {
                      onMarkerSelect(updatedMarkerData);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="เช่น บ้านนายสมชาย"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                <select
                  value={editMarkerData?.address || ""}
                  onChange={e => {
                    if (!editMarkerData) return;
                    const newAddress = e.target.value;
                    const updatedMarkerData = { ...editMarkerData, address: newAddress };
                    setEditMarkerData(updatedMarkerData);

                    // อัพเดท marker ใน state เฉพาะที่นี่
                    setMarkers(prevMarkers =>
                      prevMarkers.map(marker =>
                        marker.id === editMarkerData.id ? { ...marker, address: newAddress } : marker
                      )
                    );

                    // ส่งข้อมูล marker ที่อัพเดทไปยัง parent ทันที
                    if (onMarkerSelect) {
                      onMarkerSelect(updatedMarkerData);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select address</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 1:</label>
                <input
                  type="text"
                  value={editMarkerData?.tel1 || ""}
                  onChange={e => {
                    const newTel1 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    if (!editMarkerData) return;
                    const updatedMarkerData = { ...editMarkerData, tel1: newTel1 };
                    setEditMarkerData(updatedMarkerData);

                    // อัพเดท marker ใน state เฉพาะที่นี่
                    setMarkers(prevMarkers =>
                      prevMarkers.map(marker =>
                        marker.id === editMarkerData.id ? { ...marker, tel1: newTel1 } : marker
                      )
                    );

                    // ส่งข้อมูล marker ที่อัพเดทไปยัง parent ทันที
                    if (onMarkerSelect) {
                      onMarkerSelect(updatedMarkerData);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574483"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 2:</label>
                <input
                  type="text"
                  value={editMarkerData?.tel2 || ""}
                  onChange={e => {
                    const newTel2 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    if (!editMarkerData) return;
                    const updatedMarkerData = { ...editMarkerData, tel2: newTel2 };
                    setEditMarkerData(updatedMarkerData);

                    // อัพเดท marker ใน state เฉพาะที่นี่
                    setMarkers(prevMarkers =>
                      prevMarkers.map(marker =>
                        marker.id === editMarkerData.id ? { ...marker, tel2: newTel2 } : marker
                      )
                    );

                    // ส่งข้อมูล marker ที่อัพเดทไปยัง parent ทันที
                    if (onMarkerSelect) {
                      onMarkerSelect(updatedMarkerData);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574484"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel 3:</label>
                <input
                  type="text"
                  value={editMarkerData.tel3 || ""}
                  onChange={e => {
                    const newTel3 = e.target.value.replace(/\D/g, '').slice(0, 10); // เฉพาะตัวเลข และจำกัด 10 ตัว
                    const updatedMarkerData = { ...editMarkerData, tel3: newTel3 };
                    setEditMarkerData(updatedMarkerData);

                    // อัพเดท marker ใน state เฉพาะที่นี่
                    setMarkers(prevMarkers =>
                      prevMarkers.map(marker =>
                        marker.id === editMarkerData.id ? { ...marker, tel3: newTel3 } : marker
                      )
                    );

                    // ส่งข้อมูล marker ที่อัพเดทไปยัง parent ทันที
                    if (onMarkerSelect) {
                      onMarkerSelect(updatedMarkerData);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tel. 0985574483"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group/Village:</label>
                <select
                  value={editMarkerData.group}
                  onChange={e => setEditMarkerData({ ...editMarkerData, group: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="Marker">Marker</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={MIN_MARKER_SIZE}
                    max={MAX_MARKER_SIZE}
                    value={editMarkerData.size}
                    onChange={e =>
                      setEditMarkerData(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          size: parseInt(e.target.value)
                        };
                      })
                    }
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                    onDragStart={e => e.preventDefault()}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 w-6 text-center">{editMarkerData.size}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select color:</label>
                <div className="flex items-center justify-center !gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditMarkerData({ ...editMarkerData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${editMarkerData.color === color.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                          : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-center !gap-3 pt-1">
                <button
                  type="submit"
                  className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                  transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg 
                  relative  group"
                  style={{ overflow: "hidden" }}
                  title="Save the edit"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">💾</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Save</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // กลับคืนค่าเดิม
                    if (originalMarkerData) {
                      setMarkerSizes(prev => ({
                        ...prev,
                        [originalMarkerData.id]: originalMarkerData.size
                      }));
                    }
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="w-12 h-12 bg-gray-500 text-white rounded-full 
                  hover:bg-gray-600 transition-all duration-200 cursor-pointer flex items-center justify-center 
                  shadow-md hover:shadow-lg relative  group "
                  style={{ overflow: "hidden" }}
                  title="Cancel the edit"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg !text-white">✕</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Cancel</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetMarkerPosition(editMarkerData.id);
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className="w-12 h-12 bg-yellow-500 text-white rounded-full 
                  hover:bg-yellow-600 transition-all duration-200 cursor-pointer flex items-center justify-center 
                  shadow-md hover:shadow-lg relative  group "
                  style={{ overflow: "hidden" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg !text-white">↺</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Reset</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeMarker(editMarkerData.id);
                    setShowEditMarkerModal(false);
                    setEditMarkerData(null);
                    setOriginalMarkerData(null);
                  }}
                  className=" w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative  group "
                  style={{ overflow: "hidden" }}
                  title="Delete this marker"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">🗑️</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Delete</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Form สำหรับแก้ไขกลุ่ม */}
      {showEditZoneModal && editZoneData && (
        <div
          className={`absolute 
            bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 ${showWarningVillage ? 'w-80' : 'w-72'}`}
          style={showWarningVillage ? {
            left: editZoneData.x * zoomLevel + panOffset.x + editZoneData.width + 30,
            top: editZoneData.y * zoomLevel + panOffset.y - 150
          } : {
            left: editZoneData.x * zoomLevel + panOffset.x + editZoneData.width + 30, // วางทางขวาของ zone
            top: editZoneData.y * zoomLevel + panOffset.y + (editZoneData.height / 2), // จัดกลางตามแนวตั้งของ zone
            transform: "translate(0, -50%)" // จัดกลางตามแนวตั้ง
          }}
        >
          <div className="relative">
            {showWarningVillage && (
              <div className="mb-4 pb-3 border-b border-gray-200 relative">
                <button
                  type="button"
                  onClick={() => {
                    if (originalZoneData) {
                      setEditZoneData({ ...originalZoneData });
                    }
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="absolute !text-3xl !cursor-pointer right-0 -top-1 text-gray-400 hover:text-gray-600 font-bold !leading-[14.5px]"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Edit Zone</h3>
                <p className="text-sm text-gray-600">Adjust the data of the area</p>
              </div>
            )}
            <form onSubmit={handleEditZoneSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group name:</label>
                <input
                  type="text"
                  value={editZoneData.name}
                  onChange={e => setEditZoneData({ ...editZoneData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Office area"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape :</label>
                <div className="flex !gap-2">
                  {zoneShapeOptions.map(shape => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setEditZoneData({ ...editZoneData, shape: shape.value as "rectangle" | "circle" | "triangle" })}
                      className={`flex-1 py-1.5 px-2 text-xs rounded border transition-all duration-200 ${(editZoneData.shape || "rectangle") === shape.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                    >
                      {shape.icon} {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select group color :</label>
                <div className="flex items-center justify-center !gap-3">
                  {zoneColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditZoneData({ ...editZoneData, color: color.value })}
                      className={`w-6 h-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${color.bg} 
                        ${editZoneData.color === color.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                          : "hover:scale-110"
                        }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-center !gap-3 pt-1">
                <button
                  type="submit"
                  className="w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="Save the edit"
                  style={{ overflow: "hidden" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">💾</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Save</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // กลับคืนค่าเดิม
                    if (originalZoneData) {
                      setEditZoneData({ ...originalZoneData });
                    }
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="w-12 h-12 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="Cancel the edit"
                  style={{ overflow: "hidden" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg !text-white">✕</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Cancel</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetZonePosition(editZoneData.id);
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="w-12 h-12 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="Reset the position back to the original"
                  style={{ overflow: "hidden" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg !text-white">↺</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Reset</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeZone(editZoneData.id);
                    setShowEditZoneModal(false);
                    setEditZoneData(null);
                    setOriginalZoneData(null);
                  }}
                  className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md hover:shadow-lg relative overflow-hidden group"
                  title="Delete this group"
                  style={{ overflow: "hidden" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-12">
                    <span className="text-lg">🗑️</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 translate-y-12 group-hover:translate-y-0">
                    <span className="text-xs font-medium !text-white">Delete</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Custom CSS for animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Custom Range Slider Styles */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e5e7eb;
          outline: none;
          transition: all 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
        }

        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          background: #2563eb;
          transform: scale(1.2);
        }

        input[type="range"]:hover::-moz-range-thumb {
          background: #2563eb;
          transform: scale(1.2);
        }

        input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.1);
        }

        input[type="range"]:active::-moz-range-thumb {
          transform: scale(1.1);
        }

        /* Emergency Alert Ripple Animation */
        @keyframes emergencyRipple1 {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          8% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.4);
          }
        }

        @keyframes emergencyRipple2 {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          25% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.6);
          }
        }

        @keyframes emergencyRipple3 {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          42% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        .animate-emergency-ripple-1 {
          animation: emergencyRipple1 2.5s infinite;
          animation-delay: 0s;
        }

        .animate-emergency-ripple-2 {
          animation: emergencyRipple2 2.5s infinite;
          animation-delay: 0s;
        }

        .animate-emergency-ripple-3 {
          animation: emergencyRipple3 2.5s infinite;
          animation-delay: 0s;
        }

        /* Warning Alert Ripple Animation (Yellow) */
        @keyframes warningRipple1 {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          10% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.1);
          }
        }

        @keyframes warningRipple2 {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          30% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.4);
          }
        }

        .animate-warning-ripple-1 {
          animation: warningRipple1 2.5s infinite;
          animation-delay: 0s;
        }

        .animate-warning-ripple-2 {
          animation: warningRipple2 2.5s infinite;
          animation-delay: 0s;
        }

        /* เพิ่มเอฟเฟกต์เรืองแสงสำหรับ marker สีแดง */
        .emergency-marker-glow {
          box-shadow: 
            0 0 10px rgba(239, 68, 68, 0.6),
            0 0 20px rgba(239, 68, 68, 0.4),
            0 0 30px rgba(239, 68, 68, 0.2);
          animation: emergencyGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes emergencyGlow {
          0% {
            box-shadow: 
              0 0 10px rgba(239, 68, 68, 0.6),
              0 0 20px rgba(239, 68, 68, 0.4),
              0 0 30px rgba(239, 68, 68, 0.2);
          }
          100% {
            box-shadow: 
              0 0 15px rgba(239, 68, 68, 0.8),
              0 0 25px rgba(239, 68, 68, 0.6),
              0 0 35px rgba(239, 68, 68, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default VillageMap;
