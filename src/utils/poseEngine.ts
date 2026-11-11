import {
  BoundingBox,
  Keypoint,
  PersonBehaviorState,
  PoseJointName,
  SecurityAlert,
  StoreZone,
  SystemDetectionThresholds,
  TrackedPerson,
} from '../types/surveillance';

// 17-keypoint OpenPose / RTMPose / MediaPipe skeletal connections
export const SKELETON_BONES: Array<[PoseJointName, PoseJointName]> = [
  // Head
  ['leftEar', 'leftEye'],
  ['leftEye', 'nose'],
  ['nose', 'rightEye'],
  ['rightEye', 'rightEar'],
  // Torso
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  // Left Arm
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  // Right Arm
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  // Left Leg
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  // Right Leg
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
];

// Check if point is inside polygon (normalized 0 to 1)
export function isPointInPolygon(
  x: number,
  y: number,
  polygon: Array<{ x: number; y: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Generate an anatomically proportioned 17-point pose skeleton centered at (centerX, centerY)
export function generatePoseSkeleton(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  action: 'standing' | 'reaching_left' | 'reaching_right' | 'crouching' | 'running',
  tick: number = 0
): Record<PoseJointName, Keypoint> {
  const sway = Math.sin(tick * 0.05) * 4;
  const armSway = Math.cos(tick * 0.08) * 6;
  const isCrouching = action === 'crouching';
  const effectiveHeight = isCrouching ? height * 0.65 : height;
  const topY = centerY - effectiveHeight / 2;

  // Head
  const headY = topY + effectiveHeight * 0.1;
  const shoulderY = topY + effectiveHeight * 0.22;
  const hipY = topY + effectiveHeight * 0.52;
  const kneeY = topY + effectiveHeight * 0.74;
  const ankleY = topY + effectiveHeight * 0.96;

  const shoulderSpan = width * 0.42;
  const hipSpan = width * 0.32;

  let leftWristX = centerX - shoulderSpan * 1.1;
  let leftWristY = shoulderY + effectiveHeight * 0.28;
  let rightWristX = centerX + shoulderSpan * 1.1;
  let rightWristY = shoulderY + effectiveHeight * 0.28;

  let leftElbowX = centerX - shoulderSpan * 0.9;
  let leftElbowY = shoulderY + effectiveHeight * 0.16;
  let rightElbowX = centerX + shoulderSpan * 0.9;
  let rightElbowY = shoulderY + effectiveHeight * 0.16;

  if (action === 'reaching_left') {
    // Left arm extends outward towards left shelf
    const reachProgress = 0.5 + Math.sin(tick * 0.06) * 0.4;
    leftWristX = centerX - width * (0.8 + reachProgress * 0.5);
    leftWristY = shoulderY - effectiveHeight * 0.05;
    leftElbowX = centerX - width * 0.6;
    leftElbowY = shoulderY + effectiveHeight * 0.05;
  } else if (action === 'reaching_right') {
    // Right arm extends outward towards right shelf
    const reachProgress = 0.5 + Math.sin(tick * 0.06) * 0.4;
    rightWristX = centerX + width * (0.8 + reachProgress * 0.5);
    rightWristY = shoulderY - effectiveHeight * 0.05;
    rightElbowX = centerX + width * 0.6;
    rightElbowY = shoulderY + effectiveHeight * 0.05;
  } else if (action === 'running') {
    // Dynamic opposing arm and leg swing
    leftWristX = centerX - shoulderSpan + Math.sin(tick * 0.2) * 20;
    leftWristY = shoulderY + effectiveHeight * 0.15 - Math.cos(tick * 0.2) * 15;
    rightWristX = centerX + shoulderSpan - Math.sin(tick * 0.2) * 20;
    rightWristY = shoulderY + effectiveHeight * 0.15 + Math.cos(tick * 0.2) * 15;
  }

  return {
    nose: { x: centerX + sway, y: headY, score: 0.98, name: 'nose' },
    leftEye: { x: centerX - 6 + sway, y: headY - 4, score: 0.95, name: 'leftEye' },
    rightEye: { x: centerX + 6 + sway, y: headY - 4, score: 0.96, name: 'rightEye' },
    leftEar: { x: centerX - 14 + sway, y: headY - 2, score: 0.91, name: 'leftEar' },
    rightEar: { x: centerX + 14 + sway, y: headY - 2, score: 0.92, name: 'rightEar' },

    leftShoulder: { x: centerX - shoulderSpan + sway * 0.5, y: shoulderY, score: 0.97, name: 'leftShoulder' },
    rightShoulder: { x: centerX + shoulderSpan + sway * 0.5, y: shoulderY, score: 0.97, name: 'rightShoulder' },

    leftElbow: { x: leftElbowX, y: leftElbowY, score: 0.92, name: 'leftElbow' },
    rightElbow: { x: rightElbowX, y: rightElbowY, score: 0.93, name: 'rightElbow' },

    leftWrist: { x: leftWristX, y: leftWristY + armSway * 0.5, score: 0.9, name: 'leftWrist' },
    rightWrist: { x: rightWristX, y: rightWristY - armSway * 0.5, score: 0.9, name: 'rightWrist' },

    leftHip: { x: centerX - hipSpan, y: hipY, score: 0.94, name: 'leftHip' },
    rightHip: { x: centerX + hipSpan, y: hipY, score: 0.94, name: 'rightHip' },

    leftKnee: {
      x: centerX - hipSpan - (action === 'running' ? Math.sin(tick * 0.2) * 15 : 0),
      y: isCrouching ? hipY + 25 : kneeY,
      score: 0.89,
      name: 'leftKnee',
    },
    rightKnee: {
      x: centerX + hipSpan + (action === 'running' ? Math.sin(tick * 0.2) * 15 : 0),
      y: isCrouching ? hipY + 25 : kneeY,
      score: 0.89,
      name: 'rightKnee',
    },

    leftAnkle: {
      x: centerX - hipSpan - (action === 'running' ? Math.sin(tick * 0.2) * 20 : 0),
      y: ankleY,
      score: 0.88,
      name: 'leftAnkle',
    },
    rightAnkle: {
      x: centerX + hipSpan + (action === 'running' ? Math.sin(tick * 0.2) * 20 : 0),
      y: ankleY,
      score: 0.88,
      name: 'rightAnkle',
    },
  };
}

// Drawing routines
export function renderPoseSkeletonOnCanvas(
  ctx: CanvasRenderingContext2D,
  keypoints: Record<PoseJointName, Keypoint>,
  color: string,
  scaleX: number = 1,
  scaleY: number = 1
) {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw connecting bones
  for (const [startName, endName] of SKELETON_BONES) {
    const pt1 = keypoints[startName];
    const pt2 = keypoints[endName];
    if (pt1 && pt2 && pt1.score > 0.4 && pt2.score > 0.4) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(pt1.x * scaleX, pt1.y * scaleY);
      ctx.lineTo(pt2.x * scaleX, pt2.y * scaleY);
      ctx.stroke();
    }
  }

  // Draw joint keypoints
  for (const name in keypoints) {
    const pt = keypoints[name as PoseJointName];
    if (pt && pt.score > 0.4) {
      const px = pt.x * scaleX;
      const py = pt.y * scaleY;

      // Outer halo
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Inner color pip
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  ctx.restore();
}

export function renderBoundingBoxOnCanvas(
  ctx: CanvasRenderingContext2D,
  person: TrackedPerson,
  scaleX: number = 1,
  scaleY: number = 1,
  showAlert: boolean = false
) {
  ctx.save();
  const bx = person.bbox.x * scaleX;
  const by = person.bbox.y * scaleY;
  const bw = person.bbox.width * scaleX;
  const bh = person.bbox.height * scaleY;

  const boxColor = showAlert || person.isFlagged
    ? '#EF4444' // Red alert
    : person.state === 'CONCEALMENT_SUSPECT' || person.state === 'LOITERING'
    ? '#F59E0B' // Amber warning
    : person.isReachingShelf
    ? '#06B6D4' // Cyan reach
    : '#10B981'; // Green normal

  // Surveillance corner brackets
  ctx.strokeStyle = boxColor;
  ctx.lineWidth = showAlert || person.isFlagged ? 3 : 2;
  const cornerLen = Math.min(16, bw * 0.25);

  // Top Left
  ctx.beginPath();
  ctx.moveTo(bx, by + cornerLen);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + cornerLen, by);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(bx + bw - cornerLen, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + cornerLen);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(bx, by + bh - cornerLen);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx + cornerLen, by + bh);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(bx + bw - cornerLen, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw, by + bh - cornerLen);
  ctx.stroke();

  // Semi-transparent box background on alert
  if (showAlert || person.isFlagged) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(bx, by, bw, bh);
  }

  // Header Badge (ID & Status)
  const tagText = `${person.nameLabel} · ${person.state} · ${Math.round(person.dwellTimeSeconds)}s`;
  ctx.font = '600 11px "JetBrains Mono", monospace';
  const textWidth = ctx.measureText(tagText).width;
  const pad = 6;
  const badgeH = 18;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(bx, by - badgeH - 3, textWidth + pad * 2, badgeH);

  // Colored status left bar
  ctx.fillStyle = boxColor;
  ctx.fillRect(bx, by - badgeH - 3, 3, badgeH);

  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(tagText, bx + pad + 2, by - 10);

  // Bottom Sub-telemetry: Speed & Shelf Interaction
  const speedText = `${Math.round(person.velocity)} px/s ${person.isReachingShelf ? '· SHELF REACH' : ''}`;
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  const speedWidth = ctx.measureText(speedText).width;
  ctx.fillRect(bx, by + bh + 3, speedWidth + 8, 16);
  ctx.fillStyle = person.velocity > 180 ? '#EF4444' : '#94A3B8';
  ctx.fillText(speedText, bx + 4, by + bh + 15);

  ctx.restore();
}

export function renderTrajectoryOnCanvas(
  ctx: CanvasRenderingContext2D,
  trajectory: Array<{ x: number; y: number; time: number }>,
  color: string,
  scaleX: number = 1,
  scaleY: number = 1
) {
  if (trajectory.length < 2) return;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  for (let i = 1; i < trajectory.length; i++) {
    const alpha = (i / trajectory.length) * 0.7;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(trajectory[i - 1].x * scaleX, trajectory[i - 1].y * scaleY);
    ctx.lineTo(trajectory[i].x * scaleX, trajectory[i].y * scaleY);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderStoreZonesOnCanvas(
  ctx: CanvasRenderingContext2D,
  zones: StoreZone[],
  canvasWidth: number,
  canvasHeight: number,
  activeHoverZoneId?: string
) {
  ctx.save();

  for (const zone of zones) {
    if (zone.polygon.length < 3) continue;

    ctx.beginPath();
    const first = zone.polygon[0];
    ctx.moveTo(first.x * canvasWidth, first.y * canvasHeight);

    for (let i = 1; i < zone.polygon.length; i++) {
      ctx.lineTo(zone.polygon[i].x * canvasWidth, zone.polygon[i].y * canvasHeight);
    }
    ctx.closePath();

    const isHovered = activeHoverZoneId === zone.id;
    ctx.fillStyle = isHovered ? `${zone.color}35` : `${zone.color}18`;
    ctx.fill();

    ctx.strokeStyle = zone.color;
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zone Title Label Tag
    const labelX = zone.polygon[0].x * canvasWidth + 8;
    const labelY = zone.polygon[0].y * canvasHeight + 18;
    const labelText = `${zone.name.toUpperCase()} · ${zone.category}`;

    ctx.font = '600 10px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(labelText).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(labelX - 4, labelY - 12, textWidth + 12, 18);

    ctx.fillStyle = zone.color;
    ctx.fillRect(labelX - 4, labelY - 12, 3, 18);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(labelText, labelX + 4, labelY);
  }

  ctx.restore();
}

// 2D Gaussian density heatmap splatting on canvas
export function renderHeatmapLayer(
  targetCtx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number; weight: number }>,
  width: number,
  height: number,
  intensity: number = 1.0
) {
  if (points.length === 0) return;

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  // Render alpha gradients (splats)
  for (const pt of points) {
    const px = pt.x * width;
    const py = pt.y * height;
    const radius = 45 * intensity;

    const grad = offCtx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0, `rgba(0,0,0,${Math.min(1, pt.weight * 0.65)})`);
    grad.addColorStop(0.5, `rgba(0,0,0,${Math.min(0.5, pt.weight * 0.25)})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    offCtx.fillStyle = grad;
    offCtx.beginPath();
    offCtx.arc(px, py, radius, 0, Math.PI * 2);
    offCtx.fill();
  }

  // Colorize alpha into thermal spectrum
  const imgData = offCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > 0) {
      const norm = alpha / 255;
      // Thermal Palette mapping:
      // 0 - 0.25: Blue -> Cyan
      // 0.25 - 0.5: Cyan -> Green
      // 0.5 - 0.75: Green -> Yellow
      // 0.75 - 1.0: Yellow -> Red
      let r = 0;
      let g = 0;
      let b = 0;

      if (norm < 0.25) {
        const t = norm / 0.25;
        r = 0;
        g = Math.floor(t * 255);
        b = 255;
      } else if (norm < 0.5) {
        const t = (norm - 0.25) / 0.25;
        r = 0;
        g = 255;
        b = Math.floor((1 - t) * 255);
      } else if (norm < 0.75) {
        const t = (norm - 0.5) / 0.25;
        r = Math.floor(t * 255);
        g = 255;
        b = 0;
      } else {
        const t = (norm - 0.75) / 0.25;
        r = 255;
        g = Math.floor((1 - t * 0.8) * 255);
        b = 0;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.floor(alpha * 0.6); // semi-transparent thermal overlay
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  targetCtx.save();
  targetCtx.globalCompositeOperation = 'source-over';
  targetCtx.drawImage(offscreen, 0, 0);
  targetCtx.restore();
}

// Behavioral evaluator: Analyzes kinematics, dwells, and zone intersections
export function analyzePersonFrame(
  person: TrackedPerson,
  zones: StoreZone[],
  canvasWidth: number,
  canvasHeight: number,
  thresholds: SystemDetectionThresholds
): {
  updatedPerson: TrackedPerson;
  triggeredAlert?: SecurityAlert;
} {
  const normX = (person.bbox.x + person.bbox.width / 2) / canvasWidth;
  const normY = (person.bbox.y + person.bbox.height * 0.85) / canvasHeight;

  // Determine current active zone
  let activeZone: StoreZone | null = null;
  for (const zone of zones) {
    if (isPointInPolygon(normX, normY, zone.polygon)) {
      activeZone = zone;
      break;
    }
  }

  const updated: TrackedPerson = {
    ...person,
    currentZoneId: activeZone ? activeZone.id : null,
  };

  // Check wrist reach into store zones (hand interaction)
  let isReaching = false;
  let reachedZone: StoreZone | null = null;

  const leftWristNorm = {
    x: person.keypoints.leftWrist.x / canvasWidth,
    y: person.keypoints.leftWrist.y / canvasHeight,
  };
  const rightWristNorm = {
    x: person.keypoints.rightWrist.x / canvasWidth,
    y: person.keypoints.rightWrist.y / canvasHeight,
  };

  for (const zone of zones) {
    if (
      isPointInPolygon(leftWristNorm.x, leftWristNorm.y, zone.polygon) ||
      isPointInPolygon(rightWristNorm.x, rightWristNorm.y, zone.polygon)
    ) {
      if (zone.category === 'BEVERAGES' || zone.category === 'SNACKS' || zone.category === 'COSMETICS') {
        isReaching = true;
        reachedZone = zone;
        break;
      }
    }
  }

  updated.isReachingShelf = isReaching;
  if (isReaching && reachedZone) {
    updated.reachedProductCategory = reachedZone.category;
  }

  let alertToTrigger: SecurityAlert | undefined = undefined;

  // 1. Check Running / Sprinting
  if (person.velocity >= thresholds.runningSpeedPx) {
    updated.state = 'RUNNING';
    updated.isFlagged = true;
    updated.flagReason = `High Velocity Movement (${Math.round(person.velocity)} px/s)`;
    updated.suspicionScore = Math.min(100, updated.suspicionScore + 25);

    alertToTrigger = {
      id: `alert-run-${Date.now()}-${person.id}`,
      timestamp: new Date().toLocaleTimeString(),
      cameraName: 'CCTV Stream',
      personId: person.nameLabel,
      type: 'RUNNING_SPRINT',
      severity: 'CRITICAL',
      zoneName: activeZone?.name || 'Aisle Corridor',
      details: `Subject running at abnormal velocity (${Math.round(person.velocity)} px/s) directed towards exit corridor.`,
      status: 'ACTIVE',
    };
  }
  // 2. Check Loitering in high-risk zones
  else if (
    activeZone &&
    activeZone.category !== 'CHECKOUT' &&
    person.dwellTimeSeconds >= (activeZone.dwellThresholdSeconds || thresholds.loiteringSec) &&
    !isReaching
  ) {
    updated.state = 'LOITERING';
    updated.isFlagged = true;
    updated.flagReason = `Prolonged Loitering (${Math.round(person.dwellTimeSeconds)}s without reach)`;
    updated.suspicionScore = Math.min(100, updated.suspicionScore + 15);

    alertToTrigger = {
      id: `alert-loiter-${Date.now()}-${person.id}`,
      timestamp: new Date().toLocaleTimeString(),
      cameraName: 'CCTV Stream',
      personId: person.nameLabel,
      type: 'LOITERING',
      severity: activeZone.category === 'BLINDSPOT' || activeZone.category === 'COSMETICS' ? 'HIGH' : 'MEDIUM',
      zoneName: activeZone.name,
      details: `Subject lingering without item selection for ${Math.round(person.dwellTimeSeconds)}s exceeding safety baseline.`,
      status: 'ACTIVE',
    };
  }
  // 3. Concealment Suspicion Check
  else if (person.state === 'CONCEALMENT_SUSPECT') {
    updated.isFlagged = true;
    updated.flagReason = 'Concealment Movement Gesture (Pocket/Backpack Retraction)';
    alertToTrigger = {
      id: `alert-conceal-${Date.now()}-${person.id}`,
      timestamp: new Date().toLocaleTimeString(),
      cameraName: 'CCTV Stream',
      personId: person.nameLabel,
      type: 'CONCEALMENT_GESTURE',
      severity: 'HIGH',
      zoneName: activeZone?.name || 'High-Shrinkage Shelf',
      details: 'Wrist kinematics indicate fast shelf pull-back toward inner garment/waistline followed by posture turn.',
      status: 'ACTIVE',
    };
  }
  // 4. Browsing vs Walking
  else if (isReaching) {
    updated.state = 'BROWSING';
    updated.suspicionScore = Math.max(0, updated.suspicionScore - 5);
  } else if (activeZone?.category === 'CHECKOUT') {
    updated.state = 'CHECKOUT_PAYING';
  } else {
    updated.state = 'WALKING';
  }

  return { updatedPerson: updated, triggeredAlert: alertToTrigger };
}
