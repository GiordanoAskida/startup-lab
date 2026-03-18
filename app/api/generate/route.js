const FOUNDER_BASE = `
PROFILO FOUNDER:
- Solo, ZERO dev team, ZERO codice — tutto deve essere realizzabile in autonomia
- L'unico "sviluppatore" disponibile è l'AI (Claude, ChatGPT, Cursor, ecc.)
- Ogni idea DEVE essere costruibile usando tool AI/no-code esistenti sul mercato
- La configurazione degli agenti AI e dei workflow deve essere guidabile dall'AI stessa, senza programmazione
- Budget max €5k per partire
- Lavora al 95% con AI agents, 5% lavoro manuale
- Obiettivo: lifestyle business (libertà + profitto stabile), NO investitori, NO scala enterprise
- Mercati: Francia, Italia, Europa
- Clienti preferiti: Consumer B2C, Freelancer, Creator, privati appassionati di un argomento specifico
- Vincoli hard: revenue netta reale entro 6 mesi, no cicli vendita lunghi, gestibile da solo
- ESCLUDI qualsiasi idea che richieda sviluppo software custom, assunzione di dev, o expertise verticale profonda e rara
- Le idee devono essere accessibili anche a chi non ha un background specifico nel settore
`;

export async function POST(req) {
  const { focusAreas, constraints, customFocus, revenueTarget } = await req.json();

  const focusLabels = focusAreas?.filter(Boolean) || [];
  const constraintLabels = constraints?.filter(Boolean) || [];
  const revenueMin = revenueTarget || 2000;
  const revenueLabel = revenueMin >= 10000 ? "€10.000+" : `€${revenueMin.toLocaleString("it-IT")}`;

  const prompt = `Sei un advisor esperto di startup AI-first, automazione no-code e business lifestyle per il mercato europeo.

${FOUNDER_BASE}

Settori / interessi selezionati: ${focusLabels.join(", ") || "aperto — esplora opportunità trasversali"}
Vincoli aggiuntivi: ${constraintLabels.join(", ") || "nessuno"}
Contesto personale aggiuntivo: ${customFocus || "nessuno"}
Revenue netta target: MINIMO ${revenueLabel}/mese dopo tutte le spese (abbonamenti tool, infrastruttura, marketing, ecc.)

Genera esattamente 4 idee di startup/prodotto AI-first. Ogni idea DEVE:
- Generare almeno ${revenueLabel} netti/mese entro 6-12 mesi, con proiezione realistica
- Essere costruibile interamente da solo, SENZA scrivere codice, usando solo tool AI e no-code esistenti
- Non richiedere expertise verticale rara o background specifico difficile da acquisire
- Operare in un mercato validato (qualcuno paga già) con un angolo differenziato: nicchia più specifica, distribuzione più semplice, o problema non ancora risolto bene
- Avere clienti B2C, freelancer, creator, o privati appassionati — NO enterprise, NO lunghi cicli di vendita

Per ogni idea usa ESATTAMENTE questo formato (rispetta i label esatti):

IDEA 1: [Nome prodotto]
Tagline: [Max 10 parole]
Problema: [Dolore specifico in 1 frase]
Soluzione: [Come funziona con AI agents, in 2 frasi — senza codice custom]
Cliente: [Chi paga, quanto, perché ora]
Revenue: [Modello + pricing + proiezione mensile netta realistica a 6 e 12 mesi]
Moat: [Vantaggio competitivo concreto — perché questa persona specifica può farlo]
Rischio: [Rischio principale e come mitigarlo]
MVP: [Cosa costruire nelle prime 4 settimane — solo con tool no-code/AI, passo per passo]
Trend: [Dato di mercato reale: dimensione TAM, % crescita annua, fonte]
Gap: [Cosa manca nei competitor esistenti e come questa idea lo colma]
Strumenti: [Lista tool AI/no-code concreti con il ruolo specifico di ciascuno — es. Make per automazione, Voiceflow per chatbot, ElevenLabs per audio, ecc.]
Autonomia_AI: [% stimata gestita da AI agents vs manuale — es. "85% AI / 15% manuale" — con spiegazione di cosa rimane manuale]
Come_Partire: [Primi 3 passi concreti per configurare il workflow, con quale tool iniziare e come l'AI guida la configurazione — senza assumere nessuna competenza tecnica]

IDEA 2: [Nome prodotto]
[stessa struttura]

IDEA 3: [Nome prodotto]
[stessa struttura]

IDEA 4: [Nome prodotto]
[stessa struttura]

Sii specifico. Dati reali, competitor reali, pricing reale. Per i tool: usa solo prodotti esistenti oggi con pricing pubblico. Per la revenue: calcola sempre al netto dei costi operativi mensili stimati.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
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
