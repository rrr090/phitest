import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { issues } = await req.json();

    // Берем только первые 20 проблем, чтобы не превысить лимит токенов ИИ
    const recentIssues = issues.slice(0, 20);

    // Подготавливаем данные для ИИ
    const issuesText = recentIssues.map((i: any) => 
      `- [${i.category}] ${i.title}. Статус: ${i.status}. Описание: ${i.description}`
    ).join('\n');

    // Промпт (инструкция) для нейросети
    const prompt = `Ты — профессиональный диктор новостей умного города Петропавловск. 
    Твоя задача — проанализировать текущие проблемы на карте города и составить краткую, вовлекающую сводку новостей (3-4 небольших абзаца). 
    Оцени серьезность проблем, упомяни, сколько из них уже "Решено" или "В работе", а какие требуют внимания. 
    Пиши в стиле современного городского медиа. Используй эмодзи.

    Вот сырые данные с карты:
    ${issuesText}
    
    Сделай красивый репортаж:`;

    // Делаем запрос к бесплатному API Groq (используем мощную модель Llama 3)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Отличная модель, хорошо понимает русский язык
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // 0.7 дает баланс между фактами и креативностью
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ summary: data.choices[0].message.content });

  } catch (error: any) {
    console.error("News Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}