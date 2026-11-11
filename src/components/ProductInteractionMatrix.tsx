import React, { useState } from 'react';
import {
  ShoppingBag,
  Eye,
  Hand,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Compass,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { CameraFeedConfig, TrackedPerson } from '../types/surveillance';

interface ProductInteractionMatrixProps {
  selectedCamera: CameraFeedConfig;
  trackedPersons: TrackedPerson[];
  onTriggerAuditForPerson?: (personId: string) => void;
}

export const ProductInteractionMatrix: React.FC<ProductInteractionMatrixProps> = ({
  selectedCamera,
  trackedPersons,
  onTriggerAuditForPerson,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('P-101');

  // Customer movement pattern profiles around displays
  const customerMovementProfiles = [
    {
      id: 'P-101',
      name: 'Customer P-101',
      patternType: 'Comparison Browser',
      patternConfidence: 94,
      hesitationIndex: 0.68, // 0 to 1
      dwellTotalSec: 46,
      currentZone: 'Chilled Soda & Hydration Wall',
      interactionSummary: 'Alternating eye-gaze and wrist reach between Coca-Cola Zero and Monster Energy cooler shelves.',
      productsEngaged: [
        { name: 'Coca-Cola Zero 500ml', dwellSec: 24, reaches: 2, status: 'INSPECTED_REACH' },
        { name: 'Monster Ultra Energy 473ml', dwellSec: 16, reaches: 1, status: 'INSPECTED_REACH' },
        { name: 'San Pellegrino Sparkling', dwellSec: 6, reaches: 0, status: 'GAZE_ONLY' },
      ],
      highTheftRisk: false,
      behaviorDiagnostic: 'Normal shopping comparison. High purchase intent for chilled functional beverages.',
    },
    {
      id: 'P-102',
      name: 'Customer P-102',
      patternType: 'Perimeter Loiterer (High-Shrinkage Zone)',
      patternConfidence: 89,
      hesitationIndex: 0.88,
      dwellTotalSec: 82,
      currentZone: 'Premium Cosmetics & Skincare Bay',
      interactionSummary: 'Linger near cosmetics corner blindspot. 3 rapid reach events without placing into shopping basket.',
      productsEngaged: [
        { name: "L'Oreal Revitalift Hyaluronic Serum ($19.49)", dwellSec: 38, reaches: 3, status: 'UNUSUAL_RAPID_TOUCH' },
        { name: 'Maybelline Sky High Mascara ($11.99)', dwellSec: 28, reaches: 2, status: 'MULTIPLE_GRABS' },
        { name: 'Nivea Hydro Care Lip Balm', dwellSec: 16, reaches: 1, status: 'INSPECTED' },
      ],
      highTheftRisk: true,
      highTheftItemFlag: "UNUSUAL MULTI-PICK ON HIGH-SHRINKAGE ITEM: L'Oreal Revitalift ($19.49)",
      behaviorDiagnostic: 'Abnormal hand-to-pocket trajectory detected after cosmetics grab. Recommend staff floor check.',
    },
    {
      id: 'P-104',
      name: 'Customer P-104',
      patternType: 'Linear Grab-and-Go',
      patternConfidence: 96,
      hesitationIndex: 0.12,
      dwellTotalSec: 18,
      currentZone: 'POS Terminal & Checkout Island',
      interactionSummary: 'Direct straight-line path from snack gondola to cashier register. Rapid decision cycle.',
      productsEngaged: [
        { name: 'Doritos Nacho Cheese 150g', dwellSec: 9, reaches: 1, status: 'BASKET_DEPOSITED' },
        { name: 'Snickers King Size Bar', dwellSec: 5, reaches: 1, status: 'BASKET_DEPOSITED' },
      ],
      highTheftRisk: false,
      behaviorDiagnostic: 'Optimal conversion efficiency. Target impulsive buyer with zero hesitation.',
    },
  ];

  // Sales Correlation & High-Demand Inference Table
  const salesInferenceMatrix = [
    {
      sku: 'COKE-ZERO-500',
      name: 'Coca-Cola Zero 500ml',
      category: 'Beverages',
      highTheft: false,
      dailyReaches: 142,
      avgGazeDwellSec: 7.2,
      actualUnitsSold: 88,
      conversionEfficiency: 62.0, // 88 / 142
      demandInference: 'VERY_HIGH_DEMAND',
      inferenceNote: 'Highest footfall pull. Replenish cooler every 3 hours to prevent stockouts.',
    },
    {
      sku: 'MONSTER-ULTRA-473',
      name: 'Monster Ultra Energy',
      category: 'Beverages',
      highTheft: false,
      dailyReaches: 118,
      avgGazeDwellSec: 6.8,
      actualUnitsSold: 74,
      conversionEfficiency: 62.7,
      demandInference: 'VERY_HIGH_DEMAND',
      inferenceNote: 'Strong impulse affinity with salty snacks during evening commutes.',
    },
    {
      sku: 'LOREAL-REVITALIFT',
      name: "L'Oreal Revitalift Hyaluronic Serum",
      category: 'Cosmetics',
      highTheft: true, // High-theft flag!
      dailyReaches: 42,
      avgGazeDwellSec: 14.5,
      actualUnitsSold: 11,
      conversionEfficiency: 26.2, // Low conversion despite high interest -> price friction or concealment!
      demandInference: 'HIGH_INTEREST_HIGH_SHRINK',
      inferenceNote: 'DISCREPANCY: 42 reaches but only 11 sales. High unexplained shrinkage risk. Recommend security lockpeg.',
    },
    {
      sku: 'MAYBELLINE-SKYHIGH',
      name: 'Maybelline Sky High Mascara',
      category: 'Cosmetics',
      highTheft: true,
      dailyReaches: 56,
      avgGazeDwellSec: 11.2,
      actualUnitsSold: 18,
      conversionEfficiency: 32.1,
      demandInference: 'ELEVATED_SHRINK_RISK',
      inferenceNote: 'Long browse dwell. Multiple hand reaches per session. Keep under active camera view.',
    },
    {
      sku: 'DORITOS-NACHO',
      name: 'Doritos Nacho Cheese 150g',
      category: 'Snacks',
      highTheft: false,
      dailyReaches: 84,
      avgGazeDwellSec: 5.4,
      actualUnitsSold: 52,
      conversionEfficiency: 61.9,
      demandInference: 'STEADY_HIGH_DEMAND',
      inferenceNote: 'Quick purchase decision. Ideal anchor item on center gondola.',
    },
    {
      sku: 'ANKER-USBC-CABLE',
      name: 'Anker USB-C Braided Cable ($9.99)',
      category: 'Electronics',
      highTheft: true,
      dailyReaches: 24,
      avgGazeDwellSec: 12.0,
      actualUnitsSold: 8,
      conversionEfficiency: 33.3,
      demandInference: 'HIGH_THEFT_IMPULSE',
      inferenceNote: 'Positioned near front exit. High grab-and-run risk if unmonitored.',
    },
  ];

  const activeCustomer =
    customerMovementProfiles.find((c) => c.id === selectedPersonId) ||
    customerMovementProfiles[0];

  return (
    <div className="space-y-6">
      {/* High-Theft Urgent Banner */}
      <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-300 font-mono tracking-wider uppercase">
                High-Value Item Shrinkage Alert
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-700">
                ACTIVE AUDIT REQUIRED
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-1 leading-relaxed">
              <strong>Customer P-102:</strong> Detected multiple reaches into high-value shelf (<em>L&apos;Oreal Revitalift Hyaluronic Serum, $19.49</em>) with prolonged 82s dwell and concealment-style hand retraction.
            </p>
          </div>
        </div>

        <button
          onClick={() => onTriggerAuditForPerson && onTriggerAuditForPerson('P-102')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Audit P-102 with Gemini</span>
        </button>
      </div>

      {/* Grid: 1. Individual Customer Attention Tracker & Display Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Customer Selector & Movement Pattern */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Customer Movement Pattern
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              POSE & GAZE LOGS
            </span>
          </div>

          {/* Customer selector pills */}
          <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
            {customerMovementProfiles.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedPersonId(c.id)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedPersonId === c.id
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{c.id}</span>
                {c.highTheftRisk && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            ))}
          </div>

          {/* Active Pattern Card */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">PATTERN CLASSIFICATION</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {activeCustomer.patternConfidence}% Match
              </span>
            </div>

            <div>
              <span className="text-sm font-bold text-white">
                {activeCustomer.patternType}
              </span>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {activeCustomer.interactionSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">HESITATION INDEX:</span>
                <span className="text-neutral-200 font-semibold">
                  {(activeCustomer.hesitationIndex * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">TOTAL DWELL:</span>
                <span className="text-neutral-200 font-semibold">
                  {activeCustomer.dwellTotalSec}s
                </span>
              </div>
            </div>

            {/* Diagnostic note */}
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
              <strong className="text-neutral-400 font-mono">Behavior Diagnostic: </strong>
              {activeCustomer.behaviorDiagnostic}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Individual Customer Product Dwell Breakdown */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {activeCustomer.name}: Product Attention & Dwell Breakdown
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exact time spent gazing, inspecting, or reaching for specific shelf items
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              ZONE: {activeCustomer.currentZone}
            </span>
          </div>

          <div className="divide-y divide-neutral-800">
            {activeCustomer.productsEngaged.map((item, idx) => (
              <div key={idx} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-500 font-bold">{idx + 1}.</span>
                    <span className="font-semibold text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-neutral-400">{item.reaches} Reaches</span>
                    <span className="font-bold text-white text-sm">{item.dwellSec}s Dwell</span>
                  </div>
                </div>

                {/* Dwell bar */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status.includes('UNUSUAL')
                        ? 'bg-rose-500'
                        : item.reaches > 0
                        ? 'bg-indigo-500'
                        : 'bg-neutral-600'
                    }`}
                    style={{ width: `${Math.min(100, (item.dwellSec / 40) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>Interaction Mode: {item.status.replace(/_/g, ' ')}</span>
                  <span>Attention Share: {((item.dwellSec / activeCustomer.dwellTotalSec) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>

          {activeCustomer.highTheftRisk && (
            <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Flagged Anomaly:</strong> Multiple reaches into high-value cosmetic shelf without deposit to basket. Potential theft or concealment in progress.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: 2. Observed Customer Interest vs Sales Data (Demand & Shrinkage Correlation) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Customer Interest vs Sales Data Correlation (Demand & Shrinkage Inference)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cross-references computer-vision detected gaze/reaches against actual POS sales to detect high-demand velocity vs high-theft discrepancies
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            6 MONITORED SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                <th className="pb-3 font-medium">SKU / Item Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-center">Theft Class</th>
                <th className="pb-3 font-medium text-right">Daily Reaches</th>
                <th className="pb-3 font-medium text-right">Avg Gaze (s)</th>
                <th className="pb-3 font-medium text-right">POS Sales</th>
                <th className="pb-3 font-medium text-right">Conversion</th>
                <th className="pb-3 font-medium text-center">Inferred Status</th>
                <th className="pb-3 font-medium">Demand & Security Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70 font-mono">
              {salesInferenceMatrix.map((item, idx) => (
                <tr key={item.sku} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 font-sans font-semibold text-white">
                    {item.name}
                  </td>
                  <td className="py-3 text-neutral-400">{item.category}</td>
                  <td className="py-3 text-center">
                    {item.highTheft ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                        HIGH VALUE
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded text-neutral-400 bg-neutral-800">
                        STANDARD
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-bold text-indigo-400">{item.dailyReaches}</td>
                  <td className="py-3 text-right text-neutral-300">{item.avgGazeDwellSec}s</td>
                  <td className="py-3 text-right text-emerald-400 font-semibold">{item.actualUnitsSold}</td>
                  <td className="py-3 text-right text-neutral-200">{item.conversionEfficiency}%</td>
                  <td className="py-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.demandInference === 'VERY_HIGH_DEMAND'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : item.demandInference.includes('SHRINK')
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.demandInference.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-300 font-sans text-[11px] max-w-xs">
                    {item.inferenceNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
