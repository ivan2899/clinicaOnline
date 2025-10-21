import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dniValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;
  return /^\d{8}$/.test(value) ? null : { invalidDni: true };
};
