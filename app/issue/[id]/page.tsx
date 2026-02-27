"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 2. Получаем данные о проблеме
        const { data: issueData, error: issueError } = await supabase
          .from("issues")
          .select("*")
          .eq("id", params.id)
          .single();

        if (issueError || !issueData) {
          setError(true);
          return;
        }
        setIssue(issueData);

        // 3. Если пользователь залогинен, проверяем ставил ли он лайк
        if (user) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("*")
            .eq("user_id", user.id)
            .eq("issue_id", params.id)
            .single();
          
          if (likeData) setHasLiked(true);
        }
      } catch (err) {
        console.error("Error loading page:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) loadData();
  }, [params.id]);

  const handleLike = async () => {
    if (!currentUser) return alert("Войдите, чтобы поддержать проблему");
    if (hasLiked || !issue) return;

    // 1. Добавляем запись в таблицу likes
    const { error: likeError } = await supabase
      .from("likes")
      .insert([{ user_id: currentUser.id, issue_id: issue.id }]);

    if (likeError) {
      if (likeError.code === '23505') setHasLiked(true); // Уже лайкнуто (защита БД)
      else alert("Ошибка при сохранении лайка");
      return;
    }

    // 2. Увеличиваем счетчик в таблице issues через RPC
    const { error: updateError } = await supabase
      .rpc('increment_likes', { row_id: issue.id });

    if (!updateError) {
      setHasLiked(true);
      setIssue(prev => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : null);
    } else {
      console.error("RPC Error:", updateError);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-2xl font-bold text-gray-900">Проблема не найдена</h2>
        <p className="text-gray-500 mt-2 mb-6">Возможно, она была удалена или ссылка неверна.</p>
        <Link href="/" className="text-blue-600 font-medium hover:underline">Вернуться на карту</Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Назад
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* ФОТО */}
          <div className="w-full h-64 md:h-96 bg-gray-200 relative">
            {issue.image_url ? (
              <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-6xl">🖼️</span>
                <p className="mt-2">Фотография не приложена</p>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg text-white ${
                issue.status === 'Решено' ? 'bg-green-500' : 
                issue.status === 'В работе' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {issue.status}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-400">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                {issue.category}
              </span>
              <span>ID: #{issue.id.slice(0, 8)}</span>
              <span>•</span>
              <span>{new Date(issue.created_at).toLocaleDateString('ru-RU')}</span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-6">{issue.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Описание</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Местоположение</h3>
                  <p className="text-gray-900 font-medium">📍 {issue.address || "Адрес не указан"}</p>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl h-fit">
                <p className="text-blue-100 text-sm mb-1">Поддержали проблему</p>
                <div className="text-3xl font-bold mb-4">{issue.likes_count || 0} чел.</div>
                <button 
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-sm ${
                    hasLiked 
                      ? "bg-blue-400 cursor-default" 
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {hasLiked ? "✅ Вы поддержали" : "🙌 Поддержать"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}