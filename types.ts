export type TabType = 'home' | 'today' | 'exercises' | 'wellness' | 'settings' | 'spine3d' | 'debug' | 'human_test' | 'ai-analyst';

export interface EulerAngle {
  x: number;
  y: number;
  z: number;
}

export interface PoseData {
  spine: EulerAngle;
  neck: EulerAngle;
  head: EulerAngle;
  leftShoulder: EulerAngle;
  rightShoulder: EulerAngle;
  leftElbow: EulerAngle;
  rightElbow: EulerAngle;
  leftHip: EulerAngle;
  rightHip: EulerAngle;
  leftKnee: EulerAngle;
  rightKnee: EulerAngle;
  leftAnkle: EulerAngle;
  rightAnkle: EulerAngle;
}

export const JOINT_LIMITS = {
  spine: { min: -180, max: 180 },
  neck: { min: -180, max: 180 },
  head: { min: -180, max: 180 },
  leftShoulder: { min: -180, max: 180 },
  rightShoulder: { min: -180, max: 180 },
  leftElbow: { min: -180, max: 180 },
  rightElbow: { min: -180, max: 180 },
  leftHip: { min: -180, max: 180 },
  rightHip: { min: -180, max: 180 },
  leftKnee: { min: -180, max: 180 },
  rightKnee: { min: -180, max: 180 },
  leftAnkle: { min: -180, max: 180 },
  rightAnkle: { min: -180, max: 180 },
};

const x = (val: number) => ({ x: val, y: 0, z: 0 });
const y = (val: number) => ({ x: 0, y: val, z: 0 });
const z = (val: number) => ({ x: 0, y: 0, z: val });

export const INITIAL_ACTIVITY_POSES: Record<string, Partial<PoseData>> = {
  // To fix the backward arms and force a T-shape, we swing them 90 degrees on the X-axis while keeping Z at 0 for horizontal height
  'Standing': { spine: x(0), neck: x(0), head: x(0), leftShoulder: {x: 90, y: 0, z: 0}, rightShoulder: {x: 90, y: 0, z: 0}, leftElbow: x(0), rightElbow: x(0), leftHip: x(0), rightHip: x(0), leftKnee: x(0), rightKnee: x(0), leftAnkle: x(0), rightAnkle: x(0) },
  // Hips: x(90) points forward. Knees: x(-90) bends downward/backward. 
  // Left arm forward bend = +Z, Right arm forward bend = -Z.
  'Sitting': { leftShoulder: {x: 95, y: 0, z: 15}, rightShoulder: {x: 95, y: 0, z: -15}, leftElbow: {x: 0, y: 0, z: 50}, rightElbow: {x: 0, y: 0, z: -50}, leftHip: x(90), rightHip: x(90), leftKnee: x(-90), rightKnee: x(-90) },
  'Squatting': { spine: x(20), head: x(-10), leftShoulder: {x: 110, y: 0, z: 20}, rightShoulder: {x: 110, y: 0, z: -20}, leftElbow: {x: 0, y: 0, z: 80}, rightElbow: {x: 0, y: 0, z: -80}, leftHip: x(110), rightHip: x(110), leftKnee: x(-130), rightKnee: x(-130), leftAnkle: x(20), rightAnkle: x(20) },
  'Kneeling': { leftShoulder: {x: 95, y: 0, z: 10}, rightShoulder: {x: 95, y: 0, z: -10}, leftElbow: {x: 0, y: 0, z: 20}, rightElbow: {x: 0, y: 0, z: -20}, leftHip: x(90), rightHip: x(90), leftKnee: x(-140), rightKnee: x(-140), leftAnkle: x(-40), rightAnkle: x(-40) },
  'Slouching': { spine: x(-30), neck: x(-20), head: x(30), leftShoulder: {x: 100, y: 0, z: 20}, rightShoulder: {x: 100, y: 0, z: -20}, leftElbow: {x: 0, y: 0, z: 30}, rightElbow: {x: 0, y: 0, z: -30} },
  'Correct sitting posture': { spine: x(5), leftShoulder: {x: 95, y: 0, z: 15}, rightShoulder: {x: 95, y: 0, z: -15}, leftElbow: {x: 0, y: 0, z: 50}, rightElbow: {x: 0, y: 0, z: -50}, leftHip: x(90), rightHip: x(90), leftKnee: x(-90), rightKnee: x(-90) },
  'Incorrect sitting posture': { spine: x(-25), neck: x(-15), head: x(20), leftShoulder: {x: 105, y: 0, z: 20}, rightShoulder: {x: 105, y: 0, z: -20}, leftElbow: {x: 0, y: 0, z: 70}, rightElbow: {x: 0, y: 0, z: -70}, leftHip: x(80), rightHip: x(80), leftKnee: x(-80), rightKnee: x(-80) },
  'Phone-use posture': { spine: x(-15), neck: x(-35), head: x(10), leftShoulder: {x: 110, y: 0, z: 30}, rightShoulder: {x: 110, y: 0, z: -30}, leftElbow: {x: 0, y: 0, z: 110}, rightElbow: {x: 0, y: 0, z: -110} },
  'Laptop-use posture': { spine: x(-10), neck: x(-20), head: x(5), leftShoulder: {x: 110, y: 0, z: 20}, rightShoulder: {x: 110, y: 0, z: -20}, leftElbow: {x: 0, y: 0, z: 80}, rightElbow: {x: 0, y: 0, z: -80}, leftHip: x(90), rightHip: x(90), leftKnee: x(-90), rightKnee: x(-90) },
  'Bending forward': { spine: x(40), head: x(-20), leftShoulder: {x: 90, y: 0, z: 0}, rightShoulder: {x: 90, y: 0, z: 0}, leftHip: x(80), rightHip: x(80) },
  'Bending backward': { spine: x(-30), neck: x(-20), head: x(-10), leftShoulder: z(-70), rightShoulder: z(70), leftHip: x(20), rightHip: x(20) },
  'Leaning forward': { spine: x(20), leftShoulder: z(-70), rightShoulder: z(70), leftHip: x(-30), rightHip: x(-30) },
  'Leaning backward': { spine: x(-20), leftShoulder: z(-70), rightShoulder: z(70), leftHip: x(10), rightHip: x(10) },
  'Leaning left': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Leaning right': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Looking up': { neck: x(30), head: x(30), leftShoulder: z(-70), rightShoulder: z(70) },
  'Looking down': { neck: x(-30), head: x(-30), leftShoulder: z(-70), rightShoulder: z(70) },
  'Looking left': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Looking right': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Turning the body left': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Turning the body right': { leftShoulder: z(-70), rightShoulder: z(70) },
  'Raising left arm': { leftShoulder: z(90), rightShoulder: z(70), leftElbow: z(-10) },
  'Raising right arm': { leftShoulder: z(-70), rightShoulder: z(-90), rightElbow: z(10) },
  'Both arms raised': { leftShoulder: z(90), leftElbow: z(-10), rightShoulder: z(-90), rightElbow: z(10) },
  'Left arm movement': { leftShoulder: z(45), rightShoulder: z(70) },
  'Right arm movement': { leftShoulder: z(-70), rightShoulder: z(-45) },
  'Elbow bending': { leftShoulder: z(-70), rightShoulder: z(70), leftElbow: z(-90), rightElbow: z(90) },
  'Knee bending': { leftShoulder: z(-70), rightShoulder: z(70), leftKnee: x(-90), rightKnee: x(-90) },
  'Neck movement': { neck: x(20), head: x(-10), leftShoulder: z(-70), rightShoulder: z(70) },
};

export const FBX_ANIMATION_CATEGORIES: Record<string, { label: string, path: string }[]> = {
  'walking': [
    { label: 'Walking', path: '/human model animation/walking-optimized.glb' }
  ],
  'running': [
    { label: 'Running', path: '/human model animation/running-optimized.glb' }
  ],
  'siting': [
    { label: 'Sitting', path: '/human model animation/siting-optimized.glb' },
    { label: 'Sitting Idle', path: '/human model animation/sitingidle-optimized.glb' },
    { label: 'Typing', path: '/human model animation/typing-optimized.glb' },
    { label: 'Sitting Talking', path: '/human model animation/siting talkingglb-optimized.glb' },
    { label: 'Sit To Stand', path: '/human model animation/stand to sit-optimized.glb' }
  ],
  'phone useage': [
    { label: 'Phone Usage', path: '/human model animation/phone usage-optimized.glb' }
  ]
};

export interface SensorData {
  pitch: number;
  roll: number;
  gyro: number;
  yaw: number;
  score: number;
  leanScore: number;
  timeScore: number;
  stabScore: number;
  status: 'GOOD' | 'FAIR' | 'POOR';
  baselineDeviation: number;
  sessionTimeMinutes: number;
  postureCoins: number;
  streakDays: number;
  slouchTimeMinutes: number;
  muscleFatigue: number;
  breathBpm: number;
  bodyTemp: number;
  confidence: number;
  battery: number;
  bgmPlaying: boolean;
  vibrationActive: boolean;
  vibrationMode: string;
  evolutionLevel: number;
  activityName: string;
  cervicalAngle: number;
  thoracicAngle: number;
  lumbarAngle: number;
  totalTilt: number;
}

export interface TimelineSession {
  id: string;
  timeRange: string;
  title: string;
  score: number;
  alertText: string;
  alertType: 'good' | 'warning' | 'error';
  progressPercent: number;
}

export interface Exercise {
  id: string;
  title: string;
  duration: string;
  repsOrCycles: string;
  completedCount: number;
  image: string;
  description: string;
  steps: string[];
}

export interface WearGuide {
  id: string;
  title: string;
  recommended?: boolean;
  description: string;
  image: string;
  videoTitle: string;
  videoTips: string[];
}

export type HapticEvent = {
  id: string;
  sessionId: string;
  startedAtMs: number;
  endsAtMs: number;
  tier: 1 | 2 | 3;
  frequencyHz: 150;
  intensityPct: 40 | 70 | 100;
  pattern: "single" | "double" | "continuous";
  reason: "sustained-angle-deviation";
  primaryDeviationDeg: number;
  accumulatedPoorPostureMs: number;
};

export type MonitoringSession = {
  id: string;
  title: string;
  source: "manual" | "simulator" | "future-device";
  startedAtMs: number;
  endedAtMs: number | null;
  localTimeZone: string;
  status: "active" | "paused" | "completed";

  eligibleMonitoredMs: number;
  excludedMovementMs: number;
  lowConfidenceMs: number;
  missingDataMs: number;

  weightedScoreSum: number;
  weightedLeanSum: number;
  weightedTimeSum: number;
  weightedStabilitySum: number;
  weightedRecoverySum: number;

  minScore: number | null;
  maxScore: number | null;
  peakPitchDeviationDeg: number;
  peakRollDeviationDeg: number;
  longestPoorPostureMs: number;

  neutralMs: number;
  warningMs: number;
  badMs: number;
  criticalMs: number;

  hapticEvents: HapticEvent[];
};

export type LiveSensorFrame = {
  timestampMs: number;
  activity: 'sitting' | 'standing' | 'walking' | 'exercise' | 'transition' | 'unknown';
  pitchDeg: number;
  rollDeg: number;
  yawDeg: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  pressureHpa: number;
  altitudeM: number;
  wornState: 'worn' | 'not_worn' | 'uncertain';
  contactConfidencePct: number;
  sensorConfidencePct: number;
  charging: boolean;
  valid: boolean;
};

export type HybridMode = 'deterministic_only' | 'shadow' | 'fused_confirm';

export interface ModelContract {
  generator_version: string;
  protocol_version: string;
  generator_config_sha256: string;
  training_timestamp: string;
  compatibility_status: string;
  feature_list: string[];
  class_mapping: Record<string, string>;
  selected_thresholds: {
    eligibility_threshold: number;
    posture_confidence_threshold: number;
    posture_margin_threshold: number;
    display_smoothing_segments: number;
  };
  model_file_checksums: {
    "rizer_eligibility_model.cbm": string;
    "rizer_posture_model.cbm": string;
  };
  calibration_file_checksums: {
    "rizer_eligibility_calibrator.joblib": string;
    "rizer_posture_calibrator.joblib": string;
  };
  known_limitations: string;
}


