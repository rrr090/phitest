"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";

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

  useEffect(() => {
    let result = issues;
    if (activeCategory !== "Все") result = result.filter(iss => iss.category === activeCategory);
    if (activeStatus !== "Все") result = result.filter(iss => iss.status === activeStatus);
    setFilteredIssues(result);
  }, [activeCategory, activeStatus, issues]);

  return (
    <div className="relative h-full w-full">

      {/* ── ПАНЕЛЬ ФИЛЬТРОВ ── */}
      <div className="
        absolute z-[1000]
        /* Мобилка: снизу, над bottom-nav (bottom-0, учитываем pb через safe-area) */
        bottom-0 left-0 right-0
        /* ПК: сверху по центру */
        md:bottom-auto md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-2xl
      ">
        <div className="
          bg-white/90 md:bg-white/80 backdrop-blur-md
          px-4 pt-3 pb-4
          /* Мобилка: скруглены только верхние углы + safe area снизу */
          rounded-t-2xl md:rounded-3xl
          shadow-2xl border border-white/20
          /* Мобилка: горизонтальная прокрутка для категорий + вертикальный layout */
          space-y-2 md:space-y-3
        ">
          {/* Drag handle — только мобилка */}
          <div className="flex justify-center md:hidden mb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Категории */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-3 py-1.5 md:px-4
                  rounded-full text-xs font-bold transition-all whitespace-nowrap
                  /* Чуть крупнее тап-зона на мобилке */
                  min-h-[34px]
                  ${activeCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Статусы */}
          <div className="flex gap-3 md:gap-4 border-t border-gray-100 pt-2 md:pt-3 overflow-x-auto no-scrollbar">
            {statuses.map(stat => (
              <button
                key={stat}
                onClick={() => setActiveStatus(stat)}
                className={`
                  text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap
                  min-h-[28px]
                  ${activeStatus === stat ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}
                `}
              >
                {stat === "Все" ? "Все статусы" : stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── КАРТА ── */}
      <Map issues={filteredIssues} />
    </div>
  );
}