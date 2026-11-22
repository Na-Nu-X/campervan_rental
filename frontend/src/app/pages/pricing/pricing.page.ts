import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { CatalogStore } from '../../core/services/catalog.store';
import { SEASONS } from '../../core/utils/pricing';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CamperTripAndCostEstimatorComponent } from '../../shared/components/trip-estimator/camper-trip-and-cost-estimator.component';
import { EurPipe } from '../../shared/pipes/eur.pipe';
import { PluralPipe } from '../../shared/pipes/plural.pipe';

@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink, IconComponent, EurPipe, PluralPipe, CamperTripAndCostEstimatorComponent],
  templateUrl: './pricing.page.html',
  styleUrl: './pricing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPage {
  private readonly store = inject(CatalogStore);

  protected readonly site = SITE_CONFIG;
  protected readonly seasons = SEASONS;
  protected readonly discountRules = [...SITE_CONFIG.pricing.longTripDiscounts].sort(
    (a, b) => a.fromDays - b.fromDays,
  );
  protected readonly campers = this.store.campers;
  protected readonly campersStatus = this.store.campersStatus;
  protected readonly accessories = this.store.accessories;
  protected readonly accessoriesStatus = this.store.accessoriesStatus;

  protected readonly serviceFeeIncludes = [
    'Plné plynové fľaše (2 × 11 kg)',
    'Chémia do WC a toaletný papier na prvé dni',
    'Kompletné 45-minútové zaškolenie pri prevzatí',
    'Dôkladné upratanie a dezinfekcia interiéru',
    'Doplnenie AdBlue a prevádzkových kvapalín',
    'Slovenská diaľničná známka na celé obdobie',
  ];

  protected readonly alwaysIncluded = [
    { icon: 'shield', text: 'Havarijné a zákonné poistenie s asistenciou 24/7 v celej Európe' },
    { icon: 'route', text: 'Neobmedzené kilometre pri prenájme od 7 dní' },
    { icon: 'tent', text: 'Kempingový stôl, stoličky, riad a kuchynská výbava' },
    { icon: 'parking', text: 'Bezplatné strážené parkovanie vášho auta na našom depe' },
  ];

  constructor() {
    this.store.loadCampers();
    this.store.loadAccessories();
  }
}
