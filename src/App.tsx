import React, { useState, useCallback } from 'react';
import { SurveillanceHeader } from './components/SurveillanceHeader';
import { CctvVideoPlayer } from './components/CctvVideoPlayer';
import { AiForensicModal } from './components/AiForensicModal';
import { HeatmapAnalyticsView } from './components/HeatmapAnalyticsView';
import { MerchandiseEngagementView } from './components/MerchandiseEngagementView';
import { ProductInteractionMatrix } from './components/ProductInteractionMatrix';
import { SecurityAlertsDrawer } from './components/SecurityAlertsDrawer';
import { ConfigPanel } from './components/ConfigPanel';
import { CAMERA_FEEDS } from './data/mockCameras';
import {
  CameraFeedConfig,
  GeminiAuditResult,
  SecurityAlert,
  SystemDetectionThresholds,
  TrackedPerson,
} from './types/surveillance';
import { soundAlert } from './utils/audioAlert';
import { Activity, ShieldCheck, Eye, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'heatmap' | 'merchandise' | 'alerts'>('cockpit');
  const [selectedCamera, setSelectedCamera] = useState<CameraFeedConfig>(CAMERA_FEEDS[0]);

  // System Thresholds
  const [thresholds, setThresholds] = useState<SystemDetectionThresholds>({
    loiteringSec: 20,
    runningSpeedPx: 260,
    concealmentSensitivity: 'HIGH',
    soundAlertsEnabled: true,
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Tracked persons currently visible on canvas
  const [trackedPersons, setTrackedPersons] = useState<TrackedPerson[]>([]);

  // Security alerts log
  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alert-init-1',
      timestamp: '22:04:12',
      cameraName: 'CAM 02 - Cosmetics & Confectionery',
      personId: 'P-102',
      type: 'LOITERING',
      severity: 'HIGH',
      zoneName: 'Premium Cosmetics & Skincare Bay',
      details: 'Customer lingering in cosmetics blindspot for 38 seconds without checkout approach.',
      status: 'ACTIVE',
    },
    {
      id: 'alert-init-2',
      timestamp: '21:58:34',
      cameraName: 'CAM 01 - Main Aisle Coolers',
      personId: 'P-105',
      type: 'RUNNING_SPRINT',
      severity: 'CRITICAL',
      zoneName: 'Central Pedestrian Corridor',
      details: 'Sudden velocity burst (310 px/s) directed towards front exit doorway.',
      status: 'ACKNOWLEDGED',
    },
  ]);

  // Gemini AI Forensic Audit Modal state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<GeminiAuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Toggle audio chime mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundAlert.setMuted(nextMute);
  };

  // Trigger Gemini Forensic Audit on current frame
  const handleRunAiAudit = useCallback(
    async (capturedFrame?: string) => {
      setIsAuditModalOpen(true);
      setIsAuditLoading(true);
      setAuditError(null);

      // Use captured frame or grab live snapshot from active canvas
      let frameToSend = capturedFrame;
      if (!frameToSend && typeof document !== 'undefined') {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
          try {
            frameToSend = canvas.toDataURL('image/jpeg', 0.85);
          } catch {
            // cross-origin fallback
          }
        }
      }
      if (!frameToSend) {
        frameToSend = selectedCamera.imageAsset;
      }
      setSnapshotImage(frameToSend);

      try {
        const response = await fetch('/api/gemini/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: frameToSend,
            cameraName: selectedCamera.name,
            activeZone: selectedCamera.zones[0]?.name || 'Convenience Store Floor',
            detectedPersonsCount: trackedPersons.length,
            manualNote: trackedPersons.some((p) => p.isFlagged)
              ? `Flagged entity detected: ${trackedPersons.find((p) => p.isFlagged)?.flagReason}`
              : undefined,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete forensic audit.');
        }

        setAuditResult(data.audit);
      } catch (err: any) {
        console.error('Audit API Error:', err);
        setAuditError(err.message || 'Audit request failed. Please verify API key.');
      } finally {
        setIsAuditLoading(false);
      }
    },
    [selectedCamera, trackedPersons]
  );

  const handleNewAlert = useCallback((newAlert: SecurityAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const unacknowledgedCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Universal Top Bar Header */}
      <SurveillanceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTriggerAiAudit={() => handleRunAiAudit()}
        isAiAuditLoading={isAuditLoading}
        unacknowledgedAlertsCount={unacknowledgedCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'cockpit' && (
          <div className="space-y-6">
            {/* Top surveillance status banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>SYSTEM NOMINAL · REAL-TIME POSE TRACKING ACTIVE</span>
                </span>
                <span className="text-neutral-500 hidden sm:inline">|</span>
                <span className="text-neutral-300 font-mono">
                  ACTIVE ENGINE: <strong className="text-white">MediaPipe / RTMPose Kinematics (17-Keypoints)</strong>
                </span>
                <span className="text-neutral-500 hidden sm:inline">|</span>
                <span className="text-neutral-400 font-mono">
                  CURRENT FEED: <strong className="text-white">{selectedCamera.name}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-neutral-400 font-mono">
                  ENTITIES: <strong className="text-emerald-400">{trackedPersons.length}</strong>
                </span>
                <span className="text-neutral-400 font-mono">
                  ALERTS: <strong className={unacknowledgedCount > 0 ? 'text-rose-400' : 'text-neutral-300'}>{unacknowledgedCount}</strong>
                </span>
              </div>
            </div>

            {/* Video Viewport & Playback Deck */}
            <CctvVideoPlayer
              cameras={CAMERA_FEEDS}
              selectedCamera={selectedCamera}
              onSelectCamera={setSelectedCamera}
              thresholds={thresholds}
              onNewAlert={handleNewAlert}
              onCaptureFrameForAudit={(frame) => handleRunAiAudit(frame)}
              trackedPersons={trackedPersons}
              setTrackedPersons={setTrackedPersons}
            />

            {/* Product Interaction Matrix: Individual Dwell, Display Patterns, Sales Correlation & High-Theft */}
            <div className="pt-2">
              <ProductInteractionMatrix
                selectedCamera={selectedCamera}
                trackedPersons={trackedPersons}
                onTriggerAuditForPerson={() => handleRunAiAudit()}
              />
            </div>

            {/* Live Security Alerts Drawer & Config Sliders in 2-column strip */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SecurityAlertsDrawer
                  alerts={alerts}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onDismissAlert={handleDismissAlert}
                  onTriggerAuditFromAlert={() => handleRunAiAudit()}
                />
              </div>

              <div>
                <ConfigPanel
                  thresholds={thresholds}
                  onChangeThresholds={setThresholds}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Store Spatial Heatmap & Customer Congregation
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Identifies store choke points, high-dwell hotspots, and group aggregation around product displays
                </p>
              </div>
            </div>
            <HeatmapAnalyticsView selectedCamera={selectedCamera} />
          </div>
        )}

        {activeTab === 'merchandise' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Merchandise & Product Engagement Intelligence
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Hand-to-shelf reach kinematics, dwell times, and estimated sales conversion ratios
                </p>
              </div>
            </div>
            <MerchandiseEngagementView selectedCamera={selectedCamera} />
            <div className="pt-4">
              <ProductInteractionMatrix
                selectedCamera={selectedCamera}
                trackedPersons={trackedPersons}
                onTriggerAuditForPerson={() => handleRunAiAudit()}
              />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Security Incident Logs & Forensic Audit History
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Complete incident trail for loitering, running sprints, concealment gestures, and retail shrinkage
                </p>
              </div>
            </div>
            <SecurityAlertsDrawer
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDismissAlert={handleDismissAlert}
              onTriggerAuditFromAlert={() => handleRunAiAudit()}
            />
          </div>
        )}
      </main>

      {/* Gemini AI CCTV Forensic Modal */}
      <AiForensicModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        isLoading={isAuditLoading}
        snapshotImage={snapshotImage}
        auditResult={auditResult}
        errorMessage={auditError}
      />
    </div>
  );
}
