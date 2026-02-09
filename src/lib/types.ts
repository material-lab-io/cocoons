export type IndicatorCategory =
  | "air_quality"
  | "water_quality"
  | "green_cover"
  | "traffic"
  | "noise"
  | "waste_management"
  | "safety"
  | "civic_infrastructure"
  | "community_amenities";

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  city: string;
  ward_number: number | null;
  lat: number;
  lng: number;
  boundary: GeoJSON.Polygon | null;
  created_at: string;
}

export interface Indicator {
  id: string;
  name: string;
  slug: string;
  category: IndicatorCategory;
  unit: string;
  description: string | null;
  source: string | null;
  source_url: string | null;
  higher_is_better: boolean;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
}

export interface Reading {
  id: string;
  neighborhood_id: string;
  indicator_id: string;
  value: number;
  recorded_at: string;
  source_raw: Record<string, unknown> | null;
  created_at: string;
}

export interface Score {
  id: string;
  neighborhood_id: string;
  indicator_id: string;
  score: number;
  computed_at: string;
  period_start: string;
  period_end: string;
}

export interface NeighborhoodScore {
  id: string;
  neighborhood_id: string;
  overall_score: number;
  category_scores: Record<IndicatorCategory, number>;
  computed_at: string;
  period_start: string;
  period_end: string;
}

export interface CityAverage {
  id: string;
  indicator_id: string;
  value: number;
  period_start: string;
  period_end: string;
}

export interface ScorecardData {
  neighborhood: Neighborhood;
  overall_score: NeighborhoodScore;
  indicators: (Indicator & {
    latest_reading: Reading | null;
    score: Score | null;
    city_average: CityAverage | null;
    trend: Reading[];
  })[];
}

export const CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  air_quality: "Air Quality",
  water_quality: "Water Quality",
  green_cover: "Green Cover",
  traffic: "Traffic",
  noise: "Noise",
  waste_management: "Waste Management",
  safety: "Safety",
  civic_infrastructure: "Civic Infrastructure",
  community_amenities: "Community Amenities",
};

export const CATEGORY_ICONS: Record<IndicatorCategory, string> = {
  air_quality: "wind",
  water_quality: "droplets",
  green_cover: "trees",
  traffic: "car",
  noise: "volume-2",
  waste_management: "trash-2",
  safety: "shield",
  civic_infrastructure: "lamp",
  community_amenities: "building-2",
};
