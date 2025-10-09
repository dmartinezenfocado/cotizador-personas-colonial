import {FormGroup} from "@angular/forms";

export function MatchValidator(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors['matchValidator']) {
      return;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({matchValidator: true});
    } else {
      matchingControl.setErrors(null);
    }
  }
}
