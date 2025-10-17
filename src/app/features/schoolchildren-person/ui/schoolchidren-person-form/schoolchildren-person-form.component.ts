import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
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
import { PremiumScheduleComponent } from './components/premium-schedule/premium-schedule.component';
import { CoveragesLimitsComponent } from '../../../../common/components/coverage-limits/coverage-limits.component';
import { GeneralDataComponent } from '../../../../common/components/general-data/general-data.component';
import { CoverageGroup } from '../../../../core/data/models/coverage-group.model';



@Component({
  selector: 'app-schoolchildren-person-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CoveragesLimitsComponent,
    GeneralDataComponent,
    PremiumScheduleComponent,
  ],
  templateUrl: './schoolchildren-person-form.component.html',
  styleUrls: ['./schoolchildren-person-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolChildrenPersonFormComponent {
  private readonly fb  = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly STUDENT_IDX = 0;
  readonly premiumRates = {
    studentSchool: 1.178,
    professorSchool: 3.312,
    student24h: 1.302,
    professor24h: 3.661,
  };

  columns: string[] = [];
  amountsStudent: number[] = [];
  amountsProfessor: number[] = []; 
  submitted = false;
  netPremium = 0;

  readonly COVERAGES: CoverageDef[] = [
    { name: 'Muerte Accidental',               kind: 'tier', tiers: [30000, 50000, 200000], suffix: 'DOP', ratePct: 0.18 },
    { name: 'Desmembramiento',                 kind: 'tier', tiers: [30000, 50000, 200000], suffix: 'DOP', ratePct: 0.09 },
    { name: 'Incapacidad Total y Permanente',  kind: 'tier', tiers: [30000, 50000, 200000], suffix: 'DOP', ratePct: 0.06 },
    { name: 'Gastos Médicos por Accidente',    kind: 'tier', tiers: [10000,  5000,  20000 ], suffix: 'DOP', ratePct: 2.27 },
  ];

  schoolPersonForm: FormGroup = this.fb.group({
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
    coverages: this.fb.array(
      this.COVERAGES.map(() =>
        this.fb.group({
          selected: [false],
          amount: [null],
        })
      )
    ),
  });

  get coverages(): FormArray<CoverageGroup> {
    return this.schoolPersonForm.get('coverages') as FormArray<CoverageGroup>;
  }

  ngOnInit(): void {
    this.refreshPremiumInputs(); 
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
      if (!(current != null && def.tiers.includes(current))) {
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

  onCoveragesChanged(): void {
    this.refreshPremiumInputs(); 
  }

  private readRowAmounts(rowIdx: number): number[] {
    const fg  = this.coverages.at(rowIdx);
    const def = this.COVERAGES[rowIdx];

    const fa = fg.get('amounts') as FormArray<FormControl<number | null>> | null;
    if (fa?.length) {
      return [0, 1, 2].map(c => {
        const v = fa.at(c)?.value;
        return Number.isFinite(v as number) ? Number(v) : 0;
      });
    }
    const tiers = (def?.tiers ?? []).slice(0, 3).map(v => Number(v) || 0);
    while (tiers.length < 3) tiers.push(0);
    return tiers;
  }

  private makeHeaders(from: number[]): string[] {
    const nf = new Intl.NumberFormat('es-DO');
    return from.map(v => nf.format(v));
  }
 
  private refreshPremiumInputs(): void {
    const student = this.readRowAmounts(this.STUDENT_IDX);
    this.amountsStudent   = [...student];
    this.amountsProfessor = [...student];
    this.columns          = this.makeHeaders(student);

    this.cdr.markForCheck();
  }
}
