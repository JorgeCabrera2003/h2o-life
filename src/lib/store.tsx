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

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-jorge',
    name: 'TSU Jorge Cabrera',
    role: 'superadmin',
    email: 'jorge@h2olife.com',
    avatar: '👨‍💼',
    phone: '+584147654321',
  },
  {
    id: 'user-freyeliz',
    name: 'Freyeliz',
    role: 'admin',
    email: 'freyeliz@h2olife.com',
    avatar: '👩‍💼',
    phone: '+584121234567',
  },
  {
    id: 'user-karla',
    name: 'Karla',
    role: 'worker',
    email: 'karla@h2olife.com',
    avatar: '👩‍🔧',
    phone: '+584249998877',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  business_name: 'H2O Life Purified Water',
  business_rif: 'J-50982341-2',
  store_address: 'Calle 28 con Carrera 25, Barquisimeto',
  store_lat: 10.07125,
  store_lng: -69.32705,
  freyeliz_phone: '+58 412 1234567',
  freyeli_phone: '+58 412 1234567',
  jorge_phone: '+58 414 7654321',
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
    price_usd: 0.50,
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
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-doraida',
    name: 'Doraida Mendoza',
    phone: '+58 412 1234567',
    address: 'Calle Los Samanes, Casa #42, Sector Central',
    reference_point: 'Frente a la panadería El Manantial',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Calle+Los+Samanes+Sector+Central',
    notes: 'Cliente fija de 2 a 4 recargas semanales. Paga con Pago Móvil o Efectivo.',
    balance_usd: 0,
    total_orders: 14,
    favorite_product: 'Recarga de Agua 20L',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'client-carlos',
    name: 'Carlos Mendoza (Panadería)',
    phone: '+58 414 7654321',
    address: 'Av. Bolívar, Local #12, Zona Comercial',
    reference_point: 'Al lado de la farmacia SAAS',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Av+Bolivar+Zona+Comercial',
    notes: 'Pide 5 a 8 botellones cada martes para producción de panadería.',
    balance_usd: 0,
    total_orders: 22,
    favorite_product: 'Botellón Nuevo 20L',
    created_at: '2026-09-05T11:00:00Z',
  },
  {
    id: 'client-maria',
    name: 'Sra. María González',
    phone: '+58 424 5558899',
    address: 'Urb. La Esmeralda, Manzana 4, Casa #15',
    reference_point: 'Casa de portón azul cerca del ambulatorio',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Urb+La+Esmeralda',
    notes: 'Tiene saldo pendiente de $1.00 de la semana pasada.',
    balance_usd: -1.00, // Deuda pendiente
    total_orders: 8,
    favorite_product: 'Recarga de Agua 20L',
    created_at: '2026-09-12T09:30:00Z',
  },
  {
    id: 'client-pedro',
    name: 'Pedro Ramírez (Taller)',
    phone: '+58 416 3332211',
    address: 'Callejón Industrial, Galpón #3',
    reference_point: 'Detrás de la estación de servicio',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Callejon+Industrial',
    notes: 'Paga puntual por transferencia bancaria.',
    balance_usd: 0,
    total_orders: 5,
    favorite_product: 'Recarga de Agua 20L',
    created_at: '2026-09-18T14:15:00Z',
  },
  {
    id: 'client-mostrador',
    name: 'Cliente Mostrador / Transeúnte',
    phone: 'N/A',
    address: 'Venta directa en tienda',
    reference_point: 'Mostrador H2O Life',
    notes: 'Público general sin registro de entrega',
    balance_usd: 0,
    total_orders: 80,
    favorite_product: 'Recarga de Agua 20L / Helados',
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

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-001',
    folio: 'H2O-2026-001',
    created_at: '2026-09-23T09:15:00Z',
    client_id: 'client-doraida',
    client_name: 'Doraida Mendoza',
    worker_id: 'user-karla',
    worker_name: 'Karla',
    total_usd: 1.00,
    total_bs: 45.50,
    exchange_rate: 45.50,
    items: [
      {
        product_id: 'prod-recarga-20',
        product_name: 'Recarga de Agua 20L / 18L',
        quantity: 2,
        price_usd: 0.50,
        subtotal_usd: 1.00,
      },
    ],
    payments: [
      {
        method: 'pago_movil',
        amount_usd: 1.00,
        amount_bs: 45.50,
        reference: '3062',
        bank: 'Banesco',
      },
    ],
    status: 'completada',
    notes: '2 recargas anotadas en libreta',
    notified_to_admin: true,
  },
  {
    id: 'sale-002',
    folio: 'H2O-2026-002',
    created_at: '2026-09-23T10:30:00Z',
    client_name: 'Cliente Mostrador / Transeúnte',
    worker_id: 'user-karla',
    worker_name: 'Karla',
    total_usd: 2.00,
    total_bs: 91.00,
    exchange_rate: 45.50,
    items: [
      {
        product_id: 'prod-recarga-20',
        product_name: 'Recarga de Agua 20L / 18L',
        quantity: 4,
        price_usd: 0.50,
        subtotal_usd: 2.00,
      },
    ],
    payments: [
      {
        method: 'punto',
        amount_usd: 2.00,
        amount_bs: 91.00,
        reference: '8841',
        bank: 'Punto de Venta Banesco',
      },
    ],
    status: 'completada',
    notes: '4 recargas pagadas por punto',
    notified_to_admin: true,
  },
  {
    id: 'sale-003',
    folio: 'H2O-2026-003',
    created_at: '2026-09-23T11:45:00Z',
    client_name: 'Cliente Mostrador / Transeúnte',
    worker_id: 'user-karla',
    worker_name: 'Karla',
    total_usd: 1.50,
    total_bs: 68.25,
    exchange_rate: 45.50,
    items: [
      {
        product_id: 'prod-recarga-20',
        product_name: 'Recarga de Agua 20L / 18L',
        quantity: 1,
        price_usd: 0.50,
        subtotal_usd: 0.50,
      },
      {
        product_id: 'prod-helado-artesanal',
        product_name: 'Helado Tío Rico / Artesanal',
        quantity: 1,
        price_usd: 1.00,
        subtotal_usd: 1.00,
      },
    ],
    payments: [
      {
        method: 'efectivo_usd',
        amount_usd: 2.00,
        amount_bs: 91.00,
      },
    ],
    change_usd: 0.50,
    change_bs: 22.75,
    status: 'completada',
    notes: 'Pagó con billete de $2, vuelto $0.50 anotado',
    notified_to_admin: true,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    created_at: '2026-09-22T14:00:00Z',
    description: 'Recarga de Camión Cisterna 10.000 Litros',
    category: 'cisterna',
    amount_usd: 50.00,
    amount_bs: 2275.00,
    payment_method: 'transferencia',
    recorded_by: 'TSU Jorge Cabrera',
    notes: 'Proveedor Cisterna Los Andes',
  },
  {
    id: 'exp-002',
    created_at: '2026-09-23T08:30:00Z',
    description: 'Compra de bolsas para tostones e insumos',
    category: 'insumos',
    amount_usd: 5.00,
    amount_bs: 227.50,
    payment_method: 'efectivo_bs',
    recorded_by: 'Karla',
  },
];

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
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[2]); // Karla (Worker)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [tanks, setTanks] = useState<WaterTank[]>(INITIAL_TANKS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [cashClosures, setCashClosures] = useState<CashClosure[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
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

