// app/feed/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Расширяем тип, чтобы включить комментарии (если их еще нет в БД, будем показывать 0)
interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count?: number; 
}

// [UI] Тёмный неоновый статус-бейдж
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    "Решено":   { bg: "rgba(200,240,75,0.1)",  color: "#C8F04B", border: "rgba(200,240,75,0.2)" },
    "В работе": { bg: "rgba(107,228,255,0.1)", color: "#6BE4FF", border: "rgba(107,228,255,0.2)" },
    "Открыто":  { bg: "rgba(255,107,107,0.1)", color: "#FF6B6B", border: "rgba(255,107,107,0.2)" },
    "Отклонено":{ bg: "rgba(255,255,255,0.04)",color: "#8B8E9E", border: "rgba(255,255,255,0.1)" },
  };
  const s = map[status] || map["Открыто"];
  
  return (
    <span
      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

function FeedContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [rawIssues, setRawIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Стейты фильтров
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || "Все");
  const [sortBy, setSortBy] = useState("newest");

  // Стейт для локальных лайков (чтобы нельзя было спамить и кнопка реагировала мгновенно)
  const [likedLocal, setLikedLocal] = useState<Set<string>>(new Set());

  // 1. Загрузка всех данных
  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      // Если у вас в таблице есть comments_count, добавьте его в select
      const { data, error } = await supabase
        .from("issues")
        .select("id, title, category, status, description, image_url, created_at, likes_count")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setRawIssues(data as Issue[]);
      }
      setLoading(false);
    }
    fetchIssues();
  }, []);

  // 2. Логика фильтрации и сортировки
  useEffect(() => {
    let result = [...rawIssues];
    const now = new Date();
    const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Фильтр по категории
    if (categoryFilter !== "Все") {
      result = result.filter(iss => iss.category === categoryFilter);
    }

    // Фильтр по времени
    if (timeFilter === "week") {
      result = result.filter(iss => new Date(iss.created_at) >= pastWeek);
    } else if (timeFilter === "month") {
      result = result.filter(iss => new Date(iss.created_at) >= pastMonth);
    }

    // Сортировка
    if (sortBy === "likes") {
      result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortBy === "comments") {
      result.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    } else {
      // newest
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredIssues(result);
  }, [rawIssues, timeFilter, categoryFilter, sortBy]);

  // 3. Обработка лайка
  const handleLike = async (e: React.MouseEvent, id: string, currentLikes: number) => {
    e.preventDefault(); // Останавливаем переход по ссылке карточки
    
    if (likedLocal.has(id)) return; // Уже лайкнули

    // Оптимистичное обновление UI
    setLikedLocal(prev => new Set(prev).add(id));
    setRawIssues(prev => prev.map(iss => 
      iss.id === id ? { ...iss, likes_count: (iss.likes_count || 0) + 1 } : iss
    ));

    // Отправка в БД (Supabase)
    const { error } = await supabase
      .from('issues')
      .update({ likes_count: currentLikes + 1 })
      .eq('id', id);

    if (error) {
      console.error("Ошибка при постановке лайка", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-2xl h-36 w-full" 
            style={{ 
              background: "linear-gradient(90deg, #181920 25%, rgba(255,255,255,0.04) 50%, #181920 75%)",
              backgroundSize: "1000px 100%",
              animation: "shimmer 2s infinite linear",
              animationDelay: `${i * 0.08}s` 
            }} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      
      {/* ── ЗАГОЛОВОК ── */}
      <div className="flex items-center gap-3 animate-fade-up">
        <div style={{ width: 4, height: 32, background: "#C8F04B", borderRadius: 2 }} />
        <h1 
          className="text-[clamp(26px,5vw,36px)] font-[800] tracking-[-0.03em] leading-tight"
          style={{ fontFamily: "'Syne', sans-serif", color: "#F0F1F5" }}
        >
          Лента сигналов
        </h1>
      </div>

      {/* ── ПАНЕЛЬ ФИЛЬТРОВ ── */}
      <div className="animate-fade-up d1 flex flex-wrap gap-3">
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)} 
          className="feed-filter-select"
        >
          <option value="all">За всё время</option>
          <option value="month">За 30 дней</option>
          <option value="week">За 7 дней</option>
        </select>

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)} 
          className="feed-filter-select"
        >
          <option value="Все">Все категории</option>
          <option value="Дороги">Дороги</option>
          <option value="Освещение">Освещение</option>
          <option value="ЖКХ">ЖКХ</option>
          <option value="Мусор">Мусор</option>
          <option value="Другое">Другое</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="feed-filter-select flex-1 sm:flex-none"
        >
          <option value="newest">🕒 Сначала новые</option>
          <option value="likes">❤️ По популярности</option>
          <option value="comments">💬 Обсуждаемые</option>
        </select>
      </div>

      {/* ── СПИСОК СИГНАЛОВ ── */}
      {filteredIssues.length === 0 ? (
        <div 
          className="p-16 rounded-3xl border border-dashed text-center animate-fade-up d2"
          style={{ borderColor: "rgba(255,255,255,0.1)", background: "#181920" }}
        >
          <div className="text-4xl mb-4">📭</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#F0F1F5" }}>
            Ничего не найдено
          </div>
          <div style={{ color: "#4E5162", fontSize: 13, marginTop: 8 }}>
            Попробуйте изменить параметры фильтра
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIssues.map((issue, i) => {
            const isLiked = likedLocal.has(issue.id);

            return (
              <Link
                href={`/issue/${issue.id}`}
                key={issue.id}
                className="group animate-fade-up block"
                style={{ animationDelay: `${0.1 + i * 0.05}s`, textDecoration: "none" }}
              >
                <div 
                  className="p-3.5 sm:p-4 rounded-2xl flex gap-4 sm:gap-5 transition-all duration-300 relative"
                  style={{ 
                    background: "#181920", 
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,240,75,0.25)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* ── ТУМБНЕЙЛ ── */}
                  <div 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-[1.03]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {issue.image_url ? (
                      <img src={issue.image_url} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" alt="" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ color: "#4E5162" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Фото нет</span>
                      </div>
                    )}
                  </div>

                  {/* ── ИНФО ── */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] truncate" style={{ color: "#6BE4FF" }}>
                          {issue.category}
                        </span>
                        <div className="shrink-0"><StatusBadge status={issue.status} /></div>
                      </div>
                      
                      <h2 
                        className="text-sm sm:text-base font-bold mb-1.5 line-clamp-1 transition-colors"
                        style={{ fontFamily: "'Syne', sans-serif", color: "#F0F1F5" }}
                      >
                        {issue.title}
                      </h2>
                      
                      <p className="text-xs sm:text-[13px] line-clamp-2 leading-relaxed" style={{ color: "#8B8E9E" }}>
                        {issue.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-medium" style={{ color: "#4E5162" }}>
                        {new Date(issue.created_at).toLocaleDateString("ru-RU", { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </span>
                      
                      {/* ── АКТИВНОСТЬ (Лайки и Комменты) ── */}
                      <div className="flex gap-2">
                        {/* Комментарии (только для вида/перехода на страницу) */}
                        <div 
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ color: "#8B8E9E", background: "rgba(255,255,255,0.03)" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="text-[11px] font-bold">{issue.comments_count || 0}</span>
                        </div>

                        {/* Интерактивная кнопка лайка */}
                        <button 
                          onClick={(e) => handleLike(e, issue.id, issue.likes_count || 0)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${isLiked ? 'scale-105' : 'hover:bg-white/5 hover:scale-105'}`}
                          style={{ 
                            background: isLiked ? "rgba(200,240,75,0.15)" : "rgba(255,255,255,0.03)", 
                            color: isLiked ? "#C8F04B" : "#8B8E9E",
                            border: isLiked ? "1px solid rgba(200,240,75,0.3)" : "1px solid transparent"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span className="text-[11px] font-bold">{issue.likes_count || 0}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-10" style={{ background: "#0E0F14", fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* Глобальные стили для ленты */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s; }

        .feed-filter-select {
          background: #181920;
          border: 1px solid rgba(255,255,255,0.1);
          color: #F0F1F5;
          padding: 10px 14px;
          border-radius: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 600;
          outline: none; cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B8E9E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 14px;
          padding-right: 32px;
        }
        .feed-filter-select:focus {
          border-color: #C8F04B;
          box-shadow: 0 0 0 1px #C8F04B;
        }
      `}</style>

      <Suspense fallback={
        <div className="h-full flex items-center justify-center" style={{ color: "#4E5162" }}>
          <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#C8F04B] animate-spin" />
        </div>
      }>
        <FeedContent />
      </Suspense>
    </div>
  );
}