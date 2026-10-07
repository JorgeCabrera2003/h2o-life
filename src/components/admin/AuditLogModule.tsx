'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { ShieldAlert, RotateCcw, Clock, Target, History, Laptop, AlertTriangle, Eye, Shield, Search, Filter } from 'lucide-react';
import { hasPermission } from '@/lib/auth';

const keyDictionary: Record<string, string> = {
  id: 'Referencia / Código',
  folio: 'Nº de Recibo / Folio',
  created_at: 'Fecha de Registro',
  updated_at: 'Última Actualización',
  client_id: 'Cód. Cliente',
  client_name: 'Nombre del Cliente',
  worker_id: 'Cód. Operador',
  worker_name: 'Operador Registrado',
  total_usd: 'Total a Pagar ($)',
  total_bs: 'Total a Pagar (Bs)',
  exchange_rate: 'Tasa BCV Aplicada',
  items: 'Productos / Detalles',
  product_id: 'Cód. Producto',
  product_name: 'Producto',
  quantity: 'Cantidad',
  price_usd: 'Precio Unitario ($)',
  subtotal_usd: 'Subtotal ($)',
  category: 'Categoría',
  status: 'Estado Actual',
  payment_method: 'Método de Pago',
  reference: 'Ref. Bancaria',
  amount_usd: 'Monto Cobrado ($)',
  amount_bs: 'Monto Cobrado (Bs)',
  role: 'Nivel de Acceso',
  phone: 'Teléfono',
  address: 'Dirección / Zona',
  stock: 'Inventario Disponible',
  cost_usd: 'Costo Interno ($)',
  payments: 'Pagos Registrados',
  method: 'Método de Pago',
  bank: 'Banco / Entidad',
  notes: 'Notas Adicionales',
  change_usd: 'Vuelto a Entregar ($)',
  change_bs: 'Vuelto a Entregar (Bs)',
  notified_to_admin: 'Notificado al Administrador',
};

const formatKey = (key: string) => {
  const normalizedKey = key.toLowerCase().trim();
  if (keyDictionary[normalizedKey]) {
    return keyDictionary[normalizedKey];
  }
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const FriendlyJsonViewer = ({ data }: { data: any }) => {
  if (data === null || data === undefined) return <span className="text-slate-500">-</span>;
  
  if (typeof data !== 'object') {
    if (typeof data === 'boolean') return <span className="text-slate-200 font-bold">{data ? 'Sí' : 'No'}</span>;
    return <span className="text-slate-200 font-bold break-all">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="flex flex-col gap-3 w-full mt-2">
        {data.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-700/60 rounded-xl p-3 shadow-sm relative">
            <div className="absolute -top-2.5 -left-2.5 bg-sky-600 text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950">
              {idx + 1}
            </div>
            <FriendlyJsonViewer data={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {Object.entries(data).map(([key, value]) => {
        const isComplex = typeof value === 'object' && value !== null;
        return (
          <div key={key} className={`py-2 border-b border-slate-800/40 last:border-0 ${isComplex ? 'flex flex-col gap-2 mt-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5'}`}>
            <span className="text-[11px] text-sky-300 font-bold uppercase tracking-widest shrink-0 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-sky-500/50"></span>
              {formatKey(key)}
            </span>
            <div className={isComplex ? 'pl-4 border-l-2 border-slate-800/50 mt-1' : 'text-right'}>
              <FriendlyJsonViewer data={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function AuditLogModule() {
  const { auditLogs, restoreAuditLog, currentUser } = useH2OStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('TODAS');
  const [targetFilter, setTargetFilter] = useState('TODOS');
  const [dateFilter, setDateFilter] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;



  const handleRestore = (logId: string) => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas RESTAURAR estos datos a su estado anterior? Esto revertirá los cambios y quedará registrado.')) {
      restoreAuditLog(logId);
    }
  };

  // Memoización para filtrado super rápido
  const filteredLogs = React.useMemo(() => {
    return auditLogs.filter(log => {
      if (actionFilter !== 'TODAS' && log.action !== actionFilter) return false;
      if (targetFilter !== 'TODOS' && log.target_table !== targetFilter) return false;
      
      if (dateFilter) {
        // Formato local simple YYYY-MM-DD
        const logDate = new Date(log.timestamp);
        // Ajustamos la zona horaria convirtiendo a string local ISO-like
        const localDateString = new Date(logDate.getTime() - (logDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (localDateString !== dateFilter) return false;
      }
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.user_name.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          (log.device_info && log.device_info.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [auditLogs, searchQuery, actionFilter, targetFilter, dateFilter]);

  // Paginación
  const paginatedLogs = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  // Volver a la página 1 cuando los filtros cambien
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter, targetFilter, dateFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-800';
      case 'UPDATE': return 'bg-sky-100 text-sky-800';
      case 'DELETE': return 'bg-rose-100 text-rose-800';
      case 'LOGIN': return 'bg-indigo-100 text-indigo-800';
      case 'LOGOUT': return 'bg-slate-200 text-slate-800';
      case 'RESTORE': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Seguridad estricta: si llega hasta aquí sin permiso (antes de que page.tsx lo redirija), no renderiza nada
  if (!hasPermission(currentUser, 'audit')) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-40">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Shield className="w-6 h-6 text-indigo-600" />
            <span>Bitácora de Seguridad</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Registro inmutable de actividades y auditoría de datos.
          </p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-900">{filteredLogs.length} eventos filtrados</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por usuario, descripción o dispositivo..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full sm:w-auto cursor-pointer"
            />
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full sm:w-auto cursor-pointer"
            >
              <option value="TODAS">Todas las Acciones</option>
              <option value="CREATE">Creación (CREATE)</option>
              <option value="UPDATE">Actualización (UPDATE)</option>
              <option value="DELETE">Eliminación (DELETE)</option>
              <option value="LOGIN">Inicios de Sesión</option>
              <option value="RESTORE">Restauración</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Target className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full sm:w-auto cursor-pointer"
            >
              <option value="TODOS">Todos los Módulos</option>
              <option value="sales">Ventas (sales)</option>
              <option value="clients">Clientes (clients)</option>
              <option value="products">Productos (products)</option>
              <option value="auth">Autenticación (auth)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                <th className="p-4">Fecha / Hora</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Detalles</th>
                <th className="p-4">Dispositivo</th>
                <th className="p-4 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-600">No hay registros que coincidan con la búsqueda.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Intenta con otros filtros o palabras clave.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 align-top whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900">{log.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.user_id}</div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <div className="mt-1.5 flex items-center space-x-1 text-[10px] font-bold text-slate-500">
                          <Target className="w-3 h-3" />
                          <span>{log.target_table}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top max-w-xs">
                        <div className="text-slate-700 font-medium line-clamp-2">{log.description}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-[10px] text-slate-500 max-w-[120px] truncate flex items-center space-x-1">
                          <Laptop className="w-3 h-3 shrink-0" />
                          <span title={log.device_info}>{log.device_info}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top text-right">
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                            className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 w-full rounded-lg text-xs font-bold transition-colors pressable border ${selectedLogId === log.id ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{selectedLogId === log.id ? 'Cerrar' : 'Inspeccionar'}</span>
                          </button>
                          {log.previous_data && ['UPDATE', 'DELETE'].includes(log.action) && (
                            <button
                              onClick={() => handleRestore(log.id)}
                              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 w-full bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-bold transition-colors pressable border border-rose-100"
                              title="Revertir este cambio y restaurar los datos anteriores"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restaurar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fila expandible de Payload JSON */}
                    {selectedLogId === log.id && (
                      <tr className="bg-slate-900 text-slate-300">
                        <td colSpan={6} className="p-4">
                          <div className={`grid gap-4 ${log.previous_data && log.new_data ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {log.previous_data && (
                              <div>
                                <div className="text-[10px] font-black text-rose-400 mb-2 uppercase tracking-widest flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Estado Anterior (Para Restaurar)</span>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                                  <FriendlyJsonViewer data={log.previous_data} />
                                </div>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest flex items-center space-x-1">
                                  <span>{log.action === 'CREATE' ? 'Datos Creados / Payload' : 'Nuevo Estado Aplicado'}</span>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                                  <FriendlyJsonViewer data={log.new_data} />
                                </div>
                              </div>
                            )}
                            {!log.previous_data && !log.new_data && (
                              <div className="text-center py-4 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                Sin metadatos estructurados disponibles
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} registros
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold text-xs shadow-sm transition-all pressable"
              >
                Anterior
              </button>
              <div className="px-3 py-1.5 bg-slate-200/50 text-slate-700 rounded-xl font-bold text-xs border border-slate-200/50">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold text-xs shadow-sm transition-all pressable"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
