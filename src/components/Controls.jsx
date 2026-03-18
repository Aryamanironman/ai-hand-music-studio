/**
 * Controls.jsx
 * Bottom control bar with camera, recording, and playback controls.
 */

import audioRecorder from '../utils/recording';

const Controls = ({
  isCameraOn,
  isRecording,
  onToggleCamera,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  recordingCount,
  isAudioReady,
}) => {
  return (
    <div className="glass-card neon-glow p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Camera Controls */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-camera"
            className={isCameraOn ? 'btn-danger' : 'btn-primary'}
            onClick={onToggleCamera}
          >
            {isCameraOn ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16.5 2.25 12 6l-4.5-3.75M1 1l22 22M21 21H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"/>
                </svg>
                Stop Camera
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                Start Camera
              </>
            )}
          </button>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="status-dot recording"></span>
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">
                Recording
              </span>
            </div>
          )}

          {!isCameraOn && !isRecording && (
            <div className="text-white/30 text-xs text-center">
              Start camera & raise your hand to play music
            </div>
          )}
        </div>

        {/* Right: Recording Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              id="btn-start-recording"
              className="btn-primary"
              onClick={onStartRecording}
              disabled={!isAudioReady}
              title={!isAudioReady ? 'Start camera first' : 'Start recording'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="6" fill="currentColor"/>
              </svg>
              Record
            </button>
          ) : (
            <button
              id="btn-stop-recording"
              className="btn-danger"
              onClick={onStopRecording}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
              </svg>
              Stop
            </button>
          )}

          <button
            id="btn-play-recording"
            className="btn-secondary"
            onClick={onPlayRecording}
            disabled={recordingCount === 0}
            title={recordingCount === 0 ? 'No recordings yet' : 'Play latest recording'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
            </svg>
            Play
            {recordingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">
                {recordingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
