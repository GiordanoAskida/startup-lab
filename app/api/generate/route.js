const FOUNDER_BASE = `
PROFILO FOUNDER (sempre valido):
- Solo, nessun dev team
- Budget max €5k per partire
- Lavora al 95% con AI agents, 5% lavoro manuale
- Obiettivo: lifestyle business (libertà + profitto stabile), NO investitori, NO scala enterprise
- Mercati prioritari: 1) Francia (Paris, Lyon, Marseille), 2) Italia, 3) Europa
- Clienti preferiti: Consumer B2C, Freelancer, Creator
- Vincoli hard: revenue entro 6 mesi, no cicli vendita lunghi, gestibile da solo
`;

const FOUNDER_BROADCAST = `
BACKGROUND SPECIFICO (usa solo se il focus è media/broadcast):
- 15+ anni di soluzioni per broadcaster TV (postproduzione: documentari, news, sport, meteo, band annonces)
- Conosce workflow interni broadcaster (standard tecnici, metadati, delivery, compliance EBU)
- Contatti nel settore: France Télévisions, TF1, M6, Arte, Canal+, RAI, Mediaset
`;

const BROADCAST_FOCUS_IDS = ["workflow", "quality", "compliance", "metadata", "localization", "repurpose", "pitching", "podcastaudio", "videointerviste", "animazione", "nontecnici", "monetization"];

export async function POST(req) {
  const { focusAreas, constraints } = await req.json();

  const focusLabels = focusAreas?.filter(Boolean) || [];
  const constraintLabels = constraints?.filter(Boolean) || [];

  // Detect if focus is broadcast-related
  const isBroadcastFocus = focusLabels.length === 0 || focusLabels.some(f =>
    ["Automazione workflow", "Qualità broadcast", "Compliance & delivery", "Metadati & SEO video",
     "Localizzazione & subtitle", "Repurposing contenuti", "Pitch a broadcaster",
     "Podcast audio statico", "Video interviste statiche", "Animazione contenuti",
     "Creativi non-tecnici", "Monetizzazione contenuti"].includes(f)
  );

  const founderProfile = isBroadcastFocus
    ? FOUNDER_BASE + FOUNDER_BROADCAST
    : FOUNDER_BASE;

  const broadcastInstruction = isBroadcastFocus
    ? "Puoi sfruttare il background broadcast del founder come vantaggio competitivo."
    : "IMPORTANTE: Il focus scelto è fuori dal broadcast. Genera idee completamente nuove in questo mercato. NON collegare le idee al mondo broadcast/media/TV. Tratta il founder come un imprenditore generico con i vincoli indicati.";

  const prompt = `Sei un advisor esperto di startup e trend di mercato europei.

${founderProfile}

Focus selezionato: ${focusLabels.join(", ") || "aperto"}
Vincoli aggiuntivi: ${constraintLabels.join(", ") || "nessuno"}

${broadcastInstruction}

Genera esattamente 4 idee di startup/prodotto AI-first. Ogni idea DEVE:
- Essere costruibile da solo con AI agents entro €5k
- Avere revenue chiara entro 6 mesi
- Essere concreta e già testata da altri in mercati simili (non vaporware)
- Essere supportata da un trend reale con dati

Per ogni idea usa ESATTAMENTE questo formato:

IDEA 1: [Nome prodotto]
Tagline: [Max 10 parole]
Problema: [Dolore specifico in 1 frase]
Soluzione: [Come funziona con AI, in 2 frasi]
Cliente: [Chi paga, quanto, perché ora]
Revenue: [Modello + pricing indicativo]
Moat: [Vantaggio competitivo del founder in questo mercato]
Rischio: [Rischio principale e come mitigarlo]
MVP: [Cosa costruire nelle prime 4 settimane]
Trend: [Dato di mercato reale: dimensione TAM, % crescita annua, fonte]
Proof: [1-2 competitor o prodotti simili già esistenti che provano che il mercato è reale]

IDEA 2: [Nome prodotto]
[stessa struttura]

...fino a IDEA 4.

Sii specifico. Dati reali, competitor reali, pricing reale.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2800,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return new Response(anthropicResp.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
