"use client";

import { useEffect, useRef, useState } from "react";

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

// Chiclayo como fallback si el usuario deniega la geolocalización
const DEFAULT_CENTER: [number, number] = [-6.7714, -79.8409];
const DEFAULT_ZOOM = 13;

export default function FarmMap({ farms, className = "" }: FarmMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [geoStatus, setGeoStatus] = useState<"pending" | "granted" | "denied">("pending");

  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Inicializa el mapa centrado en Chiclayo mientras esperamos la ubicación
      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // ── Ícono de biohuertos ──────────────────────────────────────────────
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
        const popup = L.popup({ maxWidth: 220, minWidth: 180 }).setContent(`
          <div style="font-family:system-ui,sans-serif;overflow:hidden;border-radius:12px;">
            <img src="${farm.image}" alt="${farm.name}"
              style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;margin:0;display:block;" />
            <div style="padding:10px 12px 12px;">
              <p style="margin:0;font-weight:700;font-size:13px;color:#0f172a;">${farm.name}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#16a34a;">📍 ${farm.distance}</p>
              <a href="#productos"
                style="display:inline-block;margin-top:8px;padding:5px 14px;background:#16a34a;
                color:#fff;border-radius:99px;font-size:11px;font-weight:600;text-decoration:none;">
                Ver cosechas →
              </a>
            </div>
          </div>
        `);
        L.marker([farm.lat, farm.lng], { icon: greenIcon }).addTo(map).bindPopup(popup);
      });

      // ── Ícono del usuario ────────────────────────────────────────────────
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

      // ── Geolocalización real del navegador ───────────────────────────────
      if (!navigator.geolocation) {
        // El navegador no soporta geolocalización — quedamos en Chiclayo
        setGeoStatus("denied");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setGeoStatus("granted");

          // Centra el mapa en la ubicación real
          map.setView([latitude, longitude], DEFAULT_ZOOM);

          // Agrega el pin del usuario
          const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindTooltip("Tu ubicación", { permanent: false, direction: "top" });

          // Círculo de precisión
          L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.08,
            weight: 1,
          }).addTo(map);

          userMarker.openTooltip();
        },
        () => {
          // Usuario denegó o hubo error — centramos en Chiclayo y colocamos
          // pin de referencia en el centro por defecto
          setGeoStatus("denied");
          L.marker(DEFAULT_CENTER, { icon: userIcon })
            .addTo(map)
            .bindTooltip("Chiclayo (ubicación por defecto)", {
              permanent: false,
              direction: "top",
            });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60_000,
        }
      );
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div className={`relative ${className}`}>
        <div
          ref={mapRef}
          className="h-full w-full rounded-[1.7rem]"
          aria-label="Mapa de biohuertos cercanos"
          role="img"
        />
        {/* Banner cuando el permiso fue denegado */}
        {geoStatus === "denied" && (
          <div className="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 shadow-sm">
            📍 Ubicación no disponible — mostrando Chiclayo
          </div>
        )}
      </div>
    </>
  );
}
