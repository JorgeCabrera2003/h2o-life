'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import {
  Settings,
  Bell,
  Smartphone,
  Shield,
  Database,
  CheckCircle,
  Copy,
  Save,
  MessageCircle,
  Sliders,
  FileText,
  Cookie,
  Activity,
  Download,
  Trash2,
  ExternalLink,
  MapPin,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { GoogleBusinessBadge } from '@/components/common/GoogleBusinessBadge';
import { analytics, TelemetryEvent } from '@/lib/analytics';

export function SettingsModule() {
  const { systemSettings, updateSystemSettings, loadDemoData, clearDemoData, isDemoModeActive, currentUser } = useH2OStore();

  const [businessName, setBusinessName] = useState(systemSettings.business_name);
  const [businessRif, setBusinessRif] = useState(systemSettings.business_rif);
  const [storeAddress, setStoreAddress] = useState(
    systemSettings.store_address || 'Calle 28 con Carrera 25, Barquisimeto'
  );
  const [freyelizPhone, setFreyelizPhone] = useState(
    systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '+58 424-5658068'
  );
  const [karlaPhone, setKarlaPhone] = useState(
    systemSettings.karla_phone || '+58 424-5717589'
  );
  const [jorgePhone, setJorgePhone] = useState(
    systemSettings.jorge_phone || '+58 424-5567016'
  );
  const [tankLowThreshold, setTankLowThreshold] = useState(systemSettings.tank_low_threshold_pct);
  const [autoNotifySales, setAutoNotifySales] = useState(systemSettings.auto_notify_sales);
  const [autoNotifyTankAlerts, setAutoNotifyTankAlerts] = useState(systemSettings.auto_notify_tank_alerts);
  const [autoNotifyCisterns, setAutoNotifyCisterns] = useState(systemSettings.auto_notify_cisterns);
  const [autoNotifyClosures, setAutoNotifyClosures] = useState(systemSettings.auto_notify_closures);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    setTelemetryEvents(analytics.getStoredEvents());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      business_name: businessName,
      business_rif: businessRif,
      store_address: storeAddress,
      store_lat: 10.07125,
      store_lng: -69.32705,
      freyeliz_phone: freyelizPhone,
      freyeli_phone: freyelizPhone,
      karla_phone: karlaPhone,
      jorge_phone: jorgePhone,
      tank_low_threshold_pct: tankLowThreshold,
      auto_notify_sales: autoNotifySales,
      auto_notify_tank_alerts: autoNotifyTankAlerts,
      auto_notify_cisterns: autoNotifyCisterns,
      auto_notify_closures: autoNotifyClosures,
    });

    analytics.logEvent('settings_updated', 'system', {
      storeAddress,
      tankLowThreshold,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestWhatsAppNotification = (phone: string, roleName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `🔔 *H2O LIFE - PRUEBA DE CONEXIÓN*%0AEsta es una prueba de notificación para la administradora (${roleName}).%0AEl sistema POS está configurado para enviar reportes automáticos de ventas y tanques desde la sede en Calle 28 con Carrera 25.`;
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleExportTelemetry = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetryEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `h2o_telemetry_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearTelemetry = () => {
    if (confirm('¿Deseas vaciar el historial local de eventos de telemetría?')) {
      analytics.clearEvents();
      setTelemetryEvents([]);
    }
  };

  const handleResetCookieConsent = () => {
    localStorage.removeItem('h2o_cookie_consent');
    alert('Preferencia de cookies restablecida. La ventana de consentimiento aparecerá al recargar.');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-40 md:pb-36">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>Configuración General del Sistema</span>
          </h2>
          <p className="text-xs text-slate-500">
            Parámetros administrativos, ubicación de la sede física, números de notificación para Freyeliz y auditoría
          </p>
        </div>

        {savedSuccess && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>¡Configuración guardada!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. FICHA GOOGLE BUSINESS & LOCALIZACIÓN DE LA SEDE */}
        <div className="space-y-2">
          <GoogleBusinessBadge />
        </div>

        {/* 2. NOTIFICACIONES DE WHATSAPP PARA EL EQUIPO (Freyeliz, Karla & Jorge) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Bell className="w-4 h-4 text-sky-600" />
            <span>Canales de Notificación por WhatsApp (Freyeliz, Karla & Jorge)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                WhatsApp de Freyeliz (Administradora Principal):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={freyelizPhone}
                  onChange={e => setFreyelizPhone(e.target.value)}
                  placeholder="+58 424-5658068"
                  className="flex-1 text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTestWhatsAppNotification(freyelizPhone, 'Freyeliz (Admin)')}
                  className="px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1 pressable cursor-pointer min-h-[44px]"
                  title="Enviar mensaje de prueba a Freyeliz"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Notificaciones instantáneas de cada venta realizada y alertas de tanques.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                WhatsApp de Karla (Caja & Mostrador):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={karlaPhone}
                  onChange={e => setKarlaPhone(e.target.value)}
                  placeholder="+58 424-5717589"
                  className="flex-1 text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTestWhatsAppNotification(karlaPhone, 'Karla (Caja)')}
                  className="px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1 pressable cursor-pointer min-h-[44px]"
                  title="Enviar mensaje de prueba a Karla"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Canal de atención y soporte en caja para despachos de mostrador.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                WhatsApp de TSU Jorge Cabrera (Superadmin):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={jorgePhone}
                  onChange={e => setJorgePhone(e.target.value)}
                  placeholder="+58 424-5567016"
                  className="flex-1 text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTestWhatsAppNotification(jorgePhone, 'Jorge (Superadmin)')}
                  className="px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1 pressable cursor-pointer min-h-[44px]"
                  title="Enviar mensaje de prueba a Jorge"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Cierres diarios de caja, auditoría financiera y balances generales.
              </span>
            </div>
          </div>

          {/* Interruptores de Notificaciones */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Notificar a Freyeliz cada venta realizada
                </span>
                <span className="text-[11px] text-slate-400">
                  Genera el mensaje con monto en $ y Bs, cliente y productos vendidos
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoNotifySales}
                onChange={e => setAutoNotifySales(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Alerta automática cuando el tanque esté bajo
                </span>
                <span className="text-[11px] text-slate-400">
                  Avisa cuando el agua caiga por debajo del umbral para pedir camión cisterna
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoNotifyTankAlerts}
                onChange={e => setAutoNotifyTankAlerts(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Notificar descarga de camión cisterna
                </span>
                <span className="text-[11px] text-slate-400">
                  Registra litros recibidos, costo y proveedor de agua
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoNotifyCisterns}
                onChange={e => setAutoNotifyCisterns(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Notificar cierres de turno a Jorge
                </span>
                <span className="text-[11px] text-slate-400">
                  Envía el arqueo de caja con desglose de efectivo, punto y pago móvil
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoNotifyClosures}
                onChange={e => setAutoNotifyClosures(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer accent-sky-600"
              />
            </label>
          </div>
        </div>

        {/* 3. UMBRAL DE TANQUES & ALERTAS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Umbrales de Capacidad y Alertas de Suministro</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800">
                Umbral de Alerta de Tanque Bajo (%):
              </label>
              <span className="text-sm font-black text-amber-600">{tankLowThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={tankLowThreshold}
              onChange={e => setTankLowThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Si el volumen de agua en el tanque es inferior al {tankLowThreshold}%, el sistema activará la alerta visual y sugerirá el pedido de cisterna a Freyeliz.
            </p>
          </div>
        </div>

        {/* 4. DATOS DE LA EMPRESA & SEDE FÍSICA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Datos Fiscales & Sede Principal del Negocio</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Nombre Comercial:</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">RIF / Identificación:</label>
              <input
                type="text"
                value={businessRif}
                onChange={e => setBusinessRif(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Ubicación del Local:</label>
              <input
                type="text"
                value={storeAddress}
                onChange={e => setStoreAddress(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-800"
              />
            </div>
          </div>
        </div>

        {/* 5. GESTIÓN DE BASE DE DATOS: SEMILLA REAL vs. DATOS DE PRUEBA */}
        {hasPermission(currentUser, 'dev') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Gestión de Base de Datos: Semilla Real vs. Datos de Prueba</span>
            </div>
            {isDemoModeActive ? (
              <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 flex items-center space-x-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Modo Demostración Activo</span>
              </span>
            ) : (
              <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center space-x-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Semilla de Producción Limpia</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Para garantizar que las operaciones reales de la tienda física (Calle 28 con Carrera 25) no se mezclen con pruebas, los datos de demostración (ventas simuladas, clientes de prueba como Carlos o María, y gastos de prueba) están <strong>100% aislados</strong> de la semilla de producción.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className={`p-4 rounded-2xl border transition-all ${!isDemoModeActive ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-2 mb-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Semilla de Producción</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Comienza con libros contables limpios en cero, catálogo oficial y cliente de mostrador para las operaciones reales.
              </p>
              <button
                type="button"
                onClick={clearDemoData}
                disabled={!isDemoModeActive}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer min-h-[44px] ${
                  !isDemoModeActive
                    ? 'bg-emerald-600 text-white cursor-default opacity-90'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{!isDemoModeActive ? '✓ Activo (Producción Limpia)' : 'Restablecer a Producción Limpia'}</span>
              </button>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isDemoModeActive ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900">Modo Demostración / Pruebas</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Inyecta ventas simuladas, clientes de prueba (Carlos, María, Pedro) y gastos para evaluar el POS y reportes.
              </p>
              <button
                type="button"
                onClick={loadDemoData}
                disabled={isDemoModeActive}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer min-h-[44px] ${
                  isDemoModeActive
                    ? 'bg-amber-600 text-white cursor-default opacity-90'
                    : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isDemoModeActive ? '✓ Datos de Prueba Activos' : 'Cargar Datos de Prueba (Demo)'}</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* 6. CUMPLIMIENTO LEGAL, PRIVACIDAD & COOKIES (Puntos 1, 2 y 3) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>Cumplimiento Normativo, Legal & Privacidad</span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Documentos oficiales y mecanismos de protección de datos para clientes y usuarios del sistema:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/aviso-legal"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-2xs mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-800">
                  Aviso Legal
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Titularidad, condiciones de uso y marco legal venezolano.
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-600 mt-3 inline-flex items-center space-x-1">
                <span>Leer documento</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/privacidad"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="w-7 h-7 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-2xs mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                  Política de Privacidad
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Protección de datos de clientes, geolocalizaciones y RLS.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-3 inline-flex items-center space-x-1">
                <span>Leer documento</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </Link>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-2xs mb-2">
                  <Cookie className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Consentimiento de Cookies
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Almacenamiento técnico local de sesión, carrito y tasa BCV.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetCookieConsent}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/60 hover:bg-amber-100 py-1 px-2 rounded-lg mt-3 transition-colors cursor-pointer text-left"
              >
                Reconfigurar Cookies
              </button>
            </div>
          </div>
        </div>

        {/* 6. ANALÍTICA & TELEMETRÍA (Punto 19) */}
        {hasPermission(currentUser, 'dev') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Analítica & Telemetría en Tiempo Real</span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleExportTelemetry}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 pressable cursor-pointer"
                title="Descargar eventos en JSON"
              >
                <Download className="w-3 h-3" />
                <span>Exportar ({telemetryEvents.length})</span>
              </button>
              {telemetryEvents.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearTelemetry}
                  className="px-2 py-1 text-[11px] font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center space-x-1 pressable cursor-pointer"
                  title="Vaciar log local"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-base font-black text-slate-900">
                {telemetryEvents.filter(e => e.name === 'sale_completed').length}
              </span>
              <p className="text-[10px] text-slate-500">Ventas Registradas</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-base font-black text-slate-900">
                {telemetryEvents.filter(e => e.name.includes('client')).length}
              </span>
              <p className="text-[10px] text-slate-500">Gestiones de Clientes</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-base font-black text-slate-900">
                {telemetryEvents.filter(e => e.name === 'whatsapp_click').length}
              </span>
              <p className="text-[10px] text-slate-500">Interacciones WhatsApp</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-base font-black text-slate-900">
                {telemetryEvents.length}
              </span>
              <p className="text-[10px] text-slate-500">Eventos Totales</p>
            </div>
          </div>

          {telemetryEvents.length > 0 ? (
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
              {telemetryEvents.slice(0, 10).map(evt => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span className="font-bold text-slate-800">{evt.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                      {evt.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-2">
              No hay eventos locales registrados aún en esta sesión.
            </p>
          )}
        </div>
        )}

        {/* Botón Principal Guardar (Única llamada a la acción principal - Punto 20) */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[48px] bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 text-xs pressable cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración del Sistema</span>
          </button>
        </div>
      </form>
    </div>
  );
}
