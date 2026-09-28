'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';
import { H2O_STORE_LOCATION, calculateDeliveryRouteInfo } from '@/lib/validators';

interface InteractiveMapPickerProps {
  lat: number;
  lng: number;
  onCoordinatesChange: (lat: number, lng: number, addressHint?: string) => void;
  addressLabel?: string;
  showStoreRoute?: boolean;
}

export function InteractiveMapPicker({
  lat,
  lng,
  onCoordinatesChange,
  addressLabel,
  showStoreRoute = true,
}: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const clientMarkerRef = useRef<LeafletMarker | null>(null);
  const storeMarkerRef = useRef<LeafletMarker | null>(null);
  const routeLineRef = useRef<LeafletPolyline | null>(null);

  // Calcular ruta y métricas desde la Sede Calle 28 c/ Carrera 25
  const routeInfo = useMemo(() => {
    return calculateDeliveryRouteInfo(lat, lng);
  }, [lat, lng]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Carga dinámica de Leaflet para evitar errores en SSR
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Destruir mapa previo si existía para evitar doble inicialización
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // 1. Icono personalizado para el Marcador de Entrega del Cliente
      const clientIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #0284c7, #06b6d4);
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">💧</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      // 2. Icono distintivo para la Sede H2O Life (Calle 28 con Carrera 25)
      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="
            background: #0f172a;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #38bdf8;
            box-shadow: 0 4px 12px rgba(15,23,42,0.45);
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">🏪</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Inicializar mapa centrado en coordenadas
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Capa de mosaicos OpenStreetMap con soporte Retina
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        detectRetina: true,
      }).addTo(map);

      // Marcador de la Sede H2O Life (Punto de Salida)
      if (showStoreRoute) {
        const storeMarker = L.marker([H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng], {
          icon: storeIcon,
        }).addTo(map);

        storeMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0284c7; font-size: 13px;">🏪 Sede H2O Life</strong><br/>
            <span>Calle 28 con Carrera 25, Barquisimeto</span><br/>
            <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold; font-size: 10px;">
              Punto de Salida y Despacho
            </span>
          </div>
        `);
        storeMarkerRef.current = storeMarker;

        // Trazo de Línea de Despacho (Polyline)
        const polyline = L.polyline(
          [
            [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
            [lat, lng],
          ],
          {
            color: '#0284c7',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 8',
          }
        ).addTo(map);

        routeLineRef.current = polyline;

        // Encuadrar vista para que ambos puntos (Tienda y Cliente) sean visibles
        map.fitBounds(
          [
            [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
            [lat, lng],
          ],
          { padding: [50, 50], maxZoom: 16 }
        );
      }

      // Marcador de Destino del Cliente (Arrastrable)
      const clientMarker = L.marker([lat, lng], {
        icon: clientIcon,
        draggable: true,
      }).addTo(map);

      clientMarkerRef.current = clientMarker;

      if (addressLabel) {
        clientMarker.bindPopup(`<strong>📍 Punto de Entrega:</strong><br/>${addressLabel}`).openPopup();
      }

      // Evento al arrastrar el marcador con el dedo o mouse
      clientMarker.on('dragend', () => {
        const position = clientMarker.getLatLng();
        onCoordinatesChange(position.lat, position.lng);
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
            [position.lat, position.lng],
          ]);
        }
      });

      // Evento al hacer clic en cualquier parte del mapa para mover el pin
      map.on('click', (e) => {
        clientMarker.setLatLng(e.latlng);
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
            [e.latlng.lat, e.latlng.lng],
          ]);
        }
      });

      // Forzar recalculo de dimensiones del mapa
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Montaje inicial

  // Sincronizar posición del marcador y ruta cuando cambian las coordenadas externamente
  useEffect(() => {
    if (mapInstanceRef.current && clientMarkerRef.current) {
      const currentPos = clientMarkerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        clientMarkerRef.current.setLatLng([lat, lng]);
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([
            [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
            [lat, lng],
          ]);
        }
        if (addressLabel) {
          clientMarkerRef.current.bindPopup(`<strong>📍 Punto de Entrega:</strong><br/>${addressLabel}`).openPopup();
        }
      }
    }
  }, [lat, lng, addressLabel]);

  return (
    <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Banner flotante de ruta y tiempo estimado */}
      {showStoreRoute && (
        <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[10px] text-white shadow-lg">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-black text-cyan-400">🏪 Sede (C. 28 c/ Cra 25)</span>
            <span className="text-slate-400">➔</span>
            <span className="font-bold text-slate-200 truncate">
              📍 Destino: ~{routeInfo.formattedDistance} ({routeInfo.estimatedMinutes} min en despacho)
            </span>
          </div>

          <a
            href={routeInfo.googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-500 hover:bg-sky-400 text-white font-black px-2.5 py-1 rounded-lg transition-all active:scale-95 flex items-center space-x-1 shrink-0 shadow-xs cursor-pointer"
            title="Abrir indicaciones paso a paso en Google Maps"
          >
            <span>🚗 Cómo llegar</span>
          </a>
        </div>
      )}

      {/* Controles inferiores */}
      <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs pointer-events-none hidden sm:block">
        📍 Toca o arrastra el pin 💧 para ajustar la ubicación exacta
      </div>

      <button
        type="button"
        onClick={() => {
          if (mapInstanceRef.current && clientMarkerRef.current) {
            if (showStoreRoute) {
              mapInstanceRef.current.fitBounds(
                [
                  [H2O_STORE_LOCATION.lat, H2O_STORE_LOCATION.lng],
                  [lat, lng],
                ],
                { padding: [50, 50], maxZoom: 16 }
              );
            } else {
              mapInstanceRef.current.setView([lat, lng], 17);
            }
            clientMarkerRef.current.setLatLng([lat, lng]);
          }
        }}
        className="absolute bottom-2 right-2 z-20 bg-white/95 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-md active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
      >
        <span>🎯 Re-centrar Ruta</span>
      </button>
    </div>
  );
}
