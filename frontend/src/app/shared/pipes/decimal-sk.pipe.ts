import { Pipe, PipeTransform } from '@angular/core';

import { toNumber } from '../../core/utils/pricing';

/** Formats numbers with Slovak separators: 6.99 -> "6,99", 3500 -> "3 500". */
@Pipe({ name: 'decimalSk' })
export class DecimalSkPipe implements PipeTransform {
  transform(value: string | number | null | undefined, fractionDigits = 2): string {
    return new Intl.NumberFormat('sk-SK', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(toNumber(value));
  }
}
