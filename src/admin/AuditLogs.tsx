import React, { useState } from 'react';
import { StorageManager } from '../engine/StorageManager';
import { Trash2, Search } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'audit'>('history');
  const [searchTerm, setSearchTerm] = useState('');

  const history = StorageManager.getPlayHistory();
  const auditLogs = StorageManager.getAuditLogs();

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(term) ||
      item.prizeName.toLowerCase().includes(term) ||
      item.securityCode.toLowerCase().includes(term) ||
      item.outcome.toLowerCase().includes(term)
    );
  });

  const filteredAudit = auditLogs.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.action.toLowerCase().includes(term) ||
      item.adminUser.toLowerCase().includes(term) ||
      item.field.toLowerCase().includes(term)
    );
  });

  const handleClearHistory = () => {
    if (confirm('¿ATENCIÓN: Estás seguro de reiniciar todo el historial de partidas?')) {
      StorageManager.clearPlayHistory();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Historial de Partidas ({history.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'audit' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Registro de Seguridad ({auditLogs.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, ID o premio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {activeSubTab === 'history' && (
            <button
              onClick={handleClearHistory}
              className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors cursor-pointer"
              title="Borrar Historial"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'history' ? (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">ID Partida</th>
                  <th className="pb-3 px-3">Fecha y Hora</th>
                  <th className="pb-3 px-3">Resultado</th>
                  <th className="pb-3 px-3">Premio Otorgado</th>
                  <th className="pb-3 px-3">Código Seguridad</th>
                  <th className="pb-3 px-3 text-right">Stock (C / M / G)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No hay registros de partidas disponibles.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-purple-300">{item.id}</td>
                      <td className="py-3 px-3">{item.formattedTime}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.outcome === 'WIN_BIG'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                              : item.outcome === 'WIN_MEDIUM'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : item.outcome === 'WIN_SMALL'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold">{item.prizeName}</td>
                      <td className="py-3 px-3 font-mono text-yellow-400 font-bold">{item.securityCode}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-400">
                        {item.inventorySnapshot.small} / {item.inventorySnapshot.medium} / {item.inventorySnapshot.big}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Fecha y Hora</th>
                  <th className="pb-3 px-3">Administrador</th>
                  <th className="pb-3 px-3">Acción</th>
                  <th className="pb-3 px-3">Campo Modificado</th>
                  <th className="pb-3 px-3">Valor Anterior</th>
                  <th className="pb-3 px-3">Nuevo Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredAudit.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No hay registros de auditoría de seguridad.
                    </td>
                  </tr>
                ) : (
                  filteredAudit.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">{item.formattedTime}</td>
                      <td className="py-3 px-3 font-bold text-purple-300">{item.adminUser}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-black border border-white/10 text-[10px] uppercase font-mono text-yellow-400">
                          {item.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-400">{item.field}</td>
                      <td className="py-3 px-3 text-red-400 line-through">{item.oldValue}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{item.newValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
