"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import CommentSection from "@/components/CommentSection";

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
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

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

    const { error: likeError } = await supabase
      .from("likes")
      .insert([{ user_id: currentUser.id, issue_id: issue.id }]);

    if (likeError) {
      if (likeError.code === '23505') setHasLiked(true); 
      else alert("Ошибка при сохранении лайка");
      return;
    }

    const { error: updateError } = await supabase
      .rpc('increment_likes', { row_id: issue.id });

    if (!updateError) {
      setHasLiked(true);
      setIssue(prev => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : null);
    } else {
      console.error("RPC Error:", updateError);
    }
  };

  // ─── СОСТОЯНИЕ ЗАГРУЗКИ (Тёмная тема) ───
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0E0F14]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8F04B]"></div>
      </div>
    );
  }

  // ─── СОСТОЯНИЕ ОШИБКИ (Тёмная тема) ───
  if (error || !issue) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0E0F14] p-6 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span className="text-6xl mb-4 opacity-50 filter grayscale">🔍</span>
        <h2 className="text-2xl font-bold text-[#F0F1F5]">Проблема не найдена</h2>
        <p className="text-[#8B8E9E] mt-2 mb-6">Возможно, она была удалена или ссылка неверна.</p>
        <Link href="/" className="px-6 py-3 bg-[#181920] border border-white/10 text-[#C8F04B] rounded-xl font-bold hover:bg-white/5 transition-colors">
          Вернуться на карту
        </Link>
      </div>
    );
  }

  // ─── ОСНОВНОЙ КОНТЕНТ ───
  return (
    <div className="h-full overflow-y-auto bg-[#0E0F14] text-[#F0F1F5] p-4 md:p-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Кнопка Назад */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8B8E9E] hover:text-[#C8F04B] transition-colors mb-6 group text-sm font-bold"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> НАЗАД
        </button>

        {/* Главная карточка */}
        <div className="bg-[#181920] rounded-[24px] shadow-2xl border border-white/5 overflow-hidden">
          
          {/* ── ФОТО ── */}
          <div className="w-full h-64 md:h-96 bg-[#0E0F14] relative border-b border-white/5">
            {issue.image_url ? (
              <img src={issue.image_url} alt={issue.title} className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#4E5162]">
                <span className="text-6xl mb-2 opacity-50 grayscale">🖼️</span>
                <p className="text-sm font-bold tracking-widest uppercase">Фото не приложено</p>
              </div>
            )}
            
            {/* Бэйдж статуса (Адаптирован под тёмную тему) */}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                issue.status === 'Решено' ? 'bg-[#C8F04B]/20 text-[#C8F04B] border-[#C8F04B]/30' : 
                issue.status === 'В работе' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {issue.status}
              </span>
            </div>
          </div>

          {/* ── ИНФОРМАЦИЯ ── */}
          <div className="p-6 md:p-10">
            {/* Мета-данные */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-[#8B8E9E] font-medium tracking-wide">
              <span className="bg-white/5 border border-white/10 text-[#F0F1F5] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
                {issue.category}
              </span>
              <span className="bg-white/5 px-3 py-1.5 rounded-lg">ID: #{issue.id.slice(0, 8)}</span>
              <span>•</span>
              <span>{new Date(issue.created_at).toLocaleDateString('ru-RU')}</span>
            </div>

            {/* Заголовок */}
            <h1 className="text-2xl md:text-3xl font-black text-[#F0F1F5] mb-8 leading-tight">{issue.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
              
              {/* Левая колонка (Описание и адрес) */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xs font-black text-[#8B8E9E] uppercase tracking-widest mb-3">Описание</h3>
                  <p className="text-[#F0F1F5] leading-relaxed whitespace-pre-wrap text-sm md:text-base opacity-90">
                    {issue.description}
                  </p>
                </div>
                
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-black text-[#8B8E9E] uppercase tracking-widest mb-2">Местоположение</h3>
                  <p className="text-[#C8F04B] font-medium flex items-center gap-2">
                    <span>📍</span> {issue.address || "Адрес не указан"}
                  </p>
                </div>
              </div>

              {/* Правая колонка (Лайки) */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-fit flex flex-col items-center text-center">
                <p className="text-[#8B8E9E] text-xs font-bold uppercase tracking-widest mb-2">Поддержали</p>
                <div className="text-4xl font-black text-[#F0F1F5] mb-6 tracking-tighter">
                  {issue.likes_count || 0} <span className="text-lg text-[#4E5162]">чел.</span>
                </div>
                
                <button 
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm uppercase tracking-wider ${
                    hasLiked 
                      ? "bg-white/10 text-[#8B8E9E] cursor-default border border-white/5" 
                      : "bg-[#C8F04B] text-[#0E0F14] hover:bg-[#d9ff5e] shadow-[0_4px_16px_rgba(200,240,75,0.2)] active:scale-95"
                  }`}
                >
                  {hasLiked ? "Вы поддержали" : "Поддержать"}
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* ── КОММЕНТАРИИ (В самом низу) ── */}
        <div className="mt-8">
          <CommentSection issueId={issue.id} />
        </div>

      </div>
    </div>
  );
}