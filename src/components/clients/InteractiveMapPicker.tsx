'use client';

import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface InteractiveMapPickerProps {
  lat: number;
  lng: number;
  onCoordinatesChange: (lat: number, lng: number, addressHint?: string) => void;
  addressLabel?: string;
}

export function InteractiveMapPicker({
  lat,
  lng,
  onCoordinatesChange,
  addressLabel,
}: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

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

      // Icono personalizado para el marcador de entrega
      const customIcon = L.divIcon({
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
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">💧</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      });

      // Inicializar mapa centrado en coordenadas con soporte táctil multiplataforma
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false, // Evita que la rueda del ratón bloquee el scroll de la página
      });

      mapInstanceRef.current = map;

      // Capa de mosaicos OpenStreetMap con soporte Retina para móviles de alta resolución
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        detectRetina: true,
      }).addTo(map);

      // Marcador deslizable / manipulable
      const marker = L.marker([lat, lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      if (addressLabel) {
        marker.bindPopup(`<strong>Punto de Entrega:</strong><br/>${addressLabel}`).openPopup();
      }

      // Evento al arrastrar el marcador con el dedo o mouse
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onCoordinatesChange(position.lat, position.lng);
      });

      // Evento al hacer clic en cualquier parte del mapa para mover el pin
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
        map.panTo(e.latlng);
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

  // Sincronizar posición del marcador cuando cambian las coordenadas externamente
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
        if (addressLabel) {
          markerRef.current.bindPopup(`<strong>Punto de Entrega:</strong><br/>${addressLabel}`).openPopup();
        }
      }
    }
  }, [lat, lng, addressLabel]);

  return (
    <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs pointer-events-none">
        📍 Toca o arrastra el pin para fijar la ubicación exacta
      </div>
      <button
        type="button"
        onClick={() => {
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 17);
            markerRef.current.setLatLng([lat, lng]);
          }
        }}
        className="absolute bottom-2 right-2 z-20 bg-white/95 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 shadow-md active:scale-95 transition-all flex items-center space-x-1"
      >
        <span>🎯 Re-centrar Pin</span>
      </button>
    </div>
  );
}
