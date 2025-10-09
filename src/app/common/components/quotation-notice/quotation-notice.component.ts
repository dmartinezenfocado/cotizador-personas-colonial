import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quotation-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-notice.component.html',
  styleUrls: ['./quotation-notice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationNoticeComponent {}
