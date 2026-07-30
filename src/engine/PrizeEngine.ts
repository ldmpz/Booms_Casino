import type { EventConfig, GameOutcomeType, InventoryState, PacingState, PlayHistoryEntry, PrizeTier } from '../types/engine';
import { ALL_REEL_IMAGES, NEAR_MISS_PROBABILITY, PRIZE_IMAGES } from '../constants/prizes';
import { InventoryManager } from './InventoryManager';
import { StorageManager } from './StorageManager';

export interface CalculatedOutcome {
  outcome: GameOutcomeType;
  prizeTier: PrizeTier | null;
  reelsOutcome: [string, string, string];
  isNearMiss: boolean;
  securityCode: string;
}

export class PrizeEngine {
  private static instance: PrizeEngine;
  private config: EventConfig;
  private inventoryManager: InventoryManager;

  private constructor() {
    this.config = StorageManager.getEventConfig();
    this.inventoryManager = InventoryManager.getInstance();
  }

  public static getInstance(): PrizeEngine {
    if (!PrizeEngine.instance) {
      PrizeEngine.instance = new PrizeEngine();
    }
    return PrizeEngine.instance;
  }

  public getConfig(): EventConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<EventConfig>): void {
    this.config = { ...this.config, ...newConfig };
    StorageManager.saveEventConfig(this.config);
  }

  public determineOutcome(): CalculatedOutcome {
    const history = StorageManager.getPlayHistory();
    const inventory = this.inventoryManager.getInventory();
    const totalPrizesLeft = this.inventoryManager.getTotalPrizesRemaining();
    const totalPlaysSoFar = history.length;
    const remainingParticipants = Math.max(1, this.config.expectedParticipants - totalPlaysSoFar);

    if (this.config.deliveryPaused || totalPrizesLeft <= 0) {
      return this.generateLoseOutcome();
    }

    const baseWinRate = totalPrizesLeft / remainingParticipants;

    const levelMultipliers: Record<EventConfig['deliveryLevel'], number> = {
      VERY_CONSERVATIVE: 0.5,
      CONSERVATIVE: 0.75,
      NORMAL: 1.0,
      PROMOTIONAL: 1.3,
      AGGRESSIVE: 1.7,
    };
    const levelMultiplier = levelMultipliers[this.config.deliveryLevel] || 1.0;

    const initialTotalPrizes =
      this.config.initialInventory.small +
      this.config.initialInventory.medium +
      this.config.initialInventory.big;
    const deliveredPrizesCount = initialTotalPrizes - totalPrizesLeft;

    const targetDeliveryFraction = Math.min(1.0, totalPlaysSoFar / this.config.expectedParticipants);
    const actualDeliveryFraction = initialTotalPrizes > 0 ? deliveredPrizesCount / initialTotalPrizes : 0;

    let paceMultiplier = 1.0;
    if (targetDeliveryFraction > 0) {
      const ratio = actualDeliveryFraction / targetDeliveryFraction;
      paceMultiplier = Math.max(0.4, Math.min(2.0, 1 / (ratio || 1)));
    }

    const effectiveWinRate = Math.min(0.95, baseWinRate * levelMultiplier * paceMultiplier);
    const roll = Math.random();

    if (roll < effectiveWinRate) {
      return this.generateWinOutcome(history, inventory);
    } else {
      return this.generateLoseOutcome();
    }
  }

  private generateWinOutcome(history: PlayHistoryEntry[], inventory: InventoryState): CalculatedOutcome {
    const canWinBig = this.checkBigPrizeEligibility(history, inventory);

    let selectedTier: PrizeTier = 'small';

    if (canWinBig) {
      selectedTier = 'big';
    } else {
      const availableMedium = inventory.medium > 0 ? inventory.medium : 0;
      const availableSmall = inventory.small > 0 ? inventory.small : 0;
      const totalAvail = availableMedium + availableSmall;

      if (totalAvail === 0) {
        return this.generateLoseOutcome();
      }

      const mediumRatio = availableMedium / totalAvail;
      if (Math.random() < mediumRatio && availableMedium > 0) {
        selectedTier = 'medium';
      } else if (availableSmall > 0) {
        selectedTier = 'small';
      } else if (availableMedium > 0) {
        selectedTier = 'medium';
      } else {
        return this.generateLoseOutcome();
      }
    }

    const success = this.inventoryManager.consumePrize(selectedTier);
    if (!success) {
      return this.generateLoseOutcome();
    }

    const outcomeType: GameOutcomeType =
      selectedTier === 'big' ? 'WIN_BIG' : selectedTier === 'medium' ? 'WIN_MEDIUM' : 'WIN_SMALL';

    const tierImages = PRIZE_IMAGES[selectedTier];
    const winningSymbol = tierImages[Math.floor(Math.random() * tierImages.length)];
    const reelsOutcome: [string, string, string] = [winningSymbol, winningSymbol, winningSymbol];
    const securityCode = this.generateSecurityCode(selectedTier);

    return {
      outcome: outcomeType,
      prizeTier: selectedTier,
      reelsOutcome,
      isNearMiss: false,
      securityCode,
    };
  }

  private checkBigPrizeEligibility(history: PlayHistoryEntry[], inventory: InventoryState): boolean {
    if (this.config.bigPrizeLocked || inventory.big <= 0) {
      return false;
    }

    let spinsSinceLastBig = 999999;
    for (let i = 0; i < history.length; i++) {
      if (history[i].outcome === 'WIN_BIG') {
        spinsSinceLastBig = i;
        break;
      }
    }

    if (spinsSinceLastBig < this.config.minBigPrizeGap) {
      return false;
    }

    const totalPlays = history.length;
    const idealInterval = Math.floor(this.config.expectedParticipants / (this.config.initialInventory.big || 1));
    const targetSpin = (4 - inventory.big + 1) * idealInterval;

    if (totalPlays >= targetSpin - 100) {
      const chance = Math.min(0.2, (totalPlays - (targetSpin - 100)) / 200);
      return Math.random() < chance;
    }

    return false;
  }

  private generateLoseOutcome(): CalculatedOutcome {
    const isNearMiss = Math.random() < NEAR_MISS_PROBABILITY;
    let reelsOutcome: [string, string, string];

    if (isNearMiss) {
      // 2 Grand symbols + 1 non-grand symbol from the official 7 images
      const grandImage = PRIZE_IMAGES.big[0];
      const nonGrandPool = [...PRIZE_IMAGES.small, ...PRIZE_IMAGES.medium];
      const nonMatchingImage = nonGrandPool[Math.floor(Math.random() * nonGrandPool.length)];
      reelsOutcome = [grandImage, grandImage, nonMatchingImage];
    } else {
      // 3 non-matching symbols strictly chosen from ALL_REEL_IMAGES (the 7 real images)
      const sym1 = ALL_REEL_IMAGES[Math.floor(Math.random() * ALL_REEL_IMAGES.length)];
      let sym2 = ALL_REEL_IMAGES[Math.floor(Math.random() * ALL_REEL_IMAGES.length)];
      let sym3 = ALL_REEL_IMAGES[Math.floor(Math.random() * ALL_REEL_IMAGES.length)];

      // Ensure sym1, sym2, sym3 do not all match
      while (sym1 === sym2 && sym2 === sym3) {
        sym3 = ALL_REEL_IMAGES[Math.floor(Math.random() * ALL_REEL_IMAGES.length)];
      }
      reelsOutcome = [sym1, sym2, sym3];
    }

    return {
      outcome: 'LOSE',
      prizeTier: null,
      reelsOutcome,
      isNearMiss,
      securityCode: this.generateSecurityCode(null),
    };
  }

  private generateSecurityCode(tier: PrizeTier | null): string {
    const prefix = tier ? tier.toUpperCase().substring(0, 1) : 'L';
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `BL-${prefix}-${rand}`;
  }

  public getPacingState(): PacingState {
    const history = StorageManager.getPlayHistory();
    const inventory = this.inventoryManager.getInventory();
    const totalPlays = history.length;
    const wins = history.filter((h) => h.outcome !== 'LOSE');
    const totalWins = wins.length;
    const totalLosses = totalPlays - totalWins;

    const initialTotalPrizes =
      this.config.initialInventory.small +
      this.config.initialInventory.medium +
      this.config.initialInventory.big;

    const deliveredPrizes: InventoryState = {
      small: this.config.initialInventory.small - inventory.small,
      medium: this.config.initialInventory.medium - inventory.medium,
      big: this.config.initialInventory.big - inventory.big,
    };

    const completionPercentage = Math.min(
      100,
      Math.round((totalPlays / this.config.expectedParticipants) * 100)
    );

    const currentWinRate = totalPlays > 0 ? totalWins / totalPlays : 0;
    const targetWinRate = initialTotalPrizes / this.config.expectedParticipants;

    let pacingStatus: 'BEHIND' | 'ON_PACE' | 'AHEAD' = 'ON_PACE';
    const diff = currentWinRate - targetWinRate;
    if (diff < -0.03) pacingStatus = 'BEHIND';
    else if (diff > 0.03) pacingStatus = 'AHEAD';

    let lastWinTimestamp: number | null = null;
    let lastBigWinTimestamp: number | null = null;
    let spinsSinceLastBigWin = 0;

    for (let i = 0; i < history.length; i++) {
      if (!lastWinTimestamp && history[i].outcome !== 'LOSE') {
        lastWinTimestamp = history[i].timestamp;
      }
      if (history[i].outcome === 'WIN_BIG') {
        if (!lastBigWinTimestamp) {
          lastBigWinTimestamp = history[i].timestamp;
          spinsSinceLastBigWin = i;
        }
      }
    }

    const totalSecondsInEvent = this.config.durationDays * this.config.hoursPerDay * 3600;
    const elapsedSeconds = Math.min(totalSecondsInEvent, totalPlays * 12);
    const remainingSeconds = Math.max(0, totalSecondsInEvent - elapsedSeconds);

    return {
      totalPlays,
      totalWins,
      totalLosses,
      deliveredPrizes,
      remainingPrizes: inventory,
      elapsedSeconds,
      remainingSeconds,
      completionPercentage,
      currentWinRate,
      targetWinRate,
      pacingStatus,
      lastWinTimestamp,
      lastBigWinTimestamp,
      spinsSinceLastBigWin,
    };
  }
}
