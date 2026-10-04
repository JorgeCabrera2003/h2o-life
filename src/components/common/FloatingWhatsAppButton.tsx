'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useH2OStoreSafe } from '@/lib/store';
import { analytics } from '@/lib/analytics';
import { SystemSettings } from '@/types';

export function FloatingWhatsAppButton() {
  const store = useH2OStoreSafe();
  const systemSettings: SystemSettings = store?.systemSettings || {
    business_name: 'H2O Life C.A.',
    business_rif: 'J-50982341-2',
    store_address: 'Calle 28 con Carrera 25, Barquisimeto',
    store_lat: 10.07125,
    store_lng: -69.32705,
    jorge_phone: '+58 424-5567016',
    freyeliz_phone: '+58 424-5658068',
    freyeli_phone: '+58 424-5658068',
    karla_phone: '+58 424-5717589',
    tank_low_threshold_pct: 20,
    auto_notify_sales: true,
    auto_notify_tank_alerts: true,
    auto_notify_cisterns: true,
    auto_notify_closures: true,
  };

  const cartCount = store?.cart?.length || 0;
  const freyelizNumber = (systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '+58 424-5658068').replace(/\D/g, '');

  const handleOpenWhatsApp = () => {
    const text = 'Hola Freyeliz, me comunico desde la web de H2O Life. Quisiera información sobre el servicio.';
    analytics.logEvent('whatsapp_click', 'pos', { targetRole: 'Freyeliz Directo', phone: freyelizNumber });
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${freyelizNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed ${
        cartCount > 0 ? 'bottom-28 sm:bottom-26 lg:bottom-22' : 'bottom-20 sm:bottom-22 lg:bottom-20'
      } right-3 sm:right-6 lg:right-8 z-40 flex flex-col items-end pointer-events-none transition-all duration-200`}
      aria-label="Atención al Cliente por WhatsApp"
    >
      {/* Botón Principal Flotante (Apple-Tier Glassmorphic Fab Minimalista) */}
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="h-13 sm:h-14 px-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white flex items-center space-x-2.5 shadow-xl shadow-emerald-600/35 border border-emerald-400/50 ring-4 ring-emerald-500/20 active:scale-[0.97] transition-all duration-200 ease-out group cursor-pointer relative pointer-events-auto gpu-accelerated"
        aria-label="Abrir WhatsApp oficial de Freyeliz en H2O Life"
        title="WhatsApp Oficial H2O Life • Bot Activo de Freyeliz (+58 424-5658068)"
      >
        {/* Halo de pulso dinámico sutil */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />

        <MessageCircle className="w-6 h-6 fill-white text-transparent group-hover:scale-110 transition-transform duration-200 ease-out shrink-0" />

        <div className="text-left hidden sm:block pr-1">
          <span className="block text-xs font-black leading-tight tracking-tight">Ayuda / Contacto</span>
          <span className="block text-[9px] font-bold text-emerald-100 leading-none">
            Bot Activo 24/7
          </span>
        </div>
      </button>
    </div>
  );
}
