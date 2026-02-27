// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

// [UI] Глобальные стили и токены — кофейно-бежевая тема в духе Phamily
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

  :root {
    --bg-base:           #f5ede0;
    --bg-elevated:       #ede0cc;
    --card-bg:           #fdf8f2;
    --card-border:       rgba(160,110,60,0.14);
    --card-shadow:       0 2px 24px rgba(100,55,10,0.09), 0 1px 4px rgba(100,55,10,0.06);
    --card-shadow-hover: 0 8px 40px rgba(100,55,10,0.15), 0 2px 8px rgba(100,55,10,0.08);

    --text-primary:   #2a1a0a;
    --text-secondary: #6b4827;
    --text-muted:     #a07850;

    --accent-amber:      #b86e28;
    --accent-amber-light:#f5e5cf;
    --accent-amber-pill: #fef0df;

    --accent-sky:    #3d7ea6;
    --accent-sky-bg: rgba(61,126,166,0.09);

    --status-open:    #b03030;
    --status-open-bg: #fde8e8;
    --status-wip:     #9a6510;
    --status-wip-bg:  #fef4dc;
    --status-done:    #2a7040;
    --status-done-bg: #e4f5eb;

    --font-display: 'Playfair Display', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;

    --radius-card: 20px;
    --radius-pill: 999px;
    --radius-sm:   10px;
  }

  /* [UI] Базовый фон страницы */
  .admin-page-wrap {
    min-height: 100%;
    overflow-y: auto;
    padding: 40px 24px 80px;
    background: var(--bg-elevated);
    font-family: var(--font-body);
  }

  /* [UI] Анимации появления */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes statusPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  .anim-fade-up       { animation: fadeUp 0.55s cubic-bezier(.22,.9,.36,1) both; }
  .anim-fade-up.d1    { animation-delay: 0.08s; }
  .anim-fade-up.d2    { animation-delay: 0.16s; }
  .anim-fade-up.d3    { animation-delay: 0.22s; }
  .anim-fade-up.d4    { animation-delay: 0.28s; }

  .shimmer-row {
    background: linear-gradient(90deg,
      rgba(180,140,90,0.08) 25%,
      rgba(180,140,90,0.18) 50%,
      rgba(180,140,90,0.08) 75%
    );
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 12px;
    height: 52px;
  }

  /* [UI] Заголовочная зона */
  .admin-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 36px; }

  .admin-eyebrow {
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--accent-amber);
    background: var(--accent-amber-pill);
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    margin-bottom: 10px;
  }
  .admin-title {
    font-family: var(--font-display);
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 900;
    color: var(--text-primary);
    line-height: 1.05;
    margin: 0 0 4px;
  }
  .admin-subtitle {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    margin: 0;
  }

  /* [UI] Фильтр-таблетки */
  .filter-bar {
    display: flex;
    gap: 4px;
    padding: 5px;
    background: rgba(160,110,60,0.08);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    backdrop-filter: blur(4px);
  }
  .filter-pill {
    padding: 8px 18px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: background .18s, color .18s, transform .15s, box-shadow .18s;
    font-family: var(--font-body);
    letter-spacing: .02em;
    background: transparent;
    color: var(--text-secondary);
  }
  .filter-pill:hover {
    background: rgba(180,110,40,0.08);
    transform: translateY(-1px);
  }
  .filter-pill.active {
    background: var(--accent-amber);
    color: #fff;
    box-shadow: 0 3px 12px rgba(184,110,40,0.32);
    transform: translateY(-1px);
  }

  /* [UI] Карточка-таблица */
  .table-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    box-shadow: var(--card-shadow);
    border-radius: var(--radius-card);
    overflow: hidden;
    transition: box-shadow .25s;
  }
  .table-scroll { overflow-x: auto; }

  table { width: 100%; border-collapse: collapse; }

  thead tr {
    background: rgba(160,110,60,0.05);
    border-bottom: 1px solid var(--card-border);
  }
  th {
    padding: 14px 22px;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-family: var(--font-body);
    white-space: nowrap;
  }
  th:last-child { text-align: right; }

  /* [UI] Строки таблицы */
  .issue-row {
    border-bottom: 1px solid rgba(160,110,60,0.06);
    transition: background .15s;
    animation: fadeIn 0.4s ease both;
  }
  .issue-row:last-child { border-bottom: none; }
  .issue-row:hover { background: rgba(160,110,60,0.035); }

  td { padding: 18px 22px; vertical-align: middle; }

  /* [UI] Превью + заголовок */
  .issue-thumb {
    width: 44px; height: 44px;
    border-radius: 12px;
    overflow: hidden;
    background: #eddfc8;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    color: #c4a070;
    border: 1px solid rgba(160,110,60,0.12);
  }
  .issue-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .issue-title-link {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
    display: block;
    transition: color .15s;
    line-height: 1.3;
  }
  .issue-title-link:hover { color: var(--accent-amber); }

  .issue-address {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }

  /* [UI] Бейдж категории */
  .category-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 11px;
    border-radius: var(--radius-pill);
    background: var(--accent-sky-bg);
    color: var(--accent-sky);
    white-space: nowrap;
  }

  /* [UI] Дата */
  .date-cell {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  /* [UI] Select статуса — styled pill */
  .status-select {
    font-size: 11px;
    font-weight: 800;
    padding: 5px 12px;
    border-radius: var(--radius-pill);
    border: none;
    outline: none;
    cursor: pointer;
    font-family: var(--font-body);
    letter-spacing: .02em;
    transition: box-shadow .2s, transform .15s;
    appearance: none;
    -webkit-appearance: none;
  }
  .status-select:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
  .status-select:focus { box-shadow: 0 0 0 3px rgba(184,110,40,0.2); }
  .status-select.pop { animation: statusPop .35s cubic-bezier(.22,.9,.36,1); }

  .status-open   { background: var(--status-open-bg);  color: var(--status-open); }
  .status-wip    { background: var(--status-wip-bg);   color: var(--status-wip); }
  .status-done   { background: var(--status-done-bg);  color: var(--status-done); }
  .status-other  { background: rgba(160,110,60,0.09);  color: var(--text-muted); }

  /* [UI] Детали-ссылка */
  .details-link {
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .1em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text-muted);
    transition: color .15s;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .details-link:hover { color: var(--accent-amber); }

  /* [UI] Пустое состояние */
  .empty-state {
    padding: 72px 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
  }
  .empty-state-icon { font-size: 40px; margin-bottom: 12px; display: block; opacity: 0.5; }

  @media (max-width: 640px) {
    .admin-page-wrap { padding: 24px 14px 60px; }
    .admin-title { font-size: 26px; }
    th, td { padding: 12px 14px; }
  }
`;

function getStatusClass(status: string) {
  if (status === "Решено") return "status-done";
  if (status === "В работе") return "status-wip";
  if (status === "Открыто") return "status-open";
  return "status-other";
}

function getStatusEmoji(status: string) {
  if (status === "Решено") return "🟢";
  if (status === "В работе") return "🟡";
  if (status === "Открыто") return "🔴";
  return "⚪";
}

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Все");
  const [poppingId, setPoppingId] = useState<string | null>(null);

  // — логика не изменена —
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
      setPoppingId(id);
      setTimeout(() => setPoppingId(null), 400);
      setIssues(issues.map((iss) => iss.id === id ? { ...iss, status: newStatus as any } : iss));
    } else {
      alert("Ошибка при обновлении статуса");
    }
  };

  return (
    <>
      {/* [UI] Инжект стилей */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="admin-page-wrap">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* [UI] Заголовок */}
          <div className="admin-header anim-fade-up">
            <div>
              {/* [UI] Eyebrow-лейбл как яркая пилюля */}
              <span className="admin-eyebrow">Панель модератора</span>
              <h1 className="admin-title">Управление городом</h1>
              <p className="admin-subtitle">Петропавловск</p>
            </div>

            {/* [UI] Фильтр-пиллы с анимацией */}
            <div className="filter-bar">
              {["Все", "Открыто", "В работе", "Решено"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-pill${filter === f ? " active" : ""}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* [UI] Карточка-таблица */}
          <div className="table-card anim-fade-up d2">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Проблема</th>
                    <th>Категория</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th style={{ textAlign: "right" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "32px 22px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 700, margin: "0 auto" }}>
                          {[...Array(4)].map((_, i) => (
                            // [UI] Shimmer-скелетоны вместо спиннера
                            <div key={i} className="shimmer-row" style={{ animationDelay: `${i * 0.12}s`, opacity: 1 - i * 0.15 }} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : issues.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <span className="empty-state-icon">📭</span>
                          Нет заявок с таким статусом
                        </div>
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue, idx) => (
                      <tr
                        key={issue.id}
                        className="issue-row"
                        style={{ animationDelay: `${idx * 0.04}s` }}
                      >
                        {/* Проблема */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            {/* [UI] Превью с rounded corners */}
                            <div className="issue-thumb">
                              {issue.image_url
                                ? <img src={issue.image_url} alt="" />
                                : <span>📍</span>}
                            </div>
                            <div>
                              <Link href={`/issue/${issue.id}`} className="issue-title-link">
                                {issue.title}
                              </Link>
                              <p className="issue-address">{issue.address || "Адрес не указан"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Категория */}
                        <td>
                          <span className="category-badge">{issue.category}</span>
                        </td>

                        {/* Дата */}
                        <td>
                          <span className="date-cell">
                            {new Date(issue.created_at).toLocaleDateString("ru-RU")}
                          </span>
                        </td>

                        {/* [UI] Статус-select с pop-анимацией при изменении */}
                        <td>
                          <select
                            value={issue.status}
                            onChange={(e) => updateStatus(issue.id, e.target.value)}
                            className={`status-select ${getStatusClass(issue.status)}${poppingId === issue.id ? " pop" : ""}`}
                          >
                            <option value="Открыто">🔴 Открыто</option>
                            <option value="В работе">🟡 В работе</option>
                            <option value="Решено">🟢 Решено</option>
                            <option value="Отклонено">⚪ Отклонено</option>
                          </select>
                        </td>

                        {/* Действия */}
                        <td style={{ textAlign: "right" }}>
                          <Link href={`/issue/${issue.id}`} className="details-link">
                            Детали <span style={{ fontSize: 14 }}>→</span>
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
    </>
  );
}
