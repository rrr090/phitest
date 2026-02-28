import { NextResponse } from 'next/server';

// 1. Убрали : Request
export async function POST(req) { 
  try {
    const { message, imageUrl } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !chatId) {
      throw new Error("Не настроены ключи Telegram в .env");
    }

    let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // 2. Убрали : any
    let body = { 
      chat_id: chatId,
      parse_mode: 'HTML',
    };

    if (imageUrl) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      body.photo = imageUrl;
      body.caption = message; 
    } else {
      body.text = message; 
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      // Выводим точную причину прямо в терминал:
      console.log("🔴 ОТВЕТ ОТ ТЕЛЕГРАМА:", error); 
      throw new Error(`Telegram Error: ${error.description}`);
    }

    return NextResponse.json({ success: true });
    
  // 3. Убрали : any
  } catch (error) { 
    console.error("Telegram API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}