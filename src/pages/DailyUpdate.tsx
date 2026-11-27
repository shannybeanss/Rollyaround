import { useRef, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../components/Toast";
import { extractChanges, type ProposedChange } from "../lib/extract";
import { brainstorm, dumpBrainstorm, type BrainstormResult } from "../lib/brainstorm";
import { uid } from "../lib/helpers";
import type { AppData } from "../types";

// Minimal typing for the Web Speech API (not in TS DOM lib by default).
type SpeechRec = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  onstart: () => void;
  start: () => void; stop: () => void;
};
function getSpeech(): SpeechRec | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function DailyUpdate() {
  const { data, update } = useStore();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [proposed, setProposed] = useState<ProposedChange[] | null>(null);
  const [ideasResult, setIdeasResult] = useState<BrainstormResult | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const speechSupported = !!getSpeech();

  const analyze = () => {
    const changes = extractChanges(text, data);
    setProposed(changes);
  };

  const doBrainstorm = () => {
    if (!text.trim()) return;
    setIdeasResult(brainstorm(text, data));
  };

  const toggleListen = async () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }

    const rec = getSpeech();
    if (!rec) {
      show("🎤 Speech-to-text isn't available in this browser (common on iPhone/Safari). Please type or paste instead.");
      return;
    }

    // Explicitly ask for mic permission first so failures are clear, not silent.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      show("🎤 Microphone access was blocked. Allow the mic in your browser settings, or type your update instead.");
      return;
    }

    recRef.current = rec;
    rec.lang = "en-SG"; rec.interimResults = true; rec.continuous = true;

    rec.onstart = () => { setListening(true); show("🎤 Listening… speak now."); };
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setText(t);
    };
    rec.onend = () => {
      setListening(false);
      // Nudge if we heard nothing at all.
      setText((cur) => { if (!cur.trim()) show("I didn't catch anything. Try again, or type your update."); return cur; });
    };
    rec.onerror = (e) => {
      setListening(false);
      const reason = e?.error;
      if (reason === "not-allowed" || reason === "service-not-allowed") show("🎤 Microphone permission denied. Enable it in your browser, or type instead.");
      else if (reason === "no-speech") show("I didn't hear anything — try speaking again, or type it.");
      else if (reason === "network") show("🎤 Speech needs an internet connection and isn't available right now. Please type instead.");
      else show("🎤 Speech-to-text didn't work on this device. Please type or paste your update.");
    };

    try {
      rec.start();
    } catch {
      setListening(false);
      show("🎤 Couldn't start the mic. Please type or paste your update instead.");
    }
  };

  const saveApproved = (approved: ProposedChange[]) => {
    const before: AppData = structuredClone(data);
    update((d) => {
      for (const c of approved) c.apply(d);
      d.dailyUpdates.push({ id: uid(), createdAt: new Date().toISOString(), transcript: text, applied: true });
      return d;
    });
    setProposed(null); setText(""); setOpen(false);
    show(`Updated — ${approved.length} change${approved.length === 1 ? "" : "s"} saved`, () => {
      // Undo: restore the prior snapshot wholesale.
      update(() => before);
      show("Reverted");
    });
  };

  return (
    <div className="card card-pad" style={{ marginBottom: 20, borderColor: "var(--accent)", borderWidth: 1.5 }}>
      <div className="row between wrap">
        <div>
          <h3 style={{ fontSize: 16 }}>🎙️ Record daily update</h3>
          <p className="tiny muted" style={{ marginTop: 2 }}>Speak, type or paste. Rolly pulls out ideas, hooks, finished tasks, blockers and time — and shows changes before saving.</p>
        </div>
        {!open && <button className="btn btn-accent" onClick={() => setOpen(true)}>Start</button>}
      </div>

      {open && (
        <div className="stack gap-12" style={{ marginTop: 14 }}>
          <textarea rows={4} placeholder='e.g. "I picked the seven packing photos, still need a cover, and have 15 minutes tomorrow."'
                    value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row gap-8 wrap">
            <button className={`btn ${listening ? "btn-accent listening" : ""}`} onClick={toggleListen} title={speechSupported ? "" : "Not supported in this browser"}>
              {listening ? "🔴 Listening… tap to stop" : "🎤 Speak"}
            </button>
            <button className="btn btn-accent" onClick={doBrainstorm} disabled={!text.trim()}>💡 Brainstorm hooks & ideas</button>
            <button className="btn btn-primary" onClick={analyze} disabled={!text.trim()}>Review changes</button>
            <button className="btn btn-ghost" onClick={() => { setOpen(false); setText(""); setProposed(null); setIdeasResult(null); }}>Cancel</button>
          </div>
          {!speechSupported && <span className="tiny muted">🎤 Speech-to-text isn't available in this browser (common on iPhone/Safari). Type or paste your update — it works exactly the same.</span>}

          {ideasResult && (
            <BrainstormPanel result={ideasResult} onClose={() => setIdeasResult(null)} onDump={(hooks, fus) => {
              const before: AppData = structuredClone(data);
              update((d) => { dumpBrainstorm(d, ideasResult, hooks, fus); return d; });
              setIdeasResult(null); setText("");
              show(`Dumped to Ideas — 1 piece + ${fus.length} follow-up${fus.length === 1 ? "" : "s"}`, () => { update(() => before); show("Reverted"); });
            }} />
          )}

          {proposed && (
            <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
              <h4 style={{ marginBottom: 8 }}>Proposed changes</h4>
              {proposed.length === 0 && <p className="tiny muted">Nothing clear to extract. Try naming a piece and what you did.</p>}
              <DiffList changes={proposed} onSave={saveApproved} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiffList({ changes, onSave }: { changes: ProposedChange[]; onSave: (c: ProposedChange[]) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(changes.map((c) => [c.id, c.confidence === "clear"]))
  );
  const tagColor: Record<ProposedChange["confidence"], string> = {
    clear: "var(--status-ready-bg)", ask: "var(--status-progress-bg)",
  };
  const approved = changes.filter((c) => checked[c.id]);
  return (
    <div>
      {changes.map((c) => (
        <div key={c.id} className="diff-row">
          <input type="checkbox" checked={!!checked[c.id]} onChange={() => setChecked((p) => ({ ...p, [c.id]: !p[c.id] }))} style={{ width: 18, height: 18, marginTop: 2 }} />
          <div className="grow">
            <div className="row gap-8">
              <span className="diff-tag" style={{ background: tagColor[c.confidence] }}>{c.confidence === "ask" ? "NEEDS A CHECK" : "CLEAR"}</span>
              <span>{c.label}</span>
            </div>
            {c.detail && <div className="tiny muted" style={{ marginTop: 2 }}>{c.detail}</div>}
            {c.question && <div className="tiny" style={{ marginTop: 2, color: "var(--status-progress)" }}>❓ {c.question}</div>}
          </div>
        </div>
      ))}
      {changes.length > 0 && (
        <div className="row between" style={{ marginTop: 12 }}>
          <span className="tiny muted">{approved.length} selected</span>
          <button className="btn btn-accent" disabled={approved.length === 0} onClick={() => onSave(approved)}>Save {approved.length} change{approved.length === 1 ? "" : "s"}</button>
        </div>
      )}
    </div>
  );
}

// Brainstorm panel: pick which generated hooks + follow-up ideas to dump into Ideas.
function BrainstormPanel({ result, onClose, onDump }: { result: BrainstormResult; onClose: () => void; onDump: (hooks: string[], followUps: string[]) => void }) {
  const [hooks, setHooks] = useState<Record<string, boolean>>(Object.fromEntries(result.hooks.map((h) => [h, true])));
  const [fus, setFus] = useState<Record<string, boolean>>(Object.fromEntries(result.followUps.map((f) => [f.title, true])));
  const selHooks = result.hooks.filter((h) => hooks[h]);
  const selFus = result.followUps.filter((f) => fus[f.title]).map((f) => f.title);

  return (
    <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
      <div className="row between wrap">
        <h4>💡 Ideas for “{result.topic}” <span className="tiny muted">(rule-based · series: {result.series})</span></h4>
      </div>
      <p className="tiny muted" style={{ marginTop: 2 }}>Pick what to keep. It saves your video as a piece (with the selected hooks) and drops the follow-ups into your idea bank.</p>

      <div style={{ marginTop: 12 }}>
        <b className="tiny" style={{ textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-soft)" }}>Hook options</b>
        <div className="stack gap-6" style={{ marginTop: 6 }}>
          {result.hooks.map((h) => (
            <label key={h} className="row gap-8" style={{ margin: 0, alignItems: "flex-start" }}>
              <input type="checkbox" style={{ width: 16, height: 16, marginTop: 3 }} checked={!!hooks[h]} onChange={() => setHooks((p) => ({ ...p, [h]: !p[h] }))} />
              <span>{h}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <b className="tiny" style={{ textTransform: "uppercase", letterSpacing: ".04em", color: "var(--ink-soft)" }}>Follow-up video ideas</b>
        <div className="stack gap-6" style={{ marginTop: 6 }}>
          {result.followUps.map((f) => (
            <label key={f.title} className="row gap-8" style={{ margin: 0, alignItems: "flex-start" }}>
              <input type="checkbox" style={{ width: 16, height: 16, marginTop: 3 }} checked={!!fus[f.title]} onChange={() => setFus((p) => ({ ...p, [f.title]: !p[f.title] }))} />
              <span><b>{f.title}</b> <span className="tiny muted">— {f.note}</span></span>
            </label>
          ))}
        </div>
      </div>

      <div className="row between" style={{ marginTop: 14 }}>
        <button className="btn btn-ghost" onClick={onClose}>Discard</button>
        <button className="btn btn-accent" onClick={() => onDump(selHooks, selFus)}>Dump {selHooks.length} hook{selHooks.length === 1 ? "" : "s"} + {selFus.length} idea{selFus.length === 1 ? "" : "s"} → Ideas</button>
      </div>
    </div>
  );
}
