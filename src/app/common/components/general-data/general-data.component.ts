import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { of, startWith } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Client } from '../../../core/data/models/client.model';
import { ClientService } from '../../../core/data/services/client.service';
import { Intermediario } from '../../../core/data/models/intermediary.model';
import { IntermediarioService } from '../../../core/data/services/intermediary.service';
import { GeneralForm } from '../../../core/data/models/general-form.model';


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
  clients: Client[] = [];
  loadingClients = false;
  intermediarios: Intermediario[] = [];
  loadingIntermediarios = false;

  private readonly clientService = inject(ClientService);
  private readonly intermediarioService = inject(IntermediarioService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.ensureValidators();
    this.calculateAge();
    this.getClients();
    this.getIntermediarios();
  }

  calculateAge(): void{
    const fnCtrl = this.form().get('fechaNacimiento');
    const edadCtrl = this.form().get('edad');
    if (fnCtrl && edadCtrl) {
      fnCtrl.valueChanges
        .pipe(
          startWith(fnCtrl.value),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((val) => {
          const years = this.calcAge(val);
          edadCtrl.setValue(Number.isFinite(years as number) ? (years as number) : 0, { emitEvent: false });
        });

      if (!edadCtrl.disabled) edadCtrl.disable({ emitEvent: false });
    }
  }

  private getClients(): void {
    this.loadingClients = true;
    this.clientService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.clients = [];
          return of([] as Client[]);
        }),
        finalize(() => (this.loadingClients = false))
      )
      .subscribe((data) => (this.clients = data));
  }


  private getIntermediarios(): void {
    this.loadingIntermediarios = true;
    this.intermediarioService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.intermediarios = [];
          return of([] as Intermediario[]);
        }),
        finalize(() => (this.loadingIntermediarios = false))
      )
      .subscribe((data) => (this.intermediarios = data));
  }

  private ensureValidators(): void {
    this.addRequired('clientName');
    this.addRequired('intermediario');
    this.addRequired('moneda');
    this.addRequired('formaPago');
    this.addRequired('fecha');
    this.addRequired('fechaNacimiento');

    const cedula = this.form().get('cedula');
    if (cedula) {
      cedula.addValidators([
        Validators.required,
        Validators.pattern(/^\d{3}-\d{7}-\d$/),
      ]);
      cedula.updateValueAndValidity({ emitEvent: false });
    }
  }

  private addRequired(name: keyof GeneralForm['controls'] | string): void {
    const c = this.form().get(name as string);
    if (!c) return;
    c.addValidators(Validators.required);
    c.updateValueAndValidity({ emitEvent: false });
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

  get f() {
    return this.form().controls ?? {};
  }
}

