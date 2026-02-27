// app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoriesConfig = [
  {
    id: "Дороги",
    icon: "🛣️",
    desc: "Ямы, трещины, разметка",
    accent: "#C8F04B",
    accentBg: "rgba(200,240,75,0.08)",
    border: "rgba(200,240,75,0.15)",
  },
  {
    id: "Экология",
    icon: "🌳",
    desc: "Свалки, загрязнение, парки",
    accent: "#6BE4A0",
    accentBg: "rgba(107,228,160,0.08)",
    border: "rgba(107,228,160,0.15)",
  },
  {
    id: "ЖКХ",
    icon: "🚰",
    desc: "Вода, тепло, электричество",
    accent: "#6BE4FF",
    accentBg: "rgba(107,228,255,0.08)",
    border: "rgba(107,228,255,0.15)",
  },
  {
    id: "Освещение",
    icon: "💡",
    desc: "Фонари, тёмные дворы",
    accent: "#FFD96B",
    accentBg: "rgba(255,217,107,0.08)",
    border: "rgba(255,217,107,0.15)",
  },
  {
    id: "Безопасность",
    icon: "🛡️",
    desc: "Опасные места, камеры",
    accent: "#FF9B6B",
    accentBg: "rgba(255,155,107,0.08)",
    border: "rgba(255,155,107,0.15)",
  },
  {
    id: "Прочее",
    icon: "📋",
    desc: "Другие городские проблемы",
    accent: "#A78BFA",
    accentBg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.15)",
  },
];

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      const { data, error } = await supabase.from("issues").select("category");
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

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0E0F14" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .cat-page { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s both; }
        .cat-d1 { animation-delay: 0.04s; }
        .cat-d2 { animation-delay: 0.1s; }
        .cat-d3 { animation-delay: 0.14s; }
        .cat-d4 { animation-delay: 0.18s; }
        .cat-d5 { animation-delay: 0.22s; }
        .cat-d6 { animation-delay: 0.26s; }
        .cat-d7 { animation-delay: 0.30s; }
        .cat-d8 { animation-delay: 0.34s; }

        .cat-card {
          background: #181920;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 24px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .cat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.22s ease;
          pointer-events: none;
        }
        .cat-card:hover {
          transform: translateY(-4px);
        }

        .cat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          transition: transform 0.22s ease;
        }
        .cat-card:hover .cat-icon-wrap {
          transform: scale(1.08) rotate(-4deg);
        }

        .cat-progress-track {
          height: 3px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 14px;
        }
        .cat-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .cat-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .cat-card:hover .cat-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .cat-total-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(200,240,75,0.1);
          border: 1px solid rgba(200,240,75,0.2);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #C8F04B;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="cat-page max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* ── ШАПКА ── */}
        <div className="fade-up cat-d1 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 4, height: 32, background: "#C8F04B", borderRadius: 2, flexShrink: 0 }} />
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(26px, 6vw, 40px)",
              fontWeight: 800,
              color: "#F0F1F5",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Каталог проблем
            </h1>
          </div>
          <div className="flex items-center gap-3" style={{ paddingLeft: 19 }}>
            <p style={{ color: "#4E5162", fontSize: 13 }}>
              Выберите категорию для просмотра всех сигналов
            </p>
            {total > 0 && (
              <div className="cat-total-badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8F04B", display: "inline-block" }} />
                {total} всего
              </div>
            )}
          </div>
        </div>

        {/* ── СЕТКА КАРТОЧЕК ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: 12,
        }}>
          {categoriesConfig.map((cat, i) => {
            const count = counts[cat.id] || 0;
            const maxCount = Math.max(...Object.values(counts), 1);
            const pct = Math.round((count / maxCount) * 100);
            const delayClass = `cat-d${i + 3}`;

            return (
              <Link
                key={cat.id}
                href={`/feed?category=${encodeURIComponent(cat.id)}`}
                className={`cat-card fade-up ${delayClass}`}
                style={{
                  borderColor: hoveredId === cat.id ? cat.border : "rgba(255,255,255,0.06)",
                  background: hoveredId === cat.id ? "#1C1D26" : "#181920",
                }}
                onMouseEnter={() => setHoveredId(cat.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Верхняя строка */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div
                    className="cat-icon-wrap"
                    style={{ background: cat.accentBg, border: `1px solid ${cat.border}` }}
                  >
                    {cat.icon}
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 22,
                    color: count > 0 ? cat.accent : "#4E5162",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}>
                    {count}
                  </span>
                </div>

                {/* Название + описание */}
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#F0F1F5",
                  marginBottom: 4,
                }}>
                  {cat.id}
                </div>
                <div style={{ fontSize: 11, color: "#4E5162", marginBottom: 0 }}>
                  {cat.desc}
                </div>

                {/* Прогресс бар */}
                <div className="cat-progress-track">
                  <div
                    className="cat-progress-fill"
                    style={{ width: `${pct}%`, background: cat.accent }}
                  />
                </div>

                {/* Ссылка-стрелка */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 14,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Открыть
                  </span>
                  <span className="cat-arrow" style={{ color: cat.accent, fontSize: 14, lineHeight: 1 }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}