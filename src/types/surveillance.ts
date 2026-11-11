export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export type PoseJointName =
  | 'nose'
  | 'leftEye'
  | 'rightEye'
  | 'leftEar'
  | 'rightEar'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PersonBehaviorState =
  | 'BROWSING'
  | 'WALKING'
  | 'LOITERING'
  | 'RUNNING'
  | 'CONCEALMENT_SUSPECT'
  | 'CROUCHING_TAMPER'
  | 'CHECKOUT_PAYING';

export interface TrackedPerson {
  id: string;
  nameLabel: string;
  bbox: BoundingBox;
  keypoints: Record<PoseJointName, Keypoint>;
  velocity: number; // px per second
  trajectory: Array<{ x: number; y: number; time: number }>;
  dwellTimeSeconds: number;
  currentZoneId: string | null;
  state: PersonBehaviorState;
  isReachingShelf: boolean;
  reachedProductCategory?: string;
  suspicionScore: number; // 0 to 100
  color: string;
  isFlagged: boolean;
  flagReason?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  reachesCount: number;
  totalDwellSeconds: number;
  estimatedUnitsSold: number;
  conversionRate: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'FAST_SELLING';
}

export interface StoreZone {
  id: string;
  name: string;
  category: 'BEVERAGES' | 'SNACKS' | 'COSMETICS' | 'CHECKOUT' | 'ENTRANCE' | 'BLINDSPOT';
  description: string;
  // Normalized 0 to 1 bounding polygon for camera perspective
  polygon: Array<{ x: number; y: number }>;
  color: string;
  dwellThresholdSeconds: number;
  products: StoreProduct[];
  activeCongestionScore: number; // 0 - 100%
}

export interface CameraFeedConfig {
  id: string;
  name: string;
  cameraNumber: string;
  location: string;
  resolution: string;
  fps: number;
  imageAsset: string;
  zones: StoreZone[];
  baseline: {
    avgSpeedPx: number;
    normalDwellAisleSec: number;
    hourlyFootfall: number;
    topEngagedCategory: string;
  };
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  cameraName: string;
  personId: string;
  type: 'LOITERING' | 'RUNNING_SPRINT' | 'CONCEALMENT_GESTURE' | 'ERRATIC_CROUCH' | 'CROWD_CONGESTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  zoneName: string;
  details: string;
  snapshotImage?: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'DISMISSED';
}

export interface GeminiAuditResult {
  situationSummary: string;
  threatLevel: 'NORMAL' | 'ELEVATED' | 'SUSPICIOUS' | 'CRITICAL';
  threatScore: number;
  subjects: Array<{
    subjectId: string;
    estimatedAction: string;
    poseAssessment: string;
    suspicionFlag: string;
  }>;
  retailInsights: {
    primaryProductAisle: string;
    engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    buyingInterestEstimate: string;
    dwellTimeAssessment: string;
  };
  securityRecommendation: string;
}

export interface SystemDetectionThresholds {
  loiteringSec: number;
  runningSpeedPx: number;
  concealmentSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  soundAlertsEnabled: boolean;
}
