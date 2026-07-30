import {
  type PrizeTier,
  DEFAULT_PRIZE_WEIGHTS,
  DEFAULT_INVENTORY,
  PRIZE_IMAGES,
  NEAR_MISS_PROBABILITY,
} from '../constants/prizes';

export interface GameSettings {
  mode: 'probability' | 'inventory';
  weights: typeof DEFAULT_PRIZE_WEIGHTS;
  inventory: typeof DEFAULT_INVENTORY;
}

const STORAGE_KEY = 'booms_casino_settings';

// Helper to get settings from local storage or set defaults
export function getGameSettings(): GameSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure schema matches
      if (parsed.mode && parsed.weights && parsed.inventory) {
        return parsed as GameSettings;
      }
    }
  } catch (e) {
    console.error('Error reading game settings from localStorage', e);
  }

  // Default initial settings
  const defaults: GameSettings = {
    mode: 'probability',
    weights: { ...DEFAULT_PRIZE_WEIGHTS },
    inventory: { ...DEFAULT_INVENTORY },
  };
  saveGameSettings(defaults);
  return defaults;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving game settings to localStorage', e);
  }
}

export interface SpinResult {
  prizeTier: PrizeTier;
  reelsOutcome: [string, string, string]; // Images for Reel 1, Reel 2, Reel 3
  isNearMiss: boolean;
}

export function determineSpinResult(settings: GameSettings): SpinResult {
  let selectedTier: PrizeTier = 'small';

  if (settings.mode === 'probability') {
    // Probability Mode selection
    const weights = settings.weights;
    const totalWeight = weights.small + weights.medium + weights.big;
    const randomValue = Math.random() * totalWeight;

    if (randomValue < weights.big) {
      selectedTier = 'big';
    } else if (randomValue < weights.big + weights.medium) {
      selectedTier = 'medium';
    } else {
      selectedTier = 'small';
    }
  } else {
    // Inventory Mode selection
    const inventory = settings.inventory;
    const availableTiers: PrizeTier[] = [];

    // Add tiers to selection pool only if they have inventory remaining
    if (inventory.big > 0) availableTiers.push('big');
    if (inventory.medium > 0) availableTiers.push('medium');
    if (inventory.small > 0) availableTiers.push('small');

    if (availableTiers.length === 0) {
      // Fallback if absolutely everything is zero
      selectedTier = 'small';
    } else if (availableTiers.length === 1) {
      selectedTier = availableTiers[0];
    } else {
      // We choose among available tiers based on their relative probabilities
      const weights = settings.weights;
      let totalAvailableWeight = 0;
      availableTiers.forEach((tier) => {
        totalAvailableWeight += weights[tier];
      });

      const randomValue = Math.random() * totalAvailableWeight;
      let cumulativeWeight = 0;

      for (const tier of availableTiers) {
        cumulativeWeight += weights[tier];
        if (randomValue < cumulativeWeight) {
          selectedTier = tier;
          break;
        }
      }
    }

    // Decrement inventory for selected tier
    if (settings.inventory[selectedTier] > 0) {
      settings.inventory[selectedTier]--;
      saveGameSettings(settings);
    }
  }

  // Process near miss
  let isNearMiss = false;
  if (selectedTier !== 'big') {
    // Only allow near miss if Grande has inventory (if in inventory mode)
    const canNearMiss = settings.mode === 'probability' || settings.inventory.big > 0;
    if (canNearMiss && Math.random() < NEAR_MISS_PROBABILITY) {
      isNearMiss = true;
    }
  }

  // Determine actual reel images
  let reelsOutcome: [string, string, string];

  if (selectedTier === 'big') {
    // Grand Prize always lands all three grand images
    const grandImage = PRIZE_IMAGES.big[0];
    reelsOutcome = [grandImage, grandImage, grandImage];
  } else if (isNearMiss) {
    // Near Miss: Reel 1 and Reel 2 show Grand, Reel 3 shows the won tier's image
    const grandImage = PRIZE_IMAGES.big[0];
    const tierImages = PRIZE_IMAGES[selectedTier];
    const randomTierImage = tierImages[Math.floor(Math.random() * tierImages.length)];
    reelsOutcome = [grandImage, grandImage, randomTierImage];
  } else {
    // Normal Win: All three reels show the same image from the won tier's pool
    const tierImages = PRIZE_IMAGES[selectedTier];
    const matchingImage = tierImages[Math.floor(Math.random() * tierImages.length)];
    reelsOutcome = [matchingImage, matchingImage, matchingImage];
  }

  return {
    prizeTier: selectedTier,
    reelsOutcome,
    isNearMiss,
  };
}
