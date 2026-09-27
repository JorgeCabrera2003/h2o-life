/**
 * Utilidades de validación con Regex y formateo de datos para H2O Life POS
 * Adaptado al contexto venezolano (operadoras móviles, RIF, monedas y capitalización)
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

// Direcciones y referencias populares sugeridas para delivery de agua
export const POPULAR_ADDRESS_SUGGESTIONS = [
  'Calle Los Samanes, Sector Central',
  'Av. Bolívar, Zona Comercial',
  'Urb. La Esmeralda, Manzana 4',
  'Callejón Industrial, Galpón #3',
  'Calle Las Flores, Residencias El Ávila',
  'Av. Principal Los Caobos, Edf. Doña Rosa',
  'Sector La Quebradita, Casa #18',
  'Av. Universidad, Cerca de la Plaza Bolívar',
  'Urb. Santa Mónica, Calle B, Casa #12',
  'Calle 25 con Carrera 19, Casco Histórico',
];

export const REFERENCE_POINT_CHIPS = [
  'Frente a la panadería',
  'Casa de portón azul',
  'Al lado de la farmacia',
  'Edificio planta baja',
  'Detrás de la estación de servicio',
  'Local comercial a pie de calle',
];

/**
 * Capitaliza cada palabra a Title Case (ej. "carmen de la luz" -> "Carmen De La Luz")
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}

/**
 * Limpia y formatea un número de teléfono venezolano
 * Ej: "04121234567" -> "+58 412 1234567"
 */
export function formatVenezuelanPhone(input: string, countryCode = '+58'): string {
  if (!input) return '';
  // Eliminar todo lo que no sea número
  const digits = input.replace(/\D/g, '');
  
  // Si empieza con 58, removerlo temporalmente
  let local = digits;
  if (local.startsWith('58')) {
    local = local.slice(2);
  }
  // Si empieza con 0, removerlo para estandarizar
  if (local.startsWith('0')) {
    local = local.slice(1);
  }

  if (local.length === 0) return countryCode;
  if (local.length <= 3) return `${countryCode} ${local}`;
  if (local.length <= 6) return `${countryCode} ${local.slice(0, 3)} ${local.slice(3)}`;
  return `${countryCode} ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
}

/**
 * Regex para validar teléfono venezolano
 * Formato internacional: +58 412 1234567 o local 0412-1234567
 */
export const PHONE_REGEX = /^(?:\+58|58|0)?(?:412|414|424|416|426)\d{7}$/;

export function isValidVenezuelanPhone(phone: string): boolean {
  if (!phone || phone === 'N/A') return true;
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  return PHONE_REGEX.test(clean);
}

/**
 * Regex para validar referencias bancarias (4 a 8 dígitos/alfanumérico)
 */
export const BANK_REF_REGEX = /^[a-zA-Z0-9]{4,8}$/;

export function isValidBankRef(ref: string): boolean {
  if (!ref) return false;
  return BANK_REF_REGEX.test(ref.trim());
}

/**
 * Regex para validar números monetarios positivos con hasta 2 decimales
 */
export const CURRENCY_REGEX = /^\d+(\.\d{1,2})?$/;

export function isValidCurrency(amount: string | number): boolean {
  if (amount === '' || amount === undefined || amount === null) return false;
  return CURRENCY_REGEX.test(String(amount));
}

/**
 * Formatea un número decimal de manera segura
 */
export function sanitizeDecimalInput(value: string): string {
  // Permite solo dígitos y un solo punto decimal
  const sanitized = value.replace(/[^0-9.]/g, '');
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return sanitized;
}
