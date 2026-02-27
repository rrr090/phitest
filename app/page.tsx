"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";

// Динамический импорт карты (чтобы не было ошибок SSR)
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeStatus, setActiveStatus] = useState("Все");

  const categories = ["Все", "Дороги", "Освещение", "ЖКХ", "Мусор", "Другое"];
  const statuses = ["Все", "Открыто", "В работе", "Решено"];

  useEffect(() => {
    async function fetchIssues() {
      const { data } = await supabase.from("issues").select("*");
      if (data) {
        setIssues(data);
        setFilteredIssues(data);
      }
    }
    fetchIssues();
  }, []);

  // Логика фильтрации
  useEffect(() => {
    let result = issues;

    if (activeCategory !== "Все") {
      result = result.filter(iss => iss.category === activeCategory);
    }

    if (activeStatus !== "Все") {
      result = result.filter(iss => iss.status === activeStatus);
    }

    setFilteredIssues(result);
  }, [activeCategory, activeStatus, issues]);

  return (
    <div className="relative h-full w-full">
      {/* ПАНЕЛЬ ФИЛЬТРОВ (Плавающая поверх карты) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-2xl">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/20 space-y-3">
          
          {/* Категории */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Статусы */}
          <div className="flex gap-4 border-t border-gray-100 pt-3">
            {statuses.map(stat => (
              <button
                key={stat}
                onClick={() => setActiveStatus(stat)}
                className={`text-xs font-black uppercase tracking-widest transition-colors ${
                  activeStatus === stat ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {stat === "Все" ? "Все статусы" : stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* КАРТА */}
      <Map issues={filteredIssues} />
    </div>
  );
}