import { Component, Input, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-school-data',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './school-data.component.html',
    styleUrls: ['./school-data.component.css']
})
export class SchoolDataComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;

  @Input() submitted = false;

  private sub?: Subscription;

  ngOnInit(): void {
    this.ensureValidators();

    const ctrl = this.form.get('fechaNacimiento');
    if (ctrl) {
      this.sub = ctrl.valueChanges.subscribe((val) => {
        const years = this.calcAge(val);
        const edadCtrl = this.form.get('edad');
        if (edadCtrl && Number.isFinite(years)) {
          edadCtrl.setValue(years, { emitEvent: false });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get f() {
    return this.form?.controls ?? {};
  }

  private ensureValidators(): void {
    this.setRequired('clientName');
    this.setRequired('intermediario');
    this.setRequired('moneda');
    this.setRequired('formaPago');
    this.setRequired('fecha');
    this.setRequired('fechaNacimiento');

    const identificationcard = this.form.get('identificationcard');
    if (identificationcard && !identificationcard.validator) {
      identificationcard.setValidators([
        Validators.required,
        Validators.pattern(/^\d{3}-\d{7}-\d$/)
      ]);
      identificationcard.updateValueAndValidity({ emitEvent: false });
    }

    const age = this.form.get('age');
    if (age && !age.disabled) {
      age.disable({ emitEvent: false }); 
    }
  }

  private setRequired(name: string): void {
    const c = this.form.get(name);
    if (c && !c.validator) {
      c.setValidators([Validators.required]);
      c.updateValueAndValidity({ emitEvent: false });
    }
  }

  private calcAge(value: unknown): number | null {
    if (!value) return null;
    const birth = new Date(value as string);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
    return years >= 0 ? years : 0;
    }
}
