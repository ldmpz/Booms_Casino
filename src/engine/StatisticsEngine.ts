import { StorageManager } from './StorageManager';
import { InventoryManager } from './InventoryManager';
import { PrizeEngine } from './PrizeEngine';

export interface HourlyStat {
  hourLabel: string;
  totalPlays: number;
  wins: number;
  losses: number;
  smallDelivered: number;
  mediumDelivered: number;
  bigDelivered: number;
}

export interface EventHealthMetrics {
  healthStatus: 'OPTIMAL' | 'ATTENTION' | 'WARNING' | 'CRITICAL';
  statusMessage: string;
  averageSecsBetweenWins: number;
  currentVelocityPerHour: number;
  projectedEndTimeFormatted: string;
  inventoryBurnRatePct: number;
}

export class StatisticsEngine {
  public static getHourlyBreakdown(): HourlyStat[] {
    const history = StorageManager.getPlayHistory();
    const map = new Map<string, HourlyStat>();

    // Sort ascending by time
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach((item) => {
      const date = new Date(item.timestamp);
      const hourStr = `${date.getHours().toString().padStart(2, '0')}:00`;
      
      if (!map.has(hourStr)) {
        map.set(hourStr, {
          hourLabel: hourStr,
          totalPlays: 0,
          wins: 0,
          losses: 0,
          smallDelivered: 0,
          mediumDelivered: 0,
          bigDelivered: 0,
        });
      }

      const stat = map.get(hourStr)!;
      stat.totalPlays += 1;

      if (item.outcome === 'LOSE') {
        stat.losses += 1;
      } else {
        stat.wins += 1;
        if (item.prizeTier === 'small') stat.smallDelivered += 1;
        if (item.prizeTier === 'medium') stat.mediumDelivered += 1;
        if (item.prizeTier === 'big') stat.bigDelivered += 1;
      }
    });

    return Array.from(map.values());
  }

  public static getHealthMetrics(): EventHealthMetrics {
    const prizeEngine = PrizeEngine.getInstance();
    const pacing = prizeEngine.getPacingState();
    const inventoryManager = InventoryManager.getInstance();
    const history = StorageManager.getPlayHistory();

    const totalPrizesRemaining = inventoryManager.getTotalPrizesRemaining();
    const initialTotalPrizes = 604;
    const deliveredCount = initialTotalPrizes - totalPrizesRemaining;
    const inventoryBurnRatePct = Math.min(100, Math.round((deliveredCount / initialTotalPrizes) * 100));

    // Calculate average seconds between wins
    let averageSecsBetweenWins = 0;
    const wins = history.filter((h) => h.outcome !== 'LOSE');
    if (wins.length >= 2) {
      const timeSpanMs = wins[0].timestamp - wins[wins.length - 1].timestamp;
      averageSecsBetweenWins = Math.round(timeSpanMs / 1000 / wins.length);
    }

    // Velocity per hour
    const recent = history.slice(0, 50);
    let currentVelocityPerHour = 0;
    if (recent.length >= 2) {
      const spanMs = recent[0].timestamp - recent[recent.length - 1].timestamp;
      if (spanMs > 0) {
        currentVelocityPerHour = Math.round((recent.length / (spanMs / 1000 / 3600)));
      }
    }

    // Estimate completion time
    const remainingParticipants = Math.max(0, 5000 - pacing.totalPlays);
    const estSecsToComplete = currentVelocityPerHour > 0 ? (remainingParticipants / currentVelocityPerHour) * 3600 : remainingParticipants * 15;
    const estCompletionDate = new Date(Date.now() + estSecsToComplete * 1000);
    const projectedEndTimeFormatted = estCompletionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Health Status logic
    let healthStatus: EventHealthMetrics['healthStatus'] = 'OPTIMAL';
    let statusMessage = 'Motor en ritmo perfecto. Distribución equilibrada.';

    if (totalPrizesRemaining === 0) {
      healthStatus = 'WARNING';
      statusMessage = 'Inventario completado. Todos los premios entregados.';
    } else if (pacing.pacingStatus === 'BEHIND') {
      healthStatus = 'ATTENTION';
      statusMessage = 'Ritmo ligeramente lento. El motor ajustará automáticamente la tasa de victoria.';
    } else if (pacing.pacingStatus === 'AHEAD') {
      healthStatus = 'ATTENTION';
      statusMessage = 'Ritmo acelerado de premios. El motor dosificará las entregas.';
    }

    return {
      healthStatus,
      statusMessage,
      averageSecsBetweenWins,
      currentVelocityPerHour,
      projectedEndTimeFormatted,
      inventoryBurnRatePct,
    };
  }
}
