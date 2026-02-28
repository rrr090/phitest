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
    <div className="relative h-full w-full bg-[#0E0F14]">
      {/* Подключаем шрифт, если он не подключен глобально */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
      `}} />

      {/* ── ПАНЕЛЬ ФИЛЬТРОВ ── */}
      <div 
        className="
          absolute z-[1000]
          bottom-0 left-0 right-0
          md:bottom-auto md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-2xl
        "
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <div className="
          bg-[#181920]/90 backdrop-blur-xl
          px-4 pt-3 pb-6 md:pb-4
          rounded-t-3xl md:rounded-3xl
          shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10
          space-y-3 md:space-y-4
        ">
          {/* Drag handle — только мобилка */}
          <div className="flex justify-center md:hidden mb-2">
            <div className="w-12 h-1.5 rounded-full bg-white/10" />
          </div>

          {/* Категории */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2 md:px-5
                  rounded-full text-[13px] md:text-sm transition-all whitespace-nowrap
                  min-h-[36px]
                  ${activeCategory === cat
                    ? "bg-[#C8F04B] text-[#0E0F14] shadow-[0_4px_20px_rgba(200,240,75,0.25)] font-bold transform -translate-y-0.5"
                    : "bg-white/5 text-[#8B8E9E] hover:bg-white/10 hover:text-[#F0F1F5] font-semibold"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Статусы */}
          <div className="flex gap-4 md:gap-5 border-t border-white/10 pt-3 overflow-x-auto no-scrollbar">
            {statuses.map(stat => (
              <button
                key={stat}
                onClick={() => setActiveStatus(stat)}
                className={`
                  text-[11px] md:text-xs font-extrabold uppercase tracking-[0.1em] transition-all whitespace-nowrap
                  min-h-[28px]
                  ${activeStatus === stat 
                    ? "text-[#C8F04B] drop-shadow-[0_0_8px_rgba(200,240,75,0.4)]" 
                    : "text-[#4E5162] hover:text-[#8B8E9E]"
                  }
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