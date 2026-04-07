export type AuftragsStatus =
  | "offen"
  | "inBearbeitung"
  | "wartet"
  | "fertig";

export type Auftrag = {
  id: string;
  nummer: string;
  status: AuftragsStatus;
  aktuellerBereichId?: string;
};