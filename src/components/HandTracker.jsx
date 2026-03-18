/**
 * HandTracker.jsx
 * Core hand tracking logic using MediaPipe Hands.
 * Processes video frames, detects hand landmarks, draws overlays,
 * and calls back with finger detection results.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import {
  detectFingers,
  getActiveNotes,
  FINGER_NAMES,
  FINGER_COLORS,
  FINGER_NOTE_MAP,
} from '../utils/fingerDetection';

// Fingertip landmark indices for highlighting
const FINGERTIP_IDS = [4, 8, 12, 16, 20];

const HandTracker = ({ videoElement, canvasElement, isActive, onHandResults }) => {
  const handsRef = useRef(null);
  const animFrameRef = useRef(null);
  const isProcessingRef = useRef(false);

  /**
   * Process MediaPipe results: draw landmarks, detect fingers, callback.
   */
  const onResults = useCallback(
    (results) => {
      if (!canvasElement) return;

      const ctx = canvasElement.getContext('2d');
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          // Draw hand connections (skeleton)
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: 'rgba(139, 92, 246, 0.4)',
            lineWidth: 2,
          });

          // Draw all landmarks (small dots)
          drawLandmarks(ctx, landmarks, {
            color: 'rgba(255, 255, 255, 0.6)',
            lineWidth: 1,
            radius: 2,
          });

          // Detect finger states
          const detection = detectFingers(landmarks);
          const activeNotes = getActiveNotes(detection.raisedFingers);

          // Highlight fingertips with glow effect
          for (let i = 0; i < FINGERTIP_IDS.length; i++) {
            const tipIdx = FINGERTIP_IDS[i];
            const fingerName = FINGER_NAMES[i];
            const isRaised = detection.fingerStates[fingerName];
            const lm = landmarks[tipIdx];
            const x = lm.x * canvasElement.width;
            const y = lm.y * canvasElement.height;
            const color = FINGER_COLORS[fingerName];

            if (isRaised) {
              // Outer glow
              ctx.beginPath();
              ctx.arc(x, y, 18, 0, 2 * Math.PI);
              ctx.fillStyle = color + '30'; // 30 = ~19% opacity
              ctx.fill();

              // Inner glow
              ctx.beginPath();
              ctx.arc(x, y, 12, 0, 2 * Math.PI);
              ctx.fillStyle = color + '60';
              ctx.fill();

              // Core dot
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();

              // Note label
              const note = FINGER_NOTE_MAP[fingerName];
              ctx.font = 'bold 11px "JetBrains Mono", monospace';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'center';
              ctx.fillText(note, x, y - 22);
            } else {
              // Dim dot for inactive fingers
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fill();
            }
          }

          // Callback with detection results
          if (onHandResults) {
            onHandResults({
              ...detection,
              activeNotes,
            });
          }
        }
      } else {
        // No hand detected
        if (onHandResults) {
          onHandResults({
            raisedFingers: [],
            fingerStates: {},
            isFist: true,
            isOpenHand: false,
            activeNotes: [],
            landmarks: null,
          });
        }
      }

      isProcessingRef.current = false;
    },
    [canvasElement, onHandResults]
  );

  /**
   * Initialize MediaPipe Hands.
   */
  useEffect(() => {
    if (!isActive) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    console.log('[HandTracker] MediaPipe Hands initialized');

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, onResults]);

  /**
   * Frame processing loop: send video frames to MediaPipe.
   */
  useEffect(() => {
    if (!isActive || !videoElement || !handsRef.current) return;

    const processFrame = async () => {
      if (
        handsRef.current &&
        videoElement &&
        videoElement.readyState >= 2 &&
        !isProcessingRef.current
      ) {
        isProcessingRef.current = true;
        try {
          await handsRef.current.send({ image: videoElement });
        } catch (e) {
          isProcessingRef.current = false;
        }
      }
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Short delay to let MediaPipe fully initialize
    const timer = setTimeout(() => {
      processFrame();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, videoElement]);

  // This component doesn't render any DOM; it's purely logic
  return null;
};

export default HandTracker;
