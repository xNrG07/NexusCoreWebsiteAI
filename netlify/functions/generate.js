const buildPayload = (decision) => ({
  contents: [{ parts: [{ text: `Initiale Aktion: "${decision}"` }] }],
  systemInstruction: {
    parts: [
      {
        text:
          'Du bist NEXUS, ein kreativer Schmetterlingseffekt-Simulator. Der Nutzer gibt eine kleine, alltägliche Aktion ein. Erschaffe 3 alternative Zeitlinien, die durch diese Aktion ausgelöst werden. Regeln: 1) ALPHA = realistische, aber überraschende direkte Folge. 2) BETA = absurde Kettenreaktion. 3) OMEGA = surreales, futuristisches oder kosmisches Ereignis. Jede Zeitlinie braucht id, type, title, desc und probability als String. Antworte strikt als JSON.',
      },
    ],
  },
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        timelines: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              type: { type: 'STRING' },
              title: { type: 'STRING' },
              desc: { type: 'STRING' },
              probability: { type: 'STRING' },
            },
            required: ['id', 'type', 'title', 'desc', 'probability'],
          },
        },
      },
      required: ['timelines'],
    },
  },
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Nur POST ist erlaubt.' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Server-Konfiguration unvollständig. GEMINI_API_KEY fehlt.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const decision = String(body.decision || '').trim();

    if (decision.length < 5) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'Die Eingabe ist zu kurz.' }),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(decision)),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMessage =
        data?.error?.message || data?.error?.status || `HTTP ${response.status}`;
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: `Gemini-Fehler: ${providerMessage}` }),
      };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'Gemini hat keine verwertbare Antwort geliefert.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(JSON.parse(text)),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Unbekannter Serverfehler bei der Generierung.',
      }),
    };
  }
};
