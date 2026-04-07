import type { Bereich } from "./bereich";
import type { Maschine } from "./maschine";

export type Halle = {
  id: string;
  name: string;
  breite: number;
  hoehe: number;
  bereiche: Bereich[];
  maschinen: Maschine[];
};