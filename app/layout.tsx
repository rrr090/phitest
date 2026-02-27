// app/layout.tsx
import Sidebar from "@/components/Sidebar"; // Убедись, что путь правильный!
import "./globals.css";

export const metadata = {
  title: "Smart City Петропавловск",
  description: "Платформа для мониторинга городских проблем",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
          
          {/* Наш новый умный сайдбар */}
          <Sidebar />

          {/* Правая часть (Здесь Next.js будет менять страницы) */}
          <main className="flex-1 relative overflow-hidden bg-gray-50">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}