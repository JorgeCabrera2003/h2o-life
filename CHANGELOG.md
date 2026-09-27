# 📋 Registro de Cambios (Changelog) - H2O Life POS

Todas las modificaciones notables de este proyecto están documentadas en este archivo según los principios de [Versionamiento Semántico (SemVer)](https://semver.org/lang/es/).

---

## [1.2.0] - 2026-09-27

### 🚀 Agregado & Optimizado
* **Limitación Estricta de Teléfono con Regex & Sanitización Anti-Desbordamiento:**
  * Truncado automático e inmediato a un máximo estricto de **11 dígitos** (`04XX-XXXXXXX`), imposibilitando desbordamientos como los 18 dígitos (`0424 556701672435435`) reportados en pruebas.
  * Sanitización con regex que rechaza caracteres inválidos, asteriscos (`*`), puntos innecesarios y previene inyecciones maliciosas o caracteres corruptos en BD.
  * Selector de operadoras móviles de Venezuela (`0412`, `0414`, `0424`, `0416`, `0426`) con validación regex en tiempo real e indicador visual de estado.
* **Geocodificación Precisa de la Cuadrícula Urbana de Barquisimeto:**
  * Motor inteligente en [`src/lib/validators.ts`](file:///c:/proyectos/h2o-life/src/lib/validators.ts) (`resolveBarquisimetoCoordinates` y `generateSmartAddressSuggestions`).
  * Autocompletado dinámico de intersecciones: al escribir `calle 26`, genera de inmediato `Calle 26 con Carrera 25, Barquisimeto`, `Calle 26 con Carrera 24`, etc.
  * Cálculo paramétrico exacto de latitud/longitud en la retícula urbana central (`10.07125, -69.32535`), eliminando los desvíos anteriores que mostraban comercios distantes (como "fashion full belleza ca") en Google Maps.
* **Mapa Manipulable Nativo en la App (Leaflet OSM):**
  * Componente [`InteractiveMapPicker.tsx`](file:///c:/proyectos/h2o-life/src/components/clients/InteractiveMapPicker.tsx) completamente navegable dentro de la app sin tener que salir ni abrir apps externas.
  * Permite deslizar el mapa (pan), zoom con dos dedos o botones, y arrastrar el pin interactivo 💧 a la puerta exacta de la casa o local comercial.
  * Botón de **"🎯 Re-centrar Pin"** y soporte para pantallas de alta densidad (Retina) en dispositivos Android, iOS, Windows y Mac.
* **Suite de Pruebas Automatizadas Extendida (10 Pruebas Totales):**
  * Script [`scripts/test-system.js`](file:///c:/proyectos/h2o-life/scripts/test-system.js) con 10 pruebas unitarias y de estrés que verifican el truncado de 18 a 11 dígitos, anti-XSS, anti-SQLi, geocodificación de cuadrículas y referencias bancarias.

---

## [1.1.0] - 2026-09-27

### 🚀 Agregado
* **Autocompletado de Direcciones & Mapa en Vivo (Estilo Apps de Delivery tipo Vamos / Yummy):**
  * Componente [`DeliveryAddressMap.tsx`](file:///c:/proyectos/h2o-life/src/components/clients/DeliveryAddressMap.tsx) integrado al formulario de clientes.
  * Desplegable de recomendaciones unificadas de calles, avenidas y sectores con referencias populares.
  * Mapa satelital interactivo embebido en tiempo real que se actualiza automáticamente al escribir o seleccionar una dirección.
  * Botón **"Usar mi GPS"** con API HTML5 Geolocation (`navigator.geolocation`) para capturar coordenadas exactas del repartidor.
  * Visualización opcional del mapa interactivo directamente dentro de cada tarjeta de cliente.
* **Regex y Facilidad de Llenado en Formularios:**
  * Librería de validadores y formateo [`src/lib/validators.ts`](file:///c:/proyectos/h2o-life/src/lib/validators.ts).
  * Auto-capitalización (Title Case) en nombres de clientes (ej. `carmen de la luz` → `Carmen De La Luz`).
  * Selector de código de país (`+58 Venezuela`, `+57 Colombia`, `+1 USA`, etc.).
  * Chips de operadoras telefónicas móviles de Venezuela (`0412 Digitel`, `0414/0424 Movistar`, `0416/0426 Movilnet`) para marcado instantáneo con un solo toque.
  * Sanitización estricta en referencias bancarias (4 a 8 caracteres alfanuméricos) y montos monetarios.
* **Módulo de Configuración Administrativa ([`SettingsModule.tsx`](file:///c:/proyectos/h2o-life/src/components/settings/SettingsModule.tsx)):**
  * Panel accesible desde el ícono de engranaje ⚙️ en el Navbar.
  * Configuración del número de WhatsApp de Freyeli (Administradora) y Jorge Cabrera (Superadmin).
  * Toggles para activar/desactivar notificaciones automáticas por cada venta.
  * Alertas configurables por slider cuando el nivel del tanque de agua caiga por debajo de X% (ej. 30%).
* **Suite de Pruebas Automatizadas de Rendimiento y Estabilidad ([`scripts/test-system.js`](file:///c:/proyectos/h2o-life/scripts/test-system.js)):**
  * Script ejecutable con `npm run test:perf` que valida SSR, API BCV, visión por computadora, fórmulas financieras y una prueba de estrés de 50 peticiones simultáneas con 0% de error.

### 🔧 Corregido
* **Espaciado del Menú Inferior (Layout Overlap Fix):**
  * Se corrigió la superposición de la barra de navegación fija sobre los botones de acción ("Cargar Venta", "Editar") en las tarjetas de clientes mostradas en la captura.
  * Se aplicó un espaciado inferior generoso (`pb-36 sm:pb-40`) en el contenedor `<main>` y en todos los módulos (`ClientsModule`, `PosModule`, `CashClosureModule`, `TankModule`, `FinanceModule`, `SettingsModule`).
* **Tipado de Clientes en el POS:**
  * Se corrigió la propiedad `address` obligatoria en el registro rápido de clientes desde el punto de venta.

---

## [1.0.0] - 2026-09-27

### 🚀 Lanzamiento Inicial (H2O Life Core)
* Inicialización del proyecto con **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS v4**.
* Esquema relacional **PostgreSQL en 3NF** para Supabase ([`supabase_schema.sql`](file:///c:/proyectos/h2o-life/supabase_schema.sql)):
  * Control de roles (RBAC: Superadmin Jorge, Admin Freyeli, Worker Carla).
  * Catálogo unificado de recargas, botellones, helados y snacks.
  * Trigger automático `trg_deduct_water` para descontar 20L por recarga vendida.
* Punto de venta (POS) móvil de alta velocidad para Carla con atajos rápidos de recargas (1, 2, 3 y 4 recargas).
* Soporte nativo para el contexto venezolano:
  * Doble denominación simultánea ($ USD y Bs).
  * Integración con la API oficial del Banco Central de Venezuela (BCV) en [`/api/exchange-rate`](file:///c:/proyectos/h2o-life/src/app/api/exchange-rate/route.ts).
  * Soporte multipago (Punto de venta, Pago Móvil con referencia bancaria, Efectivo USD con cálculo de vuelto en $ y Bs, Efectivo Bs).
  * Recibo digital compartible por WhatsApp.
* Módulo de Cámara e Inteligencia Artificial ([`AiCameraModule.tsx`](file:///c:/proyectos/h2o-life/src/components/camera/AiCameraModule.tsx)):
  * Estimación visual de nivel de agua en tanques.
  * Reconocimiento de envases y garrafones (18L, 20L, 5L).
* Monitoreo de Tanques y Camiones Cisterna ([`TankModule.tsx`](file:///c:/proyectos/h2o-life/src/components/tanks/TankModule.tsx)).
* Arqueo y Cierre Diario de Caja ([`CashClosureModule.tsx`](file:///c:/proyectos/h2o-life/src/components/closure/CashClosureModule.tsx)) con reporte en WhatsApp.
* Dashboard Financiero para Administradores ([`FinanceModule.tsx`](file:///c:/proyectos/h2o-life/src/components/finance/FinanceModule.tsx)).
* Configuración de Progressive Web App (PWA) instalable en iOS y Android con [`manifest.json`](file:///c:/proyectos/h2o-life/public/manifest.json).
