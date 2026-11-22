import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CamperSummary } from '../../../core/models/api.models';
import { plural } from '../../../core/models/labels';
import { DecimalSkPipe } from '../../pipes/decimal-sk.pipe';
import { EurPipe } from '../../pipes/eur.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-camper-card',
  imports: [RouterLink, IconComponent, EurPipe, DecimalSkPipe],
  templateUrl: './camper-card.component.html',
  styleUrl: './camper-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamperCardComponent {
  readonly camper = input.required<CamperSummary>();
  /** Use eager loading for above-the-fold cards. */
  readonly priority = input(false);

  protected readonly seatsLabel = computed(() => {
    const n = this.camper().seats_driving;
    return `${n} ${plural(n, 'miesto', 'miesta', 'miest')}`;
  });

  protected readonly berthsLabel = computed(() => {
    const n = this.camper().berths_sleeping;
    return `${n} ${plural(n, 'lôžko', 'lôžka', 'lôžok')}`;
  });

  /** Model name without the trailing "(category)" note shown in the pill instead. */
  protected readonly shortName = computed(() => this.camper().name.replace(/\s*\([^)]*\)\s*$/, ''));
  protected readonly subtitle = computed(() => /\(([^)]*)\)\s*$/.exec(this.camper().name)?.[1] ?? '');
}
