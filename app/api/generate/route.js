const FOUNDER_PROFILE = `
PROFILO REALE DEL FOUNDER:
- Background: Tech/Dev + Giornalismo/Media + 15+ anni di soluzioni per broadcaster TV (postproduzione: documentari, news, sport, meteo, band annonces)
- Situazione attuale: Dipendente, vuole costruire qualcosa di parallelo e uscire.
- Budget: Max €5k per partire
- Team: Solo. Nessun dev. Si affida al 95% ad agenti AI, 5% lavoro suo.
- Obiettivo: Lifestyle business (libertà + profitto stabile). NON cerca investitori, NON vuole scala enterprise.
- Clienti target: Creator/Influencer, Freelancer video, Consumer B2C — chi fa contenuti per YouTube/social ma vuole lavorare con broadcaster TV professionali.
- Direzione: AI per automazione workflow video/media
- Vantaggi competitivi: conosce i workflow interni dei broadcaster (standard tecnici, metadati, delivery, compliance), ha contatti nel settore, capisce sia il lato creator che il lato broadcast professionale.
- Vincoli hard: no cicli di vendita lunghi, no dipendenza da pochi clienti grandi, costruibile solo con AI agents entro €5k.
`;

export async function POST(req) {
  const { focusAreas, constraints } = await req.json();

  const prompt = `Sei un advisor brutalmente onesto per startup AI-first nel settore media/video.

${FOUNDER_PROFILE}

Focus selezionato: ${focusAreas?.join(", ") || "aperto"}
Vincoli aggiuntivi: ${constraints?.join(", ") || "nessuno"}

Genera esattamente 4 idee di startup/prodotto AI-first. Ogni idea DEVE:
- Sfruttare il know-how broadcast professionale del founder (questo è il suo moat reale)
- Essere costruibile da solo con AI agents entro €5k
- Avere un modello di revenue chiaro e rapido (no "poi vedremo")
- Targetare creator/freelancer video o consumer — NON broadcaster enterprise come cliente principale
- Essere concreta, non vaporware

Per ogni idea usa ESATTAMENTE questo formato:

IDEA 1: [Nome prodotto]
Tagline: [Max 10 parole, memorabile]
Problema: [Il dolore specifico che risolve, in 1 frase]
Soluzione: [Come funziona concretamente, in 2 frasi]
Cliente: [Chi paga, quanto, perché ora]
Revenue: [Modello + pricing indicativo]
Moat: [Perché TU sei la persona giusta per farlo]
Rischio: [Il rischio principale e come mitigarlo]
MVP: [Cosa costruire nelle prime 4 settimane con AI agents]

IDEA 2: [Nome prodotto]
[stessa struttura]

...fino a IDEA 4.

Sii specifico. Nomi di tool AI reali, canali di acquisizione concreti, pricing reale.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2400,
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
