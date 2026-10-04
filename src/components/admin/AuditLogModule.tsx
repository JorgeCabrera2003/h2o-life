'use client';

import React, { useState } from 'react';
import { useH2OStore } from '@/lib/store';
import { ShieldAlert, RotateCcw, Clock, Target, History, Laptop, AlertTriangle, Eye, Shield } from 'lucide-react';
import { hasPermission } from '@/lib/auth';

export function AuditLogModule() {
  const { auditLogs, restoreAuditLog, currentUser } = useH2OStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Seguridad estricta: Solo quienes tengan el permiso de 'audit' (Jorge y Freyeliz) pueden ver esto.
  if (!hasPermission(currentUser, 'audit')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Acceso Restringido</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          No tienes los privilegios necesarios para visualizar la bitácora de auditoría.
        </p>
      </div>
    );
  }

  const handleRestore = (logId: string) => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas RESTAURAR estos datos a su estado anterior? Esto revertirá los cambios y quedará registrado.')) {
      restoreAuditLog(logId);
    }
  };

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
          <span className="text-xs font-bold text-indigo-900">{auditLogs.length} eventos</span>
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
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    No hay registros en la bitácora actualmente.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
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
                        {log.previous_data && (
                          <button
                            onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                            className="mt-2 text-[10px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1 pressable"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver JSON Cambios</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-[10px] text-slate-500 max-w-[120px] truncate flex items-center space-x-1">
                          <Laptop className="w-3 h-3 shrink-0" />
                          <span title={log.device_info}>{log.device_info}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top text-right">
                        {log.previous_data && ['UPDATE', 'DELETE'].includes(log.action) && (
                          <button
                            onClick={() => handleRestore(log.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-bold transition-colors pressable border border-rose-100"
                            title="Revertir este cambio y restaurar los datos anteriores"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Fila expandible de Payload JSON */}
                    {selectedLogId === log.id && log.previous_data && (
                      <tr className="bg-slate-900 text-slate-300">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] font-black text-rose-400 mb-2 uppercase tracking-widest flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Estado Anterior (Para Restaurar)</span>
                              </div>
                              <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                {JSON.stringify(log.previous_data, null, 2)}
                              </pre>
                            </div>
                            {log.new_data && (
                              <div>
                                <div className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest flex items-center space-x-1">
                                  <span>Nuevo Estado Aplicado</span>
                                </div>
                                <pre className="text-[10px] font-mono bg-slate-950 p-3 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                  {JSON.stringify(log.new_data, null, 2)}
                                </pre>
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
      </div>
    </div>
  );
}
