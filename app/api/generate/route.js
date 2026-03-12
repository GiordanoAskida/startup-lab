const FOUNDER_BASE = `
PROFILO FOUNDER:
- Solo, nessun dev team
- Budget max €5k per partire
- Lavora al 95% con AI agents, 5% lavoro manuale
- Obiettivo: lifestyle business (libertà + profitto stabile), NO investitori, NO scala enterprise
- Mercati prioritari: 1) Francia (Paris, Lyon, Marseille), 2) Italia, 3) Europa
- Clienti preferiti: Consumer B2C, Freelancer, Creator
- Vincoli hard: revenue entro 6 mesi, no cicli vendita lunghi, gestibile da solo
`;

export async function POST(req) {
  const { focusAreas, constraints } = await req.json();

  const focusLabels = focusAreas?.filter(Boolean) || [];
  const constraintLabels = constraints?.filter(Boolean) || [];

  const prompt = `Sei un advisor esperto di startup e trend di mercato europei.

${FOUNDER_BASE}

Focus selezionato: ${focusLabels.join(", ") || "aperto"}
Vincoli aggiuntivi: ${constraintLabels.join(", ") || "nessuno"}

Genera esattamente 4 idee di startup/prodotto AI-first. Ogni idea DEVE:
- Essere costruibile da solo con AI agents entro €5k
- Avere revenue chiara entro 6 mesi
- Operare in un mercato validato (qualcuno paga già per risolvere questo problema) MA con un approccio differenziato: nicchia più specifica, distribuzione diversa, soluzione più semplice, o angolo non ancora sfruttato
- NON essere una copia di ciò che esiste — il gap rispetto ai competitor deve essere chiaro e reale

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
Gap: [Cosa manca nei competitor esistenti e come questa idea lo colma in modo unico]

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
