import { createClient } from "@supabase/supabase-js";
import { MVP_INDICATORS, computeScore } from "../lib/indicators";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function seed() {
  console.log("Seeding database...");

  // 1. Insert Kalyanagar neighborhood
  const { data: neighborhood, error: nErr } = await supabase
    .from("neighborhoods")
    .upsert(
      {
        name: "Kalyanagar",
        slug: "kalyanagar",
        city: "Bangalore",
        ward_number: 21,
        lat: 13.0250,
        lng: 77.6400,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (nErr) throw nErr;
  console.log("Neighborhood:", neighborhood.name);

  // 2. Insert indicators
  for (const def of MVP_INDICATORS) {
    const { error } = await supabase.from("indicators").upsert(
      {
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
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }
  console.log(`Inserted ${MVP_INDICATORS.length} indicators`);

  // 3. Fetch all indicator IDs
  const { data: indicators } = await supabase.from("indicators").select("*");
  if (!indicators) throw new Error("No indicators found");

  // 4. Generate sample readings for the past 30 days
  const now = new Date();
  const readings = [];
  const baseValues: Record<string, number> = {
    pm25: 45,
    aqi: 95,
    wqi: 72,
    tree_canopy: 18,
    park_area: 3.2,
    commute_time: 38,
    congestion_index: 1.8,
  };

  for (const indicator of indicators) {
    const base = baseValues[indicator.slug] || 50;
    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      // Add some daily variance
      const variance = (Math.random() - 0.5) * base * 0.2;
      readings.push({
        neighborhood_id: neighborhood.id,
        indicator_id: indicator.id,
        value: Math.max(0, +(base + variance).toFixed(2)),
        recorded_at: date.toISOString(),
      });
    }
  }

  const { error: rErr } = await supabase.from("readings").upsert(readings, {
    onConflict: "neighborhood_id,indicator_id,recorded_at",
    ignoreDuplicates: true,
  });
  if (rErr) throw rErr;
  console.log(`Inserted ${readings.length} readings`);

  // 5. Compute and insert scores for current period
  const periodStart = new Date(now);
  periodStart.setDate(1);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  periodEnd.setDate(0);

  const categoryScores: Record<string, number[]> = {};

  for (const indicator of indicators) {
    const base = baseValues[indicator.slug] || 50;
    const def = MVP_INDICATORS.find((d) => d.slug === indicator.slug);
    if (!def) continue;

    const score = computeScore(base, def);

    await supabase.from("scores").upsert(
      {
        neighborhood_id: neighborhood.id,
        indicator_id: indicator.id,
        score,
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
      },
      { onConflict: "neighborhood_id,indicator_id,period_start,period_end" }
    );

    if (!categoryScores[indicator.category]) {
      categoryScores[indicator.category] = [];
    }
    categoryScores[indicator.category].push(score);
  }

  // 6. Compute overall neighborhood score
  const catAvgs: Record<string, number> = {};
  let total = 0;
  let count = 0;
  for (const [cat, scores] of Object.entries(categoryScores)) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    catAvgs[cat] = avg;
    total += avg;
    count++;
  }

  await supabase.from("neighborhood_scores").upsert(
    {
      neighborhood_id: neighborhood.id,
      overall_score: Math.round(total / count),
      category_scores: catAvgs,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
    },
    { onConflict: "neighborhood_id,period_start,period_end" }
  );

  // 7. Insert city averages
  const cityAvgValues: Record<string, number> = {
    pm25: 55,
    aqi: 120,
    wqi: 65,
    tree_canopy: 15,
    park_area: 2.5,
    commute_time: 45,
    congestion_index: 2.2,
  };

  for (const indicator of indicators) {
    const val = cityAvgValues[indicator.slug];
    if (val === undefined) continue;
    await supabase.from("city_averages").upsert(
      {
        indicator_id: indicator.id,
        value: val,
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
      },
      { onConflict: "indicator_id,period_start,period_end" }
    );
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
