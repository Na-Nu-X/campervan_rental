import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ApiFieldErrors } from '../models/api.models';

/** Slovak message for the first client-side validation error on a control. */
export function controlErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['server']) return String(e['server']);
  if (e['required']) return 'Toto pole je povinné.';
  if (e['requiredTrue']) return 'Pre odoslanie je potrebný váš súhlas.';
  if (e['email']) return 'Zadajte platnú e-mailovú adresu.';
  if (e['minlength']) return `Zadajte aspoň ${e['minlength'].requiredLength} znakov.`;
  if (e['maxlength']) return `Maximálne ${e['maxlength'].requiredLength} znakov.`;
  if (e['min']) return `Minimálna hodnota je ${e['min'].min}.`;
  if (e['max']) return `Maximálna hodnota je ${e['max'].max}.`;
  if (e['pattern']) return 'Skontrolujte formát zadaného údaja.';
  if (e['pastDate']) return 'Dátum nemôže byť v minulosti.';
  if (e['returnBeforePickup']) return 'Dátum vrátenia musí byť neskôr ako dátum prevzatia.';
  if (e['tooManyTravellers']) return String(e['tooManyTravellers']);
  return 'Skontrolujte zadanú hodnotu.';
}

/**
 * Maps a DRF 400 response onto form controls (as `server` errors).
 * Returns a general message for non-field errors or other failures.
 */
export function applyServerErrors(form: FormGroup, error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 400 && error.error) {
    const body = error.error as ApiFieldErrors;
    const unmatched: string[] = [];
    for (const [apiField, messages] of Object.entries(body)) {
      const control = form.get(apiField);
      const message = Array.isArray(messages) ? messages.join(' ') : String(messages);
      if (control) {
        control.setErrors({ server: message });
        control.markAsTouched();
      } else {
        unmatched.push(message);
      }
    }
    return unmatched.length
      ? unmatched.join(' ')
      : 'Formulár obsahuje chyby. Skontrolujte prosím označené polia.';
  }
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.';
  }
  if (error instanceof HttpErrorResponse && error.status === 429) {
    return 'Odoslali ste príliš veľa požiadaviek. Skúste to prosím o chvíľu.';
  }
  return 'Pri odosielaní nastala neočakávaná chyba. Skúste to prosím znova alebo nám zavolajte.';
}
