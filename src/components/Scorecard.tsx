"use client";

import { useEffect, useState } from "react";
import ScoreRing from "./ScoreRing";
import CategoryBar from "./CategoryBar";
import IndicatorCard from "./IndicatorCard";
import NeighborhoodMap from "./NeighborhoodMap";
import type { ScorecardData, IndicatorCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface ScorecardProps {
  slug: string;
}

export default function Scorecard({ slug }: ScorecardProps) {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<IndicatorCategory | "all">("all");

  useEffect(() => {
    fetch(`/api/scorecard/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load scorecard");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--muted-foreground)]">
          Loading scorecard...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">
            {error || "Scorecard not found"}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Make sure the database is seeded with data.
          </p>
        </div>
      </div>
    );
  }

  const { neighborhood, overall_score, indicators } = data;

  const filteredIndicators =
    activeCategory === "all"
      ? indicators
      : indicators.filter((i) => i.category === activeCategory);

  const categories = [
    ...new Set(indicators.map((i) => i.category)),
  ] as IndicatorCategory[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold">
            {neighborhood.name}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Ward {neighborhood.ward_number} &middot; {neighborhood.city}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Quality of Life Scorecard &middot; Updated{" "}
            {new Date(overall_score.computed_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="relative">
          <ScoreRing score={overall_score.overall_score} />
        </div>
      </div>

      {/* Map */}
      <NeighborhoodMap
        neighborhood={neighborhood}
        data={data}
      />

      {/* Category breakdown */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-semibold mb-4">Category Scores</h2>
        <CategoryBar categoryScores={overall_score.category_scores} />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            activeCategory === "all"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === cat
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Indicator cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIndicators.map((indicator) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            latestReading={indicator.latest_reading}
            score={indicator.score}
            cityAverage={indicator.city_average}
            trend={indicator.trend}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--muted-foreground)] py-8 border-t border-[var(--border)]">
        <p>
          Data sourced from CPCB, BWSSB, BBMP, IISc, and Google Maps.
          <br />
          Scores are computed from the latest 30-day rolling average.
        </p>
      </footer>
    </div>
  );
}
