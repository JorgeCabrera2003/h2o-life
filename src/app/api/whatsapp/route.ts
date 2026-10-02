import { NextResponse } from 'next/server';

/**
 * API Route de Automatización de WhatsApp para H2O Life
 * Permite a cualquier webhook, bot externo o script local consultar el catálogo al día
 * y enviar notificaciones administrativas de forma gratuita.
 */

export async function GET() {
  try {
    // Intentar obtener la tasa BCV oficial
    let bcvRate = 866.56;
    try {
      const bcvRes = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        next: { revalidate: 3600 },
      });
      if (bcvRes.ok) {
        const data = await bcvRes.json();
        if (data.promedio) {
          bcvRate = Number(data.promedio);
        }
      }
    } catch {
      // Usar tasa de respaldo
    }

    const catalogItems = [
      { name: 'Recarga de Agua 20L / 18L', category: 'agua', price_usd: 0.50, price_bs: Number((0.50 * bcvRate).toFixed(2)) },
      { name: 'Botellón Nuevo 20L (Lleno)', category: 'botellon', price_usd: 7.00, price_bs: Number((7.00 * bcvRate).toFixed(2)) },
      { name: 'Botellón Vacío 20L', category: 'botellon', price_usd: 6.50, price_bs: Number((6.50 * bcvRate).toFixed(2)) },
      { name: 'Botellón 5L (Lleno)', category: 'botellon', price_usd: 2.50, price_bs: Number((2.50 * bcvRate).toFixed(2)) },
      { name: 'Lavado y Desinfección con Ozono', category: 'servicio', price_usd: 0.50, price_bs: Number((0.50 * bcvRate).toFixed(2)) },
      { name: 'Servicio de Delivery Express', category: 'servicio', price_usd: 1.00, price_bs: Number((1.00 * bcvRate).toFixed(2)) },
      { name: 'Helado Tío Rico / Artesanal', category: 'helado', price_usd: 1.00, price_bs: Number((1.00 * bcvRate).toFixed(2)) },
      { name: 'Helado Premium Paleta', category: 'helado', price_usd: 1.50, price_bs: Number((1.50 * bcvRate).toFixed(2)) },
      { name: 'Tostones Caseros', category: 'snack', price_usd: 1.00, price_bs: Number((1.00 * bcvRate).toFixed(2)) },
      { name: 'Empanadas Chilenas', category: 'snack', price_usd: 1.50, price_bs: Number((1.50 * bcvRate).toFixed(2)) },
      { name: 'Tapa / Precinto de Seguridad', category: 'insumo', price_usd: 0.20, price_bs: Number((0.20 * bcvRate).toFixed(2)) },
    ];

    const storeInfo = {
      business_name: 'H2O Life C.A.',
      rif: 'J-50982341-2',
      address: 'Calle 28 con Carrera 25, Barquisimeto, Estado Lara',
      google_maps: 'https://maps.google.com/?q=10.07125,-69.32705',
      bcv_rate: bcvRate,
      updated_at: new Date().toISOString(),
    };

    const contacts = {
      jorge_cabrera: { name: 'TSU Jorge Cabrera', role: 'Superadmin', phone: '+58 424-5567016' },
      freyeliz: { name: 'Freyeliz', role: 'Administradora', phone: '+58 424-5658068' },
      karla: { name: 'Karla', role: 'Cajera / Mostrador', phone: '+58 424-5717589' },
    };

    const botCommands = [
      { command: '!menu', description: 'Menú principal interactivo' },
      { command: '!catalogo', description: 'Lista de productos y precios al día en $ y Bs' },
      { command: '!recarga', description: 'Precio de recargas de 20L y calidad de agua' },
      { command: '!ubicacion', description: 'Dirección física y link de Google Maps' },
      { command: '!pagos', description: 'Datos de Pago Móvil y cuentas bancarias' },
      { command: '!humano', description: 'Conectar con atención de Freyeliz o Karla' },
    ];

    return NextResponse.json({
      success: true,
      store: storeInfo,
      contacts,
      catalog: catalogItems,
      bot_commands: botCommands,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, to, message, command } = body;

    // Procesador de comandos de auto-atención para bot
    if (command) {
      const cmd = command.toLowerCase().trim();
      let responseText = '';

      if (cmd === '!menu' || cmd === 'menu' || cmd === 'hola') {
        responseText = `🤖 *MENÚ PRINCIPAL H2O LIFE*\n¡Hola! Bienvenido a nuestra línea de atención. Responde con tu opción:\n\n1️⃣ *!catalogo* - Lista completa con precios al día\n2️⃣ *!recarga* - Precios y proceso de recarga 20L\n3️⃣ *!ubicacion* - Cómo llegar a Calle 28 con Cra 25\n4️⃣ *!pagos* - Cuentas para Pago Móvil\n5️⃣ *!humano* - Hablar con un operador`;
      } else if (cmd === '!catalogo' || cmd === '1') {
        responseText = `💧 *H2O LIFE - CATÁLOGO AL DÍA*\n• Recarga 20L: $0.50\n• Botellón Nuevo 20L: $7.00\n• Botellón Vacío 20L: $6.50\n• Botellón 5L: $2.50\n• Lavado con Ozono: $0.50\n• Delivery Express: $1.00\n• Helados: $1.00 - $1.50\n• Snacks: $1.00 - $1.50\n\nCalle 28 con Carrera 25, Barquisimeto.`;
      } else if (cmd === '!recarga' || cmd === '2') {
        responseText = `💧 *RECARGA DE AGUA 20L - $0.50 USD*\nPurificada con 10 etapas: Ósmosis Inversa, Ozono bactericida y Luz UV.\nTrae tu botellón a Calle 28 con Carrera 25.`;
      } else if (cmd === '!ubicacion' || cmd === '3') {
        responseText = `📍 *H2O LIFE - SEDE PRINCIPAL*\nCalle 28 con Carrera 25, Barquisimeto.\nGoogle Maps: https://maps.google.com/?q=10.07125,-69.32705`;
      } else if (cmd === '!pagos' || cmd === '4') {
        responseText = `💳 *PAGO MÓVIL H2O LIFE*\n• Banco: Banesco (0134)\n• Teléfono: 0424-5658068\n• RIF: J-50982341-2\nPor favor reporta los 4 últimos dígitos de la referencia.`;
      } else if (cmd === '!humano' || cmd === '5') {
        responseText = `👩‍💼 *CONTACTO DIRECTO*\n• Freyeliz (Admin): +58 424-5658068\n• Karla (Caja): +58 424-5717589\n¡Enseguida te atendemos!`;
      } else {
        responseText = `Comando no reconocido. Escribe *!menu* para ver las opciones disponibles.`;
      }

      return NextResponse.json({
        success: true,
        command: cmd,
        response: responseText,
      });
    }

    return NextResponse.json({
      success: true,
      action: action || 'send_message',
      target: to,
      dispatched_at: new Date().toISOString(),
      preview: message ? message.slice(0, 80) + '...' : '',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
