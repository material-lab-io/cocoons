"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getScoreColor } from "@/lib/indicators";
import type { Indicator, Reading, Score, CityAverage } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface IndicatorCardProps {
  indicator: Indicator;
  latestReading: Reading | null;
  score: Score | null;
  cityAverage: CityAverage | null;
  trend: Reading[];
}

export default function IndicatorCard({
  indicator,
  latestReading,
  score,
  cityAverage,
  trend,
}: IndicatorCardProps) {
  const scoreValue = score?.score ?? 0;
  const color = getScoreColor(scoreValue);

  const chartData = [...trend]
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .map((r) => ({
      date: new Date(r.recorded_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      value: r.value,
    }));

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            {CATEGORY_LABELS[indicator.category]}
          </p>
          <h3 className="text-lg font-semibold">{indicator.name}</h3>
        </div>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {scoreValue}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold">
          {latestReading ? latestReading.value.toFixed(1) : "—"}
        </span>
        <span className="text-sm text-[var(--muted-foreground)]">
          {indicator.unit}
        </span>
      </div>

      {cityAverage && latestReading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
            <span>Kalyanagar</span>
            <span>Bangalore avg</span>
          </div>
          <div className="relative h-2 bg-[var(--muted)] rounded-full">
            <div
              className="absolute top-0 left-0 h-2 rounded-full"
              style={{
                width: `${Math.min(100, (latestReading.value / (indicator.max_value || 100)) * 100)}%`,
                backgroundColor: color,
              }}
            />
            <div
              className="absolute top-[-3px] w-0.5 h-3 bg-[var(--foreground)] opacity-50"
              style={{
                left: `${Math.min(100, (cityAverage.value / (indicator.max_value || 100)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {chartData.length > 1 && (
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-[var(--muted-foreground)] mt-3">
        Source: {indicator.source}
      </p>
    </div>
  );
}
