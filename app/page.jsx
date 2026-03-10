"use client";
import { useState, useCallback, useRef, useEffect } from "react";

const FOCUS_AREAS = [
  { id: "workflow", label: "Automazione workflow", icon: "⚙️" },
  { id: "quality", label: "Qualità broadcast", icon: "📺" },
  { id: "compliance", label: "Compliance & delivery", icon: "✅" },
  { id: "monetization", label: "Monetizzazione contenuti", icon: "💰" },
  { id: "metadata", label: "Metadati & SEO video", icon: "🏷️" },
  { id: "localization", label: "Localizzazione & subtitle", icon: "🌍" },
  { id: "repurpose", label: "Repurposing contenuti", icon: "♻️" },
  { id: "pitching", label: "Pitch a broadcaster", icon: "📡" },
  { id: "nontecnici", label: "Creativi non-tecnici", icon: "🎨" },
  { id: "podcastaudio", label: "Podcast audio statico", icon: "🎙️" },
  { id: "videointerviste", label: "Video interviste statiche", icon: "📹" },
  { id: "animazione", label: "Animazione contenuti", icon: "🎬" },
  { id: "seniortech", label: "Senior tech", icon: "👴" },
  { id: "agriurbana", label: "Agricoltura urbana", icon: "🌱" },
  { id: "turismo", label: "Turismo esperienziale", icon: "🗺️" },
];

const CONSTRAINTS = [
  { id: "5k", label: "Max €5k budget", icon: "💶" },
  { id: "nodev", label: "Zero dev team", icon: "🤖" },
  { id: "fast", label: "MVP < 8 settimane", icon: "🚀" },
  { id: "recurring", label: "Revenue ricorrente", icon: "🔄" },
  { id: "solo", label: "Gestibile da solo", icon: "🧍" },
  { id: "b2c", label: "Pagamento diretto (no enterprise)", icon: "💳" },
];

function parseIdeas(text) {
  const blocks = text.split(/(?=IDEA\s*\d)/i).filter(b => b.trim().length > 20);
  return blocks.map((block, i) => {
    const get = (label) => {
      const re = new RegExp(`${label}[:\\s]+(.+?)(?=\\n[A-ZÀÈÌÒÙ][a-zA-Zàèìòù]+:|IDEA \\d|$)`, "is");
      const m = block.match(re);
      return m ? m[1].trim() : null;
    };
    const titleLine = block.match(/IDEA\s*\d+[:\s–-]+(.+?)(?:\n|$)/i);
    return {
      id: `idea-${Date.now()}-${i}`,
      title: titleLine ? titleLine[1].trim() : `Idea ${i + 1}`,
      tagline: get("Tagline"),
      problema: get("Problema"),
      soluzione: get("Soluzione"),
      cliente: get("Cliente"),
      revenue: get("Revenue"),
      moat: get("Moat"),
      rischio: get("Rischio"),
      mvp: get("MVP"),
    };
  });
}

async function streamFromRoute(url, body, onChunk) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
      try {
        const d = JSON.parse(line.slice(6));
        if (d.type === "content_block_delta" && d.delta?.text) onChunk(d.delta.text);
      } catch {}
    }
  }
}

const Tag = ({ item, selected, onClick }) => (
  <button onClick={() => onClick(item.id)} style={{
    padding: "6px 13px", borderRadius: "6px",
    border: selected ? "1px solid rgba(234,179,8,0.5)" : "1px solid rgba(255,255,255,0.08)",
    background: selected ? "rgba(234,179,8,0.1)" : "transparent",
    color: selected ? "#fde047" : "rgba(255,255,255,0.4)",
    cursor: "pointer", fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace",
    transition: "all 0.15s", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap",
  }}>
    <span>{item.icon}</span>{item.label}
  </button>
);

const Field = ({ label, value, accent }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: accent || "rgba(255,255,255,0.25)", letterSpacing: "0.14em", marginBottom: "3px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", lineHeight: "1.65", fontFamily: "'Lora', Georgia, serif" }}>{value}</div>
    </div>
  );
};

function IdeaChat({ idea }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentReply, setCurrentReply] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentReply]);

  const send = async () => {
    const question = input.trim();
    if (!question || streaming) return;
    setInput("");
    setStreaming(true);
    setCurrentReply("");
    const newHistory = [...history, { role: "user", content: question }];
    setHistory(newHistory);
    let reply = "";
    try {
      await streamFromRoute("/api/chat", { idea, history, question }, chunk => {
        reply += chunk;
        setCurrentReply(reply);
      });
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setHistory([...newHistory, { role: "assistant", content: "Errore: " + e.message }]);
    } finally {
      setStreaming(false);
      setCurrentReply("");
    }
  };

  return (
    <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
      <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(99,202,183,0.5)", letterSpacing: "0.14em", marginBottom: "12px" }}>💬 CHAT SULL'IDEA</div>
      {history.length > 0 && (
        <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
          {history.map((m, i) => (
            <div key={i} style={{
              padding: "10px 14px", borderRadius: "8px",
              background: m.role === "user" ? "rgba(234,179,8,0.06)" : "rgba(255,255,255,0.03)",
              border: m.role === "user" ? "1px solid rgba(234,179,8,0.15)" : "1px solid rgba(255,255,255,0.05)",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%",
            }}>
              <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: m.role === "user" ? "rgba(234,179,8,0.5)" : "rgba(99,202,183,0.5)", marginBottom: "4px" }}>
                {m.role === "user" ? "TU" : "ADVISOR"}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", fontFamily: "'Lora', serif", whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          {streaming && currentReply && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", alignSelf: "flex-start", maxWidth: "90%" }}>
              <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(99,202,183,0.5)", marginBottom: "4px" }}>ADVISOR</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", fontFamily: "'Lora', serif", whiteSpace: "pre-wrap" }}>
                {currentReply}<span style={{ animation: "blink 0.8s infinite" }}>▌</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Es: c'è un'incongruenza nel revenue model..."
          disabled={streaming}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
            color: "#f5f0e8", fontSize: "13px", fontFamily: "'Lora', serif", outline: "none",
          }}
        />
        <button onClick={send} disabled={streaming || !input.trim()} style={{
          padding: "10px 18px", borderRadius: "8px", border: "none",
          background: streaming || !input.trim() ? "rgba(234,179,8,0.2)" : "rgba(234,179,8,0.9)",
          color: streaming || !input.trim() ? "rgba(0,0,0,0.4)" : "#080808",
          fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
          cursor: streaming || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap",
        }}>
          {streaming ? "…" : "INVIA"}
        </button>
      </div>
    </div>
  );
}

function IdeaCard({ idea, starred, onStar, onExpand, expanding, expansion, onRemove }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: starred ? "linear-gradient(160deg, rgba(234,179,8,0.06) 0%, #0d0d0d 60%)" : "#0d0d0d",
      border: starred ? "1px solid rgba(234,179,8,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px", overflow: "hidden", transition: "border-color 0.25s",
    }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 5px", fontSize: "18px", fontFamily: "'Playfair Display', Georgia, serif", color: "#f5f0e8", fontWeight: 700, lineHeight: "1.2" }}>{idea.title}</h3>
          {idea.tagline && <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "'Lora', serif", fontStyle: "italic" }}>{idea.tagline}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          {onStar && (
            <button onClick={e => { e.stopPropagation(); onStar(idea.id); }} style={{ width: "30px", height: "30px", borderRadius: "6px", border: starred ? "1px solid rgba(234,179,8,0.5)" : "1px solid rgba(255,255,255,0.1)", background: starred ? "rgba(234,179,8,0.12)" : "rgba(255,255,255,0.03)", color: starred ? "#fde047" : "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}>★</button>
          )}
          {onRemove && (
            <button onClick={e => { e.stopPropagation(); onRemove(idea.id); }} title="Rimuovi dalla shortlist" style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          )}
          {onExpand && (
            <button onClick={e => { e.stopPropagation(); onExpand(idea.id); }} disabled={expanding} style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", cursor: expanding ? "wait" : "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 300 }}>{expanding ? "·" : "+"}</button>
          )}
          <div style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "12px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
        </div>
      </div>
      {!open && idea.problema && <div style={{ padding: "0 24px 18px", fontSize: "13px", color: "rgba(255,255,255,0.38)", fontFamily: "'Lora', serif", lineHeight: "1.6" }}>{idea.problema}</div>}
      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
          <Field label="🔥 Problema" value={idea.problema} accent="rgba(239,68,68,0.7)" />
          <Field label="⚙️ Soluzione AI" value={idea.soluzione} accent="rgba(99,202,183,0.7)" />
          <Field label="👤 Cliente & pagamento" value={idea.cliente} accent="rgba(234,179,8,0.7)" />
          <Field label="💰 Revenue model" value={idea.revenue} accent="rgba(74,222,128,0.7)" />
          <Field label="🏆 Perché tu (moat)" value={idea.moat} accent="rgba(168,85,247,0.7)" />
          <Field label="⚠️ Rischio principale" value={idea.rischio} accent="rgba(251,146,60,0.7)" />
          <Field label="🛠️ MVP settimane 1-4" value={idea.mvp} accent="rgba(99,102,241,0.7)" />
          {expansion !== undefined && (
            <div style={{ marginTop: "20px", padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(99,202,183,0.6)", letterSpacing: "0.14em", marginBottom: "10px" }}>DEEP DIVE</div>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.8", fontFamily: "'Lora', serif", whiteSpace: "pre-wrap" }}>
                {expansion}{expanding && <span style={{ animation: "blink 0.8s infinite" }}>▌</span>}
              </p>
            </div>
          )}
          <IdeaChat idea={idea} />
        </div>
      )}
    </div>
  );
}

const FilterLabel = ({ children }) => (
  <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "10px" }}>{children}</div>
);

export default function Home() {
  const [selFocus, setSelFocus] = useState([]);
  const [selConstraints, setSelConstraints] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [starred, setStarred] = useState([]);
  const [savedShortlist, setSavedShortlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");
  const [expansions, setExpansions] = useState({});
  const [expandingId, setExpandingId] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [analyzingShortlist, setAnalyzingShortlist] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [shortlistOpen, setShortlistOpen] = useState(true);

  // Load shortlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("startup-lab-shortlist");
      if (saved) setSavedShortlist(JSON.parse(saved));
    } catch {}
  }, []);

  // Save shortlist to localStorage whenever it changes
  const saveToShortlist = (idea) => {
    setSavedShortlist(prev => {
      const already = prev.find(i => i.title === idea.title);
      if (already) return prev;
      const updated = [...prev, idea];
      try { localStorage.setItem("startup-lab-shortlist", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const removeFromShortlist = (id) => {
    setSavedShortlist(prev => {
      const updated = prev.filter(i => i.id !== id);
      try { localStorage.setItem("startup-lab-shortlist", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const clearShortlist = () => {
    setSavedShortlist([]);
    try { localStorage.removeItem("startup-lab-shortlist"); } catch {}
  };

  const toggle = (list, setList, id) =>
    setList(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleStar = (ideaId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    const isStarred = starred.includes(ideaId);
    if (isStarred) {
      setStarred(p => p.filter(x => x !== ideaId));
    } else {
      setStarred(p => [...p, ideaId]);
      saveToShortlist(idea);
    }
  };

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true); setPhase("generating");
    setIdeas([]); setStreamPreview(""); setStarred([]); setExpansions({}); setAnalysis("");
    let full = "";
    try {
      await streamFromRoute("/api/generate",
        { focusAreas: selFocus.map(id => FOCUS_AREAS.find(f => f.id === id)?.label), constraints: selConstraints.map(id => CONSTRAINTS.find(c => c.id === id)?.label) },
        chunk => { full += chunk; setStreamPreview(full.slice(-300)); }
      );
      setIdeas(parseIdeas(full));
      setPhase("done");
    } catch (e) {
      setIdeas([{ id: "err", title: "Errore", tagline: e.message }]);
      setPhase("idle");
    } finally { setLoading(false); }
  }, [selFocus, selConstraints, loading]);

  const expand = useCallback(async (ideaId) => {
    if (expandingId) return;
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    setExpandingId(ideaId);
    setExpansions(p => ({ ...p, [ideaId]: "" }));
    try {
      await streamFromRoute("/api/expand", { idea },
        chunk => setExpansions(p => ({ ...p, [ideaId]: (p[ideaId] || "") + chunk }))
      );
    } finally { setExpandingId(null); }
  }, [ideas, expandingId]);

  const analyzeShortlist = useCallback(async () => {
    if (analyzingShortlist || savedShortlist.length === 0) return;
    setAnalyzingShortlist(true); setAnalysis("");
    try {
      await streamFromRoute("/api/analyze", { ideas: savedShortlist },
        chunk => setAnalysis(p => p + chunk)
      );
    } finally { setAnalyzingShortlist(false); }
  }, [savedShortlist, analyzingShortlist]);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f5f0e8", fontFamily: "'Lora', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:ital,wght@0,400;1,400&family=IBM+Plex+Mono:wght@400;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin:0; padding:0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(234,179,8,0.6)", letterSpacing: "0.2em", marginBottom: "16px" }}>BROADCAST → AI STARTUP LAB</div>
          <h1 style={{ marginBottom: "16px", fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 700, lineHeight: "1.1", color: "#f5f0e8", letterSpacing: "-0.02em" }}>
            Le tue idee.<br /><span style={{ color: "rgba(255,255,255,0.28)" }}>Calibrate su di te.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", width: "fit-content" }}>
            {["📺 Broadcast 15+ anni", "🤖 AI-first solo", "💶 Budget €5k", "🇫🇷 Francia priority", "🇮🇹 Italia", "🌍 Europa"].map(t => (
              <span key={t} style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.35)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* SHORTLIST PERSISTENTE */}
        {savedShortlist.length > 0 && (
          <div style={{ marginBottom: "40px", borderRadius: "12px", border: "1px solid rgba(234,179,8,0.25)", background: "rgba(234,179,8,0.03)", overflow: "hidden" }}>
            <div
              onClick={() => setShortlistOpen(o => !o)}
              style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: shortlistOpen ? "1px solid rgba(234,179,8,0.15)" : "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(234,179,8,0.7)", letterSpacing: "0.16em" }}>★ SHORTLIST SALVATA</span>
                <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(234,179,8,0.5)", background: "rgba(234,179,8,0.1)", padding: "2px 8px", borderRadius: "10px" }}>{savedShortlist.length}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={e => { e.stopPropagation(); analyzeShortlist(); }}
                  disabled={analyzingShortlist}
                  style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(234,179,8,0.3)", background: "transparent", color: "#fde047", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", cursor: analyzingShortlist ? "wait" : "pointer" }}
                >
                  {analyzingShortlist ? "ANALISI…" : "ANALIZZA"}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); clearShortlist(); }}
                  style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "rgba(239,68,68,0.5)", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer" }}
                >
                  SVUOTA
                </button>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", transform: shortlistOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
              </div>
            </div>

            {shortlistOpen && (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {savedShortlist.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} starred={false} onRemove={removeFromShortlist} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analisi shortlist */}
        {(analysis || analyzingShortlist) && (
          <div style={{ marginBottom: "40px", padding: "28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(234,179,8,0.5)", letterSpacing: "0.18em", marginBottom: "16px" }}>★ ANALISI COMPARATIVA</div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: "1.9", fontFamily: "'Lora', serif", whiteSpace: "pre-wrap" }}>
              {analysis}{analyzingShortlist && <span style={{ animation: "blink 0.6s infinite" }}>▌</span>}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ marginBottom: "36px" }}>
          <FilterLabel>Focus di questa sessione</FilterLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "18px" }}>
            {FOCUS_AREAS.map(f => <Tag key={f.id} item={f} selected={selFocus.includes(f.id)} onClick={id => toggle(selFocus, setSelFocus, id)} />)}
          </div>
          <FilterLabel>Vincoli aggiuntivi</FilterLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {CONSTRAINTS.map(c => <Tag key={c.id} item={c} selected={selConstraints.includes(c.id)} onClick={id => toggle(selConstraints, setSelConstraints, id)} />)}
          </div>
        </div>

        {/* Generate button */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "40px", flexWrap: "wrap" }}>
          <button onClick={generate} disabled={loading} style={{ padding: "13px 32px", borderRadius: "8px", border: "none", background: loading ? "rgba(234,179,8,0.2)" : "rgba(234,179,8,0.9)", color: loading ? "rgba(255,255,255,0.4)" : "#080808", fontSize: "14px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, cursor: loading ? "wait" : "pointer", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px" }}>
            {loading ? <><span style={{ animation: "blink 0.6s infinite" }}>▌</span> GENERAZIONE…</> : "⚡ GENERA 4 IDEE"}
          </button>
        </div>

        {/* Stream preview */}
        {loading && streamPreview && (
          <div style={{ marginBottom: "28px", padding: "14px 18px", borderRadius: "8px", border: "1px solid rgba(234,179,8,0.1)", background: "rgba(234,179,8,0.03)" }}>
            <div style={{ fontSize: "9px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(234,179,8,0.4)", marginBottom: "6px", letterSpacing: "0.15em" }}>STREAMING ▶</div>
            <p style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.2)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{streamPreview}<span style={{ animation: "blink 0.5s infinite" }}>▌</span></p>
          </div>
        )}

        {/* Ideas */}
        {ideas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px", animation: "fadeIn 0.4s ease" }}>
            <FilterLabel>{ideas.length} idee — clicca per espandere · + deep dive · ★ salva in shortlist · 💬 chat</FilterLabel>
            {ideas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} starred={starred.includes(idea.id)} onStar={handleStar} onExpand={expand} expanding={expandingId === idea.id} expansion={expansions[idea.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
