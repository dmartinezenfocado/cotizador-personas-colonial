import { FormArray } from "@angular/forms";
import { CoverageDef } from "./coverage-def.model";

export interface PremiumCalcContext {
  definitions: readonly CoverageDef[];
  coveragesFA: FormArray;
  iscPct: number;
  baseTecnicaBruta: number;
  visibleTierIdxs: number[];
  enablePremium: boolean;
  rateDivisor: number;
  extra: any; 
}