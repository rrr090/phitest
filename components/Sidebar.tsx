// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Список всех ссылок нашего приложения
const navItems = [
  { href: "/", icon: "🗺️", label: "Карта" },
  { href: "/feed", icon: "📰", label: "Лента проблем" },
  { href: "/categories", icon: "🗂️", label: "Каталог" },
  { href: "/ratings", icon: "🏆", label: "Рейтинг" },
  { href: "/issue", icon: "📝", label: "Новый сигнал" },
];

const bottomItems = [
  { href: "/profile", icon: "👤", label: "Личный кабинет" },
  { href: "/admin", icon: "⚙️", label: "Админ-панель" },
];

export default function Sidebar() {
  const pathname = usePathname(); // Хук Next.js для получения текущего URL

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col z-20 h-full shrink-0">
      
      {/* Логотип */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Smart City
          </h1>
          <p className="text-xs text-gray-500 mt-1">Петропавловск</p>
        </Link>
      </div>

      {/* Основная навигация */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Навигация в подвале (Профиль, Настройки) */}
      <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? "bg-gray-200 text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      
    </aside>
  );
}