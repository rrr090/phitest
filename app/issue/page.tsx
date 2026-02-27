// app/issue/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabase";

const LocationPicker = dynamic(() => import("../../components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center" style={{ background: "#1C1D27", color: "#4E5162", fontSize: 13 }}>
      Загрузка карты…
    </div>
  ),
});

const CATEGORIES = [
  { value: "Дороги",       emoji: "🛣️",  label: "Дороги"      },
  { value: "Экология",     emoji: "🌳",  label: "Экология"    },
  { value: "ЖКХ",          emoji: "🚰",  label: "ЖКХ"         },
  { value: "Освещение",    emoji: "💡",  label: "Освещение"   },
  { value: "Безопасность", emoji: "🛡️", label: "Безопасность"},
  { value: "Прочее",       emoji: "📋",  label: "Прочее"      },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .iss { --bg:#0E0F14; --surface:#181920; --surface2:#1C1D27; --border:rgba(255,255,255,0.07);
    --border2:rgba(255,255,255,0.04); --accent:#C8F04B; --accent-bg:rgba(200,240,75,0.1);
    --red:#FF6B6B; --red-bg:rgba(255,107,107,0.1); --muted:#4E5162; --mid:#8B8E9E; --hi:#F0F1F5;
    --r:14px; --t:150ms ease;
    font-family:'JetBrains Mono',monospace; background:var(--bg); color:var(--hi);
    min-height:100%; }

  .iss * { box-sizing:border-box; }

  @keyframes iss-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes iss-spin { to{transform:rotate(360deg)} }
  .fu  { animation:iss-up 0.4s both; }
  .d1  { animation-delay:.05s } .d2{animation-delay:.10s}
  .d3  { animation-delay:.15s } .d4{animation-delay:.20s}
  .d5  { animation-delay:.25s } .d6{animation-delay:.30s}

  /* FIELD */
  .iss-label {
    font-size:10px; font-weight:700; letter-spacing:0.12em;
    text-transform:uppercase; color:var(--muted); display:block; margin-bottom:8px;
  }
  .iss-input {
    width:100%; background:var(--surface2); border:1px solid var(--border);
    border-radius:var(--r); padding:12px 14px; font-size:13px;
    font-family:'JetBrains Mono',monospace; color:var(--hi); outline:none;
    transition:border-color var(--t);
  }
  .iss-input::placeholder { color:var(--muted); }
  .iss-input:focus { border-color:rgba(200,240,75,0.4); }
  .iss-textarea { resize:vertical; min-height:100px; }

  /* CAT PILLS */
  .iss-cat-pill {
    display:flex; flex-direction:column; align-items:center; gap:5px;
    padding:12px 10px; border-radius:12px;
    border:1.5px solid var(--border); background:var(--surface2);
    font-size:10px; font-weight:700; letter-spacing:0.04em;
    color:var(--mid); cursor:pointer; transition:all var(--t);
    flex:1; min-width:0; text-align:center; white-space:nowrap;
  }
  .iss-cat-pill:hover { border-color:rgba(200,240,75,0.3); color:var(--accent); }
  .iss-cat-pill.active { border-color:var(--accent); background:var(--accent-bg); color:var(--accent); }
  .iss-cat-pill .emoji { font-size:20px; line-height:1; }

  /* PHOTO AREA */
  .iss-photo-zone {
    width:100%; border:1.5px dashed var(--border); border-radius:var(--r);
    background:var(--surface2); cursor:pointer; overflow:hidden;
    transition:border-color var(--t), background var(--t);
    display:flex; align-items:center; justify-content:center;
    min-height:140px; position:relative;
  }
  .iss-photo-zone:hover { border-color:rgba(200,240,75,0.35); background:#1e1f2a; }
  .iss-photo-zone.has-photo { border-style:solid; border-color:rgba(200,240,75,0.35); }

  /* MAP ZONE */
  .iss-map-zone {
    width:100%; border-radius:var(--r); overflow:hidden;
    border:1.5px solid var(--border);
    transition:border-color var(--t);
    height:200px; position:relative;
  }
  .iss-map-zone.active { border-color:rgba(200,240,75,0.4); }

  /* GEO BUTTON */
  .iss-geo-btn {
    position:absolute; bottom:10px; right:10px; z-index:500;
    display:flex; align-items:center; gap:6px;
    padding:7px 12px; border-radius:999px;
    background:rgba(14,15,20,0.88); backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,0.12);
    color:#F0F1F5; font-family:'JetBrains Mono',monospace;
    font-size:11px; font-weight:700; cursor:pointer;
    transition:all var(--t); white-space:nowrap;
    box-shadow:0 4px 16px rgba(0,0,0,0.4);
  }
  .iss-geo-btn:hover { border-color:rgba(200,240,75,0.4); color:var(--accent); }
  .iss-geo-btn:disabled { opacity:.5; cursor:not-allowed; }
  .iss-geo-btn .geo-spin { animation:iss-spin .8s linear infinite; display:inline-block; }

  /* PHOTO BUTTONS */
  .iss-photo-actions {
    display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;
  }
  .iss-photo-btn {
    display:flex; flex-direction:column; align-items:center; gap:6px;
    padding:14px 10px; border-radius:var(--r);
    border:1.5px dashed var(--border); background:var(--surface2);
    color:var(--mid); font-family:'JetBrains Mono',monospace;
    font-size:11px; font-weight:700; cursor:pointer;
    transition:all var(--t); text-align:center;
  }
  .iss-photo-btn:hover { border-color:rgba(200,240,75,0.35); color:var(--accent); background:#1e1f2a; }
  .iss-photo-btn .pb-icon { font-size:24px; line-height:1; }

  /* MOBILE: stack map + photo vertically on small screens */
  @media(max-width:520px) {
    .iss-media-grid { grid-template-columns:1fr !important; }
    .iss-map-zone { height:220px; }
    .iss-photo-zone { min-height:120px; }
  }

  /* SUBMIT */
  .iss-submit {
    width:100%; padding:15px; border-radius:var(--r);
    background:var(--accent); border:none; cursor:pointer;
    font-family:'Syne',sans-serif; font-size:15px; font-weight:800;
    color:#0E0F14; letter-spacing:0.01em;
    transition:all var(--t); display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .iss-submit:hover:not(:disabled) { background:#d9ff5e; box-shadow:0 6px 24px rgba(200,240,75,0.3); transform:translateY(-1px); }
  .iss-submit:disabled { opacity:.5; cursor:not-allowed; transform:none !important; }
  .iss-spinner { width:18px; height:18px; border:2.5px solid transparent; border-top-color:#0E0F14; border-radius:50%; animation:iss-spin .7s linear infinite; }

  /* ERROR */
  .iss-error { background:var(--red-bg); border:1px solid rgba(255,107,107,0.3); color:var(--red); border-radius:var(--r); padding:12px 16px; font-size:12px; }

  /* DIVIDER */
  .iss-divider { height:1px; background:var(--border); margin:4px 0; }

  /* SUCCESS */
  .iss-success-wrap { height:100%; display:flex; align-items:center; justify-content:center; padding:24px; background:var(--bg); }
  .iss-success-card { background:var(--surface); border:1px solid rgba(107,228,160,0.3); border-radius:24px; padding:40px 32px; text-align:center; max-width:360px; width:100%; }
`;

export default function IssuePage() {
  const router = useRouter();

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("Дороги");
  const [address, setAddress]         = useState("");
  const [position, setPosition]       = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto]             = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [isSuccess, setIsSuccess]     = useState(false);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError]       = useState("");

  // ── PHOTO HANDLER ──────────────────────────────────────────────────────────
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Фото больше 5MB. Выберите другой файл.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMsg("");
  }

  // ── GEOLOCATION ────────────────────────────────────────────────────────────
  function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoError("Геолокация не поддерживается вашим браузером.");
      return;
    }
    setGeoLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === 1 ? "Разрешите доступ к геолокации в настройках браузера." :
          err.code === 2 ? "Не удалось определить местоположение. Попробуйте ещё раз." :
          "Превышено время ожидания геолокации."
        );
        setGeoLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // ── SUBMIT ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!position) {
      setErrorMsg("Укажите место проблемы на карте.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Введите краткое название.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Получаем пользователя внутри функции (не на уровне модуля!)
      const { data: { user } } = await supabase.auth.getUser();

      let imageUrl: string | null = null;

      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("issue-photos")
          .upload(fileName, photo);
        if (uploadError) throw new Error("Ошибка загрузки фото: " + uploadError.message);
        const { data: pub } = supabase.storage.from("issue-photos").getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const { error } = await supabase.from("issues").insert([{
        title:       title.trim(),
        description: description.trim(),
        category,
        address:     address.trim(),
        lat:         position.lat,
        lng:         position.lng,
        image_url:   imageUrl,
        status:      "Открыто",
        user_id:     user?.id ?? null,
        author_name: user?.email ?? "Аноним",
        likes_count: 0,
      }]);

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => router.push("/"), 2200);
    } catch (err: any) {
      setErrorMsg(err.message || "Что-то пошло не так.");
      setIsSubmitting(false);
    }
  }

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="iss iss-success-wrap">
          <div className="iss-success-card">
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "var(--hi)", marginBottom: 10 }}>
              Сигнал принят!
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Перенаправляем на карту…</p>
            <div style={{ marginTop: 20, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#C8F04B", borderRadius: 2, animation: "iss-fill 2.2s linear forwards" }} />
            </div>
          </div>
          <style>{`@keyframes iss-fill{from{width:0}to{width:100%}}`}</style>
        </div>
      </>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="iss" style={{ height: "100%", overflowY: "auto" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(16px,4vw,40px) clamp(12px,4vw,24px) 80px" }}>

          {/* ── ШАПКА ── */}
          <div className="fu d1" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 4, height: 30, background: "#C8F04B", borderRadius: 2 }} />
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(22px,5vw,32px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
                Новый сигнал
              </h1>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", paddingLeft: 14 }}>
              Сообщите о городской проблеме — мы передадим её в нужную службу
            </p>
          </div>

          {/* ── ERROR ── */}
          {errorMsg && (
            <div className="iss-error fu" style={{ marginBottom: 16 }}>
              ⚠ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── КАТЕГОРИЯ ── */}
            <div className="fu d1">
              <label className="iss-label">Категория *</label>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`iss-cat-pill${category === cat.value ? " active" : ""}`}
                    onClick={() => setCategory(cat.value)}
                  >
                    <span className="emoji">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── НАЗВАНИЕ ── */}
            <div className="fu d2">
              <label className="iss-label" htmlFor="title">Краткое название *</label>
              <input
                id="title"
                className="iss-input"
                type="text"
                required
                placeholder="Например: Яма на ул. Пушкина"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* ── КАРТА + ФОТО ── */}
            <div className="fu d3 iss-media-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              {/* Карта */}
              <div>
                <label className="iss-label">Место на карте *</label>
                <div className={`iss-map-zone${position ? " active" : ""}`}>
                  <LocationPicker position={position} setPosition={setPosition} />
                  {!position && (
                    <div style={{
                      position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                      background: "rgba(14,15,20,0.85)", backdropFilter: "blur(6px)",
                      padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      color: "#F0F1F5", whiteSpace: "nowrap", zIndex: 400, pointerEvents: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      👆 Нажмите на карту
                    </div>
                  )}
                  {/* ── КНОПКА МОЕГО МЕСТОПОЛОЖЕНИЯ ── */}
                  <button
                    type="button"
                    className="iss-geo-btn"
                    onClick={handleGeolocate}
                    disabled={geoLocating}
                    title="Определить моё местоположение"
                  >
                    {geoLocating
                      ? <><span className="geo-spin">⟳</span> Поиск…</>
                      : <><span>📍</span> Я здесь</>
                    }
                  </button>
                </div>
                {geoError && (
                  <p style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>⚠ {geoError}</p>
                )}
                {position && !geoError && (
                  <p style={{ fontSize: 11, color: "#6BE4A0", marginTop: 6, fontWeight: 700 }}>
                    ✓ {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Фото */}
              <div>
                <label className="iss-label">Фото (необязательно)</label>

                {/* Скрытые инпуты: отдельно камера и галерея */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

                {photoPreview ? (
                  /* Превью фото */
                  <div
                    className="iss-photo-zone has-photo"
                    style={{ height: 200 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img
                      src={photoPreview}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                      position: "absolute", bottom: 8, left: 8,
                      background: "rgba(14,15,20,0.8)", backdropFilter: "blur(4px)",
                      padding: "4px 10px", borderRadius: 8,
                      fontSize: 10, fontWeight: 700, color: "#6BE4A0",
                      border: "1px solid rgba(107,228,160,0.3)",
                    }}>
                      ✓ Фото добавлено
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); }}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 30, height: 30, borderRadius: 8,
                        background: "rgba(255,107,107,0.9)", border: "none",
                        color: "#fff", cursor: "pointer", fontSize: 15,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                    {/* Переснять */}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      style={{
                        position: "absolute", bottom: 8, right: 8,
                        padding: "4px 10px", borderRadius: 8,
                        background: "rgba(14,15,20,0.8)", backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#F0F1F5", cursor: "pointer", fontSize: 10, fontWeight: 700,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      📷 Переснять
                    </button>
                  </div>
                ) : (
                  /* Две кнопки: камера + галерея */
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Большая кнопка камеры */}
                    <button
                      type="button"
                      className="iss-photo-btn"
                      style={{ paddingTop: 20, paddingBottom: 20 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="pb-icon">📷</span>
                      <span>Сфотографировать</span>
                      <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 400 }}>открыть камеру</span>
                    </button>
                    {/* Кнопка галереи */}
                    <button
                      type="button"
                      className="iss-photo-btn"
                      style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingTop: 11, paddingBottom: 11 }}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <span style={{ fontSize: 18 }}>🖼️</span>
                      <span>Выбрать из галереи</span>
                    </button>
                    <p style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>PNG, JPG · до 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── АДРЕС ── */}
            <div className="fu d4">
              <label className="iss-label" htmlFor="address">Уточните адрес</label>
              <input
                id="address"
                className="iss-input"
                type="text"
                placeholder="ул. Пушкина, 12 (необязательно)"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* ── ОПИСАНИЕ ── */}
            <div className="fu d5">
              <label className="iss-label" htmlFor="desc">Подробное описание *</label>
              <textarea
                id="desc"
                className="iss-input iss-textarea"
                required
                placeholder="Опишите проблему подробнее: когда заметили, насколько опасно, что мешает…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* ── SUBMIT ── */}
            <div className="fu d6">
              <button type="submit" className="iss-submit" disabled={isSubmitting}>
                {isSubmitting
                  ? <><span className="iss-spinner" /> Публикация…</>
                  : "Опубликовать сигнал →"
                }
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>
                Заявка будет передана в городские службы Петропавловска
              </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}