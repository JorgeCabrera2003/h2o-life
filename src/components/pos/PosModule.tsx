'use client';

import React, { useState, useMemo } from 'react';
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
  validateAntiSpamSubmission,
} from '@/lib/validators';
import { analytics } from '@/lib/analytics';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { QuickClientModal } from '@/components/pos/QuickClientModal';

interface PosModuleProps {
  isCartDrawerOpen?: boolean;
  setIsCartDrawerOpen?: (open: boolean) => void;
  preselectedClient?: Client | null;
  onNavigateToProducts?: () => void;
}

export function PosModule({
  isCartDrawerOpen = false,
  setIsCartDrawerOpen,
  preselectedClient,
  onNavigateToProducts,
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

  const clientComboboxRef = React.useRef<HTMLDivElement>(null);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const formRenderTimeRef = React.useRef<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState('');

  // Cerrar el dropdown al hacer clic fuera del combobox
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientComboboxRef.current && !clientComboboxRef.current.contains(event.target as Node)) {
        setIsClientSelectOpen(false);
      }
    };

    if (isClientSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClientSelectOpen]);

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

  // Totales del carrito memoizados para máximo rendimiento de render
  const totalUsd = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal_usd, 0), [cart]);
  const totalBs = useMemo(() => Number((totalUsd * exchangeRate.rate).toFixed(2)), [totalUsd, exchangeRate.rate]);

  // Filtrado de productos altamente reactivo y optimizado
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchesCategory =
        selectedCategory === 'todos' ||
        (selectedCategory === 'agua_botellon' && (p.category === 'agua' || p.category === 'botellon')) ||
        p.category === selectedCategory;
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Estados para feedback táctil e instantáneo en móvil
  const [justAddedRefill, setJustAddedRefill] = useState<number | null>(null);
  const [lastAddedNotice, setLastAddedNotice] = useState<{ name: string; detail: string } | null>(null);
  const noticeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerFeedback = (name: string, detail: string) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }
    setLastAddedNotice({ name, detail });
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    noticeTimeoutRef.current = setTimeout(() => {
      setLastAddedNotice(null);
    }, 2400);
  };

  const addToCartWithFeedback = (product: Product, qty = 1) => {
    addToCart(product, qty);
    triggerFeedback(
      `+${qty} ${product.name}`,
      `$${(product.price_usd * qty).toFixed(2)} • En pedido actual`
    );
  };

  // Botones de acceso rápido para Recargas (Karla notebook workflow)
  const quickRefillProduct = products.find(p => p.id === 'prod-recarga-20' || (p.category === 'agua' && p.quick_select));
  const unitRefillPrice = quickRefillProduct ? quickRefillProduct.price_usd : 0.70;

  const handleQuickRefill = (qty: number) => {
    if (quickRefillProduct) {
      addToCart(quickRefillProduct, qty);
      setJustAddedRefill(qty);
      setTimeout(() => setJustAddedRefill(null), 1200);
      const costUsd = (qty * unitRefillPrice).toFixed(2);
      triggerFeedback(
        `+${qty} ${qty === 1 ? 'Botellón (20L)' : 'Botellones (20L)'}`,
        `$${costUsd} • Recarga sumada al pedido`
      );
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
    analytics.logEvent('sale_completed', 'pos', {
      folio: sale.folio,
      total_usd: sale.total_usd,
      total_bs: sale.total_bs,
      client: sale.client_name,
      items_count: sale.items.length,
    });
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-40 md:pb-36 relative">
      {/* Toast Flotante de Confirmación Táctil Inmediata */}
      {lastAddedNotice && (
        <div className="fixed top-18 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-sky-400/40 flex items-center justify-between animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center space-x-2.5 truncate mr-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </span>
            <div className="truncate">
              <p className="text-xs font-black truncate">{lastAddedNotice.name}</p>
              <p className="text-[10px] text-sky-300 font-semibold">{lastAddedNotice.detail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen && setIsCartDrawerOpen(true)}
            className="text-[11px] font-black bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-xl shrink-0 pressable shadow-xs cursor-pointer"
          >
            Ver Pedido →
          </button>
        </div>
      )}

      {/* 1. SECCIÓN RÁPIDA: RECARGAS (Atajo instantáneo de libreta) */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-sky-500/20 mb-5 border border-sky-400/30 relative overflow-hidden">
        {/* Ambient water crystal shine */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-white text-transparent animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight">Atajo Rápido de Recargas de Agua</h2>
              <p className="text-[11px] text-sky-100 font-medium">Toque instantáneo para sumar botellones al carrito</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onNavigateToProducts && (
              <button
                type="button"
                onClick={onNavigateToProducts}
                className="text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full border border-white/20 pressable cursor-pointer hidden sm:inline-flex items-center space-x-1"
                title="Cambiar precio de recarga o registrar productos"
              >
                <span>⚙️ Ajustar Precios</span>
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToProducts}
              className="text-xs bg-white/20 hover:bg-white/30 font-black px-3 py-1 rounded-full border border-white/25 shadow-xs pressable cursor-pointer flex items-center space-x-1"
              title="Toca para cambiar la tarifa de recarga"
            >
              <span>${unitRefillPrice.toFixed(2)} c/u</span>
              <span className="text-[10px] opacity-80">✏️</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
          {[1, 2, 3, 4].map(qty => {
            const costUsd = (qty * unitRefillPrice).toFixed(2);
            const costBs = (qty * unitRefillPrice * exchangeRate.rate).toFixed(2);
            const isJustAdded = justAddedRefill === qty;
            return (
              <button
                key={qty}
                type="button"
                onClick={() => handleQuickRefill(qty)}
                className={`border backdrop-blur-md rounded-2xl p-3.5 text-left transition-all flex flex-col justify-between group pressable min-h-[96px] cursor-pointer shadow-sm relative overflow-hidden ${
                  isJustAdded
                    ? 'bg-white/35 border-emerald-300 ring-2 ring-emerald-300 scale-[1.02]'
                    : 'bg-white/15 hover:bg-white/25 active:scale-[0.96] border-white/30'
                }`}
              >
                {isJustAdded && (
                  <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs animate-in zoom-in-75 duration-150">
                    ✓ ¡Sumado!
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black block tracking-tight">
                    {qty} {qty === 1 ? 'Botellón (20L)' : 'Botellones'}
                  </span>
                  {!isJustAdded && (
                    <span className="text-xs opacity-75 group-hover:scale-110 transition-transform">💧</span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline justify-between pt-1.5 border-t border-white/15">
                  <span className="text-[11px] text-sky-100 font-bold block tabular-nums">Bs. {costBs}</span>
                  <span className="text-sm font-black bg-white/25 px-2 py-0.5 rounded-lg shadow-inner tabular-nums">
                    ${costUsd}
                  </span>
                </div>
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
          <div className="relative flex-1" ref={clientComboboxRef}>
            <button
              type="button"
              onClick={() => {
                setClientSearchQuery('');
                setIsClientSelectOpen(!isClientSelectOpen);
              }}
              className={`w-full bg-white hover:bg-slate-50 border rounded-2xl px-3.5 py-2 text-left shadow-2xs transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
                isClientSelectOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
                  {selectedClient ? (
                    selectedClient.id === 'client-mostrador'
                      ? '🏪'
                      : selectedClient.name.split(' ').length >= 2
                      ? `${selectedClient.name.split(' ')[0][0]}${selectedClient.name.split(' ').slice(-1)[0][0]}`.toUpperCase()
                      : selectedClient.name.slice(0, 2).toUpperCase()
                  ) : '👤'}
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
                    {selectedClient?.phone && selectedClient.phone !== 'N/A' ? `📞 ${selectedClient.phone}` : 'Venta en Tienda'}
                    {selectedClient?.address && selectedClient.address !== 'Venta directa en tienda' ? ` • 📍 ${selectedClient.address}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 text-slate-400 group-hover:text-sky-600 transition-colors">
                <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-sky-50 px-2 py-0.5 rounded-lg hidden sm:inline">
                  {isClientSelectOpen ? 'Cerrar' : 'Buscar'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isClientSelectOpen ? 'rotate-180 text-sky-600' : ''}`} />
              </div>
            </button>

            {/* DROPDOWN / POPOVER ANCLADO (SELECT CON BUSCADOR DINÁMICO) */}
            {isClientSelectOpen && (
              <div className="absolute left-0 right-0 sm:right-auto sm:w-[480px] top-full mt-2 z-40 bg-white rounded-3xl border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[72vh] sm:max-h-[480px] overflow-hidden">
                {/* Encabezado del Dropdown */}
                <div className="p-3.5 pb-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-sky-600" />
                      <span>Directorio de Clientes</span>
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">
                      Ordenados por registro más reciente
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsClientSelectOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Campo de Búsqueda Rápida */}
                <div className="p-3 pb-2 border-b border-slate-100 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-sky-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, teléfono, calle..."
                      value={clientSearchQuery}
                      onChange={e => setClientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:bg-white shadow-2xs"
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
                </div>

                {/* Lista de Clientes con Scroll Suave */}
                <div className="overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100/60">
                  {filteredClientsForSelect.length > 0 ? (
                    filteredClientsForSelect.map(client => {
                      const isSelected = selectedClient?.id === client.id;
                      const hasDebt = client.balance_usd < 0;
                      const isMostrador = client.id === 'client-mostrador';

                      // Calcular iniciales profesionales
                      const parts = client.name.trim().split(/\s+/);
                      const initials = parts.length >= 2
                        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                        : client.name.slice(0, 2).toUpperCase();

                      return (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsClientSelectOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50/90 text-sky-950 border border-sky-300 ring-1 ring-sky-300 shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                isMostrador
                                  ? 'bg-amber-100 text-amber-800'
                                  : isSelected
                                  ? 'bg-sky-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isMostrador ? '🏪' : initials}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {client.name}
                                </span>
                                {isMostrador && (
                                  <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-md shrink-0">
                                    Tienda
                                  </span>
                                )}
                                {client.total_orders && client.total_orders >= 10 && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md shrink-0">
                                    ⭐ Habitual
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                                {client.phone && client.phone !== 'N/A' && (
                                  <span className="font-semibold text-sky-700 shrink-0">
                                    {client.phone}
                                  </span>
                                )}
                                {client.address && (
                                  <span className="truncate text-slate-400">
                                    📍 {client.address}
                                  </span>
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
                            {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-500 font-medium mb-2.5">
                        No se encontraron clientes para &quot;{clientSearchQuery}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewClientName(clientSearchQuery);
                          setIsClientSelectOpen(false);
                          setIsClientModalOpen(true);
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs cursor-pointer active:scale-95"
                      >
                        + Registrar a &quot;{clientSearchQuery}&quot; ahora
                      </button>
                    </div>
                  )}
                </div>

                {/* Pie del Dropdown */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {filteredClientsForSelect.length} cliente(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientSelectOpen(false);
                      setIsClientModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm hover:from-sky-700 active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Cliente</span>
                  </button>
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

      {/* 3. FILTROS DE CATEGORÍA (Capsule Segmented Control) */}
      <div className="flex items-center justify-between mb-5 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-slate-200/60 backdrop-blur-md rounded-2xl gap-1">
          {[
            { id: 'todos', label: 'Todos los Productos', icon: '📦' },
            { id: 'agua_botellon', label: 'Agua & Botellones', icon: '💧' },
            { id: 'helado', label: 'Helados', icon: '🍦' },
            { id: 'snack', label: 'Snacks', icon: '🍿' },
          ].map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 pressable cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. GRID DE PRODUCTOS & PANEL LATERAL DE CARRITO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Catálogo de Productos */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              <span className="text-3xl mb-2 block">🔍</span>
              <p className="text-xs font-bold text-slate-700">No se encontraron productos</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Prueba con otra palabra clave o selecciona otra categoría
              </p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const priceBs = (product.price_usd * exchangeRate.rate).toFixed(2);
              const inCartItem = cart.find(i => i.product.id === product.id);
              const inCartQty = inCartItem?.quantity || 0;
              const isInCart = inCartQty > 0;

              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => addToCartWithFeedback(product, 1)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      addToCartWithFeedback(product, 1);
                    }
                  }}
                  className={`bg-white rounded-3xl p-3.5 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group pressable active:scale-[0.98] min-h-[175px] relative cv-auto gpu-accelerated ${
                    isInCart
                      ? 'border-sky-400 bg-sky-50/20 ring-2 ring-sky-400/20 shadow-md shadow-sky-500/10'
                      : 'border-slate-200/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10'
                  }`}
                >
                  {isInCart && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-sky-600 to-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 animate-in zoom-in-75 duration-150 z-10">
                      <span>🛒</span>
                      <span>{inCartQty} en pedido</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-cyan-50 border border-sky-100/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-2xs">
                        {product.icon || '📦'}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 mb-1 group-hover:text-sky-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                        ${product.price_usd.toFixed(2)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100/80 block mt-0.5 tabular-nums">
                        Bs. {priceBs}
                      </span>
                    </div>

                    {isInCart ? (
                      <div
                        className="flex items-center bg-white border border-sky-300 rounded-xl p-0.5 shadow-2xs"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, inCartQty - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-90 font-black text-sm pressable cursor-pointer"
                          aria-label="Restar uno"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-black text-sky-900">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCartWithFeedback(product, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 active:scale-90 font-black text-sm shadow-xs pressable cursor-pointer"
                          aria-label="Sumar uno"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          addToCartWithFeedback(product, 1);
                        }}
                        className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 hover:bg-gradient-to-r hover:from-sky-600 hover:to-cyan-500 hover:text-white flex items-center justify-center shadow-2xs transition-all pressable font-black text-sm cursor-pointer"
                        aria-label={`Agregar ${product.name} al carrito`}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Backdrop Oscuro para Mobile */}
        {isCartDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
            onClick={() => setIsCartDrawerOpen && setIsCartDrawerOpen(false)}
          />
        )}

        {/* Panel del Carrito de Ventas (Visible en Desktop y Drawer en Mobile con z-55) */}
        <div
          className={`fixed inset-y-0 right-0 z-55 w-full sm:w-96 bg-white shadow-2xl p-5 transform transition-transform duration-250 ease-out gpu-accelerated lg:static lg:z-auto lg:w-auto lg:h-auto lg:shadow-none lg:border lg:border-slate-200/80 lg:rounded-2xl lg:p-5 flex flex-col justify-between lg:sticky lg:top-4 pb-10 lg:pb-5 ${
            isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-1.5">
                  <span>🛒 Detalle del Pedido</span>
                </h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-xs text-slate-500 truncate max-w-[190px]">
                    Cliente: <span className="font-bold text-sky-700">{selectedClient?.name}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientSelectOpen(prev => !prev);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
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
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="p-2 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl lg:hidden pressable cursor-pointer flex items-center space-x-1"
                    aria-label="Cerrar pedido"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-xs font-bold sm:hidden pr-1">Cerrar</span>
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

          {/* Subtotal y Botón de Cobro (Single Primary CTA de Alta Gama) */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-500 font-semibold">Total en Dólares:</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs text-slate-500 font-semibold">Total Tasa BCV:</span>
              <span className="text-sm font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100 tabular-nums">
                Bs. {totalBs}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full min-h-[52px] bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-between pressable cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-xs sm:text-sm uppercase tracking-wide">Cobrar Orden</span>
              </div>
              <span className="text-base font-black bg-white/20 px-2.5 py-1 rounded-xl tabular-nums">
                ${totalUsd.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODAL DE COBRO / MULTIPAGO VENEZOLANO */}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedClient={selectedClient}
        totalUsd={totalUsd}
        totalBs={totalBs}
        exchangeRate={exchangeRate}
        activePaymentMethod={activePaymentMethod}
        setActivePaymentMethod={setActivePaymentMethod}
        pagoMovilBank={pagoMovilBank}
        setPagoMovilBank={setPagoMovilBank}
        pagoMovilRef={pagoMovilRef}
        setPagoMovilRef={setPagoMovilRef}
        puntoRef={puntoRef}
        setPuntoRef={setPuntoRef}
        cashUsdGiven={cashUsdGiven}
        setCashUsdGiven={setCashUsdGiven}
        changeUsd={changeUsd}
        changeBs={changeBs.toString()}
        saleNotes={saleNotes}
        setSaleNotes={setSaleNotes}
        onFinalizeSale={handleFinalizeSale}
      />

      {/* 6. MODAL DE RECIBO DIGITAL EXITOSO */}
      <ReceiptModal
        completedSale={completedSale}
        onClose={() => setCompletedSale(null)}
        onShareWhatsApp={handleShareWhatsApp}
        getWhatsAppSaleUrl={getWhatsAppSaleUrl}
        systemSettings={systemSettings}
      />

      {/* 7. MODAL DE NUEVO CLIENTE RÁPIDO */}
      <QuickClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setNewClientName('');
          setNewClientPhone('');
          setNewClientAddress('');
          setHoneypot('');
          setIsClientModalOpen(false);
        }}
        newClientName={newClientName}
        setNewClientName={setNewClientName}
        newClientPhone={newClientPhone}
        setNewClientPhone={setNewClientPhone}
        newClientAddress={newClientAddress}
        setNewClientAddress={setNewClientAddress}
        honeypot={honeypot}
        setHoneypot={setHoneypot}
        onSubmit={e => {
          e.preventDefault();
          const spamCheck = validateAntiSpamSubmission({
            honeypotValue: honeypot,
            formRenderTimeMs: formRenderTimeRef.current,
            minHumanDurationMs: 400,
          });
          if (spamCheck.isSpam) {
            console.warn('Envío de formulario bloqueado por seguridad anti-spam:', spamCheck.reason);
            return;
          }

          if (newClientName.trim()) {
            const client = addClient({
              name: newClientName.trim(),
              phone: newClientPhone.trim() || 'N/A',
              address: newClientAddress.trim() || 'Entrega en tienda / Mostrador',
              balance_usd: 0,
            });
            analytics.logEvent('client_created_pos', 'client', { name: client.name });
            setSelectedClient(client);
            setNewClientName('');
            setNewClientPhone('');
            setNewClientAddress('');
            setHoneypot('');
            setIsClientModalOpen(false);
          }
        }}
      />
    </div>
  );
}
