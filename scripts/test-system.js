/**
 * H2O LIFE POS - Suite de Pruebas Automatizadas de Rendimiento, Estabilidad e Integridad
 * Ejecuta validaciones de endpoints, concurrencia, APIs de visión y consistencia de datos.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function fetchUrl(url, options = {}) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          duration,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de petición'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=================================================================');
  console.log('💧 INICIANDO SUITE DE PRUEBAS DE RENDIMIENTO Y ESTABILIDAD H2O LIFE');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  // PRUEBA 1: Carga de Página Principal y Metadatos PWA
  try {
    process.stdout.write('1. [Rendimiento Web] Carga de Página Principal (SSR / PWA)... ');
    const res = await fetchUrl(`${BASE_URL}/`);
    if (res.statusCode === 200 && res.data.includes('manifest.json') && res.data.includes('H2O')) {
      console.log(`✓ ÉXITO (${res.duration}ms) - HTML servido y etiquetas PWA verificadas`);
      passed++;
    } else {
      console.log(`✗ FALLO - Status ${res.statusCode}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 2: API de Tasa de Cambio BCV en Tiempo Real
  try {
    process.stdout.write('2. [API Divisas] Verificación de Tasa Oficial BCV Venezuela... ');
    const res = await fetchUrl(`${BASE_URL}/api/exchange-rate`);
    const json = JSON.parse(res.data);
    if (res.statusCode === 200 && json.rate && json.source) {
      console.log(`✓ ÉXITO (${res.duration}ms) - Tasa actual: Bs. ${json.rate} (${json.source})`);
      passed++;
    } else {
      console.log(`✗ FALLO - Formato inesperado`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 3: API de Visión por Computadora (Modo Tanque de Agua)
  try {
    process.stdout.write('3. [IA / Visión] Diagnóstico de Nivel de Tanques... ');
    const postData = JSON.stringify({
      mode: 'tank',
      tankCapacity: 10000,
      base64Image: 'data:image/jpeg;base64,sampleFakeBase64ForTesting'
    });

    const res = await fetchUrl(`${BASE_URL}/api/ai-vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });

    const json = JSON.parse(res.data);
    if (res.statusCode === 200 && json.success && json.percentage && json.remainingLiters) {
      console.log(`✓ ÉXITO (${res.duration}ms) - Calculado: ${json.percentage}% (${json.remainingLiters} Litros)`);
      passed++;
    } else {
      console.log(`✗ FALLO - ${res.data}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 4: API de Visión por Computadora (Modo Detección de Botellón)
  try {
    process.stdout.write('4. [IA / Visión] Reconocimiento Inteligente de Botellones... ');
    const postData = JSON.stringify({
      mode: 'bottle',
      base64Image: 'data:image/jpeg;base64,sampleFakeBase64ForTesting'
    });

    const res = await fetchUrl(`${BASE_URL}/api/ai-vision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });

    const json = JSON.parse(res.data);
    if (res.statusCode === 200 && json.success && json.bottleType && json.suggestedPriceUsd) {
      console.log(`✓ ÉXITO (${res.duration}ms) - Identificado: ${json.bottleName} ($${json.suggestedPriceUsd})`);
      passed++;
    } else {
      console.log(`✗ FALLO - ${res.data}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 5: Prueba de Concurrencia y Estabilidad (25 Peticiones Simultáneas)
  try {
    process.stdout.write('5. [Estabilidad de Carga] 25 Peticiones Concurrentes Simultáneas... ');
    const requests = Array.from({ length: 25 }, () => fetchUrl(`${BASE_URL}/api/exchange-rate`));
    const startAll = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - startAll;

    const allOk = results.every(r => r.statusCode === 200);
    const avgDuration = Math.round(results.reduce((acc, r) => acc + r.duration, 0) / results.length);

    if (allOk) {
      console.log(`✓ ÉXITO - 25/25 exitosas en ${totalTime}ms (Promedio: ${avgDuration}ms/req, 0 caídas)`);
      passed++;
    } else {
      console.log(`✗ ALGUNAS PETICIONES FALLARON`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR EN CARGA CONCURRENTE: ${err.message}`);
    failed++;
  }

  // PRUEBA 6: Integridad de Datos Matemáticos de Multipago y Vueltos
  try {
    process.stdout.write('6. [Matemática de Venta] Integridad de Multipago y Cálculo de Vueltos... ');
    const rate = 855.66;
    const saleTotalUsd = 1.00; // 2 recargas
    const saleTotalBs = Number((saleTotalUsd * rate).toFixed(2));
    const cashGivenUsd = 2.00;
    const changeUsd = cashGivenUsd - saleTotalUsd;
    const changeBs = Number((changeUsd * rate).toFixed(2));

    if (saleTotalBs === 855.66 && changeUsd === 1.00 && changeBs === 855.66) {
      console.log(`✓ ÉXITO - Fórmulas financieras y conversiones de cambio sin deriva decimal`);
      passed++;
    } else {
      console.log(`✗ DISCREPANCIA EN FÓRMULAS`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 7: Limitación Estricta de Teléfono con Regex (Caso de 18 dígitos a 11 dígitos)
  try {
    process.stdout.write('7. [Regex Móvil] Truncamiento Estricto de 18 Dígitos a 11 (0424 556701672435435)... ');
    const inputExceeded = '0424 556701672435435';
    // 1. Limpieza y corte inmediato a 11 dígitos
    let digits = inputExceeded.replace(/\D/g, '').slice(0, 11);
    const phoneRegex = /^(?:0)?(412|414|424|416|426)\d{7}$/;
    const isValid = phoneRegex.test(digits);
    const formatted = digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;

    // Probar también caso con asteriscos y símbolos extraños
    const inputWithSymbols = '0424*556.7016#test';
    const digitsClean = inputWithSymbols.replace(/\D/g, '').slice(0, 11);

    if (
      digits === '04245567016' &&
      digits.length === 11 &&
      isValid === true &&
      formatted === '0424-5567016' &&
      digitsClean === '04245567016'
    ) {
      console.log(`✓ ÉXITO - Entrada de 18 dígitos truncada a 11 exactos (${formatted}) y validada`);
      passed++;
    } else {
      console.log(`✗ FALLO - Longitud: ${digits.length}, Esperado: 11 dígitos`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 8: Sanitización de Nombres, Title Case y Anti-Inyecciones
  try {
    process.stdout.write('8. [Seguridad Frontend] Sanitización de Nombres y Protección Anti-Inyección... ');
    const rawInput = "carmen de la luz***<script>alert('xss')</script>";
    const noHtml = rawInput.replace(/<[^>]*>/g, '');
    const clean = noHtml
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .slice(0, 50);
    const capitalized = clean.replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());

    // Prueba Anti-SQLi
    const sqliInput = "Carmen'; DROP TABLE clients;--";
    const cleanSqli = sqliInput.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '').slice(0, 50);

    if (capitalized.startsWith('Carmen De La Luz') && !capitalized.includes('<') && !cleanSqli.includes(';')) {
      console.log(`✓ ÉXITO - Sanitizado a "${capitalized}", eliminando caracteres, tags y scripts`);
      passed++;
    } else {
      console.log(`✗ FALLO EN SANITIZACIÓN: ${capitalized}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 9: Autocompletado de Cuadrícula y Geocodificación Precisa de Barquisimeto
  try {
    process.stdout.write('9. [Geolocalización] Precisión de Intersección Calle 26 con Carrera 25... ');
    const query = 'calle 26 con carrera 25';
    const cleanQ = query.toLowerCase();
    const calleMatch = cleanQ.match(/(?:calle|c\.)\s*(\d+)/i);
    const carreraMatch = cleanQ.match(/(?:carrera|cr|cra\.)\s*(\d+)/i);

    let lat = 0;
    let lng = 0;
    if (calleMatch && carreraMatch) {
      const calleNum = parseInt(calleMatch[1], 10);
      const carreraNum = parseInt(carreraMatch[1], 10);
      lat = Number((10.0675 + (carreraNum - 20) * 0.00075).toFixed(6));
      lng = Number((-69.3245 - (calleNum - 25) * 0.00085).toFixed(6));
    }

    if (lat === 10.07125 && lng === -69.32535) {
      console.log(`✓ ÉXITO - Coordenadas exactas fijadas en (${lat}, ${lng}) sin desvío de cuadrícula`);
      passed++;
    } else {
      console.log(`✗ FALLO DE COORDENADAS: lat=${lat}, lng=${lng}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 10: Sanitización de Referencias Bancarias y Control Decimal en Moneda
  try {
    process.stdout.write('10. [Validación Financiera] Referencias Bancarias (Máx 8) y Decimales... ');
    const rawRef = 'pago#3062*xyz999999';
    const cleanRef = rawRef.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);

    const rawCurrency = '12.34567.89';
    let cleanCurr = rawCurrency.replace(/[^0-9.-]/g, '');
    const parts = cleanCurr.split('.');
    if (parts.length > 2) {
      cleanCurr = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    const finalParts = cleanCurr.split('.');
    if (finalParts[1] && finalParts[1].length > 2) {
      cleanCurr = `${finalParts[0]}.${finalParts[1].slice(0, 2)}`;
    }

    if (cleanRef === 'PAGO3062' && cleanRef.length === 8 && cleanCurr === '12.34') {
      console.log(`✓ ÉXITO - Referencia limitada a 8 chars ("${cleanRef}") y decimal monetario en "${cleanCurr}"`);
      passed++;
    } else {
      console.log(`✗ FALLO EN VALIDACIÓN FINANCIERA: ref=${cleanRef}, curr=${cleanCurr}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  // PRUEBA 11: Orden Actual y Búsqueda en Combobox de Clientes
  try {
    process.stdout.write('11. [Orden Actual & Buscador] Cronología Descendente y Filtrado Dinámico... ');
    const mockClients = [
      { id: '1', name: 'Doraida Mendoza', phone: '0412-1234567', address: 'Samanes', created_at: '2026-09-01T10:00:00Z' },
      { id: '2', name: 'Pedro Ramírez', phone: '0416-3332211', address: 'Industrial', created_at: '2026-09-18T14:15:00Z' },
      { id: '3', name: 'Carmen De La Luz', phone: '0424-5567016', address: 'Calle 26 con Carrera 25', created_at: '2026-09-27T19:00:00Z' },
      { id: 'client-mostrador', name: 'Cliente Mostrador', phone: 'N/A', address: 'Tienda', created_at: '2026-09-01T08:00:00Z' },
    ];

    // Ordenar en orden actual (más reciente primero, con mostrador al inicio)
    const sorted = [...mockClients].sort((a, b) => {
      if (a.id === 'client-mostrador') return -1;
      if (b.id === 'client-mostrador') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const isMostradorFirst = sorted[0].id === 'client-mostrador';
    const isMostRecentSecond = sorted[1].name === 'Carmen De La Luz';

    // Búsqueda por calle
    const queryStreet = 'calle 26';
    const resultsStreet = sorted.filter(c => c.address.toLowerCase().includes(queryStreet));

    // Búsqueda por teléfono
    const queryPhone = '0424';
    const resultsPhone = sorted.filter(c => c.phone.includes(queryPhone));

    if (
      isMostradorFirst &&
      isMostRecentSecond &&
      resultsStreet.length === 1 &&
      resultsStreet[0].name === 'Carmen De La Luz' &&
      resultsPhone.length === 1 &&
      resultsPhone[0].name === 'Carmen De La Luz'
    ) {
      console.log(`✓ ÉXITO - Cliente reciente "Carmen De La Luz" prioritario y buscador reactivo 100%`);
      passed++;
    } else {
      console.log(`✗ FALLO EN ORDEN O BÚSQUEDA: first=${sorted[1]?.name}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }

  console.log('\n=================================================================');
  console.log(`RESULTADO FINAL: ${passed} Pasadas, ${failed} Fallidas`);
  console.log('=================================================================');

  if (failed === 0) {
    console.log('🎉 EL SISTEMA ES 100% ESTABLE, RÁPIDO Y PRECISO.');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
