import type { IndicatorCategory } from "./types";

export interface IndicatorDef {
  name: string;
  slug: string;
  category: IndicatorCategory;
  unit: string;
  description: string;
  source: string;
  source_url: string;
  higher_is_better: boolean;
  min_value: number;
  max_value: number;
}

export const MVP_INDICATORS: IndicatorDef[] = [
  {
    name: "PM2.5",
    slug: "pm25",
    category: "air_quality",
    unit: "µg/m³",
    description: "Fine particulate matter concentration (24h average)",
    source: "CPCB",
    source_url: "https://app.cpcbccr.com/ccr_docs/LATEST_AQI_BULLETIN.pdf",
    higher_is_better: false,
    min_value: 0,
    max_value: 500,
  },
  {
    name: "Air Quality Index",
    slug: "aqi",
    category: "air_quality",
    unit: "AQI",
    description: "Composite Air Quality Index (CPCB NAQI)",
    source: "CPCB",
    source_url: "https://app.cpcbccr.com/ccr_docs/LATEST_AQI_BULLETIN.pdf",
    higher_is_better: false,
    min_value: 0,
    max_value: 500,
  },
  {
    name: "Water Quality Index",
    slug: "wqi",
    category: "water_quality",
    unit: "WQI",
    description: "Composite water quality score from BWSSB testing",
    source: "BWSSB",
    source_url: "https://bwssb.karnataka.gov.in",
    higher_is_better: true,
    min_value: 0,
    max_value: 100,
  },
  {
    name: "Tree Canopy Cover",
    slug: "tree_canopy",
    category: "green_cover",
    unit: "%",
    description: "Percentage of area covered by tree canopy",
    source: "IISc / ISRO",
    source_url: "https://iisc.ac.in",
    higher_is_better: true,
    min_value: 0,
    max_value: 100,
  },
  {
    name: "Park Area per Capita",
    slug: "park_area",
    category: "green_cover",
    unit: "m²/person",
    description: "Green/park space available per resident",
    source: "BBMP",
    source_url: "https://bbmp.gov.in",
    higher_is_better: true,
    min_value: 0,
    max_value: 50,
  },
  {
    name: "Average Commute Time",
    slug: "commute_time",
    category: "traffic",
    unit: "min",
    description: "Average commute time to city center during peak hours",
    source: "Google Maps",
    source_url: "https://maps.google.com",
    higher_is_better: false,
    min_value: 0,
    max_value: 120,
  },
  {
    name: "Traffic Congestion Index",
    slug: "congestion_index",
    category: "traffic",
    unit: "index",
    description: "Ratio of actual vs free-flow travel time",
    source: "TomTom / Google",
    source_url: "https://www.tomtom.com/traffic-index/",
    higher_is_better: false,
    min_value: 1.0,
    max_value: 5.0,
  },
];

export function computeScore(
  value: number,
  indicator: IndicatorDef
): number {
  const { min_value, max_value, higher_is_better } = indicator;
  const range = max_value - min_value;
  if (range === 0) return 50;

  const normalized = Math.max(0, Math.min(1, (value - min_value) / range));
  const score = higher_is_better ? normalized : 1 - normalized;
  return Math.round(score * 100);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#eab308"; // yellow
  if (score >= 40) return "#f97316"; // orange
  return "#ef4444"; // red
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Critical";
}
