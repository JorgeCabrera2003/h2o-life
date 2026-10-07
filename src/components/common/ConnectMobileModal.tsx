'use client';

import React, { useState } from 'react';
import { Smartphone, Wifi, Copy, Check, ShieldCheck, QrCode } from 'lucide-react';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

interface ConnectMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectMobileModal({ isOpen, onClose }: ConnectMobileModalProps) {
  const [copied, setCopied] = useState(false);
  const localIpUrl = 'http://192.168.31.101:3000';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    localIpUrl
  )}&color=0369a1&bgcolor=ffffff&qzone=1`; // Darker blue QR

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localIpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SwipeableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Modo Remoto Local"
      maxWidth="lg"
    >
      <div className="relative">
        {/* Decoración de fondo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-sky-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative mt-2 flex flex-col items-center">
          {/* Contenedor QR Neón */}
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative p-4 bg-white dark:bg-white rounded-2xl border border-slate-100 shadow-xl flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Código QR"
                width={200}
                height={200}
                className="rounded-xl transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-3 right-4 bg-sky-950 text-sky-50 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center space-x-1.5 border border-sky-800">
                <QrCode className="w-3 h-3" />
                <span>Escanear QR</span>
              </div>
            </div>
          </div>

          <p className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1 text-center">
            Abre la cámara de tu móvil
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">
            Ambos dispositivos deben estar en la misma red Wi-Fi. No consume datos de internet.
          </p>

          {/* Bloque IP Copiable */}
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-sky-100/50 dark:border-slate-700/50 shadow-inner" />
            <div className="relative w-full p-3 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 overflow-hidden pl-2">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-600 shrink-0">
                  <Wifi className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">
                    Dirección IP Local
                  </span>
                  <span className="text-sm font-mono font-black text-sky-900 dark:text-sky-300 select-all truncate">
                    {localIpUrl}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm hover:border-sky-200 dark:hover:border-slate-500 hover:text-sky-700 dark:hover:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 animate-in zoom-in" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pasos Rápidos con diseño de tarjetas flotantes */}
        <div className="mt-8 relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">
            Proceso de conexión rápida
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: '1', title: 'Conecta', sub: 'Mismo Wi-Fi' },
              { num: '2', title: 'Escanea', sub: 'O abre navegador' },
              { num: '3', title: 'Entra', sub: 'Sin latencia' }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-sky-200 dark:group-hover:border-sky-700 group-hover:shadow-md transition-all duration-300" />
                <div className="relative p-3 flex flex-col items-center text-center">
                  <span className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40 group-hover:text-sky-600 dark:group-hover:text-sky-400 font-black text-xs flex items-center justify-center mb-2 transition-colors">
                    {step.num}
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] mb-0.5">{step.title}</p>
                  <p className="text-slate-400 text-[9px] font-semibold">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Técnica Discreta */}
        <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center space-x-2 border border-slate-100 dark:border-slate-700/50 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Conexión en red local directa. Bypass de bloqueos DNS de CANTV/Digitel.
          </span>
        </div>
      </div>
    </SwipeableBottomSheet>
  );
}
