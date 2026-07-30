import React from 'react';
import { ExportManager } from '../engine/ExportManager';
import { FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';

export const ExportModal: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-zinc-900/90 border border-purple-500/20 shadow-2xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" />
          Exportación de Reportes & Datos de Evento
        </h3>
        <p className="text-xs text-gray-400">
          Descarga archivos compatibles con Excel, CSV o genera un informe resumen imprimible en formato PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CSV Play History */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Historial Completo (CSV)</h4>
            <p className="text-xs text-gray-400 mt-1">Todas las jugadas con marcas de tiempo, resultados y códigos de seguridad.</p>
          </div>
          <button
            onClick={() => ExportManager.exportPlayHistoryCSV()}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Descargar CSV
          </button>
        </div>

        {/* CSV Audit Logs */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Auditoría de Seguridad (CSV)</h4>
            <p className="text-xs text-gray-400 mt-1">Bitácora de cambios realizados por administradores en el panel.</p>
          </div>
          <button
            onClick={() => ExportManager.exportAuditLogsCSV()}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Descargar Auditoría
          </button>
        </div>

        {/* PDF Executive Summary */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Informe Ejecutivo (PDF)</h4>
            <p className="text-xs text-gray-400 mt-1">Resumen listo para imprimir con estado del motor, balance e inventario.</p>
          </div>
          <button
            onClick={() => ExportManager.exportPDFSummaryPrint()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Generar PDF / Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
