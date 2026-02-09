import { MVP_INDICATORS, computeScore } from "./indicators";
import type {
  ScorecardData,
  Neighborhood,
  NeighborhoodScore,
  Indicator,
  Reading,
  Score,
  CityAverage,
  IndicatorCategory,
} from "./types";

// Deterministic pseudo-random based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const BASE_VALUES: Record<string, number> = {
  pm25: 45,
  aqi: 95,
  wqi: 72,
  tree_canopy: 18,
  park_area: 3.2,
  commute_time: 38,
  congestion_index: 1.8,
};

const CITY_AVG_VALUES: Record<string, number> = {
  pm25: 55,
  aqi: 120,
  wqi: 65,
  tree_canopy: 15,
  park_area: 2.5,
  commute_time: 45,
  congestion_index: 2.2,
};

const NEIGHBORHOOD: Neighborhood = {
  id: "demo-kalyanagar",
  name: "Kalyanagar",
  slug: "kalyanagar",
  city: "Bangalore",
  ward_number: 21,
  lat: 13.025,
  lng: 77.64,
  boundary: null,
  created_at: new Date().toISOString(),
};

export function generateDemoData(): ScorecardData {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const categoryScores: Record<string, number[]> = {};

  const indicators = MVP_INDICATORS.map((def, idx) => {
    const base = BASE_VALUES[def.slug] || 50;
    const cityAvg = CITY_AVG_VALUES[def.slug] || base * 1.2;

    // Generate 30-day trend
    const trend: Reading[] = [];
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      const variance = (seededRandom(idx * 1000 + day) - 0.5) * base * 0.2;
      trend.push({
        id: `reading-${def.slug}-${day}`,
        neighborhood_id: NEIGHBORHOOD.id,
        indicator_id: `indicator-${def.slug}`,
        value: Math.max(0, +(base + variance).toFixed(2)),
        recorded_at: date.toISOString(),
        source_raw: null,
        created_at: date.toISOString(),
      });
    }

    const latestReading = trend[trend.length - 1];
    const score = computeScore(base, def);

    if (!categoryScores[def.category]) {
      categoryScores[def.category] = [];
    }
    categoryScores[def.category].push(score);

    const indicatorObj: Indicator = {
      id: `indicator-${def.slug}`,
      name: def.name,
      slug: def.slug,
      category: def.category,
      unit: def.unit,
      description: def.description,
      source: def.source,
      source_url: def.source_url,
      higher_is_better: def.higher_is_better,
      min_value: def.min_value,
      max_value: def.max_value,
      created_at: now.toISOString(),
    };

    const scoreObj: Score = {
      id: `score-${def.slug}`,
      neighborhood_id: NEIGHBORHOOD.id,
      indicator_id: `indicator-${def.slug}`,
      score,
      computed_at: now.toISOString(),
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
    };

    const cityAverageObj: CityAverage = {
      id: `cityavg-${def.slug}`,
      indicator_id: `indicator-${def.slug}`,
      value: cityAvg,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
    };

    return {
      ...indicatorObj,
      latest_reading: latestReading,
      score: scoreObj,
      city_average: cityAverageObj,
      trend,
    };
  });

  // Compute overall score
  const catAvgs: Record<string, number> = {};
  let total = 0;
  let count = 0;
  for (const [cat, scores] of Object.entries(categoryScores)) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    catAvgs[cat] = avg;
    total += avg;
    count++;
  }

  const overallScore: NeighborhoodScore = {
    id: "ns-demo",
    neighborhood_id: NEIGHBORHOOD.id,
    overall_score: Math.round(total / count),
    category_scores: catAvgs as Record<IndicatorCategory, number>,
    computed_at: now.toISOString(),
    period_start: periodStart.toISOString().split("T")[0],
    period_end: periodEnd.toISOString().split("T")[0],
  };

  return {
    neighborhood: NEIGHBORHOOD,
    overall_score: overallScore,
    indicators,
  };
}
