import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { plural } from '../../../core/models/labels';
import { CatalogStore } from '../../../core/services/catalog.store';
import {
  SEASONS,
  SeasonKey,
  dailyRateFor,
  quoteForSeason,
} from '../../../core/utils/pricing';
import { EurPipe } from '../../pipes/eur.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-camper-trip-and-cost-estimator',
  imports: [EurPipe, IconComponent],
  templateUrl: './camper-trip-and-cost-estimator.component.html',
  styleUrl: './camper-trip-and-cost-estimator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamperTripAndCostEstimatorComponent {
  private readonly store = inject(CatalogStore);
  private readonly router = inject(Router);

  /** Optional slug to preselect (e.g. on the camper detail page). */
  readonly initialCamperSlug = input<string | null>(null);
  readonly heading = input('Kalkulačka ceny vašej cesty');

  protected readonly seasons = SEASONS;
  protected readonly minDays = SITE_CONFIG.pricing.minDays;
  protected readonly maxDays = SITE_CONFIG.pricing.maxDays;
  protected readonly discountRules = [...SITE_CONFIG.pricing.longTripDiscounts].reverse();

  protected readonly campers = this.store.campers;
  protected readonly accessories = this.store.accessories;
  protected readonly loading = computed(
    () => this.store.campersStatus() === 'loading' || this.store.campersStatus() === 'idle',
  );
  protected readonly loadError = computed(() => this.store.campersStatus() === 'error');

  /** Follows the preselected slug / first featured camper until the user picks one. */
  protected readonly selectedSlug = linkedSignal<string>(() => {
    const campers = this.campers();
    const initial = this.initialCamperSlug();
    if (initial && campers.some((c) => c.slug === initial)) return initial;
    return (campers.find((c) => c.is_featured) ?? campers[0])?.slug ?? '';
  });
  protected readonly season = signal<SeasonKey>('mid');
  protected readonly days = signal(7);
  protected readonly selectedAccessoryIds = signal<ReadonlySet<number>>(new Set());

  protected readonly camper = computed(
    () => this.campers().find((c) => c.slug === this.selectedSlug()) ?? null,
  );

  protected readonly selectedAccessories = computed(() => {
    const ids = this.selectedAccessoryIds();
    return this.accessories().filter((a) => ids.has(a.id));
  });

  protected readonly quote = computed(() => {
    const camper = this.camper();
    return camper
      ? quoteForSeason(camper, this.season(), this.days(), this.selectedAccessories())
      : null;
  });

  protected readonly seasonRates = computed<Partial<Record<SeasonKey, number>>>(() => {
    const camper = this.camper();
    if (!camper) return {};
    return { low: dailyRateFor(camper, 'low'), mid: dailyRateFor(camper, 'mid'), high: dailyRateFor(camper, 'high') };
  });

  /** Progress of the range slider in % – drives the filled track styling. */
  protected readonly sliderProgress = computed(
    () => ((this.days() - this.minDays) / (this.maxDays - this.minDays)) * 100,
  );

  protected readonly nextDiscountHint = computed(() => {
    const next = this.discountRules.find((r) => this.days() < r.fromDays);
    if (!next) return null;
    const missing = next.fromDays - this.days();
    return `Pridajte ešte ${this.daysLabel(missing)} a získate zľavu -${next.percent} %`;
  });

  constructor() {
    this.store.loadCampers();
    this.store.loadAccessories();
  }

  protected daysLabel(n: number): string {
    return `${n} ${plural(n, 'deň', 'dni', 'dní')}`;
  }

  protected onCamperChange(event: Event): void {
    this.selectedSlug.set((event.target as HTMLSelectElement).value);
  }

  protected onDaysInput(event: Event): void {
    this.days.set(Number((event.target as HTMLInputElement).value));
  }

  protected toggleAccessory(id: number): void {
    this.selectedAccessoryIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected requestAvailability(): void {
    const camper = this.camper();
    if (!camper) return;
    const accessories = [...this.selectedAccessoryIds()];
    this.router.navigate(['/ako-to-funguje'], {
      queryParams: {
        camper: camper.slug,
        season: this.season(),
        days: this.days(),
        accessories: accessories.length ? accessories.join(',') : null,
      },
      fragment: 'rezervacia',
    });
  }
}
