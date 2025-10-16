import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-applicant-data',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './applicant-data.component.html',
    styleUrls: ['./applicant-data.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicantDataComponent implements OnInit {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitted = false;

  ngOnInit(): void {
    this.ensureValidators();
  }

  get f() {
    return this.form?.controls as any;
  }

  private ensureValidators(): void {
    this.addRequired('clientName');
    this.addRequired('intermediario');
    this.addRequired('fecha');

    // RNC requerido + patrón
    const rnc = this.form.get('RNC');
    if (rnc) {
      rnc.addValidators([
        Validators.required,
        Validators.pattern(/^\d{3}-\d{7}-\d{1}$/),
      ]);
      rnc.updateValueAndValidity({ emitEvent: false });
    }
  }

  private addRequired(name: string): void {
    const c = this.form.get(name);
    if (c) {
      c.addValidators(Validators.required);
      c.updateValueAndValidity({ emitEvent: false });
    }
  }
}
