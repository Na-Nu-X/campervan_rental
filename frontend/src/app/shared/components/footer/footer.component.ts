import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();

  protected readonly quickLinks = [
    { label: 'Naše karavany', path: '/karavany' },
    { label: 'Cenník a doplnková výbava', path: '/cennik-a-vybava' },
    { label: 'Tipy na trasy', path: '/tipy-na-trasy' },
    { label: 'Ako to funguje & FAQ', path: '/ako-to-funguje' },
  ] as const;

  protected socialIcon(name: string): string {
    return name.toLowerCase();
  }
}
