import type { CalculatedOutcome } from './PrizeEngine';
import { PrizeEngine } from './PrizeEngine';
import { StorageManager } from './StorageManager';
import { InventoryManager } from './InventoryManager';

export class GameEngine {
  private static instance: GameEngine;
  private prizeEngine: PrizeEngine;

  private constructor() {
    this.prizeEngine = PrizeEngine.getInstance();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public playTurn(): CalculatedOutcome {
    const result = this.prizeEngine.determineOutcome();

    const date = new Date();
    const formattedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const inventorySnapshot = InventoryManager.getInstance().getInventory();

    let prizeName = 'Ninguno (Sigue Participando)';
    if (result.prizeTier === 'small') prizeName = 'Premio Chico';
    if (result.prizeTier === 'medium') prizeName = 'Premio Mediano';
    if (result.prizeTier === 'big') prizeName = 'Premio Grande (Jackpot)';

    StorageManager.addPlayHistory({
      id: `PLAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      formattedTime,
      dayNumber: 1,
      outcome: result.outcome,
      prizeTier: result.prizeTier,
      prizeName,
      reelsOutcome: result.reelsOutcome,
      isNearMiss: result.isNearMiss,
      securityCode: result.securityCode,
      inventorySnapshot,
    });

    return result;
  }
}
