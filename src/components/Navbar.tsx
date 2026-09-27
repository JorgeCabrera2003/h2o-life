'use client';

import React, { useState } from 'react';
import { useH2OStore, INITIAL_USERS } from '@/lib/store';
import { ActiveTab } from '@/components/BottomNav';
import { Droplet, Edit3, Check, Settings } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (tab: ActiveTab) => void;
  activeTab?: ActiveTab;
}

export function Navbar({ onNavigate, activeTab }: NavbarProps) {
  const { currentUser, setCurrentUser, exchangeRate, setExchangeRateValue } = useH2OStore();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [customRate, setCustomRate] = useState(exchangeRate.rate.toString());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSaveRate = () => {
    const parsed = parseFloat(customRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRateValue(parsed, true);
    }
    setIsEditingRate(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Marca (Responsive) */}
        <div
          onClick={() => onNavigate && onNavigate('pos')}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Droplet className="w-4 h-4 sm:w-6 sm:h-6 fill-white text-transparent" />
          </div>
          <div>
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900">
                H<span className="text-sky-600">2</span>O
              </span>
              <span className="font-light text-base sm:text-xl tracking-tight text-cyan-600">LIFE</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 sm:py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                POS
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">Agua Purificada & Punto de Venta</p>
          </div>
        </div>

        {/* Tasa BCV, Ajustes & Selector de Roles */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Tasa Dólar BCV (Badge Responsivo y Táctil) */}
          <button
            type="button"
            onClick={() => {
              setCustomRate(exchangeRate.rate.toString());
              setIsEditingRate(true);
            }}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-200/90 hover:border-sky-300 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 flex items-center space-x-1.5 sm:space-x-2 active:scale-95 transition-all text-left shadow-2xs shrink-0 cursor-pointer"
            title="Tasa oficial BCV. Toca para editar"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-800 uppercase tracking-tight leading-none">
                {exchangeRate.source}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Bs. {exchangeRate.rate.toFixed(2)}
              </span>
            </div>
            <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 opacity-70 shrink-0 ml-0.5" />
          </button>

          {/* Modal Centrado para Editar Tasa (Garantiza 100% Responsividad en Móvil) */}
          {isEditingRate && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                    <span>💵 Ajustar Tasa BCV</span>
                  </h4>
                  <button
                    onClick={() => setIsEditingRate(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm px-1.5 py-0.5 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Ingresa la tasa oficial del día en Bolívares por Dólar (USD):
                </p>
                <div className="relative mb-3">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customRate}
                    onChange={e => setCustomRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingRate(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveRate}
                    className="flex-1 py-2 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-md active:scale-95"
                  >
                    Guardar Tasa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Configuración del Sistema (Ajustes) */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('settings')}
              className={`p-2 rounded-xl border transition-colors shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
              title="Configuración del Sistema"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Selector de Rol / Usuario Activo */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <span className="text-base">{currentUser.avatar || '👤'}</span>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cambiar Operador / Rol
                  </p>
                </div>
                {INITIAL_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-sky-50 transition-colors ${
                      currentUser.id === user.id ? 'bg-sky-50/80 font-bold text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{user.avatar}</span>
                      <div>
                        <p className="text-xs font-medium">{user.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    {currentUser.id === user.id && (
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
