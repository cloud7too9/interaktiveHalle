import type { Bereich, Auftrag, TypColors, StatusColors, BereichTyp, AuftragsStatus } from "./types";

export const typLabels: Record<BereichTyp, { label: string; icon: string }> = {
  bearbeitung: { label: "Bearbeitung", icon: "⚙" },
  saegen: { label: "Sägen", icon: "◎" },
  packstation: { label: "Packstation", icon: "▦" },
  sonstiges: { label: "Sonstiges", icon: "…" },
};

export const statusLabels: Record<AuftragsStatus, string> = {
  offen: "Offen",
  inBearbeitung: "In Bearbeitung",
  wartet: "Wartet",
  fertig: "Fertig",
};

export const defaultTypColors: TypColors = {
  bearbeitung: "#818cf8",
  saegen: "#fb923c",
  packstation: "#34d399",
  sonstiges: "#6b6e7b",
};

export const defaultStatusColors: StatusColors = {
  offen: "#444752",
  inBearbeitung: "#fb923c",
  wartet: "#f87171",
  fertig: "#34d399",
};

export const initBereiche: Bereich[] = [
  { id: "bearbeitung-3", name: "Bearbeitung 3", typ: "bearbeitung", position: { x: 16, y: 16, width: 160, height: 180 }, beschreibung: "Skizzenbereich 7" },
  { id: "bearbeitung-2", name: "Bearbeitung 2", typ: "bearbeitung", position: { x: 176, y: 16, width: 228, height: 300 }, beschreibung: "Skizzenbereich 6" },
  { id: "bearbeitung-1", name: "Bearbeitung 1", typ: "bearbeitung", position: { x: 16, y: 196, width: 160, height: 420 }, beschreibung: "Skizzenbereich 5" },
  { id: "saege-1", name: "Säge 1", typ: "saegen", position: { x: 176, y: 316, width: 228, height: 300 }, beschreibung: "Skizzenbereich 1" },
  { id: "saege-3", name: "Säge 3", typ: "saegen", position: { x: 16, y: 650, width: 194, height: 180 }, beschreibung: "Skizzenbereich 3" },
  { id: "saege-2", name: "Säge 2", typ: "saegen", position: { x: 210, y: 650, width: 194, height: 180 }, beschreibung: "Skizzenbereich 2" },
  { id: "packstation-1", name: "Packstation", typ: "packstation", position: { x: 120, y: 830, width: 180, height: 120 }, beschreibung: "Skizzenbereich 4" },
];

export const initAuftraege: Auftrag[] = [
  { id: "a1", nummer: "4711", status: "wartet", aktuellerBereichId: "saege-2" },
  { id: "a2", nummer: "4712", status: "inBearbeitung", aktuellerBereichId: "bearbeitung-1" },
  { id: "a3", nummer: "4713", status: "fertig", aktuellerBereichId: "packstation-1" },
  { id: "a4", nummer: "4714", status: "offen", aktuellerBereichId: "saege-1" },
];
