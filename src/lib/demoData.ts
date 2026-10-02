import { Sale, Expense, Client } from '@/types';

/**
 * DATOS DE PRUEBA Y DEMOSTRACIÓN (TEST / MOCK DATA)
 * Separados estrictamente de los datos de inicialización reales (Production Seed).
 * Permiten realizar pruebas de estrés, demostraciones a clientes y arqueos sin ensuciar la base de datos real.
 */

export const DEMO_TEST_CLIENTS: Client[] = [
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
];

export const DEMO_TEST_SALES: Sale[] = [
  {
    id: 'sale-demo-001',
    folio: 'H2O-DEMO-001',
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
    notes: '2 recargas de prueba',
    notified_to_admin: true,
  },
  {
    id: 'sale-demo-002',
    folio: 'H2O-DEMO-002',
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
    id: 'sale-demo-003',
    folio: 'H2O-DEMO-003',
    created_at: '2026-09-23T12:00:00Z',
    client_id: 'client-carlos',
    client_name: 'Carlos Mendoza (Panadería)',
    worker_id: 'user-karla',
    worker_name: 'Karla',
    total_usd: 7.00,
    total_bs: 318.50,
    exchange_rate: 45.50,
    items: [
      {
        product_id: 'prod-botellon-nuevo',
        product_name: 'Botellón Nuevo 20L (Lleno)',
        quantity: 1,
        price_usd: 7.00,
        subtotal_usd: 7.00,
      },
    ],
    payments: [
      {
        method: 'efectivo_usd',
        amount_usd: 10.00,
        amount_bs: 455.00,
      },
    ],
    change_usd: 3.00,
    change_bs: 136.50,
    status: 'completada',
    notes: 'Pagó con billete de $10. Vuelto entregado: $3.00',
    notified_to_admin: true,
  },
  {
    id: 'sale-demo-004',
    folio: 'H2O-DEMO-004',
    created_at: '2026-09-23T14:45:00Z',
    client_name: 'Cliente Mostrador / Transeúnte',
    worker_id: 'user-karla',
    worker_name: 'Karla',
    total_usd: 2.00,
    total_bs: 91.00,
    exchange_rate: 45.50,
    items: [
      {
        product_id: 'prod-helado-artesanal',
        product_name: 'Helado Tío Rico / Artesanal',
        quantity: 2,
        price_usd: 1.00,
        subtotal_usd: 2.00,
      },
    ],
    payments: [
      {
        method: 'efectivo_bs',
        amount_usd: 2.00,
        amount_bs: 91.00,
      },
    ],
    status: 'completada',
    notes: 'Venta de helados en efectivo Bs',
    notified_to_admin: true,
  },
];

export const DEMO_TEST_EXPENSES: Expense[] = [
  {
    id: 'exp-demo-001',
    created_at: '2026-09-22T08:00:00Z',
    description: 'Bolsa de 100 tapas con precinto de seguridad',
    category: 'insumos',
    amount_usd: 12.00,
    amount_bs: 546.00,
    payment_method: 'pago_movil',
    recorded_by: 'Freyeliz',
    notes: 'Comprado en distribuidor local de plásticos',
  },
  {
    id: 'exp-demo-002',
    created_at: '2026-09-22T16:30:00Z',
    description: 'Filtro de carbón activado 20 pulgadas (recambio)',
    category: 'mantenimiento_filtros',
    amount_usd: 25.00,
    amount_bs: 1137.50,
    payment_method: 'transferencia',
    recorded_by: 'TSU Jorge Cabrera',
    notes: 'Mantenimiento preventivo mensual de purificación',
  },
];
