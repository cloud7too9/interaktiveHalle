import type { Auftrag } from "../model/auftrag";

export function getAuftraegeImBereich(
  auftraege: Auftrag[],
  bereichId: string
): Auftrag[] {
  return auftraege.filter(
    (auftrag) =>
      auftrag.aktuellerBereichId === bereichId &&
      auftrag.status !== "offen"
  );
}