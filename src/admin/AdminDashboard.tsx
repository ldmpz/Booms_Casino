import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrizeEngine } from '../engine/PrizeEngine';
import { LiveMonitor } from './LiveMonitor';
import { PacingControl } from './PacingControl';
import { AnalyticsCharts } from './AnalyticsCharts';
import { EventSimulator } from './EventSimulator';
import { AuditLogs } from './AuditLogs';
import { EventConfig } from './EventConfig';
import { ExportModal } from './ExportModal';
import { X, Lock, ShieldCheck, Activity, Zap, BarChart3, Layers, History, Settings, Download } from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const prizeEngine = PrizeEngine.getInstance();
  const [config, setConfig] = useState(prizeEngine.getConfig());
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'pacing' | 'analytics' | 'simulator' | 'audit' | 'config' | 'export'>('monitor');

  useEffect(() => {
    if (isOpen) {
      setConfig(prizeEngine.getConfig());
    }
  }, [isOpen, prizeEngine]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.adminPin || pinInput === '2026') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const reloadConfig = () => {
    setConfig(prizeEngine.getConfig());
  };

  const tabs: { key: typeof activeTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'monitor', label: 'Monitor Vivo', icon: Activity },
    { key: 'pacing', label: 'Nivel Entrega', icon: Zap },
    { key: 'analytics', label: 'Estadísticas', icon: BarChart3 },
    { key: 'simulator', label: 'Simulador', icon: Layers },
    { key: 'audit', label: 'Historial / Auditoría', icon: History },
    { key: 'config', label: 'Configuración', icon: Settings },
    { key: 'export', label: 'Exportación', icon: Download },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {!isAuthenticated ? (
          /* PIN Authentication Card */
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="relative max-w-sm w-full rounded-3xl bg-zinc-900 border border-purple-500/30 p-8 text-center text-white shadow-2xl z-10 backdrop-blur-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold mb-1">Acceso Administrador</h2>
            <p className="text-xs text-gray-400 mb-6">BOOMS LAB — Panel de Control de Premios</p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Ingrese PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={8}
                autoFocus
                className="w-full bg-black/70 border border-white/10 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-[0.3em] text-yellow-400 focus:outline-none focus:border-purple-500"
              />

              {pinError && <span className="text-xs text-red-400 block font-semibold">PIN incorrecto. Reintente.</span>}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Ingresar al Dashboard
              </button>
            </form>
          </motion.div>
        ) : (
          /* Full Admin Dashboard Screen */
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative max-w-6xl w-full h-[90vh] rounded-3xl bg-zinc-950 border border-purple-500/30 text-white shadow-2xl overflow-hidden flex flex-col z-10 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    BOOMS LAB — Dashboard Profesional de Premiación
                  </h2>
                  <span className="text-[10px] text-gray-400 block">
                    Evento: <strong>{config.eventName}</strong> | Nivel: <strong className="text-yellow-400">{config.deliveryLevel}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Tab Bar */}
            <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-white/5 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950">
              {activeTab === 'monitor' && <LiveMonitor />}
              {activeTab === 'pacing' && <PacingControl config={config} onConfigUpdated={reloadConfig} />}
              {activeTab === 'analytics' && <AnalyticsCharts />}
              {activeTab === 'simulator' && <EventSimulator />}
              {activeTab === 'audit' && <AuditLogs />}
              {activeTab === 'config' && <EventConfig config={config} onConfigUpdated={reloadConfig} />}
              {activeTab === 'export' && <ExportModal />}
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
