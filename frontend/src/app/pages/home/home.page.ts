import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { REVIEWS, TRUST_PILLARS } from '../../core/content/site-content';
import { CamperCategory, Transmission } from '../../core/models/api.models';
import { CATEGORY_OPTIONS, TRANSMISSION_OPTIONS } from '../../core/models/labels';
import { CatalogStore } from '../../core/services/catalog.store';
import { CamperCardComponent } from '../../shared/components/camper-card/camper-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RouteCardComponent } from '../../shared/components/route-card/route-card.component';
import { CamperTripAndCostEstimatorComponent } from '../../shared/components/trip-estimator/camper-trip-and-cost-estimator.component';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1515876305430-f06edab8282a?auto=format&fit=crop&w=2400&q=80';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    CamperCardComponent,
    CamperTripAndCostEstimatorComponent,
    IconComponent,
    RouteCardComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly store = inject(CatalogStore);
  private readonly router = inject(Router);

  protected readonly site = SITE_CONFIG;
  protected readonly heroImage = HERO_IMAGE;
  protected readonly pillars = TRUST_PILLARS;
  protected readonly reviews = REVIEWS;
  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly transmissionOptions = TRANSMISSION_OPTIONS;
  protected readonly peopleOptions = [2, 3, 4, 5, 6];

  /** Three featured campers fill one row of the editorial grid. */
  protected readonly featured = computed(() => this.store.featuredCampers().slice(0, 3));
  protected readonly campersStatus = this.store.campersStatus;
  protected readonly routes = computed(() => this.store.routes().slice(0, 3));
  protected readonly routesStatus = this.store.routesStatus;

  // Quick filter state
  protected readonly people = signal<number | null>(null);
  protected readonly category = signal<CamperCategory | null>(null);
  protected readonly transmission = signal<Transmission | null>(null);

  constructor() {
    this.store.loadCampers();
    this.store.loadRoutes();
  }

  protected setPeople(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.people.set(value ? Number(value) : null);
  }

  protected setCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.category.set((value || null) as CamperCategory | null);
  }

  protected setTransmission(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.transmission.set((value || null) as Transmission | null);
  }

  protected searchFleet(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/karavany'], {
      queryParams: {
        min_berths: this.people(),
        category: this.category(),
        transmission: this.transmission(),
      },
    });
  }

  protected stars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}
