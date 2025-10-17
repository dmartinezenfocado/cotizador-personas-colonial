import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Rates = {
  studentSchool: number;
  professorSchool: number;
  student24h: number;
  professor24h: number;
};

@Component({
  selector: 'app-premium-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-schedule.component.html',
  styleUrls: ['./premium-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumScheduleComponent {
  columns = input<string[]>([]);
  amountsStudent = input.required<readonly number[]>();
  amountsProfessor = input<readonly number[] | null>(null);
  rates = input.required<Rates>();

  private readonly nf = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  format(value: number | null | undefined): string {
    return value == null ? '' : this.nf.format(value);
  }

  calc(value: number | null | undefined, rate: number): number {
    return Math.round(((Number(value) || 0) / 1000) * rate * 100) / 100;
  }
}
