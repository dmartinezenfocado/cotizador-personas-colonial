import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'app-short-term-rate',
    standalone: true,
    imports: [DecimalPipe],
    templateUrl: './short-term-rate.component.html',
    styleUrls: ['./short-term-rate.component.css']
})
export class ShortTermRateComponent {
  percentage = input<number | null>(null);
}
