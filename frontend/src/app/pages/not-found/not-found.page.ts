import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container not-found">
        <app-icon name="compass" [size]="44" />
        <p class="eyebrow">Chyba 404</p>
        <h1>Túto odbočku sme na mape nenašli</h1>
        <p class="muted">Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.</p>
        <div class="actions">
          <a class="btn btn--primary" routerLink="/">Späť na úvod</a>
          <a class="btn btn--ghost" routerLink="/karavany">Prezrieť karavany</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      justify-items: center;
      gap: 1rem;
      text-align: center;
      padding-block: 3rem;
    }
    app-icon {
      color: var(--color-amber);
    }
    h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      max-width: 18ch;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
  `,
})
export class NotFoundPage {}
