import type { InventoryState, PrizeTier } from '../types/engine';
import { StorageManager } from './StorageManager';

export class InventoryManager {
  private static instance: InventoryManager;
  private inventory: InventoryState;

  private constructor() {
    this.inventory = StorageManager.getInventory();
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  public getInventory(): InventoryState {
    return { ...this.inventory };
  }

  public setInventory(newInventory: InventoryState): void {
    this.inventory = {
      small: Math.max(0, Math.floor(newInventory.small)),
      medium: Math.max(0, Math.floor(newInventory.medium)),
      big: Math.max(0, Math.floor(newInventory.big)),
    };
    StorageManager.saveInventory(this.inventory);
  }

  public isAvailable(tier: PrizeTier): boolean {
    return this.inventory[tier] > 0;
  }

  public getTotalPrizesRemaining(): number {
    return this.inventory.small + this.inventory.medium + this.inventory.big;
  }

  public consumePrize(tier: PrizeTier): boolean {
    if (this.inventory[tier] <= 0) {
      return false;
    }
    this.inventory[tier] -= 1;
    StorageManager.saveInventory(this.inventory);
    return true;
  }

  public resetToDefault(initialStock?: InventoryState): void {
    if (initialStock) {
      this.setInventory(initialStock);
    } else {
      this.setInventory({ small: 500, medium: 100, big: 4 });
    }
  }
}
