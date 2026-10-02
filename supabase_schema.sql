-- ============================================================================
-- PROYECTO: H2O LIFE POS & GESTIÓN INTEGRAL
-- CLIENTE: TSU Jorge Cabrera
-- BASE DE DATOS: PostgreSQL (Supabase)
-- ARQUITECTURA: 3NF (Tercera Forma Normal) con vistas para finanzas y triggers.
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE ROLES (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
(1, 'superadmin', 'TSU Jorge Cabrera - Acceso total y auditoría de finanzas'),
(2, 'admin', 'Freyeliz - Gestión operativa, inventario y proveedores'),
(3, 'worker', 'Karla - Punto de venta, escaneo AI de tanques y arqueo de caja')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. TABLA DE USUARIOS / PERFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Enlace con supabase.auth.users
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed de usuarios base
INSERT INTO user_profiles (name, email, role_id) VALUES
('TSU Jorge Cabrera', 'jorge@h2olife.com', 1),
('Freyeliz', 'freyeliz@h2olife.com', 2),
('Karla', 'karla@h2olife.com', 3)
ON CONFLICT (email) DO NOTHING;


-- 3. TABLA DE CLIENTES HABITUALES
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    balance_usd DECIMAL(12, 2) DEFAULT 0.00, -- Saldo a favor (+) o cuenta por cobrar (-)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Seed de cliente frecuente
INSERT INTO clients (name, phone, notes) VALUES
('Doraida', '+58 412 1234567', 'Cliente habitual de 2 a 4 recargas semanales')
ON CONFLICT DO NOTHING;

-- 4. CATÁLOGO DE PRODUCTOS UNIFICADO
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'agua', 'botellon', 'helado', 'snack', 'insumo'
    price_usd DECIMAL(10, 2) NOT NULL,
    cost_usd DECIMAL(10, 2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'unidad', -- 'recarga', 'garrafon_20L', 'pote', 'paquete'
    quick_select BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Seed de productos de H2O Life
INSERT INTO products (name, category, price_usd, cost_usd, stock, unit, quick_select) VALUES
('Recarga de Agua (20L / 18L)', 'agua', 0.50, 0.10, 9999, 'recarga', TRUE),
('Botellón Nuevo 20L (con agua)', 'botellon', 7.00, 4.50, 30, 'unidad', TRUE),
('Botellón Vacío 20L', 'botellon', 6.50, 4.00, 20, 'unidad', FALSE),
('Botellón 5L (Nuevo con agua)', 'botellon', 2.50, 1.20, 25, 'unidad', TRUE),
('Tapa / Precinto de Seguridad', 'insumo', 0.20, 0.05, 200, 'unidad', FALSE),
('Helado Tío Rico / Artesanal', 'helado', 1.00, 0.60, 50, 'unidad', TRUE),
('Helado Premium Paleta', 'helado', 1.50, 0.90, 40, 'unidad', FALSE),
('Tostones Caseros', 'snack', 1.00, 0.50, 20, 'bolsa', FALSE),
('Empanadas Chilenas', 'snack', 1.50, 0.80, 15, 'unidad', FALSE)
ON CONFLICT DO NOTHING;

-- 5. TABLA DE TANQUES DE AGUA Y MONITOREO
CREATE TABLE IF NOT EXISTS water_tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    capacity_liters INT NOT NULL,
    current_liters INT NOT NULL,
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((current_liters::numeric / capacity_liters::numeric) * 100) STORED,
    status VARCHAR(20) DEFAULT 'optimo', -- 'optimo', 'medio', 'critico'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO water_tanks (name, capacity_liters, current_liters, status) VALUES
('Tanque Principal A (Almacenamiento)', 10000, 7200, 'optimo'),
('Tanque Pulmón B (Agua Purificada)', 5000, 3100, 'medio')
ON CONFLICT DO NOTHING;

-- 6. TABLA DE PROVEEDORES (Cisternas, Insumos)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(40),
    service_type VARCHAR(50) NOT NULL, -- 'cisterna_agua', 'hielo', 'helados', 'repuestos'
    debt_usd DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO suppliers (name, contact_phone, service_type) VALUES
('Cisterna Los Andes (Agua Manantial)', '+58 414 5550199', 'cisterna_agua'),
('Distribuidora de Helados Polar', '+58 424 9998877', 'helados')
ON CONFLICT DO NOTHING;

-- 7. REGISTRO DE DESCARGA DE CISTERNAS
CREATE TABLE IF NOT EXISTS cistern_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    tank_id UUID REFERENCES water_tanks(id) ON DELETE RESTRICT,
    liters_delivered INT NOT NULL,
    cost_usd DECIMAL(10, 2) NOT NULL,
    paid_amount_usd DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'pendiente', -- 'pagado', 'pendiente', 'parcial'
    delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 8. TABLA DE VENTAS (Encabezado)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio VARCHAR(30) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    worker_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
    total_usd DECIMAL(12, 2) NOT NULL,
    total_bs DECIMAL(14, 2) NOT NULL,
    exchange_rate DECIMAL(12, 4) NOT NULL,
    change_usd DECIMAL(10, 2) DEFAULT 0.00,
    change_bs DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'completada', -- 'completada', 'anulada'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_worker ON sales(worker_id);

-- 9. LÍNEAS DE VENTA (Detalle Normalizado)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_usd DECIMAL(10, 2) NOT NULL,
    subtotal_usd DECIMAL(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- 10. PAGOS ASOCIADOS A LA VENTA (Soporte Multipago)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL, -- 'punto', 'pago_movil', 'efectivo_bs', 'efectivo_usd', 'transferencia'
    amount_usd DECIMAL(12, 2) NOT NULL,
    amount_bs DECIMAL(14, 2) NOT NULL,
    reference VARCHAR(50), -- Número de referencia bancaria (ej. 3062)
    bank VARCHAR(60), -- Banesco, Venezuela, Mercantil, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);

-- 11. GASTOS OPERATIVOS
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- 'cisterna', 'electricidad', 'mantenimiento_filtros', 'insumos', 'personal', 'otro'
    description TEXT NOT NULL,
    amount_usd DECIMAL(12, 2) NOT NULL,
    amount_bs DECIMAL(14, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    recorded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. CIERRES DIARIOS / ARQUEOS DE CAJA
CREATE TABLE IF NOT EXISTS cash_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES user_profiles(id) ON DELETE RESTRICT,
    exchange_rate DECIMAL(12, 4) NOT NULL,
    total_sales_count INT NOT NULL,
    total_usd DECIMAL(12, 2) NOT NULL,
    total_bs DECIMAL(14, 2) NOT NULL,
    total_cash_usd DECIMAL(12, 2) NOT NULL,
    total_cash_bs DECIMAL(14, 2) NOT NULL,
    total_punto_bs DECIMAL(14, 2) NOT NULL,
    total_pago_movil_bs DECIMAL(14, 2) NOT NULL,
    total_transferencia_bs DECIMAL(14, 2) NOT NULL,
    total_expenses_usd DECIMAL(12, 2) DEFAULT 0.00,
    net_usd DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VISTAS AGREGADAS PARA ALTO RENDIMIENTO (Sin sobrecargar el Frontend)
-- ============================================================================

-- Vista diaria de ingresos y desglose por método de pago
CREATE OR REPLACE VIEW view_daily_financial_summary AS
SELECT
    DATE_TRUNC('day', s.created_at) AS date_day,
    COUNT(s.id) AS total_sales,
    COALESCE(SUM(s.total_usd), 0) AS gross_revenue_usd,
    COALESCE(SUM(s.total_bs), 0) AS gross_revenue_bs,
    COALESCE(SUM(CASE WHEN p.method = 'efectivo_usd' THEN p.amount_usd ELSE 0 END), 0) AS efectivo_usd_collected,
    COALESCE(SUM(CASE WHEN p.method = 'efectivo_bs' THEN p.amount_bs ELSE 0 END), 0) AS efectivo_bs_collected,
    COALESCE(SUM(CASE WHEN p.method = 'punto' THEN p.amount_bs ELSE 0 END), 0) AS punto_bs_collected,
    COALESCE(SUM(CASE WHEN p.method = 'pago_movil' THEN p.amount_bs ELSE 0 END), 0) AS pago_movil_bs_collected
FROM sales s
LEFT JOIN payments p ON s.id = p.sale_id
WHERE s.status = 'completada'
GROUP BY DATE_TRUNC('day', s.created_at)
ORDER BY date_day DESC;

-- ============================================================================
-- TRIGGER: Descontar litros del tanque cuando se vende agua
-- ============================================================================
CREATE OR REPLACE FUNCTION deduct_water_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    prod_cat VARCHAR(50);
    liters_sold INT;
BEGIN
    SELECT category INTO prod_cat FROM products WHERE id = NEW.product_id;
    
    -- Si es recarga de agua o garrafón con agua, estimamos 20L por unidad
    IF prod_cat = 'agua' THEN
        liters_sold := NEW.quantity * 20;
        UPDATE water_tanks
        SET current_liters = GREATEST(0, current_liters - liters_sold),
            updated_at = NOW()
        WHERE name LIKE '%Purificada%' OR name LIKE '%Pulmón%'
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_water ON sale_items;
CREATE TRIGGER trg_deduct_water
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION deduct_water_on_sale();
