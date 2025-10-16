// import { Component, Input, OnInit, OnDestroy, effect, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
// import { Subscription } from 'rxjs';

// @Component({
//     selector: 'app-general-data',
//     standalone: true,
//     imports: [CommonModule, ReactiveFormsModule],
//     templateUrl: './general-data.component.html',
//     styleUrls: ['./general-data.component.css']
// })
// export class GeneralDataComponent implements OnInit, OnDestroy {
//   @Input({ required: true }) form!: FormGroup;

//   @Input() submitted = false;

//   private sub?: Subscription;

//   ngOnInit(): void {
//     this.ensureValidators();

//     const ctrl = this.form.get('fechaNacimiento');
//     if (ctrl) {
//       this.sub = ctrl.valueChanges.subscribe((val) => {
//         const years = this.calcAge(val);
//         const edadCtrl = this.form.get('edad');
//         if (edadCtrl && Number.isFinite(years)) {
//           edadCtrl.setValue(years, { emitEvent: false });
//         }
//       });
//     }
//   }

//   ngOnDestroy(): void {
//     this.sub?.unsubscribe();
//   }

//   get f() {
//     return this.form?.controls ?? {};
//   }

//   private ensureValidators(): void {
//     this.setRequired('clientName');
//     this.setRequired('intermediario');
//     this.setRequired('moneda');
//     this.setRequired('formaPago');
//     this.setRequired('fecha');
//     this.setRequired('fechaNacimiento');

//     const identificationcard = this.form.get('identificationcard');
//     if (identificationcard && !identificationcard.validator) {
//       identificationcard.setValidators([
//         Validators.required,
//         Validators.pattern(/^\d{3}-\d{7}-\d$/)
//       ]);
//       identificationcard.updateValueAndValidity({ emitEvent: false });
//     }

//     const age = this.form.get('age');
//     if (age && !age.disabled) {
//       age.disable({ emitEvent: false }); 
//     }
//   }

//   private setRequired(name: string): void {
//     const c = this.form.get(name);
//     if (c && !c.validator) {
//       c.setValidators([Validators.required]);
//       c.updateValueAndValidity({ emitEvent: false });
//     }
//   }

//   private calcAge(value: unknown): number | null {
//     if (!value) return null;
//     const birth = new Date(value as string);
//     if (isNaN(birth.getTime())) return null;
//     const today = new Date();
//     let years = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
//     return years >= 0 ? years : 0;
//     }
// }
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { Client } from '../../../core/data/models/client.model';
import { ClientService } from '../../../core/data/services/client.service';
import { Intermediario } from '../../../core/data/models/intermediary.model';
import { IntermediarioService } from '../../../core/data/services/intermediary.service';


@Component({
  selector: 'app-general-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-data.component.html',
  styleUrls: ['./general-data.component.css']
})
export class GeneralDataComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Input() submitted = false;

  clients: Client[] = [];
  loadingClients = false;

  intermediarios: Intermediario[] = [];
  loadingIntermediarios = false;

  private sub?: import('rxjs').Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
     private intermediarioService: IntermediarioService,
  ) { }

  ngOnInit(): void {
    this.ensureValidators();
    this.getClients(); 
    this.getIntermediarios();

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
    this.destroy$.next();
    this.destroy$.complete();
  }

  getClients(): void {
    this.loadingClients = true;
    this.clientService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.clients = [];
          return of([] as Client[]);
        }),
        finalize(() => this.loadingClients = false)
      )
      .subscribe((data) => {
        this.clients = data;
        console.log(data);
      });
  }

  getIntermediarios(): void {
    this.loadingIntermediarios = true;
    this.intermediarioService.getAll().subscribe({
      next: (data) => (this.intermediarios = data),
      error: () => (this.intermediarios = []),
      complete: () => (this.loadingIntermediarios = false),
    });
  }

  private ensureValidators(): void {
    this.setRequired('clientName');
    this.setRequired('intermediario');
    this.setRequired('moneda');
    this.setRequired('formaPago');
    this.setRequired('fecha');
    this.setRequired('fechaNacimiento');

    const cedula = this.form.get('cedula');
    if (cedula && !cedula.validator) {
      cedula.setValidators([
        Validators.required,
        Validators.pattern(/^\d{3}-\d{7}-\d$/)
      ]);
      cedula.updateValueAndValidity({ emitEvent: false });
    }

    const age = this.form.get('edad');
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

  get f() { return this.form?.controls ?? {}; }
}
