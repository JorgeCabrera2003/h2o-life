'use client';

import React from 'react';
import { Sale, SystemSettings } from '@/types';
import { CheckCircle2, Share2, MessageCircle } from 'lucide-react';

interface ReceiptModalProps {
  completedSale: Sale | null;
  onClose: () => void;
  onShareWhatsApp: () => void;
  getWhatsAppSaleUrl: (sale: Sale, phone: string) => string;
  systemSettings: SystemSettings;
}

export function ReceiptModal({
  completedSale,
  onClose,
  onShareWhatsApp,
  getWhatsAppSaleUrl,
  systemSettings,
}: ReceiptModalProps) {
  if (!completedSale) return null;

  const freyelizPhone = systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '+58 424-5658068';
  const jorgePhone = systemSettings.jorge_phone || '+58 424-5567016';

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-slate-100 relative z-10 animate-in zoom-in-95 duration-150 gpu-accelerated">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">¡Venta Registrada!</h3>
        <p className="text-xs text-slate-500 font-mono mb-4">{completedSale.folio}</p>

        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Cliente:</span>
            <span className="font-bold text-slate-800">{completedSale.client_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Total USD:</span>
            <span className="font-extrabold text-slate-900 tabular-nums">
              ${completedSale.total_usd.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Total Bs:</span>
            <span className="font-bold text-sky-700 tabular-nums">Bs. {completedSale.total_bs.toFixed(2)}</span>
          </div>
          {completedSale.notes && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
              &quot;{completedSale.notes}&quot;
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const url = getWhatsAppSaleUrl(completedSale, freyelizPhone);
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold py-2.5 px-2 rounded-xl shadow-md flex items-center justify-center space-x-1.5 text-xs pressable cursor-pointer min-h-[44px] transition-all"
              title="Enviar notificación a Freyeliz"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>👩‍💼 A Freyeliz</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const url = getWhatsAppSaleUrl(completedSale, jorgePhone);
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="bg-sky-800 hover:bg-sky-900 active:scale-95 text-white font-bold py-2.5 px-2 rounded-xl shadow-md flex items-center justify-center space-x-1.5 text-xs pressable cursor-pointer min-h-[44px] transition-all"
              title="Enviar notificación a Jorge"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>👨‍💼 A Jorge</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onShareWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-2 text-xs min-h-[44px] transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Recibo al Cliente</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs min-h-[44px] transition-all cursor-pointer"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}
