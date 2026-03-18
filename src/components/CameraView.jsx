/**
 * CameraView.jsx
 * Renders the webcam feed and the hand-tracking canvas overlay.
 * Manages camera start/stop and displays status indicators.
 */

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

const CameraView = forwardRef(({ onCameraReady, isCameraOn }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // Expose video and canvas refs to parent
  useImperativeHandle(ref, () => ({
    getVideo: () => videoRef.current,
    getCanvas: () => canvasRef.current,
  }));

  /**
   * Start the webcam stream.
   */
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          // Set canvas dimensions to match video
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          if (onCameraReady) {
            onCameraReady(videoRef.current, canvasRef.current);
          }
        };
      }
    } catch (err) {
      console.error('[CameraView] Failed to access camera:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : 'Failed to access camera. Make sure it is connected.'
      );
    }
  };

  /**
   * Stop the webcam stream.
   */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start/stop camera based on prop
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn]);

  return (
    <div className="camera-container glass-card neon-glow w-full h-full relative">
      {/* Status Badge */}
      <div
        className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <span className={`status-dot ${isCameraOn ? 'online' : 'offline'}`}></span>
        <span className="text-xs font-medium text-white/80">
          {isCameraOn ? 'Camera Active' : 'Camera Off'}
        </span>
      </div>

      {/* Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ display: isCameraOn ? 'block' : 'none' }}
      />

      {/* Canvas Overlay for hand landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ display: isCameraOn ? 'block' : 'none' }}
      />

      {/* Placeholder when camera is off */}
      {!isCameraOn && !cameraError && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-6xl animate-pulse">🎥</div>
          <div className="text-center">
            <p className="text-white/60 text-sm">Camera is off</p>
            <p className="text-white/40 text-xs mt-1">Click "Start Camera" to begin</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-5xl">⚠️</div>
          <p className="text-red-400 text-sm text-center max-w-xs">{cameraError}</p>
        </div>
      )}
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
