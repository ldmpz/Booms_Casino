export type PrizeTier = 'small' | 'medium' | 'big';

export type GameOutcomeType = 'WIN_SMALL' | 'WIN_MEDIUM' | 'WIN_BIG' | 'LOSE';

export type DeliveryLevel = 'VERY_CONSERVATIVE' | 'CONSERVATIVE' | 'NORMAL' | 'PROMOTIONAL' | 'AGGRESSIVE';

export interface PrizeConfig {
  id: string;
  name: string;
  tier: PrizeTier;
  glowColor: string;
  textColor: string;
  bannerText: string;
  subText: string;
}

export interface InventoryState {
  small: number;
  medium: number;
  big: number;
}

export interface EventConfig {
  eventName: string;
  expectedParticipants: number;
  durationDays: number;
  hoursPerDay: number;
  initialInventory: InventoryState;
  minBigPrizeGap: number; // Minimum number of spins between Big Prize wins
  bigPrizeLocked: boolean;
  deliveryLevel: DeliveryLevel;
  deliveryPaused: boolean;
  adminPin: string;
}

export interface PlayHistoryEntry {
  id: string;
  timestamp: number;
  formattedTime: string;
  dayNumber: number;
  outcome: GameOutcomeType;
  prizeTier: PrizeTier | null;
  prizeName: string;
  reelsOutcome: [string, string, string];
  isNearMiss: boolean;
  securityCode: string;
  inventorySnapshot: InventoryState;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  formattedTime: string;
  adminUser: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface PacingState {
  totalPlays: number;
  totalWins: number;
  totalLosses: number;
  deliveredPrizes: InventoryState;
  remainingPrizes: InventoryState;
  elapsedSeconds: number;
  remainingSeconds: number;
  completionPercentage: number;
  currentWinRate: number; // Decimal e.g. 0.12 = 12%
  targetWinRate: number;  // Expected win rate at this moment
  pacingStatus: 'BEHIND' | 'ON_PACE' | 'AHEAD';
  lastWinTimestamp: number | null;
  lastBigWinTimestamp: number | null;
  spinsSinceLastBigWin: number;
}

export interface SimulationResult {
  simulatedSpins: number;
  totalWins: number;
  totalLosses: number;
  deliveredSmall: number;
  deliveredMedium: number;
  deliveredBig: number;
  remainingSmall: number;
  remainingMedium: number;
  remainingBig: number;
  winRate: number;
  burnRatePercentage: number;
  outcomesBreakdown: {
    WIN_SMALL: number;
    WIN_MEDIUM: number;
    WIN_BIG: number;
    LOSE: number;
  };
}
