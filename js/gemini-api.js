/**
 * Хроносфера — Интеграция с Google Gemini API
 * Опциональный режим нейросетевой генерации альтернативной истории
 */

class ChronoGeminiClient {
  constructor() {
    this.storageKey = "chronosphere_gemini_api_key";
    this.model = "gemini-1.5-flash";
  }

  getApiKey() {
    return localStorage.getItem(this.storageKey) || "";
  }

  setApiKey(key) {
    if (!key || key.trim() === "") {
      localStorage.removeItem(this.storageKey);
    } else {
      localStorage.setItem(this.storageKey, key.trim());
    }
  }

  hasApiKey() {
    const k = this.getApiKey();
    return k && k.length > 10;
  }

  async generateAlternativeHistory(userPrompt) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("API-ключ Gemini не настроен");
    }

    const systemInstruction = `Ты — беспристрастный Хроно-Архивариус Мультивселенной. Пользователь задает гипотетический вопрос вида "Что было бы, если бы...".
Твоя задача — смоделировать детальную, логичную, научно обоснованную и глубоко увлекательную альтернативную историю на чистом русском языке.

Верни СТРОГО валидный JSON-объект следующей структуры (без markdown-обертки \`\`\`json, только чистый JSON):
{
  "title": "Интригующее название альтернативного мира (например: «Век Механики: Мир без интернета»)",
  "divergencePoint": "Год и конкретное событие развилки (например: «1973 год — Проект ARPANET свернут»)",
  "divergenceScore": 85,
  "paradoxLevel": "Уровень парадоксальности (например: Глубокая трансформация цивилизации)",
  "summary": "Краткое введение в суть этой ветви реальности на 2-3 предложения",
  "timeline": [
    {
      "year": "1975 год",
      "epochTitle": "Название эпохи",
      "headline": "Главное событие эпохи",
      "description": "Подробное описание происходящего на 2-4 предложения",
      "quote": "Цитата очевидца или историка той реальности"
    }
  ],
  "spheres": {
    "tech": "Что произошло с наукой и технологиями",
    "politics": "Как изменилась геополитика, границы и государства",
    "dailyLife": "Как живут обычные люди, их быт, привычки и культура",
    "economy": "Экономика, деньги, корпорации и главные профессии"
  },
  "butterflyEffect": "Один неожиданный, парадоксальный или ироничный побочный факт из этого мира",
  "artifact": {
    "type": "newspaper",
    "source": "Название газеты или ведомства того времени (например: «Вечерний Курьеръ»)",
    "date": "Дата документа в том мире",
    "price": "Стоимость или гриф секретности",
    "headline": "Главный заголовок статьи передовицы",
    "lead": "Текст главной новости передовицы на 3-4 предложения",
    "columns": [
      {
        "title": "Рубрика (например: Городские вести)",
        "text": "Короткая колонка новости из жизни того мира"
      },
      {
        "title": "Биржа или технологии",
        "text": "Короткая колонка о котировках или изобретениях"
      }
    ],
    "stamp": "Текст архивного штампа (например: АРХИВ ХРОНОСФЕРЫ • ВЕТВЬ АЛЬФА)"
  },
  "nextQuestions": [
    "Интересный вопрос о следующем витке развития этого мира?",
    "Еще один вопрос о развилке в этом мире?",
    "Третий вопрос?"
  ]
}

В массиве timeline должно быть ровно 4 или 5 ключевых эпох (от точки развилки до наших дней и будущего).
Пиши колоритно, литературно, без банальностей, на русском языке.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.85,
        maxOutputTokens: 2500
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Ошибка API Gemini: статус ${response.status}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error("Не удалось получить ответ от нейросети");
    }

    try {
      const parsed = JSON.parse(candidate);
      parsed.id = "gemini-" + Date.now();
      parsed.query = userPrompt;
      return parsed;
    } catch (e) {
      // Очистка от возможных markdown-тегов если модель случайно их добавила
      const cleaned = candidate.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      parsed.id = "gemini-" + Date.now();
      parsed.query = userPrompt;
      return parsed;
    }
  }
}

window.chronoGeminiClient = new ChronoGeminiClient();
