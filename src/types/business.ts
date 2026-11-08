export interface GroundingSource {
  title?: string;
  uri: string;
  snippet?: string;
}

export interface BusinessLead {
  id: string;
  name: string;
  latinName?: string;
  category: string;
  phone: string;
  phoneFormatted?: string;
  secondaryPhones?: string[];
  mobile?: string;
  whatsapp?: string;
  address: string;
  neighborhood?: string;
  city: string;
  provinceOrState?: string;
  country: string;
  postalCode?: string;
  website?: string;
  instagram?: string;
  telegram?: string;
  rating?: number;
  reviewsCount?: number;
  priceLevel?: string;
  hours?: string;
  isOpenNow?: boolean | null;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  sourceUrl?: string;
  features?: string[];
  description?: string;
  groundingSources?: GroundingSource[];
}

export interface SearchExtractionRequest {
  query: string;
  targetCity?: string;
  targetCountry?: string;
  mode?: 'maps_grounding' | 'hybrid' | 'deep_thinking';
  maxResults?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchExtractionResponse {
  query: string;
  targetLocation: {
    city?: string;
    country?: string;
  };
  leads: BusinessLead[];
  groundingSources: GroundingSource[];
  summary: string;
  searchTimeMs: number;
  engineUsed: string;
}

export interface FilterState {
  searchQuery: string;
  onlyWithPhone: boolean;
  onlyWithWebsite: boolean;
  onlyWithInstagram: boolean;
  minRating: number;
  cityFilter: string;
  categoryFilter: string;
  sortBy: 'default' | 'rating_desc' | 'reviews_desc' | 'name_asc';
}
