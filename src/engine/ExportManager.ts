import { StorageManager } from './StorageManager';
import { StatisticsEngine } from './StatisticsEngine';

export class ExportManager {
  public static exportPlayHistoryCSV(): void {
    const history = StorageManager.getPlayHistory();
    const headers = ['ID', 'Fecha y Hora', 'Resultado', 'Premio', 'Codigo Seguridad', 'Stock Chica', 'Stock Mediana', 'Stock Grande'];

    const rows = history.map((item) => [
      item.id,
      `"${item.formattedTime}"`,
      item.outcome,
      `"${item.prizeName}"`,
      item.securityCode,
      item.inventorySnapshot.small,
      item.inventorySnapshot.medium,
      item.inventorySnapshot.big,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `BOOMS_LAB_Historial_Partidas_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  public static exportAuditLogsCSV(): void {
    const logs = StorageManager.getAuditLogs();
    const headers = ['ID', 'Fecha y Hora', 'Usuario Admin', 'Accion', 'Campo', 'Valor Anterior', 'Valor Nuevo'];

    const rows = logs.map((item) => [
      item.id,
      `"${item.formattedTime}"`,
      `"${item.adminUser}"`,
      `"${item.action}"`,
      `"${item.field}"`,
      `"${item.oldValue}"`,
      `"${item.newValue}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `BOOMS_LAB_Auditoria_Admin_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  public static exportPDFSummaryPrint(): void {
    const health = StatisticsEngine.getHealthMetrics();
    const history = StorageManager.getPlayHistory();
    const config = StorageManager.getEventConfig();
    const inventory = StorageManager.getInventory();

    const wins = history.filter((h) => h.outcome !== 'LOSE');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BOOMS LAB — Informe Ejecutivo de Evento</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; }
            h1 { color: #C40018; margin-bottom: 5px; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fafafa; }
            .card-title { font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; }
            .card-value { font-size: 24px; font-weight: bold; color: #111; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #eee; padding: 8px 12px; text-align: left; }
            th { background: #f4f4f4; color: #333; }
          </style>
        </head>
        <body>
          <h1>BOOMS LAB — INFORME EJECUTIVO DE PREMIOS</h1>
          <div class="subtitle">Generado el: ${new Date().toLocaleString()} | Evento: ${config.eventName}</div>
          
          <div class="grid">
            <div class="card">
              <div class="card-title">Participantes Jugados</div>
              <div class="card-value">${history.length} / ${config.expectedParticipants}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Premios Entregados</div>
              <div class="card-value">${wins.length}</div>
            </div>
            <div class="card">
              <div class="card-title">Salud del Motor</div>
              <div class="card-value" style="color: #059669;">${health.healthStatus}</div>
            </div>
          </div>

          <h3>Estado Actual del Inventario</h3>
          <table>
            <thead>
              <tr>
                <th>Categoría de Premio</th>
                <th>Inicial</th>
                <th>Entregados</th>
                <th>Restantes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Premios Chicos</td>
                <td>${config.initialInventory.small}</td>
                <td>${config.initialInventory.small - inventory.small}</td>
                <td>${inventory.small}</td>
              </tr>
              <tr>
                <td>Premios Medianos</td>
                <td>${config.initialInventory.medium}</td>
                <td>${config.initialInventory.medium - inventory.medium}</td>
                <td>${inventory.medium}</td>
              </tr>
              <tr>
                <td>Premios Grandes (Jackpots)</td>
                <td>${config.initialInventory.big}</td>
                <td>${config.initialInventory.big - inventory.big}</td>
                <td>${inventory.big}</td>
              </tr>
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private static downloadFile(content: string, fileName: string, contentType: string): void {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
