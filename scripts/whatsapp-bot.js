/**
 * H2O LIFE - BOT DE WHATSAPP AUTÓNOMO Y GRATUITO
 * -------------------------------------------------------------
 * Ejecución: node scripts/whatsapp-bot.js
 * 
 * Permite auto-responder a clientes con:
 * 1. Catálogo con precios en USD y Bs. al día (Tasa BCV oficial)
 * 2. Ubicación de la tienda en Calle 28 con Carrera 25 y Google Maps
 * 3. Datos de Pago Móvil y cuentas bancarias
 * 4. Transferencia de chats a Freyeliz (+58 424-5658068) o Karla (+58 424-5717589)
 * 5. Notificaciones de cierres de caja a TSU Jorge Cabrera (+58 424-5567016)
 * 
 * 100% Gratuito: No requiere pago de API de Meta ni Twilio.
 */

const http = require('http');

const PORT = 3005;
const APP_URL = 'http://localhost:3000';

const CONTACTS = {
  jorge: { name: 'TSU Jorge Cabrera', phone: '+58 424-5567016', role: 'Superadmin' },
  freyeliz: { name: 'Freyeliz', phone: '+58 424-5658068', role: 'Administradora' },
  karla: { name: 'Karla', phone: '+58 424-5717589', role: 'Caja & Mostrador' },
};

async function getLiveBCVRate() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/exchange-rate', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.rate || 866.56);
        } catch {
          resolve(866.56);
        }
      });
    }).on('error', () => resolve(866.56));
  });
}

function generateCatalogText(rate) {
  const r = (usd) => (usd * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `💧 *H2O LIFE - CATÁLOGO Y PRECIOS AL DÍA*
📍 *Ubicación:* Calle 28 con Carrera 25, Barquisimeto
🏢 *RIF:* J-50982341-2
💵 *Tasa BCV Oficial:* Bs. ${rate.toFixed(2)} / USD
━━━━━━━━━━━━━━━━━━━━━━

💧 *RECARGAS DE AGUA:*
• Recarga 20L / 18L: *$0.70* (Bs. ${r(0.70)})
*(Ósmosis Inversa, Ozono y Luz UV)*

🧴 *BOTELLONES Y ENVASES:*
• Botellón Nuevo 20L (Lleno): *$7.00* (Bs. ${r(7.00)})
• Botellón Vacío 20L: *$6.50* (Bs. ${r(6.50)})
• Botellón 5L (Lleno): *$2.50* (Bs. ${r(2.50)})

✨ *SERVICIOS:*
• Lavado y Desinfección con Ozono: *$0.50* (Bs. ${r(0.50)})
• Delivery Express: *$1.00* (Bs. ${r(1.00)})

🍦 *HELADOS Y MERIENDAS:*
• Helado Artesanal: *$1.00* (Bs. ${r(1.00)})
• Helado Paleta Premium: *$1.50* (Bs. ${r(1.50)})
• Tostones Caseros: *$1.00* (Bs. ${r(1.00)})
• Empanadas Chilenas: *$1.50* (Bs. ${r(1.50)})

🔘 *INSUMOS:*
• Tapa / Precinto de Seguridad: *$0.20* (Bs. ${r(0.20)})
━━━━━━━━━━━━━━━━━━━━━━
💳 *MÉTODOS DE PAGO:*
Pago Móvil, Punto de Venta, Divisas en Efectivo y Bs.

📲 *ATENCIÓN:*
Freyeliz: +58 424-5658068 | Karla: +58 424-5717589`;
}

function processIncomingMessage(incomingText, rate) {
  const text = (incomingText || '').trim().toLowerCase();

  if (text === '1' || text === '!catalogo' || text.includes('catalogo') || text.includes('precio')) {
    return generateCatalogText(rate);
  }

  if (text === '2' || text === '!recarga' || text.includes('recarga') || text.includes('agua')) {
    const bs = (0.70 * rate).toFixed(2);
    return `💧 *RECARGA DE AGUA PURIFICADA (20L / 18L)*
Precio: *$0.70 USD* (Bs. ${Number(bs).toLocaleString('es-VE', { minimumFractionDigits: 2 })})

Proceso certificado:
✔ Filtro de carbón activado y lecho mixto
✔ Ósmosis Inversa
✔ Inyección de Ozono bactericida
✔ Lámpara de radiación UV

📍 *Sede:* Calle 28 con Carrera 25, Barquisimeto.
Escribe *!pagos* para datos de transferencia o *!menu* para volver.`;
  }

  if (text === '3' || text === '!ubicacion' || text.includes('ubicacion') || text.includes('donde') || text.includes('direccion')) {
    return `📍 *H2O LIFE - SEDE PRINCIPAL*
🏪 *Dirección:* Calle 28 con Carrera 25, Barquisimeto, Estado Lara.
⏰ *Horarios:*
• Lunes a Sábado: 7:30 AM a 6:00 PM
• Domingos: 8:00 AM a 2:00 PM

🗺 *Ver en Google Maps:*
https://maps.google.com/?q=10.07125,-69.32705`;
  }

  if (text === '4' || text === '!pagos' || text.includes('pago') || text.includes('cuenta') || text.includes('banco')) {
    return `💳 *DATOS DE PAGO MÓVIL H2O LIFE*
━━━━━━━━━━━━━━━━━━━━━━
• *Banco:* Banesco (0134) / Banco de Venezuela (0102)
• *Teléfono:* 0424-5658068
• *RIF:* J-50982341-2

💵 Aceptamos dólares en efectivo, bolívares en efectivo y punto de venta en tienda.
Por favor envía la referencia o captura del pago al realizarlo.`;
  }

  if (text === '5' || text === '!humano' || text.includes('humano') || text.includes('persona') || text.includes('operador')) {
    return `👩‍💼 *ATENCIÓN DIRECTA H2O LIFE*
Un miembro de nuestro equipo te atenderá de inmediato:
• *Freyeliz (Administradora):* +58 424-5658068
• *Karla (Caja / Mostrador):* +58 424-5717589

Por favor déjanos tu consulta o pedido aquí.`;
  }

  // Menú principal por defecto
  return `🤖 *H2O LIFE - ASISTENTE VIRTUAL AUTOMÁTICO*
¡Hola! Bienvenido al canal de atención de *H2O Life* (Calle 28 con Carrera 25).

Por favor responde con el número de la opción que necesitas:
1️⃣ *Catálogo y Precios al Día* en $ y Bs. BCV
2️⃣ *Precio y Detalles de Recarga 20L*
3️⃣ *Ubicación y Horarios de la Tienda*
4️⃣ *Datos Bancarios para Pago Móvil*
5️⃣ *Hablar con un Operador (Freyeliz / Karla)*

_Escribe 1, 2, 3, 4 o 5 para responder._`;
}

// Iniciar servidor local del bot
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', service: 'H2O Life WhatsApp Bot' }));
  }

  // Soporte GET y POST para webhook (compatible con AutoResponder, Tasker, cURL y Navegador)
  if (req.url.startsWith('/webhook')) {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    
    if (req.method === 'GET') {
      const msg = urlObj.searchParams.get('message') || urlObj.searchParams.get('query') || '';
      const rate = await getLiveBCVRate();
      const reply = processIncomingMessage(msg, rate);
      res.writeHead(200);
      return res.end(JSON.stringify({
        success: true,
        incoming: msg,
        reply: reply,
        timestamp: new Date().toISOString()
      }));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const incomingText = payload.message || payload.query?.message || (payload.data && payload.data.message) || '';
          const rate = await getLiveBCVRate();
          const reply = processIncomingMessage(incomingText, rate);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            from: payload.from || payload.sender || 'test_user',
            incoming: incomingText,
            reply: reply,
            timestamp: new Date().toISOString(),
          }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
});

server.listen(PORT, () => {
  console.log('=============================================================');
  console.log('🤖 H2O LIFE - BOT DE WHATSAPP AUTÓNOMO Y GRATUITO');
  console.log('=============================================================');
  console.log(`✓ Servidor del Bot activo en http://localhost:${PORT}`);
  console.log('✓ Conexión con tienda H2O Life: Calle 28 con Carrera 25');
  console.log('✓ Teléfonos del equipo integrados:');
  console.log(`  - Jorge Cabrera: ${CONTACTS.jorge.phone}`);
  console.log(`  - Freyeliz:      ${CONTACTS.freyeliz.phone}`);
  console.log(`  - Karla:         ${CONTACTS.karla.phone}`);
  console.log('-------------------------------------------------------------');
  console.log('Comandos listos: 1 (!catalogo), 2 (!recarga), 3 (!ubicacion), 4 (!pagos), 5 (!humano)');
  console.log('=============================================================\n');
});
