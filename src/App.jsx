/**
 * App.jsx
 * Main application component for AI Hand Music Studio.
 * Orchestrates camera, hand tracking, sound engine, and UI.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import CameraView from './components/CameraView';
import HandTracker from './components/HandTracker';
import InstrumentPanel from './components/InstrumentPanel';
import WaveformVisualizer from './components/WaveformVisualizer';
import Controls from './components/Controls';
import RecordingsList from './components/RecordingsList';
import soundEngine from './utils/soundEngine';
import audioRecorder from './utils/recording';

function App() {
  // ---- State ----
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [activeInstrument, setActiveInstrument] = useState('piano');
  const [activeNotes, setActiveNotes] = useState([]);
  const [fingerStates, setFingerStates] = useState({});
  const [handDetected, setHandDetected] = useState(false);

  // ---- Refs ----
  const cameraRef = useRef(null);
  const [videoElement, setVideoElement] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);

  /**
   * Initialize audio engine on first user interaction (browser policy).
   */
  const initAudio = useCallback(async () => {
    if (!isAudioReady) {
      await soundEngine.init();
      setIsAudioReady(true);
    }
  }, [isAudioReady]);

  /**
   * Toggle camera on/off.
   */
  const handleToggleCamera = useCallback(async () => {
    await initAudio();

    if (isCameraOn) {
      // Stop camera
      setIsCameraOn(false);
      soundEngine.releaseAll();
      setActiveNotes([]);
      setFingerStates({});
      setHandDetected(false);
    } else {
      // Start camera
      setIsCameraOn(true);
    }
  }, [isCameraOn, initAudio]);

  /**
   * Camera ready callback: get video and canvas elements.
   */
  const handleCameraReady = useCallback((video, canvas) => {
    setVideoElement(video);
    setCanvasElement(canvas);
  }, []);

  /**
   * Handle hand tracking results.
   */
  const handleHandResults = useCallback(
    (results) => {
      setFingerStates(results.fingerStates || {});
      setHandDetected(!!results.landmarks);

      const notes = results.activeNotes || [];
      setActiveNotes(notes);

      // Play detected notes through sound engine
      if (results.isFist) {
        // Fist → stop all sounds
        soundEngine.releaseAll();
      } else {
        soundEngine.playNotes(notes);
      }
    },
    []
  );

  /**
   * Switch instrument.
   */
  const handleInstrumentChange = useCallback(
    async (instrumentId) => {
      await initAudio();
      soundEngine.setInstrument(instrumentId);
      setActiveInstrument(instrumentId);
    },
    [initAudio]
  );

  /**
   * Start recording.
   */
  const handleStartRecording = useCallback(async () => {
    await initAudio();
    audioRecorder.startRecording();
    setIsRecording(true);
  }, [initAudio]);

  /**
   * Stop recording.
   */
  const handleStopRecording = useCallback(() => {
    audioRecorder.stopRecording();
    setIsRecording(false);
    // Wait a tick for the recording to finalize
    setTimeout(() => {
      setRecordingCount(audioRecorder.getCount());
      setRecordings(audioRecorder.getRecordings());
    }, 200);
  }, []);

  /**
   * Play latest recording.
   */
  const handlePlayRecording = useCallback(() => {
    audioRecorder.playLatest();
  }, []);

  /**
   * Play a specific recording by ID.
   */
  const handlePlaySpecificRecording = useCallback((id) => {
    audioRecorder.playById(id);
  }, []);

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      soundEngine.dispose();
      audioRecorder.dispose();
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#0a0a1a]">
      {/* ===== HEADER ===== */}
      <header className="px-5 py-3 flex-shrink-0 flex items-center justify-between border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
               background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
            }}
          >
            🎵
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              AI Hand Music Studio
            </h1>
            <p className="text-[10px] text-white/40 font-medium tracking-wide uppercase">
              Transform gestures into music
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Hand detection indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card">
            <span className={`status-dot ${handDetected ? 'online' : 'offline'}`}></span>
            <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest hidden sm:block">
              {handDetected ? 'Hand Detected' : 'No Hand'}
            </span>
          </div>

          {/* Audio engine indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card">
            <span className={`status-dot ${isAudioReady ? 'online' : 'offline'}`}></span>
            <span className="text-[10px] font-medium text-white/60 uppercase tracking-widest hidden sm:block">
              {isAudioReady ? 'Audio Ready' : 'Audio Off'}
            </span>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-h-0 p-4 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          
          {/* LEFT: Camera + Waveform (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            {/* Camera View */}
            <div className="flex-1 min-h-0 relative animate-fade-in group">
              <CameraView
                ref={cameraRef}
                isCameraOn={isCameraOn}
                onCameraReady={handleCameraReady}
              />
              {/* HandTracker (headless component) */}
              <HandTracker
                videoElement={videoElement}
                canvasElement={canvasElement}
                isActive={isCameraOn && !!videoElement}
                onHandResults={handleHandResults}
              />
            </div>

            {/* Waveform Visualizer */}
            <div className="h-32 flex-shrink-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <WaveformVisualizer isActive={isAudioReady} height={128} />
            </div>
          </div>

          {/* RIGHT: Panels (1/4 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <InstrumentPanel
              activeInstrument={activeInstrument}
              onInstrumentChange={handleInstrumentChange}
              activeNotes={activeNotes}
              fingerStates={fingerStates}
            />
            
            <RecordingsList 
              recordings={recordings} 
              onPlay={handlePlaySpecificRecording} 
            />
          </div>
        </div>
      </main>

      {/* ===== BOTTOM CONTROLS ===== */}
      <footer className="px-4 pb-4 flex-shrink-0">
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Controls
            isCameraOn={isCameraOn}
            isRecording={isRecording}
            isAudioReady={isAudioReady}
            onToggleCamera={handleToggleCamera}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayRecording={handlePlayRecording}
            recordingCount={recordingCount}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;
