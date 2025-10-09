import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premium-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-summary.component.html',
  styleUrls: ['./premium-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PremiumSummaryComponent {
 
  @Input() net: number = 0;
  @Input() taxRate: number = 0.16;
  @Input() currency: string = 'RD$';

  get tax(): number {
    return (this.net ?? 0) * (this.taxRate ?? 0);
  }

  get total(): number {
    return (this.net ?? 0) + this.tax;
  }
}
