import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogStore } from '../../core/services/catalog.store';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RouteCardComponent } from '../../shared/components/route-card/route-card.component';

@Component({
  selector: 'app-routes-page',
  imports: [RouterLink, IconComponent, RouteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-intro">
      <div class="container">
        <p class="eyebrow">Tipy na trasy</p>
        <h1>Inšpirácie na cesty karavanom</h1>
        <p>
          Overené okruhy od našich posádok – od víkendového spoznávania Slovenska až po dva týždne
          medzi nórskymi fjordmi. Každú trasu vám pri prevzatí radi prejdeme aj s tipmi na kempy.
        </p>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container routes">
        @switch (status()) {
          @case ('ready') {
            @for (r of routes(); track r.slug) {
              <app-route-card [route]="r" layout="wide">
                <a class="btn btn--primary btn--sm route-cta" routerLink="/ako-to-funguje" fragment="rezervacia"
                   [queryParams]="{ destination: r.region_label }">
                  Naplánovať túto cestu <app-icon name="arrow" [size]="16" />
                </a>
              </app-route-card>
            } @empty {
              <p class="muted">Zatiaľ sme nepridali žiadne trasy.</p>
            }
          }
          @case ('error') {
            <p class="alert alert--error" role="alert">Trasy sa nepodarilo načítať. Skúste prosím obnoviť stránku.</p>
          }
          @default {
            @for (i of [1, 2]; track i) {
              <div class="skeleton route-skeleton"></div>
            }
          }
        }
      </div>
    </section>
  `,
  styles: `
    .routes {
      display: grid;
      gap: 2rem;
    }
    .route-skeleton {
      height: 26rem;
    }
    .route-cta {
      justify-self: start;
      margin-top: 0.5rem;
    }
  `,
})
export class RoutesPage {
  private readonly store = inject(CatalogStore);
  protected readonly routes = this.store.routes;
  protected readonly status = this.store.routesStatus;

  constructor() {
    this.store.loadRoutes();
  }
}
