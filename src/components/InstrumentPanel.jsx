/**
 * InstrumentPanel.jsx
 * Displays instrument selection, active notes, and finger status.
 */

import { useMemo } from 'react';
import soundEngine from '../utils/soundEngine';
import { FINGER_NAMES, FINGER_COLORS, FINGER_NOTE_MAP } from '../utils/fingerDetection';

const InstrumentPanel = ({ activeInstrument, onInstrumentChange, activeNotes, fingerStates }) => {
  const instruments = useMemo(() => soundEngine.getInstruments(), []);

  return (
    <div className="flex flex-col gap-3 flex-shrink-0">
      {/* Instrument Selector */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
          Instrument
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {instruments.map((inst) => (
            <button
              key={inst.id}
              id={`instrument-${inst.id}`}
              className={`instrument-btn flex-1 flex flex-col items-center justify-center gap-1.5 py-2 px-1 ${
                activeInstrument === inst.id ? 'selected' : ''
              }`}
              onClick={() => onInstrumentChange(inst.id)}
            >
              <span className="text-xl leading-none">{inst.icon}</span>
              <span className="text-[10px] font-bold tracking-wide uppercase">{inst.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Notes Display */}
      <div className="glass-card p-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
          Active Notes
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {FINGER_NAMES.map((finger) => {
            const note = FINGER_NOTE_MAP[finger];
            const isActive = activeNotes.includes(note);
            return (
              <div
                key={finger}
                className={`note-pill !text-xs !px-3 !py-1 ${isActive ? 'active' : 'inactive'}`}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${FINGER_COLORS[finger]}, ${FINGER_COLORS[finger]}88)`,
                        boxShadow: `0 0 15px ${FINGER_COLORS[finger]}60`,
                      }
                    : {}
                }
              >
                {note}
              </div>
            );
          })}
        </div>

        {/* No notes indicator */}
        {activeNotes.length === 0 && (
          <p className="text-white/30 text-[10px] mt-2 text-center">
            Raise your fingers to play notes
          </p>
        )}
      </div>

      {/* Finger Status */}
      <div className="glass-card p-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
          Fingers
        </h3>
        <div className="space-y-1">
          {FINGER_NAMES.map((finger) => {
            const isActive = fingerStates[finger] || false;
            const color = FINGER_COLORS[finger];
            const note = FINGER_NOTE_MAP[finger];
            return (
              <div
                key={finger}
                className="flex items-center justify-between py-1 px-3 rounded-md transition-all duration-200"
                style={{
                  background: isActive ? `${color}15` : 'transparent',
                  borderLeft: `3px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                    style={{
                      background: isActive ? color : 'rgba(255,255,255,0.2)',
                      boxShadow: isActive ? `0 0 8px ${color}80` : 'none',
                    }}
                  />
                  <span
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}
                  >
                    {finger}
                  </span>
                </div>
                <span
                  className="text-[10px] font-mono font-semibold transition-colors duration-200"
                  style={{ color: isActive ? color : 'rgba(255,255,255,0.25)' }}
                >
                  {note}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstrumentPanel;
