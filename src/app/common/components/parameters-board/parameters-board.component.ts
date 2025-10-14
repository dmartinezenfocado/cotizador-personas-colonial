import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

type Category = 'I' | 'II' | 'III';
export interface Occupation { id: number; name: string; category: Category; }

@Component({
    selector: 'app-parameters-board',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './parameters-board.component.html',
    styleUrls: ['./parameters-board.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParametersBoardComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) occupations: Occupation[] = [];
  @Input({ required: true }) ageRanges: string[] = [];
  @Input() sums: [number, number, number] = [300000, 400000, 500000];

  formatMoney(v: number): string {
    return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  }
}
