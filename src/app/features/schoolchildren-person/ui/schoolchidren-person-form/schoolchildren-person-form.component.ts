import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { CoverageDef } from '../../../../core/data/models/coverage-def.model';
import { SchoolDataComponent } from './components/school-data/school-data.component';
import { PremiumScheduleComponent } from './components/premium-schedule/premium-schedule.component';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';

type CoverageGroup = FormGroup<{
  selected: FormControl<boolean>;
  amount: FormControl<number | null>;
}>;

@Component({
    selector: 'app-schoolchildren-person-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CoveragesLimitsComponent,
        SchoolDataComponent,
        PremiumScheduleComponent,
    ],
    templateUrl: './schoolchildren-person-form.component.html',
    styleUrls: ['./schoolchildren-person-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolChildrenPersonFormComponent {
  private readonly fb = inject(FormBuilder);

  submitted = false;
  netPremium = 0;

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental',               kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.18 },
    { name: 'Desmembramiento',                 kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.09 },
    { name: 'Incapacidad Total y Permanente',  kind: 'tier', tiers: [300000, 400000, 500000], suffix: 'DOP', ratePct: 0.06 },
    { name: 'Comp. Semanal',                   kind: 'tier', tiers: [1500,   2000,   2500  ], suffix: 'DOP', ratePct: 0.03 },
    { name: 'Gastos Médicos por Accidente',    kind: 'tier', tiers: [30000,  40000,  50000 ], suffix: 'DOP', ratePct: 2.27 },
  ];

  schoolPersonForm = this.fb.group({
    clientName: this.fb.control<string>(''),
    intermediario: this.fb.control<string>(''),
    moneda: this.fb.control<string>('', { validators: [Validators.required] }),
    formaPago: this.fb.control<string>('', { validators: [Validators.required] }),
    cedula: this.fb.control<string>('', {
      validators: [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d{1}$/)],
    }),
    fecha: this.fb.control<string>('', { validators: [Validators.required] }),

    coverages: this.fb.array<CoverageGroup>([
  ...this.COVERAGES.map(() =>
    this.fb.group({
      selected: this.fb.control<boolean>(false),
      amount: this.fb.control<number | null>(null),
    }) as CoverageGroup
  )
]),
  });

  get coverages(): FormArray<CoverageGroup> {
    return this.schoolPersonForm.get('coverages') as FormArray<CoverageGroup>;
  }

  onCoverageToggled(event: { index: number; selected: boolean }): void {
    const { index: i, selected } = event;
    const def = this.COVERAGES[i];
    const fg = this.coverages.at(i);

    if (!selected) {
      fg.get('amount')!.reset(null, { emitEvent: false });
      return;
    }

    if (def.kind === 'tier' && def.tiers?.length) {
      const current = fg.get('amount')!.value;
      const isValid = current != null && def.tiers.includes(current);
      if (!isValid) {
        fg.get('amount')!.setValue(def.tiers[0], { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.schoolPersonForm.invalid) return;
  }

  get currency(): string {
    const value = this.schoolPersonForm.get('moneda')?.value;
    return value === 'usd' ? 'US$' : 'RD$';
  }
}
