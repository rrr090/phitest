"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

// Иконка (фикс для Next.js)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  onChange: (pos: { lat: number; lng: number }) => void;
}

export default function MapComponent({ onChange }: MapComponentProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  // Компонент-помощник для обработки кликов внутри карты
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={icon} />
    );
  }

  return (
    <MapContainer
      center={[54.8667, 69.15]} // Петропавловск
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}