import type { AuditLogEntry, EventConfig, InventoryState, PlayHistoryEntry } from '../types/engine';
import { DEFAULT_EVENT_CONFIG, DEFAULT_INVENTORY } from '../constants/prizes';

export interface IStorageProvider {
  getEventConfig(): EventConfig;
  saveEventConfig(config: EventConfig): void;
  getInventory(): InventoryState;
  saveInventory(inventory: InventoryState): void;
  getPlayHistory(): PlayHistoryEntry[];
  addPlayHistory(entry: PlayHistoryEntry): void;
  clearPlayHistory(): void;
  getAuditLogs(): AuditLogEntry[];
  addAuditLog(entry: AuditLogEntry): void;
  resetAllData(): void;
}

const KEYS = {
  EVENT_CONFIG: 'booms_casino_event_config_v2',
  INVENTORY: 'booms_casino_inventory_v2',
  PLAY_HISTORY: 'booms_casino_play_history_v2',
  AUDIT_LOGS: 'booms_casino_audit_logs_v2',
};

class LocalStorageProvider implements IStorageProvider {
  getEventConfig(): EventConfig {
    try {
      const data = localStorage.getItem(KEYS.EVENT_CONFIG);
      if (data) {
        return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('StorageManager: Failed to read event config', e);
    }
    return { ...DEFAULT_EVENT_CONFIG };
  }

  saveEventConfig(config: EventConfig): void {
    try {
      localStorage.setItem(KEYS.EVENT_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('StorageManager: Failed to save event config', e);
    }
  }

  getInventory(): InventoryState {
    try {
      const data = localStorage.getItem(KEYS.INVENTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('StorageManager: Failed to read inventory', e);
    }
    return { ...DEFAULT_INVENTORY };
  }

  saveInventory(inventory: InventoryState): void {
    try {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('StorageManager: Failed to save inventory', e);
    }
  }

  getPlayHistory(): PlayHistoryEntry[] {
    try {
      const data = localStorage.getItem(KEYS.PLAY_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('StorageManager: Failed to read play history', e);
    }
    return [];
  }

  addPlayHistory(entry: PlayHistoryEntry): void {
    try {
      const history = this.getPlayHistory();
      history.unshift(entry);
      if (history.length > 10000) history.pop();
      localStorage.setItem(KEYS.PLAY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('StorageManager: Failed to save play history', e);
    }
  }

  clearPlayHistory(): void {
    try {
      localStorage.removeItem(KEYS.PLAY_HISTORY);
    } catch (e) {
      console.error('StorageManager: Failed to clear play history', e);
    }
  }

  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('StorageManager: Failed to read audit logs', e);
    }
    return [];
  }

  addAuditLog(entry: AuditLogEntry): void {
    try {
      const logs = this.getAuditLogs();
      logs.unshift(entry);
      if (logs.length > 2000) logs.pop();
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('StorageManager: Failed to save audit log', e);
    }
  }

  resetAllData(): void {
    try {
      localStorage.removeItem(KEYS.EVENT_CONFIG);
      localStorage.removeItem(KEYS.INVENTORY);
      localStorage.removeItem(KEYS.PLAY_HISTORY);
      localStorage.removeItem(KEYS.AUDIT_LOGS);
    } catch (e) {
      console.error('StorageManager: Failed to reset data', e);
    }
  }
}

export const StorageManager = new LocalStorageProvider();
