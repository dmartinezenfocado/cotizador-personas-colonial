import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type PremiumRow = { label: string; values: number[] };      
type PremiumSection = { title: string; rows: PremiumRow[] }; 

@Component({
  selector: 'app-premium-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-schedule.component.html',
  styleUrls: ['./premium-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumScheduleComponent {
  @Input() columns: string[] = ['', '', ''];
  @Input() sections: PremiumSection[] = [
    {
      title: 'Horario Escolar',
      rows: [
        { label: 'Prima por Estudiante', values: [117.80, 176.70, 235.60] },
        { label: 'Prima por Profesor',   values: [331.23, 496.85, 662.47] },
      ],
    },
    {
      title: 'Horario 24 horas',
      rows: [
        { label: 'Prima por Estudiante', values: [130.20, 195.30, 260.40] },
        { label: 'Prima por Profesor',   values: [366.10, 549.15, 732.20] },
      ],
    },
  ];


  format(value: number | null | undefined): string {
    if (value == null) return '';
    return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}
