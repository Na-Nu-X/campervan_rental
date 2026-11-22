import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { CamperDetail, CamperImage } from '../../core/models/api.models';
import { plural } from '../../core/models/labels';
import { ApiService } from '../../core/services/api.service';
import { SEASONS, dailyRateFor } from '../../core/utils/pricing';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CamperTripAndCostEstimatorComponent } from '../../shared/components/trip-estimator/camper-trip-and-cost-estimator.component';
import { DecimalSkPipe } from '../../shared/pipes/decimal-sk.pipe';
import { EurPipe } from '../../shared/pipes/eur.pipe';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; notFound: boolean }
  | { status: 'ready'; camper: CamperDetail };

@Component({
  selector: 'app-camper-detail-page',
  imports: [RouterLink, IconComponent, EurPipe, CamperTripAndCostEstimatorComponent],
  templateUrl: './camper-detail.page.html',
  styleUrl: './camper-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class CamperDetailPage {
  private readonly api = inject(ApiService);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly seasons = SEASONS;
  protected readonly site = SITE_CONFIG;

  protected readonly state = signal<LoadState>({ status: 'loading' });
  protected readonly camper = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.camper : null;
  });

  protected readonly activeIndex = signal(0);
  protected readonly lightboxOpen = signal(false);

  protected readonly gallery = computed<CamperImage[]>(() => {
    const camper = this.camper();
    if (!camper) return [];
    if (camper.images.length) return camper.images;
    return [{ id: 0, image_url: camper.cover_image_url, caption: camper.name, display_order: 0 }];
  });

  protected readonly activeImage = computed(() => this.gallery()[this.activeIndex()] ?? null);

  protected readonly specs = computed(() => {
    const c = this.camper();
    if (!c) return [];
    return [
      { icon: 'seat', label: 'Miesta na jazdu', value: `${c.seats_driving} ${plural(c.seats_driving, 'miesto', 'miesta', 'miest')}` },
      { icon: 'bed', label: 'Lôžka na spanie', value: `${c.berths_sleeping} ${plural(c.berths_sleeping, 'lôžko', 'lôžka', 'lôžok')}` },
      { icon: 'gear', label: 'Prevodovka', value: c.transmission_label },
      { icon: 'engine', label: 'Motor', value: c.engine_spec },
      { icon: 'ruler', label: 'Dĺžka', value: `${new DecimalSkPipe().transform(c.length_meters)} m` },
      { icon: 'weight', label: 'Hmotnosť', value: `do ${new DecimalSkPipe().transform(c.weight_max_kg, 0)} kg` },
      { icon: 'license', label: 'Vodičský preukaz', value: 'Skupina B' },
    ];
  });

  protected readonly seasonRows = computed(() => {
    const c = this.camper();
    return c ? this.seasons.map((s) => ({ ...s, rate: dailyRateFor(c, s.key) })) : [];
  });

  constructor() {
    toObservable(this.slug)
      .pipe(
        tap(() => {
          this.state.set({ status: 'loading' });
          this.activeIndex.set(0);
          this.lightboxOpen.set(false);
        }),
        switchMap((slug) =>
          this.api.getCamper(slug).pipe(
            map((camper): LoadState => ({ status: 'ready', camper })),
            catchError((err: { status?: number }) =>
              of<LoadState>({ status: 'error', notFound: err?.status === 404 }),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => {
        this.state.set(state);
        if (state.status === 'ready') {
          this.title.setTitle(`${state.camper.name} | ${SITE_CONFIG.companyName}`);
        }
      });

    effect(() => {
      this.document.body.classList.toggle('is-scroll-locked', this.lightboxOpen());
    });
  }

  protected select(index: number): void {
    this.activeIndex.set(index);
  }

  protected openLightbox(index = this.activeIndex()): void {
    this.activeIndex.set(index);
    this.lightboxOpen.set(true);
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  protected step(delta: number): void {
    const count = this.gallery().length;
    if (!count) return;
    this.activeIndex.update((i) => (i + delta + count) % count);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
  }
}
