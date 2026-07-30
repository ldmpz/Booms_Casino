export type PrizeTier = 'small' | 'medium' | 'big';

export interface PrizeConfig {
  id: string;
  name: string;
  tier: PrizeTier;
  glowColor: string; // Tailwind class like shadow-green-500, glow-green
  textColor: string; // Tailwind class
  bannerText: string;
  subText: string;
}

export const PRIZE_TIERS: Record<PrizeTier, PrizeConfig> = {
  small: {
    id: 'small',
    name: 'Premio Chico',
    tier: 'small',
    glowColor: 'rgba(74, 222, 128, 0.8)', // Green glow
    textColor: 'text-green-400 text-glow-green',
    bannerText: '¡Felicidades!',
    subText: 'Ganaste un Premio Chico',
  },
  medium: {
    id: 'medium',
    name: 'Premio Mediano',
    tier: 'medium',
    glowColor: 'rgba(96, 165, 250, 0.8)', // Blue glow
    textColor: 'text-blue-400 text-glow-blue',
    bannerText: '¡Excelente!',
    subText: 'Ganaste un Premio Mediano',
  },
  big: {
    id: 'big',
    name: 'Premio Grande',
    tier: 'big',
    glowColor: 'rgba(250, 204, 21, 0.9)', // Golden glow
    textColor: 'text-yellow-400 text-glow-gold font-extrabold',
    bannerText: '¡¡¡PREMIO GRANDE!!!',
    subText: '¡Te llevas el premio mayor!',
  },
};

// Default probabilities (must add up to 100 or be proportional)
export const DEFAULT_PRIZE_WEIGHTS = {
  small: 80,
  medium: 19,
  big: 1,
};

// Default inventory amounts
export const DEFAULT_INVENTORY = {
  small: 300,
  medium: 100,
  big: 5,
};

// Image mappings. These files will be served from the public folder.
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
};

// All available images listed together for reel spinning decoration
export const ALL_REEL_IMAGES = [
  ...PRIZE_IMAGES.small,
  ...PRIZE_IMAGES.medium,
  ...PRIZE_IMAGES.big,
];

// Near miss (casi-ganador) probability when spinning a non-jackpot
export const NEAR_MISS_PROBABILITY = 0.25; // 25% chance of near-miss
