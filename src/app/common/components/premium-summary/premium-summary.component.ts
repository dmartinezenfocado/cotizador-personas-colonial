import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface CoverageDef {
  name: string;
  kind: 'tier' | 'free';
  tiers?: number[];
  suffix?: string;
  ratePct?: number; 
}

@Component({
  selector: 'app-premium-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './premium-summary.component.html',
  styleUrls: ['./premium-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PremiumSummaryComponent {
  @Input({ required: true }) definitions!: readonly   CoverageDef[];
  @Input({ required: true }) coveragesFA!: FormArray;
  @Input() visibleTierIdxs: number[] = [0, 1, 2];
  @Input() iscPct = 16;
  @Input() baseTecnicaBruta = 0;
  @Input() enablePremium = true;

  private fg(i: number): FormGroup {
    return this.coveragesFA.at(i) as FormGroup;
  }
  private isSelected(i: number): boolean {
    return !!this.fg(i).get('selected')?.value;
  }
  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  get optionCount(): number {
    return Math.max(0, ...this.definitions.map(d => d.tiers?.length ?? 0), 3);
  }
  isOptionEnabled(opt: number): boolean {
    return this.visibleTierIdxs.includes(opt);
  }

  private sumaproducto(opt: number): number {
    let sum = 0;
    for (let i = 0; i < this.definitions.length; i++) {
      if (!this.isSelected(i)) continue;

      const def = this.definitions[i];
      const rate = (def.ratePct ?? 0) / 100;

      let base = 0;
      if (def.kind === 'tier') {
        base = def.tiers?.[opt] ?? 0;
      } else {
        const v = this.fg(i).get('amount')?.value;
        base = typeof v === 'number' ? v : Number(v) || 0;
      }
      sum += base * rate;
    }
    return sum;
  }

  net(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium) return 0;

    const suma = this.sumaproducto(opt);
    const baseTecNeta = this.baseTecnicaBruta / (1 + this.iscPct / 100);
    const neta = Math.max(suma, baseTecNeta);
    return this.round2(neta);
  }

  isc(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium) return 0;
    return this.round2(this.net(opt) * (this.iscPct / 100));
  }

  total(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium) return 0;
    return this.round2(this.net(opt) + this.isc(opt));
  }
}
