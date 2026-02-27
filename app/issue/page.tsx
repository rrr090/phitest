// app/issue/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabase";
 const { data: { user } } = await supabase.auth.getUser();
// Динамически импортируем мини-карту (чтобы не было ошибки SSR)
const LocationPicker = dynamic(() => import("../../components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">Загрузка карты...</div>,
});

export default function IssuePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Дороги");
  const [address, setAddress] = useState("");
  
  // 📍 Новое: Координаты
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  // 📷 Новое: Файл фотографии
  const [photo, setPhoto] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка: пользователь должен выбрать точку на карте!
    if (!position) {
      setErrorMsg("Пожалуйста, укажите место проблемы на карте.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      let imageUrl = null;

      // 1. ЕСЛИ ЕСТЬ ФОТО - СНАЧАЛА ЗАГРУЖАЕМ ЕГО В SUPABASE STORAGE
      if (photo) {
        // Генерируем уникальное имя файла (чтобы не перезаписать чужие)
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issue-photos')
          .upload(fileName, photo);

        if (uploadError) throw new Error("Ошибка загрузки фото: " + uploadError.message);

        // Получаем публичную ссылку на загруженное фото
        const { data: publicUrlData } = supabase.storage
          .from('issue-photos')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // 2. ОТПРАВЛЯЕМ ДАННЫЕ В ТАБЛИЦУ (включая реальные координаты и ссылку на фото)
      const { error } = await supabase.from("issues").insert([
        {
          title: title,
          description: description,
          category: category,
          address: address,
          lat: position.lat,
          lng: position.lng,
          image_url: imageUrl, 
          status: "Открыто",
          user_id: user?.id, 
          author_name: user?.email || "Аноним",
          likes_count: 0
        }
      ]);

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => router.push("/"), 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Что-то пошло не так.");
      setIsSubmitting(false);
    }
  };

  // ... (экран успеха оставляем таким же, как был)
  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Сигнал принят!</h2>
          <p className="text-gray-500 text-sm">Перенаправляем на карту...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Сообщить о проблеме</h2>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          
          {/* СЕТКА ИЗ ДВУХ КОЛОНОК ДЛЯ КАРТЫ И ФОТО */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
            
            {/* Блок выбора точки на карте */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Где это находится? <span className="text-red-500">*</span>
              </label>
              <div className="h-48 w-full rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-blue-500 transition-colors relative">
                <LocationPicker position={position} setPosition={setPosition} />
                {!position && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 z-[400] shadow-sm pointer-events-none">
                    Кликните на карту
                  </div>
                )}
              </div>
              {position && (
                <p className="text-xs text-green-600 mt-2 font-medium">✅ Точка выбрана</p>
              )}
            </div>

            {/* Блок загрузки фото */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотография проблемы
              </label>
              <div className="h-48 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center relative hover:bg-gray-100 transition-colors">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {photo ? (
                  <div className="text-center p-4">
                    <span className="text-4xl">🖼️</span>
                    <p className="text-sm font-medium text-gray-700 mt-2 truncate w-40">{photo.name}</p>
                    <p className="text-xs text-green-600 mt-1">Фото готово к загрузке</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-4xl text-gray-400">📸</span>
                    <p className="text-sm font-medium text-gray-600 mt-2">Нажмите или перетащите фото</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG до 5MB</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ... ОСТАЛЬНЫЕ ПОЛЯ (Оставим как были) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Краткое название <span className="text-red-500">*</span></label>
            <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Дороги">🛣️ Дороги и транспорт</option>
                <option value="Экология">🌳 Экология и мусор</option>
                <option value="ЖКХ">🚰 ЖКХ и трубы</option>
                <option value="Освещение">💡 Освещение</option>
                <option value="Безопасность">🛡️ Безопасность</option>
                <option value="Прочее">📋 Прочее</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Уточните адрес</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подробное описание <span className="text-red-500">*</span></label>
            <textarea required rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button type="submit" disabled={isSubmitting} className={`mt-2 w-full text-white font-medium py-4 px-6 rounded-xl transition-all ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isSubmitting ? "Публикация..." : "Опубликовать проблему"}
          </button>

        </form>
      </div>
    </div>
  );
}