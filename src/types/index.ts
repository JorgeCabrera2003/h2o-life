export type RoleType = 'superadmin' | 'admin' | 'worker';

export interface UserProfile {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  avatar?: string;
}

export type ProductCategory = 'agua' | 'botellon' | 'helado' | 'snack' | 'insumo';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price_usd: number;
  stock?: number;
  unit: string;
  icon?: string;
  quick_select?: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  balance_usd: number; // Positive = credit, Negative = debt
  created_at: string;
}

export type PaymentMethod = 'punto' | 'pago_movil' | 'efectivo_usd' | 'efectivo_bs' | 'transferencia';

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
