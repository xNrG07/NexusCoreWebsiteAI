import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Fingerprint,
  GitBranch,
  Hexagon,
  Info,
  RefreshCw,
  Shield,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';

const callGeminiAPI = async (decision) => {
  const delays = [1000, 2000, 4000, 8000];

  for (let i = 0; i <= delays.length; i += 1) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      if (!data?.timelines) {
        throw new Error('Die API hat keine verwertbare Antwort zurückgegeben.');
      }

      return data;
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
    q: 'Was macht NEXUS.core?',
    a: 'NEXUS.core erzeugt aus einer kleinen Alltagshandlung drei alternative, fiktionale Zukunftsszenarien. Das Tool dient der Unterhaltung, Ideenfindung und kreativen Inspiration.',
  },
  {
    q: 'Sind die Ergebnisse echte Vorhersagen?',
    a: 'Nein. Die Ausgaben sind bewusst spekulativ, erzählerisch und teilweise überzeichnet. Es handelt sich nicht um wissenschaftliche Prognosen, Beratung oder Tatsachenbehauptungen.',
  },
  {
    q: 'Werden meine Eingaben gespeichert?',
    a: 'Die Website speichert deine Eingaben im normalen Nutzungsvorgang nicht dauerhaft. Für die Generierung wird deine Eingabe jedoch serverseitig an Google Gemini weitergeleitet. Deshalb solltest du keine sensiblen oder vertraulichen Daten eingeben.',
  },
  {
    q: 'Ist die Seite schon mit Werbung ausgestattet?',
    a: 'Aktuell sind auf dieser Seite keine aktiven Werbeskripte eingebunden. Werbung wird erst dann aktiviert, wenn die technische und rechtliche Einbindung vollständig umgesetzt ist.',
  },
  {
    q: 'Kann ich die Seite am Smartphone nutzen?',
    a: 'Ja. Die Oberfläche ist responsive aufgebaut und lässt sich auf Smartphone, Tablet und Desktop bedienen.',
  },
  {
    q: 'Wofür ist das Tool sinnvoll?',
    a: 'Zum Beispiel für kreative Schreibideen, Social-Media-Inhalte, kleine Gedankenspiele oder einfach zur Unterhaltung.',
  },
];

const valuePoints = [
  {
    title: 'Drei alternative Zeitlinien',
    text: 'Aus einer kurzen Alltagshandlung entstehen drei unterschiedlich eskalierende Zukunftsverläufe – von nachvollziehbar bis komplett überdreht.',
    icon: GitBranch,
  },
  {
    title: 'Schnelle KI-Ausgabe',
    text: 'Die Ergebnisse werden in wenigen Sekunden erzeugt und direkt als lesbare Karten dargestellt.',
    icon: Zap,
  },
  {
    title: 'Fiktional und transparent',
    text: 'NEXUS.core ist ein kreatives Unterhaltungstool. Die Ausgaben sind keine echten Vorhersagen und nicht für wichtige Entscheidungen gedacht.',
    icon: Shield,
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
  if (Number.isNaN(num)) return 'Unbekannt';

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
        const rawProbability = Number.parseFloat(String(timeline.probability).replace(',', '.'));
        return {
          id: mappedId,
          type: timeline.type || mappedId,
          title: timeline.title || `Zeitlinie ${index + 1}`,
          desc: timeline.desc || 'Keine Beschreibung verfügbar.',
          probability: formatProbability(timeline.probability),
          probabilityTooltip: Number.isNaN(rawProbability)
            ? 'Von der KI gelieferter Prozentwert nicht verfügbar'
            : `Von der KI gelieferter Prozentwert: ${rawProbability}%`,
        };
      });

      if (!mappedTimelines.length) {
        throw new Error('Die KI hat keine Zeitlinien geliefert.');
      }

      setResults({ original: trimmed, timelines: mappedTimelines });
      setStep('results');

      window.setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
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

    const text = `NEXUS.core\nAusgangsaktion: "${results.original}"\n\n${timeline.id}: ${timeline.title}\n${timeline.desc}\nEinordnung: ${timeline.probability}`;

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
              <Activity size={14} /> System online
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Eine kleine Handlung. Drei völlig andere Zeitlinien.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                NEXUS.core ist ein interaktives KI-Unterhaltungstool. Du gibst eine kleine Alltagshandlung ein und erhältst drei alternative Zukunftsverläufe – von nachvollziehbar bis völlig eskaliert.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-purple-300">
                  <GitBranch size={14} /> Kreativ
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Gut für Story-Ideen, Social Posts und absurde Gedankenspiele.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  <Shield size={14} /> Transparent
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Klare Hinweise zur Nutzung, Technik und zum Umgang mit Eingaben.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  <Zap size={14} /> Schnell
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Die Ausgabe erscheint in wenigen Sekunden direkt im Browser.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                <Terminal size={20} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-white">
                  Vor dem Start wichtig
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Nutzung & Datenschutz
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>Bitte keine sensiblen persönlichen Daten, Zugangsdaten, Gesundheitsdaten oder vertraulichen Inhalte eingeben.</p>
              <p>Die Eingaben werden zur Generierung serverseitig an Google Gemini weitergeleitet. Die Ergebnisse sind fiktional und können sachlich falsch sein.</p>
              <p>Die Ausgaben dienen der Unterhaltung und kreativen Inspiration, nicht der Beratung oder echten Entscheidungsfindung.</p>
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
              <h2 className="text-2xl font-black text-white sm:text-3xl">Simuliere deine Eingabe</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Beschreibe eine kleine Handlung in einem kurzen Satz. Das Tool erzeugt drei alternative Verläufe und stellt sie als lesbare Karten dar.
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
              <div className="mb-2 text-xl font-black uppercase tracking-[0.18em] text-white">
                Zeitlinien werden erzeugt
              </div>
              <p className="mx-auto mb-5 max-w-xl text-sm leading-7 text-slate-300">
                NEXUS verarbeitet die Eingabe und erstellt drei alternative Verläufe. Das dauert normalerweise nur einen kurzen Moment.
              </p>
              <div className="mx-auto h-3 max-w-xl overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-400">{loadingProgress}%</div>
            </div>
          )}

          {results && step === 'results' && (
            <div id="results-section" className="mt-8 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Ausgangsaktion
                </div>
                <div className="text-lg font-semibold leading-8 text-white sm:text-2xl">
                  „{results.original}“
                </div>
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
                            <div
                              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${scheme.badge}`}
                            >
                              {timeline.id}
                            </div>
                            <div className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                              {timeline.type}
                            </div>
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

                        <h3 className={`mb-4 text-2xl font-black leading-tight ${scheme.text}`}>
                          {timeline.title}
                        </h3>
                        <p className="mb-5 text-sm leading-7 text-slate-300">{timeline.desc}</p>

                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                          <span className="font-bold uppercase tracking-[0.14em] text-slate-400">
                            Einordnung
                          </span>
                          <span
                            className="cursor-help border-b border-dashed border-white/40 pb-0.5 font-black text-white transition-colors hover:border-white"
                            title={timeline.probabilityTooltip}
                          >
                            {timeline.probability}
                          </span>
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
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Was ist NEXUS?
            </div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Ein spielerisches Was-wäre-wenn-Tool
            </h2>
            <div className="space-y-4 text-sm leading-8 text-slate-300 sm:text-base">
              <p>
                NEXUS.core nimmt eine kleine Alltagshandlung und denkt sie in drei unterschiedliche Richtungen weiter. So entstehen kurze alternative Zeitlinien mit unterschiedlicher Eskalationsstufe.
              </p>
              <p>
                Das Ergebnis ist kein wissenschaftliches Modell, sondern ein kreatives KI-Format für Unterhaltung, Inspiration und neugieriges Ausprobieren.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
              So funktioniert es
            </div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Ablauf in drei Schritten
            </h2>
            <div className="space-y-4">
              {[
                'Du gibst eine kurze Alltagshandlung ein.',
                'Die Eingabe wird an den eigenen Server-Endpunkt gesendet und von dort an Google Gemini weitergegeben.',
                'NEXUS formatiert die Antwort in drei lesbare Zeitlinien mit unterschiedlichen Verläufen.',
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
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Einsatzideen
            </div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Wofür die Seite sinnvoll ist
            </h2>
            <div className="space-y-4 text-sm leading-8 text-slate-300 sm:text-base">
              <p>Nutze das Tool als kleine Unterhaltung mit Freunden oder als Ausgangspunkt für absurde Gespräche und Ideen.</p>
              <p>Für Autorinnen, Autoren oder Pen-and-Paper-Spieler kann NEXUS.core ein schneller Impulsgeber für neue Szenen, Plots und Wendungen sein.</p>
              <p>Außerdem zeigt das Format auf einfache Weise, wie kreativ moderne Sprachmodelle mit kurzen Eingaben umgehen können.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-7">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              Wichtige Grenze
            </div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Nur ein Gedankenexperiment
            </h2>
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Die generierten Zeitlinien sind fiktional.',
                'NEXUS liefert keine echten Vorhersagen, Lebensberatung oder Tatsachenbehauptungen.',
                'Bitte verwende das Tool nicht, um echte, schwerwiegende Entscheidungen zu treffen.',
                'Sensible oder persönliche Daten sollten nicht in den Simulator eingegeben werden.',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Info size={18} className="mt-1 shrink-0 text-amber-300" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-purple-600/15 to-blue-600/10 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                Kontakt & Rechtliches
              </div>
              <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
                Klar und nachvollziehbar
              </h2>
              <p className="max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
                Informationen zum Betreiber, zum Datenschutz und zu den Kontaktmöglichkeiten findest du auf den verlinkten Seiten. So ist klar erkennbar, wer hinter dem Projekt steht und wie die Website funktioniert.
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
            <div>Interaktives KI-Unterhaltungstool mit Fokus auf Transparenz und klarer Nutzungskommunikation.</div>
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
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                Transparenz
              </div>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Was auf dieser Website technisch passiert
              </h3>
            </div>

            <div className="space-y-5 text-sm leading-8 text-slate-300 sm:text-base">
              <p>
                NEXUS.core ist ein fiktionales KI-Unterhaltungstool. Deine Eingabe wird an den eigenen Server-Endpunkt gesendet und von dort an Google Gemini weitergeleitet, damit daraus drei alternative Zeitlinien erzeugt werden können.
              </p>
              <p>
                Gib deshalb keine sensiblen, vertraulichen oder personenbezogenen Inhalte ein, die nicht an externe Dienste weitergegeben werden sollen.
              </p>
              <p>
                Die Ausgaben sind automatisiert erzeugte Inhalte und können sachlich falsch, ungenau oder bewusst überzeichnet sein. Sie dienen der Unterhaltung und kreativen Inspiration.
              </p>
              <p>
                Informationen zum Betreiber, zum Datenschutz und zu den Kontaktmöglichkeiten findest du auf den verlinkten Pflichtseiten dieser Website.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
