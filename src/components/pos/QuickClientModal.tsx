'use client';

import React from 'react';
import {
  sanitizeAndCapitalizeName,
  sanitizeVenezuelanPhoneInput,
  sanitizeAddressText,
} from '@/lib/validators';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newClientName: string;
  setNewClientName: (name: string) => void;
  newClientPhone: string;
  setNewClientPhone: (phone: string) => void;
  newClientAddress: string;
  setNewClientAddress: (address: string) => void;
  honeypot: string;
  setHoneypot: (hp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function QuickClientModal({
  isOpen,
  onClose,
  newClientName,
  setNewClientName,
  newClientPhone,
  setNewClientPhone,
  newClientAddress,
  setNewClientAddress,
  honeypot,
  setHoneypot,
  onSubmit,
}: QuickClientModalProps) {
  if (!isOpen) return null;

  return (
    <SwipeableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Cliente"
      maxWidth="sm"
    >
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium px-1">
        Se agregará al inicio del directorio en <strong>Orden Actual</strong>
      </p>

      <form onSubmit={onSubmit} className="px-1 pb-4">
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre Completo:</label>
              <input
                type="text"
                placeholder="Ej. Carmen De La Luz"
                value={newClientName}
                onChange={e => setNewClientName(sanitizeAndCapitalizeName(e.target.value))}
                maxLength={50}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
                autoFocus
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Teléfono (WhatsApp):</label>
                <span className="text-[10px] text-slate-400">Máx. 11 dígitos</span>
              </div>
              <input
                type="tel"
                placeholder="Ej. 0424-5567016"
                value={newClientPhone}
                onChange={e => {
                  const res = sanitizeVenezuelanPhoneInput(e.target.value);
                  setNewClientPhone(res.formatted);
                }}
                maxLength={12}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Dirección / Sector:</label>
              <input
                type="text"
                placeholder="Ej. Calle 26 con Carrera 25"
                value={newClientAddress}
                onChange={e => setNewClientAddress(sanitizeAddressText(e.target.value))}
                maxLength={120}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Honeypot invisible para protección anti-spam */}
            <input
              type="text"
              name="_hp_security_check"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
          </div>

          <div className="flex space-x-2 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 dark:shadow-sky-900/40 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            >
              Guardar y Usar
            </button>
          </div>
        </form>
    </SwipeableBottomSheet>
  );
}
