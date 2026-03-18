/**
 * fingerDetection.js
 * Utility for detecting raised fingers from MediaPipe hand landmarks.
 * 
 * MediaPipe provides 21 landmarks per hand:
 *  0: WRIST
 *  1-4: THUMB (CMC, MCP, IP, TIP)
 *  5-8: INDEX (MCP, PIP, DIP, TIP)
 *  9-12: MIDDLE (MCP, PIP, DIP, TIP)
 *  13-16: RING (MCP, PIP, DIP, TIP)
 *  17-20: PINKY (MCP, PIP, DIP, TIP)
 */

// Landmark indices for fingertips and their corresponding PIP/IP joints
const FINGER_TIP_IDS = [4, 8, 12, 16, 20];
const FINGER_PIP_IDS = [3, 6, 10, 14, 18]; // IP for thumb, PIP for others
const FINGER_MCP_IDS = [2, 5, 9, 13, 17];

// Finger names
export const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

// Note mapping: each finger → a note
export const FINGER_NOTE_MAP = {
  Thumb: 'C4',
  Index: 'D4',
  Middle: 'E4',
  Ring: 'F4',
  Pinky: 'G4',
};

// Colors for each finger's visual feedback
export const FINGER_COLORS = {
  Thumb: '#f472b6',   // Pink
  Index: '#a78bfa',   // Purple
  Middle: '#60a5fa',  // Blue
  Ring: '#4ade80',    // Green
  Pinky: '#facc15',   // Yellow
};

/**
 * Detect which fingers are raised from hand landmarks.
 * @param {Array} landmarks - Array of 21 landmark objects with {x, y, z}
 * @returns {Object} result
 *   - raisedFingers: string[] of raised finger names
 *   - fingerStates: { [fingerName]: boolean }
 *   - isFist: boolean
 *   - isOpenHand: boolean
 *   - landmarks: original landmarks passed through
 */
export function detectFingers(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return {
      raisedFingers: [],
      fingerStates: {},
      isFist: true,
      isOpenHand: false,
      landmarks: null,
    };
  }

  const fingerStates = {};
  const raisedFingers = [];

  for (let i = 0; i < 5; i++) {
    const fingerName = FINGER_NAMES[i];
    const tipId = FINGER_TIP_IDS[i];
    const pipId = FINGER_PIP_IDS[i];
    const mcpId = FINGER_MCP_IDS[i];

    let isRaised = false;

    if (i === 0) {
      // Thumb: compare x-position (horizontal spread)
      // Check if thumb tip is further from palm center than the IP joint
      const thumbTip = landmarks[tipId];
      const thumbIp = landmarks[pipId];
      const thumbMcp = landmarks[mcpId];
      const wrist = landmarks[0];

      // Determine hand orientation (left vs right)
      const isRightHand = landmarks[17].x < landmarks[5].x;

      if (isRightHand) {
        isRaised = thumbTip.x < thumbIp.x;
      } else {
        isRaised = thumbTip.x > thumbIp.x;
      }

      // Additional check: thumb should be extended beyond MCP
      const thumbExtension = Math.abs(thumbTip.x - thumbMcp.x);
      if (thumbExtension < 0.03) {
        isRaised = false;
      }
    } else {
      // Other fingers: tip should be higher (lower y value) than PIP joint
      const tip = landmarks[tipId];
      const pip = landmarks[pipId];
      isRaised = tip.y < pip.y;
    }

    fingerStates[fingerName] = isRaised;
    if (isRaised) {
      raisedFingers.push(fingerName);
    }
  }

  const isFist = raisedFingers.length === 0;
  const isOpenHand = raisedFingers.length === 5;

  return {
    raisedFingers,
    fingerStates,
    isFist,
    isOpenHand,
    landmarks,
  };
}

/**
 * Get the notes that should be played based on raised fingers.
 * @param {string[]} raisedFingers - Array of finger names that are raised
 * @returns {string[]} Array of note strings (e.g., ['C4', 'E4'])
 */
export function getActiveNotes(raisedFingers) {
  return raisedFingers.map((finger) => FINGER_NOTE_MAP[finger]).filter(Boolean);
}

/**
 * Calculate distance between two landmarks (useful for volume control).
 * @param {Object} lm1 - First landmark {x, y, z}
 * @param {Object} lm2 - Second landmark {x, y, z}
 * @returns {number} Euclidean distance
 */
export function landmarkDistance(lm1, lm2) {
  const dx = lm1.x - lm2.x;
  const dy = lm1.y - lm2.y;
  const dz = (lm1.z || 0) - (lm2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Get hand center position (average of all landmarks).
 * @param {Array} landmarks - Array of 21 landmarks
 * @returns {{ x: number, y: number }}
 */
export function getHandCenter(landmarks) {
  if (!landmarks || landmarks.length === 0) return { x: 0.5, y: 0.5 };
  
  let sumX = 0, sumY = 0;
  for (const lm of landmarks) {
    sumX += lm.x;
    sumY += lm.y;
  }
  return {
    x: sumX / landmarks.length,
    y: sumY / landmarks.length,
  };
}

/**
 * Calculate finger spread (distance between thumb tip and pinky tip).
 * Useful for volume control.
 * @param {Array} landmarks
 * @returns {number} Normalized spread value (0-1)
 */
export function getFingerSpread(landmarks) {
  if (!landmarks || landmarks.length < 21) return 0;
  
  const thumbTip = landmarks[4];
  const pinkyTip = landmarks[20];
  const distance = landmarkDistance(thumbTip, pinkyTip);
  
  // Normalize: typical hand spread is ~0.1 to ~0.5 in normalized coords
  return Math.min(Math.max((distance - 0.05) / 0.4, 0), 1);
}
