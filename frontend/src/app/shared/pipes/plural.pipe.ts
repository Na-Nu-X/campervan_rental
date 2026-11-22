import { Pipe, PipeTransform } from '@angular/core';

import { plural } from '../../core/models/labels';

/** Slovak count + noun: `{{ 4 | plural: 'miesto' : 'miesta' : 'miest' }}` -> "4 miesta". */
@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(count: number, one: string, few: string, many: string): string {
    return `${count} ${plural(count, one, few, many)}`;
  }
}
