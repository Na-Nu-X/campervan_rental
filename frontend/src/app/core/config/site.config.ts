/**
 * White-label configuration.
 *
 * Every business-specific detail of the rental company lives here, so the whole
 * site can be rebranded for a new client by editing this single file (plus the
 * colour tokens in `src/styles/_variables.scss` if the palette should change).
 */

export interface SocialLink {
  readonly name: 'Instagram' | 'Facebook' | 'YouTube' | 'TikTok';
  readonly url: string;
  readonly handle: string;
}

export interface TrustMetric {
  readonly value: string;
  readonly label: string;
}

export interface OpeningHoursRow {
  readonly days: string;
  readonly hours: string;
}

export const SITE_CONFIG = {
  companyName: 'Severka Karavany',
  legalName: 'Severka Karavany s.r.o.',
  /** Wordmark is rendered as two parts: a serif name and a small sans-serif suffix. */
  wordmark: { name: 'Severka', suffix: 'karavany' },
  tagline: 'Požičovňa karavanov a obytných áut',
  heroClaim: 'Sloboda cestovať, kam vás nesie vietor.',
  seoDescription:
    'Prenájom obytných dodávok, polointegrovaných a integrovaných karavanov a rodinných alkovní z Bratislavy. Transparentný sezónny cenník, kompletná kempingová výbava a asistencia 24/7 v celej EÚ.',

  phone: '+421 905 123 456',
  phoneHref: 'tel:+421905123456',
  email: 'rezervacie@severka-karavany.sk',

  depot: {
    label: 'Výdajné miesto Bratislava – Vajnory',
    street: 'Pri letisku 12',
    city: '831 07 Bratislava',
    country: 'Slovensko',
    mapUrl: 'https://maps.google.com/?q=Pri+letisku+12,+Bratislava',
    accessNote: '10 minút od diaľnice D1, 15 minút od letiska M. R. Štefánika.',
  },
  parkingNote:
    'Vaše auto u nás počas celej cesty parkuje bezplatne na oplotenom a kamerou stráženom parkovisku.',
  pickupTimes: 'Prevzatie 14:00 – 17:00 • Vrátenie 8:00 – 11:00',
  openingHours: [
    { days: 'Pondelok – Piatok', hours: '8:00 – 18:00' },
    { days: 'Sobota', hours: '8:00 – 13:00' },
    { days: 'Nedeľa a sviatky', hours: 'po dohode' },
  ] satisfies OpeningHoursRow[],

  legal: {
    ico: '54 321 987',
    dic: '2121 765 432',
    icDph: 'SK2121765432',
    registry: 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, odd. Sro, vl. č. 167 432/B',
  },

  licenseNote: 'Na všetky naše vozidlá stačí vodičský preukaz skupiny B (do 3,5 t), minimálny vek 23 rokov a 3 roky praxe.',
  assistanceNote: 'Nonstop asistenčná služba 24/7 v celej Európe je v cene každého prenájmu.',
  assistancePhone: '+421 2 3300 2400',

  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/', handle: '@severka.karavany' },
    { name: 'Facebook', url: 'https://www.facebook.com/', handle: 'Severka Karavany' },
    { name: 'YouTube', url: 'https://www.youtube.com/', handle: 'Severka na cestách' },
    { name: 'TikTok', url: 'https://www.tiktok.com/', handle: '@severka.vanlife' },
  ] satisfies SocialLink[],

  trustMetrics: [
    { value: '1 400+', label: 'spokojných posádok' },
    { value: '4,9 / 5', label: 'priemerné hodnotenie Google' },
    { value: '< 2 roky', label: 'priemerný vek flotily' },
    { value: '24/7', label: 'asistencia v celej EÚ' },
  ] satisfies TrustMetric[],

  /** Pricing rules shared by the estimator and the booking form. */
  pricing: {
    minDays: 3,
    maxDays: 21,
    longTripDiscounts: [
      { fromDays: 14, percent: 10 },
      { fromDays: 10, percent: 5 },
    ],
  },

  gdprNote:
    'Osobné údaje spracúvame výlučne na účely vybavenia vašej požiadavky v súlade s nariadením GDPR a zákonom č. 18/2018 Z. z.',
} as const;

export type SiteConfig = typeof SITE_CONFIG;
