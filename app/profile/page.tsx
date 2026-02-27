"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      // Получаем текущую сессию
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Грузим только те записи, где user_id совпадает
        const { data } = await supabase
          .from("issues")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        setMyIssues(data as Issue[] || []);
      }
      setLoading(false);
    }
    loadProfileData();
  }, []);

  if (loading) return <div className="p-10 text-center">Загрузка профиля...</div>;

  // Если пользователь не залогинен
  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-gray-900">Личный кабинет</h2>
        <p className="text-gray-500 mt-2 mb-6 max-w-xs">Войдите, чтобы отслеживать свои заявки и копить баллы рейтинга.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all">
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* КАРТОЧКА ЮЗЕРА */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-100">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{user.email.split('@')[0]}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
            className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            Выйти
          </button>
        </div>

        {/* СПИСОК МОИХ ЗАЯВОК */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Мои обращения <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{myIssues.length}</span>
          </h2>

          {myIssues.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed text-center text-gray-400">
              Вы еще не создали ни одного сигнала.
            </div>
          ) : (
            <div className="grid gap-4">
              {myIssues.map(issue => (
                <Link 
                  href={`/issue/${issue.id}`} 
                  key={issue.id} 
                  className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                       {issue.status === 'Решено' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{issue.title}</h3>
                      <p className="text-xs text-gray-400">{new Date(issue.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                    issue.status === 'Решено' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {issue.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}