// components/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 1. Функция: Цвет маркера зависит от статуса
const getStatusColor = (status) => {
  switch (status) {
    case 'Решено': return 'bg-green-500';
    case 'В работе': return 'bg-yellow-500';
    default: return 'bg-red-500'; // Открыто
  }
};

// 2. Функция: Иконка зависит от категории
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Дороги': return '🛣️';
    case 'Экология': return '🌳';
    case 'ЖКХ': return '🚰';
    case 'Освещение': return '💡';
    case 'Безопасность': return '🛡️';
    default: return '📍';
  }
};

// 3. Создаем красивый HTML-маркер (Tailwind)
const createIcon = (status, category) => {
  return L.divIcon({
    className: "bg-transparent",
    html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${getStatusColor(status)}">
      <span class="text-sm">${getCategoryIcon(category)}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Центрируем пин
  });
};

export default function MapComponent({ data }) {
  const center = [54.87, 69.15]; // Центр Петропавловска

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={false}>
      {/* Бесплатная карта от OpenStreetMap */}
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Отрисовываем каждую проблему из БД */}
      {data.map((issue) => {
        // Защита от кривых данных без координат
        if (!issue.lat || !issue.lng) return null;

        return (
          <Marker 
            key={issue.id} 
            position={[issue.lat, issue.lng]} 
            icon={createIcon(issue.status, issue.category)}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px] p-1">
                {/* Шапка попапа: Категория и Статус */}
                <div className="flex justify-between items-start mb-2 gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {issue.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                
                {/* Название и описание */}
                <h3 className="font-bold text-base text-gray-900 mb-1 leading-tight">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                
                {/* Подвал попапа: Лайки и ссылка */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">👍 {issue.likes_count}</span>
                  {/* Кнопка ведет на детальную страницу проблемы */}
                  <a href={`/issue/${issue.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Подробнее →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}