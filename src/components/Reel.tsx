import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ALL_REEL_IMAGES } from '../constants/prizes';

interface ReelProps {
  id: number;
  targetImage: string | null;
  isSpinning: boolean;
  stopTriggered: boolean; // parent triggers the stop phase
  onStop: () => void; // callback when this reel stops
}

const ITEM_HEIGHT = 200; // Height of each image item in pixels
const REPEATS = 25; // Repeat images list to create a long track

export const Reel: React.FC<ReelProps> = ({
  id,
  targetImage,
  isSpinning,
  stopTriggered,
  onStop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [stopFlash, setStopFlash] = useState(false);

  // Create a randomized pool of images for the reel strip
  const [reelList] = useState<string[]>(() => {
    const list: string[] = [];
    for (let i = 0; i < REPEATS; i++) {
      const shuffled = [...ALL_REEL_IMAGES].sort(() => 0.5 - Math.random());
      list.push(...shuffled);
    }
    return list;
  });

  // Track animation state with refs to prevent React render lag
  const stateRef = useRef({
    y: 0,
    vy: 0,
    targetY: 0,
    phase: 'idle' as 'idle' | 'spinning' | 'stopping' | 'stopped',
    onStopCalled: false,
  });

  // Helper to determine minimum pixel distance needed for deceleration
  // DEFINED FIRST — used in the stop useEffect below
  const maxSpinDurationPx = useCallback(() => {
    const baseSpeed = 38 + id * 5;
    return baseSpeed * 25;
  }, [id]);

  useEffect(() => {
    let animationFrameId: number;

    // Physics constants
    const maxSpeed = 38 + id * 5;
    const acceleration = 1.2;
    const springK = 0.08;
    const damping = 0.22;

    const updatePhysics = () => {
      const state = stateRef.current;
      const track = trackRef.current;

      if (!track) {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      if (state.phase === 'spinning') {
        if (state.vy < maxSpeed) {
          state.vy += acceleration;
        }
        state.y += state.vy;

        const maxTrackHeight = reelList.length * ITEM_HEIGHT - ITEM_HEIGHT;
        if (state.y >= maxTrackHeight) {
          state.y = state.y % maxTrackHeight;
        }
      } else if (state.phase === 'stopping') {
        const dist = state.y - state.targetY;
        const springForce = -springK * dist;
        const dampingForce = -damping * state.vy;
        const accel = springForce + dampingForce;

        state.vy += accel;
        state.y += state.vy;

        if (Math.abs(dist) < 0.1 && Math.abs(state.vy) < 0.05) {
          state.y = state.targetY;
          state.vy = 0;
          state.phase = 'stopped';

          if (!state.onStopCalled) {
            state.onStopCalled = true;
            onStop();
            // Trigger stop flash effect
            setStopFlash(true);
            setTimeout(() => setStopFlash(false), 120);
          }
        }
      }

      // Apply transformation — direct DOM manipulation for blur (no state re-render)
      track.style.transform = `translateY(-${state.y}px)`;
      const currentBlur = Math.min(12, Math.abs(state.vy) * 0.35);
      track.style.filter = currentBlur > 0.5 ? `blur(${currentBlur}px)` : 'none';

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [reelList, id, onStop]);

  // Handle spin triggers from parent
  useEffect(() => {
    const state = stateRef.current;
    if (isSpinning && state.phase === 'idle') {
      state.phase = 'spinning';
      state.onStopCalled = false;
      state.vy = 0;
    }
  }, [isSpinning]);

  // Handle stop triggers from parent
  useEffect(() => {
    const state = stateRef.current;

    if (stopTriggered && state.phase === 'spinning' && targetImage) {
      const currentIdx = Math.floor(state.y / ITEM_HEIGHT);
      const minLandingIdx = currentIdx + Math.floor(maxSpinDurationPx() / ITEM_HEIGHT);

      let landingIdx = -1;
      for (let i = minLandingIdx; i < reelList.length; i++) {
        if (reelList[i] === targetImage) {
          landingIdx = i;
          break;
        }
      }

      if (landingIdx === -1) {
        for (let i = reelList.length - 1; i >= 0; i--) {
          if (reelList[i] === targetImage) {
            landingIdx = i;
            break;
          }
        }
      }

      state.targetY = landingIdx * ITEM_HEIGHT;
      state.phase = 'stopping';
    }
  }, [stopTriggered, targetImage, reelList, maxSpinDurationPx]);

  // Reset state to idle if not spinning
  useEffect(() => {
    if (!isSpinning && !stopTriggered) {
      const state = stateRef.current;
      state.phase = 'idle';
      state.vy = 0;
      state.onStopCalled = false;
    }
  }, [isSpinning, stopTriggered]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220px] bg-[#0f0506] rounded-2xl border-2 border-yellow-500/50 overflow-hidden flex items-center justify-center reels-glass-overlay shadow-[inset_0_16px_32px_rgba(0,0,0,0.98),inset_0_-16px_32px_rgba(0,0,0,0.98),0_6px_16px_rgba(0,0,0,0.8)]"
    >
      {/* Stop Flash Overlay — brief white burst when reel locks */}
      {stopFlash && (
        <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none rounded-2xl" style={{ animation: 'none' }} />
      )}


      {/* Reel Track container */}
      <div
        ref={trackRef}
        className="absolute top-0 flex flex-col w-full"
        style={{
          height: `${reelList.length * ITEM_HEIGHT}px`,
          willChange: 'transform',
        }}
      >
        {reelList.map((imagePath, index) => (
          <div
            key={`${index}-${imagePath}`}
            className="w-full flex items-center justify-center p-4 select-none pointer-events-none bg-gradient-to-r from-amber-50/95 via-white to-amber-50/95 border-x border-yellow-600/30"
            style={{ height: `${ITEM_HEIGHT}px` }}
          >
            <img
              src={imagePath}
              alt="Slot Symbol"
              className="w-full h-full object-contain filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transform scale-[0.95]"
              draggable="false"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  let placeholderText = '❓';
                  let bgColor = 'bg-gray-800';
                  if (imagePath.includes('small')) {
                    placeholderText = '🟢 Chico';
                    bgColor = 'bg-green-950 border border-green-500/30';
                  } else if (imagePath.includes('medium')) {
                    placeholderText = '🔵 Mediano';
                    bgColor = 'bg-blue-950 border border-blue-500/30';
                  } else if (imagePath.includes('grand')) {
                    placeholderText = '👑 GRANDE';
                    bgColor = 'bg-yellow-950 border border-yellow-500/40';
                  }
                  const isExisting = parent.querySelector('.placeholder-card');
                  if (!isExisting) {
                    const fallbackEl = document.createElement('div');
                    fallbackEl.className = `placeholder-card w-[150px] h-[150px] ${bgColor} rounded-xl flex items-center justify-center font-bold text-center text-sm p-2 text-white shadow-lg`;
                    fallbackEl.innerHTML = `<span>${placeholderText}</span>`;
                    parent.appendChild(fallbackEl);
                  }
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Curved Cylindrical Glass Shading Overlays */}
      <div className="absolute inset-x-0 top-0 h-[50px] bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-[12px] bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-[12px] bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />
    </div>
  );
};
