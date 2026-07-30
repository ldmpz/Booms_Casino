import React, { useState } from 'react';
import type { EventConfig as IEventConfig } from '../types/engine';
import { PrizeEngine } from '../engine/PrizeEngine';
import { InventoryManager } from '../engine/InventoryManager';
import { StorageManager } from '../engine/StorageManager';
import { Settings, Save, ShieldCheck } from 'lucide-react';

interface EventConfigProps {
  config: IEventConfig;
  onConfigUpdated: () => void;
}

export const EventConfig: React.FC<EventConfigProps> = ({ config, onConfigUpdated }) => {
  const prizeEngine = PrizeEngine.getInstance();
  const inventoryManager = InventoryManager.getInstance();

  const [form, setForm] = useState<IEventConfig>({ ...config });
  const [stockForm, setStockForm] = useState(inventoryManager.getInventory());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    prizeEngine.updateConfig(form);
    inventoryManager.setInventory(stockForm);

    StorageManager.addAuditLog({
      id: `CONFIG-${Date.now()}`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleString(),
      adminUser: 'Administrador BOOMS LAB',
      action: 'ACTUALIZACION_CONFIGURACION',
      field: 'eventConfig',
      oldValue: JSON.stringify(config),
      newValue: JSON.stringify(form),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onConfigUpdated();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Parámetros Generales del Evento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre del Evento</label>
            <input
              type="text"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Participantes Esperados (Meta)</label>
            <input
              type="number"
              value={form.expectedParticipants}
              onChange={(e) => setForm({ ...form, expectedParticipants: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-bold text-yellow-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Duración (Días)</label>
            <input
              type="number"
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Horas por Día</label>
            <input
              type="number"
              value={form.hoursPerDay}
              onChange={(e) => setForm({ ...form, hoursPerDay: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          Reglas de Premios Grandes & Seguridad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Separación Mínima entre Premios Grandes (Spins)</label>
            <input
              type="number"
              value={form.minBigPrizeGap}
              onChange={(e) => setForm({ ...form, minBigPrizeGap: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <span className="text-[10px] text-gray-500">Número mínimo de jugadas obligatorias antes de poder entregar otro Jackpot</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">PIN de Acceso Administrador</label>
            <input
              type="password"
              value={form.adminPin}
              onChange={(e) => setForm({ ...form, adminPin: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          📦 Inventario en Tiempo Real
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Stock Premios Chicos</label>
            <input
              type="number"
              value={stockForm.small}
              onChange={(e) => setStockForm({ ...stockForm, small: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-black/50 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-center text-white font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Stock Premios Medianos</label>
            <input
              type="number"
              value={stockForm.medium}
              onChange={(e) => setStockForm({ ...stockForm, medium: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-black/50 border border-blue-500/30 rounded-xl px-4 py-2.5 text-center text-white font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Stock Premios Grandes</label>
            <input
              type="number"
              value={stockForm.big}
              onChange={(e) => setStockForm({ ...stockForm, big: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-black/50 border border-yellow-500/40 rounded-xl px-4 py-2.5 text-center text-white font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {saveSuccess ? (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            ✓ Configuración e inventario guardados exitosamente.
          </span>
        ) : <div />}

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> Guardar Cambios en Tiempo Real
        </button>
      </div>
    </form>
  );
};
