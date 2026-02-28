"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

// ─── ФУНКЦИИ ГЕЙМИФИКАЦИИ ───
function calculateStats(issues: Issue[]) {
  const total = issues.length;
  const solved = issues.filter(i => i.status === "Решено").length;
  const likes = issues.reduce((acc, issue) => acc + (issue.likes_count || 0), 0);
  
  // Формула очков: 10 за сигнал, 50 за решение, 2 за каждый лайк
  const points = (total * 10) + (solved * 50) + (likes * 2);
  
  return { total, solved, likes, points };
}

function getLevelInfo(pts: number) {
  if (pts < 50)   return { title: "Наблюдатель", next: 50,   progress: (pts / 50) * 100,         color: "#8B8E9E" };
  if (pts < 200)  return { title: "Активист",    next: 200,  progress: ((pts - 50) / 150) * 100, color: "#6BE4FF" };
  if (pts < 500)  return { title: "Урбанист",    next: 500,  progress: ((pts - 200) / 300) * 100,color: "#FF9B6B" };
  if (pts < 1000) return { title: "Реформатор",  next: 1000, progress: ((pts - 500) / 500) * 100,color: "#C8F04B" };
  return                 { title: "Герой города",next: pts,  progress: 100,                      color: "#FF6B3D" };
}

// ─── UI КОМПОНЕНТЫ ───
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
      className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("issues")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        setMyIssues(data as Issue[] || []);
      }
      setLoading(false);
    }
    loadProfileData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0E0F14]">
        <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#C8F04B] animate-spin" />
      </div>
    );
  }

  // ─── СОСТОЯНИЕ: НЕ АВТОРИЗОВАН ───
  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#0E0F14] text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
        `}</style>
        
        <div className="bg-[#181920] border border-white/10 p-10 rounded-3xl max-w-sm w-full shadow-2xl animate-fade-up">
          <div className="text-6xl mb-6 drop-shadow-[0_0_15px_rgba(200,240,75,0.3)]">🔐</div>
          <h2 className="text-2xl font-black text-[#F0F1F5] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Вход в систему</h2>
          <p className="text-[#8B8E9E] text-sm mb-8 leading-relaxed">
            Войдите, чтобы отслеживать свои заявки, копить баллы и участвовать в рейтинге города.
          </p>
          <Link 
            href="/login" 
            className="block w-full bg-[#C8F04B] text-[#0E0F14] px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:bg-[#d9ff5e] hover:scale-[1.02] shadow-[0_4px_20px_rgba(200,240,75,0.25)]"
          >
            Войти / Регистрация
          </Link>
        </div>
      </div>
    );
  }

  // ─── СОСТОЯНИЕ: АВТОРИЗОВАН ───
  const stats = calculateStats(myIssues);
  const level = getLevelInfo(stats.points);
  const username = user.email.split('@')[0];
  const initial = username[0].toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-[#0E0F14] p-4 sm:p-6 md:p-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s; }
        .d3 { animation-delay: 0.15s; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        
        {/* ЗАГОЛОВОК */}
        <div className="flex items-center gap-3 animate-fade-up">
          <div style={{ width: 4, height: 32, background: "#C8F04B", borderRadius: 2 }} />
          <h1 className="text-[clamp(26px,5vw,36px)] font-[800] tracking-[-0.03em] leading-tight text-[#F0F1F5]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Кабинет жителя
          </h1>
        </div>

        {/* КАРТОЧКА ЮЗЕРА И ПРОГРЕСС */}
        <div className="animate-fade-up d1 bg-[#181920] p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          {/* Декоративное свечение */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C8F04B] opacity-5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            
            {/* Аватар и Инфо */}
            <div className="flex items-center gap-5">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
                style={{ background: "rgba(200,240,75,0.1)", color: "#C8F04B", border: "1px solid rgba(200,240,75,0.2)", fontFamily: "'Syne', sans-serif" }}
              >
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F0F1F5]" style={{ fontFamily: "'Syne', sans-serif" }}>{username}</h2>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{ background: `${level.color}20`, color: level.color, border: `1px solid ${level.color}40` }}
                  >
                    {level.title}
                  </span>
                </div>
                <p className="text-[#8B8E9E] text-xs sm:text-sm">{user.email}</p>
              </div>
            </div>

            {/* Кнопка выхода */}
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
              className="w-full md:w-auto text-xs font-bold uppercase tracking-widest text-[#FF6B6B] bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 border border-[#FF6B6B]/20 px-5 py-2.5 rounded-xl transition-all"
            >
              Выйти из аккаунта
            </button>
          </div>

          {/* Полоса прогресса уровня */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[#8B8E9E] text-xs uppercase tracking-widest font-bold">Очки рейтинга</span>
              <div className="text-right">
                <span className="text-xl font-bold text-[#F0F1F5]" style={{ fontFamily: "'Syne', sans-serif" }}>{stats.points}</span>
                <span className="text-[#4E5162] text-xs ml-1">/ {level.next} PTS</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${level.progress}%`, background: "linear-gradient(90deg, #C8F04B, #8EFF00)" }}
              />
            </div>
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <div className="animate-fade-up d2 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Сигналов", value: stats.total, icon: "📢", color: "#F0F1F5" },
            { label: "Решено", value: stats.solved, icon: "✅", color: "#C8F04B" },
            { label: "В работе", value: stats.total - stats.solved, icon: "⏳", color: "#6BE4FF" },
            { label: "Собрано лайков", value: stats.likes, icon: "❤️", color: "#FF6B6B" },
          ].map((s, i) => (
            <div key={i} className="bg-[#181920] border border-white/5 p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="text-xl mb-3">{s.icon}</div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                <div className="text-[10px] sm:text-xs text-[#4E5162] uppercase tracking-widest font-bold mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* СПИСОК МОИХ ЗАЯВОК */}
        <div className="animate-fade-up d3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F0F1F5]" style={{ fontFamily: "'Syne', sans-serif" }}>
              История обращений
            </h3>
            <Link href="/issue" className="text-xs text-[#C8F04B] hover:underline font-bold">
              + Новый сигнал
            </Link>
          </div>

          {myIssues.length === 0 ? (
            <div className="bg-[#181920] p-10 rounded-3xl border border-white/5 text-center">
              <div className="text-4xl mb-3 opacity-50">📝</div>
              <p className="text-[#F0F1F5] font-bold mb-1">История чиста</p>
              <p className="text-[#4E5162] text-sm">Создайте свой первый сигнал, чтобы получить очки.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {myIssues.map(issue => (
                <Link 
                  href={`/issue/${issue.id}`} 
                  key={issue.id} 
                  className="bg-[#181920] p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C8F04B]/30 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                       {issue.status === 'Решено' ? '✅' : issue.status === 'В работе' ? '⏳' : '📢'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#F0F1F5] text-sm sm:text-base truncate group-hover:text-[#C8F04B] transition-colors">
                        {issue.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-[#8B8E9E] font-bold uppercase tracking-widest">
                          {issue.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#4E5162]" />
                        <span className="text-xs text-[#4E5162]">
                          {new Date(issue.created_at).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#4E5162]" />
                        <span className="text-xs text-[#4E5162] flex items-center gap-1">
                          👍 {issue.likes_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 self-start sm:self-center">
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}