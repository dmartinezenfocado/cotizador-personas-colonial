export type CoverageKind = 'tier' | 'free';

export interface CoverageDef {
  name: string;
  kind: CoverageKind;
  tiers?: number[];  
  suffix?: string;  
  ratePct: number;  
}
