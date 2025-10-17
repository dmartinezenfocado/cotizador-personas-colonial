import { FormControl, FormGroup } from "@angular/forms";

export type ApplicantForm = FormGroup<{
  clientName: FormControl<string | null>;
  intermediario: FormControl<string | number | null>;
  fecha: FormControl<string | null>;
  RNC: FormControl<string | null>;
}>;
