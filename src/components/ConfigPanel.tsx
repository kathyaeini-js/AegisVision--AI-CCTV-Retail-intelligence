import React from 'react';
import { Sliders, Bell, Zap, Clock, Shield, RotateCcw } from 'lucide-react';
import { SystemDetectionThresholds } from '../types/surveillance';

interface ConfigPanelProps {
  thresholds: SystemDetectionThresholds;
  onChangeThresholds: (thresholds: SystemDetectionThresholds) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  thresholds,
  onChangeThresholds,
}) => {
  const handleReset = () => {
    onChangeThresholds({
      loiteringSec: 20,
      runningSpeedPx: 260,
      concealmentSensitivity: 'HIGH',
      soundAlertsEnabled: true,
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Detection Sensitivity & Behavior Baselines
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Baselines</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Loitering Trigger Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Loitering Trigger</span>
            </span>
            <span className="font-mono text-white font-bold">{thresholds.loiteringSec}s</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={thresholds.loiteringSec}
            onChange={(e) =>
              onChangeThresholds({
                ...thresholds,
                loiteringSec: Number(e.target.value),
              })
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-neutral-500">
            Time without item reach before loitering alert fires.
          </p>
        </div>

        {/* Sprint / Running Velocity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Sprint Speed Threshold</span>
            </span>
            <span className="font-mono text-white font-bold">{thresholds.runningSpeedPx} px/s</span>
          </div>
          <input
            type="range"
            min={150}
            max={450}
            step={25}
            value={thresholds.runningSpeedPx}
            onChange={(e) =>
              onChangeThresholds({
                ...thresholds,
                runningSpeedPx: Number(e.target.value),
              })
            }
            className="w-full accent-rose-500 cursor-pointer"
          />
          <p className="text-[11px] text-neutral-500">
            Triggers rapid exit / running alert.
          </p>
        </div>

        {/* Concealment Sensitivity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Concealment Sensitivity</span>
            </span>
            <span className="font-mono text-white font-bold">{thresholds.concealmentSensitivity}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
              <button
                key={level}
                onClick={() =>
                  onChangeThresholds({
                    ...thresholds,
                    concealmentSensitivity: level,
                  })
                }
                className={`py-1 rounded text-center transition-colors cursor-pointer ${
                  thresholds.concealmentSensitivity === level
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500">
            Wrist trajectory acceleration into clothing/backpack.
          </p>
        </div>

        {/* Audible Security Chime Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audible Alarm Chime</span>
            </span>
            <span className="font-mono text-white font-bold">
              {thresholds.soundAlertsEnabled ? 'ACTIVE' : 'MUTED'}
            </span>
          </div>
          <button
            onClick={() =>
              onChangeThresholds({
                ...thresholds,
                soundAlertsEnabled: !thresholds.soundAlertsEnabled,
              })
            }
            className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              thresholds.soundAlertsEnabled
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800'
            }`}
          >
            {thresholds.soundAlertsEnabled ? 'Alert Sounds Enabled' : 'Alert Sounds Muted'}
          </button>
          <p className="text-[11px] text-neutral-500">
            Plays Web Audio synthesized chime on incident trigger.
          </p>
        </div>
      </div>
    </div>
  );
};
