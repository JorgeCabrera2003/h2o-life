'use client';

import React from 'react';
import { Client, PaymentMethod, ExchangeRateInfo } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  X,
  BookOpen,
  Split,
} from 'lucide-react';
import { AnimatedCheck } from '@/components/ui/AnimatedIcons';
import { sanitizeBankReference, sanitizeCurrencyInput } from '@/lib/validators';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: Client | null;
  totalUsd: number;
  totalBs: number | string;
  exchangeRate: ExchangeRateInfo;
  activePaymentMethod: PaymentMethod;
  setActivePaymentMethod: (method: PaymentMethod) => void;
  pagoMovilBank: string;
  setPagoMovilBank: (bank: string) => void;
  pagoMovilRef: string;
  setPagoMovilRef: (ref: string) => void;
  puntoRef: string;
  setPuntoRef: (ref: string) => void;
  cashUsdGiven: string;
  setCashUsdGiven: (val: string) => void;
  changeUsd: number;
  changeBs: string;
  saleNotes: string;
  setSaleNotes: (notes: string) => void;
  onFinalizeSale: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  selectedClient,
  totalUsd,
  totalBs,
  exchangeRate,
  activePaymentMethod,
  setActivePaymentMethod,
  pagoMovilBank,
  setPagoMovilBank,
  pagoMovilRef,
  setPagoMovilRef,
  puntoRef,
  setPuntoRef,
  cashUsdGiven,
  setCashUsdGiven,
  changeUsd,
  changeBs,
  saleNotes,
  setSaleNotes,
  onFinalizeSale,
}: PaymentModalProps) {
  return (
    <SwipeableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Cobro de Venta"
      maxWidth="lg"
    >
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 px-1">
          {selectedClient?.name} • Tasa Oficial: <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">Bs. {exchangeRate.rate.toFixed(2)}</span>
        </p>

        {/* Total a Pagar Grande */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50/60 dark:from-sky-900/40 dark:to-cyan-900/20 rounded-2xl p-4 text-center border border-sky-100 dark:border-sky-800/50 mb-4 shadow-2xs mx-1">
          <p className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-0.5">
            Total a Recibir
          </p>
          <p className="text-3xl sm:text-4xl font-black text-sky-950 dark:text-white tracking-tight tabular-nums">
            ${totalUsd.toFixed(2)}
          </p>
          <p className="text-sm font-extrabold text-sky-700 dark:text-sky-400 tabular-nums mt-0.5">
            Bs. {totalBs}
          </p>
        </div>

        {/* Selector de Método de Pago */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Método de Pago Principal:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'pago_movil', label: 'Pago Móvil', icon: <Smartphone className="w-4 h-4 text-sky-600" /> },
              { id: 'punto', label: 'Punto Venta', icon: <CreditCard className="w-4 h-4 text-indigo-600" /> },
              { id: 'efectivo_usd', label: 'Efectivo $', icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
              { id: 'efectivo_bs', label: 'Efectivo Bs', icon: <Banknote className="w-4 h-4 text-amber-600" /> },
              { id: 'fiado', label: 'Fiado (Deuda)', icon: <BookOpen className="w-4 h-4 text-rose-600" /> },
              { id: 'mixto', label: 'Abono / Parte', icon: <Split className="w-4 h-4 text-purple-600" /> },
            ].map(m => {
              const isSelected = activePaymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActivePaymentMethod(m.id as PaymentMethod)}
                  className={`relative py-3 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 border transition-all pressable cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'text-white border-sky-600 scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="payment-method-pill"
                      className="absolute inset-0 bg-sky-600 rounded-2xl shadow-md shadow-sky-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isSelected ? 'text-white' : ''}`}>
                    {isSelected ? React.cloneElement(m.icon as React.ReactElement<any>, { className: 'w-4 h-4 text-white' }) : m.icon}
                  </span>
                  <span className="relative z-10">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advertencia para Fiado */}
        {activePaymentMethod === 'fiado' && (
          <div className="bg-rose-50/80 dark:bg-rose-900/20 rounded-2xl p-3.5 border border-rose-200 dark:border-rose-800/50 mb-4 mx-1">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-400">
              ⚠️ Se registrará la venta completa como deuda (${totalUsd.toFixed(2)}) para el cliente.
            </p>
          </div>
        )}

        {/* Inputs mixtos */}
        {activePaymentMethod === 'mixto' && (
          <div className="bg-purple-50/80 dark:bg-purple-900/20 rounded-2xl p-3.5 border border-purple-200 dark:border-purple-800/50 space-y-2 mb-4 mx-1">
            <label className="text-[10px] font-bold text-purple-900 dark:text-purple-400 uppercase">
              Monto Pagado Hoy (Abono):
            </label>
            <input
              type="text"
              placeholder={`Ej. 3.50`}
              value={cashUsdGiven}
              onChange={e => setCashUsdGiven(sanitizeCurrencyInput(e.target.value))}
              className="w-full text-sm font-black bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-400 tabular-nums"
            />
            {parseFloat(cashUsdGiven) > 0 && parseFloat(cashUsdGiven) < totalUsd && (
              <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 pt-1">
                👉 Se sumará a deuda: ${(totalUsd - parseFloat(cashUsdGiven)).toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Campos condicionales según el método */}
        {activePaymentMethod === 'pago_movil' && (
          <div className="bg-sky-50/60 dark:bg-sky-900/20 rounded-2xl p-3.5 border border-sky-100 dark:border-sky-800/50 space-y-2 mb-4 mx-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Banco:</label>
                <select
                  value={pagoMovilBank}
                  onChange={e => setPagoMovilBank(e.target.value)}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl p-2.5 focus:border-sky-500 focus:outline-hidden"
                >
                  <option value="Banesco">Banesco</option>
                  <option value="Banco de Venezuela">Banco de Venezuela</option>
                  <option value="Mercantil">Mercantil</option>
                  <option value="Provincial">Provincial</option>
                  <option value="Bancaribe">Bancaribe</option>
                  <option value="BNC">BNC</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Referencia (4 dígitos):
                </label>
                <input
                  type="text"
                  placeholder="Ej. 3062"
                  value={pagoMovilRef}
                  onChange={e => setPagoMovilRef(sanitizeBankReference(e.target.value))}
                  maxLength={8}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl p-2.5 font-mono uppercase focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {activePaymentMethod === 'punto' && (
          <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl p-3.5 border border-indigo-100 dark:border-indigo-800/50 space-y-2 mb-4 mx-1">
            <label className="text-[10px] font-bold text-indigo-900 dark:text-indigo-400 uppercase">
              Referencia o Lote de Tarjeta:
            </label>
            <input
              type="text"
              placeholder="Ej. 8841"
              value={puntoRef}
              onChange={e => setPuntoRef(sanitizeBankReference(e.target.value))}
              maxLength={8}
              className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl p-2.5 font-mono uppercase focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
        )}

        {activePaymentMethod === 'efectivo_usd' && (
          <div className="bg-emerald-50/80 dark:bg-emerald-900/20 rounded-2xl p-3.5 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5 mb-4 mx-1">
            <label className="text-[10px] font-bold text-emerald-900 dark:text-emerald-400 uppercase">
              Monto Recibido en Dólares ($):
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder={`Mínimo $${totalUsd.toFixed(2)}`}
                value={cashUsdGiven}
                onChange={e => setCashUsdGiven(sanitizeCurrencyInput(e.target.value))}
                maxLength={8}
                className="flex-1 min-w-[140px] text-sm font-black bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 tabular-nums"
              />
              <div className="flex flex-1 sm:flex-none gap-2">
                {[1, 5, 10, 20].map(bill => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashUsdGiven(bill.toString())}
                    className="flex-1 sm:flex-none px-2.5 py-2.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-black pressable shadow-xs cursor-pointer tabular-nums flex items-center justify-center transition-transform"
                  >
                    ${bill}
                  </button>
                ))}
              </div>
            </div>

            {changeUsd > 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-400">Vuelto a Entregar:</span>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-900 dark:text-emerald-300 tabular-nums">${changeUsd.toFixed(2)}</span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-500 font-bold block tabular-nums">Bs. {changeBs}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notas operativas de libreta (ej. "Vuelto de 1$") */}
        <div className="mb-4 px-1">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
            Nota Operativa (opcional):
          </label>
          <input
            type="text"
            placeholder="Ej. Vuelto entregado, garrafón prestado..."
            value={saleNotes}
            onChange={e => setSaleNotes(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl p-2.5 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Botón Finalizar (Single Primary CTA en Checkout) */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-2 pb-2 px-1">
          <button
            type="button"
            onClick={onFinalizeSale}
            className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-700 dark:to-teal-600 hover:from-emerald-700 dark:hover:to-teal-500 text-white font-black py-3.5 px-6 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer pressable text-sm"
          >
            <AnimatedCheck className="w-4 h-4 text-white" strokeWidth={3} />
            <span>Registrar Venta Exitosa</span>
          </button>
        </div>
    </SwipeableBottomSheet>
  );
}
