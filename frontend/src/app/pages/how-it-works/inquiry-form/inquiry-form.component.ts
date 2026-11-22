import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { ApiService } from '../../../core/services/api.service';
import { applyServerErrors, controlErrorMessage } from '../../../core/utils/form-errors';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-inquiry-form',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sent()) {
      <div class="alert alert--success" role="status">
        <app-icon name="check-circle" [size]="20" />
        <span>Ďakujeme! Ozveme sa vám najneskôr do nasledujúceho pracovného dňa.</span>
      </div>
    } @else {
      <form class="inquiry" [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Otázka pred prvou cestou">
        <div class="field">
          <label class="field__label" for="iq-name">Meno a priezvisko *</label>
          <input id="iq-name" class="input" formControlName="client_name" autocomplete="name" [class.is-invalid]="error('client_name')" />
          @if (error('client_name'); as msg) { <p class="field__error">{{ msg }}</p> }
        </div>
        <div class="inquiry__row">
          <div class="field">
            <label class="field__label" for="iq-email">E-mail *</label>
            <input id="iq-email" type="email" class="input" formControlName="email" autocomplete="email" [class.is-invalid]="error('email')" />
            @if (error('email'); as msg) { <p class="field__error">{{ msg }}</p> }
          </div>
          <div class="field">
            <label class="field__label" for="iq-phone">Telefón</label>
            <input id="iq-phone" type="tel" class="input tabular" formControlName="phone" autocomplete="tel" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="iq-message">Vaša otázka *</label>
          <textarea id="iq-message" class="textarea" formControlName="message" rows="4"
            placeholder="Napríklad: Ideme karavanom prvýkrát s deťmi, ktorý model odporúčate?"
            [class.is-invalid]="error('message')"></textarea>
          @if (error('message'); as msg) { <p class="field__error">{{ msg }}</p> }
        </div>
        @if (formError(); as msg) {
          <p class="alert alert--error" role="alert">{{ msg }}</p>
        }
        <button type="submit" class="btn btn--primary" [disabled]="submitting()">
          {{ submitting() ? 'Odosielam…' : 'Odoslať otázku' }}
        </button>
        <p class="inquiry__gdpr">{{ gdpr }}</p>
      </form>
    }
  `,
  styles: `
    .inquiry {
      display: grid;
      gap: 1rem;
    }
    .inquiry__row {
      display: grid;
      gap: 1rem;
    }
    @media (min-width: 560px) {
      .inquiry__row {
        grid-template-columns: 1fr 1fr;
      }
    }
    .inquiry button {
      justify-self: start;
    }
    .inquiry__gdpr {
      font-size: 0.78rem;
      color: var(--color-ink-soft);
    }
  `,
})
export class InquiryFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  protected readonly gdpr = SITE_CONFIG.gdprNote;
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    client_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]],
  });

  protected error(name: string): string | null {
    return controlErrorMessage(this.form.get(name));
  }

  protected submit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.createInquiry(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.sent.set(true);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.formError.set(applyServerErrors(this.form, err));
      },
    });
  }
}
