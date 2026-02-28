"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ImagePlus, Send, Loader2, X } from "lucide-react";

interface Comment {
  id: string;
  created_at: string;
  text: string;
  image_url: string | null;
  user_id: string;
}

interface CommentSectionProps {
  issueId: string;
}

export default function CommentSection({ issueId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Загружаем комментарии и проверяем авторизацию
  useEffect(() => {
    const fetchSessionAndComments = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);

      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });

      if (data) setComments(data);
    };

    fetchSessionAndComments();
  }, [issueId]);

  // Обработка выбора фото
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Отправка комментария
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    if (!userId) return alert("Пожалуйста, авторизуйтесь!");

    setIsSubmitting(true);
    let imageUrl = null;

    try {
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("comment_images")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("comment_images")
          .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("comments")
        .insert([
          { issue_id: issueId, user_id: userId, text, image_url: imageUrl }
        ])
        .select()
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setText("");
      setImage(null);
      setImagePreview(null);

    } catch (error: any) {
      console.error("Ошибка:", error.message);
      alert("Не удалось отправить комментарий.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#181920] rounded-[24px] shadow-2xl border border-white/5 p-6 md:p-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <h3 className="text-sm font-black text-[#8B8E9E] uppercase tracking-widest mb-6">
        Обсуждение <span className="text-[#C8F04B]">({comments.length})</span>
      </h3>

      {/* Список комментариев */}
      <div className="space-y-4 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#C8F04B]/20 flex items-center justify-center text-[#C8F04B] font-bold text-xs border border-[#C8F04B]/30">
                ID
              </div>
              <span className="text-xs text-[#4E5162] font-medium tracking-wider">
                {new Date(comment.created_at).toLocaleDateString("ru-RU", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {comment.text && (
              <p className="text-sm text-[#F0F1F5] leading-relaxed whitespace-pre-wrap mb-3 opacity-90">
                {comment.text}
              </p>
            )}
            
            {comment.image_url && (
              <img 
                src={comment.image_url} 
                alt="Фото к комментарию" 
                className="rounded-xl max-h-56 object-cover border border-white/10"
              />
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
            <span className="text-3xl mb-3 block opacity-30 grayscale">💬</span>
            <p className="text-sm text-[#4E5162] font-medium uppercase tracking-widest">Пока нет комментариев</p>
          </div>
        )}
      </div>

      {/* Форма ввода (видна только авторизованным) */}
      {userId ? (
        <form onSubmit={handleSubmit} className="relative">
          {/* Превью выбранного фото */}
          {imagePreview && (
            <div className="relative inline-block mb-4">
              <img src={imagePreview} alt="Preview" className="h-24 rounded-xl border border-white/20 shadow-lg object-cover" />
              <button 
                type="button" 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-[#0E0F14] rounded-2xl border border-white/10 p-2 focus-within:border-[#C8F04B]/50 focus-within:ring-1 focus-within:ring-[#C8F04B]/30 transition-all shadow-inner">
            
            {/* Кнопка загрузки фото */}
            <label className="p-3 text-[#4E5162] hover:text-[#C8F04B] cursor-pointer transition-colors shrink-0 rounded-xl hover:bg-white/5">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <ImagePlus className="w-6 h-6" />
            </label>

            {/* Поле ввода текста */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Написать комментарий..."
              className="flex-1 max-h-32 min-h-[48px] resize-none outline-none py-3 px-2 text-sm text-[#F0F1F5] placeholder-[#4E5162] bg-transparent"
              rows={1}
            />

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isSubmitting || (!text.trim() && !image)}
              className="p-3 bg-[#C8F04B] text-[#0E0F14] rounded-xl hover:bg-[#d9ff5e] disabled:bg-white/5 disabled:text-[#4E5162] transition-all shrink-0 shadow-[0_4px_16px_rgba(200,240,75,0.15)] disabled:shadow-none"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center p-5 bg-white/5 rounded-2xl border border-white/5 text-xs text-[#8B8E9E] font-bold uppercase tracking-widest">
          Войдите в систему, чтобы оставить комментарий
        </div>
      )}
    </div>
  );
}