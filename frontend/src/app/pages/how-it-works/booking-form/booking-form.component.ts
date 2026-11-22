import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map, startWith } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { BookingRequestPayload } from '../../../core/models/api.models';
import { ApiService } from '../../../core/services/api.service';
import { CatalogStore } from '../../../core/services/catalog.store';
import { applyServerErrors, controlErrorMessage } from '../../../core/utils/form-errors';
import {
  addDays,
  isSeasonKey,
  parseIsoDate,
  quoteForDates,
  seasonDefinition,
  seasonFor,
  suggestPickupDate,
  toIsoDate,
  today,
} from '../../../core/utils/pricing';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { EurPipe } from '../../../shared/pipes/eur.pipe';
import { PluralPipe } from '../../../shared/pipes/plural.pipe';

const notInPast: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const date = parseIsoDate(control.value as string);
  return date && date < today() ? { pastDate: true } : null;
};

const returnAfterPickup: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pickup = parseIsoDate(group.get('pickup_date')?.value as string);
  const ret = parseIsoDate(group.get('return_date')?.value as string);
  return pickup && ret && ret <= pickup ? { returnBeforePickup: true } : null;
};

@Component({
  selector: 'app-booking-form',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, EurPipe, PluralPipe],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly store = inject(CatalogStore);
  private readonly route = inject(ActivatedRoute);
  private readonly scroller = inject(ViewportScroller);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly site = SITE_CONFIG;
  protected readonly campers = this.store.campers;
  protected readonly accessories = this.store.accessories;
  protected readonly minPickup = toIsoDate(today());

  protected readonly selectedAccessoryIds = signal<ReadonlySet<number>>(new Set());
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly prefillNote = signal<string | null>(null);

  private readonly travellersFitVehicle: ValidatorFn = (group) => {
    const camper = this.campers().find((c) => c.slug === group.get('vehicle')?.value);
    const adults = Number(group.get('adults_count')?.value) || 0;
    const children = Number(group.get('children_count')?.value) || 0;
    return camper && adults + children > camper.seats_driving
      ? { tooManyTravellers: camper.seats_driving }
      : null;
  };

  protected readonly form = this.fb.nonNullable.group(
    {
      vehicle: ['', Validators.required],
      pickup_date: ['', [Validators.required, notInPast]],
      return_date: ['', Validators.required],
      adults_count: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
      children_count: [0, [Validators.required, Validators.min(0), Validators.max(6)]],
      destination_region: ['', Validators.maxLength(160)],
      client_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s/()-]{8,20}$/)]],
      notes: ['', Validators.maxLength(2000)],
      consent: [false, Validators.requiredTrue],
    },
    { validators: [returnAfterPickup, this.travellersFitVehicle] },
  );

  private readonly value = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { requireSync: true },
  );

  protected readonly camper = computed(
    () => this.campers().find((c) => c.slug === this.value().vehicle) ?? null,
  );

  protected readonly selectedAccessories = computed(() => {
    const ids = this.selectedAccessoryIds();
    return this.accessories().filter((a) => ids.has(a.id));
  });

  protected readonly quote = computed(() => {
    const camper = this.camper();
    const pickup = parseIsoDate(this.value().pickup_date);
    const ret = parseIsoDate(this.value().return_date);
    if (!camper || !pickup || !ret) return null;
    return quoteForDates(camper, pickup, ret, this.selectedAccessories());
  });

  protected readonly pickupSeason = computed(() => {
    const pickup = parseIsoDate(this.value().pickup_date);
    return pickup ? seasonDefinition(seasonFor(pickup)).shortLabel : null;
  });

  protected readonly minReturn = computed(() => {
    const pickup = parseIsoDate(this.value().pickup_date);
    return toIsoDate(addDays(pickup ?? today(), 1));
  });

  constructor() {
    this.store.loadCampers();
    this.store.loadAccessories();

    // Re-validate the travellers rule once the fleet (seat counts) arrives.
    effect(() => {
      this.campers();
      untracked(() => this.form.updateValueAndValidity());
    });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.prefillFromParams(params));
  }

  protected error(name: string): string | null {
    return controlErrorMessage(this.form.get(name));
  }

  protected groupError(key: 'returnBeforePickup' | 'tooManyTravellers'): string | null {
    const errors = this.form.errors;
    if (!errors?.[key]) return null;
    if (key === 'returnBeforePickup') {
      const touched = this.form.controls.return_date.touched || this.form.controls.pickup_date.touched;
      return touched ? 'Dátum vrátenia musí byť neskôr ako dátum prevzatia.' : null;
    }
    return `Maximálny počet cestujúcich vo vybranom karavane je ${errors[key]}. Znížte počet cestujúcich alebo zvoľte väčší karavan.`;
  }

  protected toggleAccessory(id: number): void {
    this.selectedAccessoryIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected submit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Skontrolujte prosím označené polia formulára.');
      return;
    }

    const v = this.form.getRawValue();
    const quote = this.quote();
    const payload: BookingRequestPayload = {
      vehicle: v.vehicle,
      pickup_date: v.pickup_date,
      return_date: v.return_date,
      adults_count: Number(v.adults_count),
      children_count: Number(v.children_count),
      selected_accessories: this.selectedAccessories().map((a) => a.name),
      estimated_total_eur: quote ? quote.total.toFixed(2) : null,
      destination_region: v.destination_region.trim(),
      client_name: v.client_name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      notes: v.notes.trim(),
    };

    this.submitting.set(true);
    this.api.createBooking(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.scroller.scrollToAnchor('rezervacia');
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.formError.set(applyServerErrors(this.form, err));
      },
    });
  }

  protected startOver(): void {
    this.form.reset();
    this.selectedAccessoryIds.set(new Set());
    this.prefillNote.set(null);
    this.submitted.set(false);
  }

  /** Pre-fill from `?camper=…&season=…&days=…&accessories=1,2&destination=…`. */
  private prefillFromParams(params: ParamMap): void {
    const camper = params.get('camper');
    const season = params.get('season');
    const days = Number(params.get('days'));
    const destination = params.get('destination');
    const accessoryIds = (params.get('accessories') ?? '')
      .split(',')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);

    if (camper) this.form.controls.vehicle.setValue(camper);
    if (destination) this.form.controls.destination_region.setValue(destination);
    if (accessoryIds.length) this.selectedAccessoryIds.set(new Set(accessoryIds));

    const validDays = Number.isInteger(days) && days > 0 && days <= 60;
    if (isSeasonKey(season) || validDays) {
      const pickup = isSeasonKey(season) ? suggestPickupDate(season) : addDays(today(), 14);
      const ret = addDays(pickup, validDays ? days : 7);
      this.form.patchValue({ pickup_date: toIsoDate(pickup), return_date: toIsoDate(ret) });
      this.prefillNote.set(
        'Termín sme predvyplnili podľa vašej kalkulácie (najbližšia sobota v zvolenej sezóne). Pokojne ho upravte.',
      );
    }
  }
}
