// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

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
          .from("issues").select("*")
          .eq("user_id", user.id).order("created_at", { ascending: false });
        setMyIssues((data as Issue[]) || []);
      }
      setLoading(false);
    }
    loadProfileData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "var(--accent-amber)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--bg-elevated)" }}>
        <div className="text-7xl mb-4" style={{ animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🔐</div>
        <h2
          className="text-3xl font-bold mb-3 animate-fade-up"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Личный кабинет
        </h2>
        <p className="mb-8 max-w-xs animate-fade-up delay-1" style={{ color: "var(--text-muted)" }}>
          Войдите, чтобы отслеживать свои заявки и копить баллы рейтинга.
        </p>
        {/* [UI] Тёрракотовая pill-кнопка */}
        <Link
          href="/login"
          className="px-8 py-3.5 rounded-full font-bold text-sm transition-all animate-fade-up delay-2"
          style={{ background: "var(--accent-amber)", color: "#fff" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* [UI] Карточка пользователя — кремовая */}
        <div
          className="p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-up"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
        >
          <div className="flex items-center gap-5">
            {/* [UI] Аватар — кофейный градиент с тёрракотовым бордером */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-md"
              style={{
                background: "linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%)",
                color: "var(--accent-amber)",
                border: "2px solid var(--accent-caramel)",
                fontFamily: "var(--font-display)",
              }}
            >
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {user.email.split("@")[0]}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ color: "var(--status-open)", background: "var(--status-open-bg)", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Выйти
          </button>
        </div>

        {/* [UI] Список заявок */}
        <div className="space-y-4 animate-fade-up delay-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Мои обращения</h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-amber)" }}
            >
              {myIssues.length}
            </span>
          </div>

          {myIssues.length === 0 ? (
            <div
              className="p-10 rounded-3xl border border-dashed text-center"
              style={{ borderColor: "rgba(100,70,40,0.15)", color: "var(--text-muted)" }}
            >
              Вы ещё не создали ни одного сигнала.
            </div>
          ) : (
            <div className="grid gap-3">
              {myIssues.map((issue, i) => (
                <Link
                  href={`/issue/${issue.id}`}
                  key={issue.id}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${0.1 + i * 0.04}s`, textDecoration: "none" }}
                >
                  <div
                    className="p-5 rounded-2xl flex items-center justify-between transition-all duration-300"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: "rgba(100,70,40,0.06)" }}
                      >
                        {issue.status === "Решено" ? "✅" : "⏳"}
                      </div>
                      <div>
                        <h3 className="font-bold transition-opacity group-hover:opacity-70" style={{ color: "var(--text-primary)" }}>
                          {issue.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(issue.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                      style={{
                        background: issue.status === "Решено" ? "var(--status-done-bg)" : "var(--status-wip-bg)",
                        color: issue.status === "Решено" ? "var(--status-done)" : "var(--status-wip)",
                      }}
                    >
                      {issue.status}
                    </span>
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
