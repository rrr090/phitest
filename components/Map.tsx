"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

// ─── ИКОНКИ КАТЕГОРИЙ ─────────────────────────────────────────────────────────
const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "дороги":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    case "жкх":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5C7.306 21.5 3.5 17.694 3.5 13 3.5 9.5 8 4 12 2c4 2 8.5 7.5 8.5 11 0 4.694-3.806 8.5-8.5 8.5z"/><circle cx="12" cy="13" r="3"/></svg>`;
    case "мусор":
    case "экология":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    case "освещение":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="3"/><line x1="20.66" y1="5.34" x2="19.24" y2="6.76"/><line x1="23" y1="12" x2="21" y2="12"/><line x1="20.66" y1="18.66" x2="19.24" y2="17.24"/><line x1="12" y1="23" x2="12" y2="21"/><line x1="3.34" y1="18.66" x2="4.76" y2="17.24"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="3.34" y1="5.34" x2="4.76" y2="6.76"/><circle cx="12" cy="12" r="4"/></svg>`;
    case "безопасность":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }
};

// ─── МАРКЕРЫ ──────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { fill: string; ring: string; pulse: string }> = {
  "Открыто":  { fill: "#FF6B6B", ring: "rgba(255,107,107,0.35)", pulse: "rgba(255,107,107,0.5)" },
  "В работе": { fill: "#FFD96B", ring: "rgba(255,217,107,0.35)", pulse: "rgba(255,217,107,0.5)" },
  "Решено":   { fill: "#6BE4A0", ring: "rgba(107,228,160,0.25)", pulse: "" },
};

const createCustomIcon = (status: string, category: string) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["Открыто"];
  const svg = getCategoryIcon(category);
  const pulseSvg = s.pulse
    ? `<circle cx="16" cy="16" r="14" fill="${s.pulse}" style="animation:map-ping 1.8s ease-out infinite"/>` : "";

  return L.divIcon({
    className: "sc-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    html: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <style>
          @keyframes map-ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}
        </style>
        ${pulseSvg}
        <circle cx="16" cy="16" r="13" fill="${s.fill}" stroke="#0E0F14" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="13" fill="none" stroke="${s.ring}" stroke-width="6" opacity="0.5"/>
        <g transform="translate(9,9)" color="white" stroke="white">${svg}</g>
      </svg>
    `,
  });
};

// ─── ТЕМЫ КАРТЫ ───────────────────────────────────────────────────────────────
type ThemeKey = "dark" | "light" | "satellite" | "osm";

const MAP_THEMES: Record<ThemeKey, { name: string; url: string; attr: string }> = {
  dark: {
    name: "Тёмная",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://carto.com/">Carto</a>',
  },
  light: {
    name: "Светлая",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://carto.com/">Carto</a>',
  },
  satellite: {
    name: "Спутник",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "Tiles &copy; Esri",
  },
  osm: {
    name: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
};

// ─── СТИЛИ ────────────────────────────────────────────────────────────────────
const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');

  /* Убираем стандартные стили Leaflet из попапов */
  .sc-popup .leaflet-popup-content-wrapper {
    background: #181920 !important;
    border: 1px solid rgba(255,255,255,0.09) !important;
    border-radius: 16px !important;
    box-shadow: 0 12px 48px rgba(0,0,0,0.6) !important;
    padding: 0 !important;
  }
  .sc-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
  .sc-popup .leaflet-popup-tip-container { display: none; }
  .sc-popup .leaflet-popup-close-button {
    color: #4E5162 !important; top: 10px !important; right: 12px !important;
    font-size: 18px !important; font-weight: 700 !important;
    transition: color .15s;
  }
  .sc-popup .leaflet-popup-close-button:hover { color: #C8F04B !important; }

  /* Кнопки зума */
  .leaflet-control-zoom {
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
  }
  .leaflet-control-zoom a {
    background: #181920 !important;
    color: #8B8E9E !important;
    border-color: rgba(255,255,255,0.08) !important;
    font-size: 16px !important;
    width: 36px !important; height: 36px !important; line-height: 36px !important;
    transition: background .15s, color .15s;
  }
  .leaflet-control-zoom a:hover { background: #1C1D27 !important; color: #C8F04B !important; }

  /* Attribution */
  .leaflet-control-attribution {
    background: rgba(14,15,20,0.75) !important;
    backdrop-filter: blur(6px) !important;
    color: #4E5162 !important;
    border-radius: 8px 0 0 0 !important;
    font-size: 9px !important;
    padding: 3px 8px !important;
  }
  .leaflet-control-attribution a { color: #6E7080 !important; }

  /* Маркеры */
  .sc-marker { background: transparent !important; border: none !important; }

  /* Кнопки панели управления */
  .sc-map-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 7px 14px; border-radius: 9px; border: none; cursor: pointer;
    transition: all 0.15s ease; white-space: nowrap;
  }
  .sc-map-btn-ghost {
    background: transparent; color: #4E5162;
  }
  .sc-map-btn-ghost:hover { background: rgba(255,255,255,0.05); color: #8B8E9E; }
  .sc-map-btn-active-dark {
    background: #C8F04B; color: #0E0F14;
    box-shadow: 0 2px 12px rgba(200,240,75,0.35);
  }
  .sc-map-btn-active-green {
    background: #6BE4A0; color: #0E0F14;
    box-shadow: 0 2px 12px rgba(107,228,160,0.35);
  }
  .sc-map-btn-active-theme {
    background: rgba(200,240,75,0.15); color: #C8F04B;
    border: 1px solid rgba(200,240,75,0.3);
  }

  /* Легенда */
  .sc-legend-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
`;

// ─── КОМПОНЕНТ ────────────────────────────────────────────────────────────────
interface MapProps { issues: Issue[] }

export default function Map({ issues }: MapProps) {
  const [showEcology, setShowEcology]   = useState(false);
  const [ecoData, setEcoData]           = useState<number[][]>([]);
  const [loadingEco, setLoadingEco]     = useState(false);
  const [activeTheme, setActiveTheme]   = useState<ThemeKey>("light");

  const center: [number, number] = [54.8667, 69.15];

  // ── Загрузка экологии ──
  async function handleToggleEcology(on: boolean) {
    setShowEcology(on);
    if (on && ecoData.length === 0) {
      setLoadingEco(true);
      try {
        const { data, error } = await supabase.from("ecology_data").select("lat,lng,aqi");
        if (!error && data) {
          setEcoData(data.map(d => [d.lat, d.lng, d.aqi * 1.5]));
        }
      } catch (e) { console.error(e); }
      finally { setLoadingEco(false); }
    }
  }

  // ── Статистика для легенды ──
  const openCount = issues.filter(i => i.status === "Открыто").length;
  const wipCount  = issues.filter(i => i.status === "В работе").length;
  const doneCount = issues.filter(i => i.status === "Решено").length;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: injectStyles }} />

      {/* ── ПАНЕЛЬ УПРАВЛЕНИЯ (сверху справа) ── */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 1000,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      }}>

        {/* Слои: Проблемы / Экология */}
        <div style={{
          display: "flex", gap: 4, padding: 5,
          background: "rgba(24,25,32,0.92)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <button
            className={`sc-map-btn ${!showEcology ? "sc-map-btn-active-dark" : "sc-map-btn-ghost"}`}
            onClick={() => handleToggleEcology(false)}
          >
            📍 Проблемы
          </button>
          <button
            className={`sc-map-btn ${showEcology ? "sc-map-btn-active-green" : "sc-map-btn-ghost"}`}
            onClick={() => handleToggleEcology(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            🌿 Экология
            {loadingEco && (
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#0E0F14", display: "inline-block",
                animation: "map-ping 1s infinite",
              }} />
            )}
          </button>
        </div>

        {/* Темы карты */}
        <div style={{
          display: "flex", gap: 3, padding: 4,
          background: "rgba(24,25,32,0.92)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 11,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          {(Object.keys(MAP_THEMES) as ThemeKey[]).map(k => (
            <button
              key={k}
              className={`sc-map-btn ${activeTheme === k ? "sc-map-btn-active-theme" : "sc-map-btn-ghost"}`}
              style={{ padding: "5px 10px", borderRadius: 7 }}
              onClick={() => setActiveTheme(k)}
            >
              {MAP_THEMES[k].name}
            </button>
          ))}
        </div>
      </div>

      {/* ── ЛЕГЕНДА (снизу слева) ── */}
      {!showEcology && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 1000,
          background: "rgba(24,25,32,0.92)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: "10px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column", gap: 7,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4E5162", marginBottom: 2 }}>
            Статус
          </div>
          {[
            { color: "#FF6B6B", label: "Открыто",  count: openCount },
            { color: "#FFD96B", label: "В работе", count: wipCount  },
            { color: "#6BE4A0", label: "Решено",   count: doneCount },
          ].map(({ color, label, count }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="sc-legend-dot" style={{ background: color }} />
              <span style={{ fontSize: 11, color: "#8B8E9E", flex: 1 }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#F0F1F5" }}>{count}</span>
            </div>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 3, background: "#C8F04B", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#8B8E9E", flex: 1 }}>Всего</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C8F04B" }}>{issues.length}</span>
          </div>
        </div>
      )}

      {/* ── КАРТА ── */}
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          key={activeTheme}
          attribution={MAP_THEMES[activeTheme].attr}
          url={MAP_THEMES[activeTheme].url}
        />

        {showEcology ? (
          ecoData.length > 0 && (
            <HeatmapLayer
              points={ecoData}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              radius={45}
              blur={35}
              max={100}
            />
          )
        ) : (
          issues.map(issue => (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={createCustomIcon(issue.status, issue.category)}
            >
              <Popup className="sc-popup" maxWidth={260}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "16px",
                  minWidth: 230,
                }}>
                  {/* Статус + категория */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px",
                      borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em",
                      background: STATUS_STYLES[issue.status]?.fill + "22" ?? "rgba(255,255,255,0.1)",
                      color: STATUS_STYLES[issue.status]?.fill ?? "#8B8E9E",
                      border: `1px solid ${STATUS_STYLES[issue.status]?.fill ?? "#4E5162"}44`,
                    }}>
                      {issue.status}
                    </span>
                    <span style={{ fontSize: 10, color: "#4E5162", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {issue.category}
                    </span>
                  </div>

                  {/* Заголовок */}
                  <div style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 14, fontWeight: 700,
                    color: "#F0F1F5", lineHeight: 1.3,
                    marginBottom: 6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {issue.title}
                  </div>

                  {/* Адрес */}
                  {issue.address && (
                    <div style={{ fontSize: 11, color: "#4E5162", marginBottom: 10, display: "flex", gap: 5, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0 }}>📍</span>
                      <span style={{ lineHeight: 1.4 }}>{issue.address}</span>
                    </div>
                  )}

                  {/* Описание */}
                  {issue.description && (
                    <div style={{
                      fontSize: 12, color: "#6E7080", lineHeight: 1.6,
                      marginBottom: 14,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {issue.description}
                    </div>
                  )}

                  {/* Кнопка */}
                  <Link
                    href={`/issue/${issue.id}`}
                    style={{
                      display: "block", textAlign: "center",
                      background: "#C8F04B", color: "#0E0F14",
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 11, fontWeight: 800,
                      padding: "10px", borderRadius: 10,
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#d9ff5e")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#C8F04B")}
                  >
                    Подробнее →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
}