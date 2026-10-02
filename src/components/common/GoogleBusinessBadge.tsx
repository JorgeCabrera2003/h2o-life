'use client';

import React from 'react';
import { MapPin, Star, ExternalLink, CheckCircle2 } from 'lucide-react';

interface GoogleBusinessBadgeProps {
  compact?: boolean;
}

export function GoogleBusinessBadge({ compact = false }: GoogleBusinessBadgeProps) {
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=10.07125,-69.32705';

  if (compact) {
    return (
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors text-xs font-bold shadow-2xs group"
        title="Ficha Oficial de Google Business - Calle 28 con Carrera 25"
      >
        <span className="text-amber-500 font-black">G</span>
        <div className="flex text-amber-500 text-[10px]">
          {'★'.repeat(5)}
        </div>
        <span className="text-[11px] text-slate-700">5.0 en Google</span>
        <ExternalLink className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
      </a>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-3xl p-5 border border-sky-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black text-lg shadow-2xs shrink-0">
            G
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                Ficha de Google Business
              </h4>
              <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verificado</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Calle 28 con Carrera 25, Barquisimeto, Estado Lara</span>
            </p>
            <div className="flex items-center space-x-2 mt-1.5">
              <div className="flex text-amber-500 text-xs">
                {'★'.repeat(5)}
              </div>
              <span className="text-xs font-bold text-slate-800">5.0</span>
              <span className="text-[11px] text-slate-500">(Agua Purificada & Recargas)</span>
            </div>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 font-extrabold text-xs rounded-xl border border-sky-200 shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>Abrir en Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
