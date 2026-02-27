// components/LocationPicker.jsx
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Стандартная иконка Leaflet для выбора точки
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Вспомогательный компонент, который слушает клики по карте
function ClickHandler({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng); // Сохраняем координаты клика
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={markerIcon}></Marker>
  );
}

export default function LocationPicker({ position, setPosition }) {
  const center = [54.87, 69.15]; // Центр Петропавловска

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler position={position} setPosition={setPosition} />
    </MapContainer>
  );
}