'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { Product, Client, ProductCategory, PaymentMethod, PaymentLine, Sale } from '@/types';
import {
  Droplet,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  Receipt,
  Share2,
  CheckCircle2,
  Search,
  X,
  MessageCircle,
  ChevronDown,
  Check,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  sanitizeBankReference,
  sanitizeCurrencyInput,
  sanitizeAndCapitalizeName,
  sanitizeVenezuelanPhoneInput,
  sanitizeAddressText,
} from '@/lib/validators';

interface PosModuleProps {
  isCartDrawerOpen?: boolean;
  setIsCartDrawerOpen?: (open: boolean) => void;
  preselectedClient?: Client | null;
}

export function PosModule({
  isCartDrawerOpen = false,
  setIsCartDrawerOpen,
  preselectedClient,
}: PosModuleProps) {
  const {
    products,
    clients,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    exchangeRate,
    createSale,
    addClient,
    systemSettings,
    getWhatsAppSaleUrl,
  } = useH2OStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(() => {
    return preselectedClient || clients.find(c => c.id === 'client-mostrador') || clients[0] || null;
  });

  React.useEffect(() => {
    if (preselectedClient) {
      setSelectedClient(preselectedClient);
    }
  }, [preselectedClient]);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Clientes ordenados por Orden Actual (más recientemente registrados/actualizados primero)
  const sortedClients = React.useMemo(() => {
    return [...clients].sort((a, b) => {
      // Priorizar cliente mostrador como opción fija siempre visible al principio
      if (a.id === 'client-mostrador') return -1;
      if (b.id === 'client-mostrador') return 1;
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [clients]);

  // Filtrado para el buscador en tiempo real del select
  const filteredClientsForSelect = React.useMemo(() => {
    if (!clientSearchQuery.trim()) return sortedClients;
    const q = clientSearchQuery.toLowerCase().trim();
    return sortedClients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.reference_point && c.reference_point.toLowerCase().includes(q))
    );
  }, [sortedClients, clientSearchQuery]);

  // Estados de cobro / Multipago
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>('pago_movil');
  const [payments, setPayments] = useState<PaymentLine[]>([]);
  const [pagoMovilRef, setPagoMovilRef] = useState('');
  const [pagoMovilBank, setPagoMovilBank] = useState('Banesco');
  const [puntoRef, setPuntoRef] = useState('');
  const [cashUsdGiven, setCashUsdGiven] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Venta completada con éxito
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Totales del carrito
  const totalUsd = cart.reduce((acc, item) => acc + item.subtotal_usd, 0);
  const totalBs = Number((totalUsd * exchangeRate.rate).toFixed(2));

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchesCategory =
      selectedCategory === 'todos' ||
      (selectedCategory === 'agua_botellon' && (p.category === 'agua' || p.category === 'botellon')) ||
      p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Botones de acceso rápido para Recargas (Carla notebook workflow)
  const quickRefillProduct = products.find(p => p.id === 'prod-recarga-20');

  const handleQuickRefill = (qty: number) => {
    if (quickRefillProduct) {
      addToCart(quickRefillProduct, qty);
    }
  };

  // Abrir checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPayments([
      {
        method: activePaymentMethod,
        amount_usd: totalUsd,
        amount_bs: totalBs,
        reference: '',
        bank: 'Banesco',
      },
    ]);
    setCashUsdGiven('');
    setSaleNotes('');
    setIsCheckoutOpen(true);
  };

  // Calcular vuelto en USD y Bs
  const cashUsdNum = parseFloat(cashUsdGiven) || 0;
  const changeUsd = cashUsdNum > totalUsd ? Number((cashUsdNum - totalUsd).toFixed(2)) : 0;
  const changeBs = Number((changeUsd * exchangeRate.rate).toFixed(2));

  // Completar Venta
  const handleFinalizeSale = () => {
    const finalPayments: PaymentLine[] = [
      {
        method: activePaymentMethod,
        amount_usd: totalUsd,
        amount_bs: totalBs,
        reference: activePaymentMethod === 'pago_movil' ? pagoMovilRef : puntoRef,
        bank: activePaymentMethod === 'pago_movil' ? pagoMovilBank : undefined,
      },
    ];

    let fullNotes = saleNotes;
    if (changeUsd > 0) {
      const changeNote = `Pagó con $${cashUsdNum}. Vuelto: $${changeUsd} (Bs. ${changeBs})`;
      fullNotes = fullNotes ? `${fullNotes} | ${changeNote}` : changeNote;
    }

    const sale = createSale(selectedClient, finalPayments, fullNotes, changeUsd, changeBs);
    setCompletedSale(sale);
    setIsCheckoutOpen(false);
    if (setIsCartDrawerOpen) setIsCartDrawerOpen(false);
  };

  // Compartir por WhatsApp
  const handleShareWhatsApp = () => {
    if (!completedSale) return;
    const itemsText = completedSale.items
      .map(i => `• ${i.quantity}x ${i.product_name} - $${i.subtotal_usd.toFixed(2)}`)
      .join('%0A');
    const msg = `💧 *H2O LIFE - RECIBO DIGITAL*%0AFolio: ${completedSale.folio}%0ACliente: ${completedSale.client_name}%0AOperador: ${completedSale.worker_name}%0A-----------------------------%0A${itemsText}%0A-----------------------------%0A*Total: $${completedSale.total_usd.toFixed(2)} / Bs. ${completedSale.total_bs.toFixed(2)}*%0AMétodo: ${completedSale.payments.map(p => p.method.toUpperCase()).join(', ')}%0AGracias por su compra en H2O Life. ¡Agua 100% purificada!`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-40 md:pb-36">
      {/* 1. SECCIÓN RÁPIDA: RECARGAS (Atajo instantáneo de libreta) */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 rounded-2xl p-4 text-white shadow-md shadow-sky-500/15 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-white/20">
              <Droplet className="w-5 h-5 fill-white" />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Atajo Rápido de Recargas</h2>
              <p className="text-[11px] text-sky-100">Presiona para sumar garrafones al instante</p>
            </div>
          </div>
          <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded-full">
            $0.50 c/u
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(qty => {
            const costUsd = (qty * 0.5).toFixed(2);
            const costBs = (qty * 0.5 * exchangeRate.rate).toFixed(2);
            return (
              <button
                key={qty}
                onClick={() => handleQuickRefill(qty)}
                className="bg-white/10 hover:bg-white/25 active:scale-95 border border-white/20 rounded-xl py-2.5 px-3 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-extrabold block">
                    {qty} {qty === 1 ? 'Recarga' : 'Recargas'}
                  </span>
                  <span className="text-[11px] text-sky-100 block">Bs. {costBs}</span>
                </div>
                <span className="text-sm font-black bg-white/25 text-white px-2 py-1 rounded-lg">
                  ${costUsd}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELECTOR DE CLIENTE CON BUSCADOR (ORDEN ACTUAL) & BÚSQUEDA DE PRODUCTOS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-5">
        {/* SELECT CON BUSCADOR DE CLIENTES */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Botón Principal del Combobox de Clientes */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => {
                setClientSearchQuery('');
                setIsClientSelectOpen(true);
              }}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 rounded-2xl px-3 py-2 text-left shadow-2xs transition-all flex items-center justify-between gap-2 group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-black text-xs">
                  {selectedClient ? selectedClient.name.slice(0, 1).toUpperCase() : '👤'}
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente:</span>
                    <span className="text-xs font-black text-slate-900 truncate">
                      {selectedClient ? selectedClient.name : 'Seleccionar cliente...'}
                    </span>
                    {selectedClient && selectedClient.balance_usd < 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-md shrink-0">
                        Deuda: ${Math.abs(selectedClient.balance_usd).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedClient?.phone && selectedClient.phone !== 'N/A' ? selectedClient.phone : 'Mostrador'}
                    {selectedClient?.address && selectedClient.address !== 'Venta directa en tienda' ? ` • ${selectedClient.address}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 text-slate-400 group-hover:text-sky-600 transition-colors">
                <span className="text-[10px] font-bold hidden sm:inline">Buscar</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {/* MODAL / DROPDOWN BUSCADOR DE CLIENTES (ORDEN ACTUAL) */}
            {isClientSelectOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                  {/* Encabezado del Buscador */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-sky-600" />
                        <span>Seleccionar Cliente (Orden Actual)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Los clientes más recientes y actualizados aparecen primero
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsClientSelectOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Campo de Búsqueda en Tiempo Real */}
                  <div className="relative my-3">
                    <Search className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, teléfono, calle o referencia..."
                      value={clientSearchQuery}
                      onChange={e => setClientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-inner"
                      autoFocus
                    />
                    {clientSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setClientSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lista de Resultados con Orden Actual */}
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100 -mx-1 px-1">
                    {filteredClientsForSelect.length > 0 ? (
                      filteredClientsForSelect.map(client => {
                        const isSelected = selectedClient?.id === client.id;
                        const hasDebt = client.balance_usd < 0;
                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsClientSelectOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 text-sky-950 border border-sky-200'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {client.name.slice(0, 1).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xs font-black text-slate-900 truncate">
                                    {client.name}
                                  </span>
                                  {client.id === 'client-mostrador' && (
                                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-md">
                                      Mostrador
                                    </span>
                                  )}
                                  {client.total_orders && client.total_orders >= 10 && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                                      ⭐ Habitual
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5 truncate">
                                  {client.phone && client.phone !== 'N/A' && (
                                    <span className="font-semibold text-sky-700">{client.phone}</span>
                                  )}
                                  {client.address && (
                                    <span className="truncate">📍 {client.address}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              {hasDebt ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                  Debe ${Math.abs(client.balance_usd).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline">
                                  Al día
                                </span>
                              )}
                              {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-xs text-slate-500 font-medium mb-3">
                          No se encontraron clientes para &quot;{clientSearchQuery}&quot;
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewClientName(clientSearchQuery);
                            setIsClientSelectOpen(false);
                            setIsClientModalOpen(true);
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs cursor-pointer"
                        >
                          + Registrar a &quot;{clientSearchQuery}&quot; como nuevo cliente
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pie del modal con botón de Nuevo Cliente */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {filteredClientsForSelect.length} cliente(s) registrados
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsClientSelectOpen(false);
                        setIsClientModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:from-sky-700 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Nuevo Cliente</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Atajos Rápidos de Clientes (Mostrador + 2 más recientes) sin desbordamiento */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {sortedClients.slice(0, 3).map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClient(c)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedClient?.id === c.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {c.id === 'client-mostrador' ? '🏪 Mostrador' : c.name.split(' ')[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="p-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
              title="Registrar nuevo cliente"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buscador de productos */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar producto o helado..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 3. FILTROS DE CATEGORÍA */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'agua_botellon', label: '💧 Agua & Botellones' },
          { id: 'helado', label: '🍦 Helados' },
          { id: 'snack', label: '🥔 Snacks' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. GRID DE PRODUCTOS & PANEL LATERAL DE CARRITO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Productos */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map(product => {
            const priceBs = (product.price_usd * exchangeRate.rate).toFixed(2);
            return (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="text-3xl mb-2">{product.icon || '📦'}</div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-sky-600 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 capitalize">{product.category}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">
                      ${product.price_usd.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Bs. {priceBs}</span>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel del Carrito de Ventas (Visible en Desktop y Bottom Sheet en Mobile) */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl p-5 transform transition-transform duration-200 lg:static lg:w-auto lg:h-auto lg:shadow-none lg:border lg:border-slate-200/80 lg:rounded-2xl lg:p-5 flex flex-col justify-between ${
            isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Orden Actual</h3>
                <p className="text-xs text-slate-500">
                  Cliente: <span className="font-bold text-sky-700">{selectedClient?.name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Vaciar Carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {setIsCartDrawerOpen && (
                  <button
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Ítems */}
            <div className="max-h-72 lg:max-h-80 overflow-y-auto space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Droplet className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                  <p className="text-xs font-semibold">El carrito está vacío</p>
                  <p className="text-[11px]">Selecciona recargas o productos</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ${item.unit_price_usd.toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 w-12 text-right">
                        ${item.subtotal_usd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subtotal y Botón de Cobro */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Total en Dólares:</span>
              <span className="text-2xl font-black text-slate-900">${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs text-slate-500 font-medium">Total en Bolívares:</span>
              <span className="text-base font-extrabold text-sky-600">Bs. {totalBs}</span>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Cobrar Orden (${totalUsd.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODAL DE COBRO / MULTIPAGO VENEZOLANO */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Cobro de Venta</h3>
                <p className="text-xs text-slate-500">
                  {selectedClient?.name} • Tasa: Bs. {exchangeRate.rate.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total a Pagar Grande */}
            <div className="bg-sky-50 rounded-2xl p-4 text-center border border-sky-100 mb-4">
              <p className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-0.5">
                Total a Recibir
              </p>
              <p className="text-3xl font-black text-sky-950">${totalUsd.toFixed(2)}</p>
              <p className="text-sm font-extrabold text-sky-700">Bs. {totalBs}</p>
            </div>

            {/* Selector de Método de Pago */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Método de Pago Principal:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pago_movil', label: 'Pago Móvil', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'punto', label: 'Punto Venta', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'efectivo_usd', label: 'Efectivo $', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'efectivo_bs', label: 'Efectivo Bs', icon: <Banknote className="w-4 h-4" /> },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActivePaymentMethod(m.id as PaymentMethod)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition-all ${
                      activePaymentMethod === m.id
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos condicionales según el método */}
            {activePaymentMethod === 'pago_movil' && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Banco:</label>
                    <select
                      value={pagoMovilBank}
                      onChange={e => setPagoMovilBank(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2"
                    >
                      <option value="Banesco">Banesco</option>
                      <option value="Banco de Venezuela">Banco de Venezuela</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="Provincial">Provincial</option>
                      <option value="Bancaribe">Bancaribe</option>
                      <option value="BNC">BNC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                      Referencia (4 dígitos):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 3062"
                      value={pagoMovilRef}
                      onChange={e => setPagoMovilRef(sanitizeBankReference(e.target.value))}
                      maxLength={8}
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {activePaymentMethod === 'punto' && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 mb-4">
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Referencia o Lote de Tarjeta:
                </label>
                <input
                  type="text"
                  placeholder="Ej. 8841"
                  value={puntoRef}
                  onChange={e => setPuntoRef(sanitizeBankReference(e.target.value))}
                  maxLength={8}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-2 font-mono uppercase"
                />
              </div>
            )}

            {activePaymentMethod === 'efectivo_usd' && (
              <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200 space-y-2 mb-4">
                <label className="text-[10px] font-bold text-emerald-800 uppercase">
                  Monto Recibido en Dólares ($):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Mínimo $${totalUsd.toFixed(2)}`}
                    value={cashUsdGiven}
                    onChange={e => setCashUsdGiven(sanitizeCurrencyInput(e.target.value))}
                    maxLength={8}
                    className="flex-1 text-sm font-black bg-white border border-emerald-300 rounded-lg p-2 text-slate-900"
                  />
                  {[1, 5, 10, 20].map(bill => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setCashUsdGiven(bill.toString())}
                      className="px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black hover:bg-emerald-700"
                    >
                      ${bill}
                    </button>
                  ))}
                </div>

                {changeUsd > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-emerald-900">Vuelto a Entregar:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-900">${changeUsd.toFixed(2)}</span>
                      <span className="text-xs text-emerald-700 block">Bs. {changeBs}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas operativas de libreta (ej. "Vuelto de 1$") */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Nota Operativa (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. Vuelto entregado, garrafón prestado..."
                value={saleNotes}
                onChange={e => setSaleNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>

            {/* Botón Finalizar */}
            <button
              onClick={handleFinalizeSale}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Registrar Venta Exitosa</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL DE RECIBO DIGITAL EXITOSO */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900">¡Venta Registrada!</h3>
            <p className="text-xs text-slate-500 mb-4">{completedSale.folio}</p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-800">{completedSale.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total USD:</span>
                <span className="font-extrabold text-slate-900">
                  ${completedSale.total_usd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bs:</span>
                <span className="font-bold text-sky-700">Bs. {completedSale.total_bs.toFixed(2)}</span>
              </div>
              {completedSale.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                  &quot;{completedSale.notes}&quot;
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const url = getWhatsAppSaleUrl(completedSale, systemSettings.freyeli_phone);
                  window.open(url, '_blank');
                }}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center space-x-2 text-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 Notificar a Freyeli (WhatsApp Admin)</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-2 text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Recibo al Cliente</span>
              </button>

              <button
                onClick={() => setCompletedSale(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE NUEVO CLIENTE RÁPIDO (CON VALIDACIONES ESTRICTAS) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-black text-base text-slate-900 mb-1">Registrar Nuevo Cliente</h3>
            <p className="text-xs text-slate-500 mb-4">
              Se agregará al inicio del directorio en <strong>Orden Actual</strong>
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  placeholder="Ej. Carmen De La Luz"
                  value={newClientName}
                  onChange={e => setNewClientName(sanitizeAndCapitalizeName(e.target.value))}
                  maxLength={50}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Teléfono (WhatsApp):</label>
                  <span className="text-[10px] text-slate-400">Máx. 11 dígitos</span>
                </div>
                <input
                  type="tel"
                  placeholder="Ej. 0424-5567016"
                  value={newClientPhone}
                  onChange={e => {
                    const res = sanitizeVenezuelanPhoneInput(e.target.value);
                    setNewClientPhone(res.formatted);
                  }}
                  maxLength={12}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dirección / Sector:</label>
                <input
                  type="text"
                  placeholder="Ej. Calle 26 con Carrera 25"
                  value={newClientAddress}
                  onChange={e => setNewClientAddress(sanitizeAddressText(e.target.value))}
                  maxLength={120}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setNewClientName('');
                  setNewClientPhone('');
                  setNewClientAddress('');
                  setIsClientModalOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newClientName.trim()) {
                    const client = addClient({
                      name: newClientName.trim(),
                      phone: newClientPhone.trim() || 'N/A',
                      address: newClientAddress.trim() || 'Entrega en tienda / Mostrador',
                      balance_usd: 0,
                    });
                    setSelectedClient(client);
                    setNewClientName('');
                    setNewClientPhone('');
                    setNewClientAddress('');
                    setIsClientModalOpen(false);
                  }
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Guardar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
