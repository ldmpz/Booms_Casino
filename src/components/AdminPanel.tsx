import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, Settings, ShieldAlert } from 'lucide-react';
import { type GameSettings, getGameSettings, saveGameSettings } from '../utils/prizeSelector';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [settings, setSettings] = useState<GameSettings | null>(null);

  // Load settings when panel opens
  useEffect(() => {
    if (isOpen) {
      setSettings(getGameSettings());
    }
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const handleModeChange = (mode: 'probability' | 'inventory') => {
    setSettings((prev) => prev ? { ...prev, mode } : null);
  };

  const handleWeightChange = (tier: 'small' | 'medium' | 'big', val: number) => {
    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        weights: {
          ...prev.weights,
          [tier]: Math.max(0, val),
        },
      };
    });
  };

  const handleInventoryChange = (tier: 'small' | 'medium' | 'big', val: number) => {
    setSettings((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [tier]: Math.max(0, val),
        },
      };
    });
  };

  const handleSave = () => {
    if (settings) {
      // Validate probabilities (they don't strictly need to sum to 100, but they should be positive)
      const totalWeight = settings.weights.small + settings.weights.medium + settings.weights.big;
      if (totalWeight <= 0) {
        alert('La suma de las probabilidades debe ser mayor que 0.');
        return;
      }
      
      saveGameSettings(settings);
      onSettingsChanged();
      onClose();
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Estás seguro de que quieres restablecer los valores por defecto?')) {
      const defaults: GameSettings = {
        mode: 'probability',
        weights: { small: 80, medium: 19, big: 1 },
        inventory: { small: 300, medium: 100, big: 5 },
      };
      setSettings(defaults);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-2xl w-full max-h-[85vh] rounded-3xl bg-gray-900 border border-purple-500/20 text-white shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40">
            <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400">
              <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              Configuración BOOMS LAB
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Modo de Operación
              </label>
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => handleModeChange('probability')}
                  className={`py-3 rounded-lg font-bold transition-all duration-300 cursor-pointer ${
                    settings.mode === 'probability'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Probabilidades (80/19/1)
                </button>
                <button
                  onClick={() => handleModeChange('inventory')}
                  className={`py-3 rounded-lg font-bold transition-all duration-300 cursor-pointer ${
                    settings.mode === 'inventory'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Inventario Controlado
                </button>
              </div>
            </div>

            {/* Probability Settings */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-4">
              <h3 className="font-bold text-gray-200 flex items-center gap-2">
                📈 Pesos de Probabilidad
                {settings.mode !== 'probability' && (
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-normal uppercase tracking-wider">
                    Inactivo
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-green-400 font-semibold uppercase tracking-wider">
                    Chico (%)
                  </label>
                  <input
                    type="number"
                    value={settings.weights.small}
                    onChange={(e) => handleWeightChange('small', parseFloat(e.target.value) || 0)}
                    disabled={settings.mode !== 'probability'}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                    Mediano (%)
                  </label>
                  <input
                    type="number"
                    value={settings.weights.medium}
                    onChange={(e) => handleWeightChange('medium', parseFloat(e.target.value) || 0)}
                    disabled={settings.mode !== 'probability'}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
                    Grande (%)
                  </label>
                  <input
                    type="number"
                    value={settings.weights.big}
                    onChange={(e) => handleWeightChange('big', parseFloat(e.target.value) || 0)}
                    disabled={settings.mode !== 'probability'}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-yellow-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {settings.mode === 'probability' && (
                <p className="text-xs text-gray-400 italic">
                  * Las probabilidades se recalculan proporcionalmente al total ({settings.weights.small + settings.weights.medium + settings.weights.big}).
                  Actualmente:
                  Chico {((settings.weights.small / (settings.weights.small + settings.weights.medium + settings.weights.big)) * 100).toFixed(1)}% |
                  Mediano {((settings.weights.medium / (settings.weights.small + settings.weights.medium + settings.weights.big)) * 100).toFixed(1)}% |
                  Grande {((settings.weights.big / (settings.weights.small + settings.weights.medium + settings.weights.big)) * 100).toFixed(1)}%
                </p>
              )}
            </div>

            {/* Inventory Settings */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-4">
              <h3 className="font-bold text-gray-200 flex items-center gap-2">
                📦 Stock de Inventario
                {settings.mode !== 'inventory' && (
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-normal uppercase tracking-wider">
                    Inactivo
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-green-400 font-semibold uppercase tracking-wider">
                    Chicos Libres
                  </label>
                  <input
                    type="number"
                    value={settings.inventory.small}
                    onChange={(e) => handleInventoryChange('small', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                    Medianos Libres
                  </label>
                  <input
                    type="number"
                    value={settings.inventory.medium}
                    onChange={(e) => handleInventoryChange('medium', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
                    Grandes Libres
                  </label>
                  <input
                    type="number"
                    value={settings.inventory.big}
                    onChange={(e) => handleInventoryChange('big', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800/80 border border-white/10 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              {settings.mode === 'inventory' && settings.inventory.big === 0 && (
                <div className="flex items-start gap-2 bg-yellow-950/40 border border-yellow-500/30 p-3 rounded-lg text-yellow-200 text-xs">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>¡Atención! El inventario de Premios Grandes está en 0. Nunca más se elegirá el premio grande hasta que agregues stock.</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold tracking-wider uppercase py-2 px-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Valores
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold tracking-wider uppercase shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
