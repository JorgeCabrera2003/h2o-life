export type RoleType = 'superadmin' | 'admin' | 'worker';

export interface UserProfile {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  avatar?: string;
  phone?: string;
}

export type ProductCategory = 'agua' | 'botellon' | 'helado' | 'snack' | 'insumo' | 'servicio';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price_usd: number;
  cost_usd?: number;
  stock?: number;
  unit: string;
  icon?: string;
  quick_select?: boolean;
  is_service?: boolean;
  active?: boolean;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  reference_point?: string;
  latitude?: number;
  longitude?: number;
  maps_url?: string;
  notes?: string;
  balance_usd: number; // 0 = al día, negativo = deuda pendiente, positivo = saldo a favor
  total_orders?: number;
  favorite_product?: string;
  created_at: string;
}

export type PaymentMethod = 'punto' | 'pago_movil' | 'efectivo_usd' | 'efectivo_bs' | 'transferencia' | 'fiado' | 'mixto';

export interface PaymentLine {
  id?: string;
  method: PaymentMethod;
  amount_usd: number;
  amount_bs: number;
  reference?: string;
  bank?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price_usd: number;
  subtotal_usd: number;
}

export interface Sale {
  id: string;
  folio: string;
  created_at: string;
  client_id?: string;
  client_name?: string;
  worker_id: string;
  worker_name: string;
  total_usd: number;
  total_bs: number;
  exchange_rate: number;
  notes?: string;
  items: SaleItem[];
  payments: PaymentLine[];
  change_usd?: number;
  change_bs?: number;
  status: 'completada' | 'anulada';
  notified_to_admin?: boolean;
}

export interface SaleItem {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_usd: number;
  subtotal_usd: number;
}

export interface Expense {
  id: string;
  created_at: string;
  description: string;
  category: 'cisterna' | 'electricidad' | 'mantenimiento_filtros' | 'insumos' | 'personal' | 'otro';
  amount_usd: number;
  amount_bs: number;
  payment_method: PaymentMethod;
  recorded_by: string;
  notes?: string;
}

export interface WaterTank {
  id: string;
  name: string;
  capacity_liters: number;
  current_liters: number;
  percentage: number;
  last_updated: string;
  status: 'optimo' | 'medio' | 'critico';
}

export interface CisternDelivery {
  id: string;
  created_at: string;
  supplier_name: string;
  driver_name?: string;
  liters_delivered: number;
  cost_usd: number;
  paid_amount_usd: number;
  status: 'pagado' | 'pendiente' | 'parcial';
  tank_id: string;
}

export interface CashClosure {
  id: string;
  closed_at: string;
  worker_name: string;
  exchange_rate: number;
  total_sales_count: number;
  total_usd: number;
  total_bs: number;
  breakdown: {
    efectivo_usd: number;
    efectivo_bs: number;
    punto_bs: number;
    pago_movil_bs: number;
    transferencia_bs: number;
  };
  total_expenses_usd: number;
  net_usd: number;
  notes?: string;
}

export interface ExchangeRateInfo {
  rate: number;
  source: 'BCV Oficial' | 'Paralelo' | 'Manual';
  updated_at: string;
  is_manual_override: boolean;
}

export interface SystemSettings {
  business_name: string;
  business_rif: string;
  store_address: string; // Calle 28 con Carrera 25, Barquisimeto
  store_lat: number;     // 10.07125
  store_lng: number;     // -69.32705
  freyeliz_phone: string; // WhatsApp de Freyeliz (+58 424-5658068)
  freyeli_phone?: string; // Compatibilidad de acceso
  jorge_phone: string;   // WhatsApp de TSU Jorge Cabrera (+58 424-5567016)
  karla_phone: string;   // WhatsApp de Karla (+58 424-5717589)
  tank_low_threshold_pct: number;
  auto_notify_sales: boolean;
  auto_notify_tank_alerts: boolean;
  auto_notify_cisterns: boolean;
  auto_notify_closures: boolean;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'RESTORE';

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: AuditAction;
  target_table: string;
  target_id: string;
  description: string;
  previous_data?: any;
  new_data?: any;
  ip_address?: string;
  device_info?: string;
  location?: string;
}
