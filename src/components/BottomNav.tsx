'use client';

import React from 'react';
import { ShoppingCart, Users, Camera, Lock, Database, BarChart3 } from 'lucide-react';
import { useH2OStore } from '@/lib/store';

export type ActiveTab = 'pos' | 'clients' | 'camera' | 'closure' | 'tanks' | 'finance' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCart?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onOpenCart }: BottomNavProps) {
  const { cart, exchangeRate } = useH2OStore();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartUsd = cart.reduce((acc, item) => acc + item.subtotal_usd, 0);
  const totalCartBs = (totalCartUsd * exchangeRate.rate).toFixed(2);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'pos',
      label: 'Ventas',
      icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: 'camera',
      label: 'Cámara IA',
      icon: <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: 'closure',
      label: 'Cierre',
      icon: <Lock className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: 'tanks',
      label: 'Tanques',
      icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    {
      id: 'finance',
      label: 'Finanzas',
      icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
  ];

  return (
    <>
      {/* Botón Flotante del Carrito para vista móvil (Apple-tier Spring Pill) */}
      {totalCartItems > 0 && activeTab === 'pos' && onOpenCart && (
        <div className="fixed bottom-22 left-3 right-3 sm:left-4 sm:right-4 z-30 lg:hidden animate-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={onOpenCart}
            className="w-full bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-black py-3.5 px-5 rounded-2xl shadow-xl shadow-sky-500/35 border border-white/20 flex items-center justify-between pressable active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="bg-white/25 px-2.5 py-1 rounded-xl text-xs font-black tracking-tight shadow-inner">
                {totalCartItems} {totalCartItems === 1 ? 'ítem' : 'ítems'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                Ver Orden en Carrito
              </span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black">${totalCartUsd.toFixed(2)}</span>
              <span className="text-xs text-sky-100 ml-1.5 font-bold">(Bs. {totalCartBs})</span>
            </div>
          </button>
        </div>
      )}

      {/* Barra de Navegación Inferior Mobile-First con Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-sky-100/70 shadow-[0_-8px_30px_-5px_rgba(2,132,199,0.08)] pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-6 h-16 items-center px-1.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-150 pressable cursor-pointer ${
                  isActive
                    ? 'text-sky-600 font-extrabold scale-105'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-sky-100/80 to-cyan-100/50 text-sky-600 shadow-2xs border border-sky-200/80'
                      : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
