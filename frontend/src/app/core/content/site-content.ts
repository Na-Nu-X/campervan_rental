/**
 * Static marketing copy (Slovak). Kept separate from components so a client
 * can edit reviews, FAQ and process steps without touching templates.
 */

export interface Review {
  readonly name: string;
  readonly trip: string;
  readonly text: string;
  readonly rating: number;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface ProcessStep {
  readonly title: string;
  readonly text: string;
}

export interface TrustPillar {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

export const TRUST_PILLARS: readonly TrustPillar[] = [
  {
    icon: 'sparkle',
    title: 'Nové a servisované vozidlá do 2 rokov',
    text: 'Flotilu pravidelne obnovujeme. Pred každou cestou prejde karavan servisnou kontrolou, dezinfekciou a doplnením výbavy.',
  },
  {
    icon: 'license',
    title: 'Stačí vodičský preukaz skupiny B',
    text: 'Všetky vozidlá majú celkovú hmotnosť do 3 500 kg. Žiadne ďalšie oprávnenia ani skúsenosti s karavanom nepotrebujete.',
  },
  {
    icon: 'tent',
    title: 'Kompletná výbava a SK diaľničná známka v cene',
    text: 'Riad, kempingový nábytok, markíza, plynové fľaše aj slovenská diaľničná známka – stačí pribaliť oblečenie a dobrú náladu.',
  },
  {
    icon: 'parking',
    title: 'Bezplatné strážené parkovanie vášho auta',
    text: 'Počas celej cesty u nás vaše auto bezpečne čaká na oplotenom parkovisku pod kamerovým dohľadom.',
  },
];

export const REVIEWS: readonly Review[] = [
  {
    name: 'Martina a Peter K.',
    trip: 'Sunlight T68 • Slovinsko, 9 dní',
    text: 'Zaškolenie bolo úplne v pohode, aj keď sme karavanom išli prvýkrát. Auto bolo ako nové, vo vnútri čakala káva aj tipy na kempy. Už plánujeme Nórsko!',
    rating: 5,
  },
  {
    name: 'Rodina Horváthová',
    trip: 'Dethleffs Trend A • Chorvátsko, 14 dní',
    text: 'S tromi deťmi sme sa báli, či sa zmestíme. Alkovňa bola pre deti ako hradná komnata a vďaka zľave za 14 dní nás dovolenka vyšla lacnejšie ako apartmán.',
    rating: 5,
  },
  {
    name: 'Tomáš R.',
    trip: 'VW California 4×4 • Alpy, 6 dní',
    text: 'Transparentné ceny bez skrytých poplatkov, kaucia vrátená do dvoch dní. Keď sme v Taliansku potrebovali poradiť s kúrením, asistencia zdvihla telefón o 23:00.',
    rating: 5,
  },
];

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: 'Rezervácia',
    text: 'Pošlite nezáväzný dopyt. Do 24 hodín potvrdíme dostupnosť a pošleme presnú ponuku. Termín zablokujete zálohou 30 %.',
  },
  {
    title: 'Prevzatie a 45-minútové zaškolenie',
    text: 'Na našom depe vám ukážeme všetko od kúrenia Truma až po vyprázdnenie WC. Vaše auto zatiaľ bezplatne zaparkujete u nás.',
  },
  {
    title: 'Slobodná cesta',
    text: 'Bez kilometrových limitov naprieč Európou. Pri akomkoľvek probléme je vám k dispozícii nonstop asistencia 24/7.',
  },
  {
    title: 'Vrátenie',
    text: 'Karavan vrátite s plnou nádržou a vyprázdnenými nádržami. Po kontrole vrátime kauciu do 3 pracovných dní.',
  },
];

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Aký vodičský preukaz potrebujem?',
    answer: 'Na všetky naše karavany stačí vodičský preukaz skupiny B, pretože ich celková hmotnosť nepresahuje 3 500 kg. Vodič musí mať aspoň 23 rokov a minimálne 3 roky vodičskej praxe.',
  },
  {
    question: 'Je v cene neobmedzený počet kilometrov?',
    answer: 'Áno. Pri prenájme od 7 dní sú kilometre neobmedzené. Pri kratších prenájmoch je v cene 300 km na deň, každý ďalší kilometer stojí 0,25 €.',
  },
  {
    question: 'Čo obsahuje servisný poplatok?',
    answer: 'Jednorazový servisný poplatok pokrýva dezinfekciu a upratanie interiéru, plné plynové fľaše, chémiu do WC, doplnenie AdBlue, kompletné zaškolenie pri prevzatí a slovenskú diaľničnú známku.',
  },
  {
    question: 'Ako funguje vratná kaucia?',
    answer: 'Kauciu uhrádzate pri prevzatí platobnou kartou alebo prevodom. Po vrátení vozidla bez poškodenia vám ju vrátime najneskôr do 3 pracovných dní.',
  },
  {
    question: 'Môžem si vziať psa?',
    answer: 'V označených vozidlách áno, za jednorazový príplatok 60 € na záverečné čistenie. Dajte nám o svojom štvornohom parťákovi vedieť v poznámke k rezervácii.',
  },
  {
    question: 'Do ktorých krajín môžem s karavanom cestovať?',
    answer: 'Do všetkých krajín EÚ, ako aj do Nórska, Švajčiarska, Spojeného kráľovstva a krajín západného Balkánu. Cesty mimo Európy je potrebné vopred konzultovať.',
  },
  {
    question: 'Čo ak sa mi na ceste niečo pokazí?',
    answer: 'Kontaktujte našu nonstop asistenčnú linku. Vozidlá sú kryté európskou asistenčnou službou vrátane odťahu, náhradného ubytovania a pokračovania v ceste.',
  },
  {
    question: 'Aké sú storno podmienky?',
    answer: 'Do 60 dní pred odchodom stornujete bezplatne (vraciame celú zálohu). Od 59 do 30 dní účtujeme 30 % ceny, neskôr 50 %. Termín je možné jedenkrát bezplatne presunúť.',
  },
];
