import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, combineLatest, startWith, takeUntil } from 'rxjs';
import { CoverageDef } from '../../../../core/data/models/coverage-def.model';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';
import { GeneralDataComponent } from '../../../../common/components/general-data/general-data.component';
import { PremiumSummaryComponent } from '../../../../common/components/premium-summary/premium-summary.component';
import { Occupation, ParametersBoardComponent } from '../../../../common/components/parameters-board/parameters-board.component';
import { OccupationService } from '../../../../core/data/services/occupations.service';

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
  netPremium = 0;
  baseTecnicaBruta = 1500;
  occupations: Occupation[] = [];
  private occSub?: Subscription;
  private subOpts?: Subscription;
  private sub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private occupationService: OccupationService,
  ) { }

  ngOnInit(): void {
    this.loadOccupations();
    this.setupAgeCalculation();
    this.setupOccupationChange();
    this.setupCategoryOptionsSync();

  }

  loadOccupations(): void {
    this.occSub = this.occupationService.getAll().subscribe({
      next: (data) => (this.occupations = data),
      error: () => (this.occupations = [])
    });
  }

  private setupAgeCalculation(): void {
    const fnCtrl = this.individualPersonForm.get('fechaNacimiento');
    const edadCtrl = this.individualPersonForm.get('edad');

    if (fnCtrl && edadCtrl) {
      this.sub = fnCtrl.valueChanges.subscribe((val) => {
        const years = this.calcAge(val);
        edadCtrl.setValue(Number.isFinite(years) ? years : 0, { emitEvent: false });
      });
    }
  }

  private setupOccupationChange(): void {
    const ctrl = this.individualPersonForm.get('occupationId');
    if (!ctrl) return;

    ctrl.valueChanges
      .pipe(
        startWith(ctrl.value),
        takeUntil(this.destroy$)
      )
      .subscribe((id: number | null) => {
        const occ = this.occupations.find(o => o.id === id) || null;
        const cat = occ?.category ?? null;
        this.individualPersonForm.get('category')?.setValue(cat, { emitEvent: false });
      });
  }

  private setupCategoryOptionsSync(): void {
    this.subOpts = combineLatest([
      this.individualPersonForm.get('optI')!.valueChanges,
      this.individualPersonForm.get('optII')!.valueChanges,
      this.individualPersonForm.get('optIII')!.valueChanges,
    ]).subscribe(() => this.coerceCoverageAmountsToVisibleTiers());
  }

  ageRanges: string[] = ['Hasta 55', '56 - 65', '66 - 70'];

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.18 },
    { name: 'Desmembramiento', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.09 },
    { name: 'Incapacidad Total y Permanente', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.06 },
    { name: 'Comp. Semanal', kind: 'tier', tiers: [1500, 2000, 2500], suffix: 'DOP', ratePct: 0.03 },
    { name: 'Gastos Médicos por Accidente', kind: 'tier', tiers: [30000, 40000, 50000], suffix: 'DOP', ratePct: 2.27 },
  ];

  individualPersonForm: FormGroup = this.fb.group({
    clientName: [null as number | null, Validators.required],
    intermediario: [null as number | null, Validators.required],
    moneda: ['', Validators.required],
    formaPago: ['', Validators.required],
    cedula: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)]],
    fecha: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    edad: [{ value: 0, disabled: true }],
    occupationId: [null as number | null, Validators.required],
    ageRange: [null as string | null, Validators.required],
    category: [{ value: null as Category | null, disabled: true }],
    optI: [true],
    optII: [true],
    optIII: [true],

    coverages: this.fb.array(this.COVERAGES.map(() =>
      this.fb.group({ selected: [false], amount: [null] })
    ))
  });




  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subOpts?.unsubscribe();
  }

  get coverages(): FormArray { return this.individualPersonForm.get('coverages') as FormArray; }
  get optI(): boolean { return !!this.individualPersonForm.get('optI')!.value; }
  get optII(): boolean { return !!this.individualPersonForm.get('optII')!.value; }
  get optIII(): boolean { return !!this.individualPersonForm.get('optIII')!.value; }

  get visibleTierIdxs(): number[] {
    const arr: number[] = [];
    if (this.optI) arr.push(0);
    if (this.optII) arr.push(1);
    if (this.optIII) arr.push(2);
    return arr;
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
    if (this.individualPersonForm.invalid) return;
  }

  private coerceCoverageAmountsToVisibleTiers(): void {
    this.coverages.controls.forEach((ctrl, i) => {
      const def = this.COVERAGES[i];
      if (def?.kind !== 'tier') return;
      const selected = !!ctrl.get('selected')?.value;
      if (!selected) return;

      const visibleValues = (def.tiers ?? []).filter((_, idx) => this.visibleTierIdxs.includes(idx));

      if (!visibleValues.length) {
        return;
      }

      const current = ctrl.get('amount')?.value as number | null;
      if (current == null || !visibleValues.includes(current)) {
        ctrl.get('amount')?.setValue(visibleValues[0], { emitEvent: false });
      }
    });
  }

  private calcAge(value: unknown): number | null {
    if (!value) return null;
    const birth = new Date(value as string);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
    return years >= 0 ? years : 0;
  }

  get currency(): string {
    const value = this.individualPersonForm.get('moneda')?.value;
    return value === 'usd' ? 'US$' : 'RD$';
  }

  get enablePremium(): boolean {
    const idx = this.findCoverageIndexByName('Muerte Accidental');
    if (idx < 0) return true;
    return !!(this.coverages.at(idx).get('selected')?.value);
  }

}
