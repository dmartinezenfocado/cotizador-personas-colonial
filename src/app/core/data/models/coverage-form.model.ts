import { FormArray, FormControl } from '@angular/forms';

export type AmountType = number | null;

export interface CoverageForm {
  selected: FormControl<boolean>;
  amount: FormControl<AmountType>;
  amounts?: FormArray<FormControl<AmountType>>; 
}


export type SelectionMode = 'checkbox' | 'always';
export type EditableRows = readonly number[] | 'firstLast';
