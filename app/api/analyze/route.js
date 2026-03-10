export const runtime = "edge";

const FOUNDER_PROFILE = `
Background: Tech/Dev + Giornalismo/Media + 15+ anni workflow broadcaster TV.
Solo, nessun dev, budget €5k, AI agents al 95%. Obiettivo lifestyle business.
Clienti: Creator/Freelancer video, Consumer B2C.
`;

export async function POST(req) {
  const { ideas } = await req.json();

  const list = ideas.map((idea, i) =>
    `${i + 1}. "${idea.title}" — ${idea.tagline}\nRevenue: ${idea.revenue || "?"}\nMoat: ${idea.moat || "?"}`
  ).join("\n\n");

  const prompt = `${FOUNDER_PROFILE}

Shortlist idee del founder:
${list}

Analisi comparativa brutalmente onesta:
1. RANKING: quale lanciare prima e perché (considera: solo, €5k, AI agents, lifestyle business)
2. SINERGIE: possono coesistere o si cannibalizzano?
3. KILLER QUESTION per ognuna: la domanda a cui rispondere prima di iniziare
4. RACCOMANDAZIONE FINALE: una frase secca su cosa fare lunedì mattina

Niente ottimismo da coach. Risposte concrete.`;

  const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return new Response(anthropicResp.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
