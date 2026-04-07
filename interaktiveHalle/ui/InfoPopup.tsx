type InfoPopupProps = {
  titel: string;
  zeilen: string[];
  onClose: () => void;
};

export function InfoPopup({ titel, zeilen, onClose }: InfoPopupProps) {
  return (
    <aside
      style={{
        width: 260,
        background: "#121212",
        color: "#fff",
        border: "1px solid #333",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <strong>{titel}</strong>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          X
        </button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {zeilen.map((zeile) => (
          <div key={zeile} style={{ fontSize: 14, opacity: 0.9 }}>
            {zeile}
          </div>
        ))}
      </div>
    </aside>
  );
}