import type { Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Smart City Петропавловск",
  description: "Платформа для мониторинга городских проблем",
};

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
          // flex-col для мобилок (Шапка сверху), md:flex-row для ПК (Сайдбар слева)
          className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden"
          style={{ background: "var(--color-base)", color: "var(--text-hi)" }}
        >
          {/* Наш умный компонент навигации */}
          <Sidebar />

          {/* Основной контент */}
          <main className="flex-1 relative overflow-hidden" style={{ background: "var(--color-base)" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}