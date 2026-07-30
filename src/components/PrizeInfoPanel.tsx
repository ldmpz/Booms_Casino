import React from 'react';
import { Gift, Award, Gem } from 'lucide-react';
import { PRIZE_IMAGES } from '../constants/prizes';

export const PrizeInfoPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-5 w-full max-w-4xl z-10 px-2 mt-5">
      
      {/* Small Prizes Panel */}
      <div 
        className="relative bg-gradient-to-b from-black/90 via-zinc-950/80 to-black/95 rounded-3xl p-4 md:p-5 border-2 border-emerald-500/50 flex flex-col items-center justify-between text-center backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] group hover:border-emerald-400 transition-all duration-300"
      >
        {/* Decorative emerald glow bar at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-emerald-500 via-green-300 to-emerald-500 rounded-b-full blur-[1px]" />

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-b from-emerald-950 to-black border border-emerald-500/60 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Gift className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
            Premios Chicos
          </span>
          <span className="text-[10px] md:text-xs font-black text-emerald-400 tracking-widest uppercase text-glow-green mt-1">
            Frecuentes
          </span>
        </div>

        {/* Thumbnail Preview Images */}
        <div className="flex justify-center gap-2 md:gap-3 mt-4 pt-3 border-t border-emerald-500/20 w-full">
          {PRIZE_IMAGES.small.map((imgUrl, i) => (
            <div 
              key={i} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/80 border border-emerald-500/30 p-1.5 flex items-center justify-center overflow-hidden hover:scale-110 hover:border-emerald-400 shadow-md transition-all duration-300"
            >
              <img 
                src={imgUrl} 
                alt="Chico icon" 
                className="w-full h-full object-contain filter drop-shadow-md" 
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl">🟢</span>';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Medium Prizes Panel */}
      <div 
        className="relative bg-gradient-to-b from-black/90 via-zinc-950/80 to-black/95 rounded-3xl p-4 md:p-5 border-2 border-blue-500/50 flex flex-col items-center justify-between text-center backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(59,130,246,0.15)] group hover:border-blue-400 transition-all duration-300"
      >
        {/* Decorative sapphire glow bar at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 via-sky-300 to-blue-500 rounded-b-full blur-[1px]" />

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-b from-blue-950 to-black border border-blue-500/60 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Award className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
            Premios Medianos
          </span>
          <span className="text-[10px] md:text-xs font-black text-blue-400 tracking-widest uppercase text-glow-blue mt-1">
            Ocasionales
          </span>
        </div>

        {/* Thumbnail Preview Images */}
        <div className="flex justify-center gap-2 md:gap-3 mt-4 pt-3 border-t border-blue-500/20 w-full">
          {PRIZE_IMAGES.medium.map((imgUrl, i) => (
            <div 
              key={i} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/80 border border-blue-500/30 p-1.5 flex items-center justify-center overflow-hidden hover:scale-110 hover:border-blue-400 shadow-md transition-all duration-300"
            >
              <img 
                src={imgUrl} 
                alt="Mediano icon" 
                className="w-full h-full object-contain filter drop-shadow-md" 
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl">🔵</span>';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Grand Prize Panel */}
      <div 
        className="relative bg-gradient-to-b from-black/90 via-amber-950/40 to-black/95 rounded-3xl p-4 md:p-5 border-2 border-yellow-500/70 flex flex-col items-center justify-between text-center backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(234,179,8,0.25)] group hover:border-yellow-400 transition-all duration-300"
      >
        {/* Decorative gold glow bar at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-yellow-500 via-amber-200 to-yellow-500 rounded-b-full blur-[1px]" />

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-b from-amber-950 to-black border border-yellow-400/80 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-105 transition-transform shadow-[0_0_18px_rgba(250,204,21,0.4)]">
            <Gem className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
          </div>
          <span className="text-xs md:text-sm font-black text-white uppercase tracking-wider">
            Premio Grande
          </span>
          <span className="text-[10px] md:text-xs font-black text-yellow-400 tracking-widest uppercase text-glow-gold mt-1">
            Muy Difícil
          </span>
        </div>

        {/* Thumbnail Preview Image */}
        <div className="flex justify-center mt-4 pt-3 border-t border-yellow-500/20 w-full">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/80 border-2 border-yellow-500/50 p-1.5 flex items-center justify-center overflow-hidden hover:scale-110 hover:border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all duration-300">
            <img 
              src={PRIZE_IMAGES.big[0]} 
              alt="Grande icon" 
              className="w-full h-full object-contain filter drop-shadow-md" 
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-xl">👑</span>';
                }
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
export default PrizeInfoPanel;
