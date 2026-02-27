"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Все");

  // Загрузка данных
  const fetchIssues = async () => {
    setLoading(true);
    let query = supabase.from("issues").select("*").order("created_at", { ascending: false });
    
    if (filter !== "Все") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (!error) setIssues(data as Issue[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  // Функция смены статуса
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // Обновляем локальный стейт, чтобы не перезагружать всю страницу
      setIssues(issues.map(iss => iss.id === id ? { ...iss, status: newStatus as any } : iss));
    } else {
      alert("Ошибка при обновлении статуса");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ЗАГОЛОВОК И СТАТИСТИКА */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Управление городом</h1>
            <p className="text-gray-500">Панель модератора Петропавловска</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {["Все", "Открыто", "В работе", "Решено"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === f ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ТАБЛИЦА */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <th className="px-6 py-4">Проблема</th>
                  <th className="px-6 py-4">Категория</th>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center animate-pulse text-gray-400 font-medium">Загрузка данных...</td></tr>
                ) : issues.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-medium">Нет заявок с таким статусом</td></tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {issue.image_url ? (
                              <img src={issue.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📍</div>
                            )}
                          </div>
                          <div>
                            <Link href={`/issue/${issue.id}`} className="font-bold text-gray-900 hover:text-blue-600 block transition-colors">
                              {issue.title}
                            </Link>
                            <p className="text-xs text-gray-400 line-clamp-1">{issue.address || "Адрес не указан"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wide">
                          {issue.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5">
                        <select 
                          value={issue.status}
                          onChange={(e) => updateStatus(issue.id, e.target.value)}
                          className={`text-xs font-black px-3 py-1.5 rounded-full border-none shadow-sm cursor-pointer focus:ring-2 focus:ring-offset-2 transition-all ${
                            issue.status === 'Решено' ? 'bg-green-100 text-green-700 ring-green-500' :
                            issue.status === 'В работе' ? 'bg-yellow-100 text-yellow-700 ring-yellow-500' :
                            'bg-red-100 text-red-700 ring-red-500'
                          }`}
                        >
                          <option value="Открыто">🔴 Открыто</option>
                          <option value="В работе">🟡 В работе</option>
                          <option value="Решено">🟢 Решено</option>
                          <option value="Отклонено">⚪ Отклонено</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          href={`/issue/${issue.id}`}
                          className="text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-colors"
                        >
                          Детали →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}