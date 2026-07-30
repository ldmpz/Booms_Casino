import React from 'react';

const MARQUEE_BULBS = Array.from({ length: 13 }).map((_, i) => {
  const angle = (i / 12) * Math.PI;
  return {
    id: `m-${i}`,
    left: `${50 - 46 * Math.cos(angle)}%`,
    top: `${88 - 78 * Math.sin(angle)}%`,
    transform: 'translate(-50%, -50%)',
  };
});

interface MarqueeArchProps {
  isSpinning: boolean;
  onLogoClick: () => void;
}

export const MarqueeArch: React.FC<MarqueeArchProps> = ({ isSpinning, onLogoClick }) => {
  return (
    <div className="absolute top-[-75px] sm:top-[-115px] md:top-[-145px] left-1/2 -translate-x-1/2 w-[240px] sm:w-[350px] md:w-[460px] h-[85px] sm:h-[135px] md:h-[165px] z-20 flex flex-col items-center justify-center pt-2 md:pt-4 select-none pointer-events-none">
      <div
        className="absolute inset-0 p-[3px] sm:p-[5px] bg-gold-metallic shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_25px_rgba(234,179,8,0.4)]"
        style={{ borderRadius: '135px 135px 0 0' }}
      >
        <div
          className="w-full h-full bg-gradient-to-b from-[#c40018] via-[#e6001a] to-[#78000b] border border-yellow-300/50 relative shadow-[inset_0_6px_12px_rgba(255,255,255,0.4)]"
          style={{ borderRadius: '130px 130px 0 0' }}
        />
      </div>

      {MARQUEE_BULBS.map((bulb, i) => (
        <div
          key={bulb.id}
          className={`absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full z-25 ${
            isSpinning
              ? i % 2 === 0
                ? 'animate-bulb-3d-fast-odd'
                : 'animate-bulb-3d-fast-even'
              : i % 2 === 0
              ? 'animate-bulb-3d-odd'
              : 'animate-bulb-3d-even'
          }`}
          style={{ left: bulb.left, top: bulb.top, transform: bulb.transform }}
        />
      ))}

      <div
        onClick={onLogoClick}
        className="relative z-10 flex flex-col items-center justify-center cursor-pointer pointer-events-auto group"
      >
        <h1
          className="font-anton text-xl sm:text-4xl md:text-5xl tracking-[0.24em] text-white text-center select-none transform group-hover:scale-105 transition-transform"
          style={{
            textShadow: '0 3px 0 #85000d, 0 6px 0 #4a0007, 0 8px 25px rgba(0,0,0,0.95), 0 0 30px rgba(250,204,21,0.5)',
          }}
        >
          BOOMS<span className="text-yellow-400">LAB</span>
        </h1>
      </div>
    </div>
  );
};
