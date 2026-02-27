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
          className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden"
          style={{ background: "#0E0F14", color: "#F0F1F5" }}
        >
          <Sidebar />

          {/* 
            На мобилках: Sidebar рендерит mobile header (h-16) + bottom nav (h-16).
            main должен занять оставшуюся высоту между ними.
            На ПК: flex-1 relative как обычно.
          */}
          <main className="flex-1 relative w-full overflow-hidden
            /* Мобилка: учитываем высоту нижней навбара (64px) */
            pb-16 md:pb-0
          ">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}