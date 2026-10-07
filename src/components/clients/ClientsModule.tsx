'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import { Client } from '@/types';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Phone,
  MapPin,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  AlertCircle,
  Navigation,
  Compass,
  DollarSign,
} from 'lucide-react';
import {
  sanitizeAndCapitalizeName,
  sanitizeVenezuelanPhoneInput,
  sanitizeCurrencyInput,
  resolveBarquisimetoCoordinates,
  calculateDeliveryRouteInfo,
  COUNTRY_CODES,
  VENEZUELAN_OPERATORS,
  validateAntiSpamSubmission,
} from '@/lib/validators';
import { analytics } from '@/lib/analytics';
import { GoogleBusinessBadge } from '@/components/common/GoogleBusinessBadge';
import { SwipeableBottomSheet } from '@/components/common/SwipeableBottomSheet';
import { DeliveryAddressMap } from './DeliveryAddressMap';

// Carga dinámica del mapa interactivo para las tarjetas
const InteractiveMapPicker = dynamic(
  () => import('./InteractiveMapPicker').then((mod) => mod.InteractiveMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-36 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        Cargando mapa interactivo...
      </div>
    ),
  }
);

interface ClientsModuleProps {
  onSelectClientForSale?: (client: Client) => void;
}

export function ClientsModule({ onSelectClientForSale }: ClientsModuleProps) {
  const { clients, addClient, updateClient, deleteClient, currentUser, addAuditLog } = useH2OStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'con_deuda' | 'al_dia' | 'frecuentes'>('todos');

  // Modal para abonar deuda
  const [payingDebtClient, setPayingDebtClient] = useState<Client | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');

  // Modal para agregar o editar cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setName('');
    setCountryCode('+58');
    setPhoneBody('');
    setAddress('');
    setReferencePoint('');
    setNotes('');
    setBalanceUsd('0');
    setHoneypot('');
  };

  // Campos del formulario con regex y selectores estrictos
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+58');
  const [phoneBody, setPhoneBody] = useState('');
  const [address, setAddress] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [notes, setNotes] = useState('');
  const [balanceUsd, setBalanceUsd] = useState('0');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 10.0682,
    lng: -69.3235,
  });
  const [honeypot, setHoneypot] = useState('');
  const formRenderTimeRef = React.useRef<number>(Date.now());

  // Tarjeta con mapa expandido interactivo
  const [expandedMapClientId, setExpandedMapClientId] = useState<string | null>(null);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.reference_point && c.reference_point.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'con_deuda') return c.balance_usd < 0;
    if (filterType === 'al_dia') return c.balance_usd >= 0;
    if (filterType === 'frecuentes') return (c.total_orders || 0) >= 10;

    return true;
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setCountryCode('+58');
    setPhoneBody('0424-');
    setAddress('');
    setReferencePoint('');
    setNotes('');
    setBalanceUsd('0');
    setCoordinates({ lat: 10.07125, lng: -69.32535 }); // Barquisimeto Centro
    setHoneypot('');
    formRenderTimeRef.current = Date.now();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    if (client.phone.startsWith('+58')) {
      setCountryCode('+58');
      const local = client.phone.replace('+58', '').trim();
      const res = sanitizeVenezuelanPhoneInput(local);
      setPhoneBody(res.formatted);
    } else {
      setCountryCode('+58');
      const res = sanitizeVenezuelanPhoneInput(client.phone);
      setPhoneBody(res.formatted);
    }
    setAddress(client.address);
    setReferencePoint(client.reference_point || '');
    setNotes(client.notes || '');
    setBalanceUsd(client.balance_usd.toString());

    // Si tiene coordenadas fijadas, respetarlas; si era el default o una cuadrícula conocida, resolverla
    const resolved = resolveBarquisimetoCoordinates(client.address);
    const isOldDefault = !client.latitude || (Math.abs(client.latitude - 10.0682) < 0.001 && Math.abs((client.longitude ?? 0) - -69.3235) < 0.001);
    setCoordinates({
      lat: (isOldDefault && resolved) ? resolved.lat : (client.latitude || resolved?.lat || 10.07125),
      lng: (isOldDefault && resolved) ? resolved.lng : (client.longitude || resolved?.lng || -69.32535),
    });
    setIsModalOpen(true);
  };

  // Capitalización y filtrado de nombre estricto
  const handleNameChange = (val: string) => {
    setName(sanitizeAndCapitalizeName(val));
  };

  // Validación y formateo estricto del teléfono
  const phoneValidation = sanitizeVenezuelanPhoneInput(phoneBody);
  const handlePhoneBodyChange = (val: string) => {
    const result = sanitizeVenezuelanPhoneInput(val);
    setPhoneBody(result.formatted);
  };

  const fullPhone = `${countryCode} ${phoneValidation.formatted}`.trim();

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebtClient) return;
    const payment = parseFloat(debtPaymentAmount);
    if (isNaN(payment) || payment <= 0) {
      toast.error('Ingrese un monto válido a abonar');
      return;
    }

    const newBalance = payingDebtClient.balance_usd + payment;
    const finalBalance = newBalance > 0 ? 0 : newBalance;

    updateClient(payingDebtClient.id, {
      balance_usd: finalBalance
    });

    addAuditLog(
      'UPDATE',
      'clients',
      payingDebtClient.id,
      `Abono de deuda: $${payment.toFixed(2)}. Saldo anterior: $${Math.abs(payingDebtClient.balance_usd).toFixed(2)}, Deuda restante: $${Math.abs(finalBalance).toFixed(2)}`,
      payingDebtClient,
      { ...payingDebtClient, balance_usd: finalBalance }
    );

    toast.success('Abono registrado exitosamente');
    setPayingDebtClient(null);
    setDebtPaymentAmount('');
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificación de seguridad anti-spam
    const spamCheck = validateAntiSpamSubmission({
      honeypotValue: honeypot,
      formRenderTimeMs: formRenderTimeRef.current,
      minHumanDurationMs: 400,
    });
    if (spamCheck.isSpam) {
      console.warn('Registro de cliente bloqueado por filtro anti-spam:', spamCheck.reason);
      return;
    }

    if (!name.trim()) {
      alert('Por favor ingresa el nombre del cliente.');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=10.07125,-69.32705&destination=${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}&travelmode=driving`;

    const clientPayload = {
      name: name.trim(),
      phone: fullPhone || 'N/A',
      address: address.trim() || 'Venta en tienda / mostrador',
      reference_point: referencePoint.trim(),
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      notes: notes.trim(),
      balance_usd: parseFloat(balanceUsd) || 0,
      maps_url: mapsUrl,
    };

    if (editingClient) {
      updateClient(editingClient.id, clientPayload);
      analytics.logEvent('client_updated', 'client', { id: editingClient.id, name: clientPayload.name });
      toast.success('Cliente actualizado exitosamente');
    } else {
      const added = addClient(clientPayload);
      analytics.logEvent('client_created', 'client', { id: added.id, name: added.name });
      toast.success('Cliente registrado exitosamente');
    }

    setIsModalOpen(false);
  };

  const handleOpenWhatsApp = (phoneNum: string, clientName: string) => {
    const cleanPhone = phoneNum.replace(/\D/g, '');
    const msg = `¡Hola ${clientName}! Saludos desde *H2O Life*. ¿Deseas coordinar tu recarga o pedido de agua para hoy?💧`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    // pb-40 garantiza que el menú inferior NUNCA tape los botones de acción de las tarjetas
    <div className="max-w-5xl mx-auto px-4 py-4 pb-40 md:pb-36">
      {/* Título & Botón de Nuevo Cliente */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Users className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="leading-tight">Directorio de Clientes</span>
            </h2>
            <div className="self-start sm:self-auto">
              <GoogleBusinessBadge compact />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm">
            Control de números telefónicos, direcciones de despacho y geolocalización con Google Maps
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-700 dark:to-cyan-600 hover:from-sky-700 dark:hover:to-cyan-500 text-white font-black px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 dark:shadow-sky-900/40 text-xs flex items-center space-x-2 pressable cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, calle o punto de referencia..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'frecuentes', label: '⭐ Frecuentes' },
              { id: 'con_deuda', label: '⚠️ Con Deuda' },
              { id: 'al_dia', label: '✓ Al Día' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all pressable cursor-pointer ${
                  filterType === f.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {filteredClients.map(client => {
          const hasDebt = client.balance_usd < 0;
          const isMapExpanded = expandedMapClientId === client.id;
          const resolved = resolveBarquisimetoCoordinates(client.address);
          const isOldDefault = !client.latitude || (Math.abs(client.latitude - 10.0682) < 0.001 && Math.abs((client.longitude ?? 0) - -69.3235) < 0.001);
          const clientLat = (isOldDefault && resolved) ? resolved.lat : (client.latitude || resolved?.lat || 10.07125);
          const clientLng = (isOldDefault && resolved) ? resolved.lng : (client.longitude || resolved?.lng || -69.32535);
          const routeInfo = calculateDeliveryRouteInfo(clientLat, clientLng);

          return (
            <div
              key={client.id}
              className="double-bezel hover:border-sky-300 dark:hover:border-sky-500/50 transition-all flex flex-col justify-between"
            >
              <div className="double-bezel-inner p-5 flex flex-col justify-between h-full">
                <div>
                  {/* Header del Cliente */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <span>{client.name}</span>
                        {(client.total_orders || 0) >= 10 && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-md">
                            ⭐ Habitual
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5 flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{client.phone}</span>
                      </p>
                    </div>

                    {/* Estado de Saldo / Deuda */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 shrink-0 ${
                        hasDebt
                          ? 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 animate-pulse'
                          : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                      }`}
                    >
                      {hasDebt ? (
                        <span>Deuda: ${Math.abs(client.balance_usd).toFixed(2)}</span>
                      ) : (
                        <span>Al Día</span>
                      )}
                    </span>
                  </div>

                  {/* Dirección & Punto de Referencia para Delivery */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1 mb-3 text-xs">
                    <div className="flex items-start space-x-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-semibold">{client.address || 'Venta directa en tienda'}</span>
                    </div>

                    {client.reference_point && (
                      <div className="flex items-start space-x-1.5 text-slate-500 dark:text-slate-400 text-[11px] pl-5">
                        <span>📍 Ref: <em>{client.reference_point}</em></span>
                      </div>
                    )}

                    {client.id !== 'client-mostrador' && (
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-900/30 px-2.5 py-1 rounded-xl border border-sky-200/70 dark:border-sky-800/50 mt-1">
                        <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="truncate">
                          Sede (C. 28 c/ Cra 25) ➔ Cliente: ~{routeInfo.formattedDistance} • ~{routeInfo.estimatedMinutes} min
                        </span>
                      </div>
                    )}

                    {client.notes && (
                      <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
                        📝 {client.notes}
                      </div>
                    )}

                    {/* Mapa Interactivo Manipulable dentro de la Tarjeta */}
                    {isMapExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                        <InteractiveMapPicker
                          lat={clientLat}
                          lng={clientLng}
                          onCoordinatesChange={(newLat, newLng) => {
                            updateClient(client.id, {
                              latitude: newLat,
                              longitude: newLng,
                              maps_url: `https://www.google.com/maps/dir/?api=1&origin=10.07125,-69.32705&destination=${newLat.toFixed(6)},${newLng.toFixed(6)}&travelmode=driving`,
                            });
                          }}
                          addressLabel={client.address}
                          showStoreRoute={true}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-start justify-between gap-2 mt-2">
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {hasDebt && (
                      <button
                        onClick={() => {
                          setPayingDebtClient(client);
                          setDebtPaymentAmount(Math.abs(client.balance_usd).toString());
                        }}
                        className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors pressable cursor-pointer"
                        title="Abonar a Deuda"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}

                    {client.phone && client.phone !== 'N/A' && (
                      <button
                        onClick={() => handleOpenWhatsApp(client.phone, client.name)}
                        className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors pressable cursor-pointer shrink-0"
                        title="Escribir por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {client.id !== 'client-mostrador' && (
                      <a
                        href={routeInfo.googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors flex items-center space-x-1 pressable cursor-pointer shrink-0"
                        title="Trazar ruta de despacho desde la Sede (Calle 28 con Carrera 25) en Google Maps / Waze"
                      >
                        <Navigation className="w-4 h-4" />
                        <span className="text-[10px] font-bold hidden sm:inline">Ruta</span>
                      </a>
                    )}

                    <button
                      onClick={() => setExpandedMapClientId(isMapExpanded ? null : client.id)}
                      className={`p-2.5 rounded-xl transition-colors pressable cursor-pointer shrink-0 ${
                        isMapExpanded
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={isMapExpanded ? 'Ocultar mapa interactivo' : 'Manipular mapa aquí'}
                    >
                      <Compass className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors pressable cursor-pointer"
                      title="Editar Cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {client.id !== 'client-mostrador' && hasPermission(currentUser, 'admin') && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${client.name} del directorio?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors pressable cursor-pointer"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {onSelectClientForSale && (
                    <button
                      onClick={() => onSelectClientForSale(client)}
                      className="bg-sky-600 dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-sky-500/20 dark:shadow-sky-900/40 pressable cursor-pointer shrink-0 mt-0.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cargar Venta</span>
                      <span className="sm:hidden">Venta</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear / Editar Cliente con Autocomplete y Mapa en Vivo */}
      {/* Modal / Bottom Sheet para Nuevo/Editar Cliente */}
      <SwipeableBottomSheet
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Información del Cliente' : 'Registrar Nuevo Cliente'}
        maxWidth="lg"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          Completa los datos con geolocalización para agilizar despachos de agua
        </p>

            <form onSubmit={handleSaveClient} className="space-y-4 px-1 pb-0">
              {/* Nombre con auto-capitalización y límite estricto de 50 caracteres */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Nombre Completo (Auto-capitalizado):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {name.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ej. Carmen De La Luz"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  maxLength={50}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:outline-hidden focus:border-sky-500 dark:focus:border-sky-500 shadow-2xs placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  required
                />
              </div>

              {/* Teléfono con selector de País y Operadoras de Venezuela con límite estricto */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Teléfono (WhatsApp):
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {phoneValidation.rawDigits.length}/11 dígitos
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        phoneValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'
                      }`}
                    >
                      {phoneValidation.isValid ? '✓ Válido' : 'Máx. 11 dígitos'}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center mb-1.5 border rounded-xl overflow-hidden transition-colors shadow-2xs ${
                  phoneBody.length > 0 && !phoneValidation.isValid
                    ? 'border-amber-400 dark:border-amber-500 focus-within:border-amber-500 dark:focus-within:border-amber-500'
                    : 'border-slate-200 dark:border-slate-800 focus-within:border-sky-500 dark:focus-within:border-sky-500'
                }`}>
                  {/* Selector de País */}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="text-xs font-bold bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-2.5 shrink-0 focus:outline-hidden border-r border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>

                  {/* Número telefónico con límite estricto */}
                  <input
                    type="tel"
                    placeholder="0424-5567016"
                    value={phoneBody}
                    onChange={e => handlePhoneBodyChange(e.target.value)}
                    maxLength={12}
                    className="flex-1 text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-hidden placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Chips de Operadoras Móviles para llenado instantáneo */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Prefijo:</span>
                  {VENEZUELAN_OPERATORS.map(op => (
                    <button
                      key={op.code}
                      type="button"
                      onClick={() => setPhoneBody(`${op.code}-`)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-900/40 hover:text-sky-700 dark:hover:text-sky-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors shrink-0"
                    >
                      {op.code} ({op.name})
                    </button>
                  ))}
                </div>
              </div>

              {/* Componente de Dirección con Autocomplete y Mapa Interactivo Manipulable */}
              <DeliveryAddressMap
                address={address}
                setAddress={setAddress}
                referencePoint={referencePoint}
                setReferencePoint={setReferencePoint}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
              />

              {/* Saldo y Notas con límites numéricos estrictos */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Estado de Saldo ($ USD):
                  </label>
                  <input
                    type="text"
                    placeholder="0 = al día, -1 = debe $1"
                    value={balanceUsd}
                    onChange={e => setBalanceUsd(sanitizeCurrencyInput(e.target.value))}
                    maxLength={8}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-500 focus:outline-hidden shadow-2xs placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-400">Ej: -2.00 si debe $2</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Notas adicionales:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Siempre compra de recargas"
                    value={notes}
                    onChange={e => setNotes(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-500 focus:outline-hidden shadow-2xs placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              {/* Honeypot invisible para protección anti-spam */}
              <input
                type="text"
                name="_hp_security_check"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="flex space-x-2 pt-3 mt-4 sticky -bottom-4 sm:bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-4 z-20">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl pressable cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-700 dark:to-cyan-600 text-white rounded-xl hover:from-sky-700 dark:hover:to-cyan-500 shadow-md pressable cursor-pointer min-h-[44px]"
                >
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
      </SwipeableBottomSheet>

      {/* MODAL DE PAGO DE DEUDA */}
      <SwipeableBottomSheet
        isOpen={!!payingDebtClient}
        onClose={() => setPayingDebtClient(null)}
        title="💰 Abonar a Deuda"
        maxWidth="sm"
      >
        {payingDebtClient && (
          <form onSubmit={handlePayDebt} className="px-2 pb-4 space-y-4">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50 mb-4 text-center">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">Deuda Actual de {payingDebtClient.name}</p>
              <p className="text-3xl font-black text-rose-700 dark:text-rose-300 tabular-nums">${Math.abs(payingDebtClient.balance_usd).toFixed(2)}</p>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Monto del Abono ($ USD):
              </label>
              <input
                type="text"
                placeholder="0.00"
                value={debtPaymentAmount}
                onChange={e => setDebtPaymentAmount(sanitizeCurrencyInput(e.target.value))}
                className="w-full text-center text-xl font-bold p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-hidden shadow-2xs placeholder-slate-400"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md pressable cursor-pointer min-h-[44px]"
              >
                Registrar Abono
              </button>
            </div>
          </form>
        )}
      </SwipeableBottomSheet>
    </div>
  );
}
