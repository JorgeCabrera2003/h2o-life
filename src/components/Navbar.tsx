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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Marca */}
        <div
          onClick={() => onNavigate && onNavigate('pos')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Droplet className="w-6 h-6 fill-white text-transparent" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                H<span className="text-sky-600">2</span>O
              </span>
              <span className="font-light text-xl tracking-tight text-cyan-600">LIFE</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Agua Purificada & Punto de Venta</p>
          </div>
        </div>

        {/* Tasa BCV, Ajustes & Selector de Roles */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Tasa Dólar BCV */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-lg px-2.5 py-1 flex items-center space-x-2">
            <div className="text-left">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-semibold text-sky-700 uppercase">
                  {exchangeRate.source}
                </span>
                {exchangeRate.is_manual_override && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Tasa Manual" />
                )}
              </div>
              {isEditingRate ? (
                <div className="flex items-center space-x-1 mt-0.5">
                  <input
                    type="number"
                    step="0.01"
                    value={customRate}
                    onChange={e => setCustomRate(e.target.value)}
                    className="w-16 px-1 py-0.5 text-xs font-bold text-slate-900 bg-white border border-sky-300 rounded focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRate}
                    className="p-1 rounded bg-sky-600 text-white hover:bg-sky-700"
                    title="Guardar Tasa"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingRate(true)}
                  className="cursor-pointer group flex items-center space-x-1"
                  title="Clic para editar tasa manualmente"
                >
                  <span className="text-xs font-bold text-slate-900">
                    Bs. {exchangeRate.rate.toFixed(2)}
                  </span>
                  <Edit3 className="w-2.5 h-2.5 text-sky-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </div>

          {/* Botón de Configuración del Sistema (Ajustes) */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('settings')}
              className={`p-2 rounded-xl border transition-colors ${
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
