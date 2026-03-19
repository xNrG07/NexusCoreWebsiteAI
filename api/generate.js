const buildPayload = (decision) => ({
  contents: [{ parts: [{ text: `Initiale Aktion: "${decision}"` }] }],
  systemInstruction: {
    parts: [
      {
        text:
          "Du bist NEXUS, ein kreativer Schmetterlingseffekt-Simulator. Der Nutzer gibt eine kleine, alltägliche Aktion ein. Erschaffe 3 alternative Zeitlinien, die durch diese Aktion ausgelöst werden. Regeln: 1) ALPHA = realistische, aber überraschende direkte Folge. 2) BETA = absurde Kettenreaktion. 3) OMEGA = surreales, futuristisches oder kosmisches Ereignis. Jede Zeitlinie braucht id, type, title, desc und probability als String. WICHTIG: Die Wahrscheinlichkeit (probability) MUSS eine nackte, erfundene Zahl als String sein (z.B. '78.5302', '12.0001', '0.000004'), ohne Prozentzeichen oder Text! Antworte strikt als JSON.",
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

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

export default async function handler(req, res) {
  // CORS Header hinzufügen (falls Frontend und Backend mal getrennt sind)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request (Preflight) für Browser direkt beantworten
  if (req.method === 'OPTIONS') {
    return json(res, 200, {});
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Nur POST ist erlaubt.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: 'Server-Konfiguration unvollständig. GEMINI_API_KEY fehlt.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const decision = String(body.decision || '').trim();

    if (decision.length < 5) {
      return json(res, 400, { error: 'Die Eingabe ist zu kurz.' });
    }

    // UPDATE: Zurück zum besseren und kreativeren 'flash' Modell anstelle von 'flash-lite'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      return json(res, response.status, {
        error: `Gemini-Fehler: ${providerMessage}`,
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return json(res, 502, { error: 'Gemini hat keine verwertbare Antwort geliefert.' });
    }

    // SICHERHEITSNETZ: Entfernt "```json" und "```", falls die KI Markdown mitsendet
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(cleanText);
    return json(res, 200, parsed);
  } catch (error) {
    return json(res, 500, {
      error:
        error instanceof Error ? error.message : 'Unbekannter Serverfehler bei der Generierung.',
    });
  }
}