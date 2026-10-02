/**
 * Utilidades de validación estricta con Regex y formateo de datos para H2O Life POS
 * Cumple con estándares de seguridad, límites de longitud y contexto geográfico de Venezuela.
 */

// Prefijos telefónicos móviles de Venezuela
export const VENEZUELAN_OPERATORS = [
  { code: '0412', name: 'Digitel', color: 'text-red-600' },
  { code: '0414', name: 'Movistar', color: 'text-sky-600' },
  { code: '0424', name: 'Movistar', color: 'text-sky-600' },
  { code: '0416', name: 'Movilnet', color: 'text-orange-600' },
  { code: '0426', name: 'Movilnet', color: 'text-orange-600' },
];

export const COUNTRY_CODES = [
  { code: '+58', country: 'Venezuela 🇻🇪' },
  { code: '+57', country: 'Colombia 🇨🇴' },
  { code: '+1', country: 'USA / Canadá 🇺🇸' },
  { code: '+34', country: 'España 🇪🇸' },
  { code: '+56', country: 'Chile 🇨🇱' },
];

// Chips de referencias rápidas para delivery
export const REFERENCE_POINT_CHIPS = [
  'Casa',
  'Portón azul',
  'Frente a la panadería',
  'Al lado de la farmacia',
  'Edificio PB',
  'Local comercial a pie de calle',
];

/**
 * Capitaliza cada palabra a Title Case y remueve símbolos inválidos
 * (ej. "carmen de la luz" -> "Carmen De La Luz")
 */
export function sanitizeAndCapitalizeName(text: string): string {
  if (!text) return '';
  // 1. Remover etiquetas HTML completas (ej. <script>...</script>)
  const noHtml = text.replace(/<[^>]*>/g, '');
  // 2. Permitir únicamente letras, acentos, ñ, espacios y guiones simples. Max 50 caracteres.
  const clean = noHtml
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 50);

  return clean.replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}

/**
 * Sanitiza y limita estrictamente el número telefónico venezolano
 * Formato venezolano: 04XX-XXXXXXX (11 dígitos con el 0 inicial) o 4XX-XXXXXXX (10 dígitos).
 * Máximo estricto: 11 dígitos numéricos. NO PERMITE más de 11 números bajo ninguna circunstancia.
 */
export function sanitizeVenezuelanPhoneInput(input: string): {
  rawDigits: string;
  formatted: string;
  isValid: boolean;
} {
  if (!input) {
    return { rawDigits: '', formatted: '', isValid: false };
  }

  // 1. Extraer solo números y truncar inmediatamente a un máximo de 11 dígitos
  let digits = input.replace(/\D/g, '').slice(0, 11);

  // 2. Si empieza con 58 (código país pegado), removerlo para aislar el número local
  if (digits.startsWith('58') && digits.length > 2) {
    digits = digits.slice(2).slice(0, 11);
  }

  // 3. Formatear visualmente según se escribe: ej. "0424-5567016" o "0424 556 7016"
  let formatted = digits;
  if (digits.length > 4) {
    formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  // 4. Validación regex estricta:
  // - Debe empezar con un operador válido (0412, 0414, 0424, 0416, 0426 o 412, 414, 424, 416, 426)
  // - Debe tener exactamente 11 dígitos (con 0 inicial) o 10 dígitos (sin 0)
  const phoneRegex = /^(?:0)?(412|414|424|416|426)\d{7}$/;
  const isValid = phoneRegex.test(digits);

  return {
    rawDigits: digits,
    formatted,
    isValid,
  };
}

/**
 * Resuelve las coordenadas geográficas exactas en Barquisimeto para intersecciones de cuadrícula
 * (ej. Calle 26 con Carrera 25)
 */
export function resolveBarquisimetoCoordinates(query: string): { lat: number; lng: number } | null {
  if (!query) return null;
  const clean = query.toLowerCase();

  // Detección de Calle y Carrera
  const calleMatch = clean.match(/(?:calle|c\.)\s*(\d+)/i);
  const carreraMatch = clean.match(/(?:carrera|cr|cra\.)\s*(\d+)/i);

  if (calleMatch && carreraMatch) {
    const calleNum = parseInt(calleMatch[1], 10);
    const carreraNum = parseInt(carreraMatch[1], 10);

    // Cuadrícula central de Barquisimeto:
    // Base: Calle 25 con Carrera 20 (Av. 20) = lat 10.0675, lng -69.3245
    // Carrera aumenta hacia el norte (+latitud) ~0.00075 por carrera
    // Calle aumenta hacia el oeste (-longitud) ~0.00085 por calle
    const baseLat = 10.0675;
    const baseLng = -69.3245;

    const lat = Number((baseLat + (carreraNum - 20) * 0.00075).toFixed(6));
    const lng = Number((baseLng - (calleNum - 25) * 0.00085).toFixed(6));

    return { lat, lng };
  }

  // Puntos de referencia conocidos en Barquisimeto
  if (clean.includes('barquicenter')) {
    return { lat: 10.0690, lng: -69.3245 };
  }
  if (clean.includes('concha acústica') || clean.includes('concha acustica')) {
    return { lat: 10.0655, lng: -69.3220 };
  }
  if (clean.includes('catedral')) {
    return { lat: 10.0665, lng: -69.3300 };
  }
  if (clean.includes('obelisco')) {
    return { lat: 10.0740, lng: -69.3560 };
  }
  if (clean.includes('samanes')) {
    return { lat: 10.0520, lng: -69.3350 };
  }
  if (clean.includes('esmeralda')) {
    return { lat: 10.0780, lng: -69.3080 };
  }

  return null;
}

/**
 * Ubicación oficial de la Sede Principal H2O Life
 * Calle 28 con Carrera 25, Barquisimeto, Estado Lara
 */
export const H2O_STORE_LOCATION = {
  name: 'H2O Life (Sede Principal)',
  address: 'Calle 28 con Carrera 25, Barquisimeto',
  lat: 10.07125,
  lng: -69.32705,
};

/**
 * Calcula la distancia en la cuadrícula urbana y el tiempo estimado de entrega
 * desde la sede principal (Calle 28 con Carrera 25) hasta el destino del cliente.
 */
export function calculateDeliveryRouteInfo(
  destLat: number,
  destLng: number,
  originLat: number = H2O_STORE_LOCATION.lat,
  originLng: number = H2O_STORE_LOCATION.lng
): {
  distanceKm: number;
  formattedDistance: string;
  estimatedMinutes: number;
  googleMapsDirectionsUrl: string;
  wazeDirectionsUrl: string;
} {
  // Fórmula de Haversine
  const R = 6371; // Radio de la Tierra en km
  const dLat = (destLat - originLat) * (Math.PI / 180);
  const dLng = (destLng - originLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat * (Math.PI / 180)) *
      Math.cos(destLat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  // En la retícula urbana de Barquisimeto (calles y carreras), la distancia real por manzanas es ~1.28x
  const streetDistanceKm = Number((straightLineDistance * 1.28).toFixed(2));
  // Tiempo promedio en vehículo/moto de reparto (25 km/h + 2 min de preparación)
  const estimatedMinutes = Math.max(3, Math.round((streetDistanceKm / 25) * 60) + 2);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  const wazeDirectionsUrl = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;

  return {
    distanceKm: streetDistanceKm,
    formattedDistance: streetDistanceKm < 1 ? `${Math.round(streetDistanceKm * 1000)} m` : `${streetDistanceKm} km`,
    estimatedMinutes,
    googleMapsDirectionsUrl,
    wazeDirectionsUrl,
  };
}

/**
 * Generador inteligente de sugerencias dinámicas de direcciones para Venezuela
 * Maneja cuadrículas de Calles y Carreras (como Barquisimeto, Lara) y sectores.
 */
export function generateSmartAddressSuggestions(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return [
      'Calle 26 con Carrera 25, Barquisimeto',
      'Calle 25 con Carrera 19, Centro',
      'Av. 20 con Calle 26, Centro Comercial',
      'Av. Bolívar, Zona Comercial',
      'Urb. La Esmeralda, Manzana 4',
      'Callejón Industrial, Galpón #3',
    ];
  }

  const clean = query.trim().toLowerCase();
  const results: string[] = [];

  const calleMatch = clean.match(/(?:calle|c\.)\s*(\d+)/i);
  const carreraMatch = clean.match(/(?:carrera|cr|cra\.)\s*(\d+)/i);

  // Si especificó tanto Calle como Carrera (ej. "calle 26 con carrera 25")
  if (calleMatch && carreraMatch) {
    const calleNum = calleMatch[1];
    const carreraNum = carreraMatch[1];
    results.push(`Calle ${calleNum} con Carrera ${carreraNum}, Barquisimeto`);
    results.push(`Calle ${calleNum} entre Carreras ${carreraNum} y ${parseInt(carreraNum, 10) + 1}, Barquisimeto`);
    results.push(`Carrera ${carreraNum} con Calle ${calleNum}, Barquisimeto`);
  }

  // 1. Detección de "Calle X" (ej. "calle 26" o "c. 26")
  if (calleMatch) {
    const calleNum = calleMatch[1];
    // Generar intersecciones con carreras típicas de la cuadrícula
    const popularCarreras = ['25', '24', '23', '22', '21', '20', '19', '18', '26', '27'];
    popularCarreras.forEach((cr) => {
      results.push(`Calle ${calleNum} con Carrera ${cr}, Barquisimeto`);
    });
    results.push(`Calle ${calleNum} con Av. 20, Centro`);
    results.push(`Calle ${calleNum} con Av. Venezuela`);
  }

  // 2. Detección de "Carrera X" (ej. "carrera 25" o "cr. 25")
  if (carreraMatch) {
    const carreraNum = carreraMatch[1];
    const popularCalles = ['26', '25', '24', '23', '27', '28', '29', '30', '19'];
    popularCalles.forEach((cl) => {
      results.push(`Carrera ${carreraNum} con Calle ${cl}, Barquisimeto`);
    });
  }

  // 3. Detección de "Avenida"
  if (clean.includes('av') || clean.includes('avenida')) {
    results.push('Av. 20 con Calle 26, Centro Comercial');
    results.push('Av. Venezuela con Calle 25, Centro');
    results.push('Av. Pedro León Torres con Calle 50');
    results.push('Av. Lara con Av. Los Leones');
    results.push('Av. Bolívar, Zona Comercial');
  }

  // 4. Si el usuario escribió un texto genérico o sector
  if (clean.includes('calabaza') || clean.includes('esmeralda') || clean.includes('industrial') || clean.includes('samanes')) {
    results.push(`${query.trim()}, Sector Calabaza`);
    results.push(`${query.trim()}, Urb. La Esmeralda`);
    results.push(`${query.trim()}, Zona Industrial`);
  }

  // Si no hay resultados de patrones, sugerir la consulta formateada
  if (results.length === 0) {
    results.push(`${toTitleCase(query.trim())}, Barquisimeto, Venezuela`);
    results.push(`${toTitleCase(query.trim())}, Sector Central`);
  }

  // Eliminar duplicados y retornar los primeros 6
  return Array.from(new Set(results)).slice(0, 6);
}

/**
 * Sanitiza campos de texto de direcciones evitando inyecciones o caracteres corruptos
 */
export function sanitizeAddressText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>{};"$`]/g, '') // Elimina caracteres peligrosos
    .replace(/\s{2,}/g, ' ')
    .slice(0, 120);
}

/**
 * Sanitiza números monetarios positivos o negativos con límite de 2 decimales y longitud
 */
export function sanitizeCurrencyInput(value: string): string {
  if (!value) return '';
  let clean = value.replace(/[^0-9.-]/g, '');
  // Permitir el signo negativo solo al inicio
  if (clean.lastIndexOf('-') > 0) {
    clean = clean.replace(/-/g, '');
  }
  // Permitir un solo punto
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  // Limitar decimales a 2
  if (parts[1] && parts[1].length > 2) {
    clean = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return clean.slice(0, 10);
}

/**
 * Sanitiza referencias bancarias (4 a 8 caracteres alfanuméricos)
 */
export function sanitizeBankReference(value: string): string {
  if (!value) return '';
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Validación de seguridad anti-spam por técnica Honeypot y detección de tiempo de llenado
 */
export function validateAntiSpamSubmission({
  honeypotValue,
  formRenderTimeMs,
  minHumanDurationMs = 500,
}: {
  honeypotValue: string;
  formRenderTimeMs?: number;
  minHumanDurationMs?: number;
}): { isSpam: boolean; reason?: string } {
  // 1. Verificación de Honeypot: los humanos nunca ven ni llenan este campo oculto
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return {
      isSpam: true,
      reason: 'Honeypot trap detectado (campo oculto completado por bot automatizado)',
    };
  }

  // 2. Verificación de velocidad inhumana: un formulario completado en menos de 500ms es un script
  if (formRenderTimeMs && Date.now() - formRenderTimeMs < minHumanDurationMs) {
    return {
      isSpam: true,
      reason: 'Envío instantáneo detectado (velocidad sobrehumana de formulario)',
    };
  }

  return { isSpam: false };
}

