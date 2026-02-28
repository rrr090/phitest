// app/news/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── ТИПЫ ────────────────────────────────────────────────────────────────────
interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  address?: string;
  lat?: number;
  lng?: number;
  created_at: string;
  likes_count?: number;
}

interface NewsArticle {
  headline: string;
  body: string;
  category: string;
  urgency: "critical" | "high" | "medium" | "low";
  emoji: string;
  area?: string;
}

interface DigestResult {
  summary: string;
  articles: NewsArticle[];
  generatedAt: string;
}

// ─── GROQ CONFIG ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
const GROQ_MODEL   = "openai/gpt-oss-120b";

// ─── СТИЛИ (оставил без изменений) ────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

  .nws {
    --bg:    #0E0F14; --surface:#181920; --s2:#1C1D27;
    --brd:   rgba(255,255,255,0.07); --b2:rgba(255,255,255,0.04);
    --acc:   #C8F04B; --abg:rgba(200,240,75,0.10); --aring:rgba(200,240,75,0.25);
    --red:   #FF6B6B; --rbg:rgba(255,107,107,0.10);
    --amb:   #FFD96B; --ambg:rgba(255,217,107,0.10);
    --grn:   #6BE4A0; --gbg:rgba(107,228,160,0.10);
    --blu:   #6BE4FF; --bbg:rgba(107,228,255,0.10);
    --mut:   #4E5162; --mid:#8B8E9E; --hi:#F0F1F5;
    --fd:    'Syne', sans-serif; --fm:'JetBrains Mono', monospace;
    --r:14px; --rg:18px; --t:150ms ease;
    font-family:var(--fm); background:var(--bg); color:var(--hi); min-height:100%;
  }
  .nws * { box-sizing:border-box; }
  .nws ::-webkit-scrollbar { width:4px; }
  .nws ::-webkit-scrollbar-thumb { background:var(--brd); border-radius:2px; }

  @keyframes nws-up     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes nws-in     { from{opacity:0} to{opacity:1} }
  @keyframes nws-spin   { to{transform:rotate(360deg)} }
  @keyframes nws-pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes nws-shimmer{ 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes nws-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

  .fu { animation:nws-up 0.45s both; }
  .d1{animation-delay:.04s} .d2{animation-delay:.09s} .d3{animation-delay:.14s}
  .d4{animation-delay:.19s} .d5{animation-delay:.24s} .d6{animation-delay:.29s}

  /* TICKER */
  .nws-ticker { overflow:hidden; background:var(--acc); padding:7px 0; }
  .nws-ticker-track {
    display:flex; width:max-content;
    animation:nws-ticker 30s linear infinite;
  }
  .nws-ticker-seg {
    font-family:var(--fd); font-size:11px; font-weight:800;
    color:#0E0F14; letter-spacing:0.06em; text-transform:uppercase;
    white-space:nowrap; padding:0 48px;
  }

  /* GEN BUTTON */
  .nws-gen-btn {
    display:flex; align-items:center; justify-content:center; gap:10px;
    width:100%; padding:16px; border-radius:var(--rg);
    background:var(--acc); border:none; cursor:pointer;
    font-family:var(--fd); font-size:15px; font-weight:800; color:#0E0F14;
    transition:all var(--t); box-shadow:0 4px 24px var(--aring);
  }
  .nws-gen-btn:hover:not(:disabled){ background:#d9ff5e; transform:translateY(-2px); box-shadow:0 8px 32px rgba(200,240,75,.4); }
  .nws-gen-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
  .nws-spinner { width:20px; height:20px; border:2.5px solid transparent; border-top-color:#0E0F14; border-radius:50%; animation:nws-spin .7s linear infinite; }

  /* STATS */
  .nws-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; }
  .nws-stat { background:var(--surface); border:1px solid var(--brd); border-radius:var(--r); padding:14px 16px; }
  .nws-stat-val { font-family:var(--fd); font-size:26px; font-weight:800; letter-spacing:-.04em; line-height:1; }
  .nws-stat-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.10em; color:var(--mut); margin-top:5px; }

  /* SUMMARY */
  .nws-summary {
    background:var(--surface); border:1px solid rgba(200,240,75,.2);
    border-radius:var(--rg); padding:22px 24px; position:relative; overflow:hidden;
  }
  .nws-summary::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,#C8F04B,#6BE4FF);
  }
  .nws-summary-lbl {
    font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase;
    color:var(--acc); margin-bottom:12px; display:flex; align-items:center; gap:8px;
  }
  .nws-summary-lbl::after { content:''; flex:1; height:1px; background:rgba(200,240,75,.15); }
  .nws-summary-txt { font-size:14px; line-height:1.75; color:var(--hi); }

  /* CARD */
  .nws-card {
    background:var(--surface); border:1px solid var(--brd);
    border-radius:var(--rg); overflow:hidden;
    transition:border-color var(--t), transform var(--t);
  }
  .nws-card:hover { border-color:rgba(255,255,255,.12); transform:translateY(-2px); }
  .nws-card-head { padding:18px 20px 14px; border-bottom:1px solid var(--b2); display:flex; align-items:flex-start; gap:14px; }
  .nws-card-emoji { font-size:26px; width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .nws-card-hl { font-family:var(--fd); font-size:15px; font-weight:700; color:var(--hi); line-height:1.3; margin:0 0 8px; }
  .nws-card-meta { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
  .nws-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:999px; white-space:nowrap; border:1px solid transparent; }
  .nws-card-body { padding:14px 20px 18px; font-size:13px; line-height:1.8; color:var(--mid); }

  /* urgency */
  .uc { color:var(--red);  background:var(--rbg);  border-color:rgba(255,107,107,.25);  }
  .uh { color:var(--amb);  background:var(--ambg); border-color:rgba(255,217,107,.25); }
  .um { color:var(--blu);  background:var(--bbg);  border-color:rgba(107,228,255,.25);  }
  .ul { color:var(--grn);  background:var(--gbg);  border-color:rgba(107,228,160,.25);  }
  .ubg-c { background:rgba(255,107,107,.04); }
  .ubg-h { background:rgba(255,217,107,.04); }
  .ubg-m { background:rgba(107,228,255,.04); }
  .ubg-l { background:rgba(107,228,160,.04); }

  /* SHIMMER */
  .nws-shim {
    background:linear-gradient(90deg,var(--s2) 25%,rgba(255,255,255,.04) 50%,var(--s2) 75%);
    background-size:600px 100%; animation:nws-shimmer 1.5s infinite linear; border-radius:var(--rg);
  }

  /* GEN AT */
  .nws-gen-at { font-size:10px; color:var(--mut); text-align:center; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:6px; }
  .nws-dot { width:5px; height:5px; border-radius:50%; background:var(--acc); display:inline-block; animation:nws-pulse 2s infinite; }

  /* ERROR BANNER */
  .nws-err { background:var(--rbg); border:1px solid rgba(255,107,107,.3); border-radius:var(--r); padding:12px 16px; font-size:13px; color:var(--red); }

  /* EMPTY */
  .nws-empty { text-align:center; padding:60px 24px; color:var(--mut); }

  @media(max-width:560px){
    .nws-card-head { padding:14px 14px 12px; gap:10px; }
    .nws-card-body { padding:12px 14px 16px; font-size:12px; }
    .nws-card-emoji { width:38px; height:38px; font-size:20px; }
    .nws-summary { padding:16px 14px; }
  }
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const urgencyBadgeClass = (u: string) =>
  ({ critical:"uc", high:"uh", medium:"um", low:"ul" }[u] ?? "ul");
const urgencyBgClass = (u: string) =>
  ({ critical:"ubg-c", high:"ubg-h", medium:"ubg-m", low:"ubg-l" }[u] ?? "ubg-l");
const urgencyLabel = (u: string) =>
  ({ critical:"🔴 Критично", high:"🟠 Высокий", medium:"🟡 Средний", low:"🟢 Низкий" }[u] ?? u);

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day:"2-digit", month:"long", hour:"2-digit", minute:"2-digit" });
}

function buildPrompt(issues: Issue[]): string {
  const byStatus = (s: string) => issues.filter(i => i.status === s).length;
  const catStats = issues.reduce((a, i) => ({ ...a, [i.category]: (a[i.category] ?? 0) + 1 }), {} as Record<string,number>);
  const topIssues = [...issues].sort((a,b) => (b.likes_count??0)-(a.likes_count??0)).slice(0,20);

  return `Ты — городской ИИ-редактор «Smart City Петропавловск». Создай новостной дайджест.

ДАННЫЕ:
Всего: ${issues.length} | Открыто: ${byStatus("Открыто")} | В работе: ${byStatus("В работе")} | Решено: ${byStatus("Решено")}
Категории: ${Object.entries(catStats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}(${v})`).join(", ")}

ТОП ЗАЯВОК:
${topIssues.map((i,n)=>`${n+1}. [${i.category}] "${i.title}" | ${i.status} | ${i.address??"—"} | 👍${i.likes_count??0}`).join("\n")}

ОТВЕТЬ ТОЛЬКО валидным JSON без markdown:
{
  "summary": "Сводка 2-3 предложения об общей ситуации в городе",
  "articles": [
    {
      "headline": "Заголовок до 80 символов в журналистском стиле",
      "body": "3-5 предложений. Конкретные адреса, цифры, факты. Живой новостной язык.",
      "category": "категория",
      "urgency": "critical|high|medium|low",
      "emoji": "один эмодзи",
      "area": "район/улица или null"
    }
  ]
}
Правила: 4-6 статей, группируй похожие проблемы, пиши на русском, urgency = критичность + количество заявок.`;
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [issues, setIssues]           = useState<Issue[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [digest, setDigest]           = useState<DigestResult | null>(null);
  const [error, setError]             = useState("");

  const hasKey = Boolean(GROQ_API_KEY);

  // 1. Загружаем заявки и ПОСЛЕДНЮЮ НОВОСТЬ из БД при загрузке страницы
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Грузим заявки
        const { data: issuesData } = await supabase
          .from("issues")
          .select("id,title,category,status,address,lat,lng,created_at,likes_count")
          .order("created_at", { ascending: false })
          .limit(100);
        
        if (issuesData) setIssues(issuesData as Issue[]);

        // Грузим последний сгенерированный дайджест
        const { data: latestDigest } = await supabase
          .from("news_digests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestDigest) {
          setDigest({
            summary: latestDigest.summary,
            articles: latestDigest.articles,
            generatedAt: latestDigest.created_at
          });
        }
      } catch (err) {
        console.error("Ошибка при загрузке начальных данных", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadInitialData();
  }, []);

  // 2. Генерация через Groq и СОХРАНЕНИЕ в БД
  const generate = useCallback(async () => {
    if (!hasKey) { setError("Укажите NEXT_PUBLIC_GROQ_API_KEY в .env.local"); return; }
    if (!issues.length) { setError("Нет данных. Добавьте хотя бы одну заявку."); return; }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.72,
          max_tokens: 2048,
          messages: [
            { role: "system", content: "Ты городской ИИ-редактор. Отвечай ТОЛЬКО валидным JSON." },
            { role: "user",   content: buildPrompt(issues) },
          ],
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error((e as any)?.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const raw  = (data.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw) as { summary: string; articles: NewsArticle[] };

      // СОХРАНЯЕМ В БАЗУ ДАННЫХ SUPABASE
      const { data: savedDigest, error: dbError } = await supabase
        .from("news_digests")
        .insert({
          summary: parsed.summary,
          articles: parsed.articles ?? []
        })
        .select()
        .single();

      if (dbError) throw new Error("ИИ сгенерировал текст, но не удалось сохранить в базу.");

      // ОБНОВЛЯЕМ СТЕЙТ
      setDigest({ 
        summary: savedDigest.summary, 
        articles: savedDigest.articles, 
        generatedAt: savedDigest.created_at 
      });

    } catch (e: any) {
      setError(e.message ?? "Ошибка генерации. Попробуйте ещё раз.");
    } finally {
      setGenerating(false);
    }
  }, [issues, hasKey]);

  const stats = {
    total: issues.length,
    open:  issues.filter(i => i.status === "Открыто").length,
    wip:   issues.filter(i => i.status === "В работе").length,
    done:  issues.filter(i => i.status === "Решено").length,
  };

  const tickerSeg = digest?.articles.map(a => `${a.emoji}  ${a.headline}`).join("   ·   ") ?? "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="nws" style={{ height: "100%", overflowY: "auto" }}>

        {/* ── БЕГУЩАЯ СТРОКА ── */}
        {digest && tickerSeg && (
          <div className="nws-ticker">
            <div className="nws-ticker-track">
              <span className="nws-ticker-seg">{tickerSeg}</span>
              <span className="nws-ticker-seg">{tickerSeg}</span>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(16px,3vw,36px) clamp(12px,3vw,24px) 100px" }}>

          {/* ── ШАПКА ── */}
          <div className="fu d1" style={{ marginBottom: 22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
              <div style={{ width:4, height:30, background:"#C8F04B", borderRadius:2, flexShrink:0 }} />
              <h1 style={{ fontFamily:"var(--fd)", fontSize:"clamp(22px,5vw,34px)", fontWeight:800, letterSpacing:"-0.03em", margin:0 }}>
                ИИ-дайджест
              </h1>
              <span style={{
                fontSize:10, fontWeight:700, padding:"4px 11px",
                background:"var(--abg)", color:"var(--acc)",
                border:"1px solid var(--aring)", borderRadius:999,
                letterSpacing:"0.08em", textTransform:"uppercase",
              }}>
                Groq · Llama 3
              </span>
            </div>
            <p style={{ fontSize:12, color:"var(--mut)", paddingLeft:14 }}>
              ИИ анализирует городские заявки и генерирует новостную сводку в реальном времени
            </p>
          </div>

          {/* ── ПРЕДУПРЕЖДЕНИЕ О КЛЮЧЕ ── */}
          {!hasKey && (
            <div className="nws-err fu d1" style={{ marginBottom:20 }}>
              ⚠️ <strong>NEXT_PUBLIC_GROQ_API_KEY</strong> не задан.{" "}
              Получите бесплатный ключ на{" "}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer"
                style={{ color:"var(--red)", textDecoration:"underline" }}>
                console.groq.com
              </a>{" "}
              и добавьте в <code style={{ background:"rgba(255,107,107,.15)", padding:"1px 6px", borderRadius:4 }}>.env.local</code>
            </div>
          )}

          {/* ── СТАТИСТИКА ── */}
          {!loadingData && (
            <div className="nws-stats fu d2" style={{ marginBottom:20 }}>
              {[
                { val:stats.total, lbl:"Всего заявок", color:"var(--hi)"  },
                { val:stats.open,  lbl:"Открыто",      color:"var(--red)" },
                { val:stats.wip,   lbl:"В работе",     color:"var(--amb)" },
                { val:stats.done,  lbl:"Решено",       color:"var(--grn)" },
              ].map(s => (
                <div key={s.lbl} className="nws-stat">
                  <div className="nws-stat-val" style={{ color:s.color }}>{s.val}</div>
                  <div className="nws-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── КНОПКА ── */}
          <div className="fu d3" style={{ marginBottom:28 }}>
            <button
              className="nws-gen-btn"
              onClick={generate}
              disabled={generating || loadingData || !hasKey}
            >
              {generating
                ? <><span className="nws-spinner" />Анализирую {stats.total} заявок…</>
                : digest
                  ? "🔄 Обновить дайджест"
                  : "⚡ Сгенерировать дайджест"
              }
            </button>
            {digest && (
              <div className="nws-gen-at">
                <span className="nws-dot" />
                Обновлено: {fmtDate(digest.generatedAt)}
              </div>
            )}
          </div>

          {/* ── ОШИБКА ── */}
          {error && (
            <div className="nws-err fu" style={{ marginBottom:20 }}>⚠ {error}</div>
          )}

          {/* ── ШИММЕРЫ ── */}
          {generating && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div className="nws-shim" style={{ height:90 }} />
              {[160, 140, 175, 145, 160].map((h,i) => (
                <div key={i} className="nws-shim" style={{ height:h, animationDelay:`${i*.12}s` }} />
              ))}
            </div>
          )}

          {/* ── ДАЙДЖЕСТ ── */}
          {!generating && digest && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              <div className="nws-summary fu d1">
                <div className="nws-summary-lbl"><span>📰</span>Редакционная сводка</div>
                <p className="nws-summary-txt" style={{ margin:0 }}>{digest.summary}</p>
              </div>

              {digest.articles.map((art, i) => (
                <article
                  key={i}
                  className={`nws-card ${urgencyBgClass(art.urgency)} fu`}
                  style={{ animationDelay:`${0.04 + i * 0.07}s` }}
                >
                  <div className="nws-card-head">
                    <div className={`nws-card-emoji ${urgencyBgClass(art.urgency)}`}>
                      {art.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h2 className="nws-card-hl">{art.headline}</h2>
                      <div className="nws-card-meta">
                        <span className={`nws-badge ${urgencyBadgeClass(art.urgency)}`}>
                          {urgencyLabel(art.urgency)}
                        </span>
                        <span className="nws-badge" style={{ background:"var(--bbg)", color:"var(--blu)", borderColor:"rgba(107,228,255,.2)" }}>
                          {art.category}
                        </span>
                        {art.area && (
                          <span style={{ fontSize:10, color:"var(--mut)" }}>
                            📍 {art.area}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="nws-card-body">{art.body}</div>
                </article>
              ))}
            </div>
          )}

          {/* ── ПУСТОЕ СОСТОЯНИЕ ── */}
          {!generating && !digest && !error && (
            <div className="nws-empty fu d4">
              <div style={{ fontSize:52, marginBottom:16 }}>🤖</div>
              <div style={{ fontFamily:"var(--fd)", fontSize:18, fontWeight:700, color:"var(--mid)", marginBottom:10 }}>
                Дайджест ещё не создан
              </div>
              <div style={{ fontSize:12, maxWidth:280, margin:"0 auto", lineHeight:1.7 }}>
                Нажмите кнопку выше — ИИ проанализирует{" "}
                {loadingData ? "заявки" : `${stats.total} городских заявок`}{" "}
                и создаст новостную сводку
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}