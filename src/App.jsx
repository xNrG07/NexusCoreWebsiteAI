import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Fingerprint,
  GitBranch,
  Hexagon,
  Info,
  Mail,
  RefreshCw,
  Shield,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const callGeminiAPI = async (decision) => {
  if (!apiKey) {
    throw new Error(
      'Kein Gemini-API-Key gefunden. Lege lokal eine VITE_GEMINI_API_KEY in deiner .env an oder hinterlege die Variable im Hosting.'
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const payload = {
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
  };

  const delays = [1000, 2000, 4000, 8000];

  for (let i = 0; i <= delays.length; i += 1) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Die API hat keine verwertbare Antwort zurückgegeben.');
      }

      return JSON.parse(text);
    } catch (error) {
      if (i === delays.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
  }

  throw new Error('Die Anfrage konnte nicht verarbeitet werden.');
};

const samplePrompts = [
  'Ich habe meinen Wecker ignoriert',
  'Ich habe im Supermarkt die letzte Packung Pasta genommen',
  'Ich habe einem Fremden an der Bushaltestelle geholfen',
  'Ich habe eine Nachricht nicht sofort beantwortet',
  'Ich habe heute Kaffee statt Tee getrunken',
  'Ich bin einen anderen Weg nach Hause gegangen',
];

const faqItems = [
  {
    q: 'Was macht NEXUS genau?',
    a: 'NEXUS erzeugt aus einer kleinen Alltagshandlung drei alternative, fiktionale Zukunftsszenarien. Das Tool dient der Unterhaltung, Ideenfindung und kreativen Inspiration.',
  },
  {
    q: 'Sind die Ergebnisse wahr oder wissenschaftlich belastbar?',
    a: 'Nein. Die Ausgaben sind bewusst spekulativ, erzählerisch und teilweise absurd. Es handelt sich nicht um Vorhersagen, Beratung oder Tatsachenbehauptungen.',
  },
  {
    q: 'Werden meine Eingaben gespeichert?',
    a: 'Im aktuellen Frontend speichert die Website selbst deine Eingaben nicht dauerhaft. Die eingegebenen Texte werden aber zur Generierung an Google Gemini übermittelt. Deshalb solltest du keine sensiblen personenbezogenen Daten eingeben.',
  },
  {
    q: 'Ist die Seite schon mit Werbung ausgestattet?',
    a: 'Nein. In dieser überarbeiteten Fassung sind keine aktiven Werbeskripte und keine AdSense-Platzhalter eingebunden. Werbung sollte erst nach Freigabe und sauberer Consent-Einbindung aktiviert werden.',
  },
  {
    q: 'Kann ich die Seite auf Mobilgeräten nutzen?',
    a: 'Ja. Die Oberfläche ist responsive aufgebaut und lässt sich auf Smartphone, Tablet und Desktop bedienen.',
  },
  {
    q: 'Warum gibt es Hinweise zu Datenschutz und Transparenz?',
    a: 'Weil eine kommerziell geplante Website nachvollziehbar erklären muss, wer sie betreibt, was technisch passiert und welche Datenströme tatsächlich stattfinden. Genau daran scheitern viele Projekte unnötig.',
  },
];

const valuePoints = [
  {
    title: 'Klare Publisher-Inhalte',
    text: 'Zusätzliche redaktionelle Bereiche erklären Nutzen, Grenzen, Transparenz und Funktionsweise der Seite. Damit wirkt das Projekt nicht mehr wie eine leere Tool-Shell.',
    icon: Info,
  },
  {
    title: 'Saubere Rechtstexte',
    text: 'Die Angaben auf der Seite behaupten nicht mehr fälschlich, dass bereits AdSense, Cookies oder Tracking aktiv sind. Das war vorher ein unnötiges Risiko.',
    icon: Shield,
  },
  {
    title: 'Bessere Nutzerführung',
    text: 'Die Seite erklärt jetzt klar, wie das Tool funktioniert, wofür es gedacht ist und welche Eingaben sinnvoll sind. Das erhöht Nutzwert und Vertrauenswürdigkeit.',
    icon: ChevronRight,
  },
];

const colorMap = {
  ALPHA: {
    ring: 'border-emerald-500/40',
    glow: 'from-emerald-500/20 to-teal-500/10',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  BETA: {
    ring: 'border-amber-500/40',
    glow: 'from-amber-500/20 to-orange-500/10',
    text: 'text-amber-300',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  OMEGA: {
    ring: 'border-fuchsia-500/40',
    glow: 'from-fuchsia-500/20 to-purple-500/10',
    text: 'text-fuchsia-300',
    badge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  },
};

const formatProbability = (value) => {
  const num = Number.parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(num)) return 'Anomalie';

  if (num >= 1) return `${num.toFixed(1)} %`;
  if (num >= 0.01) return `${num.toFixed(2)} %`;

  const safeNum = num <= 0 ? 0.0000001 : num;
  const chance = 100 / safeNum;
  if (chance >= 1e12) return `1 zu ${(chance / 1e12).toFixed(1)} Bio.`;
  if (chance >= 1e9) return `1 zu ${(chance / 1e9).toFixed(1)} Mrd.`;
  if (chance >= 1e6) return `1 zu ${(chance / 1e6).toFixed(1)} Mio.`;
  if (chance >= 1e3) return `1 zu ${Math.round(chance / 1e3)} Tsd.`;
  return `1 zu ${Math.max(1, Math.round(chance))}`;
};

const App = () => {
  const [decision, setDecision] = useState('');
  const [step, setStep] = useState('input');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    document.title = 'NEXUS.core | Multiversum-Simulator';
  }, []);

  const randomPrompt = useMemo(
    () => samplePrompts[Math.floor(Math.random() * samplePrompts.length)],
    []
  );

  const fillRandom = () => {
    setDecision(randomPrompt);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    const trimmed = decision.trim();
    if (trimmed.length < 5) return;

    setStep('analyzing');
    setErrorMsg('');
    setLoadingProgress(0);

    const progressInterval = window.setInterval(() => {
      setLoadingProgress((prev) => (prev >= 92 ? 92 : prev + Math.floor(Math.random() * 7) + 3));
    }, 260);

    try {
      const geminiData = await callGeminiAPI(trimmed);
      window.clearInterval(progressInterval);
      setLoadingProgress(100);

      const mappedTimelines = (geminiData?.timelines || []).slice(0, 3).map((timeline, index) => {
        const mappedId = ['ALPHA', 'BETA', 'OMEGA'][index] || timeline.id || `TL-${index}`;
        return {
          id: mappedId,
          type: timeline.type || mappedId,
          title: timeline.title || `Zeitlinie ${index + 1}`,
          desc: timeline.desc || 'Keine Beschreibung verfügbar.',
          probability: formatProbability(timeline.probability),
        };
      });

      if (!mappedTimelines.length) {
        throw new Error('Die KI hat keine Zeitlinien geliefert.');
      }

      setResults({ original: trimmed, timelines: mappedTimelines });
      setStep('results');
      window.setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (error) {
      window.clearInterval(progressInterval);
      setStep('input');
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Die Simulation konnte gerade nicht abgeschlossen werden.'
      );
    }
  };

  const resetSimulation = () => {
    setDecision('');
    setResults(null);
    setErrorMsg('');
    setLoadingProgress(0);
    setStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async (timeline) => {
    if (!results) return;

    const text = `NEXUS.core\nAusgangsaktion: "${results.original}"\n\n${timeline.id}: ${timeline.title}\n${timeline.desc}\nWahrscheinlichkeit: ${timeline.probability}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(timeline.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute top-1/3 -left-16 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070b]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
              <Hexagon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-black uppercase tracking-[0.24em] text-white">
                NEXUS<span className="font-light text-purple-400">.core</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Multiversum-Simulator
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 md:flex">
            <a href="#tool" className="transition-colors hover:text-white">Tool</a>
            <a href="#was-ist-das" className="transition-colors hover:text-white">Überblick</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
            <a href="/kontakt.html" className="transition-colors hover:text-white">Kontakt</a>
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:gap-14">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              <Activity size={14} /> Überarbeitet für klarere AdSense-Readiness
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Eine kleine Handlung. Drei komplett andere Zukunftslinien.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                NEXUS.core ist ein interaktives KI-Unterhaltungstool. Du gibst eine kleine Alltagshandlung ein und erhältst drei fiktionale Verläufe:
                realistisch, chaotisch und völlig eskaliert. Die Seite wurde so überarbeitet, dass sie nicht mehr wie ein halbfertiger Werbeplatzhalter wirkt,
                sondern wie ein nachvollziehbares, sauberes Publisher-Projekt.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-purple-300">
                  <GitBranch size={14} /> Kreativ
                </div>
                <p className="text-sm leading-6 text-slate-300">Geeignet für Story-Ideen, Social Posts, Schreibimpulse und absurde Gedankenspiele.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  <Shield size={14} /> Transparent
                </div>
                <p className="text-sm leading-6 text-slate-300">Die Seite behauptet jetzt nur noch das, was technisch und rechtlich auch wirklich zutrifft.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  <Zap size={14} /> Mobilfreundlich
                </div>
                <p className="text-sm leading-6 text-slate-300">Klare Struktur, gute Lesbarkeit und keine irreführenden AdSense-Dummies auf der Startseite.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                <Terminal size={20} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-white">Vor dem Start wichtig</div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Datenschutz & Nutzung</div>
              </div>
            </div>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>Bitte keine sensiblen persönlichen Daten, Zugangsdaten, Gesundheitsdaten oder vertraulichen Inhalte eingeben.</p>
              <p>Die eingegebenen Texte werden für die Generierung an Google Gemini übermittelt. Die Ergebnisse sind fiktional und können sachlich falsch sein.</p>
              <p>Aktuell sind weder AdSense noch Analyse-Skripte aktiv eingebunden. Werbung sollte erst nach Freigabe und sauberer Consent-Lösung live gehen.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setModal('transparenz')}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
              >
                Transparenz lesen
              </button>
              <a
                href="/datenschutz.html"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Datenschutz öffnen
              </a>
            </div>
          </div>
        </section>

        <section id="tool" className="rounded-[28px] border border-white/10 bg-[#0c1118]/90 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">Interaktives Tool</div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Simuliere deine Entscheidung</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Beschreibe eine kleine Handlung in einem kurzen Satz. Das Tool erzeugt drei alternative Verläufe und formatiert sie als lesbare Karten.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              <AlertTriangle size={14} /> KI-Ausgabe, keine Tatsachenbehauptung
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-7 text-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-[#111722] p-2 shadow-lg shadow-black/20">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl px-3 py-2">
                  <Terminal size={18} className="shrink-0 text-purple-400" />
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    maxLength={180}
                    minLength={5}
                    required
                    placeholder="z. B.: Ich habe heute einer unbekannten Person geholfen"
                    className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-slate-500 sm:text-lg"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={fillRandom}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    Zufallsbeispiel
                  </button>
                  <button
                    type="submit"
                    disabled={step === 'analyzing' || decision.trim().length < 5}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-900 transition hover:bg-purple-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Simulation starten
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {samplePrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDecision(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </form>

          {step === 'analyzing' && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/10">
                <Fingerprint size={28} className="animate-pulse text-purple-300" />
              </div>
              <div className="mb-2 text-xl font-black uppercase tracking-[0.18em] text-white">Zeitlinien werden berechnet</div>
              <p className="mx-auto mb-5 max-w-xl text-sm leading-7 text-slate-300">
                NEXUS verarbeitet die Eingabe und erzeugt drei alternative Verläufe. Das dauert normalerweise nur einen Moment.
              </p>
              <div className="mx-auto h-3 max-w-xl overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-400">{loadingProgress}%</div>
            </div>
          )}

          {results && step === 'results' && (
            <div id="results-section" className="mt-8 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ausgangsaktion</div>
                <div className="text-lg font-semibold leading-8 text-white sm:text-2xl">„{results.original}“</div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {results.timelines.map((timeline) => {
                  const scheme = colorMap[timeline.id] || colorMap.ALPHA;
                  return (
                    <article
                      key={timeline.id}
                      className={`relative overflow-hidden rounded-3xl border bg-[#111722] p-5 shadow-xl shadow-black/20 ${scheme.ring}`}
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${scheme.glow}`} />
                      <div className="relative">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${scheme.badge}`}>
                              {timeline.id}
                            </div>
                            <div className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">{timeline.type}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(timeline)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                            title="Text kopieren"
                          >
                            {copiedId === timeline.id ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                        <h3 className={`mb-4 text-2xl font-black leading-tight ${scheme.text}`}>{timeline.title}</h3>
                        <p className="mb-5 text-sm leading-7 text-slate-300">{timeline.desc}</p>
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                          <span className="font-bold uppercase tracking-[0.14em] text-slate-400">Chance</span>
                          <span className="font-black text-white">{timeline.probability}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <RefreshCw size={16} /> Neue Aktion testen
                </button>
                <button
                  type="button"
                  onClick={() => setModal('transparenz')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-200 transition hover:bg-purple-500/15"
                >
                  <Info size={16} /> Transparenz & Nutzung
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="was-ist-das" className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Was ist NEXUS?</div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">Mehr als nur ein Eingabefeld</h2>
            <div className="space-y-4 text-sm leading-8 text-slate-300 sm:text-base">
              <p>
                Die ursprüngliche Version wirkte stark wie ein futuristischer Splashscreen mit zwei problematischen Schwächen: zu wenig eigenständigem
                Publisher-Content und rechtlich ungenauen Aussagen zu Cookies und Werbung. Genau das ist für eine spätere Monetarisierung unnötig riskant.
              </p>
              <p>
                Diese Fassung ergänzt deshalb redaktionelle Inhalte, erklärt den Zweck der Website, beschreibt die technische Funktionsweise offen und verlinkt
                sauber auf Impressum, Datenschutz und Kontakt. Das macht die Seite für Nutzer verständlicher und für eine Prüfung deutlich seriöser.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">So funktioniert es</div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">Ablauf in drei Schritten</h2>
            <div className="space-y-4">
              {[
                'Du gibst eine kurze Alltagshandlung ein.',
                'Die Eingabe wird an Google Gemini gesendet und als strukturierte JSON-Antwort verarbeitet.',
                'NEXUS formatiert daraus drei lesbare Zeitlinien mit unterschiedlichen Eskalationsstufen.',
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valuePoints.map((point) => {
            const Icon = point.icon;
            return (
              <article key={point.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-purple-300">
                  <Icon size={22} />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">{point.title}</h3>
                <p className="text-sm leading-7 text-slate-300">{point.text}</p>
              </article>
            );
          })}
        </section>

        <section id="faq" className="rounded-[28px] border border-white/10 bg-[#0c1118]/90 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">FAQ</div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Häufige Fragen</h2>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-lg font-black text-white">{item.q}</h3>
                <p className="text-sm leading-7 text-slate-300">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Einsatzideen</div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">Wofür die Seite sinnvoll ist</h2>
            <div className="space-y-4 text-sm leading-8 text-slate-300 sm:text-base">
              <p>Das Tool eignet sich für kreative Mini-Experimente, Social-Media-Posts, Rollenspiel- und Story-Ideen oder einfach als Unterhaltung.</p>
              <p>Der Mehrwert liegt nicht in faktischer Korrektheit, sondern in originellen Perspektivwechseln und erzählerischer Reibung.</p>
              <p>Genau deshalb sollte die Seite auch offen als fiktionales Entertainment-Tool auftreten und nicht so tun, als würde sie echte Vorhersagen liefern.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Wichtige Grenze</div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">Was man nicht behaupten sollte</h2>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Keine Aussage, dass bereits AdSense oder Tracking aktiv ist, wenn das technisch noch gar nicht stimmt.',
                'Keine Werbung direkt auf Seiten ohne echten Publisher-Content oder auf rein generierten Leer-/Übergangsscreens.',
                'Keine Eingabeaufforderung für vertrauliche personenbezogene Daten.',
                'Keine Darstellung, die Google oder andere Dienste falsch als Partner oder offiziellen Sponsor erscheinen lässt.',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <X size={18} className="mt-1 shrink-0 text-red-300" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-purple-600/15 to-blue-600/10 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">Kontakt & Rechtliches</div>
              <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">Alle Pflichtseiten sind jetzt sauber verlinkt</h2>
              <p className="max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
                Für Vertrauen, Prüfungen und spätere Monetarisierung brauchst du eine nachvollziehbare Betreiberkennzeichnung, eine echte Datenschutzerklärung
                und eine Kontaktmöglichkeit. Genau diese Punkte sind jetzt ergänzt und nicht mehr bloß im Nebel eines futuristischen UI versteckt.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                { href: '/impressum.html', label: 'Impressum öffnen' },
                { href: '/datenschutz.html', label: 'Datenschutz öffnen' },
                { href: '/kontakt.html', label: 'Kontakt öffnen' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-bold text-white transition hover:bg-black/30"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={16} />
                </a>
              ))}
              <button
                type="button"
                onClick={() => setModal('transparenz')}
                className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-bold text-white transition hover:bg-black/30"
              >
                <span>Transparenz lesen</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="font-semibold text-slate-300">© 2026 NEXUS.core</div>
            <div>Interaktives KI-Unterhaltungstool mit Fokus auf Transparenz, Nutzerverständnis und sauberer Seitenstruktur.</div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="/impressum.html" className="transition hover:text-white">Impressum</a>
            <a href="/datenschutz.html" className="transition hover:text-white">Datenschutz</a>
            <a href="/kontakt.html" className="transition hover:text-white">Kontakt</a>
          </div>
        </div>
      </footer>

      {modal === 'transparenz' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Modal schließen"
            onClick={() => setModal(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#0f141d] p-6 shadow-2xl shadow-black/40 sm:p-8">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="mb-6 border-b border-white/10 pb-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">Transparenz</div>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Was auf dieser Website technisch wirklich passiert</h3>
            </div>

            <div className="space-y-5 text-sm leading-8 text-slate-300 sm:text-base">
              <p>
                NEXUS.core ist ein fiktionales KI-Entertainment-Tool. Die Eingaben werden aktuell direkt aus dem Browser an die Google-Gemini-Schnittstelle
                gesendet, damit daraus drei alternative Zeitlinien berechnet werden können. Gib deshalb keine sensiblen oder vertraulichen Daten ein.
              </p>
              <p>
                Die Website enthält in dieser Fassung keine aktiven AdSense-Skripte, keine Analytics-Integration und keinen künstlichen Cookie-Banner mehr.
                Vorher war genau das ein Problem, weil die Texte mehr behauptet haben als tatsächlich eingebunden war.
              </p>
              <p>
                Für eine spätere Monetarisierung gilt: Werbung erst nach tatsächlicher Freigabe aktivieren, Consent sauber über eine von Google zertifizierte
                Lösung für EEA/UK/Schweiz einbinden und Werbeflächen nicht auf leere, rein technische oder problematische Auto-Generate-Screens setzen.
              </p>
              <p>
                Ebenso wichtig: Das Tool generiert Inhalte automatisiert. Seiten, die überwiegend automatisch generierte Inhalte zeigen, tragen bei der
                AdSense-Prüfung generell ein höheres Risiko. Genau deshalb wurden zusätzliche redaktionelle Inhalte, klare Hinweise und echte Pflichtseiten ergänzt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
