"use client";

import { getScoreColor } from "@/lib/indicators";
import { CATEGORY_LABELS, type IndicatorCategory } from "@/lib/types";

interface CategoryBarProps {
  categoryScores: Record<string, number>;
}

export default function CategoryBar({ categoryScores }: CategoryBarProps) {
  const entries = Object.entries(categoryScores).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-3">
      {entries.map(([category, score]) => (
        <div key={category}>
          <div className="flex justify-between text-sm mb-1">
            <span>{CATEGORY_LABELS[category as IndicatorCategory]}</span>
            <span className="font-semibold" style={{ color: getScoreColor(score) }}>
              {score}
            </span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${score}%`,
                backgroundColor: getScoreColor(score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
