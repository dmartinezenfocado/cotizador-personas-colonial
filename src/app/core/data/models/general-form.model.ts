import { FormGroup, FormControl } from '@angular/forms';

export type GeneralForm = FormGroup<{
  clientName: FormControl<string | null>;
  intermediary: FormControl<string | number | null>;
  currency: FormControl<string | null>;
  paymentMethod: FormControl<string | null>;
  date: FormControl<string | null>;
  dateBirth: FormControl<string | null>;
  age: FormControl<number | null>;
  identification: FormControl<string | null>;
}>;
