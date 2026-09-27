'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Check, Search, Crosshair } from 'lucide-react';
import { POPULAR_ADDRESS_SUGGESTIONS, REFERENCE_POINT_CHIPS } from '@/lib/validators';

interface DeliveryAddressMapProps {
  address: string;
  setAddress: (addr: string) => void;
  referencePoint: string;
  setReferencePoint: (ref: string) => void;
  coordinates?: { lat: number; lng: number };
  setCoordinates?: (coords: { lat: number; lng: number }) => void;
}

export function DeliveryAddressMap({
  address,
  setAddress,
  referencePoint,
  setReferencePoint,
  coordinates,
  setCoordinates,
}: DeliveryAddressMapProps) {
  const [mapQuery, setMapQuery] = useState(address || 'Venezuela');
  const [isLocating, setIsLocating] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sincronizar el mapa cuando cambia la dirección con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (address.trim()) {
        setMapQuery(`${address.trim()}, Venezuela`);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [address]);

  // Filtrar sugerencias mientras escribe
  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.trim().length > 1) {
      const matches = POPULAR_ADDRESS_SUGGESTIONS.filter(item =>
        item.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(matches.length > 0 ? matches : POPULAR_ADDRESS_SUGGESTIONS.slice(0, 4));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions(POPULAR_ADDRESS_SUGGESTIONS.slice(0, 4));
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (sug: string) => {
    setAddress(sug);
    setMapQuery(`${sug}, Venezuela`);
    setShowSuggestions(false);
  };

  // Obtener ubicación GPS del dispositivo
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (setCoordinates) {
          setCoordinates({ lat, lng });
        }
        const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setMapQuery(coordsStr);
        if (!address) {
          setAddress(`Ubicación GPS (${coordsStr})`);
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('No se pudo obtener el GPS. Verifica los permisos de ubicación de tu dispositivo.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Input de Dirección con Sugerencias tipo Datalist / Apps de Delivery */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Dirección de Despacho / Entrega:</span>
          </label>
          <button
            type="button"
            onClick={handleGetGpsLocation}
            disabled={isLocating}
            className="text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 active:scale-95 transition-all"
          >
            <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isLocating ? 'Obteniendo GPS...' : 'Usar mi GPS'}</span>
          </button>
        </div>

        <input
          type="text"
          value={address}
          onChange={e => handleAddressChange(e.target.value)}
          onFocus={() => {
            setFilteredSuggestions(POPULAR_ADDRESS_SUGGESTIONS.slice(0, 4));
            setShowSuggestions(true);
          }}
          placeholder="Escribe calle, avenida o sector (ej. Calle 25 con Carrera 19)..."
          className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-2xs"
          required
        />

        {/* Lista de Sugerencias Unificadas (Dropdown estilo Vamos / Yummy) */}
        {showSuggestions && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Sugerencias de Calles y Sectores</span>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="hover:text-slate-700 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-900 flex items-center space-x-2 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Punto de Referencia & Chips de Llenado Rápido */}
      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1">
          Punto de Referencia (para que el repartidor no se pierda):
        </label>
        <input
          type="text"
          value={referencePoint}
          onChange={e => setReferencePoint(e.target.value)}
          placeholder="Ej. Frente a la panadería, portón azul, timbre blanco..."
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

      {/* Mapa en Vivo Integrado (Iframe Google Maps / OSM) */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Vista Previa del Mapa en Tiempo Real:</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
            📍 {mapQuery}
          </span>
        </div>

        <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative group">
          <iframe
            title="Mapa de Entrega"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full filter saturate-[0.95]"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 pointer-events-none bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
            H2O Life GPS
          </div>
        </div>
      </div>
    </div>
  );
}
