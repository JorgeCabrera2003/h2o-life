'use client';

import React from 'react';
import Link from 'next/link';
import { Droplet, ArrowLeft, Home, Users, Database, BarChart3, MessageCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-sky-100 shadow-xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        {/* Animated Droplet Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-200/40 animate-ping" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Droplet className="w-10 h-10 fill-white text-transparent" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white font-black text-xs px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
            404
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          ¡Gota Extraviada!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          La ruta que intentas consultar no existe o ha cambiado de lugar. No te preocupes, todos los sistemas de purificación y ventas siguen operando con normalidad.
        </p>

        {/* Única llamada a la acción principal (Point 20 & Point 15) */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full min-h-[48px] bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-center space-x-2 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Punto de Venta</span>
          </Link>

          {/* Opciones secundarias discretas */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              O navega directamente a:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/?tab=clients"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-bold border border-slate-200/80 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Clientes</span>
              </Link>
              <Link
                href="/?tab=tanks"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-bold border border-slate-200/80 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Tanques</span>
              </Link>
            </div>

            <a
              href="https://wa.me/584121234567?text=Hola%20Freyeliz,%20encontré%20un%20error%20en%20el%20sistema%20H2O%20Life."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contactar a Freyeliz por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
