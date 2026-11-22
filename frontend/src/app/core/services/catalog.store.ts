import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { CamperSummary, ExtraAccessory, TravelRoute } from '../models/api.models';
import { ApiService } from './api.service';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface Collection<T> {
  readonly items: ReturnType<typeof signal<T[]>>;
  readonly status: ReturnType<typeof signal<LoadStatus>>;
}

/**
 * Signal-based cache for catalogue data shared across pages
 * (full fleet, accessories, route guides). Each collection is fetched once.
 */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(ApiService);

  private readonly campersState: Collection<CamperSummary> = this.collection();
  private readonly accessoriesState: Collection<ExtraAccessory> = this.collection();
  private readonly routesState: Collection<TravelRoute> = this.collection();

  readonly campers = this.campersState.items.asReadonly();
  readonly campersStatus = this.campersState.status.asReadonly();
  readonly accessories = this.accessoriesState.items.asReadonly();
  readonly accessoriesStatus = this.accessoriesState.status.asReadonly();
  readonly routes = this.routesState.items.asReadonly();
  readonly routesStatus = this.routesState.status.asReadonly();

  readonly featuredCampers = computed(() => this.campers().filter((c) => c.is_featured));

  loadCampers(): void {
    this.load(this.campersState, () => this.api.getCampers());
  }

  loadAccessories(): void {
    this.load(this.accessoriesState, () => this.api.getAccessories());
  }

  loadRoutes(): void {
    this.load(this.routesState, () => this.api.getRoutes());
  }

  private collection<T>(): Collection<T> {
    return { items: signal<T[]>([]), status: signal<LoadStatus>('idle') };
  }

  private load<T>(state: Collection<T>, request: () => Observable<T[]>): void {
    const status = state.status();
    if (status === 'loading' || status === 'ready') return;
    state.status.set('loading');
    request().subscribe({
      next: (items) => {
        state.items.set(items);
        state.status.set('ready');
      },
      error: () => state.status.set('error'),
    });
  }
}
