// app/feed/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Issue } from "@/lib/types";
import Link from "next/link";

function FeedContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      let query = supabase.from("issues").select("*").order("created_at", { ascending: false });

      // Если в URL есть категория, фильтруем запрос к БД
      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (!error) setIssues(data as Issue[]);
      setLoading(false);
    }

    fetchIssues();
  }, [categoryFilter]);

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Загрузка ленты...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {categoryFilter ? `Проблемы: ${categoryFilter}` : "Все сигналы города"}
        </h1>
        {categoryFilter && (
          <Link href="/feed" className="text-sm text-blue-600 hover:underline">Сбросить фильтр</Link>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
          <p className="text-gray-400">В этой категории пока нет обращений 🎈</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {issues.map((issue) => (
            <Link 
              href={`/issue/${issue.id}`} 
              key={issue.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-6"
            >
              <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                {issue.image_url ? (
                  <img src={issue.image_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50 uppercase font-bold text-gray-300">
                    {issue.category[0]}
                  </div>
                )}
              </div>
              
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1 block">
                      {issue.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      issue.status === 'Решено' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{issue.title}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2">{issue.description}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-400">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-bold text-gray-700">👍 {issue.likes_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-10">
      <Suspense fallback={<div>Загрузка...</div>}>
        <FeedContent />
      </Suspense>
    </div>
  );
}