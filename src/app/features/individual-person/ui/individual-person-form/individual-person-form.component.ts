import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest, startWith, takeUntil } from 'rxjs';

import { CoverageDef } from '../../../../core/data/models/coverage-def.model';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';
import { GeneralDataComponent } from '../../../../common/components/general-data/general-data.component';
import { Occupation, ParametersBoardComponent } from '../../../../common/components/parameters-board/parameters-board.component';
import { OccupationService } from '../../../../core/data/services/occupations.service';
import { PremiumSummaryComponent } from '../../../../common/components/premium-summary/premium-summary.component';

type Category = 'I' | 'II' | 'III';

@Component({
  selector: 'app-individual-person-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CoveragesLimitsComponent,
    GeneralDataComponent,
    PremiumSummaryComponent,
    ParametersBoardComponent
  ],
  templateUrl: './individual-person-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndividualPersonFormComponent implements OnInit, OnDestroy {
  submitted = false;
  baseTecnicaBruta = 1500;
  ageRanges: string[] = ['Hasta 55', '56 - 65', '66 - 70'];
  occupations: Occupation[] = [];

  private readonly destroy$ = new Subject<void>();

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental',              kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.18 },
    { name: 'Desmembramiento',                kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.09 },
    { name: 'Incapacidad Total y Permanente', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.06 },
    { name: 'Comp. Semanal',                  kind: 'tier', tiers: [1500,   2000,   2500],   suffix: 'DOP', ratePct: 0.03 },
    { name: 'Gastos Médicos por Accidente',   kind: 'tier', tiers: [30000,  40000,  50000],  suffix: 'DOP', ratePct: 2.27 },
  ];


  individualPersonForm: FormGroup = this.fb.group({
    clientName:     [null as number | null, Validators.required],
    intermediary:   [null as number | null, Validators.required],
    currency:       ['dop', Validators.required], // 'dop' | 'usd'
    paymentMethod:  ['', Validators.required],
    identification: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)]],
    date:           ['', Validators.required],
    dateBirth:      ['', Validators.required],
    age:            [{ value: 0, disabled: true }],
    occupationId:   [null as number | null, Validators.required],
    ageRange:       [null as string | null, Validators.required],
    category:       [{ value: null as Category | null, disabled: true }],
    optI:           [true],
    optII:          [true],
    optIII:         [true],
    coverages: this.fb.array(
      this.COVERAGES.map(() => this.fb.group({ selected: [false], amount: [null as number | null] }))
    ),
  });

  constructor(
    private fb: FormBuilder,
    private occupationService: OccupationService,
  ) {}


  ngOnInit(): void {
    this.getOccupations();
    this.wireAgeFromBirth();
    this.wireCategoryFromOccupation();
    this.wireTierVisibilityCoercion();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get coveragesFA(): FormArray { return this.individualPersonForm.get('coverages') as FormArray; }

  get coverages() { return this.coveragesFA; }

  get visibleTierIdxs(): number[] {
    const f = this.individualPersonForm;
    const vis: number[] = [];
    if (f.get('optI')!.value)  vis.push(0);
    if (f.get('optII')!.value) vis.push(1);
    if (f.get('optIII')!.value)vis.push(2);
    return vis;
  }

  get premiumVisibleTierIdxs(): number[] {
    return this.isSelected('Muerte Accidental') ? this.visibleTierIdxs : [];
  }

  get enablePremium(): boolean {
    const idx = this.nameToIndex('Muerte Accidental');
    if (idx < 0) return true;
    return !!(this.coveragesFA.at(idx).get('selected')?.value);
  }


  private getOccupations(): void {
    this.occupationService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.occupations = data ?? []),
        error: () => (this.occupations = [])
      });
  }

  private wireAgeFromBirth(): void {
    const birthCtrl = this.individualPersonForm.get('dateBirth');
    const ageCtrl   = this.individualPersonForm.get('age');
    if (!birthCtrl || !ageCtrl) return;

    birthCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        const years = this.calcAge(val);
        ageCtrl.setValue(Number.isFinite(years) ? years : 0, { emitEvent: false });
      });
  }

  private wireCategoryFromOccupation(): void {
    const occCtrl = this.individualPersonForm.get('occupationId');
    const catCtrl = this.individualPersonForm.get('category');
    if (!occCtrl || !catCtrl) return;

    occCtrl.valueChanges
      .pipe(startWith(occCtrl.value), takeUntil(this.destroy$))
      .subscribe((id: number | null) => {
        const occ = this.occupations.find(o => o.id === id) ?? null;
        catCtrl.setValue(occ?.category ?? null, { emitEvent: false });
      });
  }

  private wireTierVisibilityCoercion(): void {
    const optI   = this.individualPersonForm.get('optI')!;
    const optII  = this.individualPersonForm.get('optII')!;
    const optIII = this.individualPersonForm.get('optIII')!;

    combineLatest([
      optI.valueChanges.pipe(startWith(optI.value)),
      optII.valueChanges.pipe(startWith(optII.value)),
      optIII.valueChanges.pipe(startWith(optIII.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.coerceCoverageAmountsToVisibleTiers());
  }

 
  private nameToIndex(name: string): number {
    return this.COVERAGES.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  }

  private isSelected(name: string): boolean {
    const i = this.nameToIndex(name);
    return i < 0 ? true : !!this.coveragesFA.at(i).get('selected')?.value;
  }

  private calcAge(value: unknown): number | null {
    if (!value) return null;
    const d = new Date(value as string);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) years--;
    return Math.max(0, years);
  }

  private coerceCoverageAmountsToVisibleTiers(): void {
    const visibleIdxs = this.visibleTierIdxs;

    this.coveragesFA.controls.forEach((ctrl, i) => {
      const def = this.COVERAGES[i];
      if (def.kind !== 'tier') return;
      if (!ctrl.get('selected')?.value) return;

      const tiers = def.tiers ?? [];
      const visibleValues = tiers.filter((_, idx) => visibleIdxs.includes(idx));
      if (!visibleValues.length) return;

      const current = ctrl.get('amount')?.value as number | null;
      if (current == null || !visibleValues.includes(current)) {
        ctrl.get('amount')?.setValue(visibleValues[0], { emitEvent: false });
      }
    });
  }

  onCoverageToggled(event: { index: number; selected: boolean }): void {
    const { index, selected } = event;
    const def = this.COVERAGES[index];
    const fg  = this.coveragesFA.at(index);

    if (!selected) {
      fg.get('amount')?.reset(null, { emitEvent: false });
      return;
    }

    if (def.kind === 'tier' && def.tiers?.length) {
      const firstVisible = def.tiers.find((_, idx) => this.visibleTierIdxs.includes(idx));
      if (firstVisible != null) {
        fg.get('amount')?.setValue(firstVisible, { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.individualPersonForm.invalid) return;
  }
}
