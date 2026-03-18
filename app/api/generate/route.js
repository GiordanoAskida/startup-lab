const FOUNDER_BASE = `
PROFILO FOUNDER:
- Solo, ZERO dev team, ZERO codice — tutto deve essere realizzabile in autonomia
- L'unico "sviluppatore" disponibile è l'AI (Claude, ChatGPT, Cursor, ecc.)
- Ogni idea DEVE essere costruibile usando tool AI/no-code esistenti sul mercato
- La configurazione degli agenti AI e dei workflow deve essere guidata dall'AI stessa, non richiedere programmazione
- Budget max €5k per partire
- Lavora al 95% con AI agents, 5% lavoro manuale
- Obiettivo: lifestyle business (libertà + profitto stabile), NO investitori, NO scala enterprise
- Mercati prioritari: 1) Francia (Paris, Lyon, Marseille), 2) Italia, 3) Europa
- Clienti preferiti: Consumer B2C, Freelancer, Creator
- Vincoli hard: revenue entro 6 mesi, no cicli vendita lunghi, gestibile da solo
- ESCLUDI qualsiasi idea che richieda sviluppo software custom, assunzione di dev, o infrastruttura tecnica complessa
`;

export async function POST(req) {
  const { focusAreas, constraints } = await req.json();

  const focusLabels = focusAreas?.filter(Boolean) || [];
  const constraintLabels = constraints?.filter(Boolean) || [];

  const prompt = `Sei un advisor esperto di startup AI-first e automazione no-code per il mercato europeo.

${FOUNDER_BASE}

Focus selezionato: ${focusLabels.join(", ") || "aperto"}
Vincoli aggiuntivi: ${constraintLabels.join(", ") || "nessuno"}

Genera esattamente 4 idee di startup/prodotto AI-first. Ogni idea DEVE:
- Essere costruibile interamente da solo, SENZA scrivere codice, usando solo tool AI e no-code esistenti
- Avere revenue chiara entro 6 mesi
- Operare in un mercato validato con un approccio differenziato (nicchia più specifica, distribuzione diversa, soluzione più semplice, o angolo non ancora sfruttato)
- NON richiedere mai un dev, un CTO, o competenze tecniche avanzate
- Essere avviabile con Claude o altro AI che guida la configurazione step-by-step

Per ogni idea usa ESATTAMENTE questo formato:

IDEA 1: [Nome prodotto]
Tagline: [Max 10 parole]
Problema: [Dolore specifico in 1 frase]
Soluzione: [Come funziona con AI agents, in 2 frasi — senza codice custom]
Cliente: [Chi paga, quanto, perché ora]
Revenue: [Modello + pricing indicativo]
Moat: [Vantaggio competitivo del founder in questo mercato]
Rischio: [Rischio principale e come mitigarlo]
MVP: [Cosa costruire nelle prime 4 settimane — solo con tool no-code/AI]
Trend: [Dato di mercato reale: dimensione TAM, % crescita annua, fonte]
Gap: [Cosa manca nei competitor esistenti e come questa idea lo colma in modo unico]
Strumenti: [Lista dei tool AI/no-code concreti che realizzano questa idea — es. Make, n8n, Voiceflow, Relevance AI, Zapier, Notion AI, ElevenLabs, ecc. — con il ruolo specifico di ciascuno]
Autonomia_AI: [Percentuale stimata del lavoro gestito da AI agents vs manuale — es. "85% AI / 15% manuale" — con spiegazione di cosa rimane manuale e perché]
Come_Partire: [Primi 3 passi concreti per configurare il workflow, con quale tool e come l'AI ti guida nella configurazione — senza assumere nessuna competenza tecnica]

IDEA 2: [Nome prodotto]
[stessa struttura]

...fino a IDEA 4.

Sii specifico. Dati reali, competitor reali, pricing reale. Per i tool: usa solo prodotti esistenti e accessibili oggi, con pricing pubblico.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
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
