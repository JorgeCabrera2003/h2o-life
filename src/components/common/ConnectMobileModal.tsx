'use client';

import React, { useState } from 'react';
import { Smartphone, Wifi, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface ConnectMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectMobileModal({ isOpen, onClose }: ConnectMobileModalProps) {
  const [copied, setCopied] = useState(false);
  const localIpUrl = 'http://192.168.31.101:3000';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    localIpUrl
  )}&color=0284c7&bgcolor=ffffff&qzone=1`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localIpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-sky-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Conectar Teléfono Móvil
              </h3>
              <p className="text-[11px] text-slate-500">Acceso ultrarrápido y seguro en red local Wi-Fi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Explicación Técnica y Solución al problema de DNS */}
        <div className="mt-4 p-3 bg-sky-50/80 rounded-2xl border border-sky-200/80 flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-900 leading-relaxed">
            <p className="font-bold mb-0.5">¿Por qué falla el túnel público (DNS_PROBE_POSSIBLE)?</p>
            <p className="text-[11px] text-sky-800/90">
              Las operadoras en Venezuela (CANTV, Digitel, Inter) frecuentemente bloquean o tienen fallas de resolución DNS en dominios temporales de Cloudflare (<code>*.trycloudflare.com</code>).
            </p>
            <p className="text-[11px] text-emerald-800 font-bold mt-1">
              ✨ La solución directa y 100% infalible es entrar por tu red Wi-Fi local: es instantánea, sin internet y con cero latencia.
            </p>
          </div>
        </div>

        {/* Código QR & Enlace */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="p-3 bg-white rounded-3xl border-2 border-dashed border-sky-300 shadow-md mb-3 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Código QR para abrir H2O Life POS en el teléfono"
              width={200}
              height={200}
              className="rounded-2xl"
            />
            <span className="absolute bottom-1 right-1 bg-sky-600 text-white p-1 rounded-lg text-[9px] font-bold shadow-xs">
              Wi-Fi
            </span>
          </div>

          <p className="text-xs font-black text-slate-800 mb-1">
            Apunta la cámara de tu teléfono al código QR
          </p>
          <p className="text-[11px] text-slate-500 mb-4 max-w-xs">
            Asegúrate de que tu teléfono esté conectado a la misma red Wi-Fi que esta computadora.
          </p>

          {/* Caja con la URL y botón Copiar */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2 overflow-hidden text-left pl-1">
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block font-semibold leading-none">
                  Dirección IP Directa:
                </span>
                <span className="text-xs font-mono font-black text-sky-800 select-all">
                  {localIpUrl}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0 shadow-xs pressable cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pasos rápidos */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
          <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
            Instrucciones para abrir en 3 segundos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-[10px] flex items-center justify-center mb-1">
                1
              </span>
              <p className="font-bold text-slate-800">Conecta tu Celular</p>
              <p className="text-slate-500 text-[10px]">Al mismo Wi-Fi de la tienda.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-[10px] flex items-center justify-center mb-1">
                2
              </span>
              <p className="font-bold text-slate-800">Abre el Navegador</p>
              <p className="text-slate-500 text-[10px]">Chrome, Safari o Brave.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-black text-[10px] flex items-center justify-center mb-1">
                3
              </span>
              <p className="font-bold text-slate-800">Escribe la IP</p>
              <p className="text-slate-500 text-[10px]">192.168.31.101:3000</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs pressable cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
