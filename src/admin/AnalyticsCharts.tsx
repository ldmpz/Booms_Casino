import React from 'react';
import { StatisticsEngine } from '../engine/StatisticsEngine';
import { BarChart3, TrendingUp } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const hourlyData = StatisticsEngine.getHourlyBreakdown();

  const maxPlays = Math.max(10, ...hourlyData.map((d) => d.totalPlays));

  return (
    <div className="space-y-6">
      {/* Hourly Velocity Chart */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Participación de Jugadores por Hora
        </h3>
        <span className="text-xs text-gray-400 block mb-6">Frecuencia de tiradas acumuladas desglosadas por franja horaria</span>

        {hourlyData.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No hay suficientes datos registrados en el historial para mostrar la gráfica por hora.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-white/10">
              {hourlyData.map((item, idx) => {
                const heightPct = Math.max(8, Math.round((item.totalPlays / maxPlays) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                      {item.hourLabel}: {item.totalPlays} jugadas ({item.wins} victorias)
                    </div>

                    <div className="w-full bg-gradient-to-t from-purple-800 to-indigo-500 rounded-t-lg transition-all group-hover:brightness-125" style={{ height: `${heightPct}%` }} />
                    <span className="text-[9px] text-gray-400 rotate-45 sm:rotate-0 mt-1">{item.hourLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hourly Wins vs Losses Comparison */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Distribución de Resultados (Ganadores vs Perdedores por Hora)
        </h3>
        <span className="text-xs text-gray-400 block mb-6">Comparativa visual de entregas de premios contra perdedores</span>

        {hourlyData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Sin datos aún</div>
        ) : (
          <div className="space-y-3">
            {hourlyData.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 w-16">{item.hourLabel}</span>

                <div className="flex-1 mx-4 flex h-3 rounded-full overflow-hidden bg-gray-800">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${item.totalPlays > 0 ? (item.wins / item.totalPlays) * 100 : 0}%` }}
                    title={`Ganadores: ${item.wins}`}
                  />
                  <div
                    className="bg-red-500/80 h-full"
                    style={{ width: `${item.totalPlays > 0 ? (item.losses / item.totalPlays) * 100 : 0}%` }}
                    title={`Perdedores: ${item.losses}`}
                  />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-bold">{item.wins} G</span>
                  <span className="text-red-400 font-bold">{item.losses} P</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
