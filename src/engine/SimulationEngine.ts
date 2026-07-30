import type { EventConfig, InventoryState, SimulationResult } from '../types/engine';
import { DEFAULT_EVENT_CONFIG, DEFAULT_INVENTORY } from '../constants/prizes';

export class SimulationEngine {
  public static runSimulation(
    spinCount: number,
    customConfig?: Partial<EventConfig>,
    customStock?: InventoryState
  ): SimulationResult {
    const config: EventConfig = {
      ...DEFAULT_EVENT_CONFIG,
      ...customConfig,
      expectedParticipants: Math.max(spinCount, customConfig?.expectedParticipants || 5000),
    };

    const inventory: InventoryState = customStock
      ? { ...customStock }
      : { ...DEFAULT_INVENTORY };

    const initialTotalPrizes = inventory.small + inventory.medium + inventory.big;

    let totalWins = 0;
    let totalLosses = 0;
    let deliveredSmall = 0;
    let deliveredMedium = 0;
    let deliveredBig = 0;

    let lastBigWinIndex = -99999;

    const levelMultipliers: Record<EventConfig['deliveryLevel'], number> = {
      VERY_CONSERVATIVE: 0.5,
      CONSERVATIVE: 0.75,
      NORMAL: 1.0,
      PROMOTIONAL: 1.3,
      AGGRESSIVE: 1.7,
    };
    const levelMultiplier = levelMultipliers[config.deliveryLevel] || 1.0;

    for (let spin = 1; spin <= spinCount; spin++) {
      const remainingPrizes = inventory.small + inventory.medium + inventory.big;
      const remainingSpinners = Math.max(1, spinCount - spin + 1);

      if (remainingPrizes <= 0 || config.deliveryPaused) {
        totalLosses++;
        continue;
      }

      const baseWinRate = remainingPrizes / remainingSpinners;

      const targetDeliveryFrac = spin / spinCount;
      const actualDeliveryFrac = (initialTotalPrizes - remainingPrizes) / initialTotalPrizes;
      let paceMultiplier = 1.0;
      if (targetDeliveryFrac > 0) {
        const ratio = actualDeliveryFrac / targetDeliveryFrac;
        paceMultiplier = Math.max(0.4, Math.min(2.0, 1 / (ratio || 1)));
      }

      const effectiveWinRate = Math.min(0.95, baseWinRate * levelMultiplier * paceMultiplier);
      const isWin = Math.random() < effectiveWinRate;

      if (!isWin) {
        totalLosses++;
        continue;
      }

      const spinsSinceBig = spin - lastBigWinIndex;
      const canBig = !config.bigPrizeLocked && inventory.big > 0 && spinsSinceBig >= config.minBigPrizeGap;

      let wonTier: 'small' | 'medium' | 'big' = 'small';

      if (canBig && Math.random() < 0.15) {
        wonTier = 'big';
        lastBigWinIndex = spin;
      } else {
        const availableMedium = inventory.medium;
        const availableSmall = inventory.small;
        const totalAvail = availableMedium + availableSmall;

        if (totalAvail === 0) {
          if (inventory.big > 0 && canBig) {
            wonTier = 'big';
            lastBigWinIndex = spin;
          } else {
            totalLosses++;
            continue;
          }
        } else {
          const medFrac = availableMedium / totalAvail;
          if (Math.random() < medFrac && availableMedium > 0) {
            wonTier = 'medium';
          } else if (availableSmall > 0) {
            wonTier = 'small';
          } else if (availableMedium > 0) {
            wonTier = 'medium';
          } else {
            totalLosses++;
            continue;
          }
        }
      }

      if (inventory[wonTier] > 0) {
        inventory[wonTier]--;
        totalWins++;
        if (wonTier === 'small') deliveredSmall++;
        if (wonTier === 'medium') deliveredMedium++;
        if (wonTier === 'big') deliveredBig++;
      } else {
        totalLosses++;
      }
    }

    const totalDelivered = deliveredSmall + deliveredMedium + deliveredBig;
    const winRate = spinCount > 0 ? (totalWins / spinCount) * 100 : 0;
    const burnRatePercentage = initialTotalPrizes > 0 ? (totalDelivered / initialTotalPrizes) * 100 : 0;

    return {
      simulatedSpins: spinCount,
      totalWins,
      totalLosses,
      deliveredSmall,
      deliveredMedium,
      deliveredBig,
      remainingSmall: inventory.small,
      remainingMedium: inventory.medium,
      remainingBig: inventory.big,
      winRate: Math.round(winRate * 10) / 10,
      burnRatePercentage: Math.round(burnRatePercentage * 10) / 10,
      outcomesBreakdown: {
        WIN_SMALL: deliveredSmall,
        WIN_MEDIUM: deliveredMedium,
        WIN_BIG: deliveredBig,
        LOSE: totalLosses,
      },
    };
  }
}
