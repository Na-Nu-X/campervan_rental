import { Pipe, PipeTransform } from '@angular/core';

import { toNumber } from '../../core/utils/pricing';

const whole = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const precise = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a number or DRF decimal string as Slovak EUR, e.g. "1 245 €". */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: string | number | null | undefined, mode: 'auto' | 'precise' = 'auto'): string {
    const amount = toNumber(value);
    if (mode === 'precise' || !Number.isInteger(amount)) {
      return precise.format(amount);
    }
    return whole.format(amount);
  }
}
