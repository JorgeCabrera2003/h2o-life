'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ChevronRight, User, Wrench, Droplet, Bot, Sparkles, Send, Copy, Check } from 'lucide-react';
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
  const [copiedCatalog, setCopiedCatalog] = useState(false);
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

  const handleCopyCatalog = () => {
    const rate = exchangeRate.rate;
    const r = (usd: number) => (usd * rate).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    const text = `💧 *H2O LIFE - CATÁLOGO Y PRECIOS AL DÍA*
📍 *Ubicación:* Calle 28 con Carrera 25, Barquisimeto
🏢 *RIF:* J-50982341-2
💵 *Tasa BCV Oficial:* Bs. ${rate.toFixed(2)} / USD
━━━━━━━━━━━━━━━━━━━━━━
💧 *RECARGAS DE AGUA:*
• Recarga 20L / 18L: *$0.70* (Bs. ${r(0.70)})
*(Ósmosis Inversa, Ozono y Luz UV)*

🧴 *BOTELLONES Y ENVASES:*
• Botellón Nuevo 20L (Lleno): *$7.00* (Bs. ${r(7.00)})
• Botellón Vacío 20L: *$6.50* (Bs. ${r(6.50)})
• Botellón 5L (Lleno): *$2.50* (Bs. ${r(2.50)})

✨ *SERVICIOS:*
• Lavado y Desinfección con Ozono: *$0.50* (Bs. ${r(0.50)})
• Delivery Express: *$1.00* (Bs. ${r(1.00)})

🍦 *HELADOS Y MERIENDAS:*
• Helado Artesanal: *$1.00* (Bs. ${r(1.00)})
• Helado Paleta Premium: *$1.50* (Bs. ${r(1.50)})
• Tostones Caseros: *$1.00* (Bs. ${r(1.00)})
• Empanadas Chilenas: *$1.50* (Bs. ${r(1.50)})
━━━━━━━━━━━━━━━━━━━━━━
📲 *ATENCIÓN DIRECTA:*
Freyeliz: +58 424-5658068 (Bot Activo)`;

    navigator.clipboard.writeText(text);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed ${
        cartCount > 0 ? 'bottom-28 sm:bottom-24 lg:bottom-8' : 'bottom-22 sm:bottom-24 lg:bottom-8'
      } right-3 sm:right-6 lg:right-8 z-50 flex flex-col items-end pointer-events-none transition-all duration-200`}
      aria-label="Atención al Cliente por WhatsApp"
    >
      {/* Menú Desplegable con Opciones de Contacto & Bot de Freyeliz */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-92 bg-white/95 backdrop-blur-2xl border border-emerald-100 rounded-3xl p-4.5 shadow-2xl shadow-emerald-950/25 animate-in zoom-in-95 duration-200 pointer-events-auto max-h-[85vh] overflow-y-auto">
          {/* Header con Indicador de Bot Activo */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <MessageCircle className="w-5 h-5 fill-white text-transparent" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                  WhatsApp Oficial H2O Life
                </h4>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Bot Activo • Freyeliz (+58 424-5658068)</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 pressable cursor-pointer"
              aria-label="Cerrar opciones de WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Opción Destacada: Bot Autónomo de Freyeliz */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bot Autónomo de Freyeliz</span>
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Responde 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2.5 leading-snug">
                Envía cualquier mensaje o número al WhatsApp de Freyeliz para recibir respuesta automática inmediata:
              </p>

              {/* Botones de Disparo Rápido para el Bot de Freyeliz */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => openWhatsApp(freyelizNumber, '1', 'Freyeliz (Bot Catálogo)')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 text-left text-[11px] font-bold pressable flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>1️⃣</span>
                  <span className="truncate">Pedir Catálogo</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp(freyelizNumber, '2', 'Freyeliz (Bot Recargas)')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 text-left text-[11px] font-bold pressable flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>💧</span>
                  <span className="truncate">Recargas ($0.70)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp(freyelizNumber, '3', 'Freyeliz (Bot Ubicación)')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 text-left text-[11px] font-bold pressable flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>📍</span>
                  <span className="truncate">Calle 28 c/ 25</span>
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp(freyelizNumber, '4', 'Freyeliz (Bot Pago Móvil)')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 text-left text-[11px] font-bold pressable flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>💳</span>
                  <span className="truncate">Pago Móvil</span>
                </button>
              </div>

              {/* Botón Principal para Abrir Chat Directo con Freyeliz */}
              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    freyelizNumber,
                    'Hola Freyeliz, me comunico desde la web de H2O Life (Calle 28 con Carrera 25). Quisiera información sobre el servicio de agua.',
                    'Freyeliz Directo'
                  )
                }
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 pressable cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Escribir al WhatsApp de Freyeliz</span>
              </button>
            </div>

            {/* Opción: Copiar Catálogo Completo */}
            <button
              type="button"
              onClick={handleCopyCatalog}
              className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-100">
                  {copiedCatalog ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {copiedCatalog ? '✓ ¡Catálogo Copiado!' : 'Copiar Catálogo en Vivo'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Precios en $ y Bs. BCV ($0.70 recarga)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Opción: Karla (Caja & Mostrador) */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  karlaNumber,
                  'Hola Karla, me comunico sobre atención en caja y retiro de botellones.',
                  'Karla (Caja)'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-sky-600 flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-100">
                  <User className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Karla (Caja & Mostrador)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    +58 424-5717589 • Atención en tienda
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Opción: TSU Jorge Cabrera (Soporte & Auditoría) */}
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  jorgeNumber,
                  'Hola Jorge, me comunico para soporte o auditoría del sistema H2O Life POS.',
                  'Jorge (Soporte)'
                )
              }
              className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer pressable"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-100">
                  <Wrench className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    TSU Jorge Cabrera (Soporte)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    +58 424-5567016 • Auditoría y sistema
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Botón Principal Flotante (Apple-Tier Glassmorphic Fab) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-13 sm:h-14 px-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white flex items-center space-x-2.5 shadow-xl shadow-emerald-600/35 border border-emerald-400/50 ring-4 ring-emerald-500/20 active:scale-95 transition-all group cursor-pointer relative pointer-events-auto gpu-accelerated"
        aria-label="Abrir WhatsApp oficial de Freyeliz en H2O Life"
        title="WhatsApp Oficial H2O Life • Bot Activo de Freyeliz (+58 424-5658068)"
      >
        {/* Halo de pulso dinámico */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />

        <MessageCircle className="w-6 h-6 fill-white text-transparent group-hover:scale-110 transition-transform shrink-0" />

        <div className="text-left hidden sm:block pr-1">
          <span className="block text-xs font-black leading-tight tracking-tight">WhatsApp Bot</span>
          <span className="block text-[9px] font-bold text-emerald-100 leading-none">
            Freyeliz • En Línea
          </span>
        </div>
      </button>
    </div>
  );
}
