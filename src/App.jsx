import React, { useEffect, useState } from 'react';
import {
  Activity,
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
  'Ich habe meinen Regenschirm zuhause vergessen',
  'Ich habe im Zug meinen Platz getauscht',
  'Ich habe beim Bäcker spontan etwas Neues bestellt',
  'Ich habe eine alte Nummer wieder eingespeichert',
  'Ich habe einen Termin um zehn Minuten verschoben',
  'Ich habe ein Buch gekauft statt es nur anzuschauen',
  'Ich habe einer fremden Person die Tür aufgehalten',
  'Ich habe mein Handy für eine Stunde auf lautlos gestellt',
  'Ich habe den Aufzug nicht genommen und bin die Treppe gegangen',
  'Ich habe im Café draußen statt drinnen gesessen',
  'Ich habe eine Playlist zufällig durchlaufen lassen',
  'Ich habe eine falsche Abzweigung genommen',
  'Ich habe ein altes Foto wieder angesehen',
  'Ich habe im Büro einen anderen Schreibtisch gewählt',
  'Ich habe auf eine Nachricht sofort geantwortet',
  'Ich habe den letzten freien Parkplatz genommen',
  'Ich habe im Laden eine Münze aufgehoben',
  'Ich habe den Bus knapp verpasst',
  'Ich habe einer Empfehlung doch eine Chance gegeben',
  'Ich habe mein Abendessen spontan geändert',
  'Ich habe einen Zettel gefunden und gelesen',
  'Ich habe ein Gespräch zufällig mitgehört',
  'Ich habe meinen Schlüssel zuerst nicht gefunden',
  'Ich habe auf dem Heimweg kurz angehalten',
  'Ich habe mein Fenster offen gelassen',
  'Ich habe eine Einladung doch angenommen',
  'Ich habe beim Einkaufen eine Person vorgelassen',
  'Ich habe mein Ladekabel zuhause vergessen',
  'Ich habe mich in der Warteschlange anders angestellt',
  'Ich habe auf den letzten Drücker umgedreht',
  'Ich habe meinen Alarm fünf Minuten später gestellt',
  'Ich habe im Restaurant etwas völlig anderes bestellt',
  'Ich habe einen Anruf zuerst ignoriert',
  'Ich habe einem Straßenmusiker Geld gegeben',
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

// === NEU: DATEN FÜR DIE HALL OF FAME ===
const hallOfFameData = [
  {
    original: 'Ich habe heute Kaffee statt Tee getrunken',
    timelines: [
      {
        id: 'ALPHA',
        type: 'Moderat',
        title: 'Der produktive Rausch',
        desc: 'Das ungewohnte Koffein führt zu einem spontanen Motivationsschub. Du beendest ein aufgeschobenes Projekt in Rekordzeit, wirst daraufhin befördert und leitest nun eine Abteilung, die du eigentlich hasst. Dein Stresslevel steigt permanent an.',
        probability: '12.5 %',
      },
      {
        id: 'BETA',
        type: 'Eskalierend',
        title: 'Die Koffein-Verschwörung',
        desc: 'Dein Körper reagiert überaktiv auf die spezifische Röstung. Du stolperst im Café, rettest dadurch zufällig einen verdeckten Ermittler vor einem fallenden Blumentopf und wirst versehentlich in ein internationales Spionagenetzwerk rekrutiert.',
        probability: '1 zu 4,2 Mio.',
      },
      {
        id: 'OMEGA',
        type: 'Kritisch',
        title: 'Der Riss im Raum-Zeit-Gefüge',
        desc: 'Die chemische Zusammensetzung des Kaffees interagiert mit deiner DNA. Du schwingst plötzlich auf einer neuen Quantenfrequenz, kannst Gedanken in Form von Farben sehen und wirst von einer intergalaktischen Barista-Sekte als Prophet verehrt.',
        probability: '1 zu 8,9 Bio.',
      },
    ],
  },
  {
    original: 'Ich bin einen anderen Weg nach Hause gegangen',
    timelines: [
      {
        id: 'ALPHA',
        type: 'Alltäglich',
        title: 'Die neue Lieblingsbäckerei',
        desc: 'Du entdeckst eine kleine, unscheinbare Bäckerei. Das Gebäck ist so gut, dass du jeden Tag dorthin gehst. Du nimmst 5 Kilo zu, bist aber signifikant glücklicher und freundest dich mit der Besitzerin an.',
        probability: '45.2 %',
      },
      {
        id: 'BETA',
        type: 'Unerwartet',
        title: 'Der verlorene Hund',
        desc: 'Auf dem neuen Weg findest du einen entlaufenen Hund. Der Besitzer stellt sich als exzentrischer Tech-Milliardär heraus, der dir aus Dankbarkeit eine Start-up-Finanzierung anbietet, was dein komplettes Berufsleben auf den Kopf stellt.',
        probability: '1 zu 85 Tsd.',
      },
      {
        id: 'OMEGA',
        type: 'Paradox',
        title: 'Das Portal in der Gasse',
        desc: 'Du biegst falsch ab und landest in einer Gasse, die auf keiner Karte existiert. Du trittst aus dem Nebel und befindest dich im Jahr 1998. Du musst nun dein Leben neu aufbauen, bist aber der Einzige, der den Aufstieg des Internets exakt vorhersagen kann.',
        probability: '1 zu 24,5 Bio.',
      },
    ],
  },
];
// === ENDE NEUE DATEN ===

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

const formatExactZeros = (value) => {
  const num = Number.parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(num)) return String(value);
  let str = num.toFixed(20);
  str = str.replace(/\.?0+$/, '');
  return str === '' ? '0' : str;
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

const shuffleArray = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getRandomPrompt = (items, currentValue = '') => {
  if (!items.length) return '';
  const pool = items.length > 1 ? items.filter((item) => item !== currentValue) : items;
  const source = pool.length ? pool : items;
  return source[Math.floor(Math.random() * source.length)];
};

const getRandomIdeas = (items, count = 3, exclude = '') => {
  const filtered = items.filter((item) => item !== exclude);
  return shuffleArray(filtered).slice(0, count);
};

const App = () => {
  const [decision, setDecision] = useState('');
  const [step, setStep] = useState('input');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [modal, setModal] = useState(null);
  const [visibleIdeas, setVisibleIdeas] = useState(() => getRandomIdeas(samplePrompts, 3));

  useEffect(() => {
    document.title = 'NEXUS.core | Multiversum-Simulator';
  }, []);

  const fillRandom = () => {
    const nextPrompt = getRandomPrompt(samplePrompts, decision.trim());
    setDecision(nextPrompt);
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
            : `Von der KI gelieferter Prozentwert: ${formatExactZeros(rawProbability)} %`,
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
    setVisibleIdeas(getRandomIdeas(samplePrompts, 3));
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
            {/* HIER WURDE DER LINK ZUM ARCHIV EINGEFÜGT */}
            <a href="#archiv" className="transition-colors hover:text-white">Archiv</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
            <a href="/kontakt.html" className="transition-colors hover:text-white">Kontakt</a>
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-24 pt-8 sm:px-6 sm:pt-16 lg:gap-20">
        <section id="tool" className="mx-auto mt-2 flex w-full max-w-4xl flex-col items-center text-center sm:mt-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] sm:text-xs">
            <Activity size={14} className="animate-pulse" /> System online
          </div>

          <h1 className="mb-6 max-w-4xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-black leading-[1.1] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Eine kleine Handlung.<br className="hidden sm:block" /> Drei völlig andere Zeitlinien.
          </h1>

          <p className="mb-12 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            NEXUS.core ist ein interaktives KI-Unterhaltungstool. Du gibst eine kleine Alltagshandlung ein und erhältst drei alternative Zukunftsverläufe – von nachvollziehbar bis völlig eskaliert.
          </p>

          <div className="relative z-20 w-full">
            {errorMsg && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-left text-sm leading-7 text-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAnalyze} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="group relative">
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-purple-600/30 to-blue-600/30 opacity-40 blur-xl transition-opacity duration-500 group-hover:opacity-80"></div>
                <div className="relative rounded-[32px] border border-white/10 bg-[#0a0f18]/80 p-2 shadow-2xl backdrop-blur-2xl transition-all hover:border-purple-500/30 sm:p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <div className="flex flex-1 items-center gap-3 rounded-3xl px-4 py-3">
                      <Terminal size={24} className="hidden shrink-0 text-purple-400 sm:block" />
                      <input
                        type="text"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        maxLength={180}
                        minLength={5}
                        required
                        placeholder="z. B.: Ich habe heute einer unbekannten Person geholfen"
                        className="w-full bg-transparent py-2 text-center text-base font-medium text-white outline-none placeholder:text-slate-500 sm:text-left sm:text-lg"
                      />
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={fillRandom}
                        className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Zufall
                      </button>
                      <button
                        type="submit"
                        disabled={step === 'analyzing' || decision.trim().length < 5}
                        className="flex items-center justify-center gap-2 rounded-3xl bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-slate-900 transition hover:bg-purple-300 hover:shadow-[0_0_20px_rgba(216,180,254,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Simulieren <Sparkles size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="mr-2 hidden text-[10px] font-bold uppercase tracking-widest sm:block">Ideen:</span>
                {visibleIdeas.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDecision(item)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {step === 'analyzing' && (
            <div className="mt-12 w-full max-w-xl animate-in zoom-in rounded-[32px] border border-white/10 bg-[#0a0f18]/80 p-8 text-center shadow-2xl backdrop-blur-xl duration-300">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/10">
                <Fingerprint size={32} className="animate-pulse text-purple-300" />
              </div>
              <div className="mb-2 text-xl font-black uppercase tracking-[0.18em] text-white">
                Zeitlinien werden erzeugt
              </div>
              <p className="mx-auto mb-6 max-w-sm text-sm leading-7 text-slate-400">
                NEXUS verarbeitet die Eingabe und erstellt drei alternative Verläufe.
              </p>
              <div className="mx-auto h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-500">{loadingProgress}% COMPLETE</div>
            </div>
          )}

          {results && step === 'results' && (
            <div id="results-section" className="mt-16 w-full space-y-8 animate-in slide-in-from-bottom-12 duration-700 text-left">
              <div className="rounded-[32px] border border-white/5 bg-[#0a0f18]/80 p-6 text-center backdrop-blur-xl sm:p-8">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Ausgangsaktion
                </div>
                <div className="text-xl font-semibold italic leading-relaxed text-white sm:text-3xl">
                  „{results.original}“
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {results.timelines.map((timeline) => {
                  const scheme = colorMap[timeline.id] || colorMap.ALPHA;
                  return (
                    <article
                      key={timeline.id}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-[32px] border bg-[#0a0f18] p-6 shadow-2xl transition-transform hover:-translate-y-2 sm:p-8 ${scheme.ring}`}
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 ${scheme.glow}`} />
                      <div className="relative flex h-full flex-col">
                        <div className="mb-6 flex items-start justify-between gap-3">
                          <div>
                            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${scheme.badge}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {timeline.id}
                            </div>
                            <div className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                              {timeline.type}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(timeline)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title="Text kopieren"
                          >
                            {copiedId === timeline.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                          </button>
                        </div>

                        <h3 className={`mb-4 text-2xl font-black leading-tight ${scheme.text}`}>
                          {timeline.title}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-300">{timeline.desc}</p>

                        <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 px-4 py-4 sm:px-5">
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                            Einordnung
                          </span>
                          <div className="text-right">
                            <span
                              className="inline-block cursor-help border-b border-dashed border-white/20 pb-0.5 text-base font-black leading-tight text-white transition-colors hover:border-white sm:text-lg"
                              title={timeline.probabilityTooltip}
                            >
                              {timeline.probability}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-transparent px-8 py-4 text-sm font-bold text-white transition hover:border-purple-500 hover:bg-purple-500/10"
                >
                  <RefreshCw size={16} /> Neue Aktion testen
                </button>
                <button
                  type="button"
                  onClick={() => setModal('transparenz')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-8 py-4 text-sm font-bold text-purple-200 transition hover:bg-purple-500/15"
                >
                  <Info size={16} /> Transparenz & Nutzung
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="was-ist-das" className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/5 bg-[#0a0f18] p-8 sm:p-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Sparkles size={24} />
            </div>
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Ein spielerisches Was-wäre-wenn-Tool
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              <p>
                NEXUS.core nimmt eine kleine Alltagshandlung und denkt sie in drei unterschiedliche Richtungen weiter. So entstehen kurze alternative Zeitlinien mit unterschiedlicher Eskalationsstufe.
              </p>
              <p>
                Das Ergebnis ist kein wissenschaftliches Modell, sondern ein kreatives KI-Format für Unterhaltung, Inspiration und neugieriges Ausprobieren.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/5 bg-[#0a0f18] p-8 sm:p-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
              <GitBranch size={24} />
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
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valuePoints.map((point) => {
            const Icon = point.icon;
            return (
              <article key={point.title} className="rounded-[32px] border border-white/5 bg-[#0a0f18] p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-emerald-400">
                  <Icon size={26} />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">{point.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{point.text}</p>
              </article>
            );
          })}
        </section>

        {/* === NEUE SEKTION: ARCHIV DER ANOMALIEN (Hall of Fame) === */}
        <section id="archiv" className="rounded-[32px] border border-white/5 bg-[#0a0f18] p-8 sm:p-12">
          <div className="mb-10 text-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">Hall of Fame</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Archiv der Anomalien</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Ein Blick in unsere Datenbank der denkwürdigsten Simulationen. Diese Beispiele zeigen, wie selbst kleinste Entscheidungen das Multiversum ins Chaos stürzen können.
            </p>
          </div>

          <div className="space-y-12">
            {hallOfFameData.map((item, idx) => (
              <div key={idx} className="space-y-6 rounded-3xl border border-white/5 bg-black/40 p-6 sm:p-8">
                <div className="text-center">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Ausgangsaktion
                  </div>
                  <div className="text-lg font-semibold italic text-white sm:text-xl">
                    „{item.original}“
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {item.timelines.map((timeline) => {
                    const scheme = colorMap[timeline.id] || colorMap.ALPHA;
                    return (
                      <article
                        key={timeline.id}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0a0f18] p-5 shadow-lg transition-all hover:-translate-y-1 sm:p-6 ${scheme.ring}`}
                      >
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity group-hover:opacity-40 ${scheme.glow}`} />
                        <div className="relative flex h-full flex-col">
                          <div className="mb-4">
                            <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${scheme.badge}`}>
                              <span className="h-1 w-1 rounded-full bg-current" /> {timeline.id}
                            </div>
                          </div>
                          <h4 className={`mb-2 text-lg font-black leading-tight ${scheme.text}`}>
                            {timeline.title}
                          </h4>
                          <p className="mb-6 text-sm leading-relaxed text-slate-300">
                            {timeline.desc}
                          </p>
                          <div className="mt-auto border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                              Eintrittswahrscheinlichkeit: <span className="text-white">{timeline.probability}</span>
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* === ENDE NEUE SEKTION === */}

        <section id="faq" className="rounded-[32px] border border-white/5 bg-[#0a0f18] p-8 sm:p-12">
          <div className="mb-10 text-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">FAQ</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Häufige Fragen</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-[24px] border border-white/5 bg-white/5 p-6">
                <h3 className="mb-3 text-lg font-bold text-white">{item.q}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/10 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Kontakt & Nutzung</div>
              <h2 className="mb-6 text-3xl font-black text-white sm:text-4xl">Klar und nachvollziehbar</h2>
              <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                <p>Bitte gib keine sensiblen Daten ein, da Inhalte zur Generierung an externe KI-Dienste weitergeleitet werden.</p>
                <p>Alle generierten Zeitlinien dienen der Unterhaltung und stellen keine verlässliche Grundlage für echte Lebensentscheidungen dar.</p>
                <p>Weitere Informationen zum Betreiber, zur Datenverarbeitung und zu den Kontaktmöglichkeiten findest du auf den verlinkten Pflichtseiten.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {[
  { href: '/impressum.html', label: 'Impressum öffnen' },
  { href: '/datenschutz.html', label: 'Datenschutz öffnen' },
  { href: '/kontakt.html', label: 'Kontakt öffnen' },
  { href: '/ueber-nexus-core.html', label: 'Über NEXUS.core' },
  { href: '/so-entstehen-die-ergebnisse.html', label: 'So entstehen die Ergebnisse' },
  { href: '/kuratierte-beispiele.html', label: 'Kuratierte Beispiele' },
].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-sm font-bold text-white transition hover:border-purple-500/50 hover:bg-black/60"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={16} className="text-slate-500" />
                </a>
              ))}
              <button
                type="button"
                onClick={() => setModal('transparenz')}
                className="inline-flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/20 px-6 py-4 text-sm font-bold text-purple-100 transition hover:bg-purple-500/30"
              >
                <span>Detaillierte Nutzung lesen</span>
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
            <a href="/ueber-nexus-core.html" className="transition hover:text-white">Über NEXUS.core</a>
<a href="/so-entstehen-die-ergebnisse.html" className="transition hover:text-white">So entstehen die Ergebnisse</a>
<a href="/kuratierte-beispiele.html" className="transition hover:text-white">Kuratierte Beispiele</a>
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