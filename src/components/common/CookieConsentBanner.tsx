'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    // Verificar si ya otorgó consentimiento previo
    const consent = localStorage.getItem('h2o_cookie_consent');
    if (!consent) {
      // Mostrar con ligero retardo para no interrumpir el primer render
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'h2o_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  const handleAcceptEssentialOnly = () => {
    localStorage.setItem(
      'h2o_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: false,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      'h2o_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: analyticsAllowed,
        timestamp: new Date().toISOString(),
      })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de Cookies y Privacidad"
      className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-sky-500/30 rounded-3xl p-5 shadow-2xl shadow-sky-950/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
              <Cookie className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                Privacidad & Uso de Cookies
              </h3>
              <span className="text-[10px] text-sky-300 font-semibold uppercase tracking-wider">
                H2O Life Purified Water
              </span>
            </div>
          </div>
          <button
            onClick={handleAcceptEssentialOnly}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar aviso de cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          Utilizamos cookies y almacenamiento local técnico para guardar el carrito de compras, recordar el operador activo, calcular la tasa BCV y garantizar transacciones seguras.
        </p>

        {showDetails && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <div>
                <span className="font-bold text-white block">Técnicas / Esenciales</span>
                <span className="text-[10px] text-slate-400">Requeridas para el funcionamiento del POS</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Siempre activas</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <div>
                <span className="font-bold text-white block">Analítica y Rendimiento</span>
                <span className="text-[10px] text-slate-400">Medición anónima de tiempos de carga y uso</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={e => setAnalyticsAllowed(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded cursor-pointer accent-sky-500"
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-1 flex items-center space-x-3">
              <Link href="/privacidad" className="text-sky-400 hover:underline">
                Política de Privacidad
              </Link>
              <span>•</span>
              <Link href="/aviso-legal" className="text-sky-400 hover:underline">
                Aviso Legal
              </Link>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          {!showDetails ? (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:flex-1 min-h-[44px] bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
              >
                Aceptar Todas
              </button>
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="w-full sm:w-auto min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Personalizar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full sm:flex-1 min-h-[44px] bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                Guardar Selección
              </button>
              <button
                type="button"
                onClick={handleAcceptEssentialOnly}
                className="w-full sm:w-auto min-h-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Solo Esenciales
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
