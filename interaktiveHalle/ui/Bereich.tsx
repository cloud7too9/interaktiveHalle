import type { Bereich as BereichTyp } from "../model/bereich";

type BereichProps = {
  bereich: BereichTyp;
  aktiv?: boolean;
  onClick: (bereichId: string) => void;
};

export function Bereich({ bereich, aktiv = false, onClick }: BereichProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(bereich.id)}
      style={{
        position: "absolute",
        left: bereich.position.x,
        top: bereich.position.y,
        width: bereich.position.width,
        height: bereich.position.height,
        border: aktiv ? "2px solid #00e5ff" : "1px solid #444",
        background: aktiv ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.06)",
        color: "#fff",
        borderRadius: 8,
        padding: 8,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <strong>{bereich.name}</strong>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{bereich.typ}</div>
    </button>
  );
}