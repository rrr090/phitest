"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserRank {
  name: string;
  points: number;
  count: number;
}

export default function RatingsPage() {
  const [leaders, setLeaders] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      // Тянем все записи, чтобы посчитать баллы по авторам
      const { data, error } = await supabase
        .from("issues")
        .select("author_name, status");

      if (!error && data) {
        const userStats: Record<string, UserRank> = {};

        data.forEach((issue) => {
          const name = issue.author_name || "Аноним";
          if (!userStats[name]) {
            userStats[name] = { name, points: 0, count: 0 };
          }
          
          // Логика начисления баллов
          userStats[name].count += 1;
          userStats[name].points += 10; // +10 за сам факт обращения
          if (issue.status === "Решено") {
            userStats[name].points += 50; // +50 если проблема благодаря им решена
          }
        });

        // Сортируем по убыванию баллов
        const sorted = Object.values(userStats).sort((a, b) => b.points - a.points);
        setLeaders(sorted);
      }
      setLoading(false);
    }
    fetchRankings();
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">Вычисляем лидеров...</div>;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Герои Петропавловска</h1>
          <p className="text-gray-500 text-lg">Жители, которые делают наш город лучше каждый день</p>
        </div>

        {/* ПЬЕДЕСТАЛ ТОП-3 */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-10">
          {leaders.slice(0, 3).map((user, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={user.name} 
                className={`bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center transition-all hover:-translate-y-2 ${
                  isFirst ? "md:w-80 md:-mt-10 border-yellow-200 z-10" : "md:w-64 opacity-90"
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner ${
                  index === 0 ? "bg-yellow-100 text-yellow-600" : 
                  index === 1 ? "bg-slate-100 text-slate-500" : "bg-orange-100 text-orange-600"
                }`}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <h3 className="font-black text-xl text-gray-900 text-center truncate w-full">{user.name}</h3>
                <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">{user.count} сигналов</p>
                <div className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-2xl font-black text-lg">
                  {user.points} <span className="text-xs font-normal text-gray-400">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ТАБЛИЦА ОСТАЛЬНЫХ */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Общий лидерборд</h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Всего участников: {leaders.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {leaders.slice(3, 10).map((user, idx) => (
              <div key={user.name} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 font-black w-6 text-center">{idx + 4}</span>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.count} обращений</p>
                  </div>
                </div>
                <span className="font-black text-gray-900 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  {user.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}