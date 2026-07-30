import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ALL_REEL_IMAGES } from '../constants/prizes';

interface ReelProps {
  id: number;
  targetImage: string | null;
  isSpinning: boolean;
  stopTriggered: boolean;
  onStop: () => void;
}

const REPEATS = 25;

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

  const [itemHeight, setItemHeight] = useState(200);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) setItemHeight(h);
      }
    });
    obs.observe(el);
    setItemHeight(el.getBoundingClientRect().height || 200);
    return () => obs.disconnect();
  }, []);

  const [reelList] = useState<string[]>(() => {
    const list: string[] = [];
    for (let i = 0; i < REPEATS; i++) {
      const shuffled = [...ALL_REEL_IMAGES].sort(() => 0.5 - Math.random());
      list.push(...shuffled);
    }
    return list;
  });

  const stateRef = useRef({
    y: 0,
    vy: 0,
    targetY: 0,
    phase: 'idle' as 'idle' | 'spinning' | 'stopping' | 'stopped',
    onStopCalled: false,
  });

  const maxSpinDurationPx = useCallback(() => {
    const baseSpeed = 38 + id * 5;
    return baseSpeed * 25;
  }, [id]);

  useEffect(() => {
    let animationFrameId: number;

    const maxSpeed = 38 + id * 5;
    const acceleration = 1.2;
    const springK = 0.08;
    const damping = 0.22;

    const updatePhysics = () => {
      const state = stateRef.current;
      const track = trackRef.current;
      const ITEM_H = itemHeight;

      if (!track) {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      if (state.phase === 'spinning') {
        if (state.vy < maxSpeed) {
          state.vy += acceleration;
        }
        state.y += state.vy;

        const maxTrackHeight = reelList.length * ITEM_H - ITEM_H;
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
            setStopFlash(true);
            setTimeout(() => setStopFlash(false), 120);
          }
        }
      }

      track.style.transform = `translateY(-${state.y}px)`;
      const currentBlur = Math.min(12, Math.abs(state.vy) * 0.35);
      track.style.filter = currentBlur > 0.5 ? `blur(${currentBlur}px)` : 'none';

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [reelList, id, onStop, itemHeight]);

  useEffect(() => {
    const state = stateRef.current;
    if (isSpinning && state.phase === 'idle') {
      state.phase = 'spinning';
      state.onStopCalled = false;
      state.vy = 0;
    }
  }, [isSpinning]);

  useEffect(() => {
    const state = stateRef.current;

    if (stopTriggered && state.phase === 'spinning' && targetImage) {
      const currentIdx = Math.floor(state.y / itemHeight);
      const minLandingIdx = currentIdx + Math.floor(maxSpinDurationPx() / itemHeight);

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

      state.targetY = landingIdx * itemHeight;
      state.phase = 'stopping';
    }
  }, [stopTriggered, targetImage, reelList, maxSpinDurationPx, itemHeight]);

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
      className="relative w-full h-[155px] sm:h-[185px] md:h-[220px] bg-[#0f0506] rounded-xl sm:rounded-2xl border-2 border-yellow-500/50 overflow-hidden flex items-center justify-center reels-glass-overlay shadow-[inset_0_16px_32px_rgba(0,0,0,0.98),inset_0_-16px_32px_rgba(0,0,0,0.98),0_6px_16px_rgba(0,0,0,0.8)]"
    >
      {stopFlash && (
        <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none rounded-2xl" />
      )}

      <div
        ref={trackRef}
        className="absolute top-0 flex flex-col w-full"
        style={{
          height: `${reelList.length * itemHeight}px`,
          willChange: 'transform',
        }}
      >
        {reelList.map((imagePath, index) => (
          <div
            key={`${index}-${imagePath}`}
            className="w-full flex items-center justify-center select-none pointer-events-none bg-gradient-to-r from-amber-50/95 via-white to-amber-50/95 border-x border-yellow-600/30"
            style={{ height: `${itemHeight}px`, padding: `${Math.round(itemHeight * 0.07)}px` }}
          >
            <img
              src={imagePath}
              alt="Slot Symbol"
              className="w-full h-full object-contain filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transform scale-[0.95]"
              draggable="false"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 h-[50px] bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-[12px] bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-[12px] bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10" />
    </div>
  );
};
