import React from 'react';
import { PrizeEngine } from '../engine/PrizeEngine';
import { StatisticsEngine } from '../engine/StatisticsEngine';
import { Trophy, Users, Gift, Activity, Clock, ShieldCheck, TrendingUp } from 'lucide-react';

export const LiveMonitor: React.FC = () => {
  const prizeEngine = PrizeEngine.getInstance();
  const pacing = prizeEngine.getPacingState();
  const health = StatisticsEngine.getHealthMetrics();
  const config = prizeEngine.getConfig();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-emerald-500/30 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Salud del Motor</span>
            <div className="text-xl font-black text-emerald-400 flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {health.healthStatus}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">{health.statusMessage}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tasa de Victoria Actual</span>
            <div className="text-xl font-black text-purple-300 flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              {(pacing.currentWinRate * 100).toFixed(1)}% <span className="text-xs text-gray-400 font-normal">(Obj: {(pacing.targetWinRate * 100).toFixed(1)}%)</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">Estado Ritmo: <strong className="text-yellow-400">{pacing.pacingStatus}</strong></span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-blue-500/30 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Velocidad de Juego</span>
            <div className="text-xl font-black text-blue-300 flex items-center gap-2 mt-1">
              <Clock className="w-5 h-5 text-blue-400" />
              {health.currentVelocityPerHour} jug/hr
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">Fin estimado: <strong>{health.projectedEndTimeFormatted}</strong></span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-white/5 shadow-xl text-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Participantes Jugados</span>
          <div className="text-3xl font-black text-white mt-1">
            {pacing.totalPlays} <span className="text-sm font-normal text-gray-500">/ {config.expectedParticipants}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${pacing.completionPercentage}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">{pacing.completionPercentage}% Completado</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-white/5 shadow-xl text-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Ganadores Totales</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {pacing.totalWins}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Tasa: {pacing.totalPlays > 0 ? Math.round((pacing.totalWins / pacing.totalPlays) * 100) : 0}% del total</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-white/5 shadow-xl text-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Perdedores (&quot;Sigue Participando&quot;)</span>
          <div className="text-3xl font-black text-red-400 mt-1">
            {pacing.totalLosses}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Tasa: {pacing.totalPlays > 0 ? Math.round((pacing.totalLosses / pacing.totalPlays) * 100) : 0}% del total</span>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-white/5 shadow-xl text-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Premios Entregados</span>
          <div className="text-3xl font-black text-yellow-400 mt-1">
            {pacing.deliveredPrizes.small + pacing.deliveredPrizes.medium + pacing.deliveredPrizes.big} <span className="text-sm font-normal text-gray-500">/ 604</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">{health.inventoryBurnRatePct}% de stock consumido</span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-400" />
          Estado del Inventario por Categoría (Total Inicial: 604 Premios)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Premios Chicos</span>
              <div className="text-2xl font-black text-white mt-0.5">
                {pacing.remainingPrizes.small} <span className="text-xs text-gray-400 font-normal">/ {config.initialInventory.small} rest.</span>
              </div>
              <span className="text-[10px] text-emerald-300">Entregados: {pacing.deliveredPrizes.small}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🟢
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Premios Medianos</span>
              <div className="text-2xl font-black text-white mt-0.5">
                {pacing.remainingPrizes.medium} <span className="text-xs text-gray-400 font-normal">/ {config.initialInventory.medium} rest.</span>
              </div>
              <span className="text-[10px] text-blue-300">Entregados: {pacing.deliveredPrizes.medium}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              🔵
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-yellow-500/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Premios Grandes (Jackpots)</span>
              <div className="text-2xl font-black text-white mt-0.5">
                {pacing.remainingPrizes.big} <span className="text-xs text-gray-400 font-normal">/ {config.initialInventory.big} rest.</span>
              </div>
              <span className="text-[10px] text-yellow-300">Entregados: {pacing.deliveredPrizes.big}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
              👑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
