import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { CamperFilters, CamperSummary } from '../../core/models/api.models';
import {
  BERTH_OPTIONS,
  CATEGORY_OPTIONS,
  MAX_PRICE_OPTIONS,
  ORDERING_OPTIONS,
  TRANSMISSION_OPTIONS,
  isCategory,
  isTransmission,
  plural,
} from '../../core/models/labels';
import { ApiService } from '../../core/services/api.service';
import { CamperCardComponent } from '../../shared/components/camper-card/camper-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

type FilterKey = 'category' | 'transmission' | 'min_berths' | 'max_price' | 'ordering';

function positiveInt(value: string | null): number | null {
  const n = Number(value);
  return value && Number.isInteger(n) && n > 0 ? n : null;
}

/** Translate URL query params into a validated API filter object. */
function filtersFromParams(params: ParamMap): CamperFilters {
  const category = params.get('category');
  const transmission = params.get('transmission');
  const ordering = params.get('ordering');
  return {
    category: isCategory(category) ? category : null,
    transmission: isTransmission(transmission) ? transmission : null,
    min_berths: positiveInt(params.get('min_berths')),
    max_price: positiveInt(params.get('max_price')),
    ordering: ORDERING_OPTIONS.some((o) => o.value === ordering) ? ordering : null,
  };
}

@Component({
  selector: 'app-fleet-page',
  imports: [RouterLink, CamperCardComponent, IconComponent],
  templateUrl: './fleet.page.html',
  styleUrl: './fleet.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly transmissionOptions = TRANSMISSION_OPTIONS;
  protected readonly berthOptions = BERTH_OPTIONS;
  protected readonly maxPriceOptions = MAX_PRICE_OPTIONS;
  protected readonly orderingOptions = ORDERING_OPTIONS;

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly filtersOpen = signal(false);

  /** Active filters – the URL is the single source of truth. */
  protected readonly filters = toSignal(
    this.route.queryParamMap.pipe(map(filtersFromParams)),
    { initialValue: filtersFromParams(this.route.snapshot.queryParamMap) },
  );

  protected readonly campers = toSignal(
    this.route.queryParamMap.pipe(
      map(filtersFromParams),
      tap(() => {
        this.loading.set(true);
        this.error.set(false);
      }),
      switchMap((filters) =>
        this.api.getCampers(filters).pipe(
          catchError(() => {
            this.error.set(true);
            return of([] as CamperSummary[]);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
      takeUntilDestroyed(),
    ),
    { initialValue: [] as CamperSummary[] },
  );

  protected readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return [f.category, f.transmission, f.min_berths, f.max_price].filter((v) => v !== null).length;
  });

  protected readonly resultLabel = computed(() => {
    const n = this.campers().length;
    return `${n} ${plural(n, 'vozidlo', 'vozidlá', 'vozidiel')}`;
  });

  protected setFilter(key: FilterKey, value: string | number | null): void {
    const normalized = value === '' || value === null || value === this.filters()[key] ? null : value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: normalized },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onSelect(key: FilterKey, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected resetFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }
}
