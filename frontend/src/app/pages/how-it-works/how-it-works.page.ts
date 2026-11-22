import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE_CONFIG } from '../../core/config/site.config';
import { FAQ_ITEMS, PROCESS_STEPS } from '../../core/content/site-content';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { InquiryFormComponent } from './inquiry-form/inquiry-form.component';

@Component({
  selector: 'app-how-it-works-page',
  imports: [IconComponent, BookingFormComponent, InquiryFormComponent],
  templateUrl: './how-it-works.page.html',
  styleUrl: './how-it-works.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksPage {
  protected readonly site = SITE_CONFIG;
  protected readonly steps = PROCESS_STEPS;
  protected readonly faq = FAQ_ITEMS;
}
