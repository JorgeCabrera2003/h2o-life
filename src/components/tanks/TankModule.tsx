'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { Database, Truck, Plus, CheckCircle, AlertCircle, Droplets } from 'lucide-react';

export function TankModule() {
  const { tanks, registerCisternDelivery, updateTankLevel } = useH2OStore();

  const [isCisternModalOpen, setIsCisternModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('Cisterna Los Andes');
  const [litersDelivered, setLitersDelivered] = useState('10000');
  const [costUsd, setCostUsd] = useState('50.00');
  const [targetTankId, setTargetTankId] = useState(tanks[0]?.id || 'tank-principal-a');
  const [paymentStatus, setPaymentStatus] = useState<'pagado' | 'pendiente'>('pagado');

  const handleSaveCistern = (e: React.FormEvent) => {
    e.preventDefault();
    const liters = parseInt(litersDelivered);
    const cost = parseFloat(costUsd);

    if (liters > 0 && cost >= 0) {
      registerCisternDelivery({
        supplier_name: supplierName,
        liters_delivered: liters,
        cost_usd: cost,
        paid_amount_usd: paymentStatus === 'pagado' ? cost : 0,
        status: paymentStatus,
        tank_id: targetTankId,
      });

      setIsCisternModalOpen(false);
      alert(`¡Cisterna de ${liters.toLocaleString()} Litros registrada e ingresada al tanque!`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span>Monitoreo de Tanques & Cisternas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Control de volumen de agua en tiempo real y recepción de camiones cisterna
          </p>
        </div>

        <button
          onClick={() => setIsCisternModalOpen(true)}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 text-xs flex items-center space-x-2 active:scale-95 transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>+ Registrar Cisterna</span>
        </button>
      </div>

      {/* Tarjetas Visuales de Tanques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {tanks.map(tank => {
          const isOptimal = tank.percentage > 50;
          const isMedium = tank.percentage <= 50 && tank.percentage > 25;

          return (
            <div
              key={tank.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              {/* Badge de Estado */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{tank.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    Capacidad Máxima: {tank.capacity_liters.toLocaleString()} L
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                    isOptimal
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isMedium
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOptimal ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                  <span>{tank.status}</span>
                </span>
              </div>

              {/* Medidor Gráfico de Agua */}
              <div className="my-3">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-3xl font-black text-slate-900">
                    {tank.current_liters.toLocaleString()}{' '}
                    <span className="text-sm text-slate-500 font-bold">L</span>
                  </span>
                  <span className="text-2xl font-black text-sky-600">{tank.percentage}%</span>
                </div>

                {/* Barra Líquida con Gradiente */}
                <div className="w-full bg-slate-100 h-6 rounded-2xl overflow-hidden p-1 border border-slate-200 relative">
                  <div
                    className={`h-full rounded-xl transition-all duration-700 ${
                      isOptimal
                        ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400'
                        : isMedium
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${tank.percentage}%` }}
                  />
                </div>
              </div>

              {/* Botones de Ajuste Manual Rápido */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[10px] font-semibold">Ajuste manual:</span>
                <div className="flex space-x-1">
                  {[-100, -500, +500, +1000].map(delta => (
                    <button
                      key={delta}
                      onClick={() => updateTankLevel(tank.id, tank.current_liters + delta)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                    >
                      {delta > 0 ? `+${delta}L` : `${delta}L`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerta de Pedido de Cisterna */}
      {tanks.some(t => t.percentage <= 35) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Alerta de Suministro de Agua</p>
              <p className="text-[11px] text-amber-700">
                El nivel de uno o más tanques está por debajo del 35%. Se recomienda coordinar un camión cisterna.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCisternModalOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0"
          >
            Pedir Cisterna
          </button>
        </div>
      )}

      {/* Modal de Registro de Cisterna */}
      {isCisternModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-black text-lg text-slate-900 mb-1 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <span>Registrar Descarga de Cisterna</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa los litros comprados para sumar al tanque y registrar el gasto
            </p>

            <form onSubmit={handleSaveCistern} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Proveedor de Agua / Camión:
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  placeholder="Ej. Cisterna Los Andes"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Litros Descargados:</label>
                  <input
                    type="number"
                    step="100"
                    value={litersDelivered}
                    onChange={e => setLitersDelivered(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Costo ($ USD):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={costUsd}
                    onChange={e => setCostUsd(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanque de Destino:</label>
                <select
                  value={targetTankId}
                  onChange={e => setTargetTankId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Capacidad: {t.capacity_liters.toLocaleString()} L)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estado del Pago:</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('pagado')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                      paymentStatus === 'pagado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Pagado de Inmediato
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('pendiente')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                      paymentStatus === 'pendiente'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Pendiente (Deuda Proveedor)
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCisternModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-md"
                >
                  Guardar Descarga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
