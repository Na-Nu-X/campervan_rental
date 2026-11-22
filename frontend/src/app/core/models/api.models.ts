/** Decimal values arrive from Django REST Framework as strings (e.g. "145.00"). */
export type DecimalString = string;

export type CamperCategory = 'polointegrovany' | 'integrovany' | 'alkovna' | 'campervan';
export type Transmission = 'automat' | 'manual';
export type CamperBadge = 'top_volba' | 'novinka' | 'automat' | 'pre_rodiny' | 'none';
export type PricingType = 'za_den' | 'za_pobyt';

export interface CamperSummary {
  id: number;
  name: string;
  slug: string;
  category: CamperCategory;
  category_label: string;
  seats_driving: number;
  berths_sleeping: number;
  transmission: Transmission;
  transmission_label: string;
  engine_spec: string;
  length_meters: DecimalString;
  weight_max_kg: number;
  license_note: string;
  low_season_price_eur: DecimalString;
  mid_season_price_eur: DecimalString;
  high_season_price_eur: DecimalString;
  starting_price_eur: DecimalString;
  service_prep_fee_eur: DecimalString;
  security_deposit_eur: DecimalString;
  badge: CamperBadge;
  badge_label: string;
  cover_image_url: string;
  is_featured: boolean;
  display_order: number;
}

export interface CamperImage {
  id: number;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface CamperDetail extends CamperSummary {
  description: string;
  included_equipment: string[];
  images: CamperImage[];
}

export interface ExtraAccessory {
  id: number;
  name: string;
  pricing_type: PricingType;
  pricing_type_label: string;
  price_eur: DecimalString;
  description: string;
  icon_name: string;
  display_order: number;
}

export interface TravelRoute {
  id: number;
  title: string;
  slug: string;
  region_label: string;
  duration_days_label: string;
  distance_km_label: string;
  summary: string;
  highlights: string[];
  cover_image_url: string;
  display_order: number;
}

export interface CamperFilters {
  category?: CamperCategory | null;
  transmission?: Transmission | null;
  min_berths?: number | null;
  max_price?: number | null;
  featured?: boolean | null;
  search?: string | null;
  ordering?: string | null;
}

export interface BookingRequestPayload {
  vehicle: string;
  pickup_date: string;
  return_date: string;
  adults_count: number;
  children_count: number;
  selected_accessories: string[];
  estimated_total_eur: string | null;
  destination_region: string;
  client_name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface InquiryPayload {
  client_name: string;
  email: string;
  phone: string;
  message: string;
}

/** DRF validation error body: field name -> list of messages. */
export type ApiFieldErrors = Record<string, string[]>;
