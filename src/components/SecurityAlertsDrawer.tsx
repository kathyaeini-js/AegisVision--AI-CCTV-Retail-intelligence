import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';
import { SecurityAlert } from '../types/surveillance';

interface SecurityAlertsDrawerProps {
  alerts: SecurityAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onTriggerAuditFromAlert?: (alert: SecurityAlert) => void;
}

export const SecurityAlertsDrawer: React.FC<SecurityAlertsDrawerProps> = ({
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
  onTriggerAuditFromAlert,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOITERING' | 'RUNNING_SPRINT' | 'CONCEALMENT_GESTURE'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    return true;
  });

  const handleExportCsv = () => {
    if (alerts.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Camera', 'Person', 'Type', 'Severity', 'Zone', 'Details', 'Status'];
    const rows = alerts.map((a) => [
      a.id,
      a.timestamp,
      a.cameraName,
      a.personId,
      a.type,
      a.severity,
      `"${a.zoneName}"`,
      `"${a.details.replace(/"/g, '""')}"`,
      a.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aegisvision_cctv_security_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Real-Time Security & Anomaly Logs</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automated alerts triggered by kinematic motion analysis and baseline deviations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Severity filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            disabled={alerts.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs font-mono">
            NO ACTIVE ALERTS MATCHING CURRENT FILTER. SYSTEM NOMINAL.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-800/40'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-950/20 border-amber-800/40'
                  : 'bg-neutral-950 border-neutral-800'
              } ${alert.status === 'ACKNOWLEDGED' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {alert.severity} · {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      {alert.personId}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      · {alert.zoneName}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono ml-auto">
                      {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                    {alert.details}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onTriggerAuditFromAlert && (
                    <button
                      onClick={() => onTriggerAuditFromAlert(alert)}
                      title="Run Gemini AI audit on this event"
                      className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  {alert.status === 'ACTIVE' ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 rounded transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1 px-2 py-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
