import React from 'react';
import type { DeliveryLevel, EventConfig } from '../types/engine';
import { PrizeEngine } from '../engine/PrizeEngine';
import { InventoryManager } from '../engine/InventoryManager';
import { StorageManager } from '../engine/StorageManager';
import { ShieldAlert, Zap, Lock, Unlock, Pause, Play } from 'lucide-react';

interface PacingControlProps {
  config: EventConfig;
  onConfigUpdated: () => void;
}

export const PacingControl: React.FC<PacingControlProps> = ({ config, onConfigUpdated }) => {
  const prizeEngine = PrizeEngine.getInstance();
  const inventoryManager = InventoryManager.getInstance();

  const handleDeliveryLevelChange = (level: DeliveryLevel) => {
    prizeEngine.updateConfig({ deliveryLevel: level });
    logAction('CAMBIO_NIVEL_ENTREGA', 'deliveryLevel', config.deliveryLevel, level);
    onConfigUpdated();
  };

  const handleToggleBigLock = () => {
    const nextState = !config.bigPrizeLocked;
    prizeEngine.updateConfig({ bigPrizeLocked: nextState });
    logAction('BLOQUEO_JACKPOT', 'bigPrizeLocked', String(config.bigPrizeLocked), String(nextState));
    onConfigUpdated();
  };

  const handleTogglePause = () => {
    const nextState = !config.deliveryPaused;
    prizeEngine.updateConfig({ deliveryPaused: nextState });
    logAction('PAUSA_PREMIOS', 'deliveryPaused', String(config.deliveryPaused), String(nextState));
    onConfigUpdated();
  };

  const handleQuickAction = (type: string) => {
    if (type === 'MORE_WINS') {
      handleDeliveryLevelChange('AGGRESSIVE');
    } else if (type === 'LESS_WINS') {
      handleDeliveryLevelChange('VERY_CONSERVATIVE');
    } else if (type === 'RESET_STOCK') {
      if (confirm('¿Restablecer inventario inicial (500 Chicos, 100 Medianos, 4 Grandes)?')) {
        inventoryManager.resetToDefault();
        logAction('REINICIO_STOCK', 'inventory', 'custom', 'default');
        onConfigUpdated();
      }
    }
  };

  const logAction = (action: string, field: string, oldValue: string, newValue: string) => {
    const date = new Date();
    StorageManager.addAuditLog({
      id: `LOG-${Date.now()}`,
      timestamp: Date.now(),
      formattedTime: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
      adminUser: 'Administrador BOOMS LAB',
      action,
      field,
      oldValue,
      newValue,
    });
  };

  const levels: { key: DeliveryLevel; label: string; desc: string; color: string }[] = [
    { key: 'VERY_CONSERVATIVE', label: 'Muy Conservador', desc: '50% Tasa Estándar', color: 'border-blue-600 bg-blue-950/40 text-blue-300' },
    { key: 'CONSERVATIVE', label: 'Conservador', desc: '75% Tasa Estándar', color: 'border-teal-600 bg-teal-950/40 text-teal-300' },
    { key: 'NORMAL', label: 'Normal', desc: '100% Tasa Objetivo (Recomendado)', color: 'border-purple-600 bg-purple-950/40 text-purple-300' },
    { key: 'PROMOTIONAL', label: 'Promocional', desc: '130% Tasa Acelerada', color: 'border-amber-600 bg-amber-950/40 text-amber-300' },
    { key: 'AGGRESSIVE', label: 'Agresivo', desc: '170% Tasa Máxima', color: 'border-red-600 bg-red-950/40 text-red-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Nivel de Entrega Dinámico (Frecuencia de Premiación)
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Modifica la tasa relativa de victoria para Premios Chicos y Medianos en tiempo real. El motor ajustará automáticamente los umbrales sin sobrepasar el inventario disponible.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {levels.map((item) => {
            const isSelected = config.deliveryLevel === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleDeliveryLevelChange(item.key)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-lg scale-105 font-bold border-yellow-400`
                    : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="text-sm uppercase tracking-wider">{item.label}</span>
                <span className="text-[10px] mt-1 opacity-80">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          ⚡ Botones de Acción Rápida
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleQuickAction('MORE_WINS')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" /> + Ganadores (Agresivo)
          </button>

          <button
            onClick={() => handleQuickAction('LESS_WINS')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" /> - Ganadores (Muy Conservador)
          </button>

          <button
            onClick={handleToggleBigLock}
            className={`p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              config.bigPrizeLocked
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-yellow-600 hover:bg-yellow-500 text-black'
            }`}
          >
            {config.bigPrizeLocked ? (
              <>
                <Lock className="w-4 h-4" /> Premios Grandes Bloqueados
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" /> Premios Grandes Activos
              </>
            )}
          </button>

          <button
            onClick={handleTogglePause}
            className={`p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              config.deliveryPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
            }`}
          >
            {config.deliveryPaused ? (
              <>
                <Play className="w-4 h-4" /> Reanudar Entrega
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" /> Pausar Entrega
              </>
            )}
          </button>
        </div>

        {config.deliveryPaused && (
          <div className="mt-4 p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>⚠️ Entrega de premios pausada manualmente. Todas las jugadas resultarán en &quot;Sigue Participando&quot;.</span>
          </div>
        )}
      </div>
    </div>
  );
};
