// app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/profile");
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Проверьте почту для подтверждения!");
    setLoading(false);
  };

  const inputBase = {
    background: "rgba(100,70,40,0.05)",
    border: "1px solid rgba(100,70,40,0.10)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    borderRadius: "var(--radius-lg)",
    padding: "14px 16px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div className="h-full flex items-center justify-center p-6" style={{ background: "var(--bg-elevated)" }}>
      {/* [UI] Логин карточка — кремовая с кофейными тенями */}
      <div
        className="max-w-md w-full p-10 rounded-3xl animate-scale-in"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 24px 60px rgba(100,70,40,0.12)",
        }}
      >
        <div className="text-center mb-10">
          {/* [UI] Карамельный pill-лейбл */}
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "var(--accent-caramel-bg)", color: "var(--accent-amber)" }}
          >
            Smart City
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Добро пожаловать
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Войдите, чтобы продолжить
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email" placeholder="Email" required
            style={inputBase}
            value={email} onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--accent-amber)")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(100,70,40,0.10)")}
          />
          <input
            type="password" placeholder="Пароль" required
            style={inputBase}
            value={password} onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--accent-amber)")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(100,70,40,0.10)")}
          />
          {/* [UI] Тёрракотовая CTA кнопка */}
          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
            style={{
              background: loading ? "rgba(193,122,74,0.5)" : "var(--accent-amber)",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid rgba(100,70,40,0.08)" }}>
          <button
            onClick={handleSignUp}
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-amber)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
          >
            Нет аккаунта? Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}
