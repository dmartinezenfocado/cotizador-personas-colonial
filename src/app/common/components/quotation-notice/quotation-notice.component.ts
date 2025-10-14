import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-quotation-notice',
    imports: [CommonModule],
    templateUrl: './quotation-notice.component.html',
    styleUrls: ['./quotation-notice.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotationNoticeComponent {}
