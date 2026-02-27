// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import "./globals.css";

// ─── МЕТАДАННЫЕ (не изменены) ─────────────────────────────────────────────────
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
      {/*
        UI: удалён inline-класс bg-gray-50 — фон теперь контролируется
        через CSS-переменную --color-base в globals.css.
        Шрифт подключён через @import в globals.css (Manrope).
      */}
      <body>

        {/*
          UI: flex-контейнер на всю высоту.
          - bg-gray-50 → var(--color-base) тёмная подложка
          - text-gray-900 → var(--text-hi) светлый текст
          - overflow-hidden сохранён — скролл будет внутри <main>
        */}
        <div
          className="flex h-screen w-full overflow-hidden"
          style={{ background: "var(--color-base)", color: "var(--text-hi)" }}
        >

          {/* Сайдбар — DOM/ширина/поведение не изменены */}
          <Sidebar />

          {/*
            UI: <main> теперь тёмный, совпадает с общей подложкой.
            overflow-y: auto внутри main — каждая страница сама
            управляет скроллом через .page-content из globals.css.
            
            Каждая page.tsx должна оборачивать контент в:
              <div className="page-content"> ... </div>
            или
              <div className="page-content-sm"> ... </div>
            
            Это обеспечивает единые отступы и скролл на всех страницах.
          */}
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
