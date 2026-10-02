'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Package,
  Users,
  Camera,
  Lock,
  Database,
  BarChart3,
  MoreHorizontal,
  Settings,
  MessageSquare,
  Smartphone,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useH2OStore } from '@/lib/store';

const WhatsAppHubModal = dynamic(
  () => import('@/components/whatsapp/WhatsAppHubModal').then((m) => m.WhatsAppHubModal),
  { ssr: false }
);

const ConnectMobileModal = dynamic(
  () => import('@/components/common/ConnectMobileModal').then((m) => m.ConnectMobileModal),
  { ssr: false }
);

export type ActiveTab =
  | 'pos'
  | 'products'
  | 'clients'
  | 'camera'
  | 'closure'
  | 'tanks'
  | 'finance'
  | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCart?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onOpenCart }: BottomNavProps) {
  const { cart, exchangeRate } = useH2OStore();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);

  const totalCartItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const totalCartUsd = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal_usd, 0), [cart]);
  const totalCartBs = useMemo(() => (totalCartUsd * exchangeRate.rate).toFixed(2), [totalCartUsd, exchangeRate.rate]);

  // 5 Pestañas Principales en Mobile (Elimina el desbordamiento y saltos de fila)
  const mainNavItems = [
    {
      id: 'pos' as ActiveTab,
      label: 'Ventas',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: totalCartItems > 0 ? totalCartItems : null,
    },
    {
      id: 'products' as ActiveTab,
      label: 'Catálogo',
      icon: <Package className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'clients' as ActiveTab,
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'tanks' as ActiveTab,
      label: 'Tanques',
      icon: <Database className="w-5 h-5" />,
      badge: null,
    },
  ];

  const isMoreTabActive = ['camera', 'closure', 'finance', 'settings'].includes(activeTab);

  return (
    <>
      {/* Botón Flotante del Carrito para vista móvil (Apple-tier Spring Pill) */}
      {totalCartItems > 0 && activeTab === 'pos' && onOpenCart && (
        <div className="fixed bottom-20 left-2.5 right-2.5 sm:left-4 sm:right-4 z-40 lg:hidden animate-in slide-in-from-bottom-5 duration-200">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 text-white font-black py-3 px-4 rounded-2xl shadow-xl shadow-sky-600/35 border border-white/20 flex items-center justify-between pressable active:scale-[0.98] transition-all cursor-pointer min-h-[50px]"
          >
            <div className="flex items-center space-x-2.5">
              <span className="bg-white/25 px-2.5 py-1 rounded-xl text-xs font-black tracking-tight shadow-inner">
                {totalCartItems} {totalCartItems === 1 ? 'ítem' : 'ítems'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                Ver Carrito
              </span>
            </div>
            <div className="flex items-center space-x-2 text-right">
              <div>
                <span className="text-sm sm:text-base font-black">${totalCartUsd.toFixed(2)}</span>
                <span className="text-[10px] text-sky-100 ml-1 font-bold">(Bs. {totalCartBs})</span>
              </div>
              <span className="bg-white text-sky-700 px-3 py-1 rounded-xl text-xs font-black shadow-xs">
                Cobrar →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet con Más Opciones */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-sky-100 relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <span>⚡ Módulos & Herramientas</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Cámara IA</span>
                <span className="text-[10px] text-slate-500">Escaneo de tanques</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('closure');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'closure'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Cierre de Caja</span>
                <span className="text-[10px] text-slate-500">Arqueo del turno</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('finance');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Finanzas</span>
                <span className="text-[10px] text-slate-500">Balance y métricas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-2">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Ajustes</span>
                <span className="text-[10px] text-slate-500">Configurar sistema</span>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsWhatsAppOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Hub & Catálogo al Día</span>
                </span>
                <span className="text-[10px] font-black uppercase bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded">
                  Gratis
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileConnectOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>Conectar Móvil (Wi-Fi & QR)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-600">
                  192.168.31.101
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegación Inferior Mobile-First con 5 Columnas Exactas */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-sky-100/70 shadow-[0_-8px_30px_-5px_rgba(2,132,199,0.08)] pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
          {mainNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'pos' && activeTab === 'pos' && totalCartItems > 0 && onOpenCart) {
                    onOpenCart();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 pressable cursor-pointer min-h-[48px] relative ${
                  isActive
                    ? 'text-sky-600 font-extrabold'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-tr from-sky-100/80 to-cyan-100/50 text-sky-600 shadow-2xs border border-sky-200/80'
                      : ''
                  }`}
                >
                  {item.icon}
                  {item.badge !== null && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] bg-emerald-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse shadow-xs px-0.5">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5ta Pestaña: MÁS */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 pressable cursor-pointer min-h-[48px] ${
              isMoreTabActive
                ? 'text-sky-600 font-extrabold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isMoreTabActive
                  ? 'bg-gradient-to-tr from-sky-100/80 to-cyan-100/50 text-sky-600 shadow-2xs border border-sky-200/80'
                  : ''
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate leading-none">
              Más
            </span>
          </button>
        </div>
      </nav>

      {/* Modales Compartidos */}
      {isWhatsAppOpen && (
        <WhatsAppHubModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}

      {isMobileConnectOpen && (
        <ConnectMobileModal
          isOpen={isMobileConnectOpen}
          onClose={() => setIsMobileConnectOpen(false)}
        />
      )}
    </>
  );
}
