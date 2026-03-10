const FOUNDER_PROFILE = `
PROFILO REALE DEL FOUNDER:
- Background: Tech/Dev + Giornalismo/Media + 15+ anni di soluzioni per broadcaster TV (postproduzione: documentari, news, sport, meteo, band annonces)
- Situazione attuale: Dipendente, vuole costruire qualcosa di parallelo e uscire.
- Budget: Max €5k per partire
- Team: Solo. Nessun dev. Si affida al 95% ad agenti AI, 5% lavoro suo.
- Obiettivo: Lifestyle business (libertà + profitto stabile). NON cerca investitori, NON vuole scala enterprise.
- Clienti target: Creator/Influencer, Freelancer video, Consumer B2C.
- Mercati prioritari: 1) Francia (France Télévisions, TF1, M6, Arte, Canal+), 2) Italia (RAI, Mediaset), 3) Europa.
- Vantaggi competitivi: conosce i workflow interni dei broadcaster (standard tecnici, metadati, delivery, compliance), ha contatti nel settore.
- Vincoli hard: no cicli di vendita lunghi, no dipendenza da pochi clienti grandi, costruibile solo con AI agents entro €5k.
`;

export async function POST(req) {
  const { idea, history, question } = await req.json();

  const systemPrompt = `Sei un advisor brutalmente onesto per startup AI-first nel settore media/video.

${FOUNDER_PROFILE}

Stai analizzando questa idea specifica del founder:
IDEA: "${idea.title}"
Tagline: ${idea.tagline || ""}
Problema: ${idea.problema || ""}
Soluzione: ${idea.soluzione || ""}
Cliente: ${idea.cliente || ""}
Revenue: ${idea.revenue || ""}
Moat: ${idea.moat || ""}
Rischio: ${idea.rischio || ""}
MVP: ${idea.mvp || ""}

Rispondi alle domande del founder su questa idea. Sii diretto, concreto, senza giri di parole. Se c'è un'incongruenza, dilla chiaramente. Max 150 parole per risposta.`;

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: question }
  ];

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  return new Response(anthropicResp.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
