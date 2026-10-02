import { Product, SystemSettings, ExchangeRateInfo, Sale, WaterTank, CashClosure } from '@/types';

/**
 * Utilidades avanzadas de formateo para WhatsApp Business y Personal de H2O Life.
 * 100% gratuito, compatible con wa.me y web.whatsapp.com sin costo de APIs de Meta.
 */

export interface WhatsAppContact {
  name: string;
  phone: string;
  role: string;
  avatar: string;
}

export const OFFICIAL_CONTACTS: Record<string, WhatsAppContact> = {
  jorge: {
    name: 'TSU Jorge Cabrera',
    phone: '+58 424-5567016',
    role: 'Superadmin & Auditor Financiero',
    avatar: '👨‍💼',
  },
  freyeliz: {
    name: 'Freyeliz',
    phone: '+58 424-5658068',
    role: 'Administradora Operativa',
    avatar: '👩‍💼',
  },
  karla: {
    name: 'Karla',
    phone: '+58 424-5717589',
    role: 'Cajera & Mostrador',
    avatar: '👩‍💻',
  },
};

/**
 * Limpia y normaliza un número de teléfono para el formato internacional de WhatsApp (sin signos ni espacios)
 * Ejemplo: "+58 424-5567016" -> "584245567016"
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    // Si empieza con 0424, transformarlo a 58424
    cleaned = '58' + cleaned.slice(1);
  } else if (!cleaned.startsWith('58') && cleaned.length === 10) {
    cleaned = '58' + cleaned;
  }
  return cleaned;
}

/**
 * Abre una ventana o pestaña de WhatsApp con el mensaje ya cargado
 */
export function openWhatsAppChat(phone: string, text: string) {
  const clean = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${clean}?text=${encodedText}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}

/**
 * Genera el enlace directo para compartir a cualquier chat (sin destinatario fijo)
 */
export function getWhatsAppShareUrl(text: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * 1. GENERADOR DE CATÁLOGO COMPLETO CON PRECIOS AL DÍA EN $ Y Bs. BCV
 */
export function generateCatalogWhatsAppMessage(
  products: Product[],
  exchangeRate: ExchangeRateInfo,
  settings?: SystemSettings
): string {
  const dateStr = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const rate = exchangeRate.rate;
  const storeAddress = settings?.store_address || 'Calle 28 con Carrera 25, Barquisimeto';
  const rif = settings?.business_rif || 'J-50982341-2';

  // Agrupar productos
  const recargas = products.filter(p => p.category === 'agua');
  const botellones = products.filter(p => p.category === 'botellon');
  const servicios = products.filter(p => p.category === 'servicio' || p.is_service);
  const helados = products.filter(p => p.category === 'helado');
  const snacks = products.filter(p => p.category === 'snack');
  const insumos = products.filter(p => p.category === 'insumo');

  const formatItem = (p: Product) => {
    const bsPrice = (p.price_usd * rate).toFixed(2);
    return `• *${p.name}:* $${p.price_usd.toFixed(2)} _(Bs. ${Number(bsPrice).toLocaleString('es-VE', { minimumFractionDigits: 2 })})_`;
  };

  let msg = `💧 *H2O LIFE - CATÁLOGO Y PRECIOS AL DÍA*\n`;
  msg += `📍 *Ubicación:* ${storeAddress}\n`;
  msg += `🏢 *RIF:* ${rif} | *Fecha:* ${dateStr} ${timeStr}\n`;
  msg += `💵 *Tasa Oficial BCV:* Bs. ${rate.toFixed(2)} / USD\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (recargas.length > 0) {
    msg += `💧 *RECARGAS DE AGUA PURIFICADA:*\n`;
    recargas.forEach(p => {
      msg += `${formatItem(p)}\n`;
    });
    msg += `_(Microfiltración, Ósmosis Inversa, Ozono y Luz Ultravioleta UV)_\n\n`;
  }

  if (botellones.length > 0) {
    msg += `🧴 *BOTELLONES Y ENVASES NUEVOS:*\n`;
    botellones.forEach(p => {
      msg += `${formatItem(p)}\n`;
    });
    msg += `\n`;
  }

  if (servicios.length > 0) {
    msg += `✨ *SERVICIOS ESPECIALES:*\n`;
    servicios.forEach(p => {
      msg += `${formatItem(p)}\n`;
      if (p.description) {
        msg += `   └ _${p.description}_\n`;
      }
    });
    msg += `\n`;
  }

  if (helados.length > 0) {
    msg += `🍦 *HELADOS Y POSTRES:*\n`;
    helados.forEach(p => {
      msg += `${formatItem(p)}\n`;
    });
    msg += `\n`;
  }

  if (snacks.length > 0) {
    msg += `🍿 *SNACKS Y MERIENDAS:*\n`;
    snacks.forEach(p => {
      msg += `${formatItem(p)}\n`;
    });
    msg += `\n`;
  }

  if (insumos.length > 0) {
    msg += `🔘 *INSUMOS Y REPUESTOS:*\n`;
    insumos.forEach(p => {
      msg += `${formatItem(p)}\n`;
    });
    msg += `\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💳 *FORMAS DE PAGO ACEPTADAS:*\n`;
  msg += `✔ Pago Móvil (Banesco / BDV / Provincial)\n`;
  msg += `✔ Punto de Venta en Tienda (Débito y Crédito)\n`;
  msg += `✔ Efectivo Dólares ($) y Bolívares en Efectivo\n`;
  msg += `✔ Transferencia Bancaria\n\n`;

  msg += `📲 *LÍNEAS DE ATENCIÓN DIRECTA:*\n`;
  msg += `• Administradora (Freyeliz): +58 424-5658068\n`;
  msg += `• Caja / Mostrador (Karla): +58 424-5717589\n`;
  msg += `• Ver en Google Maps: https://maps.google.com/?q=10.07125,-69.32705\n\n`;
  msg += `_¡Gracias por preferir la pureza y frescura de H2O Life!_`;

  return msg;
}

/**
 * 2. REPORTE EJECUTIVO PARA LA ADMINISTRADORA (Freyeliz)
 */
export function generateExecutiveReportWhatsAppMessage(
  sales: Sale[],
  tanks: WaterTank[],
  exchangeRate: ExchangeRateInfo,
  settings?: SystemSettings
): string {
  const dateStr = new Date().toLocaleDateString('es-VE');
  const timeStr = new Date().toLocaleTimeString('es-VE');
  const totalUsd = sales.reduce((acc, s) => acc + s.total_usd, 0);
  const totalBs = sales.reduce((acc, s) => acc + s.total_bs, 0);

  // Desglose de botellones vendidos
  let totalRecargas = 0;
  const paymentTotals: Record<string, number> = {
    efectivo_usd: 0,
    efectivo_bs: 0,
    punto: 0,
    pago_movil: 0,
    transferencia: 0,
  };

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.product_id.includes('recarga') || item.product_name.toLowerCase().includes('recarga')) {
        totalRecargas += item.quantity;
      }
    });
    sale.payments?.forEach(p => {
      paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount_usd;
    });
  });

  let msg = `📊 *H2O LIFE - REPORTE EJECUTIVO DEL TURNO*\n`;
  msg += `👩‍💼 *Para:* Freyeliz (Administradora)\n`;
  msg += `📅 *Fecha:* ${dateStr} - ${timeStr}\n`;
  msg += `💵 *Tasa BCV:* Bs. ${exchangeRate.rate.toFixed(2)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `💰 *RECAUDACIÓN TOTAL DEL TURNO:*\n`;
  msg += `• Total USD: *$${totalUsd.toFixed(2)}*\n`;
  msg += `• Total Bs: *Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}*\n`;
  msg += `• Total Operaciones: *${sales.length} ventas*\n`;
  msg += `• Recargas 20L Despachadas: *${totalRecargas} botellones*\n\n`;

  msg += `💳 *DESGLOSE POR MÉTODO DE PAGO:*\n`;
  msg += `• Efectivo USD: $${paymentTotals.efectivo_usd.toFixed(2)}\n`;
  msg += `• Efectivo Bs: $${paymentTotals.efectivo_bs.toFixed(2)}\n`;
  msg += `• Punto de Venta: $${paymentTotals.punto.toFixed(2)}\n`;
  msg += `• Pago Móvil: $${paymentTotals.pago_movil.toFixed(2)}\n`;
  if (paymentTotals.transferencia > 0) {
    msg += `• Transferencia: $${paymentTotals.transferencia.toFixed(2)}\n`;
  }
  msg += `\n`;

  msg += `💧 *ESTADO ACTUAL DE TANQUES:*\n`;
  tanks.forEach(t => {
    const icon = t.percentage < 25 ? '🔴' : t.percentage < 50 ? '🟡' : '🟢';
    msg += `${icon} *${t.name}:* ${t.percentage}% (${t.current_liters.toLocaleString()} L / ${t.capacity_liters.toLocaleString()} L)\n`;
  });

  const tankBajo = tanks.find(t => t.percentage < 25);
  if (tankBajo) {
    msg += `\n⚠️ *ALERTA:* El ${tankBajo.name} está bajo (${tankBajo.percentage}%). Se sugiere solicitar camión cisterna.\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Reporte generado automáticamente desde el Sistema H2O Life POS_`;

  return msg;
}

/**
 * 3. ARQUEO Y CIERRE DE CAJA PARA AUDITORÍA (TSU Jorge Cabrera)
 */
export function generateCashClosureWhatsAppMessage(
  closure: CashClosure,
  exchangeRate: ExchangeRateInfo
): string {
  let msg = `🔒 *H2O LIFE - CIERRE DIARIO Y ARQUEO DE CAJA*\n`;
  msg += `👨‍💼 *Para:* TSU Jorge Cabrera (Superadmin)\n`;
  msg += `👤 *Operador de Turno:* ${closure.worker_name}\n`;
  msg += `🕒 *Hora de Cierre:* ${new Date(closure.closed_at).toLocaleString('es-VE')}\n`;
  msg += `💵 *Tasa BCV del Cierre:* Bs. ${closure.exchange_rate.toFixed(2)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `📈 *RESUMEN FINANCIERO:*\n`;
  msg += `• Total Ventas Brutas: *$${closure.total_usd.toFixed(2)}* (Bs. ${closure.total_bs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n`;
  msg += `• Cantidad de Ventas: *${closure.total_sales_count}*\n`;
  msg += `• Gastos Operativos: *$${closure.total_expenses_usd.toFixed(2)}*\n`;
  msg += `• *GANANCIA NETA EN CAJA:* *$${closure.net_usd.toFixed(2)}*\n\n`;

  msg += `💵 *DETALLE DE FONDOS DISPONIBLES:*\n`;
  msg += `• Efectivo Físico USD: *$${closure.breakdown.efectivo_usd.toFixed(2)}*\n`;
  msg += `• Efectivo Físico Bs: *Bs. ${closure.breakdown.efectivo_bs.toFixed(2)}*\n`;
  msg += `• Lote Punto de Venta: *Bs. ${closure.breakdown.punto_bs.toFixed(2)}*\n`;
  msg += `• Total Pago Móvil Bancario: *Bs. ${closure.breakdown.pago_movil_bs.toFixed(2)}*\n`;
  if (closure.breakdown.transferencia_bs > 0) {
    msg += `• Transferencias Bancarias: *Bs. ${closure.breakdown.transferencia_bs.toFixed(2)}*\n`;
  }

  if (closure.notes) {
    msg += `\n📝 *Observaciones del Operador:*\n"${closure.notes}"\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Auditoría Financiera Certificada • H2O Life POS v1.6_`;

  return msg;
}

/**
 * 4. TICKET DIGITAL DE VENTA PARA EL CLIENTE
 */
export function generateDigitalTicketWhatsAppMessage(
  sale: Sale,
  storeSettings?: SystemSettings
): string {
  const dateStr = new Date(sale.created_at).toLocaleString('es-VE');
  const itemsText = sale.items
    .map(i => `• ${i.quantity}x ${i.product_name} ($${i.subtotal_usd.toFixed(2)})`)
    .join('\n');

  let msg = `🧾 *H2O LIFE - COMPROBANTE DE COMPRA*\n`;
  msg += `💧 *Pureza y Calidad Garantizada*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Folio:* ${sale.folio}\n`;
  msg += `*Fecha:* ${dateStr}\n`;
  msg += `*Cliente:* ${sale.client_name}\n`;
  msg += `*Atendido por:* ${sale.worker_name}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `📦 *DETALLE DE TU COMPRA:*\n`;
  msg += `${itemsText}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*TOTAL A PAGAR:*\n`;
  msg += `💵 *$${sale.total_usd.toFixed(2)} USD*\n`;
  msg += `🇻🇪 *Bs. ${sale.total_bs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}*\n`;
  msg += `*(Tasa oficial BCV: Bs. ${sale.exchange_rate.toFixed(2)})*\n\n`;

  msg += `💳 *Método de Pago:* ${sale.payments.map(p => p.method.replace('_', ' ').toUpperCase()).join(' + ')}\n`;
  if ((sale.change_usd ?? 0) > 0 || (sale.change_bs ?? 0) > 0) {
    msg += `💰 *Vuelto entregado:* $${(sale.change_usd ?? 0).toFixed(2)} / Bs. ${(sale.change_bs ?? 0).toFixed(2)}\n`;
  }

  msg += `\n📍 *Nuestra Tienda:* ${storeSettings?.store_address || 'Calle 28 con Carrera 25, Barquisimeto'}\n`;
  msg += `🗺 *Cómo Llegar:* https://maps.google.com/?q=10.07125,-69.32705\n\n`;
  msg += `_¡Gracias por tu compra! Recuerda mantener tus botellones siempre limpios y sellados._`;

  return msg;
}

/**
 * 5. MENÚ DE AUTO-RESPUESTA DEL BOT DE WHATSAPP (100% GRATUITO)
 */
export const BOT_COMMANDS = {
  menu: {
    command: '!menu',
    title: 'Menú Principal',
    description: 'Muestra opciones interactivas de auto-atención',
  },
  catalogo: {
    command: '!catalogo',
    title: 'Lista de Precios al Día',
    description: 'Envía el catálogo completo con precios en $ y Bs BCV',
  },
  recarga: {
    command: '!recarga',
    title: 'Precio de Recargas',
    description: 'Detalle de recargas de 20L y promociones activas',
  },
  ubicacion: {
    command: '!ubicacion',
    title: 'Ubicación & Horarios',
    description: 'Calle 28 con Carrera 25, mapa interactivo y horas de servicio',
  },
  pagos: {
    command: '!pagos',
    title: 'Datos de Pago Móvil',
    description: 'Cuentas bancarias, teléfono y RIF para transferencias',
  },
  humano: {
    command: '!humano',
    title: 'Hablar con una Persona',
    description: 'Transfiere el chat a Freyeliz o Karla para atención manual',
  },
};
