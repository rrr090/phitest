// app/feed/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

// [UI] Универсальный статус-бейдж с тёплыми токенами
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Решено":     { bg: "var(--status-done-bg)",  color: "var(--status-done)" },
    "В работе":   { bg: "var(--status-wip-bg)",   color: "var(--status-wip)" },
    "Открыто":    { bg: "var(--status-open-bg)",  color: "var(--status-open)" },
    "Отклонено":  { bg: "rgba(160,133,110,0.10)", color: "var(--text-muted)" },
  };
  const s = map[status] || map["Открыто"];
  return (
    <span
      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function FeedContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      let query = supabase.from("issues").select("*").order("created_at", { ascending: false });
      if (categoryFilter) query = query.eq("category", categoryFilter);
      const { data, error } = await query;
      if (!error) setIssues(data as Issue[]);
      setLoading(false);
    }
    fetchIssues();
  }, [categoryFilter]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer rounded-2xl h-36" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* [UI] Заголовок с inline карамельным выделением для фильтра */}
      <div className="flex justify-between items-end mb-8 animate-fade-up">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1.1 }}
        >
          {categoryFilter ? (
            <>
              Проблемы:{" "}
              <em
                className="not-italic px-3 py-1 rounded-xl"
                style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-amber)" }}
              >
                {categoryFilter}
              </em>
            </>
          ) : (
            "Все сигналы города"
          )}
        </h1>
        {categoryFilter && (
          <Link
            href="/feed"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-amber)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
          >
            Сбросить ×
          </Link>
        )}
      </div>

      {issues.length === 0 ? (
        <div
          className="p-20 rounded-3xl border border-dashed text-center animate-scale-in"
          style={{ borderColor: "rgba(100,70,40,0.15)", color: "var(--text-muted)" }}
        >
          В этой категории пока нет обращений 🎈
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map((issue, i) => (
            <Link
              href={`/issue/${issue.id}`}
              key={issue.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s`, textDecoration: "none" }}
            >
              <div
                className="p-4 rounded-2xl flex gap-5 transition-all duration-300"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
                }}
              >
                {/* [UI] Thumbnail с тёплым фоллбеком */}
                <div
                  className="w-28 h-28 rounded-xl overflow-hidden shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: "#e8e0d4" }}
                >
                  {issue.image_url ? (
                    <img src={issue.image_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black uppercase" style={{ color: "#c4a98a" }}>
                      {issue.category[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--accent-sky)" }}>
                        {issue.category}
                      </span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <h2
                      className="text-lg font-bold mb-1.5 line-clamp-1 transition-opacity group-hover:opacity-70"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {issue.title}
                    </h2>
                    <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {issue.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(issue.created_at).toLocaleDateString("ru-RU")}
                    </span>
                    {/* [UI] Лайк — тёплый карамельный pill */}
                    <span
                      className="text-sm font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-caramel)" }}
                    >
                      👍 {issue.likes_count}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10" style={{ background: "var(--bg-elevated)" }}>
      <Suspense fallback={<div style={{ color: "var(--text-muted)" }} className="p-10 text-center">Загрузка...</div>}>
        <FeedContent />
      </Suspense>
    </div>
  );
}
