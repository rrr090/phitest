// app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoriesConfig = [
  { id: "Дороги", icon: "🛣️", color: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
  { id: "Экология", icon: "🌳", color: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  { id: "ЖКХ", icon: "🚰", color: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  { id: "Освещение", icon: "💡", color: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { id: "Безопасность", icon: "🛡️", color: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  { id: "Прочее", icon: "📋", color: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
];

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      // Запрашиваем количество записей для каждой категории
      const { data, error } = await supabase
        .from("issues")
        .select("category");

      if (!error && data) {
        const stats = data.reduce((acc: any, curr: any) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {});
        setCounts(stats);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Каталог проблем</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Выберите сферу, чтобы увидеть все активные сигналы и результаты работы городских служб.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesConfig.map((cat) => (
            <Link 
              key={cat.id}
              href={`/feed?category=${encodeURIComponent(cat.id)}`}
              className={`group p-8 rounded-3xl border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${cat.color} ${cat.border}`}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-white group-hover:rotate-12 transition-transform">
                  {cat.icon}
                </div>
                <span className="bg-white/80 px-4 py-1 rounded-full text-sm font-black shadow-sm">
                  {counts[cat.id] || 0}
                </span>
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${cat.text}`}>{cat.id}</h3>
              <p className="text-sm text-gray-500 font-medium">Посмотреть все сигналы →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}