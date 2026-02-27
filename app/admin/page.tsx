// app/admin/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

// ─── СТИЛИ ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .adm {
    --bg:        #0E0F14;
    --surface:   #181920;
    --surface2:  #1C1D27;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.04);
    --accent:    #C8F04B;
    --accent-bg: rgba(200,240,75,0.1);
    --accent-ring: rgba(200,240,75,0.25);
    --red:       #FF6B6B;
    --red-bg:    rgba(255,107,107,0.1);
    --amber:     #FFD96B;
    --amber-bg:  rgba(255,217,107,0.1);
    --green:     #6BE4A0;
    --green-bg:  rgba(107,228,160,0.1);
    --blue:      #6BE4FF;
    --blue-bg:   rgba(107,228,255,0.1);
    --muted:     #4E5162;
    --mid:       #8B8E9E;
    --hi:        #F0F1F5;
    --font-d:    'Syne', sans-serif;
    --font-m:    'JetBrains Mono', monospace;
    --r:         12px;
    --rg:        18px;
    --t:         150ms ease;
  }

  .adm * { box-sizing: border-box; }
  .adm { font-family: var(--font-m); background: var(--bg); color: var(--hi); min-height: 100%; }

  /* Scrollbar */
  .adm ::-webkit-scrollbar { width: 5px; height: 5px; }
  .adm ::-webkit-scrollbar-track { background: transparent; }
  .adm ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes adm-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes adm-in   { from{opacity:0} to{opacity:1} }
  @keyframes adm-pop  { 0%{transform:scale(1)} 45%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes adm-spin { to{transform:rotate(360deg)} }
  @keyframes adm-shimmer {
    0%{background-position:-500px 0} 100%{background-position:500px 0}
  }

  .fu  { animation: adm-up 0.4s both; }
  .d1  { animation-delay:.05s } .d2 { animation-delay:.10s }
  .d3  { animation-delay:.15s } .d4 { animation-delay:.20s }
  .d5  { animation-delay:.25s }

  /* ── STAT CARDS ─────────────── */
  .adm-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rg);
    padding: 20px 22px;
    transition: border-color var(--t), transform var(--t);
    cursor: default;
  }
  .adm-stat:hover { border-color: rgba(200,240,75,0.2); transform: translateY(-2px); }
  .adm-stat-num {
    font-family: var(--font-d);
    font-size: clamp(28px,4vw,38px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--hi);
  }
  .adm-stat-label {
    font-size: 14px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--muted); margin-top: 6px;
  }
  .adm-stat-bar {
    height: 3px; background: var(--border2); border-radius: 2px;
    margin-top: 14px; overflow: hidden;
  }
  .adm-stat-fill { height: 100%; border-radius: 2px; transition: width 1s cubic-bezier(.22,1,.36,1); }

  /* ── TOOLBAR ─────────────────── */
  .adm-toolbar {
    display: flex; flex-wrap: wrap; gap: 10px;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rg);
    padding: 12px 16px;
  }
  .adm-search {
    flex: 1; min-width: 180px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 8px 12px 8px 36px;
    font-size: 12px; font-family: var(--font-m);
    color: var(--hi); outline: none;
    transition: border-color var(--t);
  }
  .adm-search::placeholder { color: var(--muted); }
  .adm-search:focus { border-color: rgba(200,240,75,0.35); }

  .adm-select {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 8px 12px;
    font-size: 12px; font-family: var(--font-m);
    color: var(--mid); outline: none; cursor: pointer;
    transition: border-color var(--t);
  }
  .adm-select:focus { border-color: rgba(200,240,75,0.35); }

  /* ── BUTTONS ─────────────────── */
  .adm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: var(--r);
    font-size: 14px; font-weight: 700; font-family: var(--font-m);
    letter-spacing: 0.04em; cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--t); white-space: nowrap;
  }
  .adm-btn-ghost {
    background: transparent; border-color: var(--border); color: var(--mid);
  }
  .adm-btn-ghost:hover { border-color: rgba(200,240,75,0.3); color: var(--accent); }
  .adm-btn-accent {
    background: var(--accent-bg); border-color: rgba(200,240,75,0.3); color: var(--accent);
  }
  .adm-btn-accent:hover { background: rgba(200,240,75,0.18); }
  .adm-btn-red {
    background: var(--red-bg); border-color: rgba(255,107,107,0.3); color: var(--red);
  }
  .adm-btn-red:hover { background: rgba(255,107,107,0.2); }
  .adm-btn-solid {
    background: var(--accent); border-color: var(--accent); color: #0E0F14; font-weight: 800;
  }
  .adm-btn-solid:hover { background: #d9ff5e; box-shadow: 0 4px 16px var(--accent-ring); }

  /* ── TABLE ───────────────────── */
  .adm-table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rg);
    overflow: hidden;
  }
  .adm-table-scroll { overflow-x: auto; }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table thead tr {
    background: rgba(255,255,255,0.025);
    border-bottom: 1px solid var(--border);
  }
  .adm-table th {
    padding: 13px 16px; text-align: left;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
    white-space: nowrap; font-family: var(--font-m);
    cursor: pointer; user-select: none;
    transition: color var(--t);
  }
  .adm-table th:hover { color: var(--mid); }
  .adm-table th.sorted { color: var(--accent); }
  .adm-table td { padding: 14px 16px; vertical-align: middle; }
  .adm-row {
    border-bottom: 1px solid var(--border2);
    transition: background var(--t);
    animation: adm-in 0.3s both;
  }
  .adm-row:last-child { border-bottom: none; }
  .adm-row:hover { background: rgba(255,255,255,0.02); }
  .adm-row.selected { background: var(--accent-bg); }

  .adm-cb {
    width: 16px; height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .adm-thumb {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--surface2); border: 1px solid var(--border);
    flex-shrink: 0; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--muted);
  }
  .adm-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .adm-title { font-size: 13px; font-weight: 700; color: var(--hi); text-decoration: none; transition: color var(--t); }
  .adm-title:hover { color: var(--accent); }
  .adm-addr { font-size: 11px; color: var(--muted); margin-top: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* STATUS SELECT */
  .adm-status-sel {
    font-size: 14px; font-weight: 700; font-family: var(--font-m);
    padding: 4px 10px; border-radius: 999px; border: none; outline: none;
    cursor: pointer; appearance: none; -webkit-appearance: none;
    transition: transform var(--t), box-shadow var(--t);
  }
  .adm-status-sel:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
  .adm-status-sel.pop { animation: adm-pop 0.35s; }
  .s-open  { background: var(--red-bg);   color: var(--red); }
  .s-wip   { background: var(--amber-bg); color: var(--amber); }
  .s-done  { background: var(--green-bg); color: var(--green); }
  .s-other { background: var(--surface2); color: var(--muted); }

  /* CAT BADGE */
  .adm-cat {
    display: inline-block; font-size: 14px; font-weight: 700;
    padding: 3px 9px; border-radius: 999px;
    background: var(--blue-bg); color: var(--blue);
    white-space: nowrap;
  }

  /* ACTION BTNS IN ROW */
  .adm-row-actions { display: flex; gap: 6px; justify-content: flex-end; }
  .adm-icon-btn {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; transition: all var(--t);
    font-size: 13px;
  }
  .adm-icon-btn:hover.edit { border-color: rgba(107,228,255,0.4); color: var(--blue); background: var(--blue-bg); }
  .adm-icon-btn:hover.del  { border-color: rgba(255,107,107,0.4); color: var(--red);  background: var(--red-bg); }

  /* SHIMMER */
  .adm-shimmer {
    background: linear-gradient(90deg, var(--surface2) 25%, rgba(255,255,255,0.04) 50%, var(--surface2) 75%);
    background-size: 500px 100%;
    animation: adm-shimmer 1.4s infinite linear;
    border-radius: 8px; height: 46px;
  }

  /* FOOTER */
  .adm-footer {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    background: rgba(255,255,255,0.015);
    font-size: 14px; color: var(--muted);
  }

  /* ── MODAL ───────────────────── */
  .adm-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: adm-in 0.2s ease;
  }
  .adm-modal {
    background: var(--surface);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    width: 100%; max-width: 520px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    animation: adm-up 0.25s cubic-bezier(.22,1,.36,1);
    overflow: hidden;
  }
  .adm-modal-head {
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .adm-modal-title { font-family: var(--font-d); font-size: 18px; font-weight: 800; color: var(--hi); }
  .adm-modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .adm-modal-foot {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex; gap: 10px; justify-content: flex-end;
  }

  .adm-field label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px; }
  .adm-field input, .adm-field textarea, .adm-field select {
    width: 100%; background: var(--surface2);
    border: 1px solid var(--border); border-radius: var(--r);
    padding: 10px 12px; font-size: 13px; font-family: var(--font-m);
    color: var(--hi); outline: none;
    transition: border-color var(--t);
    resize: vertical;
  }
  .adm-field input:focus, .adm-field textarea:focus, .adm-field select:focus {
    border-color: rgba(200,240,75,0.4);
  }

  /* CONFIRM MODAL */
  .adm-confirm-icon { font-size: 36px; text-align: center; padding: 24px 0 8px; }

  /* BULK BAR */
  .adm-bulk {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    background: var(--accent-bg);
    border: 1px solid rgba(200,240,75,0.25);
    border-radius: var(--r);
    padding: 10px 16px;
    animation: adm-up 0.3s both;
  }

  /* SPINNER */
  .adm-spinner {
    width: 20px; height: 20px;
    border: 2px solid transparent;
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: adm-spin 0.8s linear infinite;
  }

  /* TOAST */
  .adm-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px 18px;
    font-size: 13px; color: var(--hi);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: adm-up 0.3s cubic-bezier(.22,1,.36,1);
    display: flex; align-items: center; gap: 10px;
  }

  @media(max-width:640px) {
    .adm-table th:nth-child(3),
    .adm-table td:nth-child(3),
    .adm-table th:nth-child(5),
    .adm-table td:nth-child(5) { display: none; }
    .adm-title { font-size: 12px; }
    .adm-addr { max-width: 140px; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const STATUSES = ["Открыто", "В работе", "Решено", "Отклонено"];
const CATEGORIES = ["Дороги", "Экология", "ЖКХ", "Освещение", "Безопасность", "Прочее"];

function statusClass(s: string) {
  if (s === "Решено") return "s-done";
  if (s === "В работе") return "s-wip";
  if (s === "Открыто") return "s-open";
  return "s-other";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "2-digit" });
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [allIssues, setAllIssues]   = useState<Issue[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterCat, setFilterCat]   = useState("Все");
  const [search, setSearch]         = useState("");
  const [sortCol, setSortCol]       = useState<"created_at"|"title"|"status"|"category">("created_at");
  const [sortDir, setSortDir]       = useState<"asc"|"desc">("desc");
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [poppingId, setPoppingId]   = useState<string|null>(null);
  const [editIssue, setEditIssue]   = useState<Issue|null>(null);
  const [editForm, setEditForm]     = useState<Partial<Issue>>({});
  const [confirmDel, setConfirmDel] = useState<Issue|"bulk"|null>(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{msg:string,type:"ok"|"err"}|null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // ─── FETCH ─────────────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
    if (!error && data) setAllIssues(data as Issue[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // ─── FILTER + SORT ─────────────────────────────────────────────────────────
  const filtered = allIssues
    .filter(i => filterStatus === "Все" || i.status === filterStatus)
    .filter(i => filterCat === "Все" || i.category === filterCat)
    .filter(i => !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.address?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = (a as any)[sortCol] ?? "";
      const vb = (b as any)[sortCol] ?? "";
      return sortDir === "asc" ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  // ─── STATS ─────────────────────────────────────────────────────────────────
  const stats = {
    total:   allIssues.length,
    open:    allIssues.filter(i => i.status === "Открыто").length,
    wip:     allIssues.filter(i => i.status === "В работе").length,
    done:    allIssues.filter(i => i.status === "Решено").length,
  };
  const donePct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  // ─── SELECTION ─────────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(i => i.id)));
  }

  // ─── STATUS UPDATE ─────────────────────────────────────────────────────────
  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setPoppingId(id); setTimeout(() => setPoppingId(null), 400);
      setAllIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
      showToast("Статус обновлён", "ok");
    } else showToast("Ошибка обновления", "err");
  }

  // ─── BULK STATUS ───────────────────────────────────────────────────────────
  async function bulkStatus(newStatus: string) {
    const ids = Array.from(selected);
    const { error } = await supabase.from("issues").update({ status: newStatus }).in("id", ids);
    if (!error) {
      setAllIssues(prev => prev.map(i => selected.has(i.id) ? { ...i, status: newStatus as any } : i));
      setSelected(new Set());
      showToast(`${ids.length} заявок → ${newStatus}`, "ok");
    } else showToast("Ошибка", "err");
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  async function doDelete() {
    if (!confirmDel) return;
    setSaving(true);
    if (confirmDel === "bulk") {
      const ids = Array.from(selected);
      const { error } = await supabase.from("issues").delete().in("id", ids);
      if (!error) {
        setAllIssues(prev => prev.filter(i => !selected.has(i.id)));
        setSelected(new Set());
        showToast(`Удалено ${ids.length} заявок`, "ok");
      } else showToast("Ошибка удаления", "err");
    } else {
      const { error } = await supabase.from("issues").delete().eq("id", confirmDel.id);
      if (!error) {
        setAllIssues(prev => prev.filter(i => i.id !== (confirmDel as Issue).id));
        showToast("Заявка удалена", "ok");
      } else showToast("Ошибка удаления", "err");
    }
    setSaving(false);
    setConfirmDel(null);
  }

  // ─── EDIT ──────────────────────────────────────────────────────────────────
  function openEdit(issue: Issue) {
    setEditIssue(issue);
    setEditForm({ title: issue.title, description: issue.description, status: issue.status, category: issue.category });
  }
  async function saveEdit() {
    if (!editIssue) return;
    setSaving(true);
    const { error } = await supabase.from("issues").update(editForm).eq("id", editIssue.id);
    if (!error) {
      setAllIssues(prev => prev.map(i => i.id === editIssue.id ? { ...i, ...editForm } as Issue : i));
      showToast("Изменения сохранены", "ok");
      setEditIssue(null);
    } else showToast("Ошибка сохранения", "err");
    setSaving(false);
  }

  // ─── EXPORT ────────────────────────────────────────────────────────────────
  function exportCSV() {
    const cols = ["id","title","address","category","status","author_name","created_at"];
    const rows = [cols.join(","), ...filtered.map(i =>
      cols.map(c => `"${((i as any)[c] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )];
    download("issues.csv", rows.join("\n"), "text/csv");
  }
  function exportJSON() {
    download("issues.json", JSON.stringify(filtered, null, 2), "application/json");
  }
  function download(name: string, content: string, mime: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = name;
    a.click();
    showToast(`Экспорт: ${name}`, "ok");
  }

  // ─── IMPORT ────────────────────────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Issue[];
      if (!Array.isArray(data)) throw new Error("Нужен массив");
      const { error } = await supabase.from("issues").upsert(data, { onConflict: "id" });
      if (!error) {
        showToast(`Импортировано ${data.length} записей`, "ok");
        fetchIssues();
      } else showToast("Ошибка импорта", "err");
    } catch { showToast("Неверный формат файла", "err"); }
    e.target.value = "";
  }

  // ─── TOAST ─────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "ok"|"err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  // ─── SORT ARROW ────────────────────────────────────────────────────────────
  const arrow = (col: string) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="adm" style={{ height: "100%", overflowY: "auto" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(16px,3vw,40px) clamp(12px,3vw,28px) 80px" }}>

          {/* ── ШАПКА ──────────────────────────────────────────── */}
          <div className="fu d1" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 4, height: 32, background: "#C8F04B", borderRadius: 2 }} />
                <h1 style={{ fontFamily: "var(--font-d)", fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--hi)", margin: 0 }}>
                  Панель управления
                </h1>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", paddingLeft: 14 }}>Smart City · Петропавловск</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="adm-btn adm-btn-ghost" onClick={exportCSV}>⬇ CSV</button>
              <button className="adm-btn adm-btn-ghost" onClick={exportJSON}>⬇ JSON</button>
              <button className="adm-btn adm-btn-accent" onClick={() => importRef.current?.click()}>⬆ Импорт</button>
              <input ref={importRef} type="file" accept=".json" style={{ display:"none" }} onChange={handleImport} />
            </div>
          </div>

          {/* ── СВОДКА ─────────────────────────────────────────── */}
          <div className="fu d2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Всего заявок",   val: stats.total, color: "#F0F1F5",      pct: 100,    fill: "#C8F04B" },
              { label: "Открыто",        val: stats.open,  color: "#FF6B6B",      pct: stats.total ? stats.open/stats.total*100 : 0,   fill: "#FF6B6B" },
              { label: "В работе",       val: stats.wip,   color: "#FFD96B",      pct: stats.total ? stats.wip/stats.total*100 : 0,    fill: "#FFD96B" },
              { label: "Решено",         val: stats.done,  color: "#6BE4A0",      pct: stats.total ? stats.done/stats.total*100 : 0,   fill: "#6BE4A0" },
              { label: "Решено %",       val: donePct+"%", color: "#C8F04B",      pct: donePct, fill: "#C8F04B" },
            ].map(s => (
              <div key={s.label} className="adm-stat">
                <div className="adm-stat-num" style={{ color: s.color }}>{s.val}</div>
                <div className="adm-stat-label">{s.label}</div>
                <div className="adm-stat-bar">
                  <div className="adm-stat-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── ТУЛБАР ─────────────────────────────────────────── */}
          <div className="adm-toolbar fu d3" style={{ marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
              <input
                className="adm-search"
                placeholder="Поиск по названию или адресу…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="Все">Все статусы</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="adm-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="Все">Все категории</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {filtered.length} из {allIssues.length}
            </span>
          </div>

          {/* ── BULK BAR ───────────────────────────────────────── */}
          {selected.size > 0 && (
            <div className="adm-bulk" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
                ✓ {selected.size} выбрано
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: "var(--mid)" }}>Сменить статус:</span>
              {STATUSES.map(s => (
                <button key={s} className="adm-btn adm-btn-ghost" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => bulkStatus(s)}>
                  {s}
                </button>
              ))}
              <button className="adm-btn adm-btn-red" onClick={() => setConfirmDel("bulk")}>
                🗑 Удалить
              </button>
              <button className="adm-btn adm-btn-ghost" onClick={() => setSelected(new Set())}>
                ✕
              </button>
            </div>
          )}

          {/* ── ТАБЛИЦА ────────────────────────────────────────── */}
          <div className="adm-table-wrap fu d4">
            <div className="adm-table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" className="adm-cb"
                        checked={filtered.length > 0 && selected.size === filtered.length}
                        onChange={toggleAll} />
                    </th>
                    <th className={sortCol === "title" ? "sorted" : ""} onClick={() => toggleSort("title")}>
                      Проблема{arrow("title")}
                    </th>
                    <th className={sortCol === "category" ? "sorted" : ""} onClick={() => toggleSort("category")}>
                      Категория{arrow("category")}
                    </th>
                    <th className={sortCol === "created_at" ? "sorted" : ""} onClick={() => toggleSort("created_at")}>
                      Дата{arrow("created_at")}
                    </th>
                    <th className={sortCol === "status" ? "sorted" : ""} onClick={() => toggleSort("status")}>
                      Статус{arrow("status")}
                    </th>
                    <th style={{ textAlign: "right" }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "24px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="adm-shimmer" style={{ opacity: 1 - i * 0.15, animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)" }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                          <div style={{ fontSize: 14 }}>Ничего не найдено</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((issue, idx) => (
                      <tr
                        key={issue.id}
                        className={`adm-row${selected.has(issue.id) ? " selected" : ""}`}
                        style={{ animationDelay: `${idx * 0.03}s` }}
                      >
                        <td>
                          <input type="checkbox" className="adm-cb"
                            checked={selected.has(issue.id)}
                            onChange={() => toggleSelect(issue.id)} />
                        </td>

                        {/* Проблема */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="adm-thumb">
                              {issue.image_url ? <img src={issue.image_url} alt="" /> : <span>📍</span>}
                            </div>
                            <div>
                              <Link href={`/issue/${issue.id}`} className="adm-title">{issue.title}</Link>
                              <div className="adm-addr">{issue.address || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Категория */}
                        <td><span className="adm-cat">{issue.category}</span></td>

                        {/* Дата */}
                        <td>
                          <span style={{ fontSize: 11, color: "var(--mid)", whiteSpace: "nowrap" }}>
                            {fmtDate(issue.created_at)}
                          </span>
                        </td>

                        {/* Статус */}
                        <td>
                          <select
                            value={issue.status}
                            onChange={e => updateStatus(issue.id, e.target.value)}
                            className={`adm-status-sel ${statusClass(issue.status)}${poppingId === issue.id ? " pop" : ""}`}
                          >
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>

                        {/* Действия */}
                        <td>
                          <div className="adm-row-actions">
                            <button className="adm-icon-btn edit" title="Редактировать" onClick={() => openEdit(issue)}>✏️</button>
                            <button className="adm-icon-btn del"  title="Удалить"       onClick={() => setConfirmDel(issue)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="adm-footer">
              <span>{filtered.length} записей · {selected.size > 0 ? `${selected.size} выбрано` : "нет выбранных"}</span>
              <span style={{ color: "var(--muted)" }}>Сортировка: {sortCol} {sortDir}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ─────────────────────────────────────────── */}
      {editIssue && (
        <div className="adm-overlay" onClick={e => { if (e.target === e.currentTarget) setEditIssue(null); }}>
          <div className="adm-modal adm">
            <div className="adm-modal-head">
              <div className="adm-modal-title">Редактировать заявку</div>
              <button className="adm-icon-btn" onClick={() => setEditIssue(null)} style={{ fontSize: 16 }}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field">
                <label>Заголовок</label>
                <input value={editForm.title ?? ""} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="adm-field">
                <label>Описание</label>
                <textarea rows={4} value={(editForm as any).description ?? ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="adm-field">
                  <label>Категория</label>
                  <select value={editForm.category ?? ""} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="adm-field">
                  <label>Статус</label>
                  <select value={editForm.status ?? ""} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as any }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn adm-btn-ghost" onClick={() => setEditIssue(null)}>Отмена</button>
              <button className="adm-btn adm-btn-solid" onClick={saveEdit} disabled={saving}>
                {saving ? <span className="adm-spinner" /> : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ─────────────────────────────────────── */}
      {confirmDel && (
        <div className="adm-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="adm-modal adm" style={{ maxWidth: 400 }}>
            <div className="adm-confirm-icon">⚠️</div>
            <div className="adm-modal-head" style={{ border: "none", paddingTop: 0, flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
              <div className="adm-modal-title" style={{ fontSize: 16 }}>
                {confirmDel === "bulk"
                  ? `Удалить ${selected.size} заявок?`
                  : `Удалить «${(confirmDel as Issue).title}»?`}
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Это действие нельзя отменить</p>
            </div>
            <div className="adm-modal-foot" style={{ justifyContent: "center" }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setConfirmDel(null)}>Отмена</button>
              <button className="adm-btn adm-btn-red" onClick={doDelete} disabled={saving}>
                {saving ? <span className="adm-spinner" /> : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────────────── */}
      {toast && (
        <div className="adm-toast adm" style={{ borderColor: toast.type === "ok" ? "rgba(107,228,160,0.3)" : "rgba(255,107,107,0.3)" }}>
          <span>{toast.type === "ok" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}