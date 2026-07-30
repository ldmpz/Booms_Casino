import type { EventConfig, InventoryState, PrizeConfig, PrizeTier } from '../types/engine';

export type { PrizeTier, PrizeConfig, InventoryState, EventConfig };

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

export const PRIZE_IMAGES = {
  small: [
    '/images/prizes/small1.png',
    '/images/prizes/small2.png',
    '/images/prizes/small3.png',
  ],
  medium: [
    '/images/prizes/medium1.png',
    '/images/prizes/medium2.png',
    '/images/prizes/medium3.png',
  ],
  big: [
    '/images/prizes/grand.png',
  ],
  lose: [
    '/images/prizes/lose1.png',
    '/images/prizes/lose2.png',
  ],
};

export const ALL_REEL_IMAGES = [
  ...PRIZE_IMAGES.small,
  ...PRIZE_IMAGES.medium,
  ...PRIZE_IMAGES.big,
  ...PRIZE_IMAGES.lose,
];

export const NEAR_MISS_PROBABILITY = 0.30;
