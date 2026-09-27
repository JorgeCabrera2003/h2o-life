'use client';

import React from 'react';
import { ShoppingCart, Users, Camera, Lock, Database, BarChart3, Settings } from 'lucide-react';
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
      label: 'Cámara',
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
      {/* Botón Flotante del Carrito para vista móvil */}
      {totalCartItems > 0 && activeTab === 'pos' && onOpenCart && (
        <div className="fixed bottom-20 left-4 right-4 z-30 md:hidden animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={onOpenCart}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <div className="flex items-center space-x-2.5">
              <span className="bg-white/25 px-2 py-0.5 rounded-lg text-xs font-black">
                {totalCartItems}
              </span>
              <span className="text-sm">Ver Carrito</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold">${totalCartUsd.toFixed(2)}</span>
              <span className="text-xs text-sky-100 ml-1.5 font-medium">(Bs. {totalCartBs})</span>
            </div>
          </button>
        </div>
      )}

      {/* Barra de Navegación Inferior Mobile-First */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-lg pb-safe">
        <div className="max-w-lg mx-auto grid grid-cols-6 h-16 items-center px-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-sky-600 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-sky-50 text-sky-600' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
