import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TravelRoute } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-route-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let r = route();
    <article class="route-card" [class.route-card--wide]="layout() === 'wide'" [attr.id]="r.slug">
      <div class="route-card__media">
        <img [src]="r.cover_image_url" [alt]="r.title" loading="lazy" decoding="async" width="900" height="600" />
        <span class="pill pill--light">{{ r.region_label }}</span>
      </div>
      <div class="route-card__body">
        <ul class="route-card__meta tabular">
          <li><app-icon name="calendar" [size]="16" /> {{ r.duration_days_label }}</li>
          <li><app-icon name="route" [size]="16" /> {{ r.distance_km_label }}</li>
        </ul>
        <h3>{{ r.title }}</h3>
        <p class="route-card__summary">{{ r.summary }}</p>
        @if (layout() === 'wide') {
          <ul class="route-card__highlights">
            @for (h of r.highlights; track h) {
              <li><app-icon name="pin" [size]="16" /> {{ h }}</li>
            }
          </ul>
        }
        <ng-content />
      </div>
    </article>
  `,
  styleUrl: './route-card.component.scss',
})
export class RouteCardComponent {
  readonly route = input.required<TravelRoute>();
  readonly layout = input<'compact' | 'wide'>('compact');
}
