'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useH2OStore } from '@/lib/store';
import { Client } from '@/types';
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
  CheckCircle,
  AlertCircle,
  Navigation,
  Compass,
} from 'lucide-react';
import {
  sanitizeAndCapitalizeName,
  sanitizeVenezuelanPhoneInput,
  sanitizeCurrencyInput,
  resolveBarquisimetoCoordinates,
  COUNTRY_CODES,
  VENEZUELAN_OPERATORS,
} from '@/lib/validators';
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
  const { clients, addClient, updateClient, deleteClient } = useH2OStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'con_deuda' | 'al_dia' | 'frecuentes'>('todos');

  // Modal para agregar o editar cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa el nombre del cliente.');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;

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
    } else {
      addClient(clientPayload);
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
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>Directorio de Clientes & Entregas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Control de números telefónicos, direcciones de despacho y geolocalización con Google Maps
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 text-xs flex items-center space-x-2 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, calle o punto de referencia..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500"
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
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  filterType === f.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

          return (
            <div
              key={client.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header del Cliente */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                      <span>{client.name}</span>
                      {(client.total_orders || 0) >= 10 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                          ⭐ Habitual
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-bold text-sky-700 mt-0.5 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone}</span>
                    </p>
                  </div>

                  {/* Estado de Saldo / Deuda */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                      hasDebt
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 mb-3 text-xs">
                  <div className="flex items-start space-x-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{client.address || 'Venta directa en tienda'}</span>
                  </div>

                  {client.reference_point && (
                    <div className="flex items-start space-x-1.5 text-slate-500 text-[11px] pl-5">
                      <span>📍 Ref: <em>{client.reference_point}</em></span>
                    </div>
                  )}

                  {client.notes && (
                    <div className="mt-1 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600">
                      📝 {client.notes}
                    </div>
                  )}

                  {/* Mapa Interactivo Manipulable dentro de la Tarjeta */}
                  {isMapExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 animate-in fade-in">
                      <InteractiveMapPicker
                        lat={clientLat}
                        lng={clientLng}
                        onCoordinatesChange={(newLat, newLng) => {
                          updateClient(client.id, {
                            latitude: newLat,
                            longitude: newLng,
                            maps_url: `https://www.google.com/maps/search/?api=1&query=${newLat.toFixed(6)},${newLng.toFixed(6)}`,
                          });
                        }}
                        addressLabel={client.address}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  {client.phone && client.phone !== 'N/A' && (
                    <button
                      onClick={() => handleOpenWhatsApp(client.phone, client.name)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Escribir por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}

                  {client.maps_url && (
                    <a
                      href={client.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors flex items-center space-x-1"
                      title="Abrir ubicación en Google Maps / Waze"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  )}

                  {/* Botón para abrir el mapa interactivo manipulable en la tarjeta */}
                  <button
                    onClick={() => setExpandedMapClientId(isMapExpanded ? null : client.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      isMapExpanded
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isMapExpanded ? 'Ocultar mapa interactivo' : 'Manipular mapa aquí'}
                  >
                    <Compass className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {client.id !== 'client-mostrador' && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${client.name} del directorio?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {onSelectClientForSale && (
                  <button
                    onClick={() => onSelectClientForSale(client)}
                    className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Cargar Venta</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear / Editar Cliente con Autocomplete y Mapa en Vivo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="font-black text-lg text-slate-900 mb-1">
              {editingClient ? 'Editar Información del Cliente' : 'Registrar Nuevo Cliente'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Completa los datos con geolocalización para agilizar despachos de agua
            </p>

            <form onSubmit={handleSaveClient} className="space-y-4">
              {/* Nombre con auto-capitalización y límite estricto de 50 caracteres */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800">
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
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-2xs"
                  required
                />
              </div>

              {/* Teléfono con selector de País y Operadoras de Venezuela con límite estricto */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Teléfono (WhatsApp):
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {phoneValidation.rawDigits.length}/11 dígitos
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        phoneValidation.isValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {phoneValidation.isValid ? '✓ Válido' : 'Máx. 11 dígitos'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 mb-1.5">
                  {/* Selector de País */}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 shrink-0"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.country} ({c.code})
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
                    className={`flex-1 text-xs font-bold p-2 bg-slate-50 border rounded-xl ${
                      phoneBody.length > 0 && !phoneValidation.isValid
                        ? 'border-amber-400 focus:border-amber-500'
                        : 'border-slate-200 focus:border-sky-500'
                    }`}
                  />
                </div>

                {/* Chips de Operadoras Móviles para llenado instantáneo */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Prefijo:</span>
                  {VENEZUELAN_OPERATORS.map(op => (
                    <button
                      key={op.code}
                      type="button"
                      onClick={() => setPhoneBody(`${op.code}-`)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border border-slate-200 transition-colors shrink-0"
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
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estado de Saldo ($ USD):
                  </label>
                  <input
                    type="text"
                    placeholder="0 = al día, -1 = debe $1"
                    value={balanceUsd}
                    onChange={e => setBalanceUsd(sanitizeCurrencyInput(e.target.value))}
                    maxLength={8}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">Ej: -2.00 si debe $2</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Notas adicionales:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Siempre compra de recargas"
                    value={notes}
                    onChange={e => setNotes(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-md active:scale-95 transition-all"
                >
                  Guardar Cliente con Ubicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
