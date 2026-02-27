// Описываем, как выглядит одна запись (Issue) из базы данных Supabase
export interface Issue {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  status: 'Открыто' | 'В работе' | 'Решено' | 'Отклонено';
  lat: number;
  lng: number;
  address?: string;
  likes_count: number;
  image_url?: string;
  author_name: string;
}