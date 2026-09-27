'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { Client } from '@/types';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Navigation,
  Check,
  Compass,
} from 'lucide-react';
import {
  toTitleCase,
  formatVenezuelanPhone,
  isValidVenezuelanPhone,
  COUNTRY_CODES,
  VENEZUELAN_OPERATORS,
} from '@/lib/validators';
import { DeliveryAddressMap } from './DeliveryAddressMap';

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

  // Campos del formulario con regex y selectores
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+58');
  const [phoneBody, setPhoneBody] = useState('');
  const [address, setAddress] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [notes, setNotes] = useState('');
  const [balanceUsd, setBalanceUsd] = useState('0');

  // Tarjeta con mapa expandido opcional
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
    setPhoneBody('412');
    setAddress('');
    setReferencePoint('');
    setNotes('');
    setBalanceUsd('0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    // Extraer código de país si existe
    if (client.phone.startsWith('+58')) {
      setCountryCode('+58');
      setPhoneBody(client.phone.replace('+58', '').trim());
    } else {
      setCountryCode('+58');
      setPhoneBody(client.phone.trim());
    }
    setAddress(client.address);
    setReferencePoint(client.reference_point || '');
    setNotes(client.notes || '');
    setBalanceUsd(client.balance_usd.toString());
    setIsModalOpen(true);
  };

  // Capitalización de nombre
  const handleNameChange = (val: string) => {
    setName(toTitleCase(val));
  };

  // Formateo del teléfono con regex
  const handlePhoneBodyChange = (val: string) => {
    // Permitir solo dígitos y guión/espacio
    const cleaned = val.replace(/[^\d\s-]/g, '');
    setPhoneBody(cleaned);
  };

  const fullPhone = `${countryCode} ${phoneBody.trim()}`;
  const isPhoneValid = isValidVenezuelanPhone(fullPhone);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const mapsUrl = address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${referencePoint || ''}, Venezuela`)}`
      : undefined;

    const clientPayload = {
      name: name.trim(),
      phone: fullPhone.trim() || 'N/A',
      address: address.trim() || 'Venta en tienda / mostrador',
      reference_point: referencePoint.trim(),
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

                  {/* Vista Previa Opcional del Mapa en la Tarjeta */}
                  {isMapExpanded && client.address && (
                    <div className="mt-2 pt-2 border-t border-slate-200 animate-in fade-in">
                      <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                        <iframe
                          title="Mapa Cliente"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(`${client.address}, ${client.reference_point || ''}, Venezuela`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción (WhatsApp, Maps, Toggle Mapa, Nueva Venta) */}
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

                  {/* Botón para previsualizar mapa dentro de la tarjeta */}
                  {client.address && (
                    <button
                      onClick={() => setExpandedMapClientId(isMapExpanded ? null : client.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isMapExpanded
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={isMapExpanded ? 'Ocultar mapa' : 'Ver mapa aquí'}
                    >
                      <Compass className="w-4 h-4" />
                    </button>
                  )}

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
              {/* Nombre con auto-capitalización */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Nombre Completo (Auto-capitalizado):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Carmen De La Luz"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 shadow-2xs"
                  required
                />
              </div>

              {/* Teléfono con selector de País y Operadoras de Venezuela */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Teléfono (WhatsApp):
                  </label>
                  <span
                    className={`text-[10px] font-bold ${
                      isPhoneValid ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {isPhoneValid ? '✓ Formato Válido' : 'Ej: 0412-1234567'}
                  </span>
                </div>

                <div className="flex space-x-2 mb-1.5">
                  {/* Selector de País */}
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-2"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.country} ({c.code})
                      </option>
                    ))}
                  </select>

                  {/* Número telefónico */}
                  <input
                    type="text"
                    placeholder="412 1234567"
                    value={phoneBody}
                    onChange={e => handlePhoneBodyChange(e.target.value)}
                    className="flex-1 text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Chips de Operadoras Móviles para llenado instantáneo */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Operadora:</span>
                  {VENEZUELAN_OPERATORS.map(op => (
                    <button
                      key={op.code}
                      type="button"
                      onClick={() => setPhoneBody(`${op.code} `)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 border border-slate-200 transition-colors shrink-0"
                    >
                      {op.code} ({op.name})
                    </button>
                  ))}
                </div>
              </div>

              {/* Componente de Dirección con Autocomplete y Mapa en Vivo Integrado */}
              <DeliveryAddressMap
                address={address}
                setAddress={setAddress}
                referencePoint={referencePoint}
                setReferencePoint={setReferencePoint}
              />

              {/* Saldo y Notas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estado de Saldo ($ USD):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0 = al día, negativo = deuda"
                    value={balanceUsd}
                    onChange={e => setBalanceUsd(e.target.value)}
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
                    onChange={e => setNotes(e.target.value)}
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
