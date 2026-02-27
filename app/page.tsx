// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabase";
import { Issue } from "../lib/types"; // Импортируем наш тип!

// Динамический импорт карты (отключаем SSR для Leaflet)
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <span className="text-4xl">🗺️</span>
        <span className="font-medium text-lg">Загрузка карты Петропавловска...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [dbStatus, setDbStatus] = useState("Подключение к БД...");
  const [issuesData, setIssuesData] = useState<Issue[]>([]);

  useEffect(() => {
    async function fetchIssues() {
      // 🚀 Теперь запрашиваем данные из новой таблицы issues!
      const { data, error } = await supabase.from("issues").select("*");
      
      if (error) {
        setDbStatus("❌ Ошибка соединения");
        console.error("Ошибка Supabase:", error);
      } else {
        setDbStatus(`✅ Найдено проблем: ${data?.length || 0}`);
        setIssuesData(data as Issue[]);
      }
    }
    
    fetchIssues();
  }, []);

  return (
    <div className="h-full w-full relative">
      {/* Плавающий бейдж статуса */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-gray-200 text-sm font-medium flex items-center gap-2 transition-all">
        <div className={`w-2 h-2 rounded-full ${dbStatus.includes("✅") ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
        {dbStatus}
      </div>
      
      {/* Передаем загруженные проблемы (issues) в компонент карты */}
      <MapComponent data={issuesData} />
    </div>
  );
}