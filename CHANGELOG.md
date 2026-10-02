# 📋 Registro de Cambios (Changelog) - H2O Life POS

Todas las modificaciones notables de este proyecto están documentadas en este archivo según los principios de [Versionamiento Semántico (SemVer)](https://semver.org/lang/es/).

---

## [1.5.0] - 2026-10-02

### 🚀 Implementación Integral de los 20 Puntos de Excelencia Frontend & Producción
1. **Aviso Legal:** Creado [`src/app/aviso-legal/page.tsx`](file:///c:/proyectos/h2o-life/src/app/aviso-legal/page.tsx) con la identificación formal de **H2O Life C.A.** (RIF J-50982341-2, Calle 28 con Carrera 25, Barquisimeto), condiciones de uso y marco normativo venezolano.
2. **Política de Privacidad:** Creado [`src/app/privacidad/page.tsx`](file:///c:/proyectos/h2o-life/src/app/privacidad/page.tsx) detallando el tratamiento de datos personales, entregas a domicilio, cifrado y derechos ARCO.
3. **Aviso de Cookies:** Componente interactivo [`CookieConsentBanner.tsx`](file:///c:/proyectos/h2o-life/src/components/common/CookieConsentBanner.tsx) con persistencia en `localStorage`, personalización de cookies técnicas y analíticas.
4. **Forzar HTTPS:** Configurado encabezado `Strict-Transport-Security` (HSTS preload) en [`next.config.ts`](file:///c:/proyectos/h2o-life/next.config.ts) y middleware de redirección 301 en [`src/middleware.ts`](file:///c:/proyectos/h2o-life/src/middleware.ts).
5. **Meta Títulos y Descripciones SEO:** Configurados en [`src/app/layout.tsx`](file:///c:/proyectos/h2o-life/src/app/layout.tsx) con plantilla dinámica, OpenGraph, Twitter Cards y canonical URLs.
6. **Datos Estructurados (Schema.org):** Integrado JSON-LD con marcado `LocalBusiness`, `Store` y catálogo de productos con coordenadas y horarios en Calle 28 con Carrera 25.
7. **Sitemap y Robots.txt:** Generación nativa en [`src/app/sitemap.ts`](file:///c:/proyectos/h2o-life/src/app/sitemap.ts) y [`src/app/robots.ts`](file:///c:/proyectos/h2o-life/src/app/robots.ts).
8. **Ficha de Google:** Componente [`GoogleBusinessBadge.tsx`](file:///c:/proyectos/h2o-life/src/components/common/GoogleBusinessBadge.tsx) con calificación 5.0, verificación y enlace directo a Google Maps, integrado en Clientes y Configuración.
9. **Favicon de Alta Resolución:** Creados [`public/favicon.svg`](file:///c:/proyectos/h2o-life/public/favicon.svg) y [`public/apple-icon.svg`](file:///c:/proyectos/h2o-life/public/apple-icon.svg) vectoriales con gota de agua luminosa y degradado cian-océano.
10. **Texto Alternativo en Imágenes (Alt Text):** Auditoría completa y actualización de textos alternativos descriptivos para accesibilidad y SEO en visión computacional.
11. **Imágenes Comprimidas:** Configuración en `next.config.ts` de formatos modernos WebP y AVIF junto con vectores SVG.
12. **Velocidad de Carga:** Compresión Gzip/Brotli habilitada, encabezados de caché inmutable (1 año) para recursos estáticos y lazy loading dinámico.
13. **Contraste de Colores (WCAG AA/AAA):** Calibración de textos, insignias y botones para cumplir con ratios de contraste superiores a 4.5:1 y 7:1.
14. **100% Responsivo en Móvil:** Safe area insets (`pb-safe`), control de viewport sin desbordamiento horizontal y zonas táctiles mínimas de 44x44px.
15. **Página 404 Personalizada:** Diseñada en [`src/app/not-found.tsx`](file:///c:/proyectos/h2o-life/src/app/not-found.tsx) con tema acuático ("Gota extraviada"), llamada a la acción principal y accesos directos.
16. **Auditoría de Enlaces:** Verificación de que el 100% de enlaces internos y externos apunten a rutas válidas (`/`, `/aviso-legal`, `/privacidad`, Google Maps, WhatsApp).
17. **Protección Anti-Spam en Formularios:** Técnica Honeypot invisible y validación de tiempo mínimo de llenado en [`src/lib/validators.ts`](file:///c:/proyectos/h2o-life/src/lib/validators.ts).
18. **Botón Flotante de WhatsApp Permanente:** Módulo [`FloatingWhatsAppButton.tsx`](file:///c:/proyectos/h2o-life/src/components/common/FloatingWhatsAppButton.tsx) con selector multi-canal (Freyeliz en tienda, TSU Jorge Cabrera soporte técnico, y precios al día).
19. **Analítica & Telemetría:** Servicio [`src/lib/analytics.ts`](file:///c:/proyectos/h2o-life/src/lib/analytics.ts) con soporte para GA4 y almacenamiento local de auditoría con exportación a JSON en Configuración.
20. **Principio de Una Sola Llamada a la Acción (Single Primary CTA):** Jerarquía visual estricta en cada pantalla destacando únicamente el botón de acción principal.

---


### 🚀 Agregado & Optimizado
* **Geolocalización de la Sede Principal y Trazado de Rutas de Despacho:**
  * Fijada la ubicación oficial de la tienda **H2O Life** en **Calle 28 con Carrera 25, Barquisimeto** (`lat: 10.07125, lng: -69.32705`).
  * En el mapa interactivo [`InteractiveMapPicker.tsx`](file:///c:/proyectos/h2o-life/src/components/clients/InteractiveMapPicker.tsx) ahora se renderizan **dos pines simultáneos**: la **Sede H2O Life (`🏪`)** como punto de origen y el **Punto de Entrega del Cliente (`💧`)**.
  * Trazo de ruta visual dinámica (`L.polyline`) con estilo discontinuo azul que une la tienda con la dirección del cliente.
  * Autoencuadre inteligente (`fitBounds`) para abarcar todo el trayecto entre la tienda y el cliente en una sola vista.
  * Banner superior flotante que calcula y muestra la distancia real estimada en cuadrícula urbana y los minutos de despacho (ej. `~1.2 km • ~5 min en despacho`).
  * Botón directo **`🚗 Cómo llegar`** que genera la ruta paso a paso en **Google Maps** y **Waze** teniendo como origen fijado la sede de la Calle 28.
  * Insignia informativa de despacho en cada tarjeta de cliente en [`ClientsModule.tsx`](file:///c:/proyectos/h2o-life/src/components/clients/ClientsModule.tsx).
* **Corrección de Identidad y Canales de Notificación para Freyeliz:**
  * Actualizado el nombre de la Administradora a **Freyeliz** en todo el sistema (`INITIAL_USERS`, variables de configuración, WhatsApp y botones de notificación).
  * Canal de alerta de WhatsApp sincronizado para que los reportes de ventas, arqueos de caja y alertas de tanques vacíos se dirijan formalmente a Freyeliz.
* **Suite de Pruebas Extendida a 12 Validaciones:**
  * Añadida la prueba 12 en [`scripts/test-system.js`](file:///c:/proyectos/h2o-life/scripts/test-system.js) para certificar matemáticamente el origen en Calle 28 con Carrera 25 y la generación de la URL de navegación.

---

## [1.3.1] - 2026-09-27

### 🚀 Agregado & Optimizado
* **Dropdown Popover Anclado para el Directorio de Clientes (Anti-Split Screen):**
  * Se sustituyó el modal a pantalla completa con fondo oscuro opaco por un **desplegable anclado (`Combobox Popover`)** que nace directamente del botón de cliente sin tapar la pantalla ni generar conflicto con el carrito de ventas lateral.
  * Cierre inteligente automático al hacer clic fuera del desplegable (`click-outside handler`) o al seleccionar un cliente.
  * Corrección de nombres duplicados: se renombró el dropdown a **"Directorio de Clientes"** (`Ordenados por registro más reciente`) y el panel lateral a **"🛒 Detalle del Pedido"**, eliminando la repetición confusa de "Orden Actual" en ambos lados de la pantalla.
  * Botón de cambio rápido `[ Cambiar ]` directamente en el encabezado del carrito para conmutar el cliente en cualquier momento.
  * Corrección del botón de creación: corregido el duplicado `+ + Nuevo Cliente` a un icono limpio con texto estructurado.
  * Avatares de dos letras personalizados (`CL`, `DM`, `PR`, `CM`, `MG`) y distintivo comercial `🏪` para mostrador con paleta de colores contrastante.
* **Corrección de Contexto de Apilamiento CSS (`z-index: auto` en Desktop):**
  * Se ajustó el panel del carrito para usar `lg:z-auto`, evitando que en pantallas de escritorio el carrito compita o quede sobrepuesto a modales o capas de interfaz superpuestas.

---

## [1.3.0] - 2026-09-27

### 🚀 Agregado & Optimizado
* **Selector de Clientes en Orden Actual con Buscador Dinámico (Combobox POS):**
  * Se eliminó la barra horizontal con desbordamiento y scrollbar fea reportada en capturas.
  * Nuevo **Select con Buscador** en [`src/components/pos/PosModule.tsx`](file:///c:/proyectos/h2o-life/src/components/pos/PosModule.tsx) que ordena a los clientes en **Orden Actual** (los más recientemente registrados o actualizados aparecen de primero).
  * Modal/desplegable con campo de búsqueda instantánea por nombre, teléfono, dirección o referencias.
  * Visualización detallada de cliente activo: indicador de deuda (`⚠️ Debe $X.XX`), estatus (`✓ Al Día`), teléfono y dirección.
  * Atajos rápidos no desbordantes para `🏪 Mostrador` y los 2 clientes más recientes para cobro en 1 solo toque.
  * Flujo interconectado: al presionar "Cargar Venta" desde la tarjeta de un cliente en [`ClientsModule.tsx`](file:///c:/proyectos/h2o-life/src/components/clients/ClientsModule.tsx), el POS abre automáticamente con ese cliente preseleccionado.
* **Diseño 100% Responsivo en Vista Móvil (Navbar & Tasa Dólar BCV):**
  * Se rediseñó el encabezado en [`src/components/Navbar.tsx`](file:///c:/proyectos/h2o-life/src/components/Navbar.tsx) para pantallas móviles pequeñas (320px a 430px).
  * Badge táctil y compacto para la **Tasa Oficial BCV** con indicador de estado pulsante, contraste mejorado y tipografía nítida sin deformaciones ni desbordamiento horizontal.
  * Modal centrado táctil para la edición manual de la tasa cambiaria, garantizando que el teclado virtual o la entrada numérica nunca rompan el layout del Navbar.
  * Subtítulos extensos ocultados en móviles (`hidden sm:block`) para otorgar máxima amplitud al logo y controles de caja.
  * Modal de Cobro/Multipago con `max-h-[92vh] overflow-y-auto` para navegación fluida en dispositivos con teclado en pantalla.
* **Suite de Pruebas Automatizadas (11 Pruebas):**
  * Prueba 11 añadida en [`scripts/test-system.js`](file:///c:/proyectos/h2o-life/scripts/test-system.js) para certificar el orden cronológico descendente y el motor de filtrado del buscador.

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
