'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { Lock, CheckCircle2, Share2, DollarSign, Banknote, Smartphone, CreditCard, AlertCircle } from 'lucide-react';

export function CashClosureModule() {
  const { sales, expenses, exchangeRate, currentUser, createCashClosure, cashClosures } = useH2OStore();
  const [closureNotes, setClosureNotes] = useState('');
  const [lastGeneratedClosure, setLastGeneratedClosure] = useState<any>(null);

  // Calcular desglose de las ventas del día
  const completedSales = sales.filter(s => s.status === 'completada');
  const totalSalesCount = completedSales.length;

  let totalUsd = 0;
  let totalBs = 0;
  let efectivoUsd = 0;
  let efectivoBs = 0;
  let puntoBs = 0;
  let pagoMovilBs = 0;
  let transferenciaBs = 0;

  completedSales.forEach(sale => {
    totalUsd += sale.total_usd;
    totalBs += sale.total_bs;
    sale.payments.forEach(p => {
      if (p.method === 'efectivo_usd') efectivoUsd += p.amount_usd;
      if (p.method === 'efectivo_bs') efectivoBs += p.amount_bs;
      if (p.method === 'punto') puntoBs += p.amount_bs;
      if (p.method === 'pago_movil') pagoMovilBs += p.amount_bs;
      if (p.method === 'transferencia') transferenciaBs += p.amount_bs;
    });
  });

  const totalExpensesUsd = expenses.reduce((acc, e) => acc + e.amount_usd, 0);
  const netProfitUsd = totalUsd - totalExpensesUsd;

  const handleGenerateClosure = () => {
    const closure = createCashClosure(closureNotes);
    setLastGeneratedClosure(closure);
    alert('¡Cierre de caja generado con éxito!');
  };

  const handleShareWhatsAppClosure = (closureData: any) => {
    const text = `🔒 *H2O LIFE - CIERRE DIARIO DE CAJA*%0AOperador: ${closureData.worker_name}%0AFecha: ${new Date(closureData.closed_at).toLocaleDateString()} ${new Date(closureData.closed_at).toLocaleTimeString()}%0ATasa BCV: Bs. ${closureData.exchange_rate.toFixed(2)}%0A-----------------------------%0A*Total Ventas:* ${closureData.total_sales_count}%0A*Ingreso Bruto:* $${closureData.total_usd.toFixed(2)} / Bs. ${closureData.total_bs.toFixed(2)}%0A-----------------------------%0A*DESGLOSE DE FONDOS:*%0A💵 Efectivo USD: $${closureData.breakdown.efectivo_usd.toFixed(2)}%0A💵 Efectivo Bs: Bs. ${closureData.breakdown.efectivo_bs.toFixed(2)}%0A💳 Punto de Venta: Bs. ${closureData.breakdown.punto_bs.toFixed(2)}%0A📱 Pago Móvil: Bs. ${closureData.breakdown.pago_movil_bs.toFixed(2)}%0A🏦 Transferencia: Bs. ${closureData.breakdown.transferencia_bs.toFixed(2)}%0A-----------------------------%0A*Gastos del Turno:* $${closureData.total_expenses_usd.toFixed(2)}%0A*BALANCE NETO:* $${closureData.net_usd.toFixed(2)}%0A${closureData.notes ? `Nota: ${closureData.notes}` : ''}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Título */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-sky-600" />
            <span>Cierre de Caja & Arqueo</span>
          </h2>
          <p className="text-xs text-slate-500">
            Operador actual: <strong className="text-slate-800">{currentUser.name}</strong> • Tasa: Bs. {exchangeRate.rate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Resumen Superior */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ventas Hoy</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{totalSalesCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ingresos USD</span>
          <p className="text-xl font-black text-emerald-600 mt-0.5">${totalUsd.toFixed(2)}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ingresos Bs</span>
          <p className="text-xl font-black text-sky-600 mt-0.5">Bs. {totalBs.toFixed(2)}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Gastos Turno</span>
          <p className="text-xl font-black text-rose-500 mt-0.5">${totalExpensesUsd.toFixed(2)}</p>
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Arqueo por Métodos de Pago
        </h3>

        <div className="space-y-2.5">
          {/* Efectivo USD */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                <DollarSign className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Efectivo en Dólares ($)</span>
                <span className="text-[10px] text-slate-500">Billetes en gaveta</span>
              </div>
            </div>
            <span className="text-base font-black text-emerald-700">${efectivoUsd.toFixed(2)}</span>
          </div>

          {/* Efectivo Bs */}
          <div className="flex items-center justify-between p-3 bg-sky-50/60 rounded-xl border border-sky-100">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-sky-600 text-white">
                <Banknote className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Efectivo en Bolívares (Bs)</span>
                <span className="text-[10px] text-slate-500">Billetes en gaveta</span>
              </div>
            </div>
            <span className="text-base font-black text-sky-800">Bs. {efectivoBs.toFixed(2)}</span>
          </div>

          {/* Punto de Venta */}
          <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <CreditCard className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Punto de Venta (Tarjeta)</span>
                <span className="text-[10px] text-slate-500">Total en el lote del punto</span>
              </div>
            </div>
            <span className="text-base font-black text-indigo-800">Bs. {puntoBs.toFixed(2)}</span>
          </div>

          {/* Pago Móvil */}
          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-amber-600 text-white">
                <Smartphone className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Pago Móvil</span>
                <span className="text-[10px] text-slate-500">Verificado en cuentas bancarias</span>
              </div>
            </div>
            <span className="text-base font-black text-amber-800">Bs. {pagoMovilBs.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formulario de Cierre */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-5">
        <label className="text-xs font-bold text-slate-700 block mb-1.5">
          Observaciones del Cierre de Caja:
        </label>
        <textarea
          rows={2}
          placeholder="Ej. Todo cuadrado con el lote del punto. Se apartaron $20 para la cisterna de mañana..."
          value={closureNotes}
          onChange={e => setClosureNotes(e.target.value)}
          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4"
        />

        <button
          onClick={handleGenerateClosure}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md"
        >
          <Lock className="w-4 h-4" />
          <span>Generar y Guardar Cierre de Turno</span>
        </button>
      </div>

      {/* Último Cierre Generado */}
      {lastGeneratedClosure && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-5 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cierre de Caja Guardado</span>
            </span>
            <button
              onClick={() => handleShareWhatsAppClosure(lastGeneratedClosure)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar a Jorge por WhatsApp</span>
            </button>
          </div>
          <p className="text-xs text-emerald-900">
            Total Neto Entregado: <strong>${lastGeneratedClosure.net_usd.toFixed(2)}</strong>
          </p>
        </div>
      )}

      {/* Historial de Cierres Anteriores */}
      {cashClosures.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Historial de Cierres
          </h3>
          <div className="space-y-2">
            {cashClosures.map(c => (
              <div
                key={c.id}
                className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">
                    {new Date(c.closed_at).toLocaleDateString()} {new Date(c.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-slate-500">Operador: {c.worker_name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-slate-900">${c.total_usd.toFixed(2)}</span>
                  <button
                    onClick={() => handleShareWhatsAppClosure(c)}
                    className="p-1 text-slate-400 hover:text-emerald-600"
                    title="Reenviar por WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
