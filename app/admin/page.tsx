// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Все");

  const fetchIssues = async () => {
    setLoading(true);
    let query = supabase.from("issues").select("*").order("created_at", { ascending: false });
    if (filter !== "Все") query = query.eq("status", filter);
    const { data, error } = await query;
    if (!error) setIssues(data as Issue[]);
    setLoading(false);
  };

  useEffect(() => { fetchIssues(); }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setIssues(issues.map((iss) => iss.id === id ? { ...iss, status: newStatus as any } : iss));
    } else {
      alert("Ошибка при обновлении статуса");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* [UI] Заголовок + кофейный акцент-лейбл */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 animate-fade-up">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent-amber)" }}>
              Панель модератора
            </p>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1.1 }}
            >
              Управление городом
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Петропавловск</p>
          </div>

          {/* [UI] Фильтр — тёплые pill-переключатели */}
          <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(100,70,40,0.08)" }}>
            {["Все", "Открыто", "В работе", "Решено"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: filter === f ? "var(--accent-amber)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* [UI] Таблица — кремовая карточка */}
        <div
          className="rounded-3xl overflow-hidden animate-fade-up delay-1"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-[10px] uppercase tracking-widest font-black"
                  style={{ background: "rgba(100,70,40,0.04)", borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}
                >
                  <th className="px-6 py-4">Проблема</th>
                  <th className="px-6 py-4">Категория</th>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-16">
                      <div className="space-y-3 max-w-xl mx-auto">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="shimmer h-12 rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center" style={{ color: "var(--text-muted)" }}>
                      Нет заявок с таким статусом
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(100,70,40,0.04)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(100,70,40,0.025)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ background: "#e8e0d4" }}>
                            {issue.image_url ? (
                              <img src={issue.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: "#c4a98a" }}>📍</div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/issue/${issue.id}`}
                              className="font-bold block transition-colors"
                              style={{ color: "var(--text-primary)" }}
                              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-amber)")}
                              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-primary)")}
                            >
                              {issue.title}
                            </Link>
                            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {issue.address || "Адрес не указан"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: "var(--accent-sky-bg)", color: "var(--accent-sky)" }}
                        >
                          {issue.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        {new Date(issue.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-5">
                        {/* [UI] select с тёплыми статус-цветами */}
                        <select
                          value={issue.status}
                          onChange={(e) => updateStatus(issue.id, e.target.value)}
                          className="text-xs font-black px-3 py-1.5 rounded-full cursor-pointer transition-all"
                          style={{
                            background: issue.status === "Решено" ? "var(--status-done-bg)"
                              : issue.status === "В работе" ? "var(--status-wip-bg)"
                              : "var(--status-open-bg)",
                            color: issue.status === "Решено" ? "var(--status-done)"
                              : issue.status === "В работе" ? "var(--status-wip)"
                              : "var(--status-open)",
                            border: "none",
                            outline: "none",
                          }}
                        >
                          <option value="Открыто">🔴 Открыто</option>
                          <option value="В работе">🟡 В работе</option>
                          <option value="Решено">🟢 Решено</option>
                          <option value="Отклонено">⚪ Отклонено</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/issue/${issue.id}`}
                          className="text-xs font-black uppercase tracking-widest transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-primary)")}
                          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                        >
                          Детали →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
