/* global fetch */
import { useState, useMemo } from "react";
import {
  useControl,
  Marker,
  MarkerProps,
  ControlPosition,
} from "react-map-gl/maplibre";
import MaplibreGeocoder, {
  MaplibreGeocoderApi,
  MaplibreGeocoderOptions,
} from "@maplibre/maplibre-gl-geocoder";

type GeoCoderControlProps = Omit<
  MaplibreGeocoderOptions,
  "maplibregl" | "marker"
> & {
  marker?: boolean | Omit<MarkerProps, "longitude" | "latitude">;
  position: ControlPosition;
  onLoading?: (e: object) => void;
  onResults?: (e: object) => void;
  onResult?: (e: object) => void;
  onError?: (e: object) => void;
};

const extractLocation = (result: any): [number, number] | null => {
  if (!result) return null;
  if (Array.isArray(result.center)) return result.center;
  if (result.geometry?.type === "Point") return result.geometry.coordinates;
  return null;
};

const geocoderApi: MaplibreGeocoderApi = {
  forwardGeocode: async (config) => {
    const features = [];
    try {
      const request = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        config.query
      )}&format=geojson&polygon_geojson=1&addressdetails=1`;
      const response = await fetch(request);
      const geojson = await response.json();
      for (const feature of geojson.features) {
        const center = [
          feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
          feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
        ];
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: center,
          },
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ["place"],
          center,
        });
      }
    } catch (e) {
      console.error("Failed to forwardGeocode:", e);
    }
    return { features };
  },
};

export default function GeoCoderControl(props: GeoCoderControlProps) {
  useControl<MaplibreGeocoder>(
    ({ mapLib }) => {
      const ctrl = new MaplibreGeocoder(geocoderApi, {
        ...props,
        marker: false,
        flyTo: {
          zoom: props.zoom ?? 16, // ซูมตามที่กำหนด หรือ fallback
          essential: true,
        },
        showResultMarkers: false,
        maplibregl: mapLib,
      });

      return ctrl;
    },
    { position: props.position }
  );
  return null;
}

const noop = () => {};

GeoCoderControl.defaultProps = {
  marker: true,
  onLoading: noop,
  onResults: noop,
  onResult: noop,
  onError: noop,
};
