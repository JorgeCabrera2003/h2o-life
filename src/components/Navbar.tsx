'use client';

import React, { useState } from 'react';
import { useH2OStore, INITIAL_USERS } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import { ActiveTab } from '@/components/BottomNav';
import dynamic from 'next/dynamic';
import { Droplet, Edit3, Check, Settings, ChevronDown, Package, Smartphone } from 'lucide-react';

const ConnectMobileModal = dynamic(
  () => import('@/components/common/ConnectMobileModal').then((m) => m.ConnectMobileModal),
  { ssr: false }
);
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';



interface NavbarProps {
  onNavigate?: (tab: ActiveTab) => void;
  activeTab?: ActiveTab;
}

export function Navbar({ onNavigate, activeTab }: NavbarProps) {
  const { currentUser, setCurrentUser, logout, exchangeRate, setExchangeRateValue } = useH2OStore();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [customRate, setCustomRate] = useState(exchangeRate.rate.toString());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [showMobileConnect, setShowMobileConnect] = useState(false);

  if (!currentUser) return null;

  const handleSaveRate = () => {
    const parsed = parseFloat(customRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRateValue(parsed, true);
    }
    setIsEditingRate(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-sky-100/70 dark:border-slate-800/70 shadow-[0_2px_15px_-3px_rgba(2,132,199,0.06)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Marca (Apple-tier squircle with radiant aura) */}
        <div
          onClick={() => onNavigate && onNavigate('pos')}
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0 pressable"
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all">
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-transparent group-hover:scale-110 transition-transform" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-300 rounded-full border-2 border-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
                H<span className="text-sky-600">2</span>O
              </span>
              <span className="font-light text-base sm:text-lg tracking-tight text-cyan-600">LIFE</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/80">
                POS
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Agua Purificada & Punto de Venta • Calle 28 c/ 25
            </p>
          </div>
        </div>

        {/* Tasa BCV, Ajustes & Selector de Roles */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Tasa Dólar BCV (Badge Interactivo de Alta Gama) */}
          <button
            type="button"
            onClick={() => {
              if (!hasPermission(currentUser, 'admin')) return;
              setCustomRate(exchangeRate.rate.toString());
              setIsEditingRate(true);
            }}
            disabled={!hasPermission(currentUser, 'admin')}
            className={`group bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/50 border border-sky-200/80 dark:border-slate-700 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center space-x-2 text-left shadow-2xs shrink-0 ${
              hasPermission(currentUser, 'admin') ? 'hover:bg-sky-100/70 dark:hover:bg-slate-700/70 hover:border-sky-300 dark:hover:border-slate-600 pressable cursor-pointer' : 'opacity-90 cursor-default'
            }`}
            title={hasPermission(currentUser, 'admin') ? "Tasa oficial BCV Venezuela. Toca para actualizar" : "Tasa oficial BCV Venezuela"}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-tight leading-none">
                {exchangeRate.source}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight tabular-nums">
                Bs. {exchangeRate.rate.toFixed(2)}
              </span>
            </div>
            {hasPermission(currentUser, 'admin') && (
              <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0 ml-0.5" />
            )}
          </button>

          {/* Modal Centrado para Editar Tasa */}
          <SwipeableBottomSheet
            isOpen={isEditingRate}
            onClose={() => setIsEditingRate(false)}
            title="Actualizar Tasa BCV"
            maxWidth="sm"
          >
            <div className="px-1 pb-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Ingresa el valor del dólar en Bolívares (VES) para calcular conversiones automáticas al instante:
              </p>
              <div className="relative mb-4">
                <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-400">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  value={customRate}
                  onChange={e => setCustomRate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-2">
                <button
                  onClick={() => setIsEditingRate(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl pressable cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRate}
                  className="flex-1 py-2.5 text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-700 dark:to-cyan-600 hover:from-sky-700 dark:hover:from-sky-600 text-white rounded-xl shadow-md shadow-sky-500/25 dark:shadow-sky-900/40 pressable cursor-pointer"
                >
                  Guardar Tasa
                </button>
              </div>
            </div>
          </SwipeableBottomSheet>

          {/* Botón de Catálogo de Productos & Precios de Recarga (Desktop/Tablet) */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('products')}
              className={`hidden sm:inline-flex p-2 sm:p-2.5 rounded-2xl border transition-all shrink-0 pressable cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-2xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-sky-200 dark:hover:border-slate-600'
              }`}
              title="Catálogo de Productos & Precios de Recarga"
            >
              <Package className="w-4 h-4" />
            </button>
          )}

          {/* Botón de Configuración del Sistema (Desktop/Tablet) */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('settings')}
              className={`hidden sm:inline-flex p-2 sm:p-2.5 rounded-2xl border transition-all shrink-0 pressable cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-2xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-sky-200 dark:hover:border-slate-600'
              }`}
              title="Configuración del Sistema"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Botón de Conectar Teléfono Móvil (Wi-Fi Local & QR - Desktop) */}
          {hasPermission(currentUser, 'dev') && (
            <button
              type="button"
              onClick={() => setShowMobileConnect(true)}
              className="hidden md:inline-flex p-2 sm:p-2.5 rounded-2xl border transition-all shrink-0 pressable cursor-pointer bg-white/80 dark:bg-slate-800/80 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-sky-50 dark:hover:bg-slate-800 hover:border-sky-200 dark:hover:border-slate-600"
              title="Conectar Teléfono Móvil (Wi-Fi Local & Código QR)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}


          {/* Selector de Rol / Operador Activo (Karla, Freyeliz, Jorge) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 rounded-2xl px-2.5 py-1.5 transition-all shadow-2xs pressable cursor-pointer"
            >
              <span className="text-base leading-none">{currentUser.avatar || '👤'}</span>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-bold capitalize leading-none">
                  {currentUser.role === 'worker' ? 'Cajera / Operador' : currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-sky-950/10 dark:shadow-black/40 border border-sky-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {currentUser.role === 'superadmin' ? (
                  <>
                    <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Cambiar Operador de Turno
                      </p>
                    </div>
                    {INITIAL_USERS.map(user => {
                      const isSelected = currentUser.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCurrentUser(user);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-sky-50/80 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                            isSelected ? 'bg-sky-50 dark:bg-sky-900/50 font-bold text-sky-950 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg leading-none">{user.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                                {user.role === 'worker' ? 'Operador de Turno' : user.role === 'admin' ? 'Administradora' : 'Superadmin'}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </>
                ) : null}

                {/* Botón de cerrar sesión para todos (o al menos no-superadmins) */}
                <div className={`${currentUser.role === 'superadmin' ? 'border-t border-slate-100 dark:border-slate-700 mt-1 pt-1' : ''}`}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    Cerrar Turno (Salir)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Conexión Móvil */}
      {showMobileConnect && (
        <ConnectMobileModal
          isOpen={showMobileConnect}
          onClose={() => setShowMobileConnect(false)}
        />
      )}


    </header>
  );
}
