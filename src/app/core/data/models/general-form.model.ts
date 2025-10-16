import { FormGroup, FormControl } from '@angular/forms';

export type GeneralForm = FormGroup<{
  clientName: FormControl<string | null>;
  intermediario: FormControl<string | number | null>;
  moneda: FormControl<string | null>;
  formaPago: FormControl<string | null>;
  fecha: FormControl<string | null>;
  fechaNacimiento: FormControl<string | null>;
  edad: FormControl<number | null>;
  cedula: FormControl<string | null>;
}>;
