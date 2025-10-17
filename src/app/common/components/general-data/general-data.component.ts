import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { of, startWith } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientService } from '../../../core/data/services/client.service';
import { IntermediarioService } from '../../../core/data/services/intermediary.service';
import { Client } from '../../../core/data/models/client.model';
import { Intermediario } from '../../../core/data/models/intermediary.model';
import { GeneralForm } from '../../../core/data/models/general-form.model';
import { GeneralDataConfig } from './general-data.config';


const DEFAULT_CONFIG: Required<GeneralDataConfig> = {
  showCliente: true,      requireCliente: true,
  showIntermediario: true,requireIntermediario: true,
  showMoneda: true,       requireMoneda: true,
  showFormaPago: true,    requireFormaPago: true,
  showFecha: true,        requireFecha: true,
  showDocumento: true,    requireDocumento: true,
  docType: 'cedula',
  showFechaNacimiento: true,
  requireFechaNacimiento: true,
  autoEdad: true,
};

@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-data.component.html',
  styleUrls: ['./general-data.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralDataComponent implements OnInit {
  form = input.required<GeneralForm>();
  submitted = input(false);
  config = input<GeneralDataConfig>(DEFAULT_CONFIG);
  clients: Client[] = [];
  loadingClients = false;
  intermediarios: Intermediario[] = [];
  loadingIntermediarios = false;

  private readonly clientService = inject(ClientService);
  private readonly intermediarioService = inject(IntermediarioService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.applyConfig();
    this.maybeWireEdad();
    this.getClients();
    this.getIntermediarios();
  }

  private applyConfig(): void {
    const cfg = { ...DEFAULT_CONFIG, ...(this.config() ?? {}) };

    this.toggleRequired('clientName',  cfg.requireCliente,      cfg.showCliente);
    this.toggleRequired('intermediary', cfg.requireIntermediario, cfg.showIntermediario);
    this.toggleRequired('currency',      cfg.requireMoneda,       cfg.showMoneda);
    this.toggleRequired('paymentMethod',   cfg.requireFormaPago,    cfg.showFormaPago);
    this.toggleRequired('fecha',       cfg.requireFecha,        cfg.showFecha);
    this.toggleRequired('fechaNacimiento', cfg.requireFechaNacimiento, cfg.showFechaNacimiento);

    const docCtrl = this.form().get('cedula') ?? this.form().get('documento'); // por si renombraste
    if (docCtrl) {
      const validators = [];
      if (cfg.requireDocumento && cfg.showDocumento) validators.push(Validators.required);

      if (cfg.docType === 'cedula') {
        validators.push(Validators.pattern(/^\d{3}-\d{7}-\d$/)); // 000-0000000-0
      } else {
        validators.push(Validators.pattern(/^\d{9,11}$/));
      }

      docCtrl.setValidators(cfg.showDocumento ? validators : []);
      docCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private toggleRequired(name: string, required: boolean, shown: boolean): void {
    const c = this.form().get(name);
    if (!c) return;
    const validators = c.validator ? [c.validator] : [];
    const clean = validators.filter(v => v !== Validators.required);
    if (required && shown) clean.push(Validators.required);
    c.setValidators(shown ? clean : []);     
    c.updateValueAndValidity({ emitEvent: false });
  }

  private maybeWireEdad(): void {
    const cfg = { ...DEFAULT_CONFIG, ...(this.config() ?? {}) };
    if (!cfg.autoEdad || !cfg.showFechaNacimiento) return;

    const fnCtrl = this.form().get('dateBirth');
    const edadCtrl = this.form().get('age');
    if (fnCtrl && edadCtrl) {
      fnCtrl.valueChanges
        .pipe(startWith(fnCtrl.value), takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          const years = this.calcAge(val);
          edadCtrl.setValue(Number.isFinite(years as number) ? (years as number) : 0, { emitEvent: false });
        });
      if (!edadCtrl.disabled) edadCtrl.disable({ emitEvent: false });
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

  private getClients(): void {
    if (!({ ...DEFAULT_CONFIG, ...(this.config() ?? {}) }.showCliente)) return;
    this.loadingClients = true;
    this.clientService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => { this.clients = []; return of([] as Client[]); }),
        finalize(() => (this.loadingClients = false))
      )
      .subscribe((data) => (this.clients = data));
  }

  private getIntermediarios(): void {
    if (!({ ...DEFAULT_CONFIG, ...(this.config() ?? {}) }.showIntermediario)) return;
    this.loadingIntermediarios = true;
    this.intermediarioService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => { this.intermediarios = []; return of([] as Intermediario[]); }),
        finalize(() => (this.loadingIntermediarios = false))
      )
      .subscribe((data) => (this.intermediarios = data));
  }

  get f() {
    return this.form().controls ?? {};
  }
}

