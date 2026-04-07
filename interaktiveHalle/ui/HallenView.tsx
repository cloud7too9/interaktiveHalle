import { useMemo, useState } from "react";
import type { Halle } from "../model/halle";
import type { Auftrag } from "../model/auftrag";
import { Bereich } from "./Bereich";
import { AuftragMarker } from "./AuftragMarker";
import { InfoPopup } from "./InfoPopup";
import { getSichtbareAuftraege } from "../lib/filter";

type HallenViewProps = {
  halle: Halle;
  auftraege: Auftrag[];
};

type Auswahl =
  | { typ: "bereich"; id: string }
  | { typ: "auftrag"; id: string }
  | null;

export function HallenView({ halle, auftraege }: HallenViewProps) {
  const [auswahl, setAuswahl] = useState<Auswahl>(null);

  const sichtbareAuftraege = useMemo(
    () => getSichtbareAuftraege(auftraege),
    [auftraege]
  );

  const popupDaten = useMemo(() => {
    if (!auswahl) return null;

    if (auswahl.typ === "bereich") {
      const bereich = halle.bereiche.find((eintrag) => eintrag.id === auswahl.id);
      if (!bereich) return null;

      return {
        titel: bereich.name,
        zeilen: [
          `Typ: ${bereich.typ}`,
          bereich.beschreibung ?? "Keine Zusatzinfo",
        ],
      };
    }

    if (auswahl.typ === "auftrag") {
      const auftrag = sichtbareAuftraege.find((eintrag) => eintrag.id === auswahl.id);
      if (!auftrag) return null;

      return {
        titel: `Auftrag ${auftrag.nummer}`,
        zeilen: [
          `Status: ${auftrag.status}`,
          `Bereich: ${auftrag.aktuellerBereichId ?? "nicht gesetzt"}`,
        ],
      };
    }

    return null;
  }, [auswahl, halle.bereiche, sichtbareAuftraege]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          position: "relative",
          width: halle.breite,
          height: halle.hoehe,
          background: "#0f0f0f",
          border: "2px solid #222",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {halle.bereiche.map((bereich) => (
          <Bereich
            key={bereich.id}
            bereich={bereich}
            aktiv={auswahl?.typ === "bereich" && auswahl.id === bereich.id}
            onClick={(bereichId) => setAuswahl({ typ: "bereich", id: bereichId })}
          />
        ))}

        {sichtbareAuftraege.map((auftrag) => {
          const bereich = halle.bereiche.find(
            (eintrag) => eintrag.id === auftrag.aktuellerBereichId
          );

          if (!bereich) return null;

          const x = bereich.position.x + bereich.position.width - 18;
          const y = bereich.position.y + 18;

          return (
            <AuftragMarker
              key={auftrag.id}
              auftrag={auftrag}
              x={x}
              y={y}
              aktiv={auswahl?.typ === "auftrag" && auswahl.id === auftrag.id}
              onClick={(auftragId) => setAuswahl({ typ: "auftrag", id: auftragId })}
            />
          );
        })}
      </div>

      {popupDaten ? (
        <InfoPopup
          titel={popupDaten.titel}
          zeilen={popupDaten.zeilen}
          onClose={() => setAuswahl(null)}
        />
      ) : (
        <InfoPopup
          titel="Info"
          zeilen={["Klicke auf einen Bereich oder einen Auftrag."]}
          onClose={() => undefined}
        />
      )}
    </div>
  );
}