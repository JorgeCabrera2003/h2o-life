'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Smartphone,
  Shield,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';


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
  | 'settings'
  | 'audit';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCart?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onOpenCart }: BottomNavProps) {
  const { cart, exchangeRate, currentUser } = useH2OStore();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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

  const isMoreTabActive = ['camera', 'closure', 'finance', 'settings', 'audit'].includes(activeTab);

  return (
    <>
      {/* Botón Flotante del Carrito para vista móvil (Apple-tier Spring Pill) */}
      {totalCartItems > 0 && activeTab === 'pos' && onOpenCart && (
        <div className="fixed bottom-20 left-4 right-4 z-35 lg:hidden animate-in slide-in-from-bottom-5 duration-200 flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={onOpenCart}
            className="pointer-events-auto w-full max-w-sm bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 dark:border-slate-600/50 hover:bg-slate-900 dark:hover:bg-slate-800 text-white py-2.5 px-3 rounded-full shadow-2xl shadow-sky-900/20 dark:shadow-black/50 flex items-center justify-between pressable active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-sky-500 text-white w-9 h-9 flex items-center justify-center rounded-full text-sm font-black shadow-inner shrink-0">
                {totalCartItems}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">
                  Ver Carrito
                </span>
                <span className="text-sm font-black text-white leading-tight">
                  ${totalCartUsd.toFixed(2)} <span className="text-[10px] text-slate-500 font-medium">(Bs. {totalCartBs})</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-full text-xs font-black transition-colors shadow-md shrink-0 ml-2">
              Cobrar
            </div>
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet con Más Opciones */}
      <AnimatePresence>
      {isMoreMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setIsMoreMenuOpen(false);
              }
            }}
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-sky-100 dark:border-slate-800 relative z-10 gpu-accelerated touch-pan-y"
          >
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden cursor-grab active:cursor-grabbing" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>⚡ Módulos & Herramientas</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
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
                    ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Cámara IA</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Escaneo de tanques</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('closure');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'closure'
                    ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Cierre de Caja</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Arqueo del turno</span>
              </button>

              {hasPermission(currentUser, 'admin') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('finance');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Finanzas</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Balance y métricas</span>
              </button>
              )}

              {hasPermission(currentUser, 'admin') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Ajustes</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Configurar sistema</span>
              </button>
              )}

              {hasPermission(currentUser, 'audit') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('audit');
                  setIsMoreMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">Auditoría</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Bitácora de seguridad</span>
              </button>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileConnectOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/50 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Conectar Móvil (Wi-Fi & QR)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                  192.168.31.101
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Barra de Navegación Inferior Mobile-First con 5 Columnas Exactas */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-sky-100/70 dark:border-slate-800/70 shadow-[0_-8px_30px_-5px_rgba(2,132,199,0.08)] pb-safe">
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
                      ? 'text-sky-600'
                      : ''
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 bg-gradient-to-tr from-sky-100/80 to-cyan-100/50 shadow-2xs border border-sky-200/80 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <div className="relative z-10">{item.icon}</div>
                  {item.badge !== null && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] bg-emerald-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse shadow-xs px-0.5 z-20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate leading-none relative z-10">
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
      {isMobileConnectOpen && (
        <ConnectMobileModal
          isOpen={isMobileConnectOpen}
          onClose={() => setIsMobileConnectOpen(false)}
        />
      )}
    </>
  );
}
