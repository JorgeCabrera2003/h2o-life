'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Compass, Search, Crosshair, Check, AlertCircle } from 'lucide-react';
import {
  generateSmartAddressSuggestions,
  REFERENCE_POINT_CHIPS,
  sanitizeAddressText,
  resolveBarquisimetoCoordinates,
} from '@/lib/validators';

// Carga dinámica del mapa interactivo para asegurar compatibilidad total con SSR en Next.js
const InteractiveMapPicker = dynamic(
  () => import('./InteractiveMapPicker').then((mod) => mod.InteractiveMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-52 sm:h-64 rounded-2xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
        <Compass className="w-8 h-8 text-sky-500 animate-spin mb-2" />
        <span className="text-xs text-slate-500 font-semibold">Cargando mapa interactivo...</span>
      </div>
    ),
  }
);

interface DeliveryAddressMapProps {
  address: string;
  setAddress: (addr: string) => void;
  referencePoint: string;
  setReferencePoint: (ref: string) => void;
  coordinates?: { lat: number; lng: number };
  setCoordinates?: (coords: { lat: number; lng: number }) => void;
}

// Coordenadas base: Sede Principal H2O Life (Calle 28 con Carrera 25, Barquisimeto)
const DEFAULT_COORDS = { lat: 10.07125, lng: -69.32705 };

export function DeliveryAddressMap({
  address,
  setAddress,
  referencePoint,
  setReferencePoint,
  coordinates = DEFAULT_COORDS,
  setCoordinates,
}: DeliveryAddressMapProps) {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(coordinates);
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generar sugerencias inteligentes en tiempo real al escribir
  useEffect(() => {
    if (address && address.trim().length > 0) {
      const generated = generateSmartAddressSuggestions(address);
      setSuggestions(generated);
    } else {
      setSuggestions(generateSmartAddressSuggestions(''));
    }
  }, [address]);

  const updateCoords = (lat: number, lng: number) => {
    const newCoords = { lat, lng };
    setCurrentCoords(newCoords);
    if (setCoordinates) {
      setCoordinates(newCoords);
    }
  };

  // Manejar cambio en el input de dirección
  const handleAddressInputChange = (val: string) => {
    const sanitized = sanitizeAddressText(val);
    setAddress(sanitized);
    setShowSuggestions(true);

    // Resolver coordenadas exactas en la cuadrícula de Barquisimeto
    const resolved = resolveBarquisimetoCoordinates(sanitized);
    if (resolved) {
      updateCoords(resolved.lat, resolved.lng);
    }
  };

  // Al seleccionar una sugerencia del menú desplegable
  const handleSelectSuggestion = (sug: string) => {
    setAddress(sug);
    setShowSuggestions(false);

    // Ajustar mapa exactamente hacia la intersección seleccionada
    const resolved = resolveBarquisimetoCoordinates(sug);
    if (resolved) {
      updateCoords(resolved.lat, resolved.lng);
    }
  };

  // Callback cuando el usuario arrastra o toca el mapa interactivo
  const handleMapPinMoved = (newLat: number, newLng: number) => {
    updateCoords(newLat, newLng);
  };

  // Obtener ubicación GPS real del teléfono
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo o navegador no soporta geolocalización GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateCoords(lat, lng);
        if (!address) {
          setAddress(`Ubicación GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('No se pudo acceder al GPS. Verifica los permisos de ubicación en tu navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* 1. INPUT DE DIRECCIÓN CON AUTOCOMPLETADO INTELIGENTE */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Dirección de Despacho (con autocompletado de calles):</span>
          </label>
          <button
            type="button"
            onClick={handleGetGpsLocation}
            disabled={isLocating}
            className="text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 active:scale-95 transition-all"
          >
            <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isLocating ? 'Fijando GPS...' : 'Usar mi GPS'}</span>
          </button>
        </div>

        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Escribe calle, carrera o sector (ej. Calle 26 con Carrera 25)..."
          maxLength={120}
          className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-2xs"
          required
        />

        {/* Desplegable de Sugerencias Dinámicas */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Sugerencias de Calles y Cuadrículas</span>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-900 flex items-center space-x-2 transition-colors group"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. PUNTO DE REFERENCIA & CHIPS RÁPIDOS */}
      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1">
          Punto de Referencia (detalles para el repartidor):
        </label>
        <input
          type="text"
          value={referencePoint}
          onChange={(e) => setReferencePoint(sanitizeAddressText(e.target.value))}
          placeholder="Ej. Al lado de la farmacia, portón azul, frente a..."
          maxLength={100}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-2"
        />

        {/* Chips de llenado rápido */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Rápido:</span>
          {REFERENCE_POINT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const combined = referencePoint ? `${referencePoint}, ${chip}` : chip;
                setReferencePoint(combined);
              }}
              className="text-[10px] font-semibold bg-slate-100 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-200 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAPA INTERACTIVO MANIPULABLE (Leaflet Drag & Drop Pin) */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Mapa Interactivo (Puedes moverlo y arrastrar el pin):</span>
          </span>
          <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
          </span>
        </div>

        <InteractiveMapPicker
          lat={currentCoords.lat}
          lng={currentCoords.lng}
          onCoordinatesChange={handleMapPinMoved}
          addressLabel={address || 'Punto seleccionado'}
        />
      </div>
    </div>
  );
}
