import type { Auftrag } from "../model/auftrag";

export function getSichtbareAuftraege(auftraege: Auftrag[]): Auftrag[] {
  return auftraege.filter((auftrag) => auftrag.status !== "offen");
}