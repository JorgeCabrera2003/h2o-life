'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Product,
  Client,
  CartItem,
  Sale,
  Expense,
  WaterTank,
  CisternDelivery,
  CashClosure,
  ExchangeRateInfo,
  PaymentLine,
  SystemSettings,
} from '@/types';
import {
  DEMO_TEST_CLIENTS,
  DEMO_TEST_SALES,
  DEMO_TEST_EXPENSES,
} from '@/lib/demoData';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-jorge',
    name: 'TSU Jorge Cabrera',
    role: 'superadmin',
    email: 'jorge@h2olife.com',
    avatar: '👨‍💼',
    phone: '+58 424-5567016',
  },
  {
    id: 'user-freyeliz',
    name: 'Freyeliz',
    role: 'admin',
    email: 'freyeliz@h2olife.com',
    avatar: '👩‍💼',
    phone: '+58 424-5658068',
  },
  {
    id: 'user-karla',
    name: 'Karla',
    role: 'worker',
    email: 'karla@h2olife.com',
    avatar: '👩‍🔧',
    phone: '+58 424-5717589',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  business_name: 'H2O Life Purified Water',
  business_rif: 'J-50982341-2',
  store_address: 'Calle 28 con Carrera 25, Barquisimeto',
  store_lat: 10.07125,
  store_lng: -69.32705,
  jorge_phone: '+58 424-5567016',
  freyeliz_phone: '+58 424-5658068',
  freyeli_phone: '+58 424-5658068',
  karla_phone: '+58 424-5717589',
  tank_low_threshold_pct: 30,
  auto_notify_sales: true,
  auto_notify_tank_alerts: true,
  auto_notify_cisterns: true,
  auto_notify_closures: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-recarga-20',
    name: 'Recarga de Agua 20L / 18L',
    category: 'agua',
    price_usd: 0.70,
    cost_usd: 0.10,
    stock: 9999,
    unit: 'recarga',
    icon: '💧',
    quick_select: true,
  },
  {
    id: 'prod-botellon-nuevo',
    name: 'Botellón Nuevo 20L (Lleno)',
    category: 'botellon',
    price_usd: 7.00,
    cost_usd: 4.50,
    stock: 28,
    unit: 'unidad',
    icon: '🧴',
    quick_select: true,
  },
  {
    id: 'prod-botellon-vacio',
    name: 'Botellón Vacío 20L',
    category: 'botellon',
    price_usd: 6.50,
    cost_usd: 4.00,
    stock: 18,
    unit: 'unidad',
    icon: '🫙',
    quick_select: false,
  },
  {
    id: 'prod-botellon-5l',
    name: 'Botellón 5L (Lleno)',
    category: 'botellon',
    price_usd: 2.50,
    cost_usd: 1.20,
    stock: 22,
    unit: 'unidad',
    icon: '🚰',
    quick_select: true,
  },
  {
    id: 'prod-tapa-precinto',
    name: 'Tapa / Precinto de Seguridad',
    category: 'insumo',
    price_usd: 0.20,
    cost_usd: 0.05,
    stock: 180,
    unit: 'unidad',
    icon: '🔘',
    quick_select: false,
  },
  {
    id: 'prod-helado-artesanal',
    name: 'Helado Tío Rico / Artesanal',
    category: 'helado',
    price_usd: 1.00,
    cost_usd: 0.60,
    stock: 45,
    unit: 'unidad',
    icon: '🍦',
    quick_select: true,
  },
  {
    id: 'prod-helado-paleta',
    name: 'Helado Premium Paleta',
    category: 'helado',
    price_usd: 1.50,
    cost_usd: 0.90,
    stock: 35,
    unit: 'unidad',
    icon: '🍧',
    quick_select: false,
  },
  {
    id: 'prod-tostones',
    name: 'Tostones Caseros',
    category: 'snack',
    price_usd: 1.00,
    cost_usd: 0.50,
    stock: 20,
    unit: 'bolsa',
    icon: '🥔',
    quick_select: false,
  },
  {
    id: 'prod-empanadas',
    name: 'Empanadas Chilenas',
    category: 'snack',
    price_usd: 1.50,
    cost_usd: 0.80,
    stock: 15,
    unit: 'unidad',
    icon: '🥟',
    quick_select: false,
  },
  {
    id: 'prod-servicio-desinfeccion',
    name: 'Lavado y Desinfección con Ozono',
    category: 'servicio',
    price_usd: 0.50,
    cost_usd: 0.05,
    stock: 9999,
    unit: 'servicio',
    icon: '✨',
    quick_select: true,
    is_service: true,
    active: true,
    description: 'Sanitización profunda bactericida y enjuague interno con agua ozonizada',
  },
  {
    id: 'prod-servicio-delivery',
    name: 'Servicio de Despacho / Delivery Express',
    category: 'servicio',
    price_usd: 1.00,
    cost_usd: 0.30,
    stock: 9999,
    unit: 'despacho',
    icon: '🛵',
    quick_select: true,
    is_service: true,
    active: true,
    description: 'Despacho a domicilio en Barquisimeto desde sede Calle 28 con Carrera 25',
  },
];

// CLIENTE BASE DE SEMILLA REAL (Mostrador)
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-mostrador',
    name: 'Cliente Mostrador / Transeúnte',
    phone: 'N/A',
    address: 'Calle 28 con Carrera 25, Barquisimeto (Tienda H2O Life)',
    reference_point: 'Mostrador H2O Life',
    notes: 'Venta presencial al detal en tienda sin registro telefónico previo',
    balance_usd: 0,
    total_orders: 1,
    favorite_product: 'Recarga de Agua 20L',
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_TANKS: WaterTank[] = [
  {
    id: 'tank-principal-a',
    name: 'Tanque Principal A (Almacenamiento)',
    capacity_liters: 10000,
    current_liters: 7400,
    percentage: 74,
    last_updated: new Date().toISOString(),
    status: 'optimo',
  },
  {
    id: 'tank-pulmon-b',
    name: 'Tanque Pulmón B (Agua Purificada)',
    capacity_liters: 5000,
    current_liters: 3200,
    percentage: 64,
    last_updated: new Date().toISOString(),
    status: 'medio',
  },
];

// Ventas y Gastos Semilla Limpios (Modo Producción)
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_EXPENSES: Expense[] = [];

interface StoreContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  products: Product[];
  clients: Client[];
  tanks: WaterTank[];
  sales: Sale[];
  expenses: Expense[];
  exchangeRate: ExchangeRateInfo;
  setExchangeRateValue: (rate: number, isManual?: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createSale: (
    client: Client | null,
    payments: PaymentLine[],
    notes?: string,
    changeUsd?: number,
    changeBs?: number
  ) => Sale;
  createExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Client;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateTankLevel: (tankId: string, liters: number) => void;
  registerCisternDelivery: (delivery: Omit<CisternDelivery, 'id' | 'created_at'>) => void;
  createCashClosure: (notes?: string) => CashClosure;
  cashClosures: CashClosure[];
  getWhatsAppSaleUrl: (sale: Sale, targetPhone?: string) => string;
  getWhatsAppTankAlertUrl: (tank: WaterTank, targetPhone?: string) => string;
  // Gestión de Productos y Servicios
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateRefillPrice: (newPriceUsd: number) => void;
  // Separación de Semilla Real y Datos de Demostración
  loadDemoData: () => void;
  clearDemoData: () => void;
  isDemoModeActive: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[2]); // Karla (Worker)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [tanks, setTanks] = useState<WaterTank[]>(INITIAL_TANKS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [cashClosures, setCashClosures] = useState<CashClosure[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo>({
    rate: 45.50,
    source: 'BCV Oficial',
    updated_at: new Date().toISOString(),
    is_manual_override: false,
  });

  // Tasa de cambio oficial
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/exchange-rate');
        if (res.ok) {
          const data = await res.json();
          setExchangeRate(prev => (prev.is_manual_override ? prev : data));
        }
      } catch {
        // Fallback
      }
    }
    fetchRate();
  }, []);

  const setExchangeRateValue = (rate: number, isManual = true) => {
    setExchangeRate({
      rate,
      source: isManual ? 'Manual' : 'BCV Oficial',
      updated_at: new Date().toISOString(),
      is_manual_override: isManual,
    });
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Cargar productos y modo demo persistidos de localStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('h2o_custom_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migración automática: Si la recarga de 20L estaba en $0.50, actualizar a la tarifa vigente $0.70
          const migrated = parsed.map((p: Product) =>
            p.id === 'prod-recarga-20' && p.price_usd === 0.50
              ? { ...p, price_usd: 0.70 }
              : p
          );
          setProducts(migrated);
          localStorage.setItem('h2o_custom_products', JSON.stringify(migrated));
        }
      }
      const savedDemo = localStorage.getItem('h2o_demo_mode');
      if (savedDemo === 'true') {
        setSales(DEMO_TEST_SALES);
        setExpenses(DEMO_TEST_EXPENSES);
        setClients([...INITIAL_CLIENTS, ...DEMO_TEST_CLIENTS]);
        setIsDemoModeActive(true);
      }
    } catch {}
  }, []);

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem('h2o_custom_products', JSON.stringify(updatedProducts));
    } catch {}
  };

  // Crear y registrar nuevos productos o servicios
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      active: productData.active !== undefined ? productData.active : true,
      is_service: productData.is_service !== undefined ? productData.is_service : productData.category === 'servicio',
    };
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      saveProductsToStorage(updated);
      return updated;
    });
    return newProduct;
  };

  // Actualizar producto o servicio existente
  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...productData } : p));
      saveProductsToStorage(updated);
      return updated;
    });

    setCart(prev =>
      prev.map(item =>
        item.product.id === id
          ? {
              ...item,
              product: { ...item.product, ...productData },
              unit_price_usd: productData.price_usd !== undefined ? productData.price_usd : item.unit_price_usd,
              subtotal_usd: Number(
                (item.quantity * (productData.price_usd !== undefined ? productData.price_usd : item.unit_price_usd)).toFixed(2)
              ),
            }
          : item
      )
    );
  };

  // Eliminar producto o servicio
  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveProductsToStorage(updated);
      return updated;
    });
    removeFromCart(id);
  };

  // Cambiar el precio de cada recarga de agua (y actualizar en todo el POS)
  const updateRefillPrice = (newPriceUsd: number) => {
    if (newPriceUsd <= 0) return;
    setProducts(prev => {
      const updated = prev.map(p =>
        p.id === 'prod-recarga-20' || p.category === 'agua'
          ? { ...p, price_usd: newPriceUsd }
          : p
      );
      saveProductsToStorage(updated);
      return updated;
    });

    setCart(prev =>
      prev.map(item =>
        item.product.id === 'prod-recarga-20' || item.product.category === 'agua'
          ? {
              ...item,
              unit_price_usd: newPriceUsd,
              subtotal_usd: Number((item.quantity * newPriceUsd).toFixed(2)),
            }
          : item
      )
    );
  };

  // Cargar datos de prueba y demostración (separados de los reales)
  const loadDemoData = () => {
    setSales(DEMO_TEST_SALES);
    setExpenses(DEMO_TEST_EXPENSES);
    setClients([...INITIAL_CLIENTS, ...DEMO_TEST_CLIENTS]);
    setIsDemoModeActive(true);
    try {
      localStorage.setItem('h2o_demo_mode', 'true');
    } catch {}
  };

  // Limpiar datos de prueba y volver al estado semilla de producción
  const clearDemoData = () => {
    setSales([]);
    setExpenses([]);
    setClients(INITIAL_CLIENTS);
    setCashClosures([]);
    setIsDemoModeActive(false);
    try {
      localStorage.removeItem('h2o_demo_mode');
    } catch {}
  };

  // Carrito de compras
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal_usd: Number(((item.quantity + quantity) * item.unit_price_usd).toFixed(2)),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unit_price_usd: product.price_usd,
          subtotal_usd: Number((quantity * product.price_usd).toFixed(2)),
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal_usd: Number((quantity * item.unit_price_usd).toFixed(2)),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Crear Venta y descontar agua
  const createSale = (
    client: Client | null,
    payments: PaymentLine[],
    notes?: string,
    changeUsd = 0,
    changeBs = 0
  ): Sale => {
    const totalUsd = cart.reduce((acc, item) => acc + item.subtotal_usd, 0);
    const totalBs = Number((totalUsd * exchangeRate.rate).toFixed(2));
    const folioNum = sales.length + 1;
    const folio = `H2O-${new Date().getFullYear()}-${String(folioNum).padStart(4, '0')}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      folio,
      created_at: new Date().toISOString(),
      client_id: client?.id,
      client_name: client ? client.name : 'Cliente Mostrador / Transeúnte',
      worker_id: currentUser.id,
      worker_name: currentUser.name,
      total_usd: Number(totalUsd.toFixed(2)),
      total_bs: totalBs,
      exchange_rate: exchangeRate.rate,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price_usd: item.unit_price_usd,
        subtotal_usd: item.subtotal_usd,
      })),
      payments,
      notes,
      change_usd: changeUsd,
      change_bs: changeBs,
      status: 'completada',
      notified_to_admin: false,
    };

    // Actualizar historial del cliente
    if (client) {
      setClients(prev =>
        prev.map(c =>
          c.id === client.id
            ? { ...c, total_orders: (c.total_orders || 0) + 1 }
            : c
        )
      );
    }

    // Descontar agua del tanque
    let waterLitersToDeduct = 0;
    cart.forEach(item => {
      if (item.product.category === 'agua') {
        waterLitersToDeduct += item.quantity * 20;
      }
    });

    if (waterLitersToDeduct > 0) {
      setTanks(prevTanks =>
        prevTanks.map(tank => {
          if (tank.id === 'tank-pulmon-b') {
            const nextLiters = Math.max(0, tank.current_liters - waterLitersToDeduct);
            const nextPct = Math.round((nextLiters / tank.capacity_liters) * 100);
            return {
              ...tank,
              current_liters: nextLiters,
              percentage: nextPct,
              status: nextPct > 50 ? 'optimo' : nextPct > 25 ? 'medio' : 'critico',
              last_updated: new Date().toISOString(),
            };
          }
          return tank;
        })
      );
    }

    setSales(prev => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  const createExpense = (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'created_at'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      total_orders: 1,
      created_at: new Date().toISOString(),
      maps_url: clientData.maps_url || (clientData.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientData.address)}` : undefined),
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...clientData } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const updateTankLevel = (tankId: string, liters: number) => {
    setTanks(prev =>
      prev.map(tank => {
        if (tank.id === tankId) {
          const clamped = Math.max(0, Math.min(tank.capacity_liters, liters));
          const pct = Math.round((clamped / tank.capacity_liters) * 100);
          return {
            ...tank,
            current_liters: clamped,
            percentage: pct,
            status: pct > 50 ? 'optimo' : pct > 25 ? 'medio' : 'critico',
            last_updated: new Date().toISOString(),
          };
        }
        return tank;
      })
    );
  };

  const registerCisternDelivery = (delivery: Omit<CisternDelivery, 'id' | 'created_at'>) => {
    setTanks(prev =>
      prev.map(tank => {
        if (tank.id === delivery.tank_id) {
          const nextLiters = Math.min(tank.capacity_liters, tank.current_liters + delivery.liters_delivered);
          const pct = Math.round((nextLiters / tank.capacity_liters) * 100);
          return {
            ...tank,
            current_liters: nextLiters,
            percentage: pct,
            status: pct > 50 ? 'optimo' : pct > 25 ? 'medio' : 'critico',
            last_updated: new Date().toISOString(),
          };
        }
        return tank;
      })
    );

    createExpense({
      description: `Cisterna: ${delivery.supplier_name} (+${delivery.liters_delivered.toLocaleString()}L)`,
      category: 'cisterna',
      amount_usd: delivery.cost_usd,
      amount_bs: Number((delivery.cost_usd * exchangeRate.rate).toFixed(2)),
      payment_method: 'transferencia',
      recorded_by: currentUser.name,
      notes: `Descarga en tanque. Estado: ${delivery.status}`,
    });
  };

  const createCashClosure = (notes?: string): CashClosure => {
    const breakdown = {
      efectivo_usd: 0,
      efectivo_bs: 0,
      punto_bs: 0,
      pago_movil_bs: 0,
      transferencia_bs: 0,
    };

    let totalUsd = 0;
    let totalBs = 0;

    sales.forEach(sale => {
      if (sale.status === 'completada') {
        totalUsd += sale.total_usd;
        totalBs += sale.total_bs;
        sale.payments.forEach(p => {
          if (p.method === 'efectivo_usd') breakdown.efectivo_usd += p.amount_usd;
          if (p.method === 'efectivo_bs') breakdown.efectivo_bs += p.amount_bs;
          if (p.method === 'punto') breakdown.punto_bs += p.amount_bs;
          if (p.method === 'pago_movil') breakdown.pago_movil_bs += p.amount_bs;
          if (p.method === 'transferencia') breakdown.transferencia_bs += p.amount_bs;
        });
      }
    });

    const totalExpensesUsd = expenses.reduce((acc, e) => acc + e.amount_usd, 0);
    const netUsd = totalUsd - totalExpensesUsd;

    const closure: CashClosure = {
      id: `closure-${Date.now()}`,
      closed_at: new Date().toISOString(),
      worker_name: currentUser.name,
      exchange_rate: exchangeRate.rate,
      total_sales_count: sales.length,
      total_usd: Number(totalUsd.toFixed(2)),
      total_bs: Number(totalBs.toFixed(2)),
      breakdown,
      total_expenses_usd: Number(totalExpensesUsd.toFixed(2)),
      net_usd: Number(netUsd.toFixed(2)),
      notes,
    };

    setCashClosures(prev => [closure, ...prev]);
    return closure;
  };

  // Generador de enlaces para WhatsApp a Freyeliz (Administradora)
  const getWhatsAppSaleUrl = (sale: Sale, targetPhone?: string) => {
    const phone = (targetPhone || systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '').replace(/\D/g, '');
    const itemsList = sale.items
      .map(i => `• ${i.quantity}x ${i.product_name} ($${i.subtotal_usd.toFixed(2)})`)
      .join('%0A');

    const msg = `💧 *H2O LIFE - NOTIFICACIÓN DE VENTA*%0A-----------------------------%0A*Folio:* ${sale.folio}%0A*Operador:* ${sale.worker_name}%0A*Cliente:* ${sale.client_name}%0A*Items Vendidos:*%0A${itemsList}%0A-----------------------------%0A*Total:* $${sale.total_usd.toFixed(2)} / Bs. ${sale.total_bs.toFixed(2)}%0A*Método:* ${sale.payments.map(p => `${p.method.toUpperCase()} ${p.reference ? `(Ref: ${p.reference})` : ''}`).join(', ')}%0A${sale.notes ? `*Nota:* ${sale.notes}%0A` : ''}Hora: ${new Date(sale.created_at).toLocaleTimeString()}`;

    return `https://wa.me/${phone}?text=${msg}`;
  };

  const getWhatsAppTankAlertUrl = (tank: WaterTank, targetPhone?: string) => {
    const phone = (targetPhone || systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '').replace(/\D/g, '');
    const msg = `⚠️ *ALERTA DE SUMINISTRO - H2O LIFE*%0A-----------------------------%0AEl *${tank.name}* está al *${tank.percentage}%* (${tank.current_liters.toLocaleString()} Litros restantes).%0A%0A*Capacidad Total:* ${tank.capacity_liters.toLocaleString()} L%0ASe requiere solicitar un camión cisterna para reabastecimiento.%0A%0A_Notificación automática del Sistema H2O Life POS_`;

    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        systemSettings,
        updateSystemSettings,
        products,
        clients,
        tanks,
        sales,
        expenses,
        exchangeRate,
        setExchangeRateValue,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createSale,
        createExpense,
        addClient,
        updateClient,
        deleteClient,
        updateTankLevel,
        registerCisternDelivery,
        createCashClosure,
        cashClosures,
        getWhatsAppSaleUrl,
        getWhatsAppTankAlertUrl,
        addProduct,
        updateProduct,
        deleteProduct,
        updateRefillPrice,
        loadDemoData,
        clearDemoData,
        isDemoModeActive,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useH2OStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useH2OStore must be used within a StoreProvider');
  }
  return context;
}

export function useH2OStoreSafe() {
  return useContext(StoreContext);
}

