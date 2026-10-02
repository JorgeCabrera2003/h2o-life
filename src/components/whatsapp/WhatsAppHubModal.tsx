'use client';

import React, { useState, useMemo } from 'react';
import { useH2OStore } from '@/lib/store';
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Share2,
  Users,
  Smartphone,
  Bot,
  DollarSign,
  Droplet,
  Shield,
  FileText,
  CreditCard,
  MapPin,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  generateCatalogWhatsAppMessage,
  generateExecutiveReportWhatsAppMessage,
  generateCashClosureWhatsAppMessage,
  openWhatsAppChat,
  getWhatsAppShareUrl,
  cleanPhoneNumber,
  OFFICIAL_CONTACTS,
  BOT_COMMANDS,
} from '@/lib/whatsapp';

interface WhatsAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'catalog' | 'admin' | 'bot' | 'pago';
}

export function WhatsAppHubModal({ isOpen, onClose, defaultTab = 'catalog' }: WhatsAppHubModalProps) {
  const { products, exchangeRate, systemSettings, sales, tanks, cashClosures, currentUser } = useH2OStore();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'admin' | 'bot' | 'pago'>(defaultTab);
  const [copiedText, setCopiedText] = useState(false);
  const [customPhone, setCustomPhone] = useState('');
  const [simulatedBotResponse, setSimulatedBotResponse] = useState<string | null>(null);
  const [simulatedCommand, setSimulatedCommand] = useState<string>('!catalogo');
  const [pagoMontoUsd, setPagoMontoUsd] = useState('1.00');

  // Catálogo generado al día
  const catalogMessage = useMemo(() => {
    return generateCatalogWhatsAppMessage(products, exchangeRate, systemSettings);
  }, [products, exchangeRate, systemSettings]);

  // Reporte ejecutivo para Freyeliz
  const executiveReportMessage = useMemo(() => {
    return generateExecutiveReportWhatsAppMessage(sales, tanks, exchangeRate, systemSettings);
  }, [sales, tanks, exchangeRate, systemSettings]);

  // Cierre para Jorge
  const lastClosureMessage = useMemo(() => {
    if (cashClosures.length > 0) {
      return generateCashClosureWhatsAppMessage(cashClosures[0], exchangeRate);
    }
    return `🔒 *H2O LIFE - PRE-CIERRE DE CAJA*\n👨‍💼 *Para:* TSU Jorge Cabrera\n👤 *Operador:* ${currentUser.name}\n💵 *Tasa BCV:* Bs. ${exchangeRate.rate.toFixed(2)}\n• Ventas Registradas: ${sales.length}\n• Total USD: $${sales.reduce((acc, s) => acc + s.total_usd, 0).toFixed(2)}\n\n_Realiza un cierre oficial en el POS para el desglose completo de arqueo._`;
  }, [cashClosures, exchangeRate, currentUser, sales]);

  // Plantilla de Pago Móvil
  const pagoMovilMessage = useMemo(() => {
    const usd = parseFloat(pagoMontoUsd) || 0;
    const bs = (usd * exchangeRate.rate).toFixed(2);
    return `💳 *DATOS DE PAGO MÓVIL - H2O LIFE*\n━━━━━━━━━━━━━━━━━━━━━━\n• *Banco:* Banesco (0134) o Banco de Venezuela (0102)\n• *Teléfono:* 0424-5658068\n• *Cédula / RIF:* J-50982341-2\n\n💵 *Monto en Dólares:* $${usd.toFixed(2)} USD\n🇻🇪 *Monto Exacto en Bolívares:* Bs. ${Number(bs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}\n*(Calculado a Tasa Oficial BCV: Bs. ${exchangeRate.rate.toFixed(2)})*\n\nPor favor envía captura o los últimos 4 dígitos del número de referencia al realizar el pago. ¡Gracias!`;
  }, [pagoMontoUsd, exchangeRate]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendToOfficial = (contactKey: 'freyeliz' | 'karla' | 'jorge', text: string) => {
    const contact = OFFICIAL_CONTACTS[contactKey];
    openWhatsAppChat(contact.phone, text);
  };

  const handleSendToCustom = (text: string) => {
    if (!customPhone.trim()) {
      alert('Por favor ingresa un número de teléfono válido.');
      return;
    }
    openWhatsAppChat(customPhone, text);
  };

  const handleShareGeneral = (text: string) => {
    const url = getWhatsAppShareUrl(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Simulación de auto-respuesta del bot
  const handleTestBotCommand = (cmd: string) => {
    setSimulatedCommand(cmd);
    if (cmd === '!catalogo' || cmd === '1') {
      setSimulatedBotResponse(catalogMessage);
    } else if (cmd === '!recarga' || cmd === '2') {
      const recarga = products.find(p => p.id === 'prod-recarga-20' || p.category === 'agua');
      const priceUsd = recarga ? recarga.price_usd : 0.50;
      const priceBs = (priceUsd * exchangeRate.rate).toFixed(2);
      setSimulatedBotResponse(
        `💧 *RECARGA DE AGUA PURIFICADA 20L / 18L*\nPrecio: *$${priceUsd.toFixed(2)} USD* (Bs. ${Number(priceBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n\nProceso de purificación:\n✔ Filtros de sedimentos y carbón activado\n✔ Membranas de Ósmosis Inversa\n✔ Desinfección con Ozono bactericida\n✔ Lámpara de Luz Ultravioleta UV\n\n📍 Calle 28 con Carrera 25, Barquisimeto\nEscribe *!pagos* para datos de pago o *!menu* para volver.`
      );
    } else if (cmd === '!ubicacion' || cmd === '3') {
      setSimulatedBotResponse(
        `📍 *UBICACIÓN Y HORARIOS H2O LIFE*\n\n🏪 *Dirección:* Calle 28 con Carrera 25, Barquisimeto, Estado Lara.\n⏰ *Horario:* Lunes a Sábado de 7:30 AM a 6:00 PM | Domingos de 8:00 AM a 2:00 PM\n🗺 *Google Maps:* https://maps.google.com/?q=10.07125,-69.32705\n\n🛵 Disponemos de servicio de Delivery Express en Barquisimeto.`
      );
    } else if (cmd === '!pagos' || cmd === '4') {
      setSimulatedBotResponse(pagoMovilMessage);
    } else if (cmd === '!humano' || cmd === '5') {
      setSimulatedBotResponse(
        `👩‍💼 *ATENCIÓN PERSONALIZADA*\nUn operador de nuestro equipo te atenderá de inmediato:\n• Administradora (Freyeliz): +58 424-5658068\n• Caja / Mostrador (Karla): +58 424-5717589\n\nPor favor déjanos tu consulta o pedido aquí.`
      );
    } else {
      setSimulatedBotResponse(
        `🤖 *MENÚ PRINCIPAL H2O LIFE*\n¡Hola! Bienvenido a nuestra línea de atención automatizada. Responde con el número de tu opción:\n\n1️⃣ *!catalogo* - Lista completa con precios al día\n2️⃣ *!recarga* - Precios y proceso de recarga 20L\n3️⃣ *!ubicacion* - Cómo llegar a Calle 28 con Cra 25\n4️⃣ *!pagos* - Cuentas para Pago Móvil\n5️⃣ *!humano* - Hablar con Freyeliz o Karla`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-sky-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  WhatsApp Hub & Automatización
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  100% Gratis
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Catálogo con precios al día, reportes administrativos y bot inteligente sin costo de API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pestañas de Navegación del Hub */}
        <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-2xl mt-3 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📋 Catálogo al Día</span>
          </button>

          <button
            onClick={() => setActiveSubTab('admin')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeSubTab === 'admin'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>📊 Reportes Admin</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bot')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeSubTab === 'bot'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>🤖 Bot Automático</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pago')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeSubTab === 'pago'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>💳 Cobro / Pago</span>
          </button>
        </div>

        {/* Contenido Dinámico con Scroll */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4">
          {/* ======================================================== */}
          {/* TAB 1: CATÁLOGO COMPLETO CON PRECIOS AL DÍA              */}
          {/* ======================================================== */}
          {activeSubTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">
                    Catálogo sincronizado en vivo a Tasa BCV: <strong>Bs. {exchangeRate.rate.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleCopy(catalogMessage)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-1 pressable cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>
                  <button
                    onClick={() => handleShareGeneral(catalogMessage)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs pressable cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>

              {/* Atajos Rápidos de Envío a los Miembros Oficiales */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                  Enviar Catálogo Oficial con 1 Toque a:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSendToOfficial('freyeliz', catalogMessage)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left flex items-center space-x-2 pressable cursor-pointer"
                  >
                    <span className="text-xl">👩‍💼</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900">Freyeliz (Admin)</p>
                      <p className="text-[10px] text-slate-500 font-mono">+58 424-5658068</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendToOfficial('karla', catalogMessage)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left flex items-center space-x-2 pressable cursor-pointer"
                  >
                    <span className="text-xl">👩‍💻</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900">Karla (Caja)</p>
                      <p className="text-[10px] text-slate-500 font-mono">+58 424-5717589</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendToOfficial('jorge', catalogMessage)}
                    className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left flex items-center space-x-2 pressable cursor-pointer"
                  >
                    <span className="text-xl">👨‍💼</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900">TSU Jorge Cabrera</p>
                      <p className="text-[10px] text-slate-500 font-mono">+58 424-5567016</p>
                    </div>
                  </button>
                </div>

                {/* Envío a número personalizado */}
                <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-slate-200/80">
                  <input
                    type="tel"
                    value={customPhone}
                    onChange={e => setCustomPhone(e.target.value)}
                    placeholder="Escribir número de cliente (ej: 0412 1234567)"
                    className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl font-bold"
                  />
                  <button
                    onClick={() => handleSendToCustom(catalogMessage)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 pressable cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>

              {/* Previsualización del Formato WhatsApp */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Vista Previa del Mensaje para WhatsApp:
                </p>
                <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800 leading-relaxed selection:bg-emerald-900 selection:text-white">
                  {catalogMessage}
                </pre>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REPORTES ADMINISTRATIVOS (Freyeliz & Jorge)        */}
          {/* ======================================================== */}
          {activeSubTab === 'admin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tarjeta Freyeliz */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">👩‍💼</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Reporte Ejecutivo de Ventas</h4>
                        <p className="text-[10px] text-slate-500">Para Freyeliz: +58 424-5658068</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Envía resumen de recaudación en $ y Bs, métodos de pago, recargas de 20L y estado de los tanques de almacenamiento.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopy(executiveReportMessage)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 pressable cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSendToOfficial('freyeliz', executiveReportMessage)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs pressable cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar a Freyeliz</span>
                    </button>
                  </div>
                </div>

                {/* Tarjeta Jorge */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">👨‍💼</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Arqueo y Cierre de Caja</h4>
                        <p className="text-[10px] text-slate-500">Para TSU Jorge: +58 424-5567016</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Envía desglose de fondos físicos (Efectivo $, Bs) y bancarios (Punto de Venta, Pago Móvil) para auditoría financiera.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopy(lastClosureMessage)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1 pressable cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSendToOfficial('jorge', lastClosureMessage)}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs pressable cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar a Jorge</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista previa de texto de reporte */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Texto del Reporte Ejecutivo para Freyeliz:
                </p>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800 leading-relaxed">
                  {executiveReportMessage}
                </pre>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BOT AUTOMATIZADO GRATUITO (Simulador y Comandos)  */}
          {/* ======================================================== */}
          {activeSubTab === 'bot' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 rounded-2xl border border-emerald-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Arquitectura de Bot Gratuito para WhatsApp (Cero Costos de Meta)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A diferencia de la API oficial de Meta que cobra por mensaje o conversación iniciada, este sistema utiliza automatización gratuita basada en <strong>Node.js y Web WhatsApp</strong> (mediante el script <code>scripts/whatsapp-bot.js</code>). El bot lee la tasa BCV y tu catálogo en tiempo real.
                </p>
              </div>

              {/* Comandos del Bot */}
              <div>
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                  Prueba los Comandos del Bot en Vivo:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(BOT_COMMANDS).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => handleTestBotCommand(item.command)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        simulatedCommand === item.command
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <p className="font-mono text-xs font-black">{item.command}</p>
                      <p className={`text-[10px] ${simulatedCommand === item.command ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {item.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulador de Chat del Bot */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Respuesta Automática del Bot para &quot;{simulatedCommand}&quot;:</span>
                  <button
                    onClick={() => handleCopy(simulatedBotResponse || catalogMessage)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold lowercase flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Respuesta</span>
                  </button>
                </p>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-52 overflow-y-auto border border-slate-800 leading-relaxed">
                  {simulatedBotResponse || catalogMessage}
                </pre>
              </div>

              {/* Guía para ejecutar en segundo plano */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center space-x-2 font-bold text-slate-800 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cómo dejar el Bot funcionando en segundo plano:</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Para que responda solo las 24 horas a los clientes que escriban al WhatsApp de la tienda, solo debes ejecutar en tu terminal:
                </p>
                <code className="block p-2 bg-slate-800 text-cyan-300 rounded-xl font-mono text-[11px] select-all">
                  node scripts/whatsapp-bot.js
                </code>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: COBRO RÁPIDO & DATOS DE PAGO MÓVIL                */}
          {/* ======================================================== */}
          {activeSubTab === 'pago' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Monto a Cobrar al Cliente en USD ($):
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.10"
                      value={pagoMontoUsd}
                      onChange={e => setPagoMontoUsd(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-sm font-black bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                    <span className="text-[10px] text-emerald-700 block font-bold">Total en Bolívares:</span>
                    <span className="text-xs font-black text-emerald-900">
                      Bs. {((parseFloat(pagoMontoUsd) || 0) * exchangeRate.rate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(pagoMovilMessage)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 pressable cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? '¡Copiado!' : 'Copiar Datos de Pago'}</span>
                  </button>
                  <button
                    onClick={() => handleShareGeneral(pagoMovilMessage)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs pressable cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Texto Formateado para el Cliente:
                </p>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800 leading-relaxed">
                  {pagoMovilMessage}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400">
            H2O Life • Sede Calle 28 c/ 25 • RIF J-50982341-2
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold pressable cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
