import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Lightweight inline SVG icon set (24×24, 1.75 stroke, line style).
 * Paths are rendered with Angular bindings so no HTML sanitisation is needed.
 */
const ICONS: Record<string, readonly string[]> = {
  seat: ['M7 4v9a2 2 0 0 0 2 2h7', 'M7 15l-1 5', 'M16 15l2 5', 'M10 11h7a1 1 0 0 1 1 1v3'],
  bed: ['M3 18V7', 'M3 14h18v4', 'M21 14v-2a3 3 0 0 0-3-3h-7v5', 'M7 11.5a1.5 1.5 0 1 0 0-.01'],
  gear: ['M5 5v14', 'M12 5v14', 'M19 5v7', 'M5 12h14'],
  ruler: ['M3 15 15 3l6 6L9 21z', 'M7 11l2 2', 'M10 8l2 2', 'M13 5l2 2'],
  weight: ['M6 8h12l2 12H4z', 'M9 8a3 3 0 1 1 6 0'],
  license: ['M3 6h18v12H3z', 'M7 10h4', 'M7 14h6', 'M16 10h2'],
  engine: ['M4 10h3l2-3h6v3h3l2 2v4h-2v2h-4l-2-2H9v-3H4z', 'M4 8v6'],
  arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  'check-circle': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'm8 12.5 2.8 2.8L16.5 9.5'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  mail: ['M3 6h18v12H3z', 'm3 7 9 6 9-6'],
  pin: ['M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z', 'M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  shield: ['M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z', 'm9 12 2 2 4-4'],
  bike: ['M5.5 17.5a3.5 3.5 0 1 0 0-.01', 'M18.5 17.5a3.5 3.5 0 1 0 0-.01', 'M5.5 17.5 9 10h6l3.5 7.5', 'M12 17.5 9 10', 'M8 7h3', 'M15 10l-1.5-3H16'],
  grill: ['M4 10h16a8 8 0 0 1-16 0z', 'M8 18l-2 3', 'M16 18l2 3', 'M9 6c0-1 1-1 1-2', 'M14 6c0-1 1-1 1-2'],
  sup: ['M3 17c2 0 2-1.5 4.5-1.5S10 17 12 17s2-1.5 4.5-1.5S19 17 21 17', 'M3 21c2 0 2-1.5 4.5-1.5S10 21 12 21s2-1.5 4.5-1.5S19 21 21 21', 'M14 3 9 13'],
  wifi: ['M2 9a15 15 0 0 1 20 0', 'M5 12.5a10 10 0 0 1 14 0', 'M8.5 16a5 5 0 0 1 7 0', 'M12 19.5h.01'],
  sparkle: ['M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z', 'M19 3v4', 'M17 5h4'],
  tent: ['M12 4 3 20h18z', 'M12 4v16', 'M9 20l3-6 3 6'],
  parking: ['M4 4h16v16H4z', 'M9 17V7h4a3 3 0 0 1 0 6H9'],
  star: ['m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  calendar: ['M4 6h16v15H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  route: ['M6 19a2 2 0 1 0 0-.01', 'M18 7a2 2 0 1 0 0-.01', 'M6 17V9a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V9'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'm15.5 8.5-2 5-5 2 2-5z'],
  users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21a7 7 0 0 1 14 0', 'M17 3.5a4 4 0 0 1 0 7.5', 'M22 21a7 7 0 0 0-4-6.3'],
  'chevron-left': ['m15 6-6 6 6 6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  plus: ['M12 5v14', 'M5 12h14'],
  expand: ['M4 9V4h5', 'M20 9V4h-5', 'M4 15v5h5', 'M20 15v5h-5'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5', 'M12 8h.01'],
  fuel: ['M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16', 'M3 21h12', 'M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3', 'M7 8h4'],
  instagram: ['M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z', 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M17 7h.01'],
  facebook: ['M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5h3l.5-3.5h-3.5V7a1 1 0 0 1 1-1H15z'],
  youtube: ['M3 8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5z', 'm10 9 5 3-5 3z'],
  tiktok: ['M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5', 'M14 3c.5 2.5 2.5 4.5 5 4.5'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'icon',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    'aria-hidden': 'true',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly strokeWidth = input(1.75);

  protected readonly paths = computed(() => ICONS[this.name()] ?? ICONS['info']);
}
