import React from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, ShoppingBag, Eye, Copy, Check } from 'lucide-react';
import { GeminiAuditResult } from '../types/surveillance';

interface AiForensicModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  snapshotImage: string | null;
  auditResult: GeminiAuditResult | null;
  errorMessage: string | null;
}

export const AiForensicModal: React.FC<AiForensicModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  snapshotImage,
  auditResult,
  errorMessage,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!auditResult) return;
    const report = `AEGISVISION FORENSIC CCTV AUDIT REPORT
Generated: ${new Date().toLocaleString()}
Threat Score: ${auditResult.threatScore}/100 (${auditResult.threatLevel})

SITUATION SUMMARY:
${auditResult.situationSummary}

RETAIL MERCHANDISING INSIGHTS:
- Primary Aisle: ${auditResult.retailInsights.primaryProductAisle}
- Customer Engagement: ${auditResult.retailInsights.engagementLevel}
- Buying Interest: ${auditResult.retailInsights.buyingInterestEstimate}
- Dwell Analysis: ${auditResult.retailInsights.dwellTimeAssessment}

SECURITY DIRECTIVE:
${auditResult.securityRecommendation}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Gemini AI CCTV Forensic Audit
              </h2>
              <p className="text-xs text-neutral-400">
                Multimodal Visual Reasoning on Pose Kinematics & Retail Intent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {auditResult && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Analyzing CCTV Surveillance Frame...</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Gemini 3.8 Flash is cross-referencing skeletal postures, shelf reach coordinates, and movement trajectories.
                </p>
              </div>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Audit Failure</p>
                <p className="text-xs mt-0.5 text-rose-200">{errorMessage}</p>
              </div>
            </div>
          )}

          {auditResult && !isLoading && (
            <div className="space-y-6">
              {/* Snapshot & Score Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {/* Captured Frame Thumbnail */}
                {snapshotImage && (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black aspect-video md:aspect-auto">
                    <img
                      src={snapshotImage}
                      alt="CCTV Captured Frame"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-neutral-950/90 text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                      FRAME CAPTURE
                    </div>
                  </div>
                )}

                {/* Score & Threat Overview */}
                <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                        Security Threat Index
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          auditResult.threatScore > 65
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : auditResult.threatScore > 35
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {auditResult.threatLevel} · {auditResult.threatScore}/100
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            auditResult.threatScore > 65
                              ? 'bg-rose-500'
                              : auditResult.threatScore > 35
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${auditResult.threatScore}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-neutral-200 mt-4 leading-relaxed">
                      {auditResult.situationSummary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>ENGINE: GEMINI 3.8 FLASH MULTIMODAL</span>
                    <span>CONFIDENCE: HIGH</span>
                  </div>
                </div>
              </div>

              {/* Subject Pose & Kinematic Breakdown */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Subject Posture & Kinematics Audit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {auditResult.subjects.map((subj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">
                          {subj.subjectId}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            subj.suspicionFlag === 'NORMAL'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {subj.suspicionFlag}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        <strong className="text-neutral-400">Action:</strong> {subj.estimatedAction}
                      </p>
                      <p className="text-xs text-neutral-400">
                        <strong className="text-neutral-500">Pose Details:</strong> {subj.poseAssessment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retail Merchandising Intelligence */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Convenience Store Merchandising Insights</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                    <div>
                      <span className="text-neutral-500 font-mono">Most Engaged Aisle:</span>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {auditResult.retailInsights.primaryProductAisle}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-mono">Engagement Intensity:</span>
                      <p className="text-emerald-400 font-medium mt-0.5">
                        {auditResult.retailInsights.engagementLevel} Engagement
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                    <div>
                      <span className="text-neutral-500 font-mono">Product Interest Diagnosis:</span>
                      <p className="text-neutral-300 mt-0.5">
                        {auditResult.retailInsights.buyingInterestEstimate}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-mono">Dwell Time Intent:</span>
                      <p className="text-neutral-400 mt-0.5">
                        {auditResult.retailInsights.dwellTimeAssessment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Security Recommendation */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-300">
                    Security & Staff Protocol Recommendation
                  </h4>
                  <p className="text-sm text-neutral-200 mt-1 leading-relaxed">
                    {auditResult.securityRecommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
