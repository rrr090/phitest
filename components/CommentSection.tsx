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
      // 1. Если есть фото — грузим его в Storage
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // ВАЖНО: замени 'comment_images' на название своего бакета
        const { error: uploadError } = await supabase.storage
          .from("comment_images")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("comment_images")
          .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Сохраняем комментарий в базу
      const { data, error } = await supabase
        .from("comments")
        .insert([
          { issue_id: issueId, user_id: userId, text, image_url: imageUrl }
        ])
        .select()
        .single();

      if (error) throw error;

      // 3. Обновляем UI
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
    <div className="mt-8 bg-white md:bg-gray-50 md:rounded-2xl md:p-6 border-t md:border border-gray-100">
      <h3 className="text-lg font-black text-gray-900 mb-6 px-4 md:px-0">Обсуждение ({comments.length})</h3>

      {/* Список комментариев */}
      <div className="space-y-4 mb-6 px-4 md:px-0">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 md:bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {/* Заглушка аватарки */}
                ID
              </div>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString("ru-RU", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {comment.text && <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{comment.text}</p>}
            
            {comment.image_url && (
              <img 
                src={comment.image_url} 
                alt="Фото к комментарию" 
                className="rounded-xl max-h-48 object-cover border border-gray-200"
              />
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Пока нет комментариев. Напишите первым!</p>
        )}
      </div>

      {/* Форма ввода (видна только авторизованным) */}
      {userId ? (
        <form onSubmit={handleSubmit} className="relative px-4 md:px-0">
          {/* Превью выбранного фото */}
          {imagePreview && (
            <div className="relative inline-block mb-3">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-gray-200" />
              <button 
                type="button" 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            
            {/* Кнопка загрузки фото */}
            <label className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <ImagePlus className="w-6 h-6" />
            </label>

            {/* Поле ввода текста */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Добавить комментарий..."
              className="flex-1 max-h-32 min-h-[44px] resize-none outline-none py-2 text-sm text-gray-800 bg-transparent"
              rows={1}
            />

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isSubmitting || (!text.trim() && !image)}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 md:px-0 text-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
          Войдите в систему, чтобы оставить комментарий
        </div>
      )}
    </div>
  );
}