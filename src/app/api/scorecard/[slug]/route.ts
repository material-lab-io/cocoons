import { NextResponse } from "next/server";
import { generateDemoData } from "@/lib/demo-data";
import type { ScorecardData } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchFromSupabase(slug: string): Promise<ScorecardData | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY === "your-anon-key-here") {
    return null;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // 1. Fetch neighborhood
    const { data: neighborhood, error: nErr } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("slug", slug)
      .single();

    if (nErr || !neighborhood) return null;

    // 2. Fetch all indicators
    const { data: indicators } = await supabase
      .from("indicators")
      .select("*")
      .order("category");

    if (!indicators) return null;

    // 3. For each indicator, fetch latest reading, score, city average, and trend
    const enrichedIndicators = await Promise.all(
      indicators.map(async (indicator) => {
        const [latestReading, score, cityAvg, trend] = await Promise.all([
          supabase
            .from("readings")
            .select("*")
            .eq("neighborhood_id", neighborhood.id)
            .eq("indicator_id", indicator.id)
            .order("recorded_at", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("scores")
            .select("*")
            .eq("neighborhood_id", neighborhood.id)
            .eq("indicator_id", indicator.id)
            .order("period_end", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("city_averages")
            .select("*")
            .eq("indicator_id", indicator.id)
            .order("period_end", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("readings")
            .select("*")
            .eq("neighborhood_id", neighborhood.id)
            .eq("indicator_id", indicator.id)
            .order("recorded_at", { ascending: false })
            .limit(30),
        ]);

        return {
          ...indicator,
          latest_reading: latestReading.data,
          score: score.data,
          city_average: cityAvg.data,
          trend: trend.data || [],
        };
      })
    );

    // 4. Fetch overall neighborhood score
    const { data: overallScore } = await supabase
      .from("neighborhood_scores")
      .select("*")
      .eq("neighborhood_id", neighborhood.id)
      .order("period_end", { ascending: false })
      .limit(1)
      .single();

    if (!overallScore) return null;

    return {
      neighborhood,
      overall_score: overallScore,
      indicators: enrichedIndicators,
    };
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try Supabase first, fall back to demo data
  const supabaseData = await fetchFromSupabase(slug);
  if (supabaseData) {
    return NextResponse.json(supabaseData);
  }

  // Fallback: serve generated demo data for kalyanagar
  if (slug === "kalyanagar") {
    return NextResponse.json(generateDemoData());
  }

  return NextResponse.json(
    { error: "Neighborhood not found" },
    { status: 404 }
  );
}
