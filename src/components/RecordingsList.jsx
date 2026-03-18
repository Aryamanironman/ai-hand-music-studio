/**
 * RecordingsList.jsx
 * Displays a list of recorded music sessions and allows playback.
 */

const RecordingsList = ({ recordings, onPlay }) => {
  return (
    <div className="glass-card p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3 flex-shrink-0">
        My Recordings
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {recordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs py-4">
            <span>No recordings yet</span>
            <span className="mt-1">Press record to make some music!</span>
          </div>
        ) : (
          recordings.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/90">{rec.timestamp}</span>
                <span className="text-[10px] text-white/50 font-mono mt-0.5">
                  {(rec.duration / 1000).toFixed(1)}s
                </span>
              </div>
              <button
                className="btn-secondary !p-2 !rounded-lg opacity-80 hover:opacity-100"
                onClick={() => onPlay(rec.id)}
                title="Play recording"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecordingsList;
