// app/ratings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserRank { name: string; points: number; count: number; solved: number; }

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
          if (!userStats[name]) userStats[name] = { name, points: 0, count: 0, solved: 0 };
          userStats[name].count += 1;
          userStats[name].points += 10;
          if (issue.status === "Решено") {
            userStats[name].points += 50;
            userStats[name].solved += 1;
          }
        });
        setLeaders(Object.values(userStats).sort((a, b) => b.points - a.points));
      }
      setLoading(false);
    }
    fetchRankings();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const getRankLabel = (idx: number) => {
    if (idx === 0) return { label: "I", color: "#C8F04B" };
    if (idx === 1) return { label: "II", color: "#6BE4FF" };
    if (idx === 2) return { label: "III", color: "#FF9B6B" };
    return { label: String(idx + 1), color: "#4E5162" };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0E0F14" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner { animation: spin 0.9s linear infinite; }
        `}</style>
        <div className="spinner w-8 h-8 rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#C8F04B" }} />
      </div>
    );
  }

  const podium = [leaders[0], leaders[1], leaders[2]];
  const rest = leaders.slice(3, 15);
  const totalPoints = leaders.reduce((s, u) => s + u.points, 0);
  const totalSolved = leaders.reduce((s, u) => s + u.solved, 0);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0E0F14" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .rat-page { font-family: 'JetBrains Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.19s; }
        .d4 { animation-delay: 0.26s; }
        .d5 { animation-delay: 0.33s; }

        .rat-stat-card {
          background: #181920;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 24px;
        }

        .rat-podium-card {
          background: #181920;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          transition: transform 0.22s ease, border-color 0.22s ease;
          cursor: default;
        }
        .rat-podium-card:hover {
          border-color: rgba(200,240,75,0.2);
        }

        .rat-bar-fill {
          height: 3px;
          background: linear-gradient(90deg, #C8F04B, #8EFF00);
          border-radius: 2px;
          transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .rat-row {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s ease;
          border-radius: 10px;
          gap: 14px;
        }
        .rat-row:hover { background: rgba(255,255,255,0.025); }

        .rat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 13px;
          flex-shrink: 0;
          background: rgba(200,240,75,0.1);
          color: #C8F04B;
          border: 1px solid rgba(200,240,75,0.15);
        }

        .rat-pts-badge {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: rgba(240,241,245,0.7);
          white-space: nowrap;
        }

        .rat-number {
          font-family: 'Syne', sans-serif;
          font-size: 64px;
          font-weight: 800;
          line-height: 1;
          color: #F0F1F5;
          letter-spacing: -0.04em;
        }

        /* Пьедестал */
        .rat-p1 { transform: translateY(-16px); }
        .rat-p2 { transform: translateY(0); }
        .rat-p3 { transform: translateY(8px); }
        @media (max-width: 640px) {
          .rat-p1, .rat-p2, .rat-p3 { transform: translateY(0); }
        }
      `}</style>

      <div className="rat-page max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-10">

        {/* ── ШАПКА ── */}
        <div className="fade-up d1 space-y-2">
          <div className="flex items-center gap-3">
            <div style={{
              width: 4, height: 32,
              background: "#C8F04B",
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 6vw, 42px)",
              fontWeight: 800,
              color: "#F0F1F5",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Рейтинг жителей
            </h1>
          </div>
          <p style={{ color: "#4E5162", fontSize: 13, paddingLeft: 19 }}>
            Активисты, которые делают Петропавловск лучше
          </p>
        </div>

        {/* ── СТАТИСТИКА ── */}
        <div className="fade-up d2 grid grid-cols-3 gap-3">
          {[
            { label: "участников", value: leaders.length },
            { label: "решено задач", value: totalSolved },
            { label: "очков выдано", value: totalPoints },
          ].map(s => (
            <div key={s.label} className="rat-stat-card">
              <div className="rat-number">{s.value}</div>
              <div style={{ fontSize: 11, color: "#4E5162", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── ПЬЕДЕСТАЛ ── */}
        {podium.length >= 1 && (
          <div className="fade-up d3 flex items-end justify-center gap-3 sm:gap-5 pt-2">
            {[1, 0, 2].map((origIdx) => {
              const user = podium[origIdx];
              if (!user) return null;
              const rank = getRankLabel(origIdx);
              const isFirst = origIdx === 0;
              const heights = [null, "rat-p1", "rat-p2", "rat-p3"];
              const maxPts = podium[0]?.points || 1;
              const barWidth = Math.round((user.points / maxPts) * 100);

              return (
                <div
                  key={user.name}
                  className={`rat-podium-card ${heights[origIdx + 1] ?? ""}`}
                  style={{
                    flex: isFirst ? "0 0 min(260px, 38vw)" : "0 0 min(210px, 30vw)",
                    padding: isFirst ? "28px 24px" : "22px 18px",
                    borderColor: isFirst ? "rgba(200,240,75,0.25)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Ранг */}
                  <div style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: isFirst ? 13 : 11,
                    fontWeight: 800,
                    color: rank.color,
                    letterSpacing: "0.15em",
                    marginBottom: 16,
                  }}>
                    RANK {rank.label}
                  </div>

                  {/* Аватар + имя */}
                  <div style={{
                    width: isFirst ? 52 : 42,
                    height: isFirst ? 52 : 42,
                    borderRadius: 14,
                    background: `rgba(200,240,75,0.08)`,
                    border: `1.5px solid ${rank.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: isFirst ? 18 : 14,
                    color: rank.color,
                    marginBottom: 12,
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <div style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: isFirst ? 15 : 13,
                    color: "#F0F1F5",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#4E5162", marginTop: 3 }}>
                    {user.count} сигн. · {user.solved} решено
                  </div>

                  {/* Прогресс бар */}
                  <div style={{ marginTop: 16, background: "rgba(255,255,255,0.06)", borderRadius: 2, height: 3 }}>
                    <div className="rat-bar-fill" style={{ width: `${barWidth}%`, background: rank.color === "#C8F04B" ? "linear-gradient(90deg,#C8F04B,#8EFF00)" : rank.color === "#6BE4FF" ? "linear-gradient(90deg,#6BE4FF,#3DC0FF)" : "linear-gradient(90deg,#FF9B6B,#FF6B3D)" }} />
                  </div>

                  {/* Очки */}
                  <div style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                  }}>
                    <span style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: isFirst ? 28 : 22,
                      color: rank.color,
                      letterSpacing: "-0.03em",
                    }}>
                      {user.points}
                    </span>
                    <span style={{ fontSize: 11, color: "#4E5162" }}>pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ЛИДЕРБОРД ── */}
        {rest.length > 0 && (
          <div
            className="fade-up d4 rounded-2xl overflow-hidden"
            style={{ background: "#181920", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#F0F1F5" }}>
                Все участники
              </span>
              <span style={{ fontSize: 11, color: "#4E5162", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                #{4}–#{leaders.length}
              </span>
            </div>
            <div style={{ padding: "6px 8px" }}>
              {rest.map((user, idx) => {
                const rank = getRankLabel(idx + 3);
                const maxPts = leaders[0]?.points || 1;
                const pct = Math.round((user.points / maxPts) * 100);
                return (
                  <div key={user.name} className="rat-row">
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#4E5162",
                      width: 24,
                      flexShrink: 0,
                      textAlign: "center",
                    }}>
                      {idx + 4}
                    </span>
                    <div className="rat-avatar">{getInitials(user.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#F0F1F5",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#4E5162", marginTop: 2 }}>
                        {user.count} сигн. · {user.solved} решено
                      </div>
                      <div style={{ marginTop: 6, background: "rgba(255,255,255,0.04)", borderRadius: 2, height: 2 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#C8F04B33", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div className="rat-pts-badge">{user.points} pts</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ПУСТОЕ СОСТОЯНИЕ ── */}
        {leaders.length === 0 && (
          <div className="fade-up d2 text-center py-24">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <p style={{ color: "#4E5162", fontSize: 14 }}>Пока нет данных для рейтинга</p>
          </div>
        )}
      </div>
    </div>
  );
}