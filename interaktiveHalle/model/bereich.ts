export type BereichTyp =
  | "saegen"
  | "bearbeitung"
  | "packstation"
  | "sonstiges";

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
};