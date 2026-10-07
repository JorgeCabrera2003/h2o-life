'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import { AnimatedCheck } from '@/components/ui/AnimatedIcons';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  Settings,
  Bell,
  Smartphone,
  Shield,
  Database,
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
  RefreshCcw,
  Banknote,
  DollarSign,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { GoogleBusinessBadge } from '@/components/common/GoogleBusinessBadge';
import { analytics, TelemetryEvent } from '@/lib/analytics';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full animate-pulse bg-slate-100 rounded-xl"></div>;
  }

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-bold transition-all ${
          theme === 'light' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Sun className="w-4 h-4" />
        <span>Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-bold transition-all ${
          theme === 'dark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Moon className="w-4 h-4" />
        <span>Oscuro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-sm font-bold transition-all ${
          theme === 'system' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Monitor className="w-4 h-4" />
        <span>Sistema</span>
      </button>
    </div>
  );
}

export function SettingsPanel() {
  const { systemSettings, updateSystemSettings, loadDemoData, clearDemoData, isDemoModeActive, currentUser, exchangeRate, setExchangeRateValue } = useH2OStore();

  const [businessName, setBusinessName] = useState(systemSettings.business_name);
  const [businessRif, setBusinessRif] = useState(systemSettings.business_rif);
  const [storeAddress, setStoreAddress] = useState(systemSettings.store_address || 'Calle 28 con Carrera 25, Barquisimeto');
  const [freyelizPhone, setFreyelizPhone] = useState(systemSettings.freyeliz_phone || systemSettings.freyeli_phone || '+58 424-5658068');
  const [karlaPhone, setKarlaPhone] = useState(systemSettings.karla_phone || '+58 424-5717589');
  const [jorgePhone, setJorgePhone] = useState(systemSettings.jorge_phone || '+58 424-5567016');
  const [tankLowThreshold, setTankLowThreshold] = useState(systemSettings.tank_low_threshold_pct);
  const [autoNotifySales, setAutoNotifySales] = useState(systemSettings.auto_notify_sales);
  const [autoNotifyTankAlerts, setAutoNotifyTankAlerts] = useState(systemSettings.auto_notify_tank_alerts);
  const [autoNotifyCisterns, setAutoNotifyCisterns] = useState(systemSettings.auto_notify_cisterns);
  const [autoNotifyClosures, setAutoNotifyClosures] = useState(systemSettings.auto_notify_closures);
  const [bcvRate, setBcvRate] = useState(exchangeRate.rate.toString());

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

    const parsedRate = parseFloat(bcvRate);
    if (!isNaN(parsedRate) && parsedRate > 0) {
      setExchangeRateValue(parsedRate, true);
    }

    analytics.logEvent('settings_updated', 'system', { storeAddress, tankLowThreshold });

    setSavedSuccess(true);
    toast.success('Configuraciones guardadas exitosamente', {
      description: 'Todos los parámetros han sido actualizados en el POS.'
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestWhatsAppNotification = (phone: string, roleName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `🔔 *H2O LIFE - PRUEBA DE CONEXIÓN*%0AEsta es una prueba de notificación para la administradora (${roleName}).%0AEl sistema POS está configurado para enviar reportes automáticos de ventas y tanques desde la sede en Calle 28 con Carrera 25.`;
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleExportTelemetry = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetryEvents, null, 2));
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

  if (!hasPermission(currentUser, 'admin')) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-40 md:pb-36 animate-in fade-in duration-500">
      {/* Título Header Premium */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white mb-4 shadow-lg shadow-slate-900/20">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Configuración Core
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-xl">
            Panel de control avanzado. Define parámetros operativos, notificaciones y bases de datos.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-700 px-8 py-4 font-black text-white shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="absolute h-0 w-0 rounded-full bg-white/20 transition-all duration-300 ease-out group-hover:h-56 group-hover:w-56" />
          <span className="relative flex items-center space-x-2">
            {savedSuccess ? <AnimatedCheck className="w-5 h-5 text-white" strokeWidth={3} /> : <Save className="w-5 h-5" />}
            <span>{savedSuccess ? '¡Cambios Guardados!' : 'Guardar Todo'}</span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LADO IZQUIERDO: Bento Grid Principal */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tasa BCV & Financiero */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex items-center space-x-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Parámetros Financieros</h3>
                <p className="text-xs font-semibold text-slate-500">Tasa de cambio base del sistema</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Tasa de Cambio BCV Oficial (Bs / USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={bcvRate}
                    onChange={e => setBcvRate(e.target.value)}
                    className="w-full text-lg font-black pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones y Equipo */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl -ml-10 -mt-10" />
            <div className="flex items-center space-x-3 mb-5 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Números de Operación</h3>
                <p className="text-xs font-semibold text-slate-500">Canales de alerta por WhatsApp</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Freyeliz (Administradora)', val: freyelizPhone, set: setFreyelizPhone, role: 'Freyeliz', bg: 'bg-indigo-50' },
                { label: 'Jorge Cabrera (Superadmin)', val: jorgePhone, set: setJorgePhone, role: 'Jorge', bg: 'bg-slate-50' },
                { label: 'Karla (Caja & Mostrador)', val: karlaPhone, set: setKarlaPhone, role: 'Karla', bg: 'bg-slate-50' }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border border-slate-100 ${item.bg} flex flex-col sm:flex-row sm:items-center gap-3`}>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-700 block mb-1">{item.label}</label>
                    <input
                      type="text"
                      value={item.val}
                      onChange={e => item.set(e.target.value)}
                      className="w-full text-sm font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestWhatsAppNotification(item.val, item.role)}
                    className="shrink-0 mt-4 sm:mt-0 px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-black rounded-xl border border-emerald-200 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Probar Ping</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Alertar cada venta', val: autoNotifySales, set: setAutoNotifySales },
                { label: 'Alertar tanque crítico', val: autoNotifyTankAlerts, set: setAutoNotifyTankAlerts },
                { label: 'Alertar llegada de cisterna', val: autoNotifyCisterns, set: setAutoNotifyCisterns },
                { label: 'Alertar cierre de caja', val: autoNotifyClosures, set: setAutoNotifyClosures },
              ].map((toggle, idx) => (
                <label key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-sky-200 transition-colors">
                  <span className="text-xs font-bold text-slate-700">{toggle.label}</span>
                  <input
                    type="checkbox"
                    checked={toggle.val}
                    onChange={e => toggle.set(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 accent-sky-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Umbrales */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Umbrales de Hardware</h3>
                <p className="text-xs font-semibold text-slate-500">Configuración de tanques físicos</p>
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-bold text-slate-700">Límite de Alerta de Suministro</label>
                <span className="text-2xl font-black text-amber-500 leading-none">{tankLowThreshold}%</span>
              </div>
              <input
                type="range"
                min="10" max="50" step="5"
                value={tankLowThreshold}
                onChange={e => setTankLowThreshold(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
          
          {/* Apariencia y Tema (Dark Mode) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Apariencia del Sistema</h3>
                <p className="text-xs font-semibold text-slate-500">Configura el modo oscuro o claro para la app</p>
              </div>
            </div>
            
            <ThemeSelector />
          </div>
        </div>

        {/* LADO DERECHO: Acciones Dev & Legales */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Base de Datos Dev */}
          {hasPermission(currentUser, 'dev') && (
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center space-x-3 mb-5 relative">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center border border-slate-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Base de Datos</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dev Mode</p>
                </div>
              </div>
              
              <div className="space-y-3 relative">
                <button
                  type="button"
                  onClick={clearDemoData}
                  disabled={!isDemoModeActive}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
                    !isDemoModeActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <AnimatedCheck className="w-4 h-4" strokeWidth={3} />
                  <span>{isDemoModeActive ? 'Ir a Producción' : 'Semilla Real Activa'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadDemoData}
                  disabled={isDemoModeActive}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
                    isDemoModeActive 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isDemoModeActive ? 'Demo Activo' : 'Cargar Demo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Telemetría */}
          {hasPermission(currentUser, 'dev') && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Telemetría (Local)</h3>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-600">Eventos</span>
                <span className="text-sm font-black text-slate-900">{telemetryEvents.length}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportTelemetry} className="flex-1 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                {telemetryEvents.length > 0 && (
                  <button onClick={handleClearTelemetry} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Fiscal y Legales */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
             <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Fiscal & Legal</h3>
              </div>
            <GoogleBusinessBadge />
            <div className="space-y-2">
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Razón Social" className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="text" value={businessRif} onChange={e => setBusinessRif(e.target.value)} placeholder="RIF" className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="text" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="Dirección Física" className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            
            <div className="pt-4 border-t border-slate-100 space-y-2 flex flex-col">
              <Link href="/aviso-legal" className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"><FileText className="w-3 h-3"/><span>Aviso Legal</span></Link>
              <Link href="/privacidad" className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"><Shield className="w-3 h-3"/><span>Política de Privacidad</span></Link>
              <button type="button" onClick={handleResetCookieConsent} className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center space-x-1 text-left"><Cookie className="w-3 h-3"/><span>Reset Cookies</span></button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
