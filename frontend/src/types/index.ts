export type UserRole = 'buyer' | 'seller' | 'panchayat_rep' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email?: string;
  phone: string;
  role: UserRole;
  village?: string;
  panchayat?: string;
  taluk?: string;
  district?: string;
  state: string;
  latitude?: number;
  longitude?: number;
  panchayat_id_number?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SellerSummary {
  id: number;
  full_name: string;
  phone: string;
  role: string;
  is_verified: boolean;
  village?: string;
  panchayat?: string;
  district?: string;
}

export type LivestockType = 'cow' | 'buffalo' | 'goat' | 'sheep' | 'hen' | 'chicken' | 'duck' | 'other';

export interface FlagReason {
  code: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  title_en: string;
  title_ta: string;
  detail_en: string;
  detail_ta: string;
}

export interface Listing {
  id: number;
  seller_id: number;
  assisted_by_id?: number;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  livestock_type: LivestockType;
  breed: string;
  age_months: number;
  gender: string;
  price: number;
  is_negotiable: boolean;
  milk_yield_liters: number;
  lactation_number: number;
  pregnancy_status: string;
  weight_kg: number;
  vaccination_status: string;
  vaccination_details?: string;
  vaccination_cert_url?: string;
  health_notes?: string;
  photos: string[];
  documents: string[];
  state: string;
  district: string;
  taluk?: string;
  panchayat: string;
  village?: string;
  latitude: number;
  longitude: number;
  hide_exact_location: boolean;
  is_demo: boolean;
  status: 'available' | 'reserved' | 'sold' | 'under_review' | 'rejected';
  quality_score: number;
  flag_reasons: FlagReason[];
  views_count: number;
  created_at: string;
  updated_at: string;
  seller?: SellerSummary;
  distance_km?: number;
  masked_phone?: string;
}

export interface PriceFactorDetail {
  factor_name: string;
  factor_name_ta: string;
  impact_amount: number;
  explanation_en: string;
  explanation_ta: string;
}

export interface PriceEstimateResponse {
  livestock_type: string;
  breed: string;
  estimated_indicative_price: number;
  price_range_low: number;
  price_range_high: number;
  currency: string;
  breakdown_factors: PriceFactorDetail[];
  benchmark_source: string;
  attribution_notes: string;
  confidence_level: string;
}

export interface FarmVisit {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  proposed_date: string;
  time_slot: string;
  buyer_notes?: string;
  seller_notes?: string;
  status: 'requested' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  listing_title?: string;
  listing_photos?: string[];
  listing_district?: string;
  listing_panchayat?: string;
  exact_latitude?: number;
  exact_longitude?: number;
  buyer_name?: string;
  buyer_phone?: string;
  seller_name?: string;
  seller_phone?: string;
}

export interface Notification {
  id: number;
  title: string;
  title_ta?: string;
  message: string;
  message_ta?: string;
  notification_type: string;
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface ModerationStats {
  total_listings: number;
  pending_review: number;
  flagged_listings: number;
  active_sellers: number;
  verified_panchayat_reps: number;
  assisted_registrations_count: number;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details: string;
  created_at: string;
}

export interface PanchayatItem {
  name: string;
  taluk: string;
  lat: number;
  lon: number;
}
