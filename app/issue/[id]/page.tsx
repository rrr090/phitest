// app/issue/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Решено":    { bg: "var(--status-done-bg)",  color: "var(--status-done)" },
    "В работе":  { bg: "var(--status-wip-bg)",   color: "var(--status-wip)" },
    "Открыто":   { bg: "var(--status-open-bg)",  color: "var(--status-open)" },
    "Отклонено": { bg: "rgba(160,133,110,0.10)", color: "var(--text-muted)" },
  };
  const s = map[status] || map["Открыто"];
  return (
    <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data: issueData, error: issueError } = await supabase
          .from("issues").select("*").eq("id", params.id).single();

        if (issueError || !issueData) { setError(true); return; }
        setIssue(issueData);

        if (user) {
          const { data: likeData } = await supabase
            .from("likes").select("*")
            .eq("user_id", user.id).eq("issue_id", params.id).single();
          if (likeData) setHasLiked(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) loadData();
  }, [params.id]);

  const handleLike = async () => {
    if (!currentUser) return alert("Войдите, чтобы поддержать проблему");
    if (hasLiked || !issue) return;

    const { error: likeError } = await supabase
      .from("likes").insert([{ user_id: currentUser.id, issue_id: issue.id }]);

    if (likeError) {
      if (likeError.code === "23505") setHasLiked(true);
      else alert("Ошибка при сохранении лайка");
      return;
    }

    const { error: updateError } = await supabase.rpc("increment_likes", { row_id: issue.id });
    if (!updateError) {
      setHasLiked(true);
      setIssue((prev) => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
        {/* [UI] Спиннер в цвете тёрракота */}
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--accent-amber)" }} />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--bg-elevated)" }}>
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Проблема не найдена</h2>
        <p className="mt-2 mb-6" style={{ color: "var(--text-muted)" }}>Возможно, она была удалена или ссылка неверна.</p>
        <Link href="/" style={{ color: "var(--accent-amber)" }} className="font-medium">Вернуться на карту</Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-4xl mx-auto">
        {/* [UI] Кнопка назад с hover-сдвигом */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-sm font-medium transition-all group animate-fade-up"
          style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          <span className="transition-transform group-hover:-translate-x-1 inline-block">←</span> Назад
        </button>

        {/* [UI] Главная карточка — кремовая поверхность */}
        <div
          className="rounded-3xl overflow-hidden animate-scale-in"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
        >
          {/* Фото */}
          <div className="w-full h-64 md:h-96 relative overflow-hidden">
            {issue.image_url ? (
              <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: "#e8e0d4", color: "#c4a98a" }}>
                <span className="text-6xl">🖼️</span>
                <p className="mt-2 text-sm">Фотография не приложена</p>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <StatusBadge status={issue.status} />
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Мета */}
            <div className="flex flex-wrap items-center gap-3 mb-4 animate-fade-up" style={{ color: "var(--text-muted)" }}>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--accent-sky-bg)", color: "var(--accent-sky)" }}
              >
                {issue.category}
              </span>
              <span className="text-sm">ID: #{issue.id.slice(0, 8)}</span>
              <span>•</span>
              <span className="text-sm">{new Date(issue.created_at).toLocaleDateString("ru-RU")}</span>
            </div>

            <h1
              className="text-4xl font-bold mb-8 animate-fade-up delay-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1.15 }}
            >
              {issue.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up delay-2">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                    Описание
                  </h3>
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
                    {issue.description}
                  </p>
                </div>
                <div
                  className="p-5 rounded-2xl"
                  style={{ background: "rgba(100,70,40,0.04)", border: "1px solid rgba(100,70,40,0.07)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                    Местоположение
                  </h3>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    📍 {issue.address || "Адрес не указан"}
                  </p>
                </div>
              </div>

              {/* [UI] Блок лайков — тёплый кофейный фон */}
              <div
                className="p-6 rounded-2xl text-center"
                style={{ background: "var(--bg-base)", border: "1px solid rgba(100,70,40,0.10)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                  Поддержали проблему
                </p>
                <div
                  className="text-4xl font-black mb-5"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  {issue.likes_count || 0}
                  <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>чел.</span>
                </div>
                {/* [UI] CTA — тёрракотовая кнопка-pill */}
                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: hasLiked ? "rgba(100,70,40,0.07)" : "var(--accent-amber)",
                    color: hasLiked ? "var(--text-muted)" : "#fff",
                    cursor: hasLiked ? "default" : "pointer",
                    border: "none",
                  }}
                  onMouseEnter={(e) => { if (!hasLiked) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { if (!hasLiked) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {hasLiked ? "✅ Вы поддержали" : "🙌 Поддержать"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
