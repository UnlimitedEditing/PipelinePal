import { useState, useEffect, useCallback } from "react";

const PHASES = ["Concept", "Pre-Production", "Production", "Post-Production"];
const PHASE_SUBTITLES = ["Greenlight gate", "Script-lock phase", "Execute the shot list", "Assembly"];

const EMPTY_PROJECT = (title = "Untitled Project") => ({
  id: Date.now().toString(),
  title,
  created: new Date().toISOString(),
  currentPhase: 0,
  gates: [false, false, false, false],
  concept: { hook: "", premise: "", whyNow: "", runtime: "60", approved: false },
  beatSheet: [],
  script: { content: "", locked: false, lockedAt: null },
  shotList: [],
  audioSpotting: { musicCues: "", sfxList: "", dialogueCount: "" },
  productionNotes: "",
  postNotes: "",
});

const STYLES = {
  app: { fontFamily: "var(--font-mono, monospace)", padding: "1rem", maxWidth: 960, margin: "0 auto" },
  card: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
  badge: (color) => ({ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `var(--color-background-${color})`, color: `var(--color-text-${color})`, display: "inline-block" }),
  input: { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--color-text-primary)", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono, monospace)" },
  textarea: { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "10px", fontSize: 13, color: "var(--color-text-primary)", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono, monospace)", resize: "vertical" },
  btn: (variant = "default") => {
    const map = {
      default: { background: "transparent", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" },
      primary: { background: "var(--color-background-info)", border: "none", color: "var(--color-text-info)" },
      danger: { background: "var(--color-background-danger)", border: "none", color: "var(--color-text-danger)" },
      success: { background: "var(--color-background-success)", border: "none", color: "var(--color-text-success)" },
      warning: { background: "var(--color-background-warning)", border: "none", color: "var(--color-text-warning)" },
    };
    return { ...map[variant], padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono, monospace)" };
  },
  label: { fontSize: 11, color: "var(--color-text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 4 },
  h2: { fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" },
  h3: { fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 12px" },
  muted: { fontSize: 12, color: "var(--color-text-secondary)" },
  row: { display: "flex", gap: 8, alignItems: "center" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  phaseBar: { display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--color-border-tertiary)", marginBottom: 20 },
};

function PhaseBar({ current, gates }) {
  return (
    <div style={STYLES.phaseBar}>
      {PHASES.map((p, i) => {
        const done = gates[i];
        const active = i === current;
        const locked = i > current;
        return (
          <div key={p} style={{
            flex: 1, padding: "8px 10px", textAlign: "center", fontSize: 11,
            background: done ? "var(--color-background-success)" : active ? "var(--color-background-info)" : "var(--color-background-secondary)",
            color: done ? "var(--color-text-success)" : active ? "var(--color-text-info)" : "var(--color-text-tertiary)",
            borderRight: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none",
          }}>
            <div style={{ fontWeight: 500 }}>{done ? "✓ " : ""}{p}</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>{PHASE_SUBTITLES[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

function ConceptPhase({ data, onChange, onGate }) {
  const c = data.concept;
  const update = (k, v) => onChange({ ...data, concept: { ...c, [k]: v } });
  const allFilled = c.hook && c.premise && c.whyNow && c.runtime;
  return (
    <div>
      <div style={{ ...STYLES.card, borderLeft: "3px solid var(--color-border-info)" }}>
        <p style={STYLES.h3}>The 1-Pager</p>
        <p style={{ ...STYLES.muted, marginBottom: 16 }}>Complete all fields before advancing. Be ruthless — if you can't answer these, the project is not ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={STYLES.label}>Hook (15 seconds)</label>
            <input style={STYLES.input} placeholder="One line that sells the concept" value={c.hook} onChange={e => update("hook", e.target.value)} />
          </div>
          <div>
            <label style={STYLES.label}>Runtime target</label>
            <select style={STYLES.input} value={c.runtime} onChange={e => update("runtime", e.target.value)}>
              {["30s", "60s", "2min", "5min", "10min+"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={STYLES.label}>Premise (2 sentences max)</label>
          <textarea style={{ ...STYLES.textarea, minHeight: 60 }} placeholder="What happens. Why it matters." value={c.premise} onChange={e => update("premise", e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={STYLES.label}>Why Now?</label>
          <textarea style={{ ...STYLES.textarea, minHeight: 60 }} placeholder="Trend, timing, or searchability justification" value={c.whyNow} onChange={e => update("whyNow", e.target.value)} />
        </div>
        <div style={{ ...STYLES.row, justifyContent: "space-between" }}>
          <span style={STYLES.muted}>{allFilled ? "All fields complete" : "Fill all fields to unlock gate"}</span>
          {!data.gates[0] && (
            <button style={STYLES.btn(allFilled ? "success" : "default")} disabled={!allFilled} onClick={() => allFilled && onGate(0)}>
              Greenlight this project →
            </button>
          )}
          {data.gates[0] && <span style={STYLES.badge("success")}>GREENLIGHTED</span>}
        </div>
      </div>
    </div>
  );
}

function BeatSheetEditor({ beats, onChange }) {
  const [newText, setNewText] = useState("");
  const add = () => {
    if (!newText.trim()) return;
    onChange([...beats, { id: Date.now().toString(), text: newText.trim(), done: false }]);
    setNewText("");
  };
  const toggle = (id) => onChange(beats.map(b => b.id === id ? { ...b, done: !b.done } : b));
  const remove = (id) => onChange(beats.filter(b => b.id !== id));
  const move = (id, dir) => {
    const idx = beats.findIndex(b => b.id === id);
    if (idx + dir < 0 || idx + dir >= beats.length) return;
    const arr = [...beats];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    onChange(arr);
  };
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {beats.map((b, i) => (
          <div key={b.id} style={{ ...STYLES.row, marginBottom: 6, background: "var(--color-background-secondary)", padding: "6px 10px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", minWidth: 20 }}>{i + 1}.</span>
            <input type="checkbox" checked={b.done} onChange={() => toggle(b.id)} style={{ cursor: "pointer" }} />
            <input style={{ ...STYLES.input, flex: 1, background: "transparent", border: "none", padding: "2px 6px", textDecoration: b.done ? "line-through" : "none", opacity: b.done ? 0.5 : 1 }}
              value={b.text} onChange={e => onChange(beats.map(x => x.id === b.id ? { ...x, text: e.target.value } : x))} />
            <button style={{ ...STYLES.btn(), padding: "2px 8px", fontSize: 12 }} onClick={() => move(b.id, -1)}>↑</button>
            <button style={{ ...STYLES.btn(), padding: "2px 8px", fontSize: 12 }} onClick={() => move(b.id, 1)}>↓</button>
            <button style={{ ...STYLES.btn("danger"), padding: "2px 8px", fontSize: 12 }} onClick={() => remove(b.id)}>×</button>
          </div>
        ))}
      </div>
      <div style={STYLES.row}>
        <input style={{ ...STYLES.input, flex: 1 }} placeholder="Add beat: This happens, then this..." value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <button style={STYLES.btn("primary")} onClick={add}>+ Add</button>
      </div>
      <p style={{ ...STYLES.muted, marginTop: 6 }}>Target: 15–20 beats. Action only, no dialogue.</p>
    </div>
  );
}

function ShotListEditor({ shots, onChange }) {
  const [form, setForm] = useState({ scene: "", shot: "", scriptRef: "", visualRef: "", genNotes: "" });
  const add = () => {
    if (!form.scene || !form.shot) return;
    onChange([...shots, { id: Date.now().toString(), ...form, status: "pending" }]);
    setForm({ scene: "", shot: "", scriptRef: "", visualRef: "", genNotes: "" });
  };
  const setStatus = (id, status) => onChange(shots.map(s => s.id === id ? { ...s, status } : s));
  const remove = (id) => onChange(shots.filter(s => s.id !== id));
  const STATUS_COLORS = { pending: "default", generating: "warning", done: "success", flagged: "danger" };
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 12 }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Scene", "Shot", "Script ref", "Visual ref", "Gen notes", "Status", ""].map(h => (
                <th key={h} style={{ ...STYLES.label, padding: "4px 8px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shots.map(s => (
              <tr key={s.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["scene", "shot", "scriptRef", "visualRef", "genNotes"].map(f => (
                  <td key={f} style={{ padding: "4px 8px" }}>
                    <input style={{ ...STYLES.input, minWidth: f === "genNotes" ? 140 : 70, padding: "3px 6px" }} value={s[f]} onChange={e => onChange(shots.map(x => x.id === s.id ? { ...x, [f]: e.target.value } : x))} />
                  </td>
                ))}
                <td style={{ padding: "4px 8px" }}>
                  <select style={{ ...STYLES.input, padding: "3px 6px" }} value={s.status} onChange={e => setStatus(s.id, e.target.value)}>
                    {["pending", "generating", "done", "flagged"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <button style={{ ...STYLES.btn("danger"), padding: "2px 8px" }} onClick={() => remove(s.id)}>×</button>
                </td>
              </tr>
            ))}
            {shots.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 12 }}>No shots added. Add shots from your beat sheet above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr auto", gap: 6 }}>
        {["scene", "shot", "scriptRef", "visualRef", "genNotes"].map(f => (
          <input key={f} style={STYLES.input} placeholder={f === "scene" ? "Scene #" : f === "shot" ? "Shot #" : f === "scriptRef" ? "Script ref" : f === "visualRef" ? "Visual ref" : "Gen notes"} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
        ))}
        <button style={STYLES.btn("primary")} onClick={add}>+ Add shot</button>
      </div>
      <div style={{ ...STYLES.row, marginTop: 8, gap: 16 }}>
        {["pending", "generating", "done", "flagged"].map(st => (
          <span key={st} style={STYLES.muted}>{st}: <strong>{shots.filter(s => s.status === st).length}</strong></span>
        ))}
        <span style={STYLES.muted}>total: <strong>{shots.length}</strong></span>
      </div>
    </div>
  );
}

function PreProductionPhase({ data, onChange, onGate }) {
  const update = (k, v) => onChange({ ...data, [k]: v });
  const updateScript = (k, v) => onChange({ ...data, script: { ...data.script, [k]: v } });
  const updateAudio = (k, v) => onChange({ ...data, audioSpotting: { ...data.audioSpotting, [k]: v } });
  const [lockConfirm, setLockConfirm] = useState(false);

  const handleLock = () => {
    if (!lockConfirm) { setLockConfirm(true); return; }
    onChange({ ...data, script: { ...data.script, locked: true, lockedAt: new Date().toISOString() } });
    setLockConfirm(false);
  };

  const canGate = data.beatSheet.length >= 5 && data.script.locked && data.shotList.length >= 1;

  return (
    <div>
      <div style={STYLES.card}>
        <p style={STYLES.h3}>Beat sheet</p>
        <BeatSheetEditor beats={data.beatSheet} onChange={v => update("beatSheet", v)} />
      </div>

      <div style={STYLES.card}>
        <div style={{ ...STYLES.row, justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ ...STYLES.h3, margin: 0 }}>Script</p>
          <div style={STYLES.row}>
            {data.script.locked
              ? <span style={STYLES.badge("success")}>LOCKED — {new Date(data.script.lockedAt).toLocaleDateString()}</span>
              : lockConfirm
                ? <>
                    <span style={{ fontSize: 12, color: "var(--color-text-danger)" }}>No changes after this. Sure?</span>
                    <button style={STYLES.btn("danger")} onClick={handleLock}>Yes, lock script</button>
                    <button style={STYLES.btn()} onClick={() => setLockConfirm(false)}>Cancel</button>
                  </>
                : <button style={STYLES.btn("warning")} onClick={handleLock}>Lock Script</button>
            }
          </div>
        </div>
        {data.script.locked
          ? <pre style={{ ...STYLES.input, whiteSpace: "pre-wrap", minHeight: 200, opacity: 0.8, pointerEvents: "none" }}>{data.script.content || "(empty script)"}</pre>
          : <textarea style={{ ...STYLES.textarea, minHeight: 240 }} placeholder={"[INT. LOCATION - TIME]\n[SHOT TYPE]\nAction description...\n\nDIALOGUE\nCharacter: Line here\n\n[SFX: sound description]"} value={data.script.content} onChange={e => updateScript("content", e.target.value)} />
        }
        {!data.script.locked && <p style={{ ...STYLES.muted, marginTop: 6 }}>Format: [INT/EXT. LOCATION - TIME] + [SHOT TYPE] + action. Lock when done. No changes after lock.</p>}
      </div>

      <div style={STYLES.card}>
        <p style={STYLES.h3}>Shot list</p>
        <p style={{ ...STYLES.muted, marginBottom: 12 }}>This is your prompt source for generation. Each row = one generation task.</p>
        <ShotListEditor shots={data.shotList} onChange={v => update("shotList", v)} />
      </div>

      <div style={STYLES.card}>
        <p style={STYLES.h3}>Audio spotting</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={STYLES.label}>Music cues</label>
            <textarea style={{ ...STYLES.textarea, minHeight: 80 }} placeholder="Scene 1: ambient drone..." value={data.audioSpotting.musicCues} onChange={e => updateAudio("musicCues", e.target.value)} />
          </div>
          <div>
            <label style={STYLES.label}>SFX list</label>
            <textarea style={{ ...STYLES.textarea, minHeight: 80 }} placeholder="Wind, footsteps, door..." value={data.audioSpotting.sfxList} onChange={e => updateAudio("sfxList", e.target.value)} />
          </div>
          <div>
            <label style={STYLES.label}>Dialogue count / notes</label>
            <textarea style={{ ...STYLES.textarea, minHeight: 80 }} placeholder="3 characters, VO only..." value={data.audioSpotting.dialogueCount} onChange={e => updateAudio("dialogueCount", e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ ...STYLES.row, justifyContent: "space-between", padding: "8px 0" }}>
        <div style={STYLES.muted}>
          Requires: {data.beatSheet.length >= 5 ? "✓" : "✗"} beat sheet (5+) &nbsp;
          {data.script.locked ? "✓" : "✗"} locked script &nbsp;
          {data.shotList.length >= 1 ? "✓" : "✗"} shot list
        </div>
        {!data.gates[1] && (
          <button style={STYLES.btn(canGate ? "success" : "default")} disabled={!canGate} onClick={() => canGate && onGate(1)}>
            Pre-production complete →
          </button>
        )}
        {data.gates[1] && <span style={STYLES.badge("success")}>PRE-PRODUCTION LOCKED</span>}
      </div>
    </div>
  );
}

function ProductionPhase({ data, onChange, onGate }) {
  const completedShots = data.shotList.filter(s => s.status === "done").length;
  const totalShots = data.shotList.length;
  const pct = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;
  const update = (k, v) => onChange({ ...data, [k]: v });
  const updateShot = (id, st) => update("shotList", data.shotList.map(s => s.id === id ? { ...s, status: st } : s));
  const canGate = totalShots > 0 && completedShots === totalShots;

  return (
    <div>
      <div style={{ ...STYLES.card, borderLeft: "3px solid var(--color-border-warning)" }}>
        <p style={{ ...STYLES.muted, marginBottom: 0 }}>RULE: Execute the shot list. No creative decisions here. The script is the boss. No "what ifs".</p>
      </div>

      <div style={STYLES.card}>
        <div style={{ ...STYLES.row, justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ ...STYLES.h3, margin: 0 }}>Shot progress</p>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{completedShots}/{totalShots} shots — {pct}%</span>
        </div>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 4, height: 6, marginBottom: 16 }}>
          <div style={{ background: "var(--color-background-success)", width: `${pct}%`, height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Scene", "Shot", "Script ref", "Visual ref", "Gen notes", "Status"].map(h => (
                  <th key={h} style={{ ...STYLES.label, padding: "4px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.shotList.map(s => (
                <tr key={s.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", opacity: s.status === "done" ? 0.6 : 1 }}>
                  <td style={{ padding: "4px 8px" }}>{s.scene}</td>
                  <td style={{ padding: "4px 8px" }}>{s.shot}</td>
                  <td style={{ padding: "4px 8px", color: "var(--color-text-secondary)" }}>{s.scriptRef}</td>
                  <td style={{ padding: "4px 8px", color: "var(--color-text-secondary)" }}>{s.visualRef}</td>
                  <td style={{ padding: "4px 8px", maxWidth: 180 }}>{s.genNotes}</td>
                  <td style={{ padding: "4px 8px" }}>
                    <select style={{ ...STYLES.input, padding: "3px 6px", fontSize: 11 }} value={s.status} onChange={e => updateShot(s.id, e.target.value)}>
                      {["pending", "generating", "done", "flagged"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.shotList.filter(s => s.status === "flagged").length > 0 && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--color-background-danger)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-danger)" }}>
              {data.shotList.filter(s => s.status === "flagged").length} flagged shot(s) — regenerate with adjusted prompt, or cut in edit. Do not alter the script.
            </span>
          </div>
        )}
      </div>

      <div style={STYLES.card}>
        <p style={STYLES.h3}>Production notes</p>
        <textarea style={{ ...STYLES.textarea, minHeight: 100 }} placeholder="Daily review log, retake reasons, version notes..." value={data.productionNotes} onChange={e => update("productionNotes", e.target.value)} />
        <p style={{ ...STYLES.muted, marginTop: 6 }}>File naming convention: SCENE##_SHOT##_V###.ext (e.g. 03_05_v002.png)</p>
      </div>

      <div style={{ ...STYLES.row, justifyContent: "space-between", padding: "8px 0" }}>
        <span style={STYLES.muted}>{canGate ? "All shots complete. Ready for post." : `${totalShots - completedShots} shots remaining`}</span>
        {!data.gates[2] && (
          <button style={STYLES.btn(canGate ? "success" : "default")} disabled={!canGate} onClick={() => canGate && onGate(2)}>
            Production complete →
          </button>
        )}
        {data.gates[2] && <span style={STYLES.badge("success")}>PRODUCTION LOCKED</span>}
      </div>
    </div>
  );
}

function PostPhase({ data, onChange, onGate }) {
  const update = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <div style={STYLES.card}>
        <p style={STYLES.h3}>Post-production notes</p>
        <textarea style={{ ...STYLES.textarea, minHeight: 160 }} placeholder={"Assembly notes, colour grade, sound mix, export settings, publish checklist..."} value={data.postNotes} onChange={e => update("postNotes", e.target.value)} />
      </div>
      <div style={{ ...STYLES.card, background: "var(--color-background-secondary)" }}>
        <p style={STYLES.h3}>Project summary</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            ["Runtime target", data.concept.runtime],
            ["Beat sheet", `${data.beatSheet.length} beats`],
            ["Shots total", `${data.shotList.length}`],
            ["Script locked", data.script.lockedAt ? new Date(data.script.lockedAt).toLocaleDateString() : "—"],
            ["Audio cues", data.audioSpotting.musicCues ? "Yes" : "—"],
            ["SFX list", data.audioSpotting.sfxList ? "Yes" : "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "var(--color-background-primary)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ ...STYLES.label, marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ ...STYLES.row, justifyContent: "flex-end" }}>
          {!data.gates[3] && (
            <button style={STYLES.btn("success")} onClick={() => onGate(3)}>Mark project complete</button>
          )}
          {data.gates[3] && <span style={STYLES.badge("success")}>PROJECT COMPLETE</span>}
        </div>
      </div>
    </div>
  );
}

export default function PipelineApp() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("pipeline_projects");
        if (res?.value) setProjects(JSON.parse(res.value));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (updated) => {
    setProjects(updated);
    try { await window.storage.set("pipeline_projects", JSON.stringify(updated)); } catch {}
  }, []);

  const createProject = () => {
    const t = newTitle.trim() || "Untitled Project";
    const p = EMPTY_PROJECT(t);
    const updated = [p, ...projects];
    save(updated);
    setActiveId(p.id);
    setActivePhase(0);
    setNewTitle("");
  };

  const updateProject = (proj) => {
    save(projects.map(p => p.id === proj.id ? proj : p));
  };

  const deleteProject = (id) => {
    save(projects.filter(p => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleGate = (proj, gateIdx) => {
    const updated = {
      ...proj,
      gates: proj.gates.map((g, i) => i === gateIdx ? true : g),
      currentPhase: Math.min(gateIdx + 1, 3),
    };
    updateProject(updated);
    setActivePhase(Math.min(gateIdx + 1, 3));
  };

  const active = projects.find(p => p.id === activeId);

  if (loading) return <div style={{ padding: "2rem", color: "var(--color-text-secondary)", fontSize: 13 }}>Loading...</div>;

  if (!activeId) {
    return (
      <div style={STYLES.app}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...STYLES.row, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>Production Pipeline</p>
              <p style={STYLES.muted}>Script-lock before pixel-lock.</p>
            </div>
          </div>
          <div style={{ ...STYLES.row, marginBottom: 20 }}>
            <input style={{ ...STYLES.input, flex: 1 }} placeholder="New project title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && createProject()} />
            <button style={STYLES.btn("primary")} onClick={createProject}>+ New Project</button>
          </div>
          {projects.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-tertiary)", fontSize: 13 }}>
              No projects yet. Start your first one above.
            </div>
          )}
          {projects.map(p => {
            const completedGates = p.gates.filter(Boolean).length;
            const pct = Math.round((completedGates / 4) * 100);
            return (
              <div key={p.id} style={{ ...STYLES.card, cursor: "pointer" }} onClick={() => { setActiveId(p.id); setActivePhase(p.currentPhase); }}>
                <div style={{ ...STYLES.row, justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...STYLES.row, gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{p.title}</span>
                      {p.gates[3] && <span style={STYLES.badge("success")}>COMPLETE</span>}
                      {!p.gates[3] && <span style={STYLES.badge("default")}>{PHASES[p.currentPhase]}</span>}
                    </div>
                    <div style={{ ...STYLES.row, gap: 16 }}>
                      <span style={STYLES.muted}>{new Date(p.created).toLocaleDateString()}</span>
                      <span style={STYLES.muted}>{p.shotList.length} shots</span>
                      <span style={STYLES.muted}>{p.beatSheet.length} beats</span>
                      <span style={STYLES.muted}>{pct}% through pipeline</span>
                    </div>
                  </div>
                  <button style={{ ...STYLES.btn("danger"), marginLeft: 8 }} onClick={e => { e.stopPropagation(); deleteProject(p.id); }}>Delete</button>
                </div>
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 3, height: 3, marginTop: 10 }}>
                  <div style={{ background: "var(--color-background-success)", width: `${pct}%`, height: "100%", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.app}>
      <div style={{ ...STYLES.row, justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <button style={{ ...STYLES.btn(), fontSize: 12, padding: "4px 10px", marginBottom: 6 }} onClick={() => setActiveId(null)}>← All projects</button>
          <input
            style={{ ...STYLES.input, fontSize: 17, fontWeight: 500, padding: "4px 0", background: "transparent", border: "none", borderBottom: "0.5px solid var(--color-border-tertiary)", borderRadius: 0, width: "auto", minWidth: 200 }}
            value={active.title}
            onChange={e => updateProject({ ...active, title: e.target.value })}
          />
        </div>
        <span style={STYLES.muted}>{active.script.locked ? "Script locked" : "Script open"}</span>
      </div>

      <PhaseBar current={active.currentPhase} gates={active.gates} />

      <div style={{ ...STYLES.row, gap: 0, marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--color-border-tertiary)" }}>
        {PHASES.map((ph, i) => {
          const unlocked = i <= active.currentPhase || active.gates[i - 1];
          return (
            <button key={ph} disabled={!unlocked} style={{ flex: 1, padding: "6px", fontSize: 12, cursor: unlocked ? "pointer" : "not-allowed", background: activePhase === i ? "var(--color-background-info)" : "transparent", color: activePhase === i ? "var(--color-text-info)" : unlocked ? "var(--color-text-primary)" : "var(--color-text-tertiary)", border: "none", borderRight: i < 3 ? "0.5px solid var(--color-border-tertiary)" : "none", fontFamily: "var(--font-mono, monospace)" }} onClick={() => unlocked && setActivePhase(i)}>
              {PHASES[i]}
            </button>
          );
        })}
      </div>

      {activePhase === 0 && <ConceptPhase data={active} onChange={updateProject} onGate={(i) => handleGate(active, i)} />}
      {activePhase === 1 && <PreProductionPhase data={active} onChange={updateProject} onGate={(i) => handleGate(active, i)} />}
      {activePhase === 2 && <ProductionPhase data={active} onChange={updateProject} onGate={(i) => handleGate(active, i)} />}
      {activePhase === 3 && <PostPhase data={active} onChange={updateProject} onGate={(i) => handleGate(active, i)} />}
    </div>
  );
}
