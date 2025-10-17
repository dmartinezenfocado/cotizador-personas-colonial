import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CoverageDef } from '../../../core/data/models/coverage-def.model';
import { PremiumCalcContext } from '../../../core/data/models/premium-calc-context.model';

@Component({
  selector: 'app-premium-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './premium-summary.component.html',
  styleUrls: ['./premium-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PremiumSummaryComponent {
  definitions = input.required<readonly CoverageDef[]>();
  coveragesFA = input.required<FormArray>(); // o: FormArray<FormGroup<CoverageForm>>
  visibleTierIdxs = input<readonly number[]>([0, 1, 2] as const);
  iscPct = input(16);
  baseTecnicaBruta = input(0);
  enablePremium = input(true);
  rateDivisor = input(100);
  extra = input<any>({});
  computeNet = input<((ctx: PremiumCalcContext, optionIndex: number) => number) | undefined>(undefined);

  private fg(i: number): FormGroup {
    return this.coveragesFA().at(i) as FormGroup;
  }

  private isSelected(i: number): boolean {
    return !!this.fg(i).get('selected')?.value;
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  get optionCount(): number {
    const defs = this.definitions();
    const maxTiers = defs.reduce((m, d) => Math.max(m, d.tiers?.length ?? 0), 0);
    return Math.max(maxTiers, 3);
  }

  isOptionEnabled(opt: number): boolean {
    return this.visibleTierIdxs().includes(opt);
  }

  private sumaproducto(opt: number): number {
    const defs = this.definitions();
    const fa = this.coveragesFA();

    let sum = 0;
    const divisor = Number(this.rateDivisor()) || 1; 

    for (let i = 0; i < defs.length; i++) {
      if (!this.isSelected(i)) continue;

      const def = defs[i];
      const rate = (def.ratePct ?? 0) / divisor;

      let base = 0;
      if (def.kind === 'tier') {
        base = def.tiers?.[opt] ?? 0;
      } else {
        const v = (fa.at(i) as FormGroup).get('amount')?.value;
        base = typeof v === 'number' ? v : Number(v) || 0;
      }
      sum += base * rate;
    }
    return sum;
  }

  private ctx = computed<PremiumCalcContext>(() => ({
    definitions: this.definitions(),
    coveragesFA: this.coveragesFA(),
    iscPct: this.iscPct(),
    baseTecnicaBruta: this.baseTecnicaBruta(),
    visibleTierIdxs: this.visibleTierIdxs() as number[],
    enablePremium: this.enablePremium(),
    rateDivisor: this.rateDivisor(),
    extra: this.extra(),
  }));

  private defaultNet(opt: number): number {
    const suma = this.sumaproducto(opt);
    const baseTecNeta = this.baseTecnicaBruta() / (1 + this.iscPct() / 100);
    return Math.max(suma, baseTecNeta);
  }

  net(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium()) return 0;

    const custom = this.computeNet();
    const value = custom ? custom(this.ctx(), opt) : this.defaultNet(opt);
    return this.round2(value);
  }

  isc(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium()) return 0;
    return this.round2(this.net(opt) * (this.iscPct() / 100));
  }

  total(opt: number): number {
    if (!this.isOptionEnabled(opt) || !this.enablePremium()) return 0;
    return this.round2(this.net(opt) + this.isc(opt));
  }
}
