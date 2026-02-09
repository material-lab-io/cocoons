import type { IndicatorCategory } from "./types";

/**
 * Approximate Kalyanagar ward boundary polygon (Ward 21, BBMP).
 * Coordinates trace the rough perimeter of the neighborhood.
 */
export const KALYANAGAR_BOUNDARY: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature",
  properties: { name: "Kalyanagar", ward: 21 },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [77.6310, 13.0310],
        [77.6350, 13.0305],
        [77.6400, 13.0290],
        [77.6440, 13.0275],
        [77.6470, 13.0255],
        [77.6480, 13.0230],
        [77.6475, 13.0200],
        [77.6460, 13.0175],
        [77.6430, 13.0160],
        [77.6390, 13.0155],
        [77.6350, 13.0160],
        [77.6315, 13.0175],
        [77.6295, 13.0200],
        [77.6285, 13.0230],
        [77.6290, 13.0260],
        [77.6300, 13.0285],
        [77.6310, 13.0310],
      ],
    ],
  },
};

export type DataSourceType = "cpcb" | "bwssb" | "park" | "traffic";

export interface DataSourceMarker {
  id: string;
  name: string;
  type: DataSourceType;
  lat: number;
  lng: number;
  description: string;
  category: IndicatorCategory;
}

/**
 * Data source locations within/near Kalyanagar.
 * These represent real-world monitoring points and amenities.
 */
export const DATA_SOURCE_MARKERS: DataSourceMarker[] = [
  {
    id: "cpcb-1",
    name: "CPCB Station - BWSSB Kadirenahalli",
    type: "cpcb",
    lat: 13.0240,
    lng: 77.6380,
    description: "Continuous air quality monitoring station",
    category: "air_quality",
  },
  {
    id: "cpcb-2",
    name: "CPCB Station - Hebbal",
    type: "cpcb",
    lat: 13.0280,
    lng: 77.6330,
    description: "Ambient air quality monitoring point",
    category: "air_quality",
  },
  {
    id: "bwssb-1",
    name: "BWSSB Water Testing - 1st Block",
    type: "bwssb",
    lat: 13.0210,
    lng: 77.6350,
    description: "Water quality sampling point",
    category: "water_quality",
  },
  {
    id: "bwssb-2",
    name: "BWSSB Water Testing - 4th Block",
    type: "bwssb",
    lat: 13.0255,
    lng: 77.6420,
    description: "Water quality sampling point",
    category: "water_quality",
  },
  {
    id: "park-1",
    name: "Kalyanagar Park - 1st Block",
    type: "park",
    lat: 13.0220,
    lng: 77.6370,
    description: "Public park and green space",
    category: "green_cover",
  },
  {
    id: "park-2",
    name: "HRBR Layout Park",
    type: "park",
    lat: 13.0270,
    lng: 77.6400,
    description: "Neighborhood park with walking track",
    category: "green_cover",
  },
  {
    id: "traffic-1",
    name: "Kalyanagar Circle",
    type: "traffic",
    lat: 13.0235,
    lng: 77.6390,
    description: "Major traffic junction - congestion monitoring",
    category: "traffic",
  },
];

export const DATA_SOURCE_COLORS: Record<DataSourceType, string> = {
  cpcb: "#6366f1",    // indigo - air quality
  bwssb: "#3b82f6",   // blue - water
  park: "#22c55e",     // green - parks
  traffic: "#f97316",  // orange - traffic
};

export const DATA_SOURCE_LABELS: Record<DataSourceType, string> = {
  cpcb: "CPCB Air Monitor",
  bwssb: "BWSSB Water Point",
  park: "Park / Green Space",
  traffic: "Traffic Monitor",
};
