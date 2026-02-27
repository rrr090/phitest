// app/ratings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserRank { name: string; points: number; count: number; }

export default function RatingsPage() {
  const [leaders, setLeaders] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      const { data, error } = await supabase.from("issues").select("author_name, status");
      if (!error && data) {
        const userStats: Record<string, UserRank> = {};
        data.forEach((issue) => {
          const name = issue.author_name || "Аноним";
          if (!userStats[name]) userStats[name] = { name, points: 0, count: 0 };
          userStats[name].count += 1;
          userStats[name].points += 10;
          if (issue.status === "Решено") userStats[name].points += 50;
        });
        setLeaders(Object.values(userStats).sort((a, b) => b.points - a.points));
      }
      setLoading(false);
    }
    fetchRankings();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--accent-amber)" }} />
      </div>
    );
  }

  // [UI] Медали с тёплыми кофейными акцентами
  const medals = [
    { emoji: "🥇", bg: "var(--accent-caramel-bg)", border: "rgba(212,148,79,0.25)", color: "var(--accent-caramel)" },
    { emoji: "🥈", bg: "var(--accent-sky-bg)",     border: "rgba(110,154,176,0.25)", color: "var(--accent-sky)" },
    { emoji: "🥉", bg: "var(--accent-clay-bg)",    border: "rgba(181,107,94,0.25)",  color: "var(--accent-clay)" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* [UI] Заголовок с inline тёрракотовым выделением */}
        <div className="text-center space-y-3 animate-fade-up">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1.1 }}
          >
            Герои{" "}
            <em
              className="not-italic px-3 py-1 rounded-xl"
              style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-amber)", borderBottom: "2px solid var(--accent-caramel)" }}
            >
              Петропавловска
            </em>
          </h1>
          <p className="text-lg animate-fade-up delay-1" style={{ color: "var(--text-muted)" }}>
            Жители, которые делают наш город лучше каждый день
          </p>
        </div>

        {/* [UI] Пьедестал — порядок S/G/B для визуальной иерархии */}
        {leaders.length >= 1 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-5 pt-4">
            {[1, 0, 2].map((originalIndex) => {
              const user = leaders[originalIndex];
              if (!user) return null;
              const medal = medals[originalIndex];
              const isFirst = originalIndex === 0;
              return (
                <div
                  key={user.name}
                  className="animate-fade-up"
                  style={{ animationDelay: `${0.05 + originalIndex * 0.08}s`, flex: isFirst ? "0 0 260px" : "0 0 220px" }}
                >
                  <div
                    className="p-8 rounded-3xl flex flex-col items-center transition-all duration-300 cursor-default"
                    style={{
                      background: "var(--card-bg)",
                      border: `1px solid ${medal.border}`,
                      boxShadow: isFirst ? `0 16px 50px rgba(100,70,40,0.12)` : "var(--card-shadow)",
                      transform: isFirst ? "translateY(-12px)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = isFirst ? "translateY(-18px)" : "translateY(-6px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = isFirst ? "translateY(-12px)" : "translateY(0)";
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
                      style={{ background: medal.bg }}
                    >
                      {medal.emoji}
                    </div>
                    <h3 className="font-black text-lg text-center truncate w-full" style={{ color: "var(--text-primary)" }}>
                      {user.name}
                    </h3>
                    <p className="text-xs font-bold mt-1 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                      {user.count} сигналов
                    </p>
                    <div
                      className="mt-6 px-6 py-2.5 rounded-2xl font-black text-lg"
                      style={{ background: medal.bg, color: medal.color }}
                    >
                      {user.points} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* [UI] Лидерборд — кремовая карточка */}
        <div
          className="rounded-3xl overflow-hidden animate-fade-up delay-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
        >
          <div
            className="px-6 py-5 flex justify-between items-center"
            style={{ borderBottom: "1px solid var(--card-border)" }}
          >
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Общий лидерборд</h2>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {leaders.length} участников
            </span>
          </div>
          <div>
            {leaders.slice(3, 10).map((user, idx) => (
              <div
                key={user.name}
                className="flex items-center justify-between px-6 py-4 transition-colors"
                style={{ borderBottom: "1px solid rgba(100,70,40,0.04)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(100,70,40,0.025)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div className="flex items-center gap-4">
                  <span className="font-black w-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    {idx + 4}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                    style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-amber)", fontFamily: "var(--font-display)" }}
                  >
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.count} обращений</p>
                  </div>
                </div>
                <span
                  className="font-black px-4 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(100,70,40,0.05)", color: "var(--text-primary)" }}
                >
                  {user.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
