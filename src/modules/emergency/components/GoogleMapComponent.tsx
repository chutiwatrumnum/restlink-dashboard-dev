import React, { useEffect, useRef, useCallback } from "react";
import { Input } from "antd";
import { Loader } from "@googlemaps/js-api-loader";
import { NEXRES_GOOGLE_API_KEY } from "../../../configs/configs";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapComponentProps {
  onLocationChange?: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: number | string;
  width?: number | string;
  style?: React.CSSProperties;
  zoom?: number;
  /** ให้ลากหมุดได้หรือไม่ (ค่าเริ่มต้น true) */
  draggableMarker?: boolean;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  onLocationChange,
  initialLat = 13.736717,
  initialLng = 100.523186,
  height = 470,
  width = "100%",
  style,
  zoom = 12,
  draggableMarker = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // เก็บ listeners ไว้เพื่อ cleanup
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  // --- helper: set / move marker
  const setMarker = useCallback(
    (lat: number, lng: number) => {
      if (!mapRef.current || !window.google) return;

      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapRef.current,
          draggable: draggableMarker,
          animation: window.google.maps.Animation.DROP,
        });

        // dragend -> ส่งตำแหน่งกลับ
        listenersRef.current.push(
          markerRef.current.addListener(
            "dragend",
            (evt: google.maps.MapMouseEvent) => {
              if (!evt.latLng) return;
              onLocationChange?.(evt.latLng.lat(), evt.latLng.lng());
            }
          )
        );
      } else {
        markerRef.current.setPosition({ lat, lng });
      }
    },
    [draggableMarker, onLocationChange]
  );

  // --- init loader + map (ครั้งเดียว)
  useEffect(() => {
    let mounted = true;

    const loader = new Loader({
      apiKey: NEXRES_GOOGLE_API_KEY as string,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (!mounted || !mapContainerRef.current) return;

        // สร้างแผนที่ครั้งเดียว
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
        });

        // คลิกบนแผนที่ -> วางหมุด + ส่งค่าสำหรับ parent
        listenersRef.current.push(
          mapRef.current.addListener(
            "click",
            (evt: google.maps.MapMouseEvent) => {
              if (!evt.latLng) return;
              const lat = evt.latLng.lat();
              const lng = evt.latLng.lng();
              setMarker(lat, lng);
              onLocationChange?.(lat, lng);
            }
          )
        );

        // วางหมุดเริ่มต้น (ถ้าไม่ใช่ค่า default ก็จะชัดขึ้น)
        setMarker(initialLat, initialLng);

        // ตั้งค่า Autocomplete บนช่อง Input
        const inputEl: HTMLInputElement | undefined = inputRef.current?.input;
        if (inputEl) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputEl,
            {
              fields: ["geometry", "formatted_address"],
            }
          );

          listenersRef.current.push(
            autocompleteRef.current.addListener("place_changed", () => {
              const place = autocompleteRef.current!.getPlace();
              if (place.geometry?.location && mapRef.current) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                mapRef.current.panTo({ lat, lng });
                mapRef.current.setZoom(16);
                setMarker(lat, lng);
                onLocationChange?.(lat, lng);
              }
            })
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load Google Maps:", err);
      });

    return () => {
      mounted = false;
      // cleanup listeners
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [];
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      autocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // โหลดครั้งเดียว

  // --- ถ้า props ศูนย์กลาง/ซูมเปลี่ยน -> อัปเดตแผนที่ (ไม่ต้อง re-init)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: initialLat, lng: initialLng });
    mapRef.current.setZoom(zoom);
    setMarker(initialLat, initialLng);
  }, [initialLat, initialLng, zoom, setMarker]);

  // --- รองรับกด Enter ในช่องค้นหา (แต่เราเน้น Autocomplete เป็นหลัก)
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // ไม่ต้องทำอะไรเป็นพิเศษ: ให้ผู้ใช้เลือกจาก dropdown ของ Autocomplete
      // ถ้าอยากบังคับ geocode ด้วยข้อความตรง ๆ เพิ่มโค้ด geocoder ที่นี่ได้
    }
  };

  return (
    <div style={{ position: "relative", ...style }}>
      {/* Search Box (Autocomplete) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          zIndex: 1000,
          display: "flex",
          gap: 8,
        }}
      >
        <Input
          ref={inputRef}
          placeholder="Search for places..."
          onKeyDown={onInputKeyDown}
          style={{ flex: 1 }}
        />
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width,
          height,
          borderRadius: 8,
          border: "1px solid #d9d9d9",
        }}
      />
    </div>
  );
};

export default GoogleMapComponent;
