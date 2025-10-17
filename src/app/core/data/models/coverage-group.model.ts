import { FormArray, FormControl, FormGroup } from "@angular/forms";

export type CoverageGroup = FormGroup<{
  selected: FormControl<boolean>;
  amount: FormControl<number | null>;
  amounts?: FormArray<FormControl<number | null>>; 
}>;