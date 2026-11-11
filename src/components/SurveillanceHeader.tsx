import React from 'react';
import { ShieldAlert, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';

interface SurveillanceHeaderProps {
  activeTab: 'cockpit' | 'heatmap' | 'merchandise' | 'alerts';
  onTabChange: (tab: 'cockpit' | 'heatmap' | 'merchandise' | 'alerts') => void;
  onTriggerAiAudit: () => void;
  isAiAuditLoading: boolean;
  unacknowledgedAlertsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SurveillanceHeader: React.FC<SurveillanceHeaderProps> = ({
  activeTab,
  onTabChange,
  onTriggerAiAudit,
  isAiAuditLoading,
  unacknowledgedAlertsCount,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Eye className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          AegisVision CCTV Intelligence
        </span>
      </div>

      {/* Zone 2: Clean 4 nav tabs */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onTabChange('cockpit')}
          className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
            activeTab === 'cockpit'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Surveillance Cockpit
        </button>
        <button
          onClick={() => onTabChange('heatmap')}
          className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
            activeTab === 'heatmap'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Store Heatmap & Flow
        </button>
        <button
          onClick={() => onTabChange('merchandise')}
          className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
            activeTab === 'merchandise'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Merchandise & Shelves
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className={`transition-colors whitespace-nowrap cursor-pointer py-1 flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Alerts & Security Logs</span>
          {unacknowledgedAlertsCount > 0 && (
            <span className="text-xs font-mono font-semibold text-rose-400 ml-1">
              ({unacknowledgedAlertsCount})
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action + audio control */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Security Chime' : 'Mute Security Chime'}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onTriggerAiAudit}
          disabled={isAiAuditLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30 cursor-pointer"
        >
          {isAiAuditLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Auditing CCTV Frame...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Run AI Forensic Audit</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
