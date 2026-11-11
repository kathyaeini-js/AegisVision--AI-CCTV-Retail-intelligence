import React from 'react';
import { ShoppingBag, TrendingUp, Hand, Clock, DollarSign, Package, CheckCircle2 } from 'lucide-react';
import { CameraFeedConfig, StoreProduct } from '../types/surveillance';

interface MerchandiseEngagementViewProps {
  selectedCamera: CameraFeedConfig;
}

export const MerchandiseEngagementView: React.FC<MerchandiseEngagementViewProps> = ({
  selectedCamera,
}) => {
  // Aggregate products across zones
  const allProducts: StoreProduct[] = selectedCamera.zones.flatMap((z) => z.products);

  // Fallback demo products if current camera has fewer products
  const displayProducts: StoreProduct[] = allProducts.length > 0 ? allProducts : [
    {
      id: 'p-coke-zero',
      name: 'Coca-Cola Zero 500ml',
      category: 'Beverages',
      price: 2.49,
      reachesCount: 142,
      totalDwellSeconds: 980,
      estimatedUnitsSold: 88,
      conversionRate: 62.0,
      stockStatus: 'FAST_SELLING',
    },
    {
      id: 'p-monster-energy',
      name: 'Monster Ultra Energy 473ml',
      category: 'Beverages',
      price: 3.29,
      reachesCount: 118,
      totalDwellSeconds: 840,
      estimatedUnitsSold: 74,
      conversionRate: 62.7,
      stockStatus: 'FAST_SELLING',
    },
    {
      id: 'p-doritos-nacho',
      name: 'Doritos Nacho Cheese 150g',
      category: 'Snacks',
      price: 3.49,
      reachesCount: 84,
      totalDwellSeconds: 620,
      estimatedUnitsSold: 52,
      conversionRate: 61.9,
      stockStatus: 'IN_STOCK',
    },
    {
      id: 'p-lays-classic',
      name: "Lay's Classic Salted Potato Chips",
      category: 'Snacks',
      price: 2.99,
      reachesCount: 76,
      totalDwellSeconds: 510,
      estimatedUnitsSold: 46,
      conversionRate: 60.5,
      stockStatus: 'IN_STOCK',
    },
    {
      id: 'p-orbit-gum',
      name: 'Orbit Spearmint Chewing Gum 14pc',
      category: 'Checkout Impulses',
      price: 1.49,
      reachesCount: 95,
      totalDwellSeconds: 410,
      estimatedUnitsSold: 71,
      conversionRate: 74.7,
      stockStatus: 'FAST_SELLING',
    },
  ];

  // Sort by reach interactions (customer interest)
  const sortedProducts = [...displayProducts].sort((a, b) => b.reachesCount - a.reachesCount);

  // Conversion funnel data
  const funnelSteps = [
    { label: 'Total Aisle Footfall', count: 280, pct: 100, desc: 'Pedestrians traversing store corridor' },
    { label: 'Browsed / Stopped', count: 168, pct: 60.0, desc: 'Customers pausing at shelf >= 5 seconds' },
    { label: 'Hand Reach / Inspected', count: 96, pct: 34.3, desc: 'Wrist trajectory entered shelf boundary' },
    { label: 'Checkout Purchase', count: 62, pct: 22.1, desc: 'Items registered and paid at POS terminal' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Level Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">TOP PRODUCT OF INTEREST</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-white tracking-tight">Coca-Cola Zero</span>
            <div className="text-xs text-neutral-400 mt-1 font-mono">
              <span className="text-emerald-400 font-semibold">142 reaches</span> · 980s total gaze/dwell
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">REACH-TO-CART CONVERSION</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white tracking-tight font-mono">63.4%</span>
            <div className="text-xs text-neutral-400 mt-1 font-mono">
              6 out of 10 shelf reaches result in buy
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">AVG PRODUCT SELECTION DWELL</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-white tracking-tight font-mono">7.2 seconds</span>
            <div className="text-xs text-neutral-400 mt-1 font-mono">
              Time from hand reach to basket deposit
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">ESTIMATED SHIFT REVENUE</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-cyan-400 tracking-tight font-mono">$842.60</span>
            <div className="text-xs text-neutral-400 mt-1 font-mono">
              Derived from detected POS transactions
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Products Table + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Attention & Sales Leaderboard */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Product Attention & Shelf Engagement Matrix
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Correlation between human hand reaches (MediaPipe/OpenPose wrist coords) and item sales
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {sortedProducts.length} PRODUCTS TRACKED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                  <th className="pb-3 font-medium">Product / SKU</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Reaches</th>
                  <th className="pb-3 font-medium text-right">Dwell (Sec)</th>
                  <th className="pb-3 font-medium text-right">Est. Sold</th>
                  <th className="pb-3 font-medium text-right">Conversion</th>
                  <th className="pb-3 font-medium text-center">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70 font-mono">
                {sortedProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 font-sans font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-500 font-bold text-xs">{idx + 1}.</span>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-neutral-400">{p.category}</td>
                    <td className="py-3 text-right text-neutral-300">${p.price.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-indigo-400">{p.reachesCount}</td>
                    <td className="py-3 text-right text-neutral-300">{p.totalDwellSeconds}s</td>
                    <td className="py-3 text-right text-emerald-400 font-semibold">{p.estimatedUnitsSold}</td>
                    <td className="py-3 text-right text-neutral-200">{p.conversionRate}%</td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          p.stockStatus === 'FAST_SELLING'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : p.stockStatus === 'LOW_STOCK'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {p.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Customer Shopping Funnel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Customer Shopping Conversion Funnel
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              From corridor footfall to verified checkout purchase
            </p>
          </div>

          <div className="space-y-4 py-2">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">{step.label}</span>
                  <span className="font-mono text-white font-bold">
                    {step.count} ({step.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Merchandising Action Hint */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-1">
            <span className="font-mono text-emerald-400 font-semibold text-[11px] block">
              MERCHANDISING INTELLIGENCE:
            </span>
            <p className="text-neutral-300 leading-relaxed">
              Drop-off between "Browsed" (168) and "Hand Reach" (96) is 42.8%. Placing promotional eye-level shelf talkers on top snack racks can accelerate pickup conversion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
