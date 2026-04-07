import { useState, useMemo, useRef, useCallback } from "react";
import { T, PALETTE } from "./tokens";
import { typLabels, statusLabels, defaultTypColors, defaultStatusColors, initBereiche, initAuftraege } from "./data";
import type { Bereich, Auftrag, HalleData, Auswahl, TypColors, StatusColors, BereichTyp, AuftragsStatus } from "./types";

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Shared UI ───
const inputStyle: React.CSSProperties = { background: T.bg, border: `1px solid ${T.border}`, color: T.text, borderRadius: T.radiusSm, padding: "6px 10px", fontSize: 12, fontFamily: T.font, outline: "none", width: "100%", boxSizing: "border-box" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
const btnPrimary: React.CSSProperties = { background: T.accentDim, border: `1px solid ${T.accent}44`, color: T.accent, borderRadius: T.radiusSm, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font };
const btnDanger: React.CSSProperties = { ...btnPrimary, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.27)", color: "#f87171" };

function MiniLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, color: T.textMuted, fontFamily: T.mono, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 10 }}><MiniLabel>{label}</MiniLabel>{children}</div>;
}
function Tag({ color, children, small }: { color: string; children: React.ReactNode; small?: boolean }) {
  return <span style={{ background: `${color}18`, color, fontSize: small ? 9 : 10, fontFamily: T.mono, fontWeight: 600, padding: small ? "1px 6px" : "2px 8px", borderRadius: 99, border: `1px solid ${color}33`, whiteSpace: "nowrap" }}>{children}</span>;
}
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {PALETTE.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 24, height: 24, borderRadius: 6, background: c,
          border: value === c ? `2px solid ${T.text}` : "2px solid transparent",
          cursor: "pointer", outline: value === c ? `1px solid ${T.accent}` : "none", padding: 0,
        }} />
      ))}
    </div>
  );
}

// ─── SVG Components ───
function SvgBereich({ b, color, aktiv, count, onClick, onDragStart }: {
  b: Bereich; color: string; aktiv: boolean; count: number;
  onClick: (id: string) => void; onDragStart: (e: React.MouseEvent, id: string, resize?: boolean) => void;
}) {
  const p = b.position;
  const tl = typLabels[b.typ] || typLabels.sonstiges;
  return (
    <g style={{ cursor: "grab" }}
      onClick={(e) => { e.stopPropagation(); onClick(b.id); }}
      onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, b.id); }}>
      {aktiv && <rect x={p.x - 3} y={p.y - 3} width={p.width + 6} height={p.height + 6} rx={13} fill="none" stroke={T.accent} strokeWidth={1.5} opacity={0.3} style={{ filter: "url(#glow)" }} />}
      <rect x={p.x} y={p.y} width={p.width} height={p.height} rx={T.radius}
        fill={aktiv ? T.accentDim : "rgba(255,255,255,0.02)"}
        stroke={aktiv ? T.accent : `${color}44`} strokeWidth={aktiv ? 1.5 : 0.75} />
      <rect x={p.x} y={p.y + 12} width={3} height={24} rx={1.5} fill={color} opacity={aktiv ? 1 : 0.5} />
      <text x={p.x + 14} y={p.y + 26} fill={aktiv ? T.text : T.textSub} fontSize={12} fontWeight={600} fontFamily={T.font}>{b.name}</text>
      <text x={p.x + 14} y={p.y + 42} fill={color} fontSize={9.5} fontFamily={T.mono} opacity={0.7}>{tl.icon} {tl.label}</text>
      {count > 0 && (<>
        <rect x={p.x + p.width - 28} y={p.y + 8} width={20} height={18} rx={5} fill={T.accent} opacity={0.9} />
        <text x={p.x + p.width - 18} y={p.y + 21} fill={T.bg} fontSize={10} fontWeight={700} textAnchor="middle" fontFamily={T.mono}>{count}</text>
      </>)}
      <rect x={p.x + p.width - 14} y={p.y + p.height - 14} width={10} height={10} rx={2}
        fill={aktiv ? T.accent : T.textMuted} opacity={aktiv ? 0.5 : 0.2} style={{ cursor: "nwse-resize" }}
        onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, b.id, true); }} />
    </g>
  );
}

function SvgAuftrag({ a, cx, cy, aktiv, sColor, onClick }: {
  a: Auftrag; cx: number; cy: number; aktiv: boolean; sColor: string; onClick: (id: string) => void;
}) {
  return (
    <g onClick={(e) => { e.stopPropagation(); onClick(a.id); }} style={{ cursor: "pointer" }}>
      {aktiv && <circle cx={cx} cy={cy} r={19} fill="none" stroke={T.accent} strokeWidth={1} opacity={0.5} style={{ filter: "url(#glow)" }} />}
      <circle cx={cx} cy={cy} r={15} fill={`${sColor}1a`} stroke={`${sColor}88`} strokeWidth={aktiv ? 1.5 : 0.75} />
      <circle cx={cx - 8} cy={cy - 6} r={2.5} fill={sColor} opacity={0.8} />
      <text x={cx + 1} y={cy + 4} fill={T.text} fontSize={9} fontWeight={600} textAnchor="middle" fontFamily={T.mono}>{a.nummer}</text>
    </g>
  );
}

// ─── Editors ───
function BereichEditor({ b, typColors, onUpdate, onDelete }: {
  b: Bereich; typColors: TypColors; onUpdate: (b: Bereich) => void; onDelete: () => void;
}) {
  const color = b.farbe || typColors[b.typ] || "#6b6e7b";
  const tl = typLabels[b.typ] || typLabels.sonstiges;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Tag color={color}>{tl.icon} {tl.label}</Tag>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{b.name}</span>
      </div>
      <Field label="Name"><input style={inputStyle} value={b.name} onChange={e => onUpdate({ ...b, name: e.target.value })} /></Field>
      <Field label="Typ">
        <select style={selectStyle} value={b.typ} onChange={e => onUpdate({ ...b, typ: e.target.value as BereichTyp })}>
          {Object.entries(typLabels).map(([k, m]) => <option key={k} value={k}>{m.icon} {m.label}</option>)}
        </select>
      </Field>
      <Field label="Farbe (leer = Typ-Farbe)">
        <ColorPicker value={color} onChange={c => onUpdate({ ...b, farbe: c })} />
        {b.farbe && <button onClick={() => onUpdate({ ...b, farbe: undefined })} style={{ ...btnPrimary, marginTop: 6, fontSize: 10, padding: "3px 10px" }}>Typ-Farbe nutzen</button>}
      </Field>
      <Field label="Beschreibung"><input style={inputStyle} value={b.beschreibung || ""} onChange={e => onUpdate({ ...b, beschreibung: e.target.value })} /></Field>
      <MiniLabel>Position & Größe</MiniLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {(["x", "y", "width", "height"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, width: 14 }}>{key === "width" ? "B" : key === "height" ? "H" : key.toUpperCase()}</span>
            <input style={{ ...inputStyle, width: "100%", fontFamily: T.mono, fontSize: 11 }} type="number" value={b.position[key]}
              onChange={e => onUpdate({ ...b, position: { ...b.position, [key]: Math.max(0, +e.target.value) } })} />
          </div>
        ))}
      </div>
      <button style={btnDanger} onClick={onDelete}>Bereich löschen</button>
    </div>
  );
}

function AuftragEditor({ a, bereiche, statusColors, onUpdate, onDelete }: {
  a: Auftrag; bereiche: Bereich[]; statusColors: StatusColors; onUpdate: (a: Auftrag) => void; onDelete: () => void;
}) {
  const sc = statusColors[a.status] || "#444752";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Tag color={sc}>{statusLabels[a.status]}</Tag>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: T.mono }}>#{a.nummer}</span>
      </div>
      <Field label="Nummer"><input style={{ ...inputStyle, fontFamily: T.mono }} value={a.nummer} onChange={e => onUpdate({ ...a, nummer: e.target.value })} /></Field>
      <Field label="Status">
        <select style={selectStyle} value={a.status} onChange={e => onUpdate({ ...a, status: e.target.value as AuftragsStatus })}>
          {Object.entries(statusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </Field>
      <Field label="Bereich">
        <select style={selectStyle} value={a.aktuellerBereichId || ""} onChange={e => onUpdate({ ...a, aktuellerBereichId: e.target.value || undefined })}>
          <option value="">— Kein Bereich —</option>
          {bereiche.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Field>
      <button style={btnDanger} onClick={onDelete}>Auftrag löschen</button>
    </div>
  );
}

function HalleEditor({ halle, onUpdate, typColors, statusColors, onTypColor, onStatusColor }: {
  halle: HalleData; onUpdate: (h: HalleData) => void;
  typColors: TypColors; statusColors: StatusColors;
  onTypColor: (k: BereichTyp, c: string) => void; onStatusColor: (k: AuftragsStatus, c: string) => void;
}) {
  return (
    <div>
      <Field label="Hallenname"><input style={inputStyle} value={halle.name} onChange={e => onUpdate({ ...halle, name: e.target.value })} /></Field>
      <MiniLabel>Abmessungen</MiniLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {(["breite", "hoehe"] as const).map(k => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, width: 14 }}>{k === "breite" ? "B" : "H"}</span>
            <input style={{ ...inputStyle, fontFamily: T.mono, fontSize: 11 }} type="number" value={halle[k]}
              onChange={e => onUpdate({ ...halle, [k]: Math.max(100, +e.target.value) })} />
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginBottom: 14 }}>
        <MiniLabel>Typ-Farben</MiniLabel>
        <div style={{ display: "grid", gap: 10 }}>
          {(Object.entries(typLabels) as [BereichTyp, { label: string; icon: string }][]).map(([k, m]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.textSub, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: typColors[k] }} />{m.icon} {m.label}
              </div>
              <ColorPicker value={typColors[k]} onChange={c => onTypColor(k, c)} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        <MiniLabel>Status-Farben</MiniLabel>
        <div style={{ display: "grid", gap: 10 }}>
          {(Object.entries(statusLabels) as [AuftragsStatus, string][]).map(([k, l]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: T.textSub, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: statusColors[k] }} />{l}
              </div>
              <ColorPicker value={statusColors[k]} onChange={c => onStatusColor(k, c)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───
export default function App() {
  const [halleData, setHalleData] = useState<HalleData>({ name: "Werkhalle", breite: 420, hoehe: 980 });
  const [bereiche, setBereiche] = useState<Bereich[]>(initBereiche);
  const [auftraege, setAuftraege] = useState<Auftrag[]>(initAuftraege);
  const [typColors, setTypColors] = useState<TypColors>(defaultTypColors);
  const [statusColors, setStatusColors] = useState<StatusColors>(defaultStatusColors);
  const [auswahl, setAuswahl] = useState<Auswahl>(null);
  const [tab, setTab] = useState<"plan" | "auftraege" | "halle">("plan");
  const [planOpen, setPlanOpen] = useState(true);
  const [legendeOpen, setLegendeOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ bereichId: string; startMouse: { x: number; y: number }; startPos: Bereich["position"]; isResize: boolean } | null>(null);

  const getBereichColor = useCallback((b: Bereich) => b.farbe || typColors[b.typ] || "#6b6e7b", [typColors]);
  const sichtbar = useMemo(() => auftraege.filter(a => a.status !== "offen"), [auftraege]);

  const markers = useMemo(() => {
    const grouped: Record<string, Auftrag[]> = {};
    sichtbar.forEach(a => { if (a.aktuellerBereichId) { if (!grouped[a.aktuellerBereichId]) grouped[a.aktuellerBereichId] = []; grouped[a.aktuellerBereichId].push(a); } });
    const out: { a: Auftrag; cx: number; cy: number }[] = [];
    Object.entries(grouped).forEach(([bid, aufs]) => {
      const b = bereiche.find(e => e.id === bid);
      if (!b) return;
      const cx = b.position.x + b.position.width / 2;
      const by = b.position.y + b.position.height - 26;
      const w = aufs.length * 38;
      const sx = cx - w / 2 + 19;
      aufs.forEach((a, i) => out.push({ a, cx: sx + i * 38, cy: by }));
    });
    return out;
  }, [sichtbar, bereiche]);

  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.round(svgPt.x), y: Math.round(svgPt.y) };
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent, bereichId: string, isResize = false) => {
    e.preventDefault();
    const b = bereiche.find(x => x.id === bereichId);
    if (!b) return;
    const start = toSvgCoords(e.clientX, e.clientY);
    dragRef.current = { bereichId, startMouse: start, startPos: { ...b.position }, isResize };
    setAuswahl({ typ: "bereich", id: bereichId });
  }, [bereiche, toSvgCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { bereichId, startMouse, startPos, isResize } = dragRef.current;
    const cur = toSvgCoords(e.clientX, e.clientY);
    const dx = cur.x - startMouse.x, dy = cur.y - startMouse.y;
    setBereiche(prev => prev.map(b => {
      if (b.id !== bereichId) return b;
      if (isResize) return { ...b, position: { ...b.position, width: Math.max(60, startPos.width + dx), height: Math.max(40, startPos.height + dy) } };
      return { ...b, position: { ...b.position, x: Math.max(0, startPos.x + dx), y: Math.max(0, startPos.y + dy) } };
    }));
  }, [toSvgCoords]);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const addBereich = () => { const id = `bereich-${uid()}`; setBereiche(prev => [...prev, { id, name: "Neuer Bereich", typ: "sonstiges", position: { x: 20, y: 20, width: 140, height: 120 }, beschreibung: "" }]); setAuswahl({ typ: "bereich", id }); setTab("plan"); };
  const addAuftrag = () => { const id = `auftrag-${uid()}`; setAuftraege(prev => [...prev, { id, nummer: String(5000 + auftraege.length), status: "offen", aktuellerBereichId: bereiche[0]?.id }]); setAuswahl({ typ: "auftrag", id }); setTab("auftraege"); };
  const updateBereich = (u: Bereich) => setBereiche(prev => prev.map(b => b.id === u.id ? u : b));
  const deleteBereich = (id: string) => { setBereiche(prev => prev.filter(b => b.id !== id)); setAuswahl(null); };
  const updateAuftrag = (u: Auftrag) => setAuftraege(prev => prev.map(a => a.id === u.id ? u : a));
  const deleteAuftrag = (id: string) => { setAuftraege(prev => prev.filter(a => a.id !== id)); setAuswahl(null); };

  const SVG_W = halleData.breite + 16, SVG_H = halleData.hoehe + 16;

  let sideContent: React.ReactNode = null;
  if (auswahl?.typ === "bereich") {
    const b = bereiche.find(e => e.id === auswahl.id);
    if (b) sideContent = <BereichEditor b={b} typColors={typColors} onUpdate={updateBereich} onDelete={() => deleteBereich(b.id)} />;
  } else if (auswahl?.typ === "auftrag") {
    const a = auftraege.find(e => e.id === auswahl.id);
    if (a) sideContent = <AuftragEditor a={a} bereiche={bereiche} statusColors={statusColors} onUpdate={updateAuftrag} onDelete={() => deleteAuftrag(a.id)} />;
  } else if (tab === "halle") {
    sideContent = <HalleEditor halle={halleData} onUpdate={setHalleData} typColors={typColors} statusColors={statusColors}
      onTypColor={(k, c) => setTypColors(p => ({ ...p, [k]: c }))} onStatusColor={(k, c) => setStatusColors(p => ({ ...p, [k]: c }))} />;
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, color: T.text, backgroundImage: `radial-gradient(${T.border} 1px, transparent 1px)`, backgroundSize: "24px 24px" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentDim, border: `1px solid ${T.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: T.accent }}>⬡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Hallenplan Editor</div>
          <div style={{ fontSize: 10, color: T.textSub, fontFamily: T.mono }}>{halleData.name} · {bereiche.length} Bereiche · {auftraege.length} Aufträge</div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button style={btnPrimary} onClick={addBereich}>+ Bereich</button>
          <button style={btnPrimary} onClick={addAuftrag}>+ Auftrag</button>
        </div>
      </div>

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px", display: "flex", gap: 0 }}>
        {([{ key: "plan" as const, label: "Plan" }, { key: "auftraege" as const, label: `Aufträge (${auftraege.length})` }, { key: "halle" as const, label: "Halle" }]).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "halle") setAuswahl({ typ: "halle" }); else setAuswahl(null); }}
            style={{ background: "transparent", border: "none", borderBottom: tab === t.key ? `2px solid ${T.accent}` : "2px solid transparent", color: tab === t.key ? T.accent : T.textSub, padding: "10px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>{t.label}</button>
        ))}
      </div>

      <div style={{ overflow: "auto", height: "calc(100vh - 90px)", padding: 16 }}
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div style={{ maxWidth: 500, margin: "0 auto", display: "grid", gap: 12 }}>

          {tab === "auftraege" ? (
            <div style={{ display: "grid", gap: 8 }}>
              {auftraege.map(a => {
                const sc = statusColors[a.status] || "#444752";
                const bName = bereiche.find(e => e.id === a.aktuellerBereichId)?.name || "—";
                const isActive = auswahl?.typ === "auftrag" && auswahl.id === a.id;
                return (
                  <button key={a.id} onClick={() => setAuswahl({ typ: "auftrag", id: a.id })}
                    style={{ background: isActive ? T.accentDim : T.surface, border: `1px solid ${isActive ? T.accent + "66" : T.border}`, borderRadius: T.radius, padding: "10px 14px", cursor: "pointer", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 12, color: T.text }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: sc, flexShrink: 0 }} />
                    <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 13, color: T.accent }}>#{a.nummer}</span>
                    <Tag color={sc} small>{statusLabels[a.status]}</Tag>
                    <span style={{ fontSize: 11, color: T.textSub, marginLeft: "auto" }}>{bName}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
              <button onClick={() => setPlanOpen(p => !p)} style={{ width: "100%", background: T.surfaceAlt, border: "none", borderBottom: planOpen ? `1px solid ${T.border}` : "none", color: T.text, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: T.font, fontSize: 12, fontWeight: 600, textAlign: "left" as const }}>
                <span style={{ fontSize: 10, color: T.accent, display: "inline-block", transition: "transform 0.2s", transform: planOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                Hallenplan
                <span style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, marginLeft: "auto" }}>{halleData.breite}×{halleData.hoehe}</span>
              </button>
              {planOpen && (
                <div style={{ padding: 8 }}>
                  <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block" }} onClick={() => setAuswahl(null)}>
                    <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                    <rect width={SVG_W} height={SVG_H} rx={T.radius} fill={T.bg} />
                    {bereiche.map(b => {
                      const cnt = sichtbar.filter(a => a.aktuellerBereichId === b.id).length;
                      return <SvgBereich key={b.id} b={b} color={getBereichColor(b)} aktiv={auswahl?.typ === "bereich" && auswahl.id === b.id}
                        count={cnt} onClick={id => setAuswahl({ typ: "bereich", id })} onDragStart={handleDragStart} />;
                    })}
                    {markers.map(({ a, cx, cy }) => (
                      <SvgAuftrag key={a.id} a={a} cx={cx} cy={cy} sColor={statusColors[a.status] || "#444752"}
                        aktiv={auswahl?.typ === "auftrag" && auswahl.id === a.id} onClick={id => setAuswahl({ typ: "auftrag", id })} />
                    ))}
                  </svg>
                </div>
              )}
            </div>
          )}

          {sideContent ? (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <MiniLabel>{auswahl?.typ === "halle" ? "Hallen-Einstellungen" : auswahl?.typ === "bereich" ? "Bereich bearbeiten" : "Auftrag bearbeiten"}</MiniLabel>
                {auswahl?.typ !== "halle" && (
                  <button onClick={() => setAuswahl(null)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textSub, borderRadius: T.radiusSm, width: 24, height: 24, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                )}
              </div>
              {sideContent}
            </div>
          ) : (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: T.textMuted }}>Bereich oder Auftrag auswählen zum Bearbeiten.</div>
            </div>
          )}

          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
            <button onClick={() => setLegendeOpen(o => !o)} style={{ width: "100%", background: T.surfaceAlt, border: "none", borderBottom: legendeOpen ? `1px solid ${T.border}` : "none", color: T.text, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: T.font, fontSize: 12, fontWeight: 600 }}>
              <span style={{ fontSize: 10, color: T.accent, display: "inline-block", transition: "transform 0.2s", transform: legendeOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              Legende
            </button>
            {legendeOpen && (
              <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <MiniLabel>Bereiche</MiniLabel>
                  <div style={{ display: "grid", gap: 4 }}>
                    {(Object.entries(typLabels) as [BereichTyp, { label: string; icon: string }][]).map(([k, m]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: typColors[k], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: T.textSub }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <MiniLabel>Status</MiniLabel>
                  <div style={{ display: "grid", gap: 4 }}>
                    {(Object.entries(statusLabels) as [AuftragsStatus, string][]).map(([k, l]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: statusColors[k], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: T.textSub }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
