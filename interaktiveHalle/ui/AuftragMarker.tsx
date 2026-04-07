import type { Auftrag } from "../model/auftrag";

type AuftragMarkerProps = {
  auftrag: Auftrag;
  x: number;
  y: number;
  aktiv?: boolean;
  onClick: (auftragId: string) => void;
};

export function AuftragMarker({
  auftrag,
  x,
  y,
  aktiv = false,
  onClick,
}: AuftragMarkerProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(auftrag.id)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        border: aktiv ? "2px solid #ffd54a" : "1px solid #b39200",
        background: aktiv ? "#4a3b00" : "#2d2600",
        color: "#ffd54a",
        borderRadius: 999,
        padding: "4px 8px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {auftrag.nummer}
    </button>
  );
}