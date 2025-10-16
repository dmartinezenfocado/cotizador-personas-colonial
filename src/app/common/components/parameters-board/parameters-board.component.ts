import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

type Category = 'I' | 'II' | 'III';
export interface Occupation { id: number; name: string; category: Category; }


@Component({
  selector: 'app-parameters-board',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './parameters-board.component.html',
  styleUrls: ['./parameters-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParametersBoardComponent {
  parentForm = input.required<FormGroup>(); 
  occupations = input.required<readonly Occupation[]>();
  ageRanges = input<readonly string[]>([]);
  sums = input<readonly [number, number, number]>([300000, 400000, 500000] as const);


  private readonly moneyFmt = new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  formatMoney(v: number): string {
    return this.moneyFmt.format(v);
  }

  get f() { return this.parentForm().controls; }
  trackById = (_: number, o: Occupation) => o.id;
}
