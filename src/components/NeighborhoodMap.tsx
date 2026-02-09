"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Neighborhood, ScorecardData } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { getScoreColor, getScoreLabel } from "@/lib/indicators";
import {
  KALYANAGAR_BOUNDARY,
  DATA_SOURCE_MARKERS,
  DATA_SOURCE_COLORS,
  DATA_SOURCE_LABELS,
  type DataSourceMarker,
  type DataSourceType,
} from "@/lib/map-data";

interface NeighborhoodMapProps {
  neighborhood: Neighborhood;
  data: ScorecardData;
}

function buildMarkerIcon(
  L: typeof import("leaflet"),
  type: DataSourceType
): L.DivIcon {
  const color = DATA_SOURCE_COLORS[type];
  return L.divIcon({
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function buildScoreIcon(
  L: typeof import("leaflet"),
  score: number
): L.DivIcon {
  const color = getScoreColor(score);
  return L.divIcon({
    html: `<div style="
      background: ${color};
      color: white;
      font-weight: bold;
      font-size: 16px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${score}</div>`,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function buildMarkerPopup(marker: DataSourceMarker, data: ScorecardData): string {
  const categoryIndicators = data.indicators.filter(
    (i) => i.category === marker.category
  );

  let indicatorRows = "";
  for (const ind of categoryIndicators) {
    const val = ind.latest_reading?.value ?? "—";
    const score = ind.score?.score ?? 0;
    const scoreColor = getScoreColor(score);
    indicatorRows += `
      <tr>
        <td style="padding: 2px 8px 2px 0; font-size: 12px;">${ind.name}</td>
        <td style="padding: 2px 4px; font-size: 12px; text-align: right;">${val} ${ind.unit}</td>
        <td style="padding: 2px 0 2px 4px;">
          <span style="
            background: ${scoreColor};
            color: white;
            font-size: 11px;
            padding: 1px 6px;
            border-radius: 9px;
            font-weight: 600;
          ">${score}</span>
        </td>
      </tr>`;
  }

  return `
    <div style="min-width: 200px;">
      <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">
        ${marker.name}
      </div>
      <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
        ${marker.description}
      </div>
      <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        ${CATEGORY_LABELS[marker.category]}
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${indicatorRows}
      </table>
    </div>
  `;
}

function buildCenterPopup(data: ScorecardData): string {
  const { overall_score } = data;
  const label = getScoreLabel(overall_score.overall_score);

  let categoryRows = "";
  for (const [cat, score] of Object.entries(overall_score.category_scores)) {
    const color = getScoreColor(score);
    const catLabel = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
    if (!catLabel) continue;
    categoryRows += `
      <tr>
        <td style="padding: 2px 8px 2px 0; font-size: 12px;">${catLabel}</td>
        <td style="padding: 2px 0;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="
              flex: 1;
              height: 6px;
              background: #e5e7eb;
              border-radius: 3px;
              overflow: hidden;
            ">
              <div style="
                width: ${score}%;
                height: 100%;
                background: ${color};
                border-radius: 3px;
              "></div>
            </div>
            <span style="font-size: 11px; font-weight: 600; min-width: 24px; text-align: right;">${score}</span>
          </div>
        </td>
      </tr>`;
  }

  return `
    <div style="min-width: 220px;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">
        ${data.neighborhood.name}
      </div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
        Overall QoL: <strong>${overall_score.overall_score}/100</strong> (${label})
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${categoryRows}
      </table>
    </div>
  `;
}

export default function NeighborhoodMap({
  neighborhood,
  data,
}: NeighborhoodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = await import("leaflet");

    const map = L.map(mapRef.current, {
      center: [neighborhood.lat, neighborhood.lng],
      zoom: 15,
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map);

    // Ward boundary polygon with color-coded fill
    const overallScore = data.overall_score.overall_score;
    const fillColor = getScoreColor(overallScore);

    L.geoJSON(KALYANAGAR_BOUNDARY, {
      style: {
        color: fillColor,
        weight: 3,
        opacity: 0.8,
        fillColor,
        fillOpacity: 0.15,
        dashArray: "",
      },
    }).addTo(map);

    // Center score marker
    const scoreIcon = buildScoreIcon(L, overallScore);
    L.marker([neighborhood.lat, neighborhood.lng], { icon: scoreIcon })
      .addTo(map)
      .bindPopup(buildCenterPopup(data), { maxWidth: 280 });

    // Data source markers
    for (const marker of DATA_SOURCE_MARKERS) {
      const icon = buildMarkerIcon(L, marker.type);
      L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(buildMarkerPopup(marker, data), { maxWidth: 280 });
    }

    // Legend control
    const legend = new L.Control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "");
      div.style.cssText =
        "background: white; padding: 8px 10px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-size: 11px; line-height: 1.6;";

      const types = Object.keys(DATA_SOURCE_COLORS) as DataSourceType[];
      const items = types
        .map(
          (t) =>
            `<div style="display:flex;align-items:center;gap:6px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${DATA_SOURCE_COLORS[t]};display:inline-block;"></span>
              ${DATA_SOURCE_LABELS[t]}
            </div>`
        )
        .join("");

      div.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">Data Sources</div>${items}`;
      return div;
    };
    legend.addTo(map);

    // Fit to boundary bounds
    const bounds = L.geoJSON(KALYANAGAR_BOUNDARY).getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });

    mapInstanceRef.current = map;
  }, [neighborhood, data]);

  useEffect(() => {
    initMap();
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [initMap]);

  return (
    <div
      ref={mapRef}
      className="h-72 md:h-96 rounded-xl overflow-hidden border border-[var(--border)]"
    />
  );
}
