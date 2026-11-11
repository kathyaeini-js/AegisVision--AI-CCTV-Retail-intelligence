import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  FastForward,
  Camera,
  Upload,
  Video,
  Layers,
  Flame,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Maximize2,
  Scan,
  AlertTriangle,
} from 'lucide-react';
import {
  CameraFeedConfig,
  PersonBehaviorState,
  SecurityAlert,
  SystemDetectionThresholds,
  TrackedPerson,
} from '../types/surveillance';
import {
  analyzePersonFrame,
  generatePoseSkeleton,
  renderBoundingBoxOnCanvas,
  renderHeatmapLayer,
  renderPoseSkeletonOnCanvas,
  renderStoreZonesOnCanvas,
  renderTrajectoryOnCanvas,
} from '../utils/poseEngine';
import { soundAlert } from '../utils/audioAlert';

interface CctvVideoPlayerProps {
  cameras: CameraFeedConfig[];
  selectedCamera: CameraFeedConfig;
  onSelectCamera: (cam: CameraFeedConfig) => void;
  thresholds: SystemDetectionThresholds;
  onNewAlert: (alert: SecurityAlert) => void;
  onCaptureFrameForAudit: (dataUrl: string) => void;
  trackedPersons: TrackedPerson[];
  setTrackedPersons: React.Dispatch<React.SetStateAction<TrackedPerson[]>>;
}

export const CctvVideoPlayer: React.FC<CctvVideoPlayerProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  thresholds,
  onNewAlert,
  onCaptureFrameForAudit,
  trackedPersons,
  setTrackedPersons,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video source states
  const [sourceMode, setSourceMode] = useState<'preset' | 'upload' | 'webcam'>('preset');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cctvTime, setCctvTime] = useState<string>('');

  // Overlay layer visibility
  const [showSkeletons, setShowSkeletons] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Heatmap points accumulation
  const heatmapAccumulatorRef = useRef<Array<{ x: number; y: number; weight: number }>>([]);

  // Animation frame loop ref
  const animFrameRef = useRef<number | null>(null);
  const tickRef = useRef<number>(0);
  const lastAlertTimeRef = useRef<Record<string, number>>({});

  // Background image element
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Load preset camera background image
  useEffect(() => {
    if (sourceMode === 'preset') {
      const img = new Image();
      img.src = selectedCamera.imageAsset;
      img.onload = () => {
        bgImageRef.current = img;
      };
    }
  }, [selectedCamera, sourceMode]);

  // Handle uploaded video file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setSourceMode('upload');
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
    }
  };

  // Toggle Live Webcam
  const handleToggleWebcam = async () => {
    if (sourceMode === 'webcam') {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
      setSourceMode('preset');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setWebcamStream(stream);
      setSourceMode('webcam');
      if (videoElemRef.current) {
        videoElemRef.current.srcObject = stream;
        videoElemRef.current.play();
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      window.alert('Camera permission denied or camera device not found.');
    }
  };

  // Generate initial tracked personas for the current camera
  useEffect(() => {
    const isCam1 = selectedCamera.id === 'cam-01';
    const isCam2 = selectedCamera.id === 'cam-02';

    const initial: TrackedPerson[] = [
      {
        id: 'p-101',
        nameLabel: 'P-101',
        bbox: {
          x: isCam1 ? 480 : isCam2 ? 460 : 490,
          y: isCam1 ? 420 : isCam2 ? 310 : 440,
          width: 85,
          height: 195,
        },
        keypoints: generatePoseSkeleton(
          isCam1 ? 522 : isCam2 ? 502 : 532,
          isCam1 ? 517 : isCam2 ? 407 : 537,
          85,
          195,
          isCam1 ? 'reaching_left' : 'standing'
        ),
        velocity: 32,
        trajectory: [],
        dwellTimeSeconds: 14.2,
        currentZoneId: null,
        state: 'BROWSING',
        isReachingShelf: isCam1,
        reachedProductCategory: isCam1 ? 'BEVERAGES' : undefined,
        suspicionScore: 8,
        color: '#10B981',
        isFlagged: false,
      },
      {
        id: 'p-102',
        nameLabel: 'P-102',
        bbox: {
          x: isCam1 ? 780 : isCam2 ? 220 : 660,
          y: isCam1 ? 460 : isCam2 ? 380 : 360,
          width: 95,
          height: 205,
        },
        keypoints: generatePoseSkeleton(
          isCam1 ? 827 : isCam2 ? 267 : 707,
          isCam1 ? 562 : isCam2 ? 482 : 462,
          95,
          205,
          isCam2 ? 'reaching_left' : 'standing'
        ),
        velocity: 28,
        trajectory: [],
        dwellTimeSeconds: 22.8,
        currentZoneId: null,
        state: isCam2 ? 'LOITERING' : 'BROWSING',
        isReachingShelf: isCam2,
        reachedProductCategory: isCam2 ? 'COSMETICS' : undefined,
        suspicionScore: isCam2 ? 65 : 12,
        color: isCam2 ? '#F59E0B' : '#06B6D4',
        isFlagged: isCam2,
      },
    ];

    setTrackedPersons(initial);
    heatmapAccumulatorRef.current = [];
  }, [selectedCamera.id, setTrackedPersons]);

  // Main Render & Computer Vision Tracking Loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const cw = canvas.width;
      const ch = canvas.height;

      // Clear frame
      ctx.clearRect(0, 0, cw, ch);

      // Draw background: video or pre-rendered CCTV frame
      if ((sourceMode === 'upload' || sourceMode === 'webcam') && videoElemRef.current) {
        ctx.drawImage(videoElemRef.current, 0, 0, cw, ch);
      } else if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, cw, ch);
      } else {
        // Fallback canvas grid
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, cw, ch);
      }

      // CCTV Lens Vignette & Timestamp watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, cw, ch);

      // Draw Store Shelf Zones if enabled
      if (showZones) {
        renderStoreZonesOnCanvas(ctx, selectedCamera.zones, cw, ch);
      }

      if (isPlaying) {
        tickRef.current += dt * playbackSpeed * 60;
      }

      // Update simulation positions and kinematics if playing
      const currentTick = tickRef.current;
      const effectiveDt = isPlaying ? dt * playbackSpeed : 0;

      // Update tracked persons
      setTrackedPersons((prev) => {
        return prev.map((person, idx) => {
          let updated = { ...person };

          if (isPlaying) {
            // Kinematic physics simulation for natural browsing motion
            let speed = person.velocity;
            let action: 'standing' | 'reaching_left' | 'reaching_right' | 'crouching' | 'running' = 'standing';

            if (person.state === 'RUNNING') {
              action = 'running';
              // Rapid sprint towards exit corridor
              speed = Math.max(300, person.velocity + 15 * effectiveDt);
              updated.bbox.x += speed * effectiveDt * 0.7;
              updated.bbox.y += speed * effectiveDt * 0.3;
              if (updated.bbox.x > cw - 120) {
                updated.bbox.x = 200;
                updated.bbox.y = 400;
                updated.state = 'WALKING';
                updated.velocity = 45;
              }
            } else if (person.state === 'LOITERING') {
              action = 'standing';
              speed = 12 + Math.sin(currentTick * 0.05 + idx) * 8;
              updated.dwellTimeSeconds += effectiveDt;
              updated.bbox.x += Math.sin(currentTick * 0.03 + idx) * 0.4;
            } else if (person.state === 'CONCEALMENT_SUSPECT') {
              action = idx % 2 === 0 ? 'reaching_left' : 'reaching_right';
              speed = 18;
              updated.dwellTimeSeconds += effectiveDt;
            } else if (person.isReachingShelf) {
              action = idx % 2 === 0 ? 'reaching_left' : 'reaching_right';
              speed = 15;
              updated.dwellTimeSeconds += effectiveDt;
              updated.bbox.x += Math.sin(currentTick * 0.02 + idx) * 0.2;
            } else {
              action = 'standing';
              speed = 40 + Math.sin(currentTick * 0.05 + idx) * 15;
              updated.dwellTimeSeconds += effectiveDt * 0.5;
              updated.bbox.y += Math.sin(currentTick * 0.02 + idx) * 0.4;
            }

            updated.velocity = speed;

            // Recompute 17-point pose skeleton with kinematics
            const centerX = updated.bbox.x + updated.bbox.width / 2;
            const centerY = updated.bbox.y + updated.bbox.height / 2;
            updated.keypoints = generatePoseSkeleton(
              centerX,
              centerY,
              updated.bbox.width,
              updated.bbox.height,
              action,
              currentTick
            );

            // Append trajectory trail
            if (currentTick % 6 < 1) {
              const newTrail = [
                ...updated.trajectory.slice(-30),
                { x: centerX, y: centerY + updated.bbox.height * 0.4, time: Date.now() },
              ];
              updated.trajectory = newTrail;
            }

            // Accumulate heatmap density point
            if (currentTick % 12 < 1) {
              heatmapAccumulatorRef.current.push({
                x: centerX / cw,
                y: (centerY + updated.bbox.height * 0.4) / ch,
                weight: updated.dwellTimeSeconds > 10 ? 1.4 : 0.8,
              });
              // Keep accumulator bounded
              if (heatmapAccumulatorRef.current.length > 350) {
                heatmapAccumulatorRef.current.shift();
              }
            }

            // Behavioral & Anomaly Analysis
            const { updatedPerson, triggeredAlert } = analyzePersonFrame(
              updated,
              selectedCamera.zones,
              cw,
              ch,
              thresholds
            );

            if (triggeredAlert) {
              const now = Date.now();
              const lastTime = lastAlertTimeRef.current[triggeredAlert.type + updated.id] || 0;
              // Throttle repeated alerts of same type to every 12 seconds
              if (now - lastTime > 12000) {
                lastAlertTimeRef.current[triggeredAlert.type + updated.id] = now;
                onNewAlert(triggeredAlert);
                if (thresholds.soundAlertsEnabled) {
                  soundAlert.playAlertSound(
                    triggeredAlert.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'
                  );
                }
              }
            }

            return updatedPerson;
          }

          return updated;
        });
      });

      // Render Trajectories
      if (showTrajectories) {
        for (const person of trackedPersons) {
          renderTrajectoryOnCanvas(ctx, person.trajectory, person.color);
        }
      }

      // Render Heatmap Layer
      if (showHeatmap) {
        renderHeatmapLayer(ctx, heatmapAccumulatorRef.current, cw, ch, 1.1);
      }

      // Render Skeletons & Bounding Boxes
      for (const person of trackedPersons) {
        if (showSkeletons) {
          renderPoseSkeletonOnCanvas(ctx, person.keypoints, person.color);
        }
        if (showBoxes) {
          renderBoundingBoxOnCanvas(ctx, person, 1, 1, person.isFlagged);
        }
      }

      // Live CCTV OSD Overlay (Corner telemetry)
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setCctvTime(nowStr);

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, 16, 260, 48);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(28, 32, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${selectedCamera.cameraNumber} · ${selectedCamera.location.toUpperCase()}`, 38, 36);

      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${nowStr} · ${selectedCamera.resolution}`, 24, 54);

      // Top Right: Engine Model Indicators
      const modelTag = 'OPENPOSE / RTMPOSE KINEMATICS · 17-KEYPOINTS';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const mWidth = ctx.measureText(modelTag).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(cw - mWidth - 28, 16, mWidth + 16, 26);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(cw - mWidth - 28, 16, 3, 26);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(modelTag, cw - mWidth - 20, 33);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isPlaying,
    playbackSpeed,
    selectedCamera,
    showBoxes,
    showHeatmap,
    showSkeletons,
    showTrajectories,
    showZones,
    sourceMode,
    thresholds,
    onNewAlert,
    trackedPersons,
    setTrackedPersons,
  ]);

  // Capture current canvas frame as JPEG snapshot for Gemini Forensic Audit
  const handleCaptureSnapshot = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    onCaptureFrameForAudit(dataUrl);
  }, [onCaptureFrameForAudit]);

  // Simulation Triggers for live testing
  const triggerSimulation = (type: 'loitering' | 'running' | 'concealment' | 'reset') => {
    setTrackedPersons((prev) => {
      return prev.map((p, idx) => {
        if (type === 'reset') {
          return {
            ...p,
            state: 'BROWSING',
            velocity: 35,
            dwellTimeSeconds: 5,
            isFlagged: false,
            suspicionScore: 10,
          };
        }
        if (type === 'loitering' && idx === 1) {
          return {
            ...p,
            state: 'LOITERING',
            dwellTimeSeconds: 42,
            isFlagged: true,
            suspicionScore: 78,
          };
        }
        if (type === 'running' && idx === 0) {
          return {
            ...p,
            state: 'RUNNING',
            velocity: 340,
            isFlagged: true,
            suspicionScore: 88,
          };
        }
        if (type === 'concealment' && idx === 0) {
          return {
            ...p,
            state: 'CONCEALMENT_SUSPECT',
            isFlagged: true,
            suspicionScore: 82,
          };
        }
        return p;
      });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden file input & video element for user video files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/*"
        className="hidden"
      />
      <video
        ref={videoElemRef}
        src={uploadedVideoUrl || undefined}
        loop
        muted
        playsInline
        autoPlay
        className="hidden"
      />

      {/* Camera and Feed Selection Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-neutral-400 mr-2 uppercase tracking-wider font-mono">
            Surveillance Source:
          </span>

          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => {
                setSourceMode('preset');
                if (webcamStream) {
                  webcamStream.getTracks().forEach((track) => track.stop());
                  setWebcamStream(null);
                }
                onSelectCamera(cam);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                sourceMode === 'preset' && selectedCamera.id === cam.id
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>{cam.cameraNumber}: {cam.name.split('-')[0]}</span>
            </button>
          ))}

          {/* Upload CCTV Video Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              sourceMode === 'upload'
                ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload CCTV File</span>
          </button>

          {/* Live Webcam Toggle Button */}
          <button
            onClick={handleToggleWebcam}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              sourceMode === 'webcam'
                ? 'bg-neutral-800 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>{sourceMode === 'webcam' ? 'Stop Webcam' : 'Live Webcam'}</span>
          </button>
        </div>

        {/* Snapshot trigger */}
        <button
          onClick={handleCaptureSnapshot}
          className="px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          title="Capture frame snapshot for AI audit"
        >
          <Scan className="w-3.5 h-3.5 text-indigo-400" />
          <span>Audit This Frame</span>
        </button>
      </div>

      {/* Main Surveillance Viewport Canvas Container */}
      <div className="relative w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain block bg-black"
        />

        {/* Alert Banner Flash when high-severity incident is present */}
        {trackedPersons.some((p) => p.isFlagged) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-600/90 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg border border-rose-400/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>
              SECURITY ALERT: {trackedPersons.find((p) => p.isFlagged)?.flagReason}
            </span>
          </div>
        )}
      </div>

      {/* Playback & Overlay Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-xl">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Playback' : 'Play Surveillance'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-colors cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-neutral-400 ml-2 hidden sm:inline">
            FPS: 30 · TRACKED: {trackedPersons.length}
          </span>
        </div>

        {/* Middle: Overlay Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowSkeletons(!showSkeletons)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showSkeletons
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-neutral-500 hover:text-neutral-300 bg-neutral-950'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Skeletons</span>
          </button>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showBoxes
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-neutral-500 hover:text-neutral-300 bg-neutral-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Boxes & IDs</span>
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showZones
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                : 'text-neutral-500 hover:text-neutral-300 bg-neutral-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Store Shelves</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-500 hover:text-neutral-300 bg-neutral-950'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay</span>
          </button>
        </div>

        {/* Right: Simulation Scenarios */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-500 font-mono hidden xl:inline">
            TEST SCENARIOS:
          </span>
          <button
            onClick={() => triggerSimulation('loitering')}
            className="px-2 py-1 text-[11px] font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 rounded transition-colors cursor-pointer"
            title="Simulate subject loitering in cosmetics blindspot"
          >
            Loitering
          </button>
          <button
            onClick={() => triggerSimulation('running')}
            className="px-2 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded transition-colors cursor-pointer"
            title="Simulate sudden sprint toward exit"
          >
            Running Exit
          </button>
          <button
            onClick={() => triggerSimulation('concealment')}
            className="px-2 py-1 text-[11px] font-medium text-orange-300 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/50 rounded transition-colors cursor-pointer"
            title="Simulate rapid concealment gesture"
          >
            Concealment
          </button>
          <button
            onClick={() => triggerSimulation('reset')}
            className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Reset normal shopping behavior"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
