// app/layout.tsx
import type { Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

// ─── МЕТАДАННЫЕ ───────────────────────────────────────────────────────────────
export const metadata = {
  title: "Smart City Петропавловск",
  description: "Платформа для мониторинга городских проблем",
};

// ─── НАСТРОЙКИ ЭКРАНА ДЛЯ МОБИЛОК ─────────────────────────────────────────────
// Запрещаем зум при клике на инпуты (особенно бесит на iOS) и фиксируем ширину
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div
          /*
            UI АДАПТАЦИЯ ДЛЯ ТЕЛЕФОНОВ:
            1. h-[100dvh] вместо h-screen — динамическая высота. Учитывает 
               выплывающую строку браузера на iOS/Android (Safari/Chrome).
            2. flex-col-reverse — на мобилках контент (<main>) будет сверху, 
               а <Sidebar> упадет вниз (как Bottom Navigation).
            3. md:flex-row — на планшетах и ПК возвращаем стандартный вид 
               (Сайдбар слева, контент справа).
          */
          className="flex flex-col-reverse md:flex-row h-[100dvh] w-full overflow-hidden"
          style={{ background: "var(--color-base)", color: "var(--text-hi)" }}
        >

          {/* Сайдбар (на мобилках будет внизу, на ПК — слева) */}
          <Sidebar />

          {/* Контентная часть */}
          <main
            className="flex-1 relative overflow-hidden"
            style={{ background: "var(--color-base)" }}
          >
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}