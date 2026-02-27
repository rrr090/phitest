"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabase"; // Убедись, что путь к supabase.ts верный
import { Issue } from "@/lib/types";
import Link from "next/link";

// --- Настройка иконок (как в MapComponent.jsx) ---
const getCategoryIcon = (category: string) => {
  const svgClass = "w-4 h-4 text-white";
  switch (category?.toLowerCase()) {
    case "дороги": return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${svgClass}"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    case "жкх": return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${svgClass}"><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.5C7.306 21.5 3.5 17.694 3.5 13 3.5 9.5 8 4 12 2c4 2 8.5 7.5 8.5 11 0 4.694-3.806 8.5-8.5 8.5z" /></svg>`;
    case "мусор": return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${svgClass}"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`;
    case "освещение": return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${svgClass}"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.750 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
    default: return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${svgClass}"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`;
  }
};

const createCustomIcon = (status: string, category: string) => {
  let colorClass = "bg-red-500 border-red-700 shadow-red-200";
  let pulseClass = "animate-ping";

  if (status === "Решено") {
    colorClass = "bg-green-500 border-green-700 shadow-green-200";
    pulseClass = "";
  } else if (status === "В работе") {
    colorClass = "bg-amber-400 border-amber-600 shadow-amber-200";
    pulseClass = "animate-pulse";
  }

  const iconSvg = getCategoryIcon(category);

  return L.divIcon({
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center group">
        ${status !== 'Решено' ? `<span class="absolute inline-flex h-full w-full rounded-full ${pulseClass} ${colorClass} opacity-40"></span>` : ''}
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-110 ${colorClass}">
          ${iconSvg}
        </div>
      </div>
    `,
  });
};

// --- Основной компонент ---
interface MapProps {
  issues: Issue[];
}

export default function Map({ issues }: MapProps) {
  const [showEcology, setShowEcology] = useState(false);
  const [ecoData, setEcoData] = useState<number[][]>([]);
  const [isLoadingEco, setIsLoadingEco] = useState(false);

  const center: [number, number] = [54.8667, 69.15];

  // Функция переключения режима и загрузки данных из БД
  const handleToggleEcology = async (state: boolean) => {
    setShowEcology(state);
    
    // Загружаем данные только если включаем режим и их еще нет в памяти
    if (state && ecoData.length === 0) {
      setIsLoadingEco(true);
      try {
        const { data, error } = await supabase
          .from('ecology_data')
          .select('lat, lng, aqi');

        if (error) throw error;

        if (data) {
          const formatted = data.map(item => [
            item.lat,
            item.lng,
            item.aqi * 1.5 // Умножаем для лучшей видимости градиента
          ]);
          setEcoData(formatted);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных экологии из БД:", err);
      } finally {
        setIsLoadingEco(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      
      {/* ПЕРЕКЛЮЧАТЕЛЬ СЛОЕВ (Справа внизу) */}
      <div className="absolute bottom-8 right-6 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-1.5 flex gap-1 border border-white/20">
        <button
          onClick={() => handleToggleEcology(false)}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            !showEcology ? "bg-gray-900 text-white shadow-lg shadow-gray-300" : "bg-transparent text-gray-500 hover:bg-gray-100"
          }`}
        >
          Проблемы
        </button>
        <button
          onClick={() => handleToggleEcology(true)}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
            showEcology ? "bg-green-600 text-white shadow-lg shadow-green-200" : "bg-transparent text-gray-500 hover:bg-gray-100"
          }`}
        >
          Экология
          {isLoadingEco && <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>}
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 1, borderRadius: "1rem" }}
        zoomControl={false}
      >
        {/* Светлая карта идеально подходит для хитмапа */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {showEcology ? (
          // СЛОЙ ТЕПЛОВОЙ КАРТЫ (из БД)
          ecoData.length > 0 && (
            <HeatmapLayer
              points={ecoData}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              radius={45} // Увеличил для плотного покрытия Петропавловска
              blur={35}
              max={100}
            />
          )
        ) : (
          // МАРКЕРЫ ПРОБЛЕМ (из пропсов)
          issues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]} 
              icon={createCustomIcon(issue.status, issue.category)}
            >
              <Popup className="smart-city-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white ${
                      issue.status === 'Решено' ? 'bg-green-500' : 
                      issue.status === 'В работе' ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {issue.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {issue.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                  <Link 
                    href={`/issue/${issue.id}`}
                    className="block text-center bg-gray-900 text-white text-[10px] font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    ПОСМОТРЕТЬ ДЕТАЛИ →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
}