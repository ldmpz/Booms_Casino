import type { EventConfig, InventoryState, PrizeConfig, PrizeTier } from '../types/engine';

import small1 from '../assets/images/prizes/small1.png';
import small2 from '../assets/images/prizes/small2.png';
import small3 from '../assets/images/prizes/small3.png';
import medium1 from '../assets/images/prizes/medium1.png';
import medium2 from '../assets/images/prizes/medium2.png';
import medium3 from '../assets/images/prizes/medium3.png';
import grand from '../assets/images/prizes/grand.png';
import casinoBg from '../assets/images/casino_bg.png';

export type { PrizeTier, PrizeConfig, InventoryState, EventConfig };

export const CASINO_BG_IMAGE = casinoBg;

export const DEFAULT_INVENTORY: InventoryState = {
  small: 500,
  medium: 100,
  big: 4,
};

export const DEFAULT_PRIZE_WEIGHTS = {
  small: 80,
  medium: 19,
  big: 1,
};

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventName: 'BOOMS LAB Expo 2026',
  expectedParticipants: 5000,
  durationDays: 2,
  hoursPerDay: 8,
  initialInventory: { ...DEFAULT_INVENTORY },
  minBigPrizeGap: 400,
  bigPrizeLocked: false,
  deliveryLevel: 'NORMAL',
  deliveryPaused: false,
  adminPin: '2026',
};

export const PRIZE_TIERS: Record<PrizeTier, PrizeConfig> = {
  small: {
    id: 'small',
    name: 'Premio Chico',
    tier: 'small',
    glowColor: 'rgba(74, 222, 128, 0.8)',
    textColor: 'text-green-400 text-glow-green',
    bannerText: '¡Felicidades!',
    subText: '¡Te has ganado un Premio Chico!',
  },
  medium: {
    id: 'medium',
    name: 'Premio Mediano',
    tier: 'medium',
    glowColor: 'rgba(96, 165, 250, 0.8)',
    textColor: 'text-blue-400 text-glow-blue',
    bannerText: '¡Excelente Jugada!',
    subText: '¡Te llevas un Premio Mediano!',
  },
  big: {
    id: 'big',
    name: 'Premio Grande',
    tier: 'big',
    glowColor: 'rgba(250, 204, 21, 0.9)',
    textColor: 'text-yellow-400 text-glow-gold font-extrabold',
    bannerText: '¡¡¡GRAN JACKPOT BOOMS LAB!!!',
    subText: '¡¡TE LLEVAS EL PREMIO MAYOR!!',
  },
};

// Official 7 prize images imported as Vite ESM asset modules
export const PRIZE_IMAGES = {
  small: [small1, small2, small3],
  medium: [medium1, medium2, medium3],
  big: [grand],
};

// All 7 official reel images
export const ALL_REEL_IMAGES = [
  ...PRIZE_IMAGES.small,
  ...PRIZE_IMAGES.medium,
  ...PRIZE_IMAGES.big,
];

export const NEAR_MISS_PROBABILITY = 0.30;
