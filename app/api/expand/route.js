const FOUNDER_PROFILE = `
Background: Tech/Dev + Giornalismo/Media + 15+ anni workflow broadcaster TV.
Solo, nessun dev, budget €5k, AI agents al 95%. Obiettivo lifestyle business.
Clienti: Creator/Freelancer video, Consumer B2C.
`;

export async function POST(req) {
  const { idea } = await req.json();

  const prompt = `${FOUNDER_PROFILE}

Approfondisci questa idea per questo founder specifico:
"${idea.title}" — ${idea.tagline || ""}

Dammi:
1. I primi 3 clienti concreti da contattare (chi, dove trovarli, come approcciare)
2. Stack AI agents specifico per costruire l'MVP (tool reali: n8n, make, GPT-4o, Whisper, Descript, ecc.)
3. Come il know-how broadcast del founder diventa vantaggio competitivo reale qui
4. Un numero: entrate realistiche al mese 6

Max 220 parole, sii preciso e pratico. Niente motivational coach.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return new Response(anthropicResp.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
