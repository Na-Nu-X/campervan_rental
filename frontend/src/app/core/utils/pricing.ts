import { SITE_CONFIG } from '../config/site.config';
import { CamperSummary, ExtraAccessory } from '../models/api.models';

export type SeasonKey = 'low' | 'mid' | 'high';

export interface SeasonDefinition {
  readonly key: SeasonKey;
  readonly label: string;
  readonly shortLabel: string;
  readonly months: string;
  /** JavaScript month indexes (0 = January). */
  readonly monthIndexes: readonly number[];
}

export const SEASONS: readonly SeasonDefinition[] = [
  {
    key: 'low',
    label: 'Mimosezóna (Október – Apríl)',
    shortLabel: 'Mimosezóna',
    months: 'Október – Apríl',
    monthIndexes: [9, 10, 11, 0, 1, 2, 3],
  },
  {
    key: 'mid',
    label: 'Stredná sezóna (Máj, Jún, September)',
    shortLabel: 'Stredná sezóna',
    months: 'Máj, Jún, September',
    monthIndexes: [4, 5, 8],
  },
  {
    key: 'high',
    label: 'Hlavná letná sezóna (Júl – August)',
    shortLabel: 'Hlavná sezóna',
    months: 'Júl – August',
    monthIndexes: [6, 7],
  },
];

export interface Quote {
  days: number;
  /** Average daily rate before discount. */
  dailyRate: number;
  rentalSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  accessoriesTotal: number;
  serviceFee: number;
  total: number;
  deposit: number;
}

export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isSeasonKey(value: string | null): value is SeasonKey {
  return value === 'low' || value === 'mid' || value === 'high';
}

export function seasonFor(date: Date): SeasonKey {
  const month = date.getMonth();
  return SEASONS.find((s) => s.monthIndexes.includes(month))?.key ?? 'low';
}

export function seasonDefinition(key: SeasonKey): SeasonDefinition {
  return SEASONS.find((s) => s.key === key) ?? SEASONS[0];
}

export function dailyRateFor(camper: CamperSummary, season: SeasonKey): number {
  switch (season) {
    case 'high':
      return toNumber(camper.high_season_price_eur);
    case 'mid':
      return toNumber(camper.mid_season_price_eur);
    default:
      return toNumber(camper.low_season_price_eur);
  }
}

export function longTripDiscountPercent(days: number): number {
  const rule = SITE_CONFIG.pricing.longTripDiscounts.find((r) => days >= r.fromDays);
  return rule?.percent ?? 0;
}

export function accessoryCost(accessory: ExtraAccessory, days: number): number {
  const price = toNumber(accessory.price_eur);
  return accessory.pricing_type === 'za_den' ? price * days : price;
}

/**
 * Builds a full quote from per-day rates (one rate per rental day).
 * The long-trip discount applies to the vehicle rental only.
 */
export function buildQuote(
  camper: CamperSummary,
  perDayRates: readonly number[],
  accessories: readonly ExtraAccessory[],
): Quote {
  const days = perDayRates.length;
  const rentalSubtotal = perDayRates.reduce((sum, rate) => sum + rate, 0);
  const discountPercent = longTripDiscountPercent(days);
  const discountAmount = round2((rentalSubtotal * discountPercent) / 100);
  const accessoriesTotal = accessories.reduce((sum, a) => sum + accessoryCost(a, days), 0);
  const serviceFee = toNumber(camper.service_prep_fee_eur);

  return {
    days,
    dailyRate: days ? round2(rentalSubtotal / days) : 0,
    rentalSubtotal,
    discountPercent,
    discountAmount,
    accessoriesTotal,
    serviceFee,
    total: round2(rentalSubtotal - discountAmount + accessoriesTotal + serviceFee),
    deposit: toNumber(camper.security_deposit_eur),
  };
}

/** Quote for a fixed season and number of days (used by the estimator widget). */
export function quoteForSeason(
  camper: CamperSummary,
  season: SeasonKey,
  days: number,
  accessories: readonly ExtraAccessory[],
): Quote {
  const rate = dailyRateFor(camper, season);
  return buildQuote(camper, Array.from({ length: days }, () => rate), accessories);
}

/** Quote for concrete dates – every rental day is priced by its own season. */
export function quoteForDates(
  camper: CamperSummary,
  pickup: Date,
  returnDate: Date,
  accessories: readonly ExtraAccessory[],
): Quote | null {
  const days = daysBetween(pickup, returnDate);
  if (days <= 0) return null;
  const rates = Array.from({ length: days }, (_, i) =>
    dailyRateFor(camper, seasonFor(addDays(pickup, i))),
  );
  return buildQuote(camper, rates, accessories);
}

// ---------------------------------------------------------------------------
// Date helpers (local dates, ISO yyyy-mm-dd strings for <input type="date">)
// ---------------------------------------------------------------------------

export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round(ms / 86_400_000);
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * First Saturday at least two weeks from today that falls into the given season –
 * a sensible default pickup date when a traveller arrives from the estimator.
 */
export function suggestPickupDate(season: SeasonKey, from: Date = today()): Date {
  let candidate = addDays(from, 14);
  for (let i = 0; i < 400; i++) {
    if (candidate.getDay() === 6 && seasonFor(candidate) === season) return candidate;
    candidate = addDays(candidate, 1);
  }
  return addDays(from, 14);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
