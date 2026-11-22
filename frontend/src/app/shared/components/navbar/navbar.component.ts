import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

interface NavLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly site = SITE_CONFIG;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'Naše karavany', path: '/karavany' },
    { label: 'Cenník a výbava', path: '/cennik-a-vybava' },
    { label: 'Tipy na trasy', path: '/tipy-na-trasy' },
    { label: 'Ako to funguje & FAQ', path: '/ako-to-funguje' },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuOpen.set(false));

    effect(() => {
      this.document.body.classList.toggle('is-scroll-locked', this.menuOpen());
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onScroll(): void {
    const isScrolled = (this.document.defaultView?.scrollY ?? 0) > 8;
    if (isScrolled !== this.scrolled()) this.scrolled.set(isScrolled);
  }
}
