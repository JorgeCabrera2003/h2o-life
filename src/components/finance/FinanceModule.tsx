'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { PaymentMethod } from '@/types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Droplet,
  Plus,
  Receipt,
  FileText,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

export function FinanceModule() {
  const { sales, expenses, exchangeRate, currentUser, createExpense } = useH2OStore();

  const [activeTab, setActiveTab] = useState<'ventas' | 'gastos' | 'proveedores'>('ventas');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Formulario nuevo gasto
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<any>('insumos');
  const [expenseAmountUsd, setExpenseAmountUsd] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('efectivo_bs');

  // Cálculos financieros
  const totalSalesUsd = sales
    .filter(s => s.status === 'completada')
    .reduce((acc, s) => acc + s.total_usd, 0);
  const totalSalesBs = Number((totalSalesUsd * exchangeRate.rate).toFixed(2));

  const totalExpensesUsd = expenses.reduce((acc, e) => acc + e.amount_usd, 0);
  const totalExpensesBs = Number((totalExpensesUsd * exchangeRate.rate).toFixed(2));

  const netProfitUsd = totalSalesUsd - totalExpensesUsd;
  const netProfitBs = Number((netProfitUsd * exchangeRate.rate).toFixed(2));

  // Litros totales de agua vendidos
  let totalLitersSold = 0;
  sales.forEach(s => {
    s.items.forEach(i => {
      if (i.product_name.toLowerCase().includes('recarga') || i.product_name.toLowerCase().includes('agua')) {
        totalLitersSold += i.quantity * 20;
      }
    });
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmountUsd);
    if (amount > 0 && expenseDescription.trim()) {
      createExpense({
        description: expenseDescription.trim(),
        category: expenseCategory,
        amount_usd: amount,
        amount_bs: Number((amount * exchangeRate.rate).toFixed(2)),
        payment_method: expensePaymentMethod,
        recorded_by: currentUser?.name || 'Sistema',
      });

      setExpenseDescription('');
      setExpenseAmountUsd('');
      setIsExpenseModalOpen(false);
      alert('¡Gasto registrado con éxito!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-40 md:pb-36 animate-in fade-in duration-200">
      {/* Título & Botón de Gasto */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>Control Financiero & Reportes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de ingresos, ganancias netas y gastos operativos de H2O Life
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black px-4 py-2.5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs flex items-center space-x-2 pressable cursor-pointer min-h-[44px] transition-all"
        >
          <Plus className="w-4 h-4 text-sky-600" />
          <span>Registrar Gasto Operativo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ingreso Bruto</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">${totalSalesUsd.toFixed(2)}</p>
            <span className="text-xs font-bold text-slate-500">Bs. {totalSalesBs.toLocaleString()}</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gastos Totales</span>
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-600">${totalExpensesUsd.toFixed(2)}</p>
            <span className="text-xs font-bold text-slate-500">Bs. {totalExpensesBs.toLocaleString()}</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ganancia Neta</span>
              <TrendingUp className="w-4 h-4 text-sky-500" />
            </div>
            <p className={`text-2xl font-black ${netProfitUsd >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              ${netProfitUsd.toFixed(2)}
            </p>
            <span className="text-xs font-bold text-slate-500">Bs. {netProfitBs.toLocaleString()}</span>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Agua Despachada</span>
              <Droplet className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-black text-sky-600">{totalLitersSold.toLocaleString()} L</p>
            <span className="text-xs font-bold text-slate-500">
              {Math.round(totalLitersSold / 20)} Garrafones
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all pressable cursor-pointer ${
            activeTab === 'ventas' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historial de Ventas ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('gastos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all pressable cursor-pointer ${
            activeTab === 'gastos' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Gastos Operativos ({expenses.length})
        </button>
      </div>

      {/* Contenido de Tab: Ventas */}
      {activeTab === 'ventas' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 font-bold">Folio / Fecha</th>
                  <th className="p-3.5 font-bold">Cliente</th>
                  <th className="p-3.5 font-bold">Productos</th>
                  <th className="p-3.5 font-bold">Método & Ref</th>
                  <th className="p-3.5 font-bold text-right">Total ($ / Bs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900 block">{sale.folio}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{sale.client_name}</td>
                    <td className="p-3.5 text-slate-600">
                      {sale.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                    </td>
                    <td className="p-3.5">
                      {sale.payments.map((p, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <span className="capitalize font-bold text-slate-700">
                            {p.method.replace('_', ' ')}
                          </span>
                          {p.reference && (
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              Ref: {p.reference}
                            </span>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      ${sale.total_usd.toFixed(2)}
                      <span className="text-[10px] text-sky-700 block font-bold">
                        Bs. {sale.total_bs.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido de Tab: Gastos */}
      {activeTab === 'gastos' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 font-bold">Fecha / Categoría</th>
                  <th className="p-3.5 font-bold">Descripción</th>
                  <th className="p-3.5 font-bold">Registrado Por</th>
                  <th className="p-3.5 font-bold text-right">Monto ($ / Bs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </span>
                      <span className="capitalize font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{exp.description}</td>
                    <td className="p-3.5 text-slate-600">{exp.recorded_by}</td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600">
                      -${exp.amount_usd.toFixed(2)}
                      <span className="text-[10px] text-slate-500 block font-normal">
                        Bs. {exp.amount_bs.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Registrar Nuevo Gasto */}
      <SwipeableBottomSheet
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Registrar Gasto Operativo"
        maxWidth="md"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          Ingresa los detalles del pago o insumo adquirido
        </p>

        <form onSubmit={handleSaveExpense} className="space-y-3 px-1 pb-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Descripción:</label>
                <input
                  type="text"
                  placeholder="Ej. Mantenimiento de filtros, compra de precintos..."
                  value={expenseDescription}
                  onChange={e => setExpenseDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Categoría:</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="cisterna">Cisterna de Agua</option>
                    <option value="mantenimiento_filtros">Filtros y Purificación</option>
                    <option value="insumos">Tapas, Bolsas e Insumos</option>
                    <option value="electricidad">Electricidad / Servicios</option>
                    <option value="personal">Personal</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Monto ($ USD):</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0.00"
                    value={expenseAmountUsd}
                    onChange={e => setExpenseAmountUsd(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Método de Pago:</label>
                <select
                  value={expensePaymentMethod}
                  onChange={e => setExpensePaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:border-sky-500 focus:outline-hidden"
                >
                  <option value="efectivo_bs">Efectivo Bolívares (Bs)</option>
                  <option value="efectivo_usd">Efectivo Dólares ($)</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-4 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pb-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl pressable cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md pressable cursor-pointer min-h-[44px]"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
      </SwipeableBottomSheet>
    </div>
  );
}
