import React, { useState } from 'react';
import { SimulationEngine } from '../engine/SimulationEngine';
import type { SimulationResult } from '../types/engine';
import { PrizeEngine } from '../engine/PrizeEngine';
import { Play, CheckCircle, Layers, RefreshCw } from 'lucide-react';

export const EventSimulator: React.FC = () => {
  const prizeEngine = PrizeEngine.getInstance();
  const currentConfig = prizeEngine.getConfig();

  const [spinCount, setSpinCount] = useState<number>(5000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = (count: number) => {
    setSpinCount(count);
    setIsSimulating(true);

    setTimeout(() => {
      const res = SimulationEngine.runSimulation(count, currentConfig);
      setResult(res);
      setIsSimulating(false);
    }, 150);
  };

  const presets = [100, 500, 1000, 5000, 10000];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Simulador Monte Carlo de Evento
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Prueba el comportamiento del motor inteligente simulando desde 100 hasta 10,000 jugadas completas. Esta simulación no modifica el historial real del evento.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {presets.map((count) => (
            <button
              key={count}
              onClick={() => handleRunSimulation(count)}
              disabled={isSimulating}
              className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                spinCount === count
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
              }`}
            >
              Simular {count.toLocaleString()} Jugadas
            </button>
          ))}

          <button
            onClick={() => handleRunSimulation(spinCount)}
            disabled={isSimulating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer ml-auto"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Ejecutar Simulación
          </button>
        </div>
      </div>

      {result && (
        <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Resultados de la Simulación ({result.simulatedSpins.toLocaleString()} Jugadas)
              </h4>
              <span className="text-xs text-gray-400">
                Nivel de Entrega usado: <strong className="text-yellow-400">{currentConfig.deliveryLevel}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Tasa de Victoria Resultante</span>
              <span className="text-2xl font-black text-purple-300">{result.winRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ganadores Totales</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{result.totalWins}</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Perdedores (&quot;Sigue Participando&quot;)</span>
              <div className="text-2xl font-black text-red-400 mt-1">{result.totalLosses}</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Stock Consumido</span>
              <div className="text-2xl font-black text-yellow-400 mt-1">{result.burnRatePercentage}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Stock Restante</span>
              <div className="text-2xl font-black text-white mt-1">
                {result.remainingSmall + result.remainingMedium + result.remainingBig}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Premios Chicos</span>
              <div className="text-xl font-bold text-white mt-1">
                {result.deliveredSmall} entregados <span className="text-xs text-gray-400 font-normal">({result.remainingSmall} rest.)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Premios Medianos</span>
              <div className="text-xl font-bold text-white mt-1">
                {result.deliveredMedium} entregados <span className="text-xs text-gray-400 font-normal">({result.remainingMedium} rest.)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-yellow-500/40">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Premios Grandes (Jackpots)</span>
              <div className="text-xl font-bold text-white mt-1">
                {result.deliveredBig} entregados <span className="text-xs text-gray-400 font-normal">({result.remainingBig} rest.)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
