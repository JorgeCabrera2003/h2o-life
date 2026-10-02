'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ChevronRight, User, Wrench, Droplet } from 'lucide-react';
import { useH2OStoreSafe } from '@/lib/store';
import { analytics } from '@/lib/analytics';

export function FloatingWhatsAppButton() {
  const store = useH2OStoreSafe();
  const systemSettings = store?.systemSettings || {
    jorge_phone: '+58 424-5567016',
    freyeliz_phone: '+58 424-5658068',
    freyeli_phone: '+58 424-5658068',
    karla_phone: '+58 424-5717589',
  };
  const exchangeRate = store?.exchangeRate || { rate: 866.56 };
  const cartCount = store?.cart?.length || 0;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar si hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const freyelizNumber = (systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '+58 424-5658068').replace(/\D/g, '');
  const jorgeNumber = (systemSettings.jorge_phone || '+58 424-5567016').replace(/\D/g, '');
  const karlaNumber = (systemSettings.karla_phone || '+58 424-5717589').replace(/\D/g, '');

  const openWhatsApp = (phone: string, text: string, targetRole: string) => {
    analytics.logEvent('whatsapp_click', 'pos', { targetRole, phone });
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed ${
        cartCount > 0 ? 'bottom-36 sm:bottom-28' : 'bottom-20 sm:bottom-22'
      } md:bottom-8 right-3 md:right-8 z-30 flex flex-col items-end pointer-events-none transition-all duration-200`}
      aria-label="Atención al Cliente por WhatsApp"
    >
      {/* Menú Desplegable con Opciones de Contacto */}
      {isOpen && (
        <div className="mb-3 w-76 sm:w-80 bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl p-4 shadow-2xl shadow-emerald-950/20 animate-in zoom-in-95 duration-200 pointer-events-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-4 h-4 fill-white text-transparent" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                  Atención Inmediata WhatsApp
                </h4>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>En línea • Sede Calle 28 c/ 25</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg pressable cursor-pointer"
              aria-label="Cerrar opciones de WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Opción 1: Freyeliz (Administradora / Tienda) */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  freyelizNumber,
                  `Hola Freyeliz, me comunico desde H2O Life (Sede Calle 28 con Carrera 25). Quisiera consultar sobre disponibilidad y recarga de botellones de agua.`,
                  'Freyeliz (Tienda)'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-800">
                    Freyeliz (Administración)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Recargas, pedidos a domicilio y despacho
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Opción 2: Karla (Caja & Mostrador) */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  karlaNumber,
                  `Hola Karla, me comunico desde H2O Life. Quisiera consultar sobre la atención en caja y pedidos en mostrador.`,
                  'Karla (Cajera / Mostrador)'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-cyan-50/60 hover:bg-cyan-100/70 border border-cyan-100 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-cyan-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-cyan-800">
                    Karla (Caja & Mostrador)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Cobros, cambio de botellones y atención rápida
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Opción 3: Consultar Precios y Tasa BCV */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  freyelizNumber,
                  `Hola Freyeliz, me gustaría consultar la lista de precios de hoy con tasa oficial BCV Bs. ${exchangeRate.rate.toFixed(
                    2
                  )} por dólar.`,
                  'Consulta Precios'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-sky-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Droplet className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-800">
                    Lista de Precios & Recargas
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Tasa actual Bs. {exchangeRate.rate.toFixed(2)} / USD
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Opción 4: TSU Jorge Cabrera (Soporte Técnico) */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  jorgeNumber,
                  `Hola Jorge, me comunico sobre el soporte técnico de la plataforma H2O Life POS.`,
                  'Jorge (Soporte Técnico)'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Soporte Técnico (TSU Jorge Cabrera)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Auditoría, sincronización y sistema
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Botón Principal Flotante (Touch target >= 48px) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition-all group cursor-pointer relative pointer-events-auto"
        aria-label="Abrir chat de WhatsApp de H2O Life"
        title="Contactar por WhatsApp a Freyeliz o Jorge"
      >
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7 fill-white text-transparent group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
