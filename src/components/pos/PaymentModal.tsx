'use client';

import React from 'react';
import { Client, PaymentMethod, ExchangeRateInfo } from '@/types';
import {
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  CheckCircle2,
  X,
} from 'lucide-react';
import { sanitizeBankReference, sanitizeCurrencyInput } from '@/lib/validators';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative z-10 animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto gpu-accelerated">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Cobro de Venta</h3>
            <p className="text-xs text-slate-500 font-medium">
              {selectedClient?.name} • Tasa Oficial: <span className="font-bold text-sky-700 tabular-nums">Bs. {exchangeRate.rate.toFixed(2)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal de cobro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total a Pagar Grande */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50/60 rounded-2xl p-4 text-center border border-sky-100 mb-4 shadow-2xs">
          <p className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-0.5">
            Total a Recibir
          </p>
          <p className="text-3xl sm:text-4xl font-black text-sky-950 tracking-tight tabular-nums">
            ${totalUsd.toFixed(2)}
          </p>
          <p className="text-sm font-extrabold text-sky-700 tabular-nums mt-0.5">
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
            ].map(m => {
              const isSelected = activePaymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActivePaymentMethod(m.id as PaymentMethod)}
                  className={`py-3 px-2 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center space-y-1.5 border transition-all pressable cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20 scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : ''}>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campos condicionales según el método */}
        {activePaymentMethod === 'pago_movil' && (
          <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-100 space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Banco:</label>
                <select
                  value={pagoMovilBank}
                  onChange={e => setPagoMovilBank(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 focus:border-sky-500 focus:outline-hidden"
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
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Referencia (4 dígitos):
                </label>
                <input
                  type="text"
                  placeholder="Ej. 3062"
                  value={pagoMovilRef}
                  onChange={e => setPagoMovilRef(sanitizeBankReference(e.target.value))}
                  maxLength={8}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 font-mono uppercase focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {activePaymentMethod === 'punto' && (
          <div className="bg-indigo-50/50 rounded-2xl p-3.5 border border-indigo-100 space-y-2 mb-4">
            <label className="text-[10px] font-bold text-indigo-900 uppercase">
              Referencia o Lote de Tarjeta:
            </label>
            <input
              type="text"
              placeholder="Ej. 8841"
              value={puntoRef}
              onChange={e => setPuntoRef(sanitizeBankReference(e.target.value))}
              maxLength={8}
              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl p-2.5 font-mono uppercase focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
        )}

        {activePaymentMethod === 'efectivo_usd' && (
          <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200 space-y-2.5 mb-4">
            <label className="text-[10px] font-bold text-emerald-900 uppercase">
              Monto Recibido en Dólares ($):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Mínimo $${totalUsd.toFixed(2)}`}
                value={cashUsdGiven}
                onChange={e => setCashUsdGiven(sanitizeCurrencyInput(e.target.value))}
                maxLength={8}
                className="flex-1 text-sm font-black bg-white border border-emerald-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 tabular-nums"
              />
              {[1, 5, 10, 20].map(bill => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => setCashUsdGiven(bill.toString())}
                  className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black pressable shadow-xs cursor-pointer tabular-nums"
                >
                  ${bill}
                </button>
              ))}
            </div>

            {changeUsd > 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between items-center">
                <span className="text-xs font-extrabold text-emerald-900">Vuelto a Entregar:</span>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-900 tabular-nums">${changeUsd.toFixed(2)}</span>
                  <span className="text-xs text-emerald-700 font-bold block tabular-nums">Bs. {changeBs}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notas operativas de libreta (ej. "Vuelto de 1$") */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
            Nota Operativa (opcional):
          </label>
          <input
            type="text"
            placeholder="Ej. Vuelto entregado, garrafón prestado..."
            value={saleNotes}
            onChange={e => setSaleNotes(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Botón Finalizar (Single Primary CTA en Checkout) */}
        <button
          type="button"
          onClick={onFinalizeSale}
          className="w-full min-h-[50px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer pressable"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Registrar Venta Exitosa</span>
        </button>
      </div>
    </div>
  );
}
