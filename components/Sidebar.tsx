"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ─── ЛОГИКА НЕ ИЗМЕНЕНА ─────────────────────────────────────────────────────
const navItems = [
  { href: "/",       icon: <IconMap />,      label: "Карта"          },
  { href: "/feed",       icon: <IconFeed />,     label: "Лента проблем"  },
  { href: "/categories", icon: <IconCatalog />,  label: "Каталог"        },
  { href: "/ratings",    icon: <IconRating />,   label: "Рейтинг"        },
  { href: "/issue",      icon: <IconIssue />,    label: "Новый сигнал"   },
];
const bottomItems = [
  { href: "/profile", icon: <IconProfile />, label: "Личный кабинет" },
  { href: "/admin",   icon: <IconAdmin />,   label: "Админ-панель"   },
];

// ─── SVG ИКОНКИ (inline, без внешних зависимостей) ──────────────────────────
function IconMap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
}
function IconFeed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/>
      <circle cx="5" cy="19" r="1" fill="currentColor"/>
    </svg>
  );
}
function IconCatalog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function IconRating() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function IconIssue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IconAdmin() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  );
}
// Новые иконки для мобильного меню
function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Состояние мобильного меню

  return (
    <>
      {/* UI: design tokens, локальные для сайдбара */}
      <style>{`
        /* UI: Phamily-style tokens */
        .sc-sidebar {
          --sb-bg:          #0E0F14;
          --sb-surface:     #181920;
          --sb-border:      rgba(255,255,255,0.07);
          --sb-accent:      #C8F04B;
          --sb-accent-bg:   rgba(200,240,75,0.11);
          --sb-accent-ring: rgba(200,240,75,0.25);
          --sb-text-hi:     #F0F1F5;
          --sb-text-mid:    #8B8E9E;
          --sb-text-lo:     #4E5162;
          --sb-radius:      11px;
          --sb-trans:       160ms ease;
        }
        .sc-sidebar * { box-sizing: border-box; }

        .sc-logo-accent {
          display: inline-block;
          background: var(--sb-accent);
          color: var(--sb-bg);
          border-radius: 6px;
          padding: 0 5px;
          line-height: 1.35;
          font-weight: 800;
        }

        .sc-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: var(--sb-radius);
          font-size: 13.5px;
          font-weight: 500;
          color: var(--sb-text-mid);
          transition: color var(--sb-trans), background var(--sb-trans), transform var(--sb-trans);
          text-decoration: none;
          position: relative;
          letter-spacing: 0.01em;
        }
        .sc-nav-item:hover {
          color: var(--sb-text-hi);
          background: rgba(255,255,255,0.05);
          transform: translateX(2px);
        }
        .sc-nav-item.active {
          color: var(--sb-accent);
          background: var(--sb-accent-bg);
          font-weight: 600;
        }
        .sc-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 2.5px;
          background: var(--sb-accent);
          border-radius: 0 2px 2px 0;
        }

        .sc-bottom-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--sb-radius);
          font-size: 13px;
          font-weight: 500;
          color: var(--sb-text-mid);
          transition: color var(--sb-trans), background var(--sb-trans);
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .sc-bottom-item:hover {
          color: var(--sb-text-hi);
          background: rgba(255,255,255,0.04);
        }
        .sc-bottom-item.active {
          color: var(--sb-text-hi);
          background: rgba(255,255,255,0.07);
          font-weight: 600;
        }

        .sc-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sb-text-lo);
          padding: 0 12px;
          margin-bottom: 4px;
        }

        .sc-cta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 9999px;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--sb-bg);
          background: var(--sb-accent);
          transition: background var(--sb-trans), box-shadow var(--sb-trans), transform var(--sb-trans);
          text-decoration: none;
          letter-spacing: 0.01em;
          box-shadow: 0 0 0 0 var(--sb-accent-ring);
        }
        .sc-cta-item:hover {
          background: #d9ff5e;
          box-shadow: 0 4px 20px var(--sb-accent-ring);
          transform: translateY(-1px);
        }
        .sc-cta-item:active { transform: translateY(0); }
      `}</style>

      {/* 📱 МОБИЛЬНАЯ ШАПКА (Скрыта на ПК) */}
      <div 
        className="sc-sidebar md:hidden flex items-center justify-between px-5 h-16 shrink-0 w-full z-40"
        style={{ background: "var(--sb-bg)", borderBottom: "1px solid var(--sb-border)" }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--sb-text-hi)", letterSpacing: "-0.02em" }}>
            Smart <span className="sc-logo-accent">City</span>
          </div>
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          style={{ color: "var(--sb-text-hi)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <IconMenu />
        </button>
      </div>

      {/* 🌑 ЗАТЕМНЕНИЕ ФОНА НА МОБИЛКЕ ПРИ ОТКРЫТОМ МЕНЮ */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 💻 ОСНОВНОЙ САЙДБАР (Выдвижной на телефоне, фиксированный на ПК) */}
      <aside
        className={`
          sc-sidebar w-64 flex flex-col shrink-0
          /* Адаптивность: на мобилках fixed и slide-анимация, на ПК relative */
          fixed top-0 left-0 h-[100dvh] z-[9999] transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:h-full
        `}
        style={{
          background: "var(--sb-bg)",
          borderRight: "1px solid var(--sb-border)",
        }}
      >
        {/* ── ЛОГОТИП И ШАПКА САЙДБАРА ── */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--sb-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Link href="/" style={{ textDecoration: "none", display: "block" }} onClick={() => setIsOpen(false)}>
            <div style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--sb-text-hi)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Smart{" "}
              <span className="sc-logo-accent">City</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "5px",
            }}>
              <span style={{
                width: "6px", height: "6px",
                borderRadius: "50%",
                background: "var(--sb-accent)",
                display: "inline-block",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: "11.5px", color: "var(--sb-text-lo)", letterSpacing: "0.04em" }}>
                Петропавловск
              </span>
            </div>
          </Link>

          {/* Кнопка закрытия (крестик) только для мобилок */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(false)}
            style={{ color: "var(--sb-text-mid)", background: "transparent", border: "none", cursor: "pointer", padding: "0" }}
          >
            <IconClose />
          </button>
        </div>

        {/* ── ОСНОВНАЯ НАВИГАЦИЯ ── */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <div className="sc-section-label" style={{ marginBottom: "8px", marginTop: "4px" }}>
            Навигация
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.href === "/issue") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Закрываем при клике
                  className="sc-cta-item"
                  style={{ marginTop: "8px" }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Закрываем при клике
                className={`sc-nav-item${isActive ? " active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── НИЖНЯЯ НАВИГАЦИЯ (Профиль / Админ) ── */}
        <div style={{
          padding: "12px",
          borderTop: "1px solid var(--sb-border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}>
          <div className="sc-section-label" style={{ marginBottom: "6px" }}>
            Аккаунт
          </div>

          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Закрываем при клике
                className={`sc-bottom-item${isActive ? " active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}