"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import { LocateFixed } from "lucide-react"; // Иконка прицела (замени на свою, если нужно)

const selectionIcon = L.divIcon({
  className: "custom-selection-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-pulse"></div>`,
});

interface MapComponentProps {
  onChange: (pos: { lat: number; lng: number }) => void;
}

// Отдельный компонент для кнопки GPS, так как ему нужен хук useMap()
function LocateButton({ setPosition, onChange }: any) {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16); // Плавно летим к точке с хорошим зумом
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-xl border border-gray-100 text-blue-600 active:bg-blue-50 transition-colors"
    >
      <LocateFixed className="w-6 h-6" />
    </button>
  );
}

export default function MapComponent({ onChange }: MapComponentProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return position === null ? null : <Marker position={position} icon={selectionIcon} />;
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl border-2 border-gray-100 shadow-inner bg-gray-50">
      <MapContainer
        center={[54.8667, 69.15]}
        zoom={13}
        style={{ height: "300px", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <LocationMarker />
        
        {/* Добавляем нашу кнопку GPS поверх карты */}
        <LocateButton setPosition={setPosition} onChange={onChange} />
      </MapContainer>
    </div>
  );
}