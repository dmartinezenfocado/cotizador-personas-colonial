import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, combineLatest, startWith, takeUntil } from 'rxjs';
import { CoverageDef } from '../../../../core/data/models/coverage-def.model';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';
import { PremiumSummaryComponent } from '../../../../common/components/premium-summary/premium-summary.component';
import { ParametersBoardComponent } from '../../../../common/components/parameters-board/parameters-board.component';
import { ApplicantDataComponent } from './components/applicant-data/applicant-data.component';
import { InsuranceDataComponent } from './components/insurance-data/insurance-data.component';
import { ShortTermRateComponent } from './components/short-term-rate/short-term-rate.component';
import { PremiumCalcContext } from '../../../../core/data/models/premium-calc-context.model';
import { GeneralDataComponent } from '../../../../common/components/general-data/general-data.component';
import { OccupationService } from '../../../../core/data/services/occupations.service';

type Category = 'I' | 'II' | 'III';
interface Occupation { id: number; name: string; category: Category; }

@Component({
    selector: 'app-collective-person-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CoveragesLimitsComponent,
        GeneralDataComponent,
        InsuranceDataComponent,
        PremiumSummaryComponent,
        ParametersBoardComponent,
        ShortTermRateComponent
    ],
    templateUrl: './collective-person-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectivePersonFormComponent implements OnInit, OnDestroy {
  submitted = false;
  netPremium = 0;
  baseTecnicaBruta = 15000;
  occupations: Occupation[] = [];
  private sub?: Subscription;
  private subOpts?: Subscription;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private occupationService: OccupationService,
  ) { }

  ageRanges: string[] = ['Hasta 55', '56 - 65', '66 - 70'];

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental', kind: 'tier', tiers: [250000, 400000, 500000], suffix: 'DOP', ratePct: 0.18 },
    { name: 'Desmembramiento', kind: 'tier', tiers: [250000, 400000, 500000], suffix: 'DOP', ratePct: 0.09 },
    { name: 'Incapacidad Total y Permanente', kind: 'tier', tiers: [250000, 400000, 500000], suffix: 'DOP', ratePct: 0.06 },
    { name: 'Comp. Semanal', kind: 'tier', tiers: [1250, 2000, 2500], suffix: 'DOP', ratePct: 0.03 },
    { name: 'Gastos Médicos por Accidente', kind: 'tier', tiers: [25000, 40000, 50000], suffix: 'DOP', ratePct: 2.27 },
  ];

  ngOnInit(): void {
    this.getOccupations();
    this.wireCategoryFromOccupation();
    this.wireTierVisibilityCoercion();
  }

    ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subOpts?.unsubscribe();
  }


  collectivePersonForm: FormGroup = this.fb.group({
    clientName: [null as number | null, Validators.required],
    intermediary: [null as number | null, Validators.required],
    currency: ['', Validators.required],
    paymentMethod: ['', Validators.required],
    identification: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)]],
    date: ['', Validators.required],
    dateBirth: ['', Validators.required],
    age: [{ value: 0, disabled: true }],
    occupationId: [null as number | null, Validators.required],
    ageRange: [null as string | null, Validators.required],
    category: [{ value: null as Category | null, disabled: true }],
    optI: [false],
    optII: [false],
    optIII: [false],
    inicioVigencia: ['', Validators.required],
    finVigencia: ['', Validators.required],
    cantidadDias: [{ value: 0, disabled: false }],
    cantidadAsegurados: [{ value: 100, disabled: false }],
    shortTermFactor: [0.35],   // AH6
    exentoY12: [false],
    coverages: this.fb.array(this.COVERAGES.map(() =>
      this.fb.group({ selected: [false], amount: [null] })
    ))
  });

  get coverages(): FormArray { return this.collectivePersonForm.get('coverages') as FormArray; }
  get optI(): boolean { return !!this.collectivePersonForm.get('optI')!.value; }
  get optII(): boolean { return !!this.collectivePersonForm.get('optII')!.value; }
  get optIII(): boolean { return !!this.collectivePersonForm.get('optIII')!.value; }

  get visibleTierIdxs(): number[] {
    const arr: number[] = [];
    if (this.optI) arr.push(0);
    if (this.optII) arr.push(1);
    if (this.optIII) arr.push(2);
    return arr;
  }

   private getOccupations(): void {
      this.occupationService.getAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => (this.occupations = data ?? []),
          error: () => (this.occupations = [])
        });
    }

  private wireCategoryFromOccupation(): void {
    const occCtrl = this.collectivePersonForm.get('occupationId');
    const catCtrl = this.collectivePersonForm.get('category');
    if (!occCtrl || !catCtrl) return;

    occCtrl.valueChanges
      .pipe(startWith(occCtrl.value), takeUntil(this.destroy$))
      .subscribe((id: number | null) => {
        const occ = this.occupations.find(o => o.id === id) ?? null;
        catCtrl.setValue(occ?.category ?? null, { emitEvent: false });
      });
  }

  private wireTierVisibilityCoercion(): void {
    const optI = this.collectivePersonForm.get('optI')!;
    const optII = this.collectivePersonForm.get('optII')!;
    const optIII = this.collectivePersonForm.get('optIII')!;

    combineLatest([
      optI.valueChanges.pipe(startWith(optI.value)),
      optII.valueChanges.pipe(startWith(optII.value)),
      optIII.valueChanges.pipe(startWith(optIII.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.coerceCoverageAmountsToVisibleTiers());
  }

  onCoverageToggled(event: { index: number; selected: boolean }): void {
    const { index: i, selected } = event;
    const def = this.COVERAGES[i];
    const fg = this.coverages.at(i);

    if (!selected && def.kind === 'free') {
      fg.get('amount')?.reset();
    }

    if (selected && def.kind === 'tier' && def.tiers?.length) {
      const visibleValues = def.tiers.filter((_, idx) => this.visibleTierIdxs.includes(idx));
      if (visibleValues.length) {
        const current = fg.get('amount')?.value as number | null;
        if (current == null || !visibleValues.includes(current)) {
          fg.get('amount')?.setValue(visibleValues[0], { emitEvent: false });
        }
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.collectivePersonForm.invalid) return;
  }

  private coerceCoverageAmountsToVisibleTiers(): void {
    this.coverages.controls.forEach((ctrl, i) => {
      const def = this.COVERAGES[i];
      if (def?.kind !== 'tier') return;
      const selected = !!ctrl.get('selected')?.value;
      if (!selected) return;

      const visibleValues = (def.tiers ?? []).filter((_, idx) => this.visibleTierIdxs.includes(idx));
      if (!visibleValues.length) {
        ctrl.get('amount')?.reset(null, { emitEvent: false });
        return;
      }

      const current = ctrl.get('amount')?.value as number | null;
      if (current == null || !visibleValues.includes(current)) {
        ctrl.get('amount')?.setValue(visibleValues[0], { emitEvent: false });
      }
    });
  }

  get currency(): string {
    const value = this.collectivePersonForm.get('moneda')?.value;
    return value === 'usd' ? 'US$' : 'RD$';
  }

 get enablePremium(): boolean {
    const idx = this.findCoverageIndexByName('Muerte Accidental');
    if (idx < 0) return true;
    return !!(this.coverages.at(idx).get('selected')?.value);
  }
 private findCoverageIndexByName(name: string): number {
    return this.COVERAGES.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  }
  private get isMuerteAccidentalSelected(): boolean {
    const idx = this.findCoverageIndexByName('Muerte Accidental');
    if (idx < 0) return true;
    return !!(this.coverages.at(idx).get('selected')?.value);
  }

  get premiumVisibleTierIdxs(): number[] {
    if (!this.isMuerteAccidentalSelected) return [];
    return this.visibleTierIdxs;
  }

computeNetColectivo = (ctx: PremiumCalcContext, opt: number): number => {
  if (!ctx.visibleTierIdxs.includes(opt) || !ctx.enablePremium) return 0;

  let sum = 0;
  for (let i = 0; i < ctx.definitions.length; i++) {
    const def = ctx.definitions[i];
    const fg = ctx.coveragesFA.at(i) as FormGroup;
    if (!fg.get('selected')?.value) continue;

    const rate = (def.ratePct ?? 0) / ctx.rateDivisor;
    const base = def.kind === 'tier'
      ? (def.tiers?.[opt] ?? 0)
      : (Number(fg.get('amount')?.value) || 0);

    sum += base * rate;
  }
  const AH6 = Number(ctx.extra?.AH6 ?? 1);       
  const D13 = Number(ctx.extra?.D13 ?? 0);      
  const Y12 = !!ctx.extra?.Y12;                  
  const siY12 = Y12 ? 0 : 1;
  const siG3  = ctx.enablePremium ? 1 : 0;   
  const siD13 = (D13 < 10) ? 0 : 1;

  return sum * AH6 * D13 * siY12 * siG3 * siD13;
};

}
