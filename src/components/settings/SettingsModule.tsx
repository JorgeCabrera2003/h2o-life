'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
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
} from 'lucide-react';

export function SettingsModule() {
  const { systemSettings, updateSystemSettings } = useH2OStore();

  const [businessName, setBusinessName] = useState(systemSettings.business_name);
  const [businessRif, setBusinessRif] = useState(systemSettings.business_rif);
  const [freyeliPhone, setFreyeliPhone] = useState(systemSettings.freyeli_phone);
  const [jorgePhone, setJorgePhone] = useState(systemSettings.jorge_phone);
  const [tankLowThreshold, setTankLowThreshold] = useState(systemSettings.tank_low_threshold_pct);
  const [autoNotifySales, setAutoNotifySales] = useState(systemSettings.auto_notify_sales);
  const [autoNotifyTankAlerts, setAutoNotifyTankAlerts] = useState(systemSettings.auto_notify_tank_alerts);
  const [autoNotifyCisterns, setAutoNotifyCisterns] = useState(systemSettings.auto_notify_cisterns);
  const [autoNotifyClosures, setAutoNotifyClosures] = useState(systemSettings.auto_notify_closures);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      business_name: businessName,
      business_rif: businessRif,
      freyeli_phone: freyeliPhone,
      jorge_phone: jorgePhone,
      tank_low_threshold_pct: tankLowThreshold,
      auto_notify_sales: autoNotifySales,
      auto_notify_tank_alerts: autoNotifyTankAlerts,
      auto_notify_cisterns: autoNotifyCisterns,
      auto_notify_closures: autoNotifyClosures,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestWhatsAppNotification = (phone: string, roleName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `🔔 *H2O LIFE - PRUEBA DE CONEXIÓN*%0AEsta es una prueba de notificación para la administradora (${roleName}).%0AEl sistema POS está configurado para enviar reportes automáticos de ventas y tanques.`;
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-8">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>Configuración General del Sistema</span>
          </h2>
          <p className="text-xs text-slate-500">
            Parámetros administrativos, números de notificación para Freyeli y alertas de tanques
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
        {/* 1. NOTIFICACIONES DE WHATSAPP PARA ADMINISTRADORES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Bell className="w-4 h-4 text-sky-600" />
            <span>Canales de Notificación por WhatsApp (Freyeli & Jorge)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                WhatsApp de Freyeli (Administradora Principal):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={freyeliPhone}
                  onChange={e => setFreyeliPhone(e.target.value)}
                  placeholder="+58 412 1234567"
                  className="flex-1 text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTestWhatsAppNotification(freyeliPhone, 'Freyeli')}
                  className="px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1"
                  title="Enviar mensaje de prueba a Freyeli"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Recibirá notificaciones instantáneas de cada venta realizada por Carla.
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
                  placeholder="+58 414 7654321"
                  className="flex-1 text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTestWhatsAppNotification(jorgePhone, 'Jorge')}
                  className="px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 flex items-center space-x-1"
                  title="Enviar mensaje de prueba a Jorge"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Recibirá cierres diarios de caja y auditorías financieras.
              </span>
            </div>
          </div>

          {/* Interruptores de Notificaciones */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Notificar a Freyeli cada venta realizada
                </span>
                <span className="text-[11px] text-slate-400">
                  Genera el mensaje con monto en $ y Bs, cliente y productos vendidos
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoNotifySales}
                onChange={e => setAutoNotifySales(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
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
                className="w-4 h-4 text-sky-600 rounded"
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
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* 2. UMBRAL DE TANQUES & ALERTAS */}
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
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Si el volumen de agua en el tanque es inferior al {tankLowThreshold}%, el sistema activará la alerta visual y sugerirá el pedido de cisterna a Freyeli.
            </p>
          </div>
        </div>

        {/* 3. DATOS DE LA EMPRESA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-4">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>Datos Fiscales & Nombre del Negocio</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-8 py-3 rounded-2xl shadow-lg flex items-center space-x-2 text-xs active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración del Sistema</span>
          </button>
        </div>
      </form>
    </div>
  );
}
