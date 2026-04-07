import type { Halle } from "../model/halle";
import type { Auftrag } from "../model/auftrag";

export const halle: Halle = {
  id: "halle-1",
  name: "Werkhalle",
  breite: 420,
  hoehe: 980,
  bereiche: [
    {
      id: "bearbeitung-3",
      name: "Bearbeitung 3",
      typ: "bearbeitung",
      position: { x: 16, y: 16, width: 160, height: 180 },
      beschreibung: "Skizzenbereich 7",
    },
    {
      id: "bearbeitung-2",
      name: "Bearbeitung 2",
      typ: "bearbeitung",
      position: { x: 176, y: 16, width: 228, height: 300 },
      beschreibung: "Skizzenbereich 6",
    },
    {
      id: "bearbeitung-1",
      name: "Bearbeitung 1",
      typ: "bearbeitung",
      position: { x: 16, y: 196, width: 160, height: 420 },
      beschreibung: "Skizzenbereich 5",
    },
    {
      id: "saege-1",
      name: "Säge 1",
      typ: "saegen",
      position: { x: 176, y: 316, width: 228, height: 300 },
      beschreibung: "Skizzenbereich 1",
    },
    {
      id: "saege-3",
      name: "Säge 3",
      typ: "saegen",
      position: { x: 16, y: 650, width: 194, height: 180 },
      beschreibung: "Skizzenbereich 3",
    },
    {
      id: "saege-2",
      name: "Säge 2",
      typ: "saegen",
      position: { x: 210, y: 650, width: 194, height: 180 },
      beschreibung: "Skizzenbereich 2",
    },
    {
      id: "packstation-1",
      name: "Packstation",
      typ: "packstation",
      position: { x: 120, y: 830, width: 180, height: 120 },
      beschreibung: "Skizzenbereich 4",
    },
  ],
  maschinen: [],
};

export const auftraege: Auftrag[] = [
  {
    id: "auftrag-1",
    nummer: "4711",
    status: "wartet",
    aktuellerBereichId: "saege-2",
  },
  {
    id: "auftrag-2",
    nummer: "4712",
    status: "inBearbeitung",
    aktuellerBereichId: "bearbeitung-1",
  },
  {
    id: "auftrag-3",
    nummer: "4713",
    status: "fertig",
    aktuellerBereichId: "packstation-1",
  },
  {
    id: "auftrag-4",
    nummer: "4714",
    status: "offen",
    aktuellerBereichId: "saege-1",
  },
];