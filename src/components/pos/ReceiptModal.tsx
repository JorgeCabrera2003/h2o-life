'use client';

import React from 'react';
import { Sale, SystemSettings } from '@/types';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

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
  return (
    <SwipeableBottomSheet
      isOpen={!!completedSale}
      onClose={onClose}
      title=""
      maxWidth="sm"
    >
      {completedSale && (
        <div className="text-center px-1 pb-4">
            {/* Animated Checkmark */}
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: 'spring', delay: 0.1, damping: 15 } }}
                className="absolute inset-0 bg-emerald-100 rounded-full"
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10">
                <motion.circle
                  cx="12" cy="12" r="10"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                />
                <motion.path
                  d="m9 12 2 2 4-4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">¡Venta Registrada!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-5">{completedSale.folio}</p>

            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-700/80 mb-5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Cliente:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedSale.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total USD:</span>
                <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                  ${completedSale.total_usd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Bs:</span>
                <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">Bs. {completedSale.total_bs.toFixed(2)}</span>
              </div>
              {completedSale.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 italic">
                  &quot;{completedSale.notes}&quot;
                </div>
              )}
            </div>

        <div className="space-y-2 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-2">


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
            className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 text-white dark:text-slate-900 font-bold py-2.5 rounded-xl text-xs min-h-[44px] transition-all cursor-pointer"
          >
            Nueva Venta
          </button>
        </div>
        </div>
      )}
    </SwipeableBottomSheet>
  );
}
