'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import { Product, ProductCategory } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AnimatedCheck } from '@/components/ui/AnimatedIcons';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Droplet,
  Sparkles,
  Search,
  Tag,
  DollarSign,
  TrendingUp,
  Boxes,
  Wrench,
  Check,
  AlertCircle,
  RotateCcw,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';

const CATEGORY_LABELS: Record<ProductCategory, { label: string; icon: string; badgeColor: string }> = {
  agua: { label: 'Agua & Recargas', icon: '💧', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
  botellon: { label: 'Botellones & Envases', icon: '🧴', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  servicio: { label: 'Servicios & Mantenimiento', icon: '⚡', badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  helado: { label: 'Helados', icon: '🍦', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
  snack: { label: 'Snacks & Víveres', icon: '🍿', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  insumo: { label: 'Insumos & Tapas', icon: '🔘', badgeColor: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const ICON_PRESETS = ['💧', '🧴', '🫙', '🚰', '✨', '🛵', '🔧', '🧊', '🍦', '🍧', '🥔', '🥟', '🔘', '📦'];

export function ProductsServicesPanel() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateRefillPrice,
    exchangeRate,
    isDemoModeActive,
    loadDemoData,
    clearDemoData,
    currentUser,
  } = useH2OStore();

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'services'>('all');

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Campos del Formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('agua');
  const [priceUsd, setPriceUsd] = useState('0.70');
  const [costUsd, setCostUsd] = useState('0.10');
  const [stock, setStock] = useState('9999');
  const [unit, setUnit] = useState('recarga');
  const [icon, setIcon] = useState('💧');
  const [quickSelect, setQuickSelect] = useState(true);
  const [isService, setIsService] = useState(false);
  const [description, setDescription] = useState('');

  // Controlador Rápido de Precio de Recargas
  const refillProduct = products.find(p => p.id === 'prod-recarga-20' || (p.category === 'agua' && p.quick_select)) || products[0];
  const [refillPriceInput, setRefillPriceInput] = useState<string>(
    refillProduct ? refillProduct.price_usd.toString() : '0.70'
  );
  const [refillSavedToast, setRefillSavedToast] = useState(false);

  // Filtrado de Productos
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
      return false;
    }

    if (filterType === 'products' && p.is_service) return false;
    if (filterType === 'services' && !p.is_service) return false;

    return true;
  });

  // Guardar cambio rápido de precio de recarga
  const handleApplyRefillPrice = (newPrice: number) => {
    if (newPrice > 0) {
      updateRefillPrice(newPrice);
      setRefillPriceInput(newPrice.toString());
      setRefillSavedToast(true);
      setTimeout(() => setRefillSavedToast(false), 2500);
    }
  };

  // Abrir Modal de Creación
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('agua');
    setPriceUsd('1.00');
    setCostUsd('0.50');
    setStock('50');
    setUnit('unidad');
    setIcon('💧');
    setQuickSelect(true);
    setIsService(false);
    setDescription('');
    setIsModalOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPriceUsd(p.price_usd.toString());
    setCostUsd(p.cost_usd !== undefined ? p.cost_usd.toString() : '0.00');
    setStock(p.stock !== undefined ? p.stock.toString() : '9999');
    setUnit(p.unit);
    setIcon(p.icon || '💧');
    setQuickSelect(!!p.quick_select);
    setIsService(!!p.is_service);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  // Guardar Formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(priceUsd);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Ingresa un precio válido en dólares.');
      return;
    }

    const costNum = parseFloat(costUsd) || 0;
    const stockNum = isService ? 9999 : parseInt(stock, 10) || 0;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        category,
        price_usd: Number(priceNum.toFixed(2)),
        cost_usd: Number(costNum.toFixed(2)),
        stock: stockNum,
        unit: unit.trim() || 'unidad',
        icon,
        quick_select: quickSelect,
        is_service: isService,
        description: description.trim(),
      });
      toast.success('Producto actualizado exitosamente');
    } else {
      addProduct({
        name: name.trim(),
        category,
        price_usd: Number(priceNum.toFixed(2)),
        cost_usd: Number(costNum.toFixed(2)),
        stock: stockNum,
        unit: unit.trim() || 'unidad',
        icon,
        quick_select: quickSelect,
        is_service: isService,
        active: true,
        description: description.trim(),
      });
      toast.success('Producto creado exitosamente');
    }

    setIsModalOpen(false);
  };

  const currentRefillPrice = parseFloat(refillPriceInput) || (refillProduct ? refillProduct.price_usd : 0.70);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-40 md:pb-36 animate-in fade-in duration-200">
      {/* 1. HEADER DEL MÓDULO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold border border-sky-200/80 dark:border-sky-800/50 mb-1.5 shadow-2xs">
            <Package className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Gestor de Inventario & Tarifas H2O Life</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Catálogo de Productos & Servicios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configura el precio de cada recarga de agua, registra botellones y añade nuevos servicios
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {hasPermission(currentUser, 'admin') && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 dark:from-sky-700 dark:via-sky-600 dark:to-cyan-600 hover:from-sky-700 dark:hover:to-cyan-600 text-white font-black px-4 py-2.5 rounded-2xl shadow-md shadow-sky-500/20 dark:shadow-sky-900/40 text-xs flex items-center justify-center space-x-2 pressable cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Ítem</span>
          </button>
          )}
        </div>
      </div>

      {/* 2. CONTROLADOR DESTACADO: AJUSTE RÁPIDO DE PRECIO DE RECARGA DE AGUA */}
      {hasPermission(currentUser, 'admin') && (
      <div className="double-bezel mb-6">
        <div className="double-bezel-inner p-4 sm:p-5 bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/50">
          <div className="flex flex-col gap-4">
            
            {/* Header y Descripción */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl sm:text-2xl">💧</span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Precio de Recargas de Agua (20L / 18L)
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-snug">
                El precio fijado aquí actualiza automáticamente los atajos rápidos del POS, la cámara IA y las fórmulas de cobro.
              </p>
            </div>

            {/* Tarjeta Combinada: Precio Actual y Control Manual */}
            <div className="flex items-center justify-between bg-white/60 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-sky-100 dark:border-slate-700/50 shadow-xs backdrop-blur-xs w-full">
              <div className="text-left">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                  Precio Unitario
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none block mb-1">
                  ${currentRefillPrice.toFixed(2)}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-md inline-block">
                  Bs. {(currentRefillPrice * exchangeRate.rate).toFixed(2)}
                </span>
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tarifa Manual
                </span>
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs shrink-0">
                  <span className="text-xs font-bold text-slate-400 pl-1.5">$</span>
                  <input
                    type="number" inputMode="decimal" step="0.05" min="0.10" max="5.00"
                    value={refillPriceInput}
                    onChange={e => setRefillPriceInput(e.target.value)}
                    className="w-12 sm:w-14 text-xs font-black text-slate-900 dark:text-white bg-transparent focus:outline-hidden text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyRefillPrice(parseFloat(refillPriceInput))}
                    className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg pressable cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de Presets de Precios */}
            <div className="flex flex-wrap items-center gap-1.5 w-full">
              {[0.50, 0.60, 0.70, 0.75, 1.00].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleApplyRefillPrice(val)}
                  className={`flex-1 min-w-[50px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all pressable cursor-pointer text-center ${
                    Math.abs(currentRefillPrice - val) < 0.001
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25 scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ${val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de Conversión Rápida en Tiempo Real */}
          <div className="mt-4 pt-3 border-t border-sky-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {[1, 2, 3, 4, 5].map(qty => (
                <div key={qty} className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-xl shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5">{qty} Bot.</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                    ${(currentRefillPrice * qty).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                    Bs. {((currentRefillPrice * qty) * exchangeRate.rate).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {refillSavedToast && (
            <div className="mt-3 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-2 border border-emerald-200 animate-in fade-in">
              <AnimatedCheck className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={3} />
              <span>¡Tarifa de recarga actualizada a ${currentRefillPrice.toFixed(2)} (Bs. {(currentRefillPrice * exchangeRate.rate).toFixed(2)}) en todo el POS!</span>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 3. CONTROL DE DATOS DE PRUEBA VS SEMILLA REAL */}
      {hasPermission(currentUser, 'dev') && (
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white ${
            isDemoModeActive ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
          } shadow-md`}>
            {isDemoModeActive ? <FlaskConical className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {isDemoModeActive ? 'Modo Demostración / Pruebas Activo' : 'Base de Datos de Producción (Semilla Limpia)'}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDemoModeActive ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400'
              }`}>
                {isDemoModeActive ? 'Demo' : 'Producción'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDemoModeActive
                ? 'Se están visualizando clientes y ventas simuladas para pruebas.'
                : 'Solo los datos reales y registros oficiales de la tienda están cargados.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isDemoModeActive ? (
            <button
              type="button"
              onClick={clearDemoData}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 pressable cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar y Volver a Producción</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoData}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold flex items-center space-x-1.5 pressable cursor-pointer border border-amber-200 dark:border-amber-800/50"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              <span>Cargar Datos de Prueba</span>
            </button>
          )}
        </div>
      </div>
      )}

      {/* 4. BUSCADOR Y FILTROS DEL CATÁLOGO */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs mb-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre de producto, servicio, helado, snack..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
            />
          </div>

          <div className="flex space-x-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all pressable cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('products')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all pressable cursor-pointer ${
                filterType === 'products'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📦 Físicos
            </button>
            <button
              type="button"
              onClick={() => setFilterType('services')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all pressable cursor-pointer ${
                filterType === 'services'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ⚡ Servicios
            </button>
          </div>
        </div>

        {/* Chips de Categorías */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all pressable cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas las Categorías
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all pressable cursor-pointer flex items-center space-x-1 ${
                selectedCategory === catKey
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{catVal.icon}</span>
              <span>{catVal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. GRID DE TARJETAS DE PRODUCTOS Y SERVICIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => {
          const catInfo = CATEGORY_LABELS[p.category] || { label: p.category, icon: '📦', badgeColor: 'bg-slate-100 dark:bg-slate-800' };
          const priceBs = (p.price_usd * exchangeRate.rate).toFixed(2);
          const marginPct = p.cost_usd ? Math.round(((p.price_usd - p.cost_usd) / p.price_usd) * 100) : 0;

          return (
            <div
              key={p.id}
              className="double-bezel hover:border-sky-300 dark:hover:border-sky-500/50 transition-all flex flex-col justify-between"
            >
              <div className="double-bezel-inner p-4 sm:p-5 flex flex-col justify-between h-full">
                <div>
                  {/* Encabezado con Icono y Categoría */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-slate-800 text-xl flex items-center justify-center border border-sky-100 dark:border-slate-700/80 shadow-inner shrink-0">
                        {p.icon || catInfo.icon}
                      </div>
                      <div className="min-w-0 pr-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {p.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border dark:border-slate-700/50 inline-block mt-0.5 ${catInfo.badgeColor}`}>
                          {catInfo.label}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      p.is_service ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {p.is_service ? '⚡ Servicio' : '📦 Físico'}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Precios e Información Financiera */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Precio de Venta
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                        ${p.price_usd.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 block">
                        Bs. {priceBs}
                      </span>
                    </div>

                    <div className="text-right">
                      {p.is_service ? (
                        <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800/50">
                          Disponibilidad Ilimitada
                        </span>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Inventario
                          </span>
                          <span className={`text-xs font-black ${
                            (p.stock || 0) < 10 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {p.stock} {p.unit}s
                          </span>
                          {p.cost_usd !== undefined && p.cost_usd > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                              Margen ~{marginPct}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de Edición */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {hasPermission(currentUser, 'admin') && (
                    <>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors pressable cursor-pointer flex items-center space-x-1 text-xs font-bold"
                      title="Editar ficha del producto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    {p.id !== 'prod-recarga-20' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar ${p.name} del catálogo?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors pressable cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    </>
                    )}
                  </div>

                  {p.quick_select && (
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 px-2 py-1 rounded-lg border border-sky-100 dark:border-sky-800/50">
                      ★ En POS
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. MODAL PARA CREAR / EDITAR PRODUCTO O SERVICIO */}
      <SwipeableBottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto/Servicio' : 'Nuevo Producto/Servicio'}
        maxWidth="lg"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          Configura los detalles comerciales para venta presencial en mostrador o delivery
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-4">
              {/* Selector de Tipo: Producto Físico vs Servicio */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl relative">
                <button
                  type="button"
                  onClick={() => setIsService(false)}
                  className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all pressable cursor-pointer z-10 ${
                    !isService ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {!isService && (
                    <motion.div
                      layoutId="product-type-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">📦 Producto Físico</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsService(true);
                    setCategory('servicio');
                    setUnit('servicio');
                  }}
                  className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-all pressable cursor-pointer z-10 ${
                    isService ? 'text-cyan-800 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {isService && (
                    <motion.div
                      layoutId="product-type-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">⚡ Servicio Intangible</span>
                </button>
              </div>

              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">
                  Nombre del {isService ? 'Servicio' : 'Producto'}:
                </label>
                <input
                  type="text"
                  placeholder={isService ? 'Ej. Lavado Interno con Ozono' : 'Ej. Botellón Nuevo 20L'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                  required
                />
              </div>

              {/* Categoría y Unidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">Categoría:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-sky-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.icon} {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">Unidad de Medida:</label>
                  <input
                    type="text"
                    placeholder="recarga, unidad, bolsa..."
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Precios ($ USD y Costo) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">
                    Precio de Venta ($ USD):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.05"
                      min="0.05"
                      value={priceUsd}
                      onChange={e => setPriceUsd(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 text-xs font-black bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 font-bold mt-1 block">
                    ≈ Bs. {((parseFloat(priceUsd) || 0) * exchangeRate.rate).toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">
                    Costo Estimado ($ USD):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number" inputMode="decimal"
                      step="0.05"
                      min="0"
                      value={costUsd}
                      onChange={e => setCostUsd(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Para cálculo de margen neto</span>
                </div>
              </div>

              {/* Stock (Solo si no es servicio) */}
              {!isService && (
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">
                    Inventario Disponible (Stock):
                  </label>
                  <input
                    type="number" inputMode="decimal"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                    required
                  />
                </div>
              )}

              {/* Selector de Icono / Emoji */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">
                  Icono Representativo:
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {ICON_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all pressable cursor-pointer ${
                        icon === emoji
                          ? 'bg-sky-500 text-white scale-110 shadow-md shadow-sky-500/30'
                          : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300 block mb-1">Descripción u Observaciones:</label>
                <input
                  type="text"
                  placeholder="Detalles sobre el producto o condiciones del servicio"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Toggle de Atajo Rápido en POS */}
              <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickSelect}
                  onChange={e => setQuickSelect(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded accent-sky-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Mostrar como atajo rápido en la pantalla principal del POS
                </span>
              </label>

              {/* Botones de Acción */}
              <div className="flex space-x-2 pt-4 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl pressable cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-700 dark:to-cyan-600 hover:from-sky-700 dark:hover:to-cyan-500 text-white rounded-xl shadow-md shadow-sky-500/25 dark:shadow-sky-900/40 pressable cursor-pointer min-h-[44px]"
                >
                  {editingProduct ? 'Actualizar Ficha' : 'Guardar y Publicar'}
                </button>
              </div>
            </form>
      </SwipeableBottomSheet>


    </div>
  );
}
