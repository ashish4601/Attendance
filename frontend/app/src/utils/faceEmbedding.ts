// Utility to derive a deterministic 128-d embedding from face landmarks
// Works with Expo's MLKit face detector output (expo-face-detector)

type Point = { x: number; y: number };

type DetectedFace = {
  bounds?: { origin: { x: number; y: number }; size: { width: number; height: number } };
  rollAngle?: number;
  yawAngle?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  smilingProbability?: number;
  // Landmarks: keys depend on MLKit; we'll access safely
  landmarks?: Record<string, Point | undefined> & {
    leftEye?: Point;
    rightEye?: Point;
    noseBase?: Point;
    leftCheek?: Point;
    rightCheek?: Point;
    leftMouth?: Point;
    rightMouth?: Point;
    bottomMouth?: Point;
    leftEar?: Point;
    rightEar?: Point;
  };
};

function safePoint(p?: Point): Point | null {
  if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return null;
  return p;
}

function normalizePoint(p: Point, origin: Point, size: { width: number; height: number }): [number, number] {
  const cx = origin.x + size.width / 2;
  const cy = origin.y + size.height / 2;
  // Normalize to face box, then center at 0 and scale to [-1, 1]
  const nx = (p.x - cx) / (size.width / 2);
  const ny = (p.y - cy) / (size.height / 2);
  return [nx, ny];
}

function pairwiseDistances(points: [number, number][]): number[] {
  const dists: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      dists.push(Math.hypot(dx, dy));
    }
  }
  return dists;
}

export function embeddingFromFace(face: DetectedFace): number[] | null {
  const bounds = face.bounds;
  if (!bounds) return null;
  const origin = bounds.origin;
  const size = bounds.size;

  const lm = face.landmarks || {};
  const keys = [
    'leftEye',
    'rightEye',
    'noseBase',
    'leftCheek',
    'rightCheek',
    'leftMouth',
    'rightMouth',
    'bottomMouth',
    'leftEar',
    'rightEar',
  ] as const;

  const points: [number, number][] = [];
  for (const k of keys) {
    const p = safePoint(lm[k]);
    if (!p) return null; // Require all key landmarks
    points.push(normalizePoint(p, origin, size));
  }

  // Base features: normalized landmark coordinates
  const features: number[] = points.flat();

  // Add angles/features
  const roll = typeof face.rollAngle === 'number' ? face.rollAngle : 0;
  const yaw = typeof face.yawAngle === 'number' ? face.yawAngle : 0;
  const smile = typeof face.smilingProbability === 'number' ? face.smilingProbability : 0;
  features.push(roll / 90); // normalize approx
  features.push(yaw / 90);
  features.push(smile);

  // Add pairwise distances for geometric invariance
  const dists = pairwiseDistances(points);
  features.push(...dists);

  // Ensure fixed length 128: pad or truncate deterministically
  const targetLen = 128;
  if (features.length >= targetLen) {
    return features.slice(0, targetLen);
  }
  // Pad with repeated hashed values of existing features to reach 128
  let i = 0;
  while (features.length < targetLen) {
    const v = features[i % Math.max(1, features.length)];
    // simple hash-like transform
    const hv = Number(Math.tanh(v * 3.14159).toFixed(6));
    features.push(hv);
    i++;
  }
  return features;
}

export type BlinkState = {
  lastOpen?: boolean;
  sequence: ('open' | 'closed')[];
  lastChangeTs?: number;
};

export function updateBlinkState(state: BlinkState, leftProb?: number, rightProb?: number): BlinkState {
  const openThreshold = 0.7;
  const closeThreshold = 0.3;
  const bothOpen = (leftProb || 0) > openThreshold && (rightProb || 0) > openThreshold;
  const bothClosed = (leftProb || 0) < closeThreshold && (rightProb || 0) < closeThreshold;

  const now = Date.now();
  let current: 'open' | 'closed' | null = null;
  if (bothOpen) current = 'open';
  else if (bothClosed) current = 'closed';

  if (current) {
    const last = state.sequence[state.sequence.length - 1];
    if (last !== current) {
      state.sequence.push(current);
      state.lastChangeTs = now;
      // Limit sequence length
      if (state.sequence.length > 5) state.sequence.shift();
    }
  }
  return state;
}

export function isBlinkVerified(state: BlinkState): boolean {
  // Verify pattern open -> closed -> open within 3 seconds window
  const seq = state.sequence;
  if (seq.length < 3) return false;
  const last3 = seq.slice(-3);
  const pattern = last3[0] === 'open' && last3[1] === 'closed' && last3[2] === 'open';
  const withinWindow = state.lastChangeTs ? (Date.now() - state.lastChangeTs < 3000) : false;
  return pattern && withinWindow;
}
