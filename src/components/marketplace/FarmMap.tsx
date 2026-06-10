"use client";

import { useEffect, useRef } from "react";

export interface FarmPin {
  name: string;
  distance: string;
  lat: number;
  lng: number;
  image: string;
}

interface FarmMapProps {
  farms: FarmPin[];
  className?: string;
}

export default function FarmMap({ farms, className = "" }: FarmMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Guard against double-mount in React 18 StrictMode:
    // Leaflet stamps the container div with _leaflet_id once initialized.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      // Guard again inside the async callback (race condition safety)
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Centre on Lima, Perú by default
      const map = L.map(mapRef.current!, {
        center: [-12.0464, -77.0428],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom green icon
      const greenIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:38px;height:38px;border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#16a34a,#22c55e);
          border:3px solid #fff;box-shadow:0 4px 14px rgba(22,163,74,0.45);
          transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:16px;">🌿</span>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -42],
      });

      farms.forEach((farm) => {
        const popup = L.popup({
          className: "bioned-popup",
          maxWidth: 220,
          minWidth: 180,
        }).setContent(`
          <div style="font-family:system-ui,sans-serif;overflow:hidden;border-radius:12px;">
            <img src="${farm.image}" alt="${farm.name}"
              style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;margin:0;display:block;" />
            <div style="padding:10px 12px 12px;">
              <p style="margin:0;font-weight:700;font-size:13px;color:#0f172a;">${farm.name}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#16a34a;">📍 ${farm.distance} de ti</p>
              <a href="#productos"
                style="display:inline-block;margin-top:8px;padding:5px 14px;background:#16a34a;
                color:#fff;border-radius:99px;font-size:11px;font-weight:600;text-decoration:none;">
                Ver cosechas →
              </a>
            </div>
          </div>
        `);

        L.marker([farm.lat, farm.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(popup);
      });

      // User location pin
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3b82f6;border:3px solid #fff;
          box-shadow:0 0 0 6px rgba(59,130,246,0.25);">
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([-12.0464, -77.0428], { icon: userIcon })
        .addTo(map)
        .bindTooltip("Tu ubicación", { permanent: false, direction: "top" });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // farms is stable static data; no need to re-run on reference change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Leaflet CSS loaded via link tag */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className={`relative z-0 h-full w-full rounded-[1.7rem] ${className}`}
        aria-label="Mapa de biohuertos cercanos"
        role="img"
      />
    </>
  );
}
