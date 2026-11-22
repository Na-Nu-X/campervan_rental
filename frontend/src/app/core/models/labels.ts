import { CamperCategory, Transmission } from './api.models';

export interface Option<T> {
  readonly value: T;
  readonly label: string;
}

export const CATEGORY_OPTIONS: readonly Option<CamperCategory>[] = [
  { value: 'polointegrovany', label: 'Polointegrovaný' },
  { value: 'integrovany', label: 'Integrovaný' },
  { value: 'alkovna', label: 'Alkovňa' },
  { value: 'campervan', label: 'Campervan' },
];

export const TRANSMISSION_OPTIONS: readonly Option<Transmission>[] = [
  { value: 'automat', label: 'Automat' },
  { value: 'manual', label: 'Manuál' },
];

export const BERTH_OPTIONS: readonly Option<number>[] = [
  { value: 2, label: '2 a viac' },
  { value: 4, label: '4 a viac' },
  { value: 6, label: '6 a viac' },
];

export const MAX_PRICE_OPTIONS: readonly Option<number>[] = [
  { value: 100, label: 'do 100 € / deň' },
  { value: 120, label: 'do 120 € / deň' },
  { value: 140, label: 'do 140 € / deň' },
  { value: 170, label: 'do 170 € / deň' },
];

export const ORDERING_OPTIONS: readonly Option<string>[] = [
  { value: 'display_order', label: 'Odporúčané' },
  { value: 'low_season_price_eur', label: 'Cena od najnižšej' },
  { value: '-low_season_price_eur', label: 'Cena od najvyššej' },
  { value: '-berths_sleeping', label: 'Najviac lôžok' },
  { value: 'length_meters', label: 'Najkompaktnejšie' },
];

export function isCategory(value: string | null): value is CamperCategory {
  return CATEGORY_OPTIONS.some((o) => o.value === value);
}

export function isTransmission(value: string | null): value is Transmission {
  return TRANSMISSION_OPTIONS.some((o) => o.value === value);
}

/** Slovak plural forms: 1 miesto, 2–4 miesta, 5+ miest. */
export function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}
