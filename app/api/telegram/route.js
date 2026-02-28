import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1. Получаем данные от клиента
    const { message, imageUrl } = await req.json();

    // 2. Достаем ключи из .env
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    // 3. Защита от забытых ключей
    if (!botToken || !chatId) {
      console.log("🔴 ОШИБКА: Не настроены ключи Telegram в файле .env");
      return NextResponse.json(
        { success: false, error: "Отсутствуют ключи конфигурации" }, 
        { status: 500 }
      );
    }

    // 4. Подготавливаем базу для запроса
    let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    let body = {
      chat_id: chatId,
      parse_mode: 'HTML',
    };

    // 5. Умная логика: если есть картинка — шлем фото, если нет — просто текст
    if (imageUrl) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      body.photo = imageUrl;
      body.caption = message; // В Telegram текст под фото называется caption
    } else {
      body.text = message;    // Обычное текстовое сообщение
    }

    // 6. Отправляем запрос серверам Telegram
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // 7. Проверяем ответ от Telegram
    if (!response.ok) {
      const errorData = await response.json();
      // Выводим точную причину в консоль VS Code
      console.log("🔴 ОТВЕТ ОТ ТЕЛЕГРАМА (ОШИБКА):", errorData);
      
      return NextResponse.json(
        { success: false, error: errorData.description }, 
        { status: 400 } // Возвращаем 400 (Bad Request), а не 500
      );
    }

    // 8. Если всё прошло успешно
    console.log("🟢 Успешно отправлено в Telegram!");
    return NextResponse.json({ success: true });

  } catch (error) {
    // 9. Ловим любые другие ошибки (например, пропал интернет на сервере)
    console.error("🔴 Внутренняя ошибка API:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}