import React from 'react';
import { Flame, Users, Clock, ArrowUpRight, TrendingUp, AlertCircle, Compass } from 'lucide-react';
import { CameraFeedConfig } from '../types/surveillance';

interface HeatmapAnalyticsViewProps {
  selectedCamera: CameraFeedConfig;
}

export const HeatmapAnalyticsView: React.FC<HeatmapAnalyticsViewProps> = ({
  selectedCamera,
}) => {
  // Congestion zone breakdown
  const zoneStats = [
    {
      name: 'Chilled Soda & Hydration Wall (Coolers)',
      category: 'Beverages',
      sharePct: 42,
      totalDwellMinutes: 385,
      avgGroupSize: 1.8,
      status: 'HIGH_CONGESTION',
      peakWindow: '12:00 - 14:00 & 18:00 - 20:00',
    },
    {
      name: 'Gondola Aisle - Salty Snacks & Chips',
      category: 'Snacks',
      sharePct: 28,
      totalDwellMinutes: 242,
      avgGroupSize: 1.2,
      status: 'MODERATE_TRAFFIC',
      peakWindow: '16:00 - 19:30',
    },
    {
      name: 'POS Terminal & Checkout Island',
      category: 'Register',
      sharePct: 18,
      totalDwellMinutes: 165,
      avgGroupSize: 2.1,
      status: 'QUEUE_SURGE',
      peakWindow: '08:00 - 09:30 & 17:30 - 19:00',
    },
    {
      name: 'Personal Care & Cosmetics Wall',
      category: 'Cosmetics',
      sharePct: 8,
      totalDwellMinutes: 74,
      avgGroupSize: 1.0,
      status: 'NORMAL_FLOW',
      peakWindow: '14:00 - 16:00',
    },
    {
      name: 'Rear Corner Blindspot',
      category: 'Perimeter',
      sharePct: 4,
      totalDwellMinutes: 32,
      avgGroupSize: 1.0,
      status: 'LOW_TRAFFIC',
      peakWindow: 'Sporadic',
    },
  ];

  // Hourly footfall distribution
  const hourlyFootfall = [
    { hour: '08:00', count: 32, congestion: 45 },
    { hour: '10:00', count: 28, congestion: 38 },
    { hour: '12:00', count: 68, congestion: 85 },
    { hour: '14:00', count: 52, congestion: 65 },
    { hour: '16:00', count: 58, congestion: 72 },
    { hour: '18:00', count: 84, congestion: 94 },
    { hour: '20:00', count: 46, congestion: 55 },
    { hour: '22:00', count: 22, congestion: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">PEAK CONGREGATION ZONE</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white tracking-tight">Beverage Coolers</span>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-semibold">42%</span> of all customer dwell time
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">AVG STORE DWELL TIME</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white tracking-tight font-mono">3m 48s</span>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-mono">
              <span>+18s vs store baseline</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">HOURLY FOOTFALL</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white tracking-tight font-mono">54 Customers/hr</span>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Peak surge active</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">BOTTLENECK INDEX</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-400 tracking-tight font-mono">LOW / NOMINAL</span>
            <div className="text-xs text-neutral-400 mt-1 font-mono">
              Free flow in main aisle corridor
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Spatial Dwell Distribution & Hourly Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Zone Congestion Ranking Table */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Store Spatial Dwell & Congregation Ranking
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Calculated from optical pose trajectories and ground-plane dwell accumulations
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              UPDATED LIVE
            </span>
          </div>

          <div className="divide-y divide-neutral-800">
            {zoneStats.map((zone, idx) => (
              <div key={idx} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 font-bold">{idx + 1}.</span>
                    <span className="font-semibold text-white">{zone.name}</span>
                    <span className="text-neutral-500 font-mono">· {zone.category}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-neutral-400">{zone.totalDwellMinutes} mins logged</span>
                    <span className="font-bold text-white text-sm">{zone.sharePct}%</span>
                  </div>
                </div>

                {/* Dwell bar */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      zone.sharePct >= 35
                        ? 'bg-rose-500'
                        : zone.sharePct >= 20
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${zone.sharePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Peak Congestion Window: {zone.peakWindow}</span>
                  <span>Avg Group Size: {zone.avgGroupSize} pers.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hourly Flow Histogram */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hourly Customer Flow & Density
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Footfall surges vs aisle congestion
            </p>
          </div>

          {/* Bar histogram */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-neutral-800">
            {hourlyFootfall.map((item, idx) => {
              const heightPct = (item.count / 90) * 100;
              const isPeak = item.count >= 65;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-neutral-400">{item.count}</span>
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isPeak ? 'bg-indigo-500' : 'bg-neutral-700 hover:bg-neutral-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${item.hour}: ${item.count} customers (${item.congestion}% density)`}
                  />
                  <span className="text-[10px] font-mono text-neutral-500 truncate w-full text-center">
                    {item.hour.slice(0, 2)}h
                  </span>
                </div>
              );
            })}
          </div>

          {/* Flow recommendation tip */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-1">
            <span className="font-mono text-indigo-400 font-semibold text-[11px] block">
              STORE FLOW RECOMMENDATION:
            </span>
            <p className="text-neutral-300 leading-relaxed">
              Main cooler aisle congestion peaks at 18:00–19:30. Consider staging high-velocity promotions at the front impulse endcap to distribute customer dwell.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
