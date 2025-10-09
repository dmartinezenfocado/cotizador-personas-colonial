import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { CoverageDef } from '../../../../core/data/models/coverage-def.model';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';
import { GeneralDataComponent } from '../../../../common/components/general-data/general-data.component';
import { PremiumSummaryComponent } from '../../../../common/components/premium-summary/premium-summary.component';
import { QuotationNoticeComponent } from '../../../../common/components/quotation-notice/quotation-notice.component';
import { ParametersBoardComponent } from '../../../../common/components/parameters-board/parameters-board.component';

type Category = 'I' | 'II' | 'III';
interface Occupation { id: number; name: string; category: Category; }

@Component({

  selector: 'app-individual-person-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CoveragesLimitsComponent, 
    GeneralDataComponent, 
    PremiumSummaryComponent, 
    QuotationNoticeComponent, 
    ParametersBoardComponent],
  templateUrl: './individual-person-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndividualPersonFormComponent implements OnInit, OnDestroy {
  submitted = false;
  netPremium = 0;
  private sub?: Subscription;
  private subOpts?: Subscription;

 
  occupations: Occupation[] = [
    { id: 1, name: 'Albañiles', category: 'III' },
    { id: 2, name: 'Ingenieros', category: 'I' },
    { id: 3, name: 'Choferes', category: 'II' },
  ];
  ageRanges: string[] = ['Hasta 55', '56 - 65', '66 - 70'];

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP' },
    { name: 'Desmembramiento', kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP' },
    { name: 'Incapacidad Total y Permanente', kind:'tier', tiers: [300000, 400000, 500000], suffix: 'DOP' },
    { name: 'Comp. Semanal', kind:'tier', tiers: [1500, 2000, 2500], suffix: 'DOP' },
    { name: 'Gastos Médicos por Accidente', kind:'tier', tiers: [30000, 40000, 50000], suffix: 'DOP' }
  ];

  individualPersonForm: FormGroup = this.fb.group({
    clientName: [''],
    intermediario: [''],
    moneda: ['', Validators.required],
    formaPago: ['', Validators.required],
    cedula: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)]],
    fecha: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    edad: [{ value: 0, disabled: true }],
    occupationId: [null as number | null, Validators.required],
    ageRange: [null as string | null, Validators.required],
    category: [{ value: null as Category | null, disabled: true }],
    optI: [false],
    optII: [false],
    optIII: [false],

    coverages: this.fb.array(this.COVERAGES.map(() =>
      this.fb.group({ selected: [false], amount: [null] })
    ))
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const fnCtrl = this.individualPersonForm.get('fechaNacimiento');
    const edadCtrl = this.individualPersonForm.get('edad');
    if (fnCtrl && edadCtrl) {
      this.sub = fnCtrl.valueChanges.subscribe((val) => {
        const years = this.calcAge(val);
        edadCtrl.setValue(Number.isFinite(years) ? years : 0, { emitEvent: false });
      });
    }

    this.individualPersonForm.get('occupationId')!.valueChanges.subscribe((id: number | null) => {
      const occ = this.occupations.find(o => o.id === id) || null;
      const cat = occ?.category ?? null;
      this.individualPersonForm.get('category')!.setValue(cat, { emitEvent: false });

      const flags = { I: false, II: false, III: false } as Record<Category, boolean>;
      if (cat) flags[cat] = true;
      this.individualPersonForm.patchValue({ optI: flags.I, optII: flags.II, optIII: flags.III }, { emitEvent: false });

      this.coerceCoverageAmountsToVisibleTiers();
    });

    this.subOpts = combineLatest([
      this.individualPersonForm.get('optI')!.valueChanges,
      this.individualPersonForm.get('optII')!.valueChanges,
      this.individualPersonForm.get('optIII')!.valueChanges,
    ]).subscribe(() => this.coerceCoverageAmountsToVisibleTiers());
  }

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
        ctrl.get('amount')?.reset(null, { emitEvent: false });
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

}
