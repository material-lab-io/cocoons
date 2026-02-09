"use client";

import { useEffect, useRef } from "react";
import type { Neighborhood } from "@/lib/types";

interface NeighborhoodMapProps {
  neighborhood: Neighborhood;
  score: number;
}

export default function NeighborhoodMap({
  neighborhood,
  score,
}: NeighborhoodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [neighborhood.lat, neighborhood.lng],
        zoom: 14,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Add marker for the neighborhood center
      const icon = L.divIcon({
        html: `<div style="
          background: ${score >= 60 ? "#22c55e" : score >= 40 ? "#f97316" : "#ef4444"};
          color: white;
          font-weight: bold;
          font-size: 14px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${score}</div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([neighborhood.lat, neighborhood.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${neighborhood.name}</strong><br/>QoL Score: ${score}/100`
        );

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [neighborhood, score]);

  return (
    <div
      ref={mapRef}
      className="h-64 md:h-80 rounded-xl overflow-hidden border border-[var(--border)]"
    />
  );
}
