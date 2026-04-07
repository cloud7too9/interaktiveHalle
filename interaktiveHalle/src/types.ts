export type BereichTyp = "bearbeitung" | "saegen" | "packstation" | "sonstiges";
export type AuftragsStatus = "offen" | "inBearbeitung" | "wartet" | "fertig";

export type BereichPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Bereich = {
  id: string;
  name: string;
  typ: BereichTyp;
  position: BereichPosition;
  beschreibung?: string;
  farbe?: string;
};

export type Auftrag = {
  id: string;
  nummer: string;
  status: AuftragsStatus;
  aktuellerBereichId?: string;
};

export type HalleData = {
  name: string;
  breite: number;
  hoehe: number;
};

export type Auswahl =
  | { typ: "bereich"; id: string }
  | { typ: "auftrag"; id: string }
  | { typ: "halle" }
  | null;

export type TypColors = Record<BereichTyp, string>;
export type StatusColors = Record<AuftragsStatus, string>;
