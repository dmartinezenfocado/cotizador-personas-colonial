import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';

@Component({
    selector: 'app-insurance-data',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './insurance-data.component.html',
    styleUrls: ['./insurance-data.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsuranceDataComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitted = false;

  private sub?: Subscription;

  ngOnInit(): void {
    this.ensureValidators();       // Solo sus propios campos
    this.setupDaysCalculator();    // cantidadDias a partir de inicio/fin
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Atajo opcional para plantillas que usen f['campo'] */
  get f() {
    return this.form?.controls ?? {};
  }

  // --- Helpers privados ---

  private ensureValidators(): void {
    // Moneda requerida
    const moneda = this.form.get('moneda');
    if (moneda) {
      this.appendRequired(moneda);
    }

    // Vigencias requeridas y coherentes
    const ini = this.form.get('inicioVigencia');
    const fin = this.form.get('finVigencia');

    if (ini) this.appendRequired(ini);
    if (fin) this.appendRequired(fin);

    // Validador simple: fin >= inicio
    if (ini && fin) {
      const crossValidator = () => {
        const vIni = ini.value ? new Date(ini.value) : null;
        const vFin = fin.value ? new Date(fin.value) : null;
        const invalid = vIni && vFin && vFin < vIni;
        // Marca error solo en fin para feedback
        const currentErrors = fin.errors || {};
        if (invalid) {
          fin.setErrors({ ...currentErrors, dateOrder: true });
        } else {
          // limpia solo la key dateOrder si estaba
          if ('dateOrder' in currentErrors) {
            const { dateOrder, ...rest } = currentErrors as any;
            const next = Object.keys(rest).length ? rest : null;
            fin.setErrors(next);
          }
        }
      };

      // Revalida cuando cambien
      ini.valueChanges.subscribe(crossValidator);
      fin.valueChanges.subscribe(crossValidator);
      // Primera pasada
      crossValidator();
    }
  }

  private setupDaysCalculator(): void {
    const ini = this.form.get('inicioVigencia');
    const fin = this.form.get('finVigencia');
    const daysCtrl = this.form.get('cantidadDias');

    if (ini && fin && daysCtrl) {
      this.sub = combineLatest([ini.valueChanges, fin.valueChanges]).subscribe(() => {
        const d1 = ini.value ? new Date(ini.value) : null;
        const d2 = fin.value ? new Date(fin.value) : null;
        const days = (d1 && d2) ? Math.max(0, Math.ceil((+d2 - +d1) / 86400000)) : 0;
        daysCtrl.setValue(days, { emitEvent: false });
      });

      // primer cálculo
      const d1 = ini.value ? new Date(ini.value) : null;
      const d2 = fin.value ? new Date(fin.value) : null;
      const days = (d1 && d2) ? Math.max(0, Math.ceil((+d2 - +d1) / 86400000)) : 0;
      daysCtrl.setValue(days, { emitEvent: false });
    }
  }

  private appendRequired(ctrl: import('@angular/forms').AbstractControl) {
    const prev = ctrl.validator ? [ctrl.validator] : [];
    ctrl.setValidators([...prev, Validators.required]);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }
}
